'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { AnalyticsData } from '@/types'

interface SentimentChartProps {
  data: AnalyticsData
  loading?: boolean
  className?: string
}

const SENTIMENT_COLORS = {
  positive: '#22c55e', // green-500
  neutral: '#6b7280',  // gray-500
  negative: '#ef4444'  // red-500
}

export default function SentimentChart({ data, loading = false, className = '' }: SentimentChartProps) {
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

  const sentimentData = [
    { 
      name: 'Positive', 
      value: data.sentimentBreakdown.positive, 
      color: SENTIMENT_COLORS.positive,
      percentage: data.sentimentBreakdown.positive > 0 
        ? Math.round((data.sentimentBreakdown.positive / data.totalResponses) * 100)
        : 0
    },
    { 
      name: 'Neutral', 
      value: data.sentimentBreakdown.neutral, 
      color: SENTIMENT_COLORS.neutral,
      percentage: data.sentimentBreakdown.neutral > 0 
        ? Math.round((data.sentimentBreakdown.neutral / data.totalResponses) * 100)
        : 0
    },
    { 
      name: 'Negative', 
      value: data.sentimentBreakdown.negative, 
      color: SENTIMENT_COLORS.negative,
      percentage: data.sentimentBreakdown.negative > 0 
        ? Math.round((data.sentimentBreakdown.negative / data.totalResponses) * 100)
        : 0
    }
  ].filter(item => item.value > 0)

  const totalResponses = data.totalResponses

  if (totalResponses === 0) {
    return (
      <div className={`bg-white rounded-xl p-6 border border-gray-100 shadow-sm ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Analysis</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">😊</span>
            </div>
            <p>No sentiment data available</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-xl p-6 border border-gray-100 shadow-sm ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Analysis</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={sentimentData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {sentimentData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number, name: string, props: any) => [
                `${value} responses (${props.payload.percentage}%)`, 
                name
              ]}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value) => (
                <span className="text-sm text-gray-600">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        {sentimentData.map((item) => (
          <div key={item.name} className="flex flex-col items-center">
            <div 
              className="w-4 h-4 rounded-full mb-1"
              style={{ backgroundColor: item.color }}
            ></div>
            <div className="text-sm font-medium text-gray-900">{item.percentage}%</div>
            <div className="text-xs text-gray-500">{item.name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
