'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import VoiceRecorder from '@/components/voice/VoiceRecorder'

interface UnifiedTextInputProps {
  questionText: string
  value: string
  onChange: (text: string) => void
  onAudioRecorded: (audioBlob: Blob) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export default function UnifiedTextInput({
  questionText,
  value,
  onChange,
  onAudioRecorded,
  placeholder = "Type your message or record voice...",
  required = false,
  disabled = false,
  className = ''
}: UnifiedTextInputProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [hasAudio, setHasAudio] = useState(false)
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleVoiceRecording = useCallback((audioBlob: Blob) => {
    setHasAudio(true)
    onAudioRecorded(audioBlob)
    setShowVoiceRecorder(false)
  }, [onAudioRecorded])

  const handleVoiceError = useCallback((error: string) => {
    console.error('Voice recording error:', error)
    setShowVoiceRecorder(false)
  }, [])

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }, [onChange])

  const toggleVoiceRecorder = useCallback(() => {
    setShowVoiceRecorder(prev => !prev)
  }, [])

  const clearAudio = useCallback(() => {
    setHasAudio(false)
    onAudioRecorded(new Blob()) // Empty blob to clear
  }, [onAudioRecorded])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [value])

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Question Text */}
      <p className="text-sm font-semibold text-gray-900">
        {questionText}
        {required && <span className="text-red-500 ml-1">*</span>}
      </p>

      {/* Chat-like Input Container */}
      <div className="relative">
        {/* Text Input Area */}
        <div className="relative bg-white border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-blue-600">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleTextChange}
            placeholder={placeholder}
            disabled={disabled}
            rows={3}
            className="w-full px-4 py-3 pr-12 border-0 rounded-lg resize-none focus:outline-none focus:ring-0 placeholder:text-gray-400 text-gray-900"
          />
          
          {/* Voice Button */}
          <button
            type="button"
            onClick={toggleVoiceRecorder}
            disabled={disabled}
            className={`absolute right-3 top-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              hasAudio
                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                : showVoiceRecorder
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            title={hasAudio ? 'Voice recorded' : showVoiceRecorder ? 'Cancel recording' : 'Record voice'}
          >
            {hasAudio ? '🎤' : showVoiceRecorder ? '✕' : '🎤'}
          </button>
        </div>

        {/* Voice Recorder (shown when voice button clicked) */}
        {showVoiceRecorder && (
          <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <VoiceRecorder
              onRecordingComplete={handleVoiceRecording}
              onError={handleVoiceError}
              disabled={disabled}
              maxDuration={60}
              className="mb-0"
            />
          </div>
        )}

        {/* Audio Status */}
        {hasAudio && !showVoiceRecorder && (
          <div className="mt-2 flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-green-600 text-sm">🎤 Voice recorded</span>
            </div>
            <button
              type="button"
              onClick={clearAudio}
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Helper Text */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          {required ? 'Required' : 'Optional'} • Type or record voice
        </span>
        <span>
          {value.length > 0 && `${value.length} characters`}
        </span>
      </div>
    </div>
  )
}
