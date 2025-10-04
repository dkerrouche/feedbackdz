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
  const [recordingTime, setRecordingTime] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const handleVoiceRecording = useCallback((audioBlob: Blob) => {
    setHasAudio(true)
    onAudioRecorded(audioBlob)
    setShowVoiceRecorder(false)
    setIsRecording(false)
    setRecordingTime(0)
  }, [onAudioRecorded])

  const handleVoiceError = useCallback((error: string) => {
    console.error('Voice recording error:', error)
    setShowVoiceRecorder(false)
    setIsRecording(false)
    setRecordingTime(0)
  }, [])

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }, [onChange])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      })

      streamRef.current = stream

      // Check if WebM with Opus is supported, fallback to default
      let mimeType = 'audio/webm;codecs=opus'
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        console.warn(`${mimeType} not supported, trying default...`)
        mimeType = 'audio/webm'
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          console.warn(`${mimeType} not supported, trying audio/mp4...`)
          mimeType = 'audio/mp4'
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            console.error('No supported audio MIME type found for MediaRecorder.')
            handleVoiceError('Your browser does not support required audio recording formats.')
            stream.getTracks().forEach(track => track.stop())
            return
          }
        }
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType
      })

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mimeType
        })
        handleVoiceRecording(audioBlob)

        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      setShowVoiceRecorder(true)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1
          if (newTime >= 60) { // Max 60 seconds
            stopRecording()
          }
          return newTime
        })
      }, 1000)

    } catch (error: any) {
      console.error('Error starting recording:', error)
      let errorMessage = 'Microphone access denied. Please allow microphone access and try again.'
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Microphone access denied. Please enable it in your browser settings.'
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No microphone found. Please ensure a microphone is connected.'
      }
      handleVoiceError(errorMessage)
    }
  }, [handleVoiceRecording, handleVoiceError])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isRecording])

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
    setRecordingTime(0)
    setShowVoiceRecorder(false)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [isRecording])

  const clearAudio = useCallback(() => {
    setHasAudio(false)
    onAudioRecorded(new Blob()) // Empty blob to clear
  }, [onAudioRecorded])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [value])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Question Text */}
      <p className="text-sm font-semibold text-gray-900">
        {questionText}
        {required && <span className="text-red-500 ml-1">*</span>}
      </p>

      {/* Chat-like Input Container */}
      <div className="relative">
        {!showVoiceRecorder ? (
          /* Text Input Area */
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
            
            {/* Voice Button - Bottom Right */}
            <button
              type="button"
              onClick={startRecording}
              disabled={disabled}
              className={`absolute right-3 bottom-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                hasAudio
                  ? 'bg-green-100 text-green-600 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              title={hasAudio ? 'Voice recorded - Click to record again' : 'Record voice'}
            >
              {hasAudio ? '🎤' : '🎤'}
            </button>
          </div>
        ) : (
          /* Recording Interface (replaces text input) */
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-center">
              {/* Recording Status */}
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-white text-2xl">🎤</span>
                </div>
                <p className="text-sm text-red-700 mt-2 font-medium">
                  Recording... {formatTime(recordingTime)}
                </p>
                <div className="w-full bg-red-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${(recordingTime / 60) * 100}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4">
                {/* Stop Recording */}
                <button
                  type="button"
                  onClick={stopRecording}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
                >
                  Stop Recording
                </button>
                
                {/* Cancel Recording (Trash Icon) */}
                <button
                  type="button"
                  onClick={cancelRecording}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium flex items-center space-x-1"
                  title="Cancel recording"
                >
                  <span>🗑️</span>
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Audio Status (shown when not recording and has audio) */}
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
