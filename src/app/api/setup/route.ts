import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createServiceClient();

  const results: Record<string, { ok: boolean; count?: number; error?: string }> = {};

  for (const table of ['publishers', 'brands', 'brand_profiles', 'campaigns', 'outreach']) {
    // Use a real select (not just head) to properly detect missing tables
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);

    if (error) {
      results[table] = { ok: false, error: error.message };
    } else {
      // Table exists - now get count
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      results[table] = { ok: true, count: count ?? 0 };
    }
  }

  const allOk = Object.values(results).every((r) => r.ok);
  const hasApiKey = !!(process.env.OPENAI_API_KEY);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');

  return NextResponse.json({
    status: allOk ? 'ok' : 'partial',
    ai_ready: hasApiKey,
    tables: results,
    action_needed: !allOk
      ? `Tables missing. Run SQL migration in Supabase SQL Editor: https://supabase.com/dashboard/project/${projectRef}/sql/new — or POST to /api/migrate`
      : !hasApiKey
      ? 'Add OPENAI_API_KEY to Vercel environment variables'
      : null,
  });
}
