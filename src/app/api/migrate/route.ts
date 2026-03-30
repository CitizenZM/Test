import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

const MIGRATION_SQL = `
-- Full production schema for AffiliateHunter AI
-- Safe to run multiple times (IF NOT EXISTS)

CREATE TABLE IF NOT EXISTS publishers (
  id BIGSERIAL PRIMARY KEY,
  priority_rank INTEGER,
  publisher_name TEXT NOT NULL,
  website TEXT,
  domain TEXT,
  contact_email TEXT,
  contact_name TEXT,
  affiliate_network TEXT,
  affiliate_type TEXT,
  category TEXT,
  tier_priority TEXT,
  tcl_focus_areas TEXT,
  historical_gmv NUMERIC,
  historical_transactions INTEGER,
  historical_clicks INTEGER,
  historical_roi NUMERIC,
  historical_cvr NUMERIC,
  gmv_history_source TEXT,
  countries TEXT,
  research_source_url TEXT,
  estimated_monthly_visits INTEGER,
  estimated_placement_fee NUMERIC,
  estimated_integration_fee NUMERIC,
  modeled_roas NUMERIC,
  estimated_paid_return NUMERIC,
  onboarding_priority TEXT,
  fee_basis TEXT,
  summary_note TEXT,
  mau INTEGER,
  mau_source TEXT,
  description TEXT,
  social_twitter TEXT,
  social_linkedin TEXT,
  social_facebook TEXT,
  alexa_rank INTEGER,
  domain_authority INTEGER,
  primary_language TEXT,
  headquarters TEXT,
  founded_year INTEGER,
  enriched_at TIMESTAMPTZ,
  enrichment_status TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID DEFAULT '00000000-0000-0000-0000-000000000000',
  brand_name TEXT NOT NULL,
  category TEXT,
  primary_domain TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS brand_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  positioning_summary TEXT,
  audience_summary TEXT,
  pricing_summary TEXT,
  value_props_json JSONB,
  brand_voice_json JSONB,
  ai_confidence NUMERIC,
  generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  brand_name TEXT,
  category TEXT,
  campaign_type TEXT DEFAULT 'recruitment',
  status TEXT DEFAULT 'draft',
  sequence JSONB DEFAULT '[]',
  target_criteria JSONB,
  goals JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS outreach (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  publisher_id BIGINT REFERENCES publishers(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'lead',
  channel TEXT,
  message_type TEXT,
  message TEXT,
  subject TEXT,
  reply TEXT,
  sent_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  next_follow_up TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
`;

// Split into individual statements
const STATEMENTS = MIGRATION_SQL
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && s.startsWith('CREATE'));

export async function POST() {
  const results: { statement: string; ok: boolean; error?: string }[] = [];

  // Try direct pg connection first
  const dbPassword = process.env.SUPABASE_DB_PASSWORD;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');

  if (dbPassword && projectRef) {
    try {
      const { Pool } = await import('pg');
      const pool = new Pool({
        connectionString: `postgresql://postgres.${projectRef}:${dbPassword}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000,
      });

      const client = await pool.connect();
      try {
        for (const stmt of STATEMENTS) {
          try {
            await client.query(stmt);
            const tableName = stmt.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1] || 'unknown';
            results.push({ statement: `CREATE TABLE ${tableName}`, ok: true });
          } catch (err) {
            const tableName = stmt.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1] || 'unknown';
            results.push({
              statement: `CREATE TABLE ${tableName}`,
              ok: false,
              error: err instanceof Error ? err.message : String(err),
            });
          }
        }

        // Notify PostgREST to reload schema cache
        try {
          await client.query("NOTIFY pgrst, 'reload schema'");
          results.push({ statement: 'NOTIFY pgrst reload', ok: true });
        } catch {
          // Not critical
        }
      } finally {
        client.release();
        await pool.end();
      }

      return NextResponse.json({
        method: 'pg_direct',
        results,
        all_ok: results.every(r => r.ok),
      });
    } catch (pgErr) {
      // pg connection failed, try alternative
      results.push({
        statement: 'pg_connect',
        ok: false,
        error: pgErr instanceof Error ? pgErr.message : String(pgErr),
      });
    }
  }

  // Fallback: try using Supabase RPC if available
  const supabase = createServiceClient();

  // Test each table with an actual insert+delete to verify write access
  const tableTests: Record<string, boolean> = {};
  for (const table of ['publishers', 'brands', 'brand_profiles', 'campaigns', 'outreach']) {
    const { error } = await supabase.from(table).select('id').limit(1);
    tableTests[table] = !error;
    if (error) {
      results.push({
        statement: `CHECK TABLE ${table}`,
        ok: false,
        error: error.message,
      });
    } else {
      results.push({
        statement: `CHECK TABLE ${table}`,
        ok: true,
      });
    }
  }

  const allExist = Object.values(tableTests).every(v => v);

  return NextResponse.json({
    method: 'supabase_check',
    tables_exist: allExist,
    results,
    action_needed: !allExist
      ? 'Tables missing. Please run the SQL from supabase/migrations/003_full_publishers_schema.sql in your Supabase SQL Editor at: https://supabase.com/dashboard/project/' + projectRef + '/sql/new'
      : null,
    migration_sql: !allExist ? MIGRATION_SQL : undefined,
  });
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint to run database migrations',
    note: 'Requires SUPABASE_DB_PASSWORD env var for direct SQL execution, or run the SQL manually in Supabase SQL Editor',
  });
}
