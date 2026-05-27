import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { discoverPublishers } from '@/lib/ai/research-agent';
import { formatAIError } from '@/lib/ai/error-messages';
import { rateLimit } from '@/lib/rate-limit';
import type { RecruitmentStrategy } from '@/types';

export const maxDuration = 60;

async function getExistingPublishers(supabase: ReturnType<typeof createServiceClient>): Promise<{ domains: Set<string>; names: Set<string> }> {
  const { data } = await supabase
    .from('publishers')
    .select('domain, publisher_name')
    .limit(10000);
  const domains = new Set<string>();
  const names = new Set<string>();
  for (const r of data || []) {
    if (r.domain) domains.add(r.domain.toLowerCase());
    if (r.publisher_name) names.add(r.publisher_name.toLowerCase());
  }
  return { domains, names };
}

function extractDomain(website: string): string | null {
  try {
    return new URL(website.startsWith('http') ? website : `https://${website}`).hostname;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const { allowed } = rateLimit('bulk-discover', 10, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded. Please wait a minute.' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const {
      keywords,
      categories,
      brand,
      strategy,
    }: {
      keywords: string[];
      categories: string[];
      brand: string;
      strategy?: RecruitmentStrategy;
    } = body;

    if (!keywords || !keywords.length) {
      return NextResponse.json({ error: 'Keywords required' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const existing = await getExistingPublishers(supabase);
    const existingDomains = existing.domains;
    const existingNames = existing.names;
    let totalSaved = 0;
    let totalDuplicatesSkipped = 0;
    const errors: string[] = [];

    const variations = [
      '', 'affiliate partner', 'review site', 'content creator', 'comparison website',
    ];

    const tasks: Array<{ keyword: string; category: string }> = [];
    for (const kw of keywords) {
      for (const variation of variations) {
        const fullKw = variation ? `${kw} ${variation}` : kw;
        const cat = categories.length > 0 ? categories[tasks.length % categories.length] : '';
        tasks.push({ keyword: fullKw, category: cat });
      }
    }

    const BATCH_SIZE = 5;
    const batches: Array<Array<{ keyword: string; category: string }>> = [];
    for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
      batches.push(tasks.slice(i, i + BATCH_SIZE));
    }

    const startTime = Date.now();
    const TIME_LIMIT = 40_000;

    for (const batch of batches) {
      if (Date.now() - startTime > TIME_LIMIT) break;

      const excludeDomains = Array.from(existingDomains).slice(0, 100);

      const results = await Promise.allSettled(
        batch.map((task) =>
          discoverPublishers({
            keyword: task.keyword,
            category: task.category,
            brand,
            strategy,
            exclude_domains: excludeDomains,
          })
        )
      );

      for (const result of results) {
        if (result.status !== 'fulfilled' || !result.value.length) {
          if (result.status === 'rejected') {
            errors.push(result.reason?.message || 'Unknown error');
          }
          continue;
        }

        const newRows = [];
        for (const p of result.value) {
          const domain = extractDomain(p.website);
          if (!domain) continue;
          const domainLower = domain.toLowerCase();
          const nameLower = p.publisher_name?.toLowerCase() || '';
          if (existingDomains.has(domainLower) || existingNames.has(nameLower)) {
            totalDuplicatesSkipped++;
            continue;
          }
          existingDomains.add(domainLower);
          existingNames.add(nameLower);
          newRows.push({
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
          });
        }

        if (newRows.length > 0) {
          for (let i = 0; i < newRows.length; i += 5) {
            const batch = newRows.slice(i, i + 5);
            try {
              const { data, error } = await supabase
                .from('publishers')
                .insert(batch)
                .select('id');
              if (!error && data) {
                totalSaved += data.length;
              } else if (error?.message?.includes('unique constraint')) {
                for (const row of batch) {
                  const { error: singleErr } = await supabase
                    .from('publishers')
                    .insert(row)
                    .select('id')
                    .single();
                  if (!singleErr) totalSaved++;
                }
              }
            } catch {
              // skip failed batch
            }
          }
        }
      }
    }

    return NextResponse.json({
      total_saved: totalSaved,
      duplicates_skipped: totalDuplicatesSkipped,
      tasks_attempted: Math.min(tasks.length, batches.length * BATCH_SIZE),
      total_existing: existingDomains.size,
      errors: errors.slice(0, 5),
    });
  } catch (err) {
    return NextResponse.json(
      { error: formatAIError(err) },
      { status: 500 }
    );
  }
}
