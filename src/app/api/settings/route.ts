import { NextRequest, NextResponse } from 'next/server';
import { getCachedSetting, setCachedSetting } from '@/lib/settings-cache';
import OpenAI from 'openai';
import { ProxyAgent, fetch as undiciFetch } from 'undici';

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID || 'prj_TrhCebxHiPG5IzWB4KGxvZiypiuL';

export async function GET() {
  const hasOpenAIKey = !!(getCachedSetting('OPENAI_API_KEY'));
  return NextResponse.json({
    openai_configured: hasOpenAIKey,
    // Keep anthropic_configured as alias for backward compat with any UI code
    anthropic_configured: hasOpenAIKey,
    openai_key_preview: hasOpenAIKey
      ? `${getCachedSetting('OPENAI_API_KEY')!.substring(0, 16)}...`
      : null,
    anthropic_key_preview: hasOpenAIKey
      ? `${getCachedSetting('OPENAI_API_KEY')!.substring(0, 16)}...`
      : null,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const apiKey = body.openai_api_key || body.anthropic_api_key;

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 });
    }

    const trimmedKey = apiKey.trim();

    // Test the key first
    try {
      const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy;
      let proxyFetchFn: typeof globalThis.fetch | undefined;
      if (proxyUrl) {
        const dispatcher = new ProxyAgent(proxyUrl);
        proxyFetchFn = ((input: string | URL | Request, init?: RequestInit) => {
          return undiciFetch(input as string, { ...init, dispatcher } as Record<string, unknown>);
        }) as unknown as typeof globalThis.fetch;
      }
      const testClient = new OpenAI({
        apiKey: trimmedKey,
        ...(proxyFetchFn ? { fetch: proxyFetchFn } : {}),
      });
      const testResult = await testClient.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Say: OK' }],
      });
      if (!testResult.choices[0]?.message?.content) {
        return NextResponse.json({ error: 'API key test failed — no response received' }, { status: 400 });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Invalid API key';
      return NextResponse.json({ error: `API key validation failed: ${msg}` }, { status: 400 });
    }

    // Cache immediately for this invocation
    setCachedSetting('OPENAI_API_KEY', trimmedKey);

    let deploymentUrl: string | null = null;

    // Persist to Vercel env vars and trigger redeploy
    if (VERCEL_TOKEN) {
      try {
        await upsertVercelEnv('OPENAI_API_KEY', trimmedKey);
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
