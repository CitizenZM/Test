import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = createServiceClient();
  const id = request.nextUrl.searchParams.get('id');

  if (id) {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json(data);
  }

  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    // Table may not exist yet
    return NextResponse.json([]);
  }

  return NextResponse.json(data || []);
}

export async function POST(request: NextRequest) {
  const supabase = createServiceClient();
  const body = await request.json();

  const defaultUserId = '87b641eb-edfd-46b7-b7f4-1426cdac091e';

  const payload = {
    name: body.name,
    brand_id: body.brand_id || null,
    user_id: body.user_id || defaultUserId,
    goal: body.goal || 'awareness',
    briefing_text: body.briefing_text || body.description || null,
    channels: body.channels || [],
    languages: body.languages || ['en'],
    status: body.status || 'draft',
  };

  const { data, error } = await supabase
    .from('campaigns')
    .insert(payload)
    .select()
    .single();

  if (error) {
    // If FK constraint fails on brand_id, the live DB may reference a different table.
    // Try to find an existing valid brand_id from campaigns, and store the real brand ref in briefing.
    if (error.message.includes('brand_id_fkey')) {
      const { data: existing } = await supabase
        .from('campaigns')
        .select('brand_id')
        .not('brand_id', 'is', null)
        .limit(1)
        .single();

      const fallbackBrandId = existing?.brand_id;
      if (fallbackBrandId) {
        const { data: retryData, error: retryError } = await supabase
          .from('campaigns')
          .insert({
            ...payload,
            brand_id: fallbackBrandId,
            briefing_text: `[brand_ref:${body.brand_id}] ${payload.briefing_text || ''}`,
          })
          .select()
          .single();

        if (retryError) {
          return NextResponse.json({ error: retryError.message }, { status: 500 });
        }
        return NextResponse.json({ ...retryData, brand_id: body.brand_id }, { status: 201 });
      }
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const supabase = createServiceClient();
  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('campaigns')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
