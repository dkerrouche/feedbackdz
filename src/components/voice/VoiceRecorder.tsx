'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void
  onError: (error: string) => void
  disabled?: boolean
  maxDuration?: number // in seconds
  className?: string
}

export default function VoiceRecorder({ 
  onRecordingComplete, 
  onError, 
  disabled = false,
  maxDuration = 60,
  className = ''
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isSupported, setIsSupported] = useState(true)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Check if MediaRecorder is supported
  useEffect(() => {
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      setIsSupported(false)
      onError('Voice recording is not supported in this browser')
    }
  }, [onError])

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
        mimeType = 'audio/webm'
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4'
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
        setAudioBlob(audioBlob)
        onRecordingComplete(audioBlob)
        
        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
      }
      
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event)
        onError('Recording failed. Please try again.')
        stopRecording()
      }
      
      mediaRecorder.start(1000) // Collect data every second
      setIsRecording(true)
      setRecordingTime(0)
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1
          if (newTime >= maxDuration) {
            stopRecording()
          }
          return newTime
        })
      }, 1000)
      
    } catch (error: any) {
      console.error('Error starting recording:', error)
      let errorMessage = 'Microphone access denied. Please allow microphone access and try again.'
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Microphone access denied. Please allow microphone access and try again.'
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No microphone found. Please connect a microphone and try again.'
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'Voice recording is not supported in this browser.'
      }
      
      onError(errorMessage)
    }
  }, [maxDuration, onRecordingComplete, onError])

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

  const resetRecording = useCallback(() => {
    setAudioBlob(null)
    setRecordingTime(0)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!isSupported) {
    return (
      <div className={`text-center p-4 ${className}`}>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
          <p className="text-sm">Voice recording is not supported in this browser.</p>
          <p className="text-xs mt-1">Please use a modern browser like Chrome, Firefox, or Safari.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center">
        <button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onMouseLeave={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          disabled={disabled}
          className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-lg transition-all duration-200 shadow-lg ${
            isRecording
              ? 'bg-red-600 hover:bg-red-700 scale-110 animate-pulse'
              : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title={isRecording ? 'Release to stop recording' : 'Hold to record'}
        >
          {isRecording ? '⏹️' : '🎤'}
        </button>
        
        {isRecording && (
          <div className="mt-3">
            <p className="text-sm text-gray-600 font-medium">
              Recording... {formatTime(recordingTime)}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-red-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(recordingTime / maxDuration) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Max {maxDuration}s • Release to stop
            </p>
          </div>
        )}
        
        {!isRecording && !audioBlob && (
          <p className="text-sm text-gray-600 mt-2">
            Hold the microphone button to record
          </p>
        )}
      </div>
      
      {audioBlob && (
        <div className="text-center space-y-3">
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            <p className="text-sm font-medium">✅ Recording complete!</p>
            <p className="text-xs mt-1">Duration: {formatTime(recordingTime)}</p>
          </div>
          
          <audio controls className="w-full">
            <source src={URL.createObjectURL(audioBlob)} type={audioBlob.type} />
            Your browser does not support the audio element.
          </audio>
          
          <div className="flex justify-center space-x-2">
            <button
              onClick={resetRecording}
              className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium"
            >
              Record Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
