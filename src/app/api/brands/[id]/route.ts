import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

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
      .select('id')
      .eq('brand_id', id)
      .single();

    if (existingProfile) {
      await supabase
        .from('brand_profiles')
        .update({ competitors: body.competitors })
        .eq('brand_id', id);
    } else {
      await supabase
        .from('brand_profiles')
        .insert({ brand_id: id, competitors: body.competitors });
    }
  }

  const { data } = await supabase
    .from('brands')
    .select('*, brand_profiles(*)')
    .eq('id', id)
    .single();

  return NextResponse.json(data);
}
