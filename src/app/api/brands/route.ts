import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('brands')
    .select('*, brand_profiles(*)')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json([]);
  }

  return NextResponse.json(data || []);
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
      workspace_id: body.workspace_id || '00000000-0000-0000-0000-000000000000',
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
    await supabase.from('brand_profiles').insert({
      brand_id: brand.id,
      competitors: body.competitors,
    });
  }

  const { data } = await supabase
    .from('brands')
    .select('*, brand_profiles(*)')
    .eq('id', brand.id)
    .single();

  return NextResponse.json(data, { status: 201 });
}
