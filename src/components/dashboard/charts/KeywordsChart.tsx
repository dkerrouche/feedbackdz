'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { AnalyticsData } from '@/types'

interface KeywordsChartProps {
  data: AnalyticsData
  loading?: boolean
  className?: string
}

export default function KeywordsChart({ data, loading = false, className = '' }: KeywordsChartProps) {
  if (loading) {
    return (
      <div className={`bg-white rounded-xl p-6 border border-gray-100 shadow-sm ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  // Process keywords data
  const keywordsData = data.topKeywords?.slice(0, 10).map((keyword, index) => ({
    keyword: keyword.length > 15 ? keyword.substring(0, 15) + '...' : keyword,
    fullKeyword: keyword,
    count: data.keywordCounts?.[keyword] || 0,
    rank: index + 1
  })) || []

  if (keywordsData.length === 0) {
    return (
      <div className={`bg-white rounded-xl p-6 border border-gray-100 shadow-sm ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Keywords</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">🔍</span>
            </div>
            <p>No keyword data available</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-xl p-6 border border-gray-100 shadow-sm ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Keywords</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={keywordsData} 
            layout="horizontal"
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              type="number"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              type="category"
              dataKey="keyword"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={100}
            />
            <Tooltip 
              formatter={(value: number, name: string, props: any) => [
                `${value} mentions`, 
                'Count'
              ]}
              labelFormatter={(value, payload) => {
                const data = payload?.[0]?.payload
                return data ? data.fullKeyword : value
              }}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar 
              dataKey="count" 
              fill="#3b82f6"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-center text-sm text-gray-500">
        Showing top {keywordsData.length} keywords
      </div>
    </div>
  )
}
