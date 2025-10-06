import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { calculateAnalytics, getDefaultFilters } from '@/lib/analytics'
import { ResponseFilters } from '@/types'

// Helper function to apply server-side filters to a Supabase query
function applyServerFilters(query: any, businessId: string, filters: ResponseFilters) {
  // Base filters
  query = query
    .eq('business_id', businessId)
    .eq('is_spam', false)
    .gte('created_at', filters.dateRange.start)
    .lte('created_at', filters.dateRange.end)

  // Rating filter
  if (filters.ratingFilter && filters.ratingFilter.length > 0) {
    query = query.in('rating', filters.ratingFilter)
  }

  // Sentiment filter
  if (filters.sentimentFilter && filters.sentimentFilter.length > 0) {
    query = query.in('sentiment', filters.sentimentFilter)
  }

  // Audio/Text filter
  if (!filters.includeAudio && !filters.includeText) {
    // Return no results if neither is included
    query = query.eq('id', 'impossible-id-to-match-nothing')
  } else if (!filters.includeAudio) {
    // Only text responses (no audio)
    query = query.is('audio_url', null)
  } else if (!filters.includeText) {
    // Only audio responses
    query = query.not('audio_url', 'is', null)
  }

  // Flag filters
  if (filters.isFlagged === true) {
    query = query.eq('is_flagged', true)
  } else if (filters.isFlagged === false) {
    query = query.or('is_flagged.is.null,is_flagged.eq.false')
  }

  if (filters.isAddressed === true) {
    query = query.eq('is_addressed', true)
  } else if (filters.isAddressed === false) {
    query = query.or('is_addressed.is.null,is_addressed.eq.false')
  }

  // Search filter (transcription and keywords)
  if (filters.searchQuery) {
    const searchTerm = filters.searchQuery.trim()
    if (searchTerm) {
      query = query.or(`transcription.ilike.%${searchTerm}%,keywords.cs.{${searchTerm}}`)
    }
  }

  return query
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('business_id')
    
    if (!businessId) {
      return NextResponse.json({ error: 'business_id is required' }, { status: 400 })
    }

    // Parse filters from query parameters
    const filters: ResponseFilters = {
      dateRange: {
        start: searchParams.get('start_date') || getDefaultFilters().dateRange.start,
        end: searchParams.get('end_date') || getDefaultFilters().dateRange.end
      },
      ratingFilter: searchParams.get('ratings') 
        ? searchParams.get('ratings')!.split(',').map(Number).filter(n => !isNaN(n) && n >= 1 && n <= 5)
        : null,
      sentimentFilter: searchParams.get('sentiments')
        ? searchParams.get('sentiments')!.split(',').filter(s => ['positive', 'neutral', 'negative'].includes(s))
        : null,
      searchQuery: searchParams.get('search') || '',
      surveyFilter: searchParams.get('qrs')
        ? searchParams.get('qrs')!.split(',').filter(Boolean)
        : null,
      includeAudio: searchParams.get('includeAudio') !== 'false',
      includeText: searchParams.get('includeText') !== 'false',
      isFlagged: searchParams.get('isFlagged') === 'true' ? true : searchParams.get('isFlagged') === 'false' ? false : null,
      isAddressed: searchParams.get('isAddressed') === 'true' ? true : searchParams.get('isAddressed') === 'false' ? false : null
    }

    console.log('Analytics: Fetching analytics for business:', businessId, 'with filters:', filters)

    // Handle QR filter by converting QR codes to survey IDs
    let surveyIds: string[] | null = null
    if (filters.surveyFilter && filters.surveyFilter.length > 0) {
      const { data: surveyRows, error: surveyErr } = await supabaseServer
        .from('surveys')
        .select('id')
        .eq('business_id', businessId)
        .in('qr_code', filters.surveyFilter)
      
      if (surveyErr) {
        return NextResponse.json({ error: surveyErr.message }, { status: 500 })
      }
      
      surveyIds = (surveyRows || []).map(r => r.id)
      if (surveyIds.length === 0) {
        // No matching surveys found, return empty analytics
        const emptyAnalytics = calculateAnalytics([], filters)
        return NextResponse.json({ success: true, analytics: emptyAnalytics, filters, generatedAt: new Date().toISOString() })
      }
    }

    // Server-side total count using head:true
    let countQuery = supabaseServer
      .from('responses')
      .select('id', { count: 'exact', head: true })
    
    countQuery = applyServerFilters(countQuery, businessId, filters)
    
    if (surveyIds) {
      countQuery = countQuery.in('survey_id', surveyIds)
    }

    const { count: totalCount, error: countErr } = await countQuery

    if (countErr) {
      return NextResponse.json({ error: countErr.message }, { status: 500 })
    }

    // Fetch records to compute full analytics
    let dataQuery = supabaseServer
      .from('responses')
      .select('*')
    
    dataQuery = applyServerFilters(dataQuery, businessId, filters)
    
    if (surveyIds) {
      dataQuery = dataQuery.in('survey_id', surveyIds)
    }

    const { data: responses, error } = await dataQuery

    if (error) {
      console.error('❌ Error fetching responses:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const analytics = calculateAnalytics(responses || [], filters)
    analytics.totalResponses = typeof totalCount === 'number' ? totalCount : analytics.totalResponses

    console.log('✅ Analytics calculated:', {
      totalResponses: analytics.totalResponses,
      averageRating: analytics.averageRating,
      sentimentBreakdown: analytics.sentimentBreakdown
    })

    return NextResponse.json({ success: true, analytics, filters, generatedAt: new Date().toISOString() })

  } catch (err: any) {
    console.error('❌ Analytics API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
