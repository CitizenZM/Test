import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { discoverPublishers } from '@/lib/ai/research-agent';
import { formatAIError } from '@/lib/ai/error-messages';
import type { RecruitmentStrategy } from '@/types';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
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
    let totalSaved = 0;
    const errors: string[] = [];

    // Build 20 search tasks across all keywords × categories for ~200 publishers
    const tasks: Array<{ keyword: string; category: string }> = [];

    // Pass 1: each keyword with rotating categories
    for (let i = 0; i < keywords.length && tasks.length < 20; i++) {
      const cat = categories.length > 0 ? categories[i % categories.length] : '';
      tasks.push({ keyword: keywords[i], category: cat });
    }

    // Pass 2: fill remaining slots with keyword variations
    const variations = ['affiliate partner', 'review site', 'deal publisher', 'coupon site', 'content creator'];
    while (tasks.length < 20) {
      const idx = tasks.length - keywords.length;
      const kw = keywords[idx % keywords.length];
      const variation = variations[idx % variations.length];
      const cat = categories.length > 0 ? categories[(tasks.length) % categories.length] : '';
      tasks.push({ keyword: `${kw} ${variation}`, category: cat });
    }

    for (const task of tasks) {
      try {
        const publishers = await discoverPublishers({
          keyword: task.keyword,
          category: task.category,
          brand,
          strategy,
        });

        if (publishers.length === 0) continue;

        const rows = publishers.map((p) => ({
          publisher_name: p.publisher_name,
          website: p.website,
          domain: p.website
            ? (() => {
                try {
                  return new URL(
                    p.website.startsWith('http') ? p.website : `https://${p.website}`
                  ).hostname;
                } catch {
                  return p.website;
                }
              })()
            : null,
          category: p.category,
          affiliate_type: p.affiliate_type,
          estimated_monthly_visits: p.estimated_monthly_visits,
          affiliate_network: p.affiliate_friendly ? 'Affiliate Friendly' : null,
          description: p.description,
          summary_note: p.summary_note,
          enrichment_status: 'ai_discovered',
        }));

        const { data, error } = await supabase
          .from('publishers')
          .insert(rows)
          .select('id');

        if (!error && data) {
          totalSaved += data.length;
        } else if (error) {
          errors.push(error.message);
        }
      } catch (err) {
        errors.push(err instanceof Error ? err.message : 'Unknown error');
      }
    }

    return NextResponse.json({
      total_saved: totalSaved,
      tasks_run: tasks.length,
      errors: errors.slice(0, 5),
    });
  } catch (err) {
    return NextResponse.json(
      { error: formatAIError(err) },
      { status: 500 }
    );
  }
}
