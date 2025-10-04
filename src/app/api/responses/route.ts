import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { survey_id, business_id, rating, text, language } = body

    if (!survey_id || !business_id || !rating) {
      return NextResponse.json({ error: 'survey_id, business_id, rating are required' }, { status: 400 })
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'rating must be between 1 and 5' }, { status: 400 })
    }

    const headers = request.headers
    const ip = headers.get('x-forwarded-for') || '0.0.0.0'
    const userAgent = headers.get('user-agent') || ''

    const { data, error } = await supabaseServer
      .from('responses')
      .insert({
        survey_id,
        business_id,
        rating,
        transcription: text || null,
        language: language || null,
        ip_address: ip,
        user_agent: userAgent
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, response: data })
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}




