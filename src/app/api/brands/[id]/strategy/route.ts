import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { generateRecruitmentStrategy } from '@/lib/ai/strategy-agent';

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

  const competitors = profile?.competitors || [];

  const strategy = await generateRecruitmentStrategy({
    brand_name: brand.brand_name,
    brand_url: brand.primary_domain || '',
    category: brand.category || '',
    competitors,
  });

  if (profile?.id) {
    await supabase
      .from('brand_profiles')
      .update({
        recruitment_strategy: strategy,
        strategy_generated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);
  } else {
    await supabase.from('brand_profiles').insert({
      brand_id: id,
      recruitment_strategy: strategy,
      strategy_generated_at: new Date().toISOString(),
      competitors,
    });
  }

  return NextResponse.json({ strategy });
}
