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




