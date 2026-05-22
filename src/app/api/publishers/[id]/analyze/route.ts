import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { analyzePublisher } from '@/lib/ai/scoring';
import { formatAIError } from '@/lib/ai/error-messages';
import { rateLimit } from '@/lib/rate-limit';

export const maxDuration = 60;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { allowed } = rateLimit('analyze', 15, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded. Please wait a minute.' }, { status: 429 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { website, name } = body;

    if (!website || typeof website !== 'string' || !name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Website and name are required' }, { status: 400 });
    }

    const scores = await analyzePublisher(name, website);

    try {
      const supabase = createServiceClient();
      await supabase
        .from('publishers')
        .update({
          modeled_roas: scores.publisher_score / 20,
          domain_authority: scores.traffic_score,
          summary_note: scores.analysis,
          enrichment_status: 'ai_analyzed',
        })
        .eq('id', id);
    } catch {
      // DB update failed — still return scores
    }

    return NextResponse.json(scores);
  } catch (err) {
    return NextResponse.json({ error: formatAIError(err) }, { status: 500 });
  }
}
