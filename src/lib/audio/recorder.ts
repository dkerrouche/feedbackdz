// Audio recording utilities for FeedbackDZ

export interface AudioRecorderConfig {
  maxDuration: number // in seconds
  sampleRate: number
  echoCancellation: boolean
  noiseSuppression: boolean
}

export const DEFAULT_AUDIO_CONFIG: AudioRecorderConfig = {
  maxDuration: 60,
  sampleRate: 44100,
  echoCancellation: true,
  noiseSuppression: true
}

export function getSupportedMimeType(): string {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
    'audio/wav'
  ]
  
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type
    }
  }
  
  return 'audio/webm' // fallback
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function validateAudioBlob(blob: Blob): { valid: boolean; error?: string } {
  if (!blob || blob.size === 0) {
    return { valid: false, error: 'No audio data recorded' }
  }
  
  if (blob.size > 10 * 1024 * 1024) { // 10MB limit
    return { valid: false, error: 'Audio file too large (max 10MB)' }
  }
  
  if (blob.type && !blob.type.startsWith('audio/')) {
    return { valid: false, error: 'Invalid audio format' }
  }
  
  return { valid: true }
}

export async function convertBlobToFile(blob: Blob, filename: string): Promise<File> {
  return new File([blob], filename, { type: blob.type })
}

export function getAudioFileSize(blob: Blob): string {
  const bytes = blob.size
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
