'use client'

import { AnalyticsData } from '@/types'
import RatingChart from './charts/RatingChart'
import SentimentChart from './charts/SentimentChart'
import TrendsChart from './charts/TrendsChart'
import KeywordsChart from './charts/KeywordsChart'

interface DashboardChartsProps {
  analytics: AnalyticsData
  loading?: boolean
  className?: string
}

export default function DashboardCharts({ analytics, loading = false, className = '' }: DashboardChartsProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Distribution */}
        <RatingChart 
          data={analytics} 
          loading={loading}
          className="lg:col-span-1"
        />
        
        {/* Sentiment Analysis */}
        <SentimentChart 
          data={analytics} 
          loading={loading}
          className="lg:col-span-1"
        />
      </div>

      {/* Full Width Charts */}
      <div className="grid grid-cols-1 gap-6">
        {/* Response Trends */}
        <TrendsChart 
          data={analytics} 
          loading={loading}
          className="w-full"
        />
        
        {/* Top Keywords */}
        <KeywordsChart 
          data={analytics} 
          loading={loading}
          className="w-full"
        />
      </div>
    </div>
  )
}
