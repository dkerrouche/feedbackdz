'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Business } from '@/types'

interface BusinessProfileFormProps {
  onSuccess: (business: Business) => void
  onCancel: () => void
}

export default function BusinessProfileForm({ onSuccess, onCancel }: BusinessProfileFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    address: '',
    city: '',
    website_url: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const categories = [
    'Italian',
    'French',
    'Algerian',
    'Fast Food',
    'Café',
    'Pizza',
    'Seafood',
    'Grill',
    'Traditional',
    'Modern',
    'Family Restaurant',
    'Quick Service'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Get current user's phone from auth state
      const phone = '+213123456789' // For now, we'll use a default phone
      
      // Check if business already exists
      const { data: existingBusiness, error: checkError } = await supabase
        .from('businesses')
        .select('*')
        .eq('phone', phone)
        .single()

      let businessData

      if (existingBusiness) {
        // Update existing business
        const { data, error: updateError } = await supabase
          .from('businesses')
          .update({
            name: formData.name,
            category: formData.category,
            description: formData.description,
            location: {
              address: formData.address,
              city: formData.city
            },
            website_url: formData.website_url || null
          })
          .eq('phone', phone)
          .select()
          .single()

        if (updateError) {
          throw updateError
        }

        businessData = data
        console.log('✅ Business profile updated:', data)
      } else {
        // Create new business
        const { data, error: insertError } = await supabase
          .from('businesses')
          .insert({
            phone,
            name: formData.name,
            category: formData.category,
            description: formData.description,
            location: {
              address: formData.address,
              city: formData.city
            },
            website_url: formData.website_url || null
          })
          .select()
          .single()

        if (insertError) {
          throw insertError
        }

        businessData = data
        console.log('✅ Business profile created:', data)
      }

      onSuccess(businessData)
      
    } catch (err: any) {
      console.error('❌ Error creating business profile:', err)
      setError(err.message || 'Failed to create business profile')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Create Your Business Profile</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Business Name *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="e.g., Restaurant El Djazair"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Restaurant Category *
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Business Description *
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe your restaurant, cuisine type, specialties, atmosphere..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <input
            type="text"
            id="address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="e.g., 123 Rue Didouche Mourad"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* City */}
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
            City
          </label>
          <input
            type="text"
            id="city"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            placeholder="e.g., Algiers"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Website */}
        <div>
          <label htmlFor="website_url" className="block text-sm font-medium text-gray-700 mb-2">
            Website URL (Optional)
          </label>
          <input
            type="url"
            id="website_url"
            value={formData.website_url}
            onChange={(e) => handleInputChange('website_url', e.target.value)}
            placeholder="https://your-restaurant.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading || !formData.name || !formData.category || !formData.description}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving Profile...' : 'Save Business Profile'}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}