import { NextRequest, NextResponse } from 'next/server'
import { generateSurveyQuestions, SurveyGenerationRequest } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const body: SurveyGenerationRequest = await request.json()
    
    // Validate required fields
    if (!body.businessName || !body.category || !body.description) {
      return NextResponse.json(
        { error: 'Missing required fields: businessName, category, description' },
        { status: 400 }
      )
    }

    // Validate language
    if (!['ar', 'fr', 'en'].includes(body.language)) {
      return NextResponse.json(
        { error: 'Invalid language. Must be ar, fr, or en' },
        { status: 400 }
      )
    }

    console.log('🤖 Generating survey questions for:', body.businessName)
    
    const result = await generateSurveyQuestions(body)
    
    if (!result.success) {
      console.error('❌ Survey generation failed:', result.error)
      return NextResponse.json(
        { 
          error: result.error || 'Failed to generate survey questions',
          questions: result.questions // Return fallback questions
        },
        { status: 500 }
      )
    }

    console.log('✅ Survey questions generated successfully')
    
    return NextResponse.json({
      success: true,
      questions: result.questions
    })

  } catch (error: any) {
    console.error('❌ API Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        questions: [
          {
            type: 'rating',
            text: 'How was your overall experience?',
            required: true
          },
          {
            type: 'text',
            text: 'What did you like most?',
            required: false
          },
          {
            type: 'text',
            text: 'What can we improve?',
            required: false
          }
        ]
      },
      { status: 500 }
    )
  }
}