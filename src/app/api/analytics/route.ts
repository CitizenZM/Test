import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createServiceClient();

  const [publishersRes, outreachRes] = await Promise.all([
    supabase.from('publishers').select('id', { count: 'exact', head: true }),
    supabase.from('outreach').select('status').then(
      (res) => res,
      () => ({ data: [], error: null })
    ),
  ]);

  const outreachData = outreachRes.data || [];
  const totalPublishers = publishersRes.count || 0;

  const contacted = outreachData.filter((o: { status: string }) => o.status !== 'lead');
  const replies = outreachData.filter((o: { status: string }) => ['replied', 'meeting', 'partner', 'active'].includes(o.status));
  const meetings = outreachData.filter((o: { status: string }) => ['meeting', 'partner', 'active'].includes(o.status));
  const partners = outreachData.filter((o: { status: string }) => ['partner', 'active'].includes(o.status));
  const active = outreachData.filter((o: { status: string }) => o.status === 'active');

  const outreachSent = contacted.length;
  const replyRate = outreachSent > 0 ? (replies.length / outreachSent) * 100 : 0;
  const partnerConversion = outreachSent > 0 ? (partners.length / outreachSent) * 100 : 0;

  return NextResponse.json({
    leadsDiscovered: totalPublishers,
    outreachSent,
    replies: replies.length,
    meetings: meetings.length,
    partners: partners.length,
    activePartners: active.length,
    replyRate,
    partnerConversion,
  });
}
