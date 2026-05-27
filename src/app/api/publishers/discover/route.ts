import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { discoverPublishers } from '@/lib/ai/research-agent';
import { formatAIError } from '@/lib/ai/error-messages';
import { rateLimit } from '@/lib/rate-limit';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const { allowed } = rateLimit('discover', 30, 60_000);
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

    const supabase = createServiceClient();

    const { data: existingData } = await supabase
      .from('publishers')
      .select('domain, publisher_name')
      .limit(10000);
    const existingDomains = new Set<string>();
    const existingNames = new Set<string>();
    for (const r of existingData || []) {
      if ((r as { domain?: string }).domain) existingDomains.add((r as { domain: string }).domain.toLowerCase());
      if ((r as { publisher_name?: string }).publisher_name) existingNames.add((r as { publisher_name: string }).publisher_name.toLowerCase());
    }

    const publishers = await discoverPublishers({
      keyword, category, product, brand, strategy,
      exclude_domains: Array.from(existingDomains).slice(0, 100),
    });

    if (publishers.length === 0) {
      return NextResponse.json([]);
    }

    const saved = [];
    for (const p of publishers) {
      let domain: string | null = null;
      try {
        if (p.website) domain = new URL(p.website.startsWith('http') ? p.website : `https://${p.website}`).hostname;
      } catch { /* invalid URL */ }

      const nameLower = p.publisher_name?.toLowerCase() || '';
      if (domain && existingDomains.has(domain.toLowerCase())) continue;
      if (nameLower && existingNames.has(nameLower)) continue;

      const row = {
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

      const { data, error } = await supabase
        .from('publishers')
        .insert(row)
        .select()
        .single();

      if (!error && data) {
        saved.push(data);
        if (domain) existingDomains.add(domain.toLowerCase());
        if (nameLower) existingNames.add(nameLower);
      }
    }

    return NextResponse.json(saved);
  } catch (err) {
    return NextResponse.json({ error: formatAIError(err) }, { status: 500 });
  }
}
