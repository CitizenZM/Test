import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to_email, subject, message, publisher_id, publisher_name, brand_id } = body;

    if (!to_email || !subject || !message) {
      return NextResponse.json(
        { error: 'to_email, subject, and message are required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Log the email to email_logs table
    const { data: emailLog, error: logError } = await supabase
      .from('email_logs')
      .insert({
        publisher_id,
        publisher_name,
        to_email,
        subject,
        body: message,
        status: 'queued',
      })
      .select()
      .single();

    if (logError) {
      return NextResponse.json({ error: logError.message }, { status: 500 });
    }

    // Also create/update outreach record if publisher_id provided
    if (publisher_id) {
      await supabase.from('outreach').insert({
        publisher_id,
        brand_id,
        channel: 'email',
        message,
        subject,
        status: 'contacted',
        sent_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      email_log_id: emailLog?.id,
      message: 'Email queued for sending',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to send email';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
