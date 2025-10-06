'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import BusinessProfile from '@/components/business/BusinessProfile'
import SurveyGenerator from '@/components/survey/SurveyGenerator'
import AnalyticsCards from '@/components/dashboard/AnalyticsCards'
import ResponseFeed from '@/components/dashboard/ResponseFeed'
import DashboardCharts from '@/components/dashboard/DashboardCharts'
import { supabase } from '@/lib/supabase'
import QrViewer from '@/components/survey/QrViewer'
import { useRealtimeResponses } from '@/hooks/useRealtimeResponses'
import { calculateAnalytics, getDefaultFilters } from '@/lib/analytics'
import { Business, AnalyticsData, RealtimeResponse } from '@/types'
import { AlertTriangle, CheckCircle } from 'lucide-react'

export default function Dashboard() {
  const [business, setBusiness] = useState<Business | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'create-survey'>('overview')
  const [surveys, setSurveys] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [responseItems, setResponseItems] = useState<RealtimeResponse[]>([])
  const [responsesTotal, setResponsesTotal] = useState(0)
  const [responsesPage, setResponsesPage] = useState(1)
  const [responsesLimit, setResponsesLimit] = useState(20)
  const [responsesListLoading, setResponsesListLoading] = useState(false)
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>(() => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 30)
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    }
  })

  // Real-time responses hook
  const {
    responses,
    loading: responsesLoading,
    error: responsesError,
    isConnected
  } = useRealtimeResponses({ 
    businessId: business?.id || null,
    enabled: activeTab === 'overview'
  })

  useEffect(() => {
    loadBusinessProfile()
  }, [])

  const loadBusinessProfile = async () => {
    try {
      setLoading(true)
      
      // Check if there's any business with the default phone
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('phone', '+213123456789')
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error loading business:', error)
      }

      if (data) {
        setBusiness(data)
        console.log('✅ Business loaded:', data.name)
      }
      
    } catch (err: any) {
      console.error('❌ Error loading business profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadSurveys = async (businessId: string) => {
    try {
      const res = await fetch(`/api/surveys?business_id=${encodeURIComponent(businessId)}`)
      const data = await res.json()
      if (!res.ok) {
        console.error('❌ Failed to load surveys:', data.error)
        return
      }
      setSurveys(data.surveys || [])
    } catch (err) {
      console.error('❌ Error fetching surveys:', err)
    }
  }

  useEffect(() => {
    if (business?.id) {
      loadSurveys(business.id)
    }
  }, [business?.id])

  // Calculate analytics when responses change
  useEffect(() => {
    // Fetch server analytics for accuracy; fallback to client calc if needed
    const fetchAnalytics = async () => {
      if (!business?.id) return
      try {
        setAnalyticsLoading(true)
        const params = new URLSearchParams({
          business_id: business.id,
          start_date: dateRange.start,
          end_date: dateRange.end
        })
        const res = await fetch(`/api/analytics?${params.toString()}`)
        if (!res.ok) throw new Error('Failed to load analytics')
        const json = await res.json()
        if (json?.analytics) {
          setAnalytics(json.analytics)
          return
        }
      } catch (err) {
        // Fallback to client-side calculation
        const calculatedAnalytics = calculateAnalytics(responses, getDefaultFilters())
        setAnalytics(calculatedAnalytics)
      } finally {
        setAnalyticsLoading(false)
      }
    }

    // Trigger when responses update (new data) or date range changes
    fetchAnalytics()
  }, [business?.id, responses, responsesLoading, dateRange.start, dateRange.end])

  // Load responses list from server (paginated)
  useEffect(() => {
    const loadResponsesList = async () => {
      if (!business?.id) return
      try {
        setResponsesListLoading(true)
        const params = new URLSearchParams({
          business_id: business.id,
          page: String(responsesPage),
          limit: String(responsesLimit),
          start_date: dateRange.start,
          end_date: dateRange.end
        })
        const res = await fetch(`/api/responses?${params.toString()}`)
        const json = await res.json()
        if (!res.ok) {
          console.error('❌ Failed to load responses list:', json?.error)
          return
        }
        setResponseItems(json.items || [])
        setResponsesTotal(json.total || 0)
      } catch (err) {
        console.error('❌ Error loading responses list:', err)
      } finally {
        setResponsesListLoading(false)
      }
    }

    loadResponsesList()
  }, [business?.id, responsesPage, responsesLimit, dateRange.start, dateRange.end])

  const handleBusinessCreated = (newBusiness: Business) => {
    setBusiness(newBusiness)
    setActiveTab('overview')
    if (newBusiness?.id) {
      loadSurveys(newBusiness.id)
    }
  }

  const handleSurveyCreated = (survey: any) => {
    setSurveys(prev => [survey.survey || survey, ...prev])
    setActiveTab('overview')
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Dashboard
              </h1>
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    activeTab === 'overview'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    activeTab === 'profile'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  Business Profile
                </button>
                <button
                  onClick={() => setActiveTab('create-survey')}
                  disabled={!business}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    activeTab === 'create-survey'
                      ? 'bg-blue-600 text-white'
                      : business
                      ? 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-100'
                  }`}
                >
                  Create Survey {!business && '(Need Business Profile)'}
                </button>
                {/* Date range controls (simple) */}
                <div className="hidden sm:flex items-center space-x-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="px-3 py-2 rounded-lg text-sm border border-gray-200"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="px-3 py-2 rounded-lg text-sm border border-gray-200"
                  />
                  <button
                    onClick={() => {
                      // Force refresh analytics
                      setAnalyticsLoading(true)
                      setTimeout(() => setAnalyticsLoading(false), 300)
                    }}
                    className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </div>
            <p className="text-gray-700">
              Welcome to your FeedbackDZ dashboard! Manage your business profile and collect customer feedback.
            </p>
          </div>

          {/* Business Profile Tab */}
          {activeTab === 'profile' && (
            <BusinessProfile onBusinessCreated={handleBusinessCreated} />
          )}

          {/* Create Survey Tab */}
          {activeTab === 'create-survey' && business && (
            <SurveyGenerator
              business={business}
              onSurveyCreated={handleSurveyCreated}
              onCancel={() => setActiveTab('overview')}
            />
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Real-time Connection Status */}
              {responsesError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Connection error: {responsesError}</span>
                  </div>
                </div>
              )}

              {isConnected && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Real-time updates active</span>
                  </div>
                </div>
              )}

              {/* Analytics Cards */}
              <AnalyticsCards 
                analytics={analytics || {
                  totalResponses: 0,
                  averageRating: 0,
                  sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
                  trends: [],
                  recentResponses: [],
                  responseRate: 0,
                  topKeywords: []
                }}
                loading={responsesLoading}
              />

              {/* Surveys */}
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Your Surveys
                </h3>
                {surveys.length > 0 ? (
                  <div className="space-y-4">
                    {surveys.map((survey, index) => (
                      <div key={survey.id || index} className="p-4 border border-gray-200 rounded-lg bg-white">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">Survey #{index + 1}</h4>
                            <p className="text-sm text-gray-600">QR Code: {survey.qr_code}</p>
                            <p className="text-sm text-gray-600">
                              {survey.questions?.length || 0} questions • {survey.languages?.join(', ') || 'No languages'}
                            </p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <QrViewer value={`${typeof window !== 'undefined' && window.location.origin ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || '')}/s/${survey.qr_code}`} label={`survey-${index + 1}`} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-700">
                    <p>No surveys yet. Create your first survey to start collecting feedback!</p>
                    {business && (
                      <button 
                        onClick={() => setActiveTab('create-survey')}
                        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 shadow-sm"
                      >
                        Create Survey
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Charts Section */}
              <DashboardCharts 
                analytics={analytics || {
                  totalResponses: 0,
                  averageRating: 0,
                  sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
                  trends: [],
                  recentResponses: [],
                  responseRate: 0,
                  topKeywords: [],
                  ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                  keywordCounts: {}
                }}
                loading={analyticsLoading}
              />

              {/* Recent Responses */}
              <ResponseFeed 
                responses={responseItems}
                loading={responsesListLoading}
                businessId={business?.id}
                onResponseClick={(response) => {
                  console.log('Response clicked:', response)
                  // TODO: Open response detail modal
                }}
                onResponsesChange={() => {
                  // Refresh responses when they change
                  // The real-time hook will automatically update
                }}
              />

              {/* Pagination Controls */}
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Page {responsesPage} • Showing {responseItems.length} of {responsesTotal}
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => setResponsesPage(prev => Math.max(prev - 1, 1))}
                    disabled={responsesPage <= 1 || responsesListLoading}
                    className={`px-3 py-2 rounded-lg text-sm border ${responsesPage <= 1 || responsesListLoading ? 'text-gray-400 bg-gray-50 border-gray-100 cursor-not-allowed' : 'text-gray-900 bg-gray-100 border-gray-200 hover:bg-gray-200'}`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => {
                      const maxPage = Math.max(1, Math.ceil(responsesTotal / responsesLimit))
                      setResponsesPage(prev => Math.min(prev + 1, maxPage))
                    }}
                    disabled={responsesListLoading || responseItems.length < responsesLimit || (responsesPage * responsesLimit) >= responsesTotal}
                    className={`px-3 py-2 rounded-lg text-sm border ${responsesListLoading || responseItems.length < responsesLimit || (responsesPage * responsesLimit) >= responsesTotal ? 'text-gray-400 bg-gray-50 border-gray-100 cursor-not-allowed' : 'text-gray-900 bg-gray-100 border-gray-200 hover:bg-gray-200'}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  )
}