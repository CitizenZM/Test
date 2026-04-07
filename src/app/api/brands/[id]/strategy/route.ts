import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { generateRecruitmentStrategy } from '@/lib/ai/strategy-agent';
import { formatAIError } from '@/lib/ai/error-messages';

export const maxDuration = 60;

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: brand, error } = await supabase
    .from('brands')
    .select('*, brand_profiles(*)')
    .eq('id', id)
    .single();

  if (error || !brand) {
    return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
  }

  const profile = Array.isArray(brand.brand_profiles)
    ? brand.brand_profiles[0]
    : brand.brand_profiles;

  // Extract competitors from value_props_json pack
  const vp = profile?.value_props_json;
  const competitors =
    vp && typeof vp === 'object' && '__competitors' in vp
      ? (vp as Record<string, unknown>).__competitors
      : profile?.competitors || [];

  let strategy;
  try {
    strategy = await generateRecruitmentStrategy({
      brand_name: brand.brand_name,
      brand_url: brand.primary_domain || '',
      category: brand.category || '',
      competitors: Array.isArray(competitors) ? competitors : [],
    });
  } catch (err) {
    return NextResponse.json({ error: formatAIError(err) }, { status: 500 });
  }

  const now = new Date().toISOString();

  // Store strategy in value_props_json (works without migration)
  const packed = {
    __competitors: Array.isArray(competitors) ? competitors : [],
    __recruitment_strategy: strategy,
    __strategy_generated_at: now,
  };

  if (profile?.id) {
    await supabase
      .from('brand_profiles')
      .update({ value_props_json: packed })
      .eq('id', profile.id);
  } else {
    await supabase.from('brand_profiles').insert({
      brand_id: id,
      value_props_json: packed,
    });
  }

  return NextResponse.json({ strategy });
}
