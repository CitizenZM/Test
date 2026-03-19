import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

// Store competitors and strategy in value_props_json as a JSON wrapper
// to avoid needing a DB migration (columns competitors/recruitment_strategy may not exist yet)
function packProfileExtras(
  competitors?: unknown,
  strategy?: unknown,
  strategyDate?: string | null
) {
  return {
    __competitors: competitors || [],
    __recruitment_strategy: strategy || null,
    __strategy_generated_at: strategyDate || null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unpackProfile(profile: any) {
  if (!profile) return profile;
  const vp = profile.value_props_json;
  if (vp && typeof vp === 'object' && '__competitors' in vp) {
    profile.competitors = vp.__competitors || [];
    profile.recruitment_strategy = vp.__recruitment_strategy || null;
    profile.strategy_generated_at = vp.__strategy_generated_at || null;
  }
  return profile;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('brands')
    .select('*, brand_profiles(*)')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
  }

  // Unpack extras from value_props_json
  if (Array.isArray(data.brand_profiles)) {
    data.brand_profiles = data.brand_profiles.map(unpackProfile);
  } else if (data.brand_profiles) {
    data.brand_profiles = unpackProfile(data.brand_profiles);
  }

  return NextResponse.json(data);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServiceClient();
  const body = await request.json();

  const { error: brandError } = await supabase
    .from('brands')
    .update({
      brand_name: body.brand_name,
      category: body.category,
      primary_domain: body.primary_domain,
    })
    .eq('id', id);

  if (brandError) {
    return NextResponse.json({ error: brandError.message }, { status: 500 });
  }

  if (body.competitors !== undefined) {
    const { data: existingProfile } = await supabase
      .from('brand_profiles')
      .select('id, value_props_json')
      .eq('brand_id', id)
      .single();

    // Preserve existing strategy data if any
    const existing = existingProfile?.value_props_json;
    const existingStrategy =
      existing && typeof existing === 'object' && '__recruitment_strategy' in existing
        ? existing.__recruitment_strategy
        : null;
    const existingDate =
      existing && typeof existing === 'object' && '__strategy_generated_at' in existing
        ? existing.__strategy_generated_at
        : null;

    const packed = packProfileExtras(body.competitors, existingStrategy, existingDate as string | null);

    if (existingProfile) {
      await supabase
        .from('brand_profiles')
        .update({ value_props_json: packed })
        .eq('brand_id', id);
    } else {
      await supabase
        .from('brand_profiles')
        .insert({ brand_id: id, value_props_json: packed });
    }
  }

  // Fetch updated brand
  const { data } = await supabase
    .from('brands')
    .select('*, brand_profiles(*)')
    .eq('id', id)
    .single();

  if (data) {
    if (Array.isArray(data.brand_profiles)) {
      data.brand_profiles = data.brand_profiles.map(unpackProfile);
    } else if (data.brand_profiles) {
      data.brand_profiles = unpackProfile(data.brand_profiles);
    }
  }

  return NextResponse.json(data);
}
