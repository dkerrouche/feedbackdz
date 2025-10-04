import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface SurveyQuestion {
  type: 'rating' | 'text'
  text: string
  required: boolean
}

export interface SurveyGenerationRequest {
  businessName: string
  category: string
  description: string
  language: 'ar' | 'fr' | 'en'
}

export interface SurveyGenerationResponse {
  questions: SurveyQuestion[]
  success: boolean
  error?: string
}

export async function generateSurveyQuestions(request: SurveyGenerationRequest): Promise<SurveyGenerationResponse> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured')
    }

    const prompt = createSurveyPrompt(request)
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert survey designer specializing in restaurant feedback collection. Generate exactly 3 relevant questions for restaurant feedback surveys."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    // Parse the JSON response
    const questions = parseSurveyQuestions(response)
    
    return {
      questions,
      success: true
    }

  } catch (error: any) {
    console.error('❌ Error generating survey questions:', error)
    return {
      questions: getDefaultQuestions(request.language),
      success: false,
      error: error.message || 'Failed to generate survey questions'
    }
  }
}

function createSurveyPrompt(request: SurveyGenerationRequest): string {
  const languageInstructions = {
    ar: "Generate questions in Arabic (العربية). Use simple, clear language.",
    fr: "Generate questions in French. Use simple, clear language.",
    en: "Generate questions in English. Use simple, clear language."
  }

  return `
Create exactly 3 survey questions for this restaurant:

Business: ${request.businessName}
Category: ${request.category}
Description: ${request.description}

Requirements:
- ${languageInstructions[request.language]}
- Questions should be simple and easy to understand
- First question should be a rating (1-5 stars)
- Second and third questions should be open-ended text questions
- All text questions support both typing and voice recording
- Questions should be relevant to restaurant experience
- Keep questions short (max 10 words each)

Return ONLY a JSON array with this exact format:
[
  {
    "type": "rating",
    "text": "How was your overall experience?",
    "required": true
  },
  {
    "type": "text", 
    "text": "What did you like most?",
    "required": false
  },
  {
    "type": "text",
    "text": "What can we improve?",
    "required": false
  }
]
`
}

function parseSurveyQuestions(response: string): SurveyQuestion[] {
  try {
    // Clean the response - remove any markdown formatting
    const cleanedResponse = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    const questions = JSON.parse(cleanedResponse)
    
    // Validate the structure
    if (!Array.isArray(questions) || questions.length !== 3) {
      throw new Error('Invalid response format')
    }

    return questions.map((q: any) => ({
      type: q.type || 'text',
      text: q.text || '',
      required: q.required !== undefined ? q.required : false
    }))

  } catch (error) {
    console.error('❌ Error parsing survey questions:', error)
    throw new Error('Failed to parse survey questions')
  }
}

function getDefaultQuestions(language: 'ar' | 'fr' | 'en'): SurveyQuestion[] {
  const defaults = {
    ar: [
      {
        type: 'rating' as const,
        text: 'كيف كانت تجربتك الإجمالية؟',
        required: true
      },
      {
        type: 'text' as const,
        text: 'ما الذي أعجبك أكثر؟',
        required: false
      },
      {
        type: 'text' as const,
        text: 'ما الذي يمكننا تحسينه؟',
        required: false
      }
    ],
    fr: [
      {
        type: 'rating' as const,
        text: 'Comment était votre expérience globale ?',
        required: true
      },
      {
        type: 'text' as const,
        text: 'Qu\'est-ce qui vous a le plus plu ?',
        required: false
      },
      {
        type: 'text' as const,
        text: 'Que pouvons-nous améliorer ?',
        required: false
      }
    ],
    en: [
      {
        type: 'rating' as const,
        text: 'How was your overall experience?',
        required: true
      },
      {
        type: 'text' as const,
        text: 'What did you like most?',
        required: false
      },
      {
        type: 'text' as const,
        text: 'What can we improve?',
        required: false
      }
    ]
  }

  return defaults[language]
}