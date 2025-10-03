'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import BusinessProfile from '@/components/business/BusinessProfile'
import { Business } from '@/types'

export default function Dashboard() {
  const [business, setBusiness] = useState<Business | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'profile'>('overview')

  const handleBusinessCreated = (newBusiness: Business) => {
    setBusiness(newBusiness)
    setActiveTab('overview')
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard
              </h1>
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'overview'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'profile'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Business Profile
                </button>
              </div>
            </div>
            <p className="text-gray-600">
              Welcome to your FeedbackDZ dashboard! Manage your business profile and collect customer feedback.
            </p>
          </div>

          {/* Business Profile Tab */}
          {activeTab === 'profile' && (
            <BusinessProfile onBusinessCreated={handleBusinessCreated} />
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Total Responses
                  </h3>
                  <p className="text-3xl font-bold text-blue-600">0</p>
                  <p className="text-sm text-gray-500">This month</p>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Average Rating
                  </h3>
                  <p className="text-3xl font-bold text-green-600">-</p>
                  <p className="text-sm text-gray-500">Out of 5 stars</p>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Response Rate
                  </h3>
                  <p className="text-3xl font-bold text-purple-600">-</p>
                  <p className="text-sm text-gray-500">QR scans to completion</p>
                </div>
              </div>

              {/* Recent Responses */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Recent Responses
                </h3>
                <div className="text-center py-8 text-gray-500">
                  <p>No responses yet. Create your first survey to start collecting feedback!</p>
                  {business && (
                    <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                      Create Survey
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  )
}