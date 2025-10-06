import { RealtimeResponse, AnalyticsData, ResponseFilters } from '@/types'

export function calculateAnalytics(
  responses: RealtimeResponse[],
  filters?: ResponseFilters
): AnalyticsData {
  // Apply filters if provided
  let filteredResponses = responses
  if (filters) {
    filteredResponses = applyFilters(responses, filters)
  }

  // Calculate basic metrics
  const totalResponses = filteredResponses.length
  const averageRating = totalResponses > 0 
    ? filteredResponses.reduce((sum, r) => sum + r.rating, 0) / totalResponses 
    : 0

  // Calculate sentiment breakdown
  const sentimentBreakdown = {
    positive: filteredResponses.filter(r => r.sentiment === 'positive').length,
    neutral: filteredResponses.filter(r => r.sentiment === 'neutral').length,
    negative: filteredResponses.filter(r => r.sentiment === 'negative').length
  }

  // Calculate trends (daily for last 30 days)
  const trends = calculateTrends(filteredResponses, 30)

  // Get recent responses (last 10)
  const recentResponses = filteredResponses
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)

  // Calculate response rate (placeholder - would need survey view data)
  const responseRate = 0 // TODO: Calculate based on QR scans vs responses

  // Extract top keywords
  const topKeywords = extractTopKeywords(filteredResponses)
  const keywordCounts = extractKeywordCounts(filteredResponses)

  // Calculate rating distribution
  const ratingDistribution = {
    1: filteredResponses.filter(r => r.rating === 1).length,
    2: filteredResponses.filter(r => r.rating === 2).length,
    3: filteredResponses.filter(r => r.rating === 3).length,
    4: filteredResponses.filter(r => r.rating === 4).length,
    5: filteredResponses.filter(r => r.rating === 5).length
  }

  return {
    totalResponses,
    averageRating: Math.round(averageRating * 100) / 100, // Round to 2 decimal places
    sentimentBreakdown,
    trends,
    recentResponses,
    responseRate,
    topKeywords,
    ratingDistribution,
    keywordCounts
  }
}

function applyFilters(responses: RealtimeResponse[], filters: ResponseFilters): RealtimeResponse[] {
  let filtered = responses

  // Date range filter
  if (filters.dateRange.start && filters.dateRange.end) {
    const startDate = new Date(filters.dateRange.start)
    const endDate = new Date(filters.dateRange.end)
    filtered = filtered.filter(r => {
      const responseDate = new Date(r.created_at)
      return responseDate >= startDate && responseDate <= endDate
    })
  }

  // Rating filter
  if (filters.ratingFilter && filters.ratingFilter.length > 0) {
    filtered = filtered.filter(r => filters.ratingFilter!.includes(r.rating))
  }

  // Sentiment filter
  if (filters.sentimentFilter && filters.sentimentFilter.length > 0) {
    filtered = filtered.filter(r => filters.sentimentFilter!.includes(r.sentiment))
  }

  // Search query filter
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase()
    filtered = filtered.filter(r => 
      r.transcription?.toLowerCase().includes(query) ||
      r.keywords?.some(keyword => keyword.toLowerCase().includes(query))
    )
  }

  // Survey filter
  if (filters.surveyFilter && filters.surveyFilter.length > 0) {
    filtered = filtered.filter(r => filters.surveyFilter!.includes(r.survey_id))
  }

  // Audio/Text filter
  if (!filters.includeAudio && !filters.includeText) {
    // If neither is included, return empty results
    return []
  } else if (!filters.includeAudio) {
    // Only text responses (no audio)
    filtered = filtered.filter(r => !r.audio_url)
  } else if (!filters.includeText) {
    // Only audio responses
    filtered = filtered.filter(r => !!r.audio_url)
  }
  // If both are true, no additional filtering needed

  // Flag filters
  if (filters.isFlagged === true) {
    filtered = filtered.filter(r => r.is_flagged === true)
  } else if (filters.isFlagged === false) {
    filtered = filtered.filter(r => r.is_flagged !== true)
  }

  if (filters.isAddressed === true) {
    filtered = filtered.filter(r => r.is_addressed === true)
  } else if (filters.isAddressed === false) {
    filtered = filtered.filter(r => r.is_addressed !== true)
  }

  return filtered
}

function calculateTrends(responses: RealtimeResponse[], days: number): Array<{
  date: string
  responses: number
  averageRating: number
}> {
  const trends: { [key: string]: { responses: number; totalRating: number } } = {}
  
  // Initialize last N days
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateKey = date.toISOString().split('T')[0]
    trends[dateKey] = { responses: 0, totalRating: 0 }
  }

  // Aggregate responses by date
  responses.forEach(response => {
    const date = new Date(response.created_at).toISOString().split('T')[0]
    if (trends[date]) {
      trends[date].responses += 1
      trends[date].totalRating += response.rating
    }
  })

  // Convert to array format
  return Object.entries(trends).map(([date, data]) => ({
    date,
    responses: data.responses,
    averageRating: data.responses > 0 ? Math.round((data.totalRating / data.responses) * 100) / 100 : 0
  }))
}

function extractTopKeywords(responses: RealtimeResponse[], limit: number = 10): string[] {
  const keywordCounts = extractKeywordCounts(responses)
  
  // Sort by count and return top keywords
  return Object.entries(keywordCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([keyword]) => keyword)
}

function extractKeywordCounts(responses: RealtimeResponse[]): { [key: string]: number } {
  const keywordCounts: { [key: string]: number } = {}
  
  responses.forEach(response => {
    if (response.keywords && Array.isArray(response.keywords)) {
      response.keywords.forEach(keyword => {
        const normalizedKeyword = keyword.toLowerCase().trim()
        if (normalizedKeyword) {
          keywordCounts[normalizedKeyword] = (keywordCounts[normalizedKeyword] || 0) + 1
        }
      })
    }
  })

  return keywordCounts
}

export function getDefaultFilters(): ResponseFilters {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30) // Last 30 days

  return {
    dateRange: {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    },
    ratingFilter: null,
    sentimentFilter: null,
    searchQuery: '',
    surveyFilter: null,
    includeAudio: true,
    includeText: true,
    isFlagged: null,
    isAddressed: null
  }
}

export function formatDateRange(dateRange: { start: string; end: string }): string {
  const start = new Date(dateRange.start)
  const end = new Date(dateRange.end)
  
  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  
  return `${startStr} - ${endStr}`
}
