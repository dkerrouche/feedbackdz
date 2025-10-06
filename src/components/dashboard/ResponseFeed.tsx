'use client'

import React, { useState, memo } from 'react'
import { RealtimeResponse, ResponseFilters } from '@/types'
import { FileText } from 'lucide-react'
import ResponseItem from './ResponseItem'
import ResponseFiltersComponent from './ResponseFilters'
import ResponseDetailModal from './ResponseDetailModal'
import { filterResponses, getDefaultFilters, getFilteredCount } from '@/lib/response-filters'
import { updateResponse, deleteResponse, exportResponses } from '@/lib/response-management'

interface ResponseFeedProps {
  responses: RealtimeResponse[]
  loading?: boolean
  onResponseClick?: (response: RealtimeResponse) => void
  businessId?: string
  onResponsesChange?: () => void
  onResponseMutated?: (id: string, updates: Partial<RealtimeResponse>) => void
}

function ResponseFeed({ 
  responses, 
  loading = false, 
  onResponseClick,
  businessId,
  onResponsesChange,
  onResponseMutated
}: ResponseFeedProps) {
  const [filters, setFilters] = useState<ResponseFilters>(getDefaultFilters())
  const [selectedResponse, setSelectedResponse] = useState<RealtimeResponse | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredResponses = filterResponses(responses, filters)
  const filteredCount = getFilteredCount(responses, filters)

  const handleMarkAddressed = async (responseId: string, currentlyAddressed?: boolean) => {
    try {
      await updateResponse(responseId, currentlyAddressed ? 'unmark_addressed' : 'mark_addressed')
      onResponseMutated?.(responseId, {
        is_addressed: !currentlyAddressed,
        addressed_at: !currentlyAddressed ? new Date().toISOString() : null as any
      } as any)
    } catch (error) {
      console.error('Failed to mark response as addressed:', error)
      // TODO: Show error toast
    }
  }

  const handleFlag = async (responseId: string, currentlyFlagged?: boolean) => {
    try {
      await updateResponse(responseId, currentlyFlagged ? 'unflag' : 'flag')
      onResponseMutated?.(responseId, {
        is_flagged: !currentlyFlagged,
        flagged_at: !currentlyFlagged ? new Date().toISOString() : null as any
      } as any)
    } catch (error) {
      console.error('Failed to flag response:', error)
      // TODO: Show error toast
    }
  }

  const handleDelete = async (responseId: string) => {
    if (confirm('Are you sure you want to delete this response? This action cannot be undone.')) {
      try {
        await deleteResponse(responseId)
        onResponsesChange?.()
      } catch (error) {
        console.error('Failed to delete response:', error)
        // TODO: Show error toast
      }
    }
  }

  const handleExport = async () => {
    if (!businessId) {
      console.error('Business ID is required for export')
      return
    }

    try {
      await exportResponses(businessId, filters)
    } catch (error) {
      console.error('Failed to export responses:', error)
      // TODO: Show error toast
    }
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
        onExport={handleExport}
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
                onMarkAddressed={(id) => handleMarkAddressed(id, (response as any).is_addressed)}
                onFlag={(id) => handleFlag(id, (response as any).is_flagged)}
                onDelete={handleDelete}
                onViewDetails={handleViewDetails}
                isAddressed={(response as any).is_addressed === true}
                isFlagged={(response as any).is_flagged === true}
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
        onMarkAddressed={(id) => handleMarkAddressed(id, (selectedResponse as any)?.is_addressed)}
        onFlag={(id) => handleFlag(id, (selectedResponse as any)?.is_flagged)}
        onDelete={handleDelete}
        isAddressed={(selectedResponse as any)?.is_addressed === true}
        isFlagged={(selectedResponse as any)?.is_flagged === true}
      />
    </div>
  )
}

// Memoize the component to prevent unnecessary re-renders
export default memo(ResponseFeed, (prevProps, nextProps) => {
  // Only re-render if these specific props change
  const prevSig = JSON.stringify(
    prevProps.responses.map(r => `${r.id}:${(r as any).is_flagged ? 1 : 0}:${(r as any).is_addressed ? 1 : 0}`)
  )
  const nextSig = JSON.stringify(
    nextProps.responses.map(r => `${r.id}:${(r as any).is_flagged ? 1 : 0}:${(r as any).is_addressed ? 1 : 0}`)
  )

  return (
    prevProps.loading === nextProps.loading &&
    prevProps.businessId === nextProps.businessId &&
    prevProps.responses.length === nextProps.responses.length &&
    prevSig === nextSig
  )
})
