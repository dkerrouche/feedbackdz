'use client';

import React, { memo } from 'react';
import { RealtimeResponse } from '@/types';
import { 
  Star, 
  Clock, 
  MessageSquare, 
  Mic, 
  Flag, 
  CheckCircle, 
  Trash2, 
  Eye,
  ThumbsUp,
  ThumbsDown,
  Minus
} from 'lucide-react';

interface ResponseItemProps {
  response: RealtimeResponse;
  onMarkAddressed: (responseId: string) => void;
  onFlag: (responseId: string) => void;
  onDelete: (responseId: string) => void;
  onViewDetails: (response: RealtimeResponse) => void;
  isAddressed?: boolean;
  isFlagged?: boolean;
}

function ResponseItem({
  response,
  onMarkAddressed,
  onFlag,
  onDelete,
  onViewDetails,
  isAddressed = false,
  isFlagged = false
}: ResponseItemProps) {
  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const responseDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - responseDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <ThumbsUp className="w-4 h-4 text-green-500" />;
      case 'negative':
        return <ThumbsDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'negative':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
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
    <div className={`bg-white rounded-lg border p-4 hover:shadow-md transition-shadow ${
      isAddressed ? 'opacity-75 border-green-200 bg-green-50' : ''
    } ${isFlagged ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            {renderStars(response.rating)}
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getSentimentColor(response.sentiment)}`}>
            <div className="flex items-center space-x-1">
              {getSentimentIcon(response.sentiment)}
              <span className="capitalize">{response.sentiment}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>{formatTimeAgo(response.created_at)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="mb-3">
        {response.transcription && (
          <div className="flex items-start space-x-2 mb-2">
            {response.audio_url ? (
              <Mic className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            ) : (
              <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
            )}
            <p className="text-gray-700 text-sm leading-relaxed">
              {response.transcription}
            </p>
          </div>
        )}
        
        {response.keywords && response.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {response.keywords.slice(0, 5).map((keyword, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
              >
                {keyword}
              </span>
            ))}
            {response.keywords.length > 5 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{response.keywords.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onViewDetails(response)}
            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>View Details</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          {!isAddressed && (
            <button
              onClick={() => onMarkAddressed(response.id)}
              className="flex items-center space-x-1 text-sm text-green-600 hover:text-green-700 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Mark Addressed</span>
            </button>
          )}
          
          <button
            onClick={() => onFlag(response.id)}
            className={`flex items-center space-x-1 text-sm transition-colors ${
              isFlagged 
                ? 'text-red-600 hover:text-red-700' 
                : 'text-gray-600 hover:text-gray-700'
            }`}
          >
            <Flag className="w-4 h-4" />
            <span>{isFlagged ? 'Flagged' : 'Flag'}</span>
          </button>
          
          <button
            onClick={() => onDelete(response.id)}
            className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Memoize to prevent re-renders when parent re-renders but props haven't changed
export default memo(ResponseItem, (prevProps, nextProps) => {
  return (
    prevProps.response.id === nextProps.response.id &&
    prevProps.isAddressed === nextProps.isAddressed &&
    prevProps.isFlagged === nextProps.isFlagged &&
    prevProps.response.rating === nextProps.response.rating &&
    prevProps.response.sentiment === nextProps.response.sentiment &&
    prevProps.response.transcription === nextProps.response.transcription
  )
})
