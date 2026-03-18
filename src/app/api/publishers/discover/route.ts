import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { discoverPublishers } from '@/lib/ai/research-agent';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, category, product } = body;

    if (!keyword) {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
    }

    const publishers = await discoverPublishers({ keyword, category, product });

    if (publishers.length === 0) {
      return NextResponse.json([]);
    }

    // Map AI results to existing Supabase schema
    const rows = publishers.map((p) => ({
      publisher_name: p.name,
      website: p.website,
      domain: p.website ? new URL(p.website.startsWith('http') ? p.website : `https://${p.website}`).hostname : null,
      category: p.category,
      affiliate_type: p.content_type,
      estimated_monthly_visits: p.traffic_estimate,
      affiliate_network: p.affiliate_friendly ? 'Affiliate Friendly' : null,
      description: p.audience,
      summary_note: p.notes,
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
