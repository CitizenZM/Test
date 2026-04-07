import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const maxDuration = 60;

export async function GET() {
  try {
    // Use env var directly, not cache
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ ok: false, error: 'OPENAI_API_KEY env var not set' });
    }

    const keyLen = apiKey.length;
    const keyTrimLen = apiKey.trim().length;
    const hasNewline = apiKey.includes('\n');

    // Create client with trimmed key
    const client = new OpenAI({ apiKey: apiKey.trim() });
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 20,
      messages: [{ role: 'user', content: 'Say: Hello' }],
    });
    return NextResponse.json({
      ok: true,
      message: response.choices[0]?.message?.content,
      key_len: keyLen,
      key_trim_len: keyTrimLen,
      has_newline: hasNewline,
    });
  } catch (err) {
    const apiKey = process.env.OPENAI_API_KEY || '';
    return NextResponse.json({
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      error_type: err?.constructor?.name,
      key_len: apiKey.length,
      key_trim_len: apiKey.trim().length,
      has_newline: apiKey.includes('\n'),
      key_start: apiKey.substring(0, 20),
      key_end: apiKey.substring(apiKey.length - 10),
    }, { status: 500 });
  }
}
