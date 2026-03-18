import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('brands')
    .select('*, brand_profiles(*)')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json([]);
  }

  return NextResponse.json(data || []);
}
