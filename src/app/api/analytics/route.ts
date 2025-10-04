import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { calculateAnalytics, getDefaultFilters } from '@/lib/analytics'
import { ResponseFilters } from '@/types'

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
        ? searchParams.get('ratings')!.split(',').map(Number)
        : null,
      sentimentFilter: searchParams.get('sentiments')
        ? searchParams.get('sentiments')!.split(',')
        : null,
      searchQuery: searchParams.get('search') || '',
      surveyFilter: searchParams.get('surveys')
        ? searchParams.get('surveys')!.split(',')
        : null
    }

    console.log('Analytics: Fetching analytics for business:', businessId, 'with filters:', filters)

    // Fetch responses for the business
    const { data: responses, error } = await supabaseServer
      .from('responses')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_spam', false) // Exclude spam responses
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching responses:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Calculate analytics
    const analytics = calculateAnalytics(responses || [], filters)

    console.log('✅ Analytics calculated:', {
      totalResponses: analytics.totalResponses,
      averageRating: analytics.averageRating,
      sentimentBreakdown: analytics.sentimentBreakdown
    })

    return NextResponse.json({
      success: true,
      analytics,
      filters,
      generatedAt: new Date().toISOString()
    })

  } catch (err: any) {
    console.error('❌ Analytics API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
