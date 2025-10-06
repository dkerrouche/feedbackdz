import { RealtimeResponse, ResponseFilters } from '@/types';

export function filterResponses(responses: RealtimeResponse[], filters: ResponseFilters): RealtimeResponse[] {
  return responses.filter(response => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        response.transcription?.toLowerCase().includes(searchLower) ||
        response.keywords?.some(keyword => keyword.toLowerCase().includes(searchLower)) ||
        response.language?.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Rating filter (multi-select)
    if (filters.ratings && filters.ratings.length > 0 && !filters.ratings.includes(response.rating)) {
      return false;
    }

    // Sentiment filter (multi-select)
    if (filters.sentiments && filters.sentiments.length > 0 && !filters.sentiments.includes(response.sentiment)) {
      return false;
    }

    // Date range filter
    if (filters.dateRange) {
      const responseDate = new Date(response.created_at);
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      
      if (responseDate < startDate || responseDate > endDate) {
        return false;
      }
    }

    // Content type filters (checkbox combine)
    if (filters.includeAudio === false && filters.includeText === false) {
      // none selected -> no results
      return false;
    }
    const hasAudio = !!response.audio_url
    const matchesAudio = hasAudio && filters.includeAudio
    const matchesText = !hasAudio && filters.includeText
    if (!matchesAudio && !matchesText) return false

    // Flagged filter
    if (filters.isFlagged !== null) {
      if (!!(response as any).is_flagged !== filters.isFlagged) return false
    }

    // Addressed filter
    if (filters.isAddressed !== null) {
      if (!!(response as any).is_addressed !== filters.isAddressed) return false
    }

    return true;
  });
}

export function getDefaultFilters(): ResponseFilters {
  return {
    search: '',
    ratings: [],
    sentiments: [],
    dateRange: null,
    includeAudio: true,
    includeText: true,
    isFlagged: null,
    isAddressed: null
  };
}

export function getFilteredCount(responses: RealtimeResponse[], filters: ResponseFilters): number {
  return filterResponses(responses, filters).length;
}
