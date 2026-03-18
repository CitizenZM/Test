import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { discoverPublishers } from '@/lib/ai/research-agent';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, category, product, brand } = body;

    if (!keyword) {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
    }

    const publishers = await discoverPublishers({ keyword, category, product, brand });

    if (publishers.length === 0) {
      return NextResponse.json([]);
    }

    const rows = publishers.map((p) => ({
      publisher_name: p.publisher_name,
      website: p.website,
      domain: p.website ? new URL(p.website.startsWith('http') ? p.website : `https://${p.website}`).hostname : null,
      category: p.category,
      affiliate_type: p.affiliate_type,
      estimated_monthly_visits: p.estimated_monthly_visits,
      affiliate_network: p.affiliate_friendly ? 'Affiliate Friendly' : null,
      description: p.description,
      summary_note: p.summary_note,
      enrichment_status: 'ai_discovered',
    }));

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('publishers')
      .insert(rows)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Discovery failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
