import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET(
  request: NextRequest,
  { params }: { params: { qr_code: string } }
) {
  try {
    const qr = params.qr_code
    if (!qr) {
      return NextResponse.json({ error: 'qr_code is required' }, { status: 400 })
    }

    const { data: survey, error } = await supabaseServer
      .from('surveys')
      .select('id, business_id, qr_code, questions, languages, is_active')
      .eq('qr_code', qr)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    if (!survey?.is_active) {
      return NextResponse.json({ error: 'Survey is inactive' }, { status: 403 })
    }

    return NextResponse.json({ success: true, survey })
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


