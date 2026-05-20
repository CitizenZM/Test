import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = createServiceClient();

  // Try to use rpc to execute SQL for fixing FK constraint
  // First, check what the FK currently references
  const { data: fkCheck, error: fkError } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'campaigns'
        AND kcu.column_name = 'brand_id';
    `,
  });

  if (fkError) {
    // rpc exec_sql doesn't exist, try alternative approach
    // Use pg direct connection
    const dbPassword = process.env.SUPABASE_DB_PASSWORD;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');

    if (!dbPassword || !projectRef) {
      return NextResponse.json({
        error: 'No DB password available',
        fk_error: fkError.message,
        suggestion: 'Run this SQL in Supabase SQL Editor: ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_brand_id_fkey; ALTER TABLE campaigns ADD CONSTRAINT campaigns_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL;',
      });
    }

    try {
      const { Pool } = await import('pg');
      const pool = new Pool({
        connectionString: `postgresql://postgres.${projectRef}:${dbPassword}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000,
      });

      const client = await pool.connect();
      try {
        // Check current FK
        const fkResult = await client.query(`
          SELECT
            tc.constraint_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
          FROM information_schema.table_constraints AS tc
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
          WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_name = 'campaigns'
            AND tc.constraint_name LIKE '%brand%';
        `);

        // Drop old FK and recreate pointing to brands table
        await client.query('ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_brand_id_fkey');
        await client.query('ALTER TABLE campaigns ADD CONSTRAINT campaigns_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL NOT VALID');
        await client.query("NOTIFY pgrst, 'reload schema'");

        return NextResponse.json({
          success: true,
          old_fk: fkResult.rows,
          message: 'FK constraint updated to reference brands(id)',
        });
      } finally {
        client.release();
        await pool.end();
      }
    } catch (pgErr) {
      return NextResponse.json({
        error: pgErr instanceof Error ? pgErr.message : String(pgErr),
        suggestion: 'Run this SQL in Supabase SQL Editor: ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_brand_id_fkey; ALTER TABLE campaigns ADD CONSTRAINT campaigns_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL;',
      });
    }
  }

  return NextResponse.json({ fk_info: fkCheck });
}

export const maxDuration = 30;
