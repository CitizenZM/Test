import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { discoverPublishers } from '@/lib/ai/research-agent';
import { formatAIError } from '@/lib/ai/error-messages';

export const maxDuration = 60;

function withTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T | null> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, category, product, brand, strategy } = body;

    if (!keyword) {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
    }

    const publishers = await discoverPublishers({ keyword, category, product, brand, strategy });

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

    // Try to persist to Supabase with a 5s timeout
    try {
      const supabase = createServiceClient();
      const result = await withTimeout(
        supabase.from('publishers').insert(rows).select(),
        5000
      );

      if (result && !('error' in result && result.error)) {
        const data = (result as { data: unknown }).data;
        if (data) return NextResponse.json(data);
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
