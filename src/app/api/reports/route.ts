import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

const CSV_HEADERS = [
  'id', 'publisher_name', 'domain', 'website', 'category', 'affiliate_type',
  'tier_priority', 'affiliate_network', 'estimated_monthly_visits', 'historical_gmv',
  'contact_email', 'contact_name', 'social_linkedin',
  'onboarding_priority', 'countries', 'description', 'summary_note', 'enrichment_status'
];

function toCsvRow(row: Record<string, unknown>, headers: string[]): string {
  return headers.map((h) => {
    const val = row[h];
    if (val === null || val === undefined) return '';
    const str = String(val);
    return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str.replace(/"/g, '""')}"` : str;
  }).join(',');
}

export async function GET(request: NextRequest) {
  const supabase = createServiceClient();
  const type = request.nextUrl.searchParams.get('type') || 'publishers';
  const format = request.nextUrl.searchParams.get('format') || 'json';
  const search = request.nextUrl.searchParams.get('search');
  const category = request.nextUrl.searchParams.get('category');
  const tier = request.nextUrl.searchParams.get('tier');
  const network = request.nextUrl.searchParams.get('network');
  const hasEmail = request.nextUrl.searchParams.get('has_email');
  const limitParam = request.nextUrl.searchParams.get('limit');
  const maxRows = limitParam ? parseInt(limitParam, 10) : null;

  if (type === 'publishers') {
    // Paginate through all records to bypass Supabase's 1000-row default limit
    const allRows: Record<string, unknown>[] = [];
    const pageSize = 1000;
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const batchSize = maxRows ? Math.min(pageSize, maxRows - allRows.length) : pageSize;
      let query = supabase
        .from('publishers')
        .select('id, publisher_name, domain, website, category, affiliate_type, tier_priority, affiliate_network, estimated_monthly_visits, historical_gmv, contact_email, contact_name, social_linkedin, onboarding_priority, countries, description, summary_note, enrichment_status')
        .order('id', { ascending: true })
        .range(offset, offset + batchSize - 1);

      if (search) {
        query = query.or(`publisher_name.ilike.%${search}%,domain.ilike.%${search}%,category.ilike.%${search}%`);
      }
      if (category) {
        query = query.eq('category', category);
      }
      if (tier) {
        query = query.eq('tier_priority', tier);
      }
      if (network) {
        query = query.ilike('affiliate_network', `%${network}%`);
      }
      if (hasEmail === 'true') {
        query = query.not('contact_email', 'is', null);
      }

      const { data, error } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (!data || data.length === 0) {
        hasMore = false;
      } else {
        allRows.push(...data);
        offset += data.length;
        if (data.length < batchSize || (maxRows && allRows.length >= maxRows)) {
          hasMore = false;
        }
      }
    }

    if (format === 'csv') {
      const csv = [
        CSV_HEADERS.join(','),
        ...allRows.map((row) => toCsvRow(row, CSV_HEADERS)),
      ].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename=publishers_export_${new Date().toISOString().split('T')[0]}.csv`,
        },
      });
    }

    return NextResponse.json(allRows);
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
