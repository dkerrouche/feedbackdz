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

    // Rating filter
    if (filters.rating !== null && response.rating !== filters.rating) {
      return false;
    }

    // Sentiment filter
    if (filters.sentiment && response.sentiment !== filters.sentiment) {
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

    // Audio filter
    if (filters.hasAudio !== null) {
      const hasAudio = response.audio_url !== null;
      if (hasAudio !== filters.hasAudio) {
        return false;
      }
    }

    // Flagged filter
    if (filters.isFlagged !== null) {
      // This would need to be added to the response data structure
      // For now, we'll skip this filter
    }

    // Addressed filter
    if (filters.isAddressed !== null) {
      // This would need to be added to the response data structure
      // For now, we'll skip this filter
    }

    return true;
  });
}

export function getDefaultFilters(): ResponseFilters {
  return {
    search: '',
    rating: null,
    sentiment: null,
    dateRange: null,
    hasAudio: null,
    isFlagged: null,
    isAddressed: null
  };
}

export function getFilteredCount(responses: RealtimeResponse[], filters: ResponseFilters): number {
  return filterResponses(responses, filters).length;
}
