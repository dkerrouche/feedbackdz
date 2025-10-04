import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface AnalysisRequest {
  text: string
  language?: string
  responseId: string
}

export interface AnalysisResponse {
  success: boolean
  sentiment?: 'positive' | 'neutral' | 'negative'
  sentimentScore?: number
  keywords?: string[]
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest = await request.json()
    
    // Validate required fields
    if (!body.text || !body.responseId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: text, responseId' 
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

    console.log('🧠 Starting analysis for response:', body.responseId)
    console.log('📝 Text length:', body.text.length, 'characters')

    // Create analysis prompt
    const language = body.language || 'auto'
    const prompt = createAnalysisPrompt(body.text, language)

    // Analyze with GPT-4
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert sentiment analysis and keyword extraction system for restaurant feedback. Analyze customer feedback and provide accurate sentiment classification and relevant keywords."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1, // Low temperature for consistent results
      max_tokens: 500,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    // Parse the JSON response
    const analysis = parseAnalysisResponse(response)
    
    console.log('✅ Analysis completed:', {
      sentiment: analysis.sentiment,
      score: analysis.sentimentScore,
      keywords: analysis.keywords?.length || 0
    })

    return NextResponse.json({
      success: true,
      sentiment: analysis.sentiment,
      sentimentScore: analysis.sentimentScore,
      keywords: analysis.keywords
    })

  } catch (error: any) {
    console.error('❌ Analysis error:', error)
    
    let errorMessage = 'Analysis failed'
    
    if (error.message?.includes('rate_limit_exceeded')) {
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

function createAnalysisPrompt(text: string, language: string): string {
  return `
Analyze this restaurant feedback and provide:

1. Sentiment: positive, neutral, or negative
2. Sentiment score: 0.0 to 1.0 (0.0 = very negative, 1.0 = very positive)
3. Keywords: Extract 3-8 relevant keywords/topics

Text: "${text}"

Language: ${language}

Categories for keywords:
- Food Quality (taste, freshness, temperature, presentation)
- Service (speed, friendliness, attentiveness, professionalism)
- Cleanliness (hygiene, presentation, environment)
- Ambiance (noise, decor, comfort, atmosphere)
- Value (pricing, portion size, worth)
- Specific items (menu dishes, drinks mentioned)

Return ONLY a JSON object with this exact format:
{
  "sentiment": "positive",
  "sentimentScore": 0.85,
  "keywords": ["food quality", "service", "atmosphere"]
}

Guidelines:
- Be accurate and objective
- Consider context and tone
- Handle mixed language (Arabic/French/English)
- Understand cultural expressions
- Focus on actionable insights
`
}

function parseAnalysisResponse(response: string): {
  sentiment: 'positive' | 'neutral' | 'negative'
  sentimentScore: number
  keywords: string[]
} {
  try {
    // Clean the response - remove any markdown formatting
    const cleanedResponse = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    const analysis = JSON.parse(cleanedResponse)
    
    // Validate and set defaults
    const sentiment = ['positive', 'neutral', 'negative'].includes(analysis.sentiment) 
      ? analysis.sentiment 
      : 'neutral'
    
    const sentimentScore = typeof analysis.sentimentScore === 'number' 
      ? Math.max(0, Math.min(1, analysis.sentimentScore))
      : 0.5
    
    const keywords = Array.isArray(analysis.keywords) 
      ? analysis.keywords.slice(0, 8) // Limit to 8 keywords
      : []

    return {
      sentiment,
      sentimentScore,
      keywords
    }

  } catch (error) {
    console.error('❌ Error parsing analysis response:', error)
    
    // Return safe defaults
    return {
      sentiment: 'neutral',
      sentimentScore: 0.5,
      keywords: []
    }
  }
}
