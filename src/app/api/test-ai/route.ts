import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getCachedSetting } from '@/lib/settings-cache';

export const maxDuration = 60;

export async function GET() {
  try {
    const apiKey = getCachedSetting('OPENAI_API_KEY');
    const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy || null;

    // Create client directly (no proxy logic)
    const client = new OpenAI({ apiKey });
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 20,
      messages: [{ role: 'user', content: 'Say: Hello from AffiliateHunter' }],
    });
    return NextResponse.json({
      ok: true,
      message: response.choices[0]?.message?.content,
      key_preview: apiKey ? `${apiKey.substring(0, 16)}...` : 'not set',
      proxy_url: proxyUrl,
    });
  } catch (err) {
    const apiKey = getCachedSetting('OPENAI_API_KEY');
    return NextResponse.json({
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      key_preview: apiKey ? `${apiKey.substring(0, 16)}...` : 'not set',
      proxy_url: process.env.HTTPS_PROXY || process.env.https_proxy || null,
      stack: err instanceof Error ? err.stack?.split('\n').slice(0, 5) : undefined,
    }, { status: 500 });
  }
}
