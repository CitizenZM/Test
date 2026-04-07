import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { analyzePublisher } from '@/lib/ai/scoring';

export const maxDuration = 60;

function withTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T | null> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { website, name } = body;

    if (!website || !name) {
      return NextResponse.json({ error: 'Website and name are required' }, { status: 400 });
    }

    const scores = await analyzePublisher(name, website);

    // Try to persist to Supabase with a 5s timeout
    try {
      const supabase = createServiceClient();
      await withTimeout(
        supabase
          .from('publishers')
          .update({
            modeled_roas: scores.publisher_score / 20,
            domain_authority: scores.traffic_score,
            summary_note: scores.analysis,
            enrichment_status: 'ai_analyzed',
          })
          .eq('id', id),
        5000
      );
    } catch {
      // DB update failed — still return scores
    }

    return NextResponse.json(scores);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Analysis failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
