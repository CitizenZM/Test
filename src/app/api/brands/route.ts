import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unpackBrand(brand: any) {
  if (!brand) return brand;
  if (Array.isArray(brand.brand_profiles)) {
    brand.brand_profiles = brand.brand_profiles.map(unpackProfile);
  } else if (brand.brand_profiles) {
    brand.brand_profiles = unpackProfile(brand.brand_profiles);
  }
  return brand;
}

export async function GET() {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('brands')
    .select('*, brand_profiles(*)')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const brands = (data || []).map(unpackBrand);
  return NextResponse.json(brands, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  });
}

export async function POST(request: NextRequest) {
  const supabase = createServiceClient();
  const body = await request.json();

  const { data: brand, error: brandError } = await supabase
    .from('brands')
    .insert({
      brand_name: body.brand_name,
      category: body.category,
      primary_domain: body.primary_domain,
      workspace_id: body.workspace_id || '00000000-0000-4000-a000-000000000001',
      status: 'active',
    })
    .select()
    .single();

  if (brandError || !brand) {
    return NextResponse.json(
      { error: brandError?.message || 'Failed to create brand' },
      { status: 500 }
    );
  }

  if (body.competitors && body.competitors.length > 0) {
    const packed = {
      __competitors: body.competitors,
      __recruitment_strategy: null,
      __strategy_generated_at: null,
    };
    await supabase.from('brand_profiles').insert({
      brand_id: brand.id,
      value_props_json: packed,
    });
  }

  const { data } = await supabase
    .from('brands')
    .select('*, brand_profiles(*)')
    .eq('id', brand.id)
    .single();

  return NextResponse.json(unpackBrand(data), { status: 201 });
}
