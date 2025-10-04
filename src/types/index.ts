// Database types
export interface Business {
  id: string
  phone: string
  name: string
  category?: string
  description?: string
  location?: {
    address?: string
    city?: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  logo_url?: string
  website_url?: string
  created_at: string
  updated_at: string
  is_active: boolean
  subscription_tier: 'trial' | 'basic' | 'premium'
}

export interface Survey {
  id: string
  business_id: string
  qr_code: string
  questions: Question[]
  languages: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Question {
  type: 'rating' | 'text'
  text: string
  required: boolean
  options?: string[]
}

export interface Response {
  id: string
  survey_id: string
  business_id: string
  rating?: number
  sentiment?: 'positive' | 'neutral' | 'negative'
  sentiment_score?: number
  transcription?: string
  audio_url?: string
  keywords?: string[]
  language?: string
  ip_address?: string
  user_agent?: string
  created_at: string
  processed_at?: string
  is_spam: boolean
}

export interface AISummary {
  id: string
  business_id: string
  date: string
  summary_text: string
  response_count: number
  sentiment_breakdown: {
    positive: number
    neutral: number
    negative: number
  }
  keywords: string[]
  recommendations: string[]
  created_at: string
}

// API types
export interface CreateBusinessRequest {
  phone: string
  name: string
  category?: string
  description?: string
}

export interface CreateSurveyRequest {
  business_id: string
  questions: Question[]
  languages: string[]
}

export interface SubmitResponseRequest {
  survey_id: string
  rating?: number
  transcription?: string
  audio_url?: string
  language?: string
}

// UI types
export interface AuthState {
  user: any | null
  loading: boolean
  error: string | null
}

export interface DashboardState {
  responses: Response[]
  analytics: {
    total_responses: number
    average_rating: number
    sentiment_breakdown: {
      positive: number
      neutral: number
      negative: number
    }
    response_rate: number
  }
  loading: boolean
  error: string | null
}

// Analytics Types
export interface RealtimeResponse {
  id: string
  survey_id: string
  business_id: string
  rating: number
  sentiment: string
  sentiment_score: number
  transcription: string
  audio_url: string | null
  keywords: string[]
  language: string
  ip_address: string
  user_agent: string
  created_at: string
  processed_at: string | null
  is_spam: boolean
}

export interface AnalyticsData {
  totalResponses: number
  averageRating: number
  sentimentBreakdown: {
    positive: number
    neutral: number
    negative: number
  }
  trends: {
    date: string
    responses: number
    averageRating: number
  }[]
  recentResponses: RealtimeResponse[]
  responseRate: number
  topKeywords: string[]
}

export interface ResponseFilters {
  dateRange: {
    start: string
    end: string
  }
  ratingFilter: number[] | null
  sentimentFilter: string[] | null
  searchQuery: string
  surveyFilter: string[] | null
}