import { NextRequest, NextResponse } from 'next/server';
import { getCachedSetting, setCachedSetting } from '@/lib/settings-cache';
import Anthropic from '@anthropic-ai/sdk';

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID || 'prj_TrhCebxHiPG5IzWB4KGxvZiypiuL';

export async function GET() {
  const hasAnthropicKey = !!(getCachedSetting('ANTHROPIC_API_KEY'));
  return NextResponse.json({
    anthropic_configured: hasAnthropicKey,
    anthropic_key_preview: hasAnthropicKey
      ? `${getCachedSetting('ANTHROPIC_API_KEY')!.substring(0, 12)}...`
      : null,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { anthropic_api_key } = await request.json();

    if (!anthropic_api_key || typeof anthropic_api_key !== 'string') {
      return NextResponse.json({ error: 'anthropic_api_key is required' }, { status: 400 });
    }

    const trimmedKey = anthropic_api_key.trim();

    // Test the key first
    try {
      const testClient = new Anthropic({ apiKey: trimmedKey });
      const testResult = await testClient.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Say: OK' }],
      });
      if (!testResult.content.length) {
        return NextResponse.json({ error: 'API key test failed — no response' }, { status: 400 });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Invalid API key';
      return NextResponse.json({ error: `API key validation failed: ${msg}` }, { status: 400 });
    }

    // Cache immediately so current process uses it
    setCachedSetting('ANTHROPIC_API_KEY', trimmedKey);

    // Persist to Vercel environment variables so it survives restarts
    try {
      await persistToVercel('ANTHROPIC_API_KEY', trimmedKey);
    } catch (err) {
      // Non-fatal — key is cached for this session
      console.warn('Failed to persist to Vercel:', err);
    }

    return NextResponse.json({
      success: true,
      message: 'Anthropic API key saved and verified successfully',
      key_preview: `${trimmedKey.substring(0, 12)}...`,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to save settings' },
      { status: 500 }
    );
  }
}

async function persistToVercel(key: string, value: string) {
  // First check if the env var already exists
  const listRes = await fetch(
    `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/env`,
    { headers: { Authorization: `Bearer ${VERCEL_TOKEN}` } }
  );
  const listData = await listRes.json();
  const existing = listData.envs?.find((e: { key: string }) => e.key === key);

  if (existing) {
    // Update existing
    await fetch(
      `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/env/${existing.id}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value, target: ['production', 'preview', 'development'] }),
      }
    );
  } else {
    // Create new
    await fetch(
      `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/env`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key,
          value,
          type: 'encrypted',
          target: ['production', 'preview', 'development'],
        }),
      }
    );
  }
}
