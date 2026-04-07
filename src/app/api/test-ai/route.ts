import { NextResponse } from 'next/server';
import { getOpenAIClient } from '@/lib/ai/client';

export const maxDuration = 60;

export async function GET() {
  try {
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 20,
      messages: [{ role: 'user', content: 'Say: Hello from AffiliateHunter' }],
    });
    return NextResponse.json({
      ok: true,
      message: response.choices[0]?.message?.content,
    });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack?.split('\n').slice(0, 5) : undefined,
    }, { status: 500 });
  }
}
