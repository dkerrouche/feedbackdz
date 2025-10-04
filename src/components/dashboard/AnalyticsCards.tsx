'use client'

import { AnalyticsData } from '@/types'
import { BarChart3, Star, TrendingUp, Smile } from 'lucide-react'

interface AnalyticsCardsProps {
  analytics: AnalyticsData
  loading?: boolean
}

export default function AnalyticsCards({ analytics, loading = false }: AnalyticsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const { totalResponses, averageRating, sentimentBreakdown, responseRate } = analytics

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Responses */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Total Responses
            </h3>
            <p className="text-3xl font-extrabold text-blue-600">
              {totalResponses.toLocaleString()}
            </p>
            <p className="text-sm text-gray-700">All time</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Average Rating */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Average Rating
            </h3>
            <p className="text-3xl font-extrabold text-green-600">
              {averageRating > 0 ? averageRating.toFixed(1) : '-'}
            </p>
            <p className="text-sm text-gray-700">Out of 5 stars</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Star className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Response Rate */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Response Rate
            </h3>
            <p className="text-3xl font-extrabold text-purple-600">
              {responseRate > 0 ? `${responseRate.toFixed(1)}%` : '-'}
            </p>
            <p className="text-sm text-gray-700">QR scans to completion</p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Sentiment Overview */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Sentiment
            </h3>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">
                  {sentimentBreakdown.positive} positive
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-700">
                  {sentimentBreakdown.neutral} neutral
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-700">
                  {sentimentBreakdown.negative} negative
                </span>
              </div>
            </div>
          </div>
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <Smile className="w-6 h-6 text-orange-600" />
          </div>
        </div>
      </div>
    </div>
  )
}
