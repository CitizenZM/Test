import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createServiceClient();

  const results: Record<string, { ok: boolean; count?: number; error?: string }> = {};

  for (const table of ['publishers', 'brands', 'brand_profiles', 'campaigns', 'outreach']) {
    const { count, error } = await (supabase as ReturnType<typeof createServiceClient>)
      .from(table)
      .select('*', { count: 'exact', head: true });
    results[table] = error
      ? { ok: false, error: error.message }
      : { ok: true, count: count ?? 0 };
  }

  const allOk = Object.values(results).every((r) => r.ok);

  return NextResponse.json({
    status: allOk ? 'ok' : 'partial',
    tables: results,
  });
}
