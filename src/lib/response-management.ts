import { RealtimeResponse, ResponseFilters } from '@/types'

// Response management actions
export type ResponseAction = 
  | 'mark_addressed'
  | 'unmark_addressed'
  | 'flag'
  | 'unflag'
  | 'mark_spam'
  | 'unmark_spam'
  | 'update_notes'
  | 'delete'

export interface ResponseActionData {
  action: ResponseAction
  data?: any
}

// API functions for response management
export async function updateResponse(responseId: string, action: ResponseAction, data?: any) {
  try {
    const response = await fetch(`/api/responses/${responseId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, data }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update response')
    }

    return await response.json()
  } catch (error) {
    console.error('Error updating response:', error)
    throw error
  }
}

export async function deleteResponse(responseId: string) {
  try {
    const response = await fetch(`/api/responses/${responseId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete response')
    }

    return await response.json()
  } catch (error) {
    console.error('Error deleting response:', error)
    throw error
  }
}

export async function exportResponses(businessId: string, filters?: Partial<ResponseFilters>) {
  try {
    const params = new URLSearchParams()
    params.set('business_id', businessId)

    if (filters?.dateRange) {
      if (filters.dateRange.start) params.set('start_date', filters.dateRange.start)
      if (filters.dateRange.end) params.set('end_date', filters.dateRange.end)
    }
    if (filters?.ratingFilter && filters.ratingFilter.length > 0) {
      params.set('ratings', filters.ratingFilter.join(','))
    }
    if (filters?.sentimentFilter && filters.sentimentFilter.length > 0) {
      params.set('sentiments', filters.sentimentFilter.join(','))
    }
    if (filters?.searchQuery) {
      params.set('search', filters.searchQuery)
    }
    if (filters?.surveyFilter && filters.surveyFilter.length > 0) {
      // API expects QR codes list as `qrs`
      params.set('qrs', filters.surveyFilter.join(','))
    }

    const response = await fetch(`/api/responses/export?${params.toString()}`, {
      method: 'GET'
    })

    if (!response.ok) {
      // Try to parse error JSON, otherwise use status text
      let message = response.statusText || 'Failed to export responses'
      try {
        const errJson = await response.json()
        message = errJson.error || message
      } catch {}
      throw new Error(message)
    }

    // Get the filename from the Content-Disposition header
    const contentDisposition = response.headers.get('Content-Disposition')
    const filename = contentDisposition
      ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
      : `responses-${new Date().toISOString().split('T')[0]}.csv`

    // Create blob and download
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    return { success: true, filename }
  } catch (error) {
    console.error('Error exporting responses:', error)
    throw error
  }
}

// Utility functions for response data
export function getResponseStatus(response: RealtimeResponse) {
  const status = []
  
  if (response.is_spam) status.push('Spam')
  if (response.is_flagged) status.push('Flagged')
  if (response.is_addressed) status.push('Addressed')
  
  return status.length > 0 ? status.join(', ') : 'Normal'
}

export function getResponsePriority(response: RealtimeResponse): 'high' | 'medium' | 'low' {
  if (response.is_spam) return 'low'
  if (response.is_flagged) return 'high'
  if (response.rating <= 2) return 'high'
  if (response.rating <= 3) return 'medium'
  return 'low'
}

export function formatResponseForExport(response: RealtimeResponse) {
  return {
    id: response.id,
    rating: response.rating,
    sentiment: response.sentiment,
    sentimentScore: response.sentiment_score,
    transcription: response.transcription || '',
    hasAudio: !!response.audio_url,
    audioUrl: response.audio_url || '',
    keywords: response.keywords?.join(', ') || '',
    language: response.language || '',
    ipAddress: response.ip_address || '',
    userAgent: response.user_agent || '',
    createdAt: response.created_at,
    processedAt: response.processed_at || '',
    isSpam: response.is_spam,
    status: getResponseStatus(response),
    priority: getResponsePriority(response)
  }
}

// Batch operations
export async function batchUpdateResponses(
  responseIds: string[], 
  action: ResponseAction, 
  data?: any
) {
  const results = await Promise.allSettled(
    responseIds.map(id => updateResponse(id, action, data))
  )

  const successful = results.filter(result => result.status === 'fulfilled').length
  const failed = results.filter(result => result.status === 'rejected').length

  return { successful, failed, results }
}

export async function batchDeleteResponses(responseIds: string[]) {
  const results = await Promise.allSettled(
    responseIds.map(id => deleteResponse(id))
  )

  const successful = results.filter(result => result.status === 'fulfilled').length
  const failed = results.filter(result => result.status === 'rejected').length

  return { successful, failed, results }
}
