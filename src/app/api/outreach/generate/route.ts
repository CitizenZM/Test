import { NextRequest, NextResponse } from 'next/server';
import { generateOutreachMessage } from '@/lib/ai/outreach-agent';
import { formatAIError } from '@/lib/ai/error-messages';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { publisher, channel, tone, message_type, brand_id, brand_name, brand_context } = body;

    if (!publisher) {
      return NextResponse.json({ error: 'Publisher data is required' }, { status: 400 });
    }

    const message = await generateOutreachMessage({
      publisher,
      channel: channel || 'email',
      tone,
      message_type,
      brand_id,
      brand_name,
      brand_context,
    });

    return NextResponse.json({ message });
  } catch (err) {
    return NextResponse.json({ error: formatAIError(err) }, { status: 500 });
  }
}
