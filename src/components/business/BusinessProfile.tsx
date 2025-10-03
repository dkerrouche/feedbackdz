'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Business } from '@/types'
import BusinessProfileForm from './BusinessProfileForm'

interface BusinessProfileProps {
  onBusinessCreated: (business: Business) => void
}

export default function BusinessProfile({ onBusinessCreated }: BusinessProfileProps) {
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadBusinessProfile()
  }, [])

  const loadBusinessProfile = async () => {
    try {
      setLoading(true)
      
      // For now, we'll check if there's any business with the default phone
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('phone', '+213123456789')
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      if (data) {
        setBusiness(data)
      } else {
        setShowForm(true)
      }
      
    } catch (err: any) {
      console.error('❌ Error loading business profile:', err)
      setError(err.message || 'Failed to load business profile')
    } finally {
      setLoading(false)
    }
  }

  const handleBusinessCreated = (newBusiness: Business) => {
    setBusiness(newBusiness)
    setShowForm(false)
    onBusinessCreated(newBusiness)
  }

  const handleEditProfile = () => {
    setShowForm(true)
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading business profile...</p>
        </div>
      </div>
    )
  }

  if (showForm) {
    return (
      <BusinessProfileForm
        onSuccess={handleBusinessCreated}
        onCancel={() => setShowForm(false)}
      />
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <h3 className="font-medium">Error Loading Profile</h3>
          <p className="mt-1">{error}</p>
          <button
            onClick={loadBusinessProfile}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Business Profile Found</h3>
          <p className="text-gray-600 mb-4">Create your business profile to start collecting feedback</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Create Business Profile
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{business.name}</h2>
        <button
          onClick={handleEditProfile}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
        >
          Edit Profile
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Category</h3>
          <p className="mt-1 text-lg text-gray-900">{business.category}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Description</h3>
          <p className="mt-1 text-gray-900">{business.description}</p>
        </div>

        {business.location?.address && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Address</h3>
            <p className="mt-1 text-gray-900">{business.location.address}</p>
          </div>
        )}

        {business.location?.city && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">City</h3>
            <p className="mt-1 text-gray-900">{business.location.city}</p>
          </div>
        )}

        {business.website_url && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Website</h3>
            <a
              href={business.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 text-blue-600 hover:text-blue-800"
            >
              {business.website_url}
            </a>
          </div>
        )}

        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Status</h3>
          <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            business.is_active 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {business.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Subscription</h3>
          <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            business.subscription_tier === 'trial' 
              ? 'bg-yellow-100 text-yellow-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {business.subscription_tier === 'trial' ? 'Trial' : business.subscription_tier}
          </span>
        </div>
      </div>
    </div>
  )
}