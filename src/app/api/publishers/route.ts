import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = createServiceClient();
  const searchParams = request.nextUrl.searchParams;

  const category = searchParams.get('category');
  const tier = searchParams.get('tier');
  const network = searchParams.get('network');
  const hasEmail = searchParams.get('has_email');
  const search = searchParams.get('search');
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  let query = supabase
    .from('publishers')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }
  if (tier) {
    query = query.eq('tier_priority', tier);
  }
  if (network) {
    query = query.eq('affiliate_network', network);
  }
  if (hasEmail === 'true') {
    query = query.not('contact_email', 'is', null);
  } else if (hasEmail === 'false') {
    query = query.is('contact_email', null);
  }
  if (search) {
    query = query.or(`publisher_name.ilike.%${search}%,domain.ilike.%${search}%,category.ilike.%${search}%`);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ publishers: [], total: 0, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    publishers: data || [],
    total: count || 0,
  });
}

export async function POST(request: NextRequest) {
  const supabase = createServiceClient();
  const body = await request.json();

  const { data, error } = await supabase.from('publishers').insert(body).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
