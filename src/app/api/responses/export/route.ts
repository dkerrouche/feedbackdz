import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

// GET /api/responses/export?business_id=...&start_date=...&end_date=...&ratings=...&sentiments=...&search=...&qrs=...&includeAudio=...&includeText=...&isFlagged=...&isAddressed=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('business_id')
    if (!businessId) return NextResponse.json({ error: 'business_id is required' }, { status: 400 })

    // Parse all filter parameters (same as responses API)
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
        return new NextResponse('No data available', { headers: csvHeaders() })
      }
    }

    // Check for impossible filter combinations
    if (!includeAudio && !includeText) {
      return new NextResponse('No data available', { headers: csvHeaders() })
    }

    let query = supabaseServer
      .from('responses')
      .select(`
        id,
        rating,
        sentiment,
        sentiment_score,
        transcription,
        audio_url,
        keywords,
        language,
        ip_address,
        user_agent,
        created_at,
        processed_at,
        is_spam,
        is_flagged,
        is_addressed,
        surveys!inner(qr_code)
      `)
      .eq('business_id', businessId)
      .eq('is_spam', false)
      .order('created_at', { ascending: false })

    // Apply all filters (same logic as responses API)
    if (startDate) query = query.gte('created_at', startDate)
    if (endDate) query = query.lte('created_at', endDate)
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

    const { data: responses, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const csv = convertToCSV(responses || [])
    return new NextResponse(csv, { headers: csvHeaders() })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function convertToCSV(responses: any[]): string {
  if (responses.length === 0) {
    return 'No data available'
  }

  // Define CSV headers
  const headers = [
    'ID',
    'QR Code',
    'Rating',
    'Sentiment',
    'Sentiment Score',
    'Transcription',
    'Has Audio',
    'Audio URL',
    'Keywords',
    'Language',
    'IP Address',
    'User Agent',
    'Created At',
    'Processed At',
    'Is Spam',
    'Is Flagged',
    'Is Addressed'
  ]

  // Convert responses to CSV rows
  const rows = responses.map(response => [
    response.id,
    response.surveys?.qr_code || '',
    response.rating || '',
    response.sentiment || '',
    response.sentiment_score || '',
    `"${(response.transcription || '').replace(/"/g, '""')}"`, // Escape quotes
    response.audio_url ? 'Yes' : 'No',
    response.audio_url || '',
    `"${(response.keywords || []).join(', ')}"`,
    response.language || '',
    response.ip_address || '',
    `"${(response.user_agent || '').replace(/"/g, '""')}"`, // Escape quotes
    response.created_at || '',
    response.processed_at || '',
    response.is_spam ? 'Yes' : 'No',
    response.is_flagged ? 'Yes' : 'No',
    response.is_addressed ? 'Yes' : 'No'
  ])

  // Combine headers and rows
  const csvContent = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n')

  return csvContent
}

function csvHeaders() {
  const headers = new Headers()
  headers.set('Content-Type', 'text/csv')
  headers.set('Content-Disposition', `attachment; filename="responses-${new Date().toISOString().split('T')[0]}.csv"`)
  return headers
}
