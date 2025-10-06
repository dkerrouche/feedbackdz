'use client'

import { X } from 'lucide-react'
import { ResponseFilters } from '@/types'
import { getFilterDisplayText, getActiveFilterCount, removeFilter } from '@/lib/url-state'

interface FilterChipsProps {
  filters: ResponseFilters
  onRemoveFilter: (filterKey: keyof ResponseFilters, value?: any) => void
  onClearAll: () => void
  className?: string
}

export default function FilterChips({
  filters,
  onRemoveFilter,
  onClearAll,
  className = ''
}: FilterChipsProps) {
  const activeFilterCount = getActiveFilterCount(filters)
  
  if (activeFilterCount === 0) {
    return null
  }

  const filterChips: Array<{
    key: keyof ResponseFilters
    label: string
    value?: any
  }> = []

  // Rating filters
  if (filters.ratingFilter && filters.ratingFilter.length > 0) {
    filters.ratingFilter.forEach(rating => {
      filterChips.push({
        key: 'ratingFilter',
        label: `${rating} star${rating !== 1 ? 's' : ''}`,
        value: rating
      })
    })
  }

  // Sentiment filters
  if (filters.sentimentFilter && filters.sentimentFilter.length > 0) {
    filters.sentimentFilter.forEach(sentiment => {
      filterChips.push({
        key: 'sentimentFilter',
        label: sentiment.charAt(0).toUpperCase() + sentiment.slice(1),
        value: sentiment
      })
    })
  }

  // Search query
  if (filters.searchQuery.trim()) {
    filterChips.push({
      key: 'searchQuery',
      label: `Search: "${filters.searchQuery.trim()}"`
    })
  }

  // QR codes
  if (filters.surveyFilter && filters.surveyFilter.length > 0) {
    if (filters.surveyFilter.length === 1) {
      filterChips.push({
        key: 'surveyFilter',
        label: `QR: ${filters.surveyFilter[0]}`,
        value: filters.surveyFilter[0]
      })
    } else {
      filterChips.push({
        key: 'surveyFilter',
        label: `${filters.surveyFilter.length} QR codes`
      })
    }
  }

  // Audio/Text filters
  if (!filters.includeAudio && filters.includeText) {
    filterChips.push({
      key: 'includeAudio',
      label: 'Text only'
    })
  } else if (filters.includeAudio && !filters.includeText) {
    filterChips.push({
      key: 'includeText',
      label: 'Audio only'
    })
  }

  // Flag filters
  if (filters.isFlagged === true) {
    filterChips.push({
      key: 'isFlagged',
      label: 'Flagged'
    })
  } else if (filters.isFlagged === false) {
    filterChips.push({
      key: 'isFlagged',
      label: 'Not flagged'
    })
  }

  if (filters.isAddressed === true) {
    filterChips.push({
      key: 'isAddressed',
      label: 'Addressed'
    })
  } else if (filters.isAddressed === false) {
    filterChips.push({
      key: 'isAddressed',
      label: 'Not addressed'
    })
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {/* Filter chips */}
      {filterChips.map((chip, index) => (
        <div
          key={`${chip.key}-${chip.value || index}`}
          className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
        >
          <span>{chip.label}</span>
          <button
            onClick={() => onRemoveFilter(chip.key, chip.value)}
            className="flex-shrink-0 ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
            aria-label={`Remove ${chip.label} filter`}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}

      {/* Clear all button */}
      {activeFilterCount > 1 && (
        <button
          onClick={onClearAll}
          className="inline-flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Clear all ({activeFilterCount})
        </button>
      )}
    </div>
  )
}
