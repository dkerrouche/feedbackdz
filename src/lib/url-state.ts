import { ResponseFilters } from '@/types'
import { getDefaultFilters } from './analytics'

/**
 * URL state management utilities for dashboard filters
 * Handles serialization/deserialization of filter state to/from URL parameters
 */

export function parseFiltersFromURL(searchParams: URLSearchParams): ResponseFilters {
  const defaults = getDefaultFilters()
  
  return {
    dateRange: {
      start: searchParams.get('start_date') || defaults.dateRange.start,
      end: searchParams.get('end_date') || defaults.dateRange.end
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
}

export function buildURLFromFilters(filters: ResponseFilters, basePath: string = '/dashboard'): string {
  const params = new URLSearchParams()
  
  // Date range
  if (filters.dateRange.start) params.set('start_date', filters.dateRange.start)
  if (filters.dateRange.end) params.set('end_date', filters.dateRange.end)
  
  // Rating filter
  if (filters.ratingFilter && filters.ratingFilter.length > 0) {
    params.set('ratings', filters.ratingFilter.join(','))
  }
  
  // Sentiment filter
  if (filters.sentimentFilter && filters.sentimentFilter.length > 0) {
    params.set('sentiments', filters.sentimentFilter.join(','))
  }
  
  // Search query
  if (filters.searchQuery.trim()) {
    params.set('search', filters.searchQuery.trim())
  }
  
  // Survey filter (QR codes)
  if (filters.surveyFilter && filters.surveyFilter.length > 0) {
    params.set('qrs', filters.surveyFilter.join(','))
  }
  
  // Audio/Text filters (only set if different from default)
  if (!filters.includeAudio) params.set('includeAudio', 'false')
  if (!filters.includeText) params.set('includeText', 'false')
  
  // Flag filters (only set if explicitly true or false)
  if (filters.isFlagged === true) params.set('isFlagged', 'true')
  if (filters.isFlagged === false) params.set('isFlagged', 'false')
  if (filters.isAddressed === true) params.set('isAddressed', 'true')
  if (filters.isAddressed === false) params.set('isAddressed', 'false')
  
  const queryString = params.toString()
  return queryString ? `${basePath}?${queryString}` : basePath
}

export function buildQueryString(filters: ResponseFilters, additionalParams?: Record<string, string | number>): string {
  const params = new URLSearchParams()
  
  // Date range
  if (filters.dateRange.start) params.set('start_date', filters.dateRange.start)
  if (filters.dateRange.end) params.set('end_date', filters.dateRange.end)
  
  // Rating filter
  if (filters.ratingFilter && filters.ratingFilter.length > 0) {
    params.set('ratings', filters.ratingFilter.join(','))
  }
  
  // Sentiment filter
  if (filters.sentimentFilter && filters.sentimentFilter.length > 0) {
    params.set('sentiments', filters.sentimentFilter.join(','))
  }
  
  // Search query
  if (filters.searchQuery.trim()) {
    params.set('search', filters.searchQuery.trim())
  }
  
  // Survey filter (QR codes)
  if (filters.surveyFilter && filters.surveyFilter.length > 0) {
    params.set('qrs', filters.surveyFilter.join(','))
  }
  
  // Audio/Text filters
  params.set('includeAudio', filters.includeAudio.toString())
  params.set('includeText', filters.includeText.toString())
  
  // Flag filters
  if (filters.isFlagged !== null) params.set('isFlagged', filters.isFlagged.toString())
  if (filters.isAddressed !== null) params.set('isAddressed', filters.isAddressed.toString())
  
  // Additional parameters (e.g., page, limit)
  if (additionalParams) {
    Object.entries(additionalParams).forEach(([key, value]) => {
      params.set(key, value.toString())
    })
  }
  
  return params.toString()
}

export function isDefaultFilters(filters: ResponseFilters): boolean {
  const defaults = getDefaultFilters()
  
  return (
    filters.dateRange.start === defaults.dateRange.start &&
    filters.dateRange.end === defaults.dateRange.end &&
    !filters.ratingFilter &&
    !filters.sentimentFilter &&
    !filters.searchQuery.trim() &&
    !filters.surveyFilter &&
    filters.includeAudio === defaults.includeAudio &&
    filters.includeText === defaults.includeText &&
    filters.isFlagged === defaults.isFlagged &&
    filters.isAddressed === defaults.isAddressed
  )
}

export function getActiveFilterCount(filters: ResponseFilters): number {
  let count = 0
  
  // Don't count date range as it always has a value
  if (filters.ratingFilter && filters.ratingFilter.length > 0) count++
  if (filters.sentimentFilter && filters.sentimentFilter.length > 0) count++
  if (filters.searchQuery.trim()) count++
  if (filters.surveyFilter && filters.surveyFilter.length > 0) count++
  if (!filters.includeAudio || !filters.includeText) count++
  if (filters.isFlagged !== null) count++
  if (filters.isAddressed !== null) count++
  
  return count
}

export function getFilterDisplayText(filters: ResponseFilters): string[] {
  const displayTexts: string[] = []
  
  if (filters.ratingFilter && filters.ratingFilter.length > 0) {
    displayTexts.push(`Ratings: ${filters.ratingFilter.join(', ')}`)
  }
  
  if (filters.sentimentFilter && filters.sentimentFilter.length > 0) {
    displayTexts.push(`Sentiment: ${filters.sentimentFilter.join(', ')}`)
  }
  
  if (filters.searchQuery.trim()) {
    displayTexts.push(`Search: "${filters.searchQuery.trim()}"`)
  }
  
  if (filters.surveyFilter && filters.surveyFilter.length > 0) {
    displayTexts.push(`QR Codes: ${filters.surveyFilter.length} selected`)
  }
  
  if (!filters.includeAudio && filters.includeText) {
    displayTexts.push('Text only')
  } else if (filters.includeAudio && !filters.includeText) {
    displayTexts.push('Audio only')
  }
  
  if (filters.isFlagged === true) {
    displayTexts.push('Flagged')
  } else if (filters.isFlagged === false) {
    displayTexts.push('Not flagged')
  }
  
  if (filters.isAddressed === true) {
    displayTexts.push('Addressed')
  } else if (filters.isAddressed === false) {
    displayTexts.push('Not addressed')
  }
  
  return displayTexts
}

export function removeFilter(filters: ResponseFilters, filterKey: keyof ResponseFilters, value?: any): ResponseFilters {
  const newFilters = { ...filters }
  
  switch (filterKey) {
    case 'ratingFilter':
      if (value !== undefined && newFilters.ratingFilter) {
        newFilters.ratingFilter = newFilters.ratingFilter.filter(r => r !== value)
        if (newFilters.ratingFilter.length === 0) newFilters.ratingFilter = null
      } else {
        newFilters.ratingFilter = null
      }
      break
      
    case 'sentimentFilter':
      if (value !== undefined && newFilters.sentimentFilter) {
        newFilters.sentimentFilter = newFilters.sentimentFilter.filter(s => s !== value)
        if (newFilters.sentimentFilter.length === 0) newFilters.sentimentFilter = null
      } else {
        newFilters.sentimentFilter = null
      }
      break
      
    case 'searchQuery':
      newFilters.searchQuery = ''
      break
      
    case 'surveyFilter':
      if (value !== undefined && newFilters.surveyFilter) {
        newFilters.surveyFilter = newFilters.surveyFilter.filter(s => s !== value)
        if (newFilters.surveyFilter.length === 0) newFilters.surveyFilter = null
      } else {
        newFilters.surveyFilter = null
      }
      break
      
    case 'includeAudio':
    case 'includeText':
      // Reset to default (both true)
      newFilters.includeAudio = true
      newFilters.includeText = true
      break
      
    case 'isFlagged':
      newFilters.isFlagged = null
      break
      
    case 'isAddressed':
      newFilters.isAddressed = null
      break
  }
  
  return newFilters
}
