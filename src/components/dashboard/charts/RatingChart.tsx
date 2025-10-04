'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { AnalyticsData } from '@/types'

interface RatingChartProps {
  data: AnalyticsData
  loading?: boolean
  className?: string
}

const COLORS = {
  1: '#ef4444', // red-500
  2: '#f97316', // orange-500
  3: '#eab308', // yellow-500
  4: '#22c55e', // green-500
  5: '#3b82f6'  // blue-500
}

export default function RatingChart({ data, loading = false, className = '' }: RatingChartProps) {
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

  // Calculate rating distribution
  const ratingData = [
    { name: '1 Star', value: data.ratingDistribution?.[1] || 0, color: COLORS[1] },
    { name: '2 Stars', value: data.ratingDistribution?.[2] || 0, color: COLORS[2] },
    { name: '3 Stars', value: data.ratingDistribution?.[3] || 0, color: COLORS[3] },
    { name: '4 Stars', value: data.ratingDistribution?.[4] || 0, color: COLORS[4] },
    { name: '5 Stars', value: data.ratingDistribution?.[5] || 0, color: COLORS[5] }
  ].filter(item => item.value > 0)

  const totalResponses = ratingData.reduce((sum, item) => sum + item.value, 0)

  if (totalResponses === 0) {
    return (
      <div className={`bg-white rounded-xl p-6 border border-gray-100 shadow-sm ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">⭐</span>
            </div>
            <p>No rating data available</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-xl p-6 border border-gray-100 shadow-sm ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={ratingData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {ratingData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value} responses`, 'Count']}
              labelFormatter={(label) => `${label}`}
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
      <div className="mt-4 text-center text-sm text-gray-500">
        Total: {totalResponses} responses
      </div>
    </div>
  )
}
