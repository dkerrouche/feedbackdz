'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import BusinessProfile from '@/components/business/BusinessProfile'
import SurveyGenerator from '@/components/survey/SurveyGenerator'
import AnalyticsCards from '@/components/dashboard/AnalyticsCards'
import ResponseFeed from '@/components/dashboard/ResponseFeed'
import DashboardCharts from '@/components/dashboard/DashboardCharts'
import ResponseFiltersComponent from '@/components/dashboard/ResponseFilters'
import FilterChips from '@/components/dashboard/FilterChips'
import { supabase } from '@/lib/supabase'
import QrViewer from '@/components/survey/QrViewer'
import { useRealtimeResponses } from '@/hooks/useRealtimeResponses'
import { getDefaultFilters } from '@/lib/analytics'
import { parseFiltersFromURL, buildURLFromFilters, buildQueryString, removeFilter } from '@/lib/url-state'
import { exportResponses } from '@/lib/response-management'
import { Business, AnalyticsData, RealtimeResponse, type ResponseFilters } from '@/types'
import { AlertTriangle, CheckCircle } from 'lucide-react'

export default function DashboardContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // URL-based filter state
  const filters = useMemo(() => {
    const parsed = parseFiltersFromURL(searchParams)
    console.log('🔍 Parsed filters from URL:', parsed) // Debug log
    console.log('🔍 Current search params:', searchParams.toString()) // Debug log
    return parsed
  }, [searchParams])
  
  // Component state
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
  const [exportLoading, setExportLoading] = useState(false)

  // Filter management functions with debouncing
  const updateFilters = useCallback((newFilters: ResponseFilters) => {
    const url = buildURLFromFilters(newFilters)
    console.log('🔄 Updating filters, new URL:', url) // Debug log
    router.push(url, { scroll: false })
    // Reset pagination when filters change
    setResponsesPage(1)
  }, [router])

  const handleRemoveFilter = useCallback((filterKey: keyof ResponseFilters, value?: any) => {
    const newFilters = removeFilter(filters, filterKey, value)
    updateFilters(newFilters)
  }, [filters, updateFilters])

  const handleClearAllFilters = useCallback(() => {
    updateFilters(getDefaultFilters())
  }, [updateFilters])

  const handleExport = useCallback(async () => {
    if (!business?.id) return
    try {
      setExportLoading(true)
      await exportResponses(business.id, filters)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setExportLoading(false)
    }
  }, [business?.id, filters])

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

  // Fetch analytics from server with filters
  const fetchAnalytics = useCallback(async () => {
    if (!business?.id) return
    try {
      setAnalyticsLoading(true)
      const queryString = buildQueryString(filters, { business_id: business.id })
      const res = await fetch(`/api/analytics?${queryString}`)
      if (!res.ok) throw new Error('Failed to load analytics')
      const json = await res.json()
      if (json?.analytics) {
        setAnalytics(json.analytics)
      }
    } catch (err) {
      console.error('Failed to load analytics:', err)
    } finally {
      setAnalyticsLoading(false)
    }
  }, [business?.id, filters])

  // Load analytics when business or filters change
  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  // Load responses list from server (paginated with filters)
  const loadResponsesList = useCallback(async () => {
    if (!business?.id) return
    try {
      setResponsesListLoading(true)
      const queryString = buildQueryString(filters, {
        business_id: business.id,
        page: String(responsesPage),
        limit: String(responsesLimit)
      })
      const res = await fetch(`/api/responses?${queryString}`)
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
  }, [business?.id, filters, responsesPage, responsesLimit])

  useEffect(() => {
    loadResponsesList()
  }, [loadResponsesList])

  const handleBusinessCreated = (newBusiness: Business) => {
    setBusiness(newBusiness)
    setActiveTab('overview')
    if (newBusiness?.id) {
      loadSurveys(newBusiness.id)
    }
  }

  const handleSurveyCreated = (survey: any) => {
    setSurveys(prev => [...prev, survey])
    setActiveTab('overview')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {business ? `${business.name} Dashboard` : 'Dashboard'}
              </h1>
              <p className="mt-2 text-gray-600">
                {business 
                  ? `Manage your feedback and analytics for ${business.name}`
                  : 'Welcome! Set up your business profile to get started.'
                }
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex space-x-1">
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
                  value={filters.dateRange.start}
                  onChange={(e) => updateFilters({ ...filters, dateRange: { ...filters.dateRange, start: e.target.value } })}
                  className="px-3 py-2 rounded-lg text-sm border border-gray-200"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => updateFilters({ ...filters, dateRange: { ...filters.dateRange, end: e.target.value } })}
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
        </div>

        {!business && (
          <div className="mb-8 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
            <p className="text-sm">
              👋 Welcome! Please set up your business profile first to start collecting feedback.
            </p>
          </div>
        )}

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

            {/* Filter Chips */}
            <FilterChips
              filters={filters}
              onRemoveFilter={handleRemoveFilter}
              onClearAll={handleClearAllFilters}
              className="mb-6"
            />

            {/* Debug: Test Filter Button */}
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 mb-2">Debug: Current URL params: {searchParams.toString()}</p>
              <button
                onClick={() => {
                  const testFilters = { ...filters, searchQuery: 'test-' + Date.now() }
                  updateFilters(testFilters)
                }}
                className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
              >
                Test Filter Update
              </button>
            </div>

            {/* Response Filters */}
            <ResponseFiltersComponent
              filters={filters}
              onFiltersChange={updateFilters}
              totalResponses={responsesTotal}
              filteredCount={responseItems.length}
              availableQRs={surveys}
              onExport={handleExport}
              isLoading={responsesListLoading || analyticsLoading || exportLoading}
            />

            {/* Analytics Cards */}
            <AnalyticsCards 
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
              } as any}
              loading={responsesLoading}
            />

            {/* Surveys */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Your Surveys
              </h3>
              {surveys.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {surveys.map((survey, index) => (
                    <div key={survey.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">Survey #{index + 1}</h4>
                          <p className="text-sm text-gray-600 mt-1">{survey.questions?.length || 0} questions</p>
                          <p className="text-xs text-gray-500 mt-2">QR: {survey.qr_code}</p>
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
              onResponseMutated={(id, updates) => {
                setResponseItems(prev => prev.map(r => r.id === id ? { ...r, ...(updates as any) } : r))
              }}
              onResponseClick={(response) => {
                console.log('Response clicked:', response)
                // TODO: Open response detail modal
              }}
              onResponsesChange={() => {
                // Optional: can be used to refetch if needed
                // loadResponsesList()
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
    </div>
  )
}
