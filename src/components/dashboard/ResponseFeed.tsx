'use client'

import React, { useState } from 'react'
import { RealtimeResponse, ResponseFilters } from '@/types'
import { FileText } from 'lucide-react'
import ResponseItem from './ResponseItem'
import ResponseFiltersComponent from './ResponseFilters'
import ResponseDetailModal from './ResponseDetailModal'
import { filterResponses, getDefaultFilters, getFilteredCount } from '@/lib/response-filters'

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
  const [filters, setFilters] = useState<ResponseFilters>(getDefaultFilters())
  const [selectedResponse, setSelectedResponse] = useState<RealtimeResponse | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredResponses = filterResponses(responses, filters)
  const filteredCount = getFilteredCount(responses, filters)

  const handleMarkAddressed = (responseId: string) => {
    // TODO: Implement API call to mark response as addressed
    console.log('Mark as addressed:', responseId)
  }

  const handleFlag = (responseId: string) => {
    // TODO: Implement API call to flag response
    console.log('Flag response:', responseId)
  }

  const handleDelete = (responseId: string) => {
    // TODO: Implement API call to delete response
    console.log('Delete response:', responseId)
  }

  const handleViewDetails = (response: RealtimeResponse) => {
    setSelectedResponse(response)
    setIsModalOpen(true)
    onResponseClick?.(response)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedResponse(null)
  }

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
            <FileText className="w-8 h-8 text-gray-600" />
          </div>
          <p>No responses yet. Share your QR code to start collecting feedback!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <ResponseFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        totalResponses={responses.length}
        filteredCount={filteredCount}
      />

      {/* Responses List */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Responses ({filteredCount})
        </h3>
        
        {filteredResponses.length === 0 ? (
          <div className="text-center py-8 text-gray-700">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-600" />
            </div>
            <p>No responses match your current filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredResponses.map((response) => (
              <ResponseItem
                key={response.id}
                response={response}
                onMarkAddressed={handleMarkAddressed}
                onFlag={handleFlag}
                onDelete={handleDelete}
                onViewDetails={handleViewDetails}
                isAddressed={false} // TODO: Get from response data
                isFlagged={false} // TODO: Get from response data
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <ResponseDetailModal
        response={selectedResponse}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onMarkAddressed={handleMarkAddressed}
        onFlag={handleFlag}
        onDelete={handleDelete}
        isAddressed={false} // TODO: Get from response data
        isFlagged={false} // TODO: Get from response data
      />
    </div>
  )
}
