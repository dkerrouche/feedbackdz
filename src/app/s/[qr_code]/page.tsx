'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface SurveyQuestion {
  type: 'rating' | 'text' | 'voice'
  text: string
  required: boolean
}

export default function PublicSurveyPage() {
  const params = useParams<{ qr_code: string | string[] }>()
  const qr_code = Array.isArray(params.qr_code) ? params.qr_code[0] : (params.qr_code as string)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [survey, setSurvey] = useState<any>(null)
  const [ratingsByIndex, setRatingsByIndex] = useState<Record<number, number>>({})
  const [answersByIndex, setAnswersByIndex] = useState<Record<number, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/surveys/${qr_code}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load survey')
        setSurvey(data.survey)
      } catch (e: any) {
        setError(e.message || 'Failed to load survey')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [qr_code])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!survey) return
    const orderedQuestions: SurveyQuestion[] = Array.isArray(survey?.questions) ? survey.questions : []
    const firstRatingIdx = orderedQuestions.findIndex((q) => q.type === 'rating')
    const primaryRating = firstRatingIdx !== -1 ? ratingsByIndex[firstRatingIdx] : null
    if (firstRatingIdx !== -1 && !primaryRating) {
      setError('Please select a rating')
      return
    }
    try {
      setSubmitting(true)
      setError('')
      const res = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          survey_id: survey.id,
          business_id: survey.business_id,
          rating: primaryRating,
          text: Object.keys(answersByIndex)
            .sort((a,b) => Number(a) - Number(b))
            .map((k) => answersByIndex[Number(k)])
            .filter(Boolean)
            .join('\n\n'),
          language: 'fr'
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit response')
      setSubmitted(true)
    } catch (e: any) {
      setError(e.message || 'Failed to submit response')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading survey...</p>
        </div>
      </div>
    )
  }

  if (error && !survey) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center">
          <h1 className="text-xl font-bold text-gray-900">Survey unavailable</h1>
          <p className="mt-2 text-gray-700">{error}</p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Thank you! ✅</h1>
          <p className="text-gray-700">Your feedback was received.</p>
          <Link href="/" className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">Go Home</Link>
        </div>
      </div>
    )
  }

  const orderedQuestions: SurveyQuestion[] = Array.isArray(survey?.questions) ? survey.questions : []

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="text-center mb-6">
          <h1 className="text-xl font-extrabold text-gray-900">Share your experience</h1>
          <p className="text-sm text-gray-700">Takes less than 30 seconds</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {orderedQuestions.map((q, idx) => (
            <div key={idx}>
              {q.type === 'rating' ? (
                <>
                  <p className="text-sm font-semibold text-gray-900 mb-2">{q.text || 'How was your experience?'}</p>
                  <div className="flex items-center justify-between">
                    {[1,2,3,4,5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingsByIndex((prev) => ({ ...prev, [idx]: star }))}
                        className={`w-12 h-12 rounded-full border ${(ratingsByIndex[idx] || 0) >= star ? 'bg-yellow-400 border-yellow-500' : 'bg-gray-100 border-gray-200'} flex items-center justify-center`}
                        aria-label={`${star} star`}
                      >
                        <span className="text-gray-900 font-bold">{star}</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-gray-900 mb-2">{q.text || (q.type === 'voice' ? 'Record your feedback' : 'Your answer')}</p>
                  <textarea
                    value={answersByIndex[idx] || ''}
                    onChange={(e) => setAnswersByIndex((prev) => ({ ...prev, [idx]: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 placeholder:text-gray-400 text-gray-900"
                    placeholder={q.type === 'voice' ? 'Type here (voice fallback)' : 'Type here (optional)'}
                  />
                </>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  )
}


