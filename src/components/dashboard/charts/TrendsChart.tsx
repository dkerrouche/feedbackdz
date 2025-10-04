'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { AnalyticsData } from '@/types'
import { format, parseISO } from 'date-fns'

interface TrendsChartProps {
  data: AnalyticsData
  loading?: boolean
  className?: string
}

export default function TrendsChart({ data, loading = false, className = '' }: TrendsChartProps) {
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

  const trendsData = data.trends?.map(trend => ({
    ...trend,
    formattedDate: format(parseISO(trend.date), 'MMM dd'),
    fullDate: format(parseISO(trend.date), 'MMM dd, yyyy')
  })) || []

  if (trendsData.length === 0) {
    return (
      <div className={`bg-white rounded-xl p-6 border border-gray-100 shadow-sm ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Trends</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">📈</span>
            </div>
            <p>No trend data available</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-xl p-6 border border-gray-100 shadow-sm ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Trends</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="formattedDate" 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              labelFormatter={(value, payload) => {
                const data = payload?.[0]?.payload
                return data ? data.fullDate : value
              }}
              formatter={(value: number, name: string) => [
                value, 
                name === 'responses' ? 'Responses' : 'Avg Rating'
              ]}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend 
              formatter={(value) => (
                <span className="text-sm text-gray-600">
                  {value === 'responses' ? 'Responses' : 'Average Rating'}
                </span>
              )}
            />
            <Line 
              type="monotone" 
              dataKey="responses" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="averageRating" 
              stroke="#22c55e" 
              strokeWidth={2}
              dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#22c55e', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex justify-between text-sm text-gray-500">
        <span>Last {trendsData.length} days</span>
        <span>Total: {data.totalResponses} responses</span>
      </div>
    </div>
  )
}
