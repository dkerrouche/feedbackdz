'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface PhoneAuthProps {
  onSuccess: () => void
}

export default function PhoneAuth({ onSuccess }: PhoneAuthProps) {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // For development, we'll simulate OTP sending
      // In production, you'd integrate with SMS service
      console.log('📱 Sending OTP to:', phone)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setStep('otp')
    } catch (err) {
      setError('Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // For development, accept any 6-digit code
      if (otp.length === 6) {
        console.log('✅ OTP verified for:', phone)
        onSuccess()
      } else {
        setError('Please enter a valid 6-digit OTP')
      }
    } catch (err) {
      setError('Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'phone') {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">Sign In</h2>
        
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+213 123 456 789"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 placeholder:text-gray-400 text-gray-900"
              required
            />
          </div>
          
          {error && (
            <div className="text-red-800 text-sm">{error}</div>
          )}
          
          <button
            type="submit"
            disabled={loading || !phone}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">Verify OTP</h2>
      
      <form onSubmit={handleVerifyOTP} className="space-y-4">
        <div>
          <label htmlFor="otp" className="block text-sm font-semibold text-gray-900 mb-2">
            Enter 6-digit code sent to {phone}
          </label>
          <input
            type="text"
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-center text-lg tracking-widest placeholder:text-gray-400 text-gray-900"
            maxLength={6}
            required
          />
        </div>
        
        {error && (
          <div className="text-red-800 text-sm">{error}</div>
        )}
        
        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
        
        <button
          type="button"
          onClick={() => setStep('phone')}
          className="w-full text-gray-900 py-2 px-4 rounded-lg hover:bg-gray-100 border border-gray-200 mt-2"
        >
          Change phone number
        </button>
      </form>
    </div>
  )
}