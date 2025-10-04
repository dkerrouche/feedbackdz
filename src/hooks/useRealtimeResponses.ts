'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { RealtimeResponse } from '@/types'

interface UseRealtimeResponsesProps {
  businessId: string | null
  enabled?: boolean
}

interface UseRealtimeResponsesReturn {
  responses: RealtimeResponse[]
  loading: boolean
  error: string | null
  isConnected: boolean
  addResponse: (response: RealtimeResponse) => void
  updateResponse: (id: string, updates: Partial<RealtimeResponse>) => void
  removeResponse: (id: string) => void
}

export function useRealtimeResponses({ 
  businessId, 
  enabled = true 
}: UseRealtimeResponsesProps): UseRealtimeResponsesReturn {
  const [responses, setResponses] = useState<RealtimeResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  // Load initial responses
  const loadInitialResponses = useCallback(async () => {
    if (!businessId || !enabled) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('responses')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (fetchError) {
        throw fetchError
      }

      setResponses(data || [])
    } catch (err: any) {
      console.error('Error loading initial responses:', err)
      setError(err.message || 'Failed to load responses')
    } finally {
      setLoading(false)
    }
  }, [businessId, enabled])

  // Setup real-time subscription
  useEffect(() => {
    if (!businessId || !enabled) return

    loadInitialResponses()

    const channel = supabase
      .channel('responses')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'responses',
          filter: `business_id=eq.${businessId}`
        },
        (payload) => {
          console.log('Realtime: New response received:', payload.new)
          const newResponse = payload.new as RealtimeResponse
          setResponses(prev => [newResponse, ...prev])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'responses',
          filter: `business_id=eq.${businessId}`
        },
        (payload) => {
          console.log('Realtime: Response updated:', payload.new)
          const updatedResponse = payload.new as RealtimeResponse
          setResponses(prev => 
            prev.map(response => 
              response.id === updatedResponse.id ? updatedResponse : response
            )
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'responses',
          filter: `business_id=eq.${businessId}`
        },
        (payload) => {
          console.log('Realtime: Response deleted:', payload.old)
          const deletedResponse = payload.old as RealtimeResponse
          setResponses(prev => 
            prev.filter(response => response.id !== deletedResponse.id)
          )
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status)
        setIsConnected(status === 'SUBSCRIBED')
        
        if (status === 'CHANNEL_ERROR') {
          setError('Failed to connect to real-time updates')
        } else if (status === 'TIMED_OUT') {
          setError('Connection timed out')
        } else if (status === 'CLOSED') {
          setIsConnected(false)
        }
      })

    return () => {
      console.log('🔌 Cleaning up real-time subscription')
      supabase.removeChannel(channel)
    }
  }, [businessId, enabled, loadInitialResponses])

  // Manual response management functions
  const addResponse = useCallback((response: RealtimeResponse) => {
    setResponses(prev => [response, ...prev])
  }, [])

  const updateResponse = useCallback((id: string, updates: Partial<RealtimeResponse>) => {
    setResponses(prev => 
      prev.map(response => 
        response.id === id ? { ...response, ...updates } : response
      )
    )
  }, [])

  const removeResponse = useCallback((id: string) => {
    setResponses(prev => prev.filter(response => response.id !== id))
  }, [])

  return {
    responses,
    loading,
    error,
    isConnected,
    addResponse,
    updateResponse,
    removeResponse
  }
}
