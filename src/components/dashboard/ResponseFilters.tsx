'use client';

import React, { useState } from 'react';
import { ResponseFilters as FilterState } from '@/types';
import { 
  Search, 
  Filter, 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Minus, 
  Calendar,
  X,
  Mic,
  MessageSquare,
  Download
} from 'lucide-react';

interface ResponseFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  totalResponses: number;
  filteredCount: number;
  onExport?: () => void;
}

export default function ResponseFilters({
  filters,
  onFiltersChange,
  totalResponses,
  filteredCount,
  onExport
}: ResponseFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      rating: null,
      sentiment: null,
      dateRange: null,
      hasAudio: null,
      isFlagged: null,
      isAddressed: null
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== null && value !== '' && value !== undefined
  );

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <ThumbsUp className="w-4 h-4" />;
      case 'negative':
        return <ThumbsDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          {hasActiveFilters && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
              {filteredCount} of {totalResponses}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {onExport && (
            <button
              onClick={onExport}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          )}
          
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search responses..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Filters Grid */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <label key={rating} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    checked={filters.rating === rating}
                    onChange={() => handleFilterChange('rating', filters.rating === rating ? null : rating)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-1">
                    {renderStars(rating)}
                    <span className="text-sm text-gray-700">{rating} star{rating !== 1 ? 's' : ''}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Sentiment Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sentiment
            </label>
            <div className="space-y-2">
              {[
                { value: 'positive', label: 'Positive', color: 'text-green-600' },
                { value: 'neutral', label: 'Neutral', color: 'text-gray-600' },
                { value: 'negative', label: 'Negative', color: 'text-red-600' }
              ].map((sentiment) => (
                <label key={sentiment.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sentiment"
                    checked={filters.sentiment === sentiment.value}
                    onChange={() => handleFilterChange('sentiment', filters.sentiment === sentiment.value ? null : sentiment.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div className={`flex items-center space-x-1 ${sentiment.color}`}>
                    {getSentimentIcon(sentiment.value)}
                    <span className="text-sm">{sentiment.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Content Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Type
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="hasAudio"
                  checked={filters.hasAudio === true}
                  onChange={() => handleFilterChange('hasAudio', filters.hasAudio === true ? null : true)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div className="flex items-center space-x-1 text-blue-600">
                  <Mic className="w-4 h-4" />
                  <span className="text-sm">Audio</span>
                </div>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="hasAudio"
                  checked={filters.hasAudio === false}
                  onChange={() => handleFilterChange('hasAudio', filters.hasAudio === false ? null : false)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div className="flex items-center space-x-1 text-gray-600">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm">Text Only</span>
                </div>
              </label>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.isFlagged === true}
                  onChange={(e) => handleFilterChange('isFlagged', e.target.checked ? true : null)}
                  className="text-blue-600 focus:ring-blue-500 rounded"
                />
                <span className="text-sm text-red-600">Flagged</span>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.isAddressed === true}
                  onChange={(e) => handleFilterChange('isAddressed', e.target.checked ? true : null)}
                  className="text-blue-600 focus:ring-blue-500 rounded"
                />
                <span className="text-sm text-green-600">Addressed</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Showing {filteredCount} of {totalResponses} responses</span>
          {hasActiveFilters && (
            <span className="text-blue-600">Filters applied</span>
          )}
        </div>
      </div>
    </div>
  );
}
