import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = createServiceClient();
  const type = request.nextUrl.searchParams.get('type') || 'publishers';
  const format = request.nextUrl.searchParams.get('format') || 'json';

  if (type === 'publishers') {
    const { data, error } = await supabase
      .from('publishers')
      .select('id, publisher_name, domain, category, tier_priority, affiliate_network, estimated_monthly_visits, historical_gmv, contact_email, contact_name, onboarding_priority, countries')
      .order('priority_rank', { ascending: true, nullsFirst: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (format === 'csv') {
      const headers = ['id', 'publisher_name', 'domain', 'category', 'tier_priority', 'affiliate_network', 'estimated_monthly_visits', 'historical_gmv', 'contact_email', 'contact_name', 'onboarding_priority', 'countries'];
      const csv = [
        headers.join(','),
        ...(data || []).map((row: Record<string, unknown>) =>
          headers.map((h) => {
            const val = row[h];
            if (val === null || val === undefined) return '';
            const str = String(val);
            return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
          }).join(',')
        ),
      ].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename=publishers_export.csv',
        },
      });
    }

    return NextResponse.json(data || []);
  }

  if (type === 'outreach') {
    const { data, error } = await supabase
      .from('outreach')
      .select('*, publisher:publishers(publisher_name, domain)')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json([]);
    }

    return NextResponse.json(data || []);
  }

  return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
}
