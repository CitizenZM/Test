import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { discoverPublishers } from '@/lib/ai/research-agent';
import { formatAIError } from '@/lib/ai/error-messages';
import { rateLimit } from '@/lib/rate-limit';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const { allowed } = rateLimit('discover', 10, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded. Please wait a minute before trying again.' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { keyword, category, product, brand, strategy } = body;

    if (!keyword || typeof keyword !== 'string') {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
    }

    if (keyword.length > 200) {
      return NextResponse.json({ error: 'Keyword too long (max 200 characters)' }, { status: 400 });
    }

    const publishers = await discoverPublishers({ keyword, category, product, brand, strategy });

    if (publishers.length === 0) {
      return NextResponse.json([]);
    }

    const rows = publishers.map((p) => {
      let domain: string | null = null;
      try {
        if (p.website) domain = new URL(p.website.startsWith('http') ? p.website : `https://${p.website}`).hostname;
      } catch { /* invalid URL */ }
      return {
      publisher_name: p.publisher_name,
      website: p.website,
      domain,
      category: p.category,
      affiliate_type: p.affiliate_type,
      estimated_monthly_visits: p.estimated_monthly_visits,
      affiliate_network: p.affiliate_friendly ? 'Affiliate Friendly' : null,
      description: p.description,
      summary_note: p.summary_note,
      enrichment_status: 'ai_discovered',
    };
    });

    try {
      const supabase = createServiceClient();
      const { data, error } = await supabase
        .from('publishers')
        .insert(rows)
        .select();

      if (!error && data) {
        return NextResponse.json(data);
      }
    } catch {
      // DB insert failed — return raw results
    }

    // Return AI results directly without DB persistence
    return NextResponse.json(rows.map((r, i) => ({ id: Date.now() + i, ...r })));
  } catch (err) {
    return NextResponse.json({ error: formatAIError(err) }, { status: 500 });
  }
}
