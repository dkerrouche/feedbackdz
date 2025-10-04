'use client'

import { RealtimeResponse } from '@/types'
import { formatDistanceToNow } from 'date-fns'

interface ResponseFeedProps {
  responses: RealtimeResponse[]
  loading?: boolean
  onResponseClick?: (response: RealtimeResponse) => void
}

export default function ResponseFeed({ 
  responses, 
  loading = false, 
  onResponseClick 
}: ResponseFeedProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Responses</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (responses.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Responses</h3>
        <div className="text-center py-8 text-gray-700">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📝</span>
          </div>
          <p>No responses yet. Share your QR code to start collecting feedback!</p>
        </div>
      </div>
    )
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50 border-green-200'
      case 'negative': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    }
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600'
    if (rating >= 3) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Responses</h3>
      <div className="space-y-4">
        {responses.map((response) => (
          <div
            key={response.id}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => onResponseClick?.(response)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getSentimentColor(response.sentiment)}`}>
                  {response.sentiment}
                </div>
                <div className={`text-lg font-bold ${getRatingColor(response.rating)}`}>
                  {response.rating}⭐
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(response.created_at), { addSuffix: true })}
              </div>
            </div>

            {response.transcription && (
              <p className="text-gray-900 text-sm mb-2 line-clamp-2">
                {response.transcription}
              </p>
            )}

            {response.keywords && response.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {response.keywords.slice(0, 3).map((keyword, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {keyword}
                  </span>
                ))}
                {response.keywords.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{response.keywords.length - 3} more
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-4">
                <span>Language: {response.language || 'Unknown'}</span>
                {response.audio_url && (
                  <span className="flex items-center space-x-1">
                    <span>🎤</span>
                    <span>Voice</span>
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span>ID: {response.id.slice(0, 8)}...</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
