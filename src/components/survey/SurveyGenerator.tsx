'use client'

import { useState } from 'react'
import { Business, SurveyQuestion } from '@/types'

interface SurveyGeneratorProps {
  business: Business
  onSurveyCreated: (survey: any) => void
  onCancel: () => void
}

export default function SurveyGenerator({ business, onSurveyCreated, onCancel }: SurveyGeneratorProps) {
  const [language, setLanguage] = useState<'ar' | 'fr' | 'en'>('ar')
  const [questions, setQuestions] = useState<SurveyQuestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [generated, setGenerated] = useState(false)

  const generateQuestions = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/ai/generate-survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName: business.name,
          category: business.category,
          description: business.description,
          language
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate questions')
      }

      setQuestions(data.questions)
      setGenerated(true)
      console.log('✅ Survey questions generated:', data.questions)

    } catch (err: any) {
      console.error('❌ Error generating questions:', err)
      setError(err.message || 'Failed to generate survey questions')
    } finally {
      setLoading(false)
    }
  }

  const handleQuestionChange = (index: number, field: keyof SurveyQuestion, value: any) => {
    setQuestions(prev => prev.map((q, i) => 
      i === index ? { ...q, [field]: value } : q
    ))
  }

  const createSurvey = async () => {
    setLoading(true)
    setError('')

    try {
      // Generate QR code
      const qrCode = `QR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Create survey in database
      const response = await fetch('/api/surveys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          business_id: business.id,
          qr_code: qrCode,
          questions,
          languages: [language]
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create survey')
      }

      console.log('✅ Survey created:', data)
      onSurveyCreated(data)

    } catch (err: any) {
      console.error('❌ Error creating survey:', err)
      setError(err.message || 'Failed to create survey')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Create Your Survey</h2>
      
      {/* Business Info */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">Business Information</h3>
        <p className="text-sm text-gray-600">
          <strong>{business.name}</strong> - {business.category}
        </p>
        <p className="text-sm text-gray-600 mt-1">{business.description}</p>
      </div>

      {/* Language Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Survey Language
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="ar"
              checked={language === 'ar'}
              onChange={(e) => setLanguage(e.target.value as 'ar')}
              className="mr-2"
            />
            العربية (Arabic)
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="fr"
              checked={language === 'fr'}
              onChange={(e) => setLanguage(e.target.value as 'fr')}
              className="mr-2"
            />
            Français (French)
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="en"
              checked={language === 'en'}
              onChange={(e) => setLanguage(e.target.value as 'en')}
              className="mr-2"
            />
            English
          </label>
        </div>
      </div>

      {/* Generate Questions Button */}
      {!generated && (
        <div className="text-center mb-6">
          <button
            onClick={generateQuestions}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating Questions...' : '🤖 Generate AI Questions'}
          </button>
        </div>
      )}

      {/* Generated Questions */}
      {generated && questions.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Generated Questions</h3>
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">
                    Question {index + 1}
                  </span>
                  <select
                    value={question.type}
                    onChange={(e) => handleQuestionChange(index, 'type', e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="rating">Rating (Stars)</option>
                    <option value="text">Text Input</option>
                    <option value="voice">Voice Recording</option>
                  </select>
                </div>
                
                <textarea
                  value={question.text}
                  onChange={(e) => handleQuestionChange(index, 'text', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
                
                <div className="mt-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={question.required}
                      onChange={(e) => handleQuestionChange(index, 'required', e.target.checked)}
                      className="mr-2"
                    />
                    Required question
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-4">
        {generated && (
          <button
            onClick={createSurvey}
            disabled={loading || questions.length === 0}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Survey...' : 'Create Survey'}
          </button>
        )}
        
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}