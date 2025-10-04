import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface TranscriptionRequest {
  audioUrl: string
  language?: string
  responseId: string
}

export interface TranscriptionResponse {
  success: boolean
  transcription?: string
  language?: string
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: TranscriptionRequest = await request.json()
    
    // Validate required fields
    if (!body.audioUrl || !body.responseId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: audioUrl, responseId' 
        },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { 
          success: false,
          error: 'OpenAI API key not configured' 
        },
        { status: 500 }
      )
    }

    console.log('Audio: Starting transcription for response:', body.responseId)
    console.log('URL: Audio URL:', body.audioUrl)

    // Download audio file from URL
    const audioResponse = await fetch(body.audioUrl)
    if (!audioResponse.ok) {
      throw new Error(`Failed to download audio: ${audioResponse.statusText}`)
    }

    const audioBuffer = await audioResponse.arrayBuffer()
    const audioFile = new File([audioBuffer], 'audio.webm', { 
      type: 'audio/webm' 
    })

    console.log('📁 Audio file size:', audioFile.size, 'bytes')

    // Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: body.language || 'auto', // auto-detect language
      response_format: 'text',
      temperature: 0.0, // More consistent results
    })

    const transcriptionText = transcription.toString().trim()

    if (!transcriptionText) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No transcription generated - audio may be too short or unclear' 
        },
        { status: 400 }
      )
    }

    console.log('✅ Transcription completed:', transcriptionText.substring(0, 100) + '...')

    return NextResponse.json({
      success: true,
      transcription: transcriptionText,
      language: body.language || 'auto'
    })

  } catch (error: any) {
    console.error('❌ Transcription error:', error)
    
    let errorMessage = 'Transcription failed'
    
    if (error.message?.includes('file_size_exceeded')) {
      errorMessage = 'Audio file too large (max 25MB)'
    } else if (error.message?.includes('invalid_file_format')) {
      errorMessage = 'Unsupported audio format'
    } else if (error.message?.includes('rate_limit_exceeded')) {
      errorMessage = 'Rate limit exceeded, please try again later'
    } else if (error.message?.includes('insufficient_quota')) {
      errorMessage = 'API quota exceeded'
    } else if (error.message) {
      errorMessage = error.message
    }

    return NextResponse.json(
      { 
        success: false,
        error: errorMessage
      },
      { status: 500 }
    )
  }
}
