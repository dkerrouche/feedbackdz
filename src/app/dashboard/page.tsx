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
    if (responses.length > 0) {
      const calculatedAnalytics = calculateAnalytics(responses, getDefaultFilters())
      setAnalytics(calculatedAnalytics)
    } else if (responses.length === 0 && !responsesLoading) {
      // Reset analytics when no responses
      setAnalytics({
        totalResponses: 0,
        averageRating: 0,
        sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
        trends: [],
        recentResponses: [],
        responseRate: 0,
        topKeywords: [],
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        keywordCounts: {}
      })
    }
  }, [responses, responsesLoading])

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
                responses={responses}
                loading={responsesLoading}
                onResponseClick={(response) => {
                  console.log('Response clicked:', response)
                  // TODO: Open response detail modal
                }}
              />
            </>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  )
}