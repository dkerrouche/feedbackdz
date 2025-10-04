import { supabase } from '@/lib/supabase'
import { validateAudioBlob, getAudioFileSize } from './recorder'

export interface AudioUploadResult {
  success: boolean
  url?: string
  filename?: string
  error?: string
}

export async function uploadAudioFile(
  audioBlob: Blob,
  responseId: string
): Promise<AudioUploadResult> {
  try {
    // Validate the audio blob
    const validation = validateAudioBlob(audioBlob)
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error
      }
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 10)
    const filename = `audio_${responseId}_${timestamp}_${randomId}.webm`

    console.log(`📤 Uploading audio file: ${filename} (${getAudioFileSize(audioBlob)})`)

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('audio-files')
      .upload(filename, audioBlob, {
        contentType: audioBlob.type || 'audio/webm',
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('❌ Storage upload error:', error)
      return {
        success: false,
        error: `Upload failed: ${error.message}`
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('audio-files')
      .getPublicUrl(filename)

    console.log('✅ Audio uploaded successfully:', urlData.publicUrl)

    return {
      success: true,
      url: urlData.publicUrl,
      filename: filename
    }

  } catch (error: any) {
    console.error('❌ Audio upload error:', error)
    return {
      success: false,
      error: `Upload failed: ${error.message}`
    }
  }
}

export async function deleteAudioFile(filename: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from('audio-files')
      .remove([filename])

    if (error) {
      console.error('❌ Audio deletion error:', error)
      return false
    }

    console.log('✅ Audio file deleted:', filename)
    return true

  } catch (error: any) {
    console.error('❌ Audio deletion error:', error)
    return false
  }
}
