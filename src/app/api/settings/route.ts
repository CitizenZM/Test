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
      ? `${getCachedSetting('ANTHROPIC_API_KEY')!.substring(0, 16)}...`
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
        return NextResponse.json({ error: 'API key test failed — no response received' }, { status: 400 });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Invalid API key';
      return NextResponse.json({ error: `API key validation failed: ${msg}` }, { status: 400 });
    }

    // Cache immediately for this invocation
    setCachedSetting('ANTHROPIC_API_KEY', trimmedKey);

    let deploymentUrl: string | null = null;

    // Persist to Vercel env vars and trigger redeploy
    if (VERCEL_TOKEN) {
      try {
        await upsertVercelEnv('ANTHROPIC_API_KEY', trimmedKey);
        const deployment = await triggerRedeploy();
        deploymentUrl = deployment?.url || null;
      } catch (err) {
        console.warn('Vercel persistence failed:', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: deploymentUrl
        ? 'API key saved. Redeploying now — AI features will be active in ~2 minutes.'
        : 'API key saved and verified. Restart the server to apply across all requests.',
      key_preview: `${trimmedKey.substring(0, 16)}...`,
      deploying: !!deploymentUrl,
      deployment_url: deploymentUrl,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to save settings' },
      { status: 500 }
    );
  }
}

async function upsertVercelEnv(key: string, value: string) {
  // Check if env var exists
  const listRes = await fetch(
    `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/env`,
    { headers: { Authorization: `Bearer ${VERCEL_TOKEN}` } }
  );
  const listData = await listRes.json();
  const existing = listData.envs?.find((e: { key: string }) => e.key === key);

  const payload = { value, target: ['production', 'preview', 'development'] };

  if (existing) {
    await fetch(
      `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/env/${existing.id}`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${VERCEL_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
  } else {
    await fetch(
      `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/env`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${VERCEL_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, type: 'encrypted', ...payload }),
      }
    );
  }
}

async function triggerRedeploy() {
  // Get the latest production deployment to redeploy from
  const deploymentsRes = await fetch(
    `https://api.vercel.com/v6/deployments?projectId=${VERCEL_PROJECT_ID}&limit=1&target=production`,
    { headers: { Authorization: `Bearer ${VERCEL_TOKEN}` } }
  );
  const deploymentsData = await deploymentsRes.json();
  const latestDeployment = deploymentsData.deployments?.[0];

  if (!latestDeployment) return null;

  // Trigger redeploy
  const redeployRes = await fetch(
    `https://api.vercel.com/v13/deployments`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${VERCEL_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: latestDeployment.name,
        deploymentId: latestDeployment.uid,
        target: 'production',
      }),
    }
  );
  const redeployData = await redeployRes.json();
  return redeployData;
}
