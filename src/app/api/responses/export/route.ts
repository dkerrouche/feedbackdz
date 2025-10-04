import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { ResponseFilters } from '@/types'

// POST /api/responses/export - Export responses as CSV
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { business_id, filters = {} }: { business_id: string; filters?: Partial<ResponseFilters> } = body

    if (!business_id) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 })
    }

    // Build query based on filters
    let query = supabase
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
        is_addressed,
        is_flagged,
        addressed_at,
        flagged_at,
        notes,
        surveys!inner(qr_code, questions)
      `)
      .eq('business_id', business_id)
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters.rating !== null && filters.rating !== undefined) {
      query = query.eq('rating', filters.rating)
    }

    if (filters.sentiment) {
      query = query.eq('sentiment', filters.sentiment)
    }

    if (filters.hasAudio !== null && filters.hasAudio !== undefined) {
      if (filters.hasAudio) {
        query = query.not('audio_url', 'is', null)
      } else {
        query = query.is('audio_url', null)
      }
    }

    if (filters.isFlagged !== null && filters.isFlagged !== undefined) {
      query = query.eq('is_flagged', filters.isFlagged)
    }

    if (filters.isAddressed !== null && filters.isAddressed !== undefined) {
      query = query.eq('is_addressed', filters.isAddressed)
    }

    if (filters.dateRange) {
      query = query
        .gte('created_at', filters.dateRange.start)
        .lte('created_at', filters.dateRange.end)
    }

    if (filters.search) {
      query = query.or(`transcription.ilike.%${filters.search}%,keywords.cs.{${filters.search}}`)
    }

    const { data: responses, error } = await query

    if (error) {
      console.error('Error fetching responses for export:', error)
      return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 })
    }

    // Convert to CSV
    const csv = convertToCSV(responses || [])

    // Set headers for file download
    const headers = new Headers()
    headers.set('Content-Type', 'text/csv')
    headers.set('Content-Disposition', `attachment; filename="responses-${new Date().toISOString().split('T')[0]}.csv"`)

    return new NextResponse(csv, { headers })
  } catch (error) {
    console.error('Error in POST /api/responses/export:', error)
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
    'Is Addressed',
    'Is Flagged',
    'Addressed At',
    'Flagged At',
    'Notes'
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
    response.is_addressed ? 'Yes' : 'No',
    response.is_flagged ? 'Yes' : 'No',
    response.addressed_at || '',
    response.flagged_at || '',
    `"${(response.notes || '').replace(/"/g, '""')}"` // Escape quotes
  ])

  // Combine headers and rows
  const csvContent = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n')

  return csvContent
}
