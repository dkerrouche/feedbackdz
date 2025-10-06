import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { survey_id, business_id, rating, text, audio_url, language } = body

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
        audio_url: audio_url || null,
        language: language || null,
        ip_address: ip,
        user_agent: userAgent
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If there's an audio URL, trigger background processing
    if (audio_url && data) {
      // Trigger AI processing in background (non-blocking)
      processAudioInBackground(data.id, audio_url, text || '')
        .catch(err => console.error('Background processing failed:', err))
    }

    return NextResponse.json({ success: true, response: data })
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/responses?business_id=...&page=1&limit=20&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&ratings=5,4&sentiments=positive,neutral&search=coffee&qrs=QR1,QR2
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('business_id')
    if (!businessId) {
      return NextResponse.json({ error: 'business_id is required' }, { status: 400 })
    }

    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1)
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10), 1), 100)
    
    // Parse all filter parameters
    const startDate = searchParams.get('start_date') || null
    const endDate = searchParams.get('end_date') || null
    const ratings = (searchParams.get('ratings') || '')
      .split(',')
      .map(r => r.trim())
      .filter(Boolean)
      .map(Number)
      .filter(n => !isNaN(n) && n >= 1 && n <= 5)
    const sentiments = (searchParams.get('sentiments') || '')
      .split(',')
      .map(s => s.trim())
      .filter(s => ['positive', 'neutral', 'negative'].includes(s))
    const search = searchParams.get('search') || ''
    const qrs = (searchParams.get('qrs') || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
    
    // New filter parameters
    const includeAudio = searchParams.get('includeAudio') !== 'false'
    const includeText = searchParams.get('includeText') !== 'false'
    const isFlagged = searchParams.get('isFlagged') === 'true' ? true : searchParams.get('isFlagged') === 'false' ? false : null
    const isAddressed = searchParams.get('isAddressed') === 'true' ? true : searchParams.get('isAddressed') === 'false' ? false : null

    // Handle QR filter by converting QR codes to survey IDs first
    let surveyIds: string[] | null = null
    if (qrs.length > 0) {
      const { data: surveyRows, error: surveyErr } = await supabaseServer
        .from('surveys')
        .select('id')
        .eq('business_id', businessId)
        .in('qr_code', qrs)
      if (surveyErr) return NextResponse.json({ error: surveyErr.message }, { status: 500 })
      surveyIds = (surveyRows || []).map(r => r.id)
      if (surveyIds.length === 0) {
        return NextResponse.json({ items: [], total: 0, page, limit })
      }
    }

    // Check for impossible filter combinations
    if (!includeAudio && !includeText) {
      return NextResponse.json({ items: [], total: 0, page, limit })
    }

    let query = supabaseServer
      .from('responses')
      .select('*', { count: 'exact' })
      .eq('business_id', businessId)
      .eq('is_spam', false)

    // Apply date filters
    if (startDate) query = query.gte('created_at', startDate)
    if (endDate) query = query.lte('created_at', endDate)
    
    // Apply rating and sentiment filters
    if (ratings.length > 0) query = query.in('rating', ratings)
    if (sentiments.length > 0) query = query.in('sentiment', sentiments)
    
    // Apply audio/text filters
    if (!includeAudio) {
      query = query.is('audio_url', null)
    } else if (!includeText) {
      query = query.not('audio_url', 'is', null)
    }
    
    // Apply flag filters
    if (isFlagged === true) {
      query = query.eq('is_flagged', true)
    } else if (isFlagged === false) {
      query = query.or('is_flagged.is.null,is_flagged.eq.false')
    }
    
    if (isAddressed === true) {
      query = query.eq('is_addressed', true)
    } else if (isAddressed === false) {
      query = query.or('is_addressed.is.null,is_addressed.eq.false')
    }
    
    // Apply search filter
    if (search) {
      const searchTerm = search.trim()
      if (searchTerm) {
        query = query.or(`transcription.ilike.%${searchTerm}%,keywords.cs.{${searchTerm}}`)
      }
    }
    
    // Apply survey filter
    if (surveyIds) {
      query = query.in('survey_id', surveyIds)
    }

    query = query.order('created_at', { ascending: false })
      .range((page - 1) * limit, (page - 1) * limit + (limit - 1))

    const { data, error, count } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ items: data || [], total: count || 0, page, limit })
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Background processing function
async function processAudioInBackground(responseId: string, audioUrl: string, text: string) {
  try {
    console.log('Background: Starting processing for response:', responseId)
    
    // Transcribe audio
    const transcribeResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ai/transcribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audioUrl,
        responseId,
        language: 'auto'
      })
    })
    
    const transcribeData = await transcribeResponse.json()
    let transcription = text
    
    if (transcribeData.success && transcribeData.transcription) {
      transcription = transcribeData.transcription
      console.log('Success: Transcription completed:', transcription.substring(0, 100) + '...')
    } else {
      console.warn('Warning: Transcription failed:', transcribeData.error)
    }
    
    // Analyze sentiment and extract keywords
    const analyzeResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ai/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: transcription,
        responseId,
        language: 'auto'
      })
    })
    
    const analyzeData = await analyzeResponse.json()
    let sentiment = 'neutral'
    let sentimentScore = 0.5
    let keywords: string[] = []
    
    if (analyzeData.success) {
      sentiment = analyzeData.sentiment || 'neutral'
      sentimentScore = analyzeData.sentimentScore || 0.5
      keywords = analyzeData.keywords || []
      console.log('Success: Analysis completed:', { sentiment, sentimentScore, keywords })
    } else {
      console.warn('Warning: Analysis failed:', analyzeData.error)
    }
    
    // Update response with processed data
    const { error: updateError } = await supabaseServer
      .from('responses')
      .update({
        transcription,
        sentiment,
        sentiment_score: sentimentScore,
        keywords,
        processed_at: new Date().toISOString()
      })
      .eq('id', responseId)
    
    if (updateError) {
      console.error('❌ Failed to update response:', updateError)
    } else {
      console.log('✅ Response updated with AI processing results')
    }
    
  } catch (error) {
    console.error('❌ Background processing error:', error)
  }
}




