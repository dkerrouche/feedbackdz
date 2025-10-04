// Sample data generation utilities for testing dashboard features

export function generateSampleResponses(count: number = 25) {
  const responses = []
  const businessId = '550e8400-e29b-41d4-a716-446655440000'
  const surveyId = '550e8400-e29b-41d4-a716-446655440001'
  
  const sampleData = [
    // Positive responses
    { rating: 5, sentiment: 'positive', score: 0.9, text: 'Excellent food and service! The couscous was amazing and the staff was very friendly.', keywords: ['food', 'service', 'excellent', 'couscous', 'staff', 'friendly'] },
    { rating: 5, sentiment: 'positive', score: 0.85, text: 'Très bon restaurant! La nourriture était délicieuse et le service impeccable.', keywords: ['restaurant', 'nourriture', 'délicieuse', 'service', 'impeccable'] },
    { rating: 4, sentiment: 'positive', score: 0.8, text: 'Good experience overall. The atmosphere was nice and the food was tasty.', keywords: ['experience', 'atmosphere', 'nice', 'food', 'tasty'] },
    { rating: 4, sentiment: 'positive', score: 0.75, text: 'Great place! The coffee was perfect and the pastries were fresh.', keywords: ['place', 'coffee', 'perfect', 'pastries', 'fresh'] },
    { rating: 5, sentiment: 'positive', score: 0.95, text: 'مطعم رائع! الطعام لذيذ والخدمة ممتازة. أنصح به بشدة.', keywords: ['مطعم', 'رائع', 'طعام', 'لذيذ', 'خدمة', 'ممتازة'] },
    
    // Neutral responses
    { rating: 3, sentiment: 'neutral', score: 0.5, text: 'It was okay. The food was decent but nothing special. Service was average.', keywords: ['okay', 'food', 'decent', 'service', 'average'] },
    { rating: 3, sentiment: 'neutral', score: 0.45, text: 'Pas mal mais pourrait être mieux. Le service était un peu lent.', keywords: ['pas', 'mal', 'mieux', 'service', 'lent'] },
    { rating: 3, sentiment: 'neutral', score: 0.55, text: 'الطعام مقبول لكن الأسعار مرتفعة قليلاً.', keywords: ['طعام', 'مقبول', 'أسعار', 'مرتفعة'] },
    
    // Negative responses
    { rating: 2, sentiment: 'negative', score: 0.2, text: 'Disappointed with the service. Food was cold and the waiter was rude.', keywords: ['disappointed', 'service', 'food', 'cold', 'waiter', 'rude'] },
    { rating: 1, sentiment: 'negative', score: 0.1, text: 'Très déçu. La nourriture était mauvaise et le service terrible.', keywords: ['déçu', 'nourriture', 'mauvaise', 'service', 'terrible'] },
    { rating: 2, sentiment: 'negative', score: 0.25, text: 'Poor service and overpriced food. Not worth the money.', keywords: ['poor', 'service', 'overpriced', 'food', 'money'] },
    { rating: 1, sentiment: 'negative', score: 0.15, text: 'Terrible experience. Rude staff and bad food quality.', keywords: ['terrible', 'experience', 'rude', 'staff', 'bad', 'food', 'quality'] }
  ]
  
  for (let i = 0; i < count; i++) {
    const sample = sampleData[i % sampleData.length]
    const daysAgo = Math.floor(Math.random() * 30) + 1
    const createdAt = new Date()
    createdAt.setDate(createdAt.getDate() - daysAgo)
    
    responses.push({
      id: `resp-${String(i + 1).padStart(3, '0')}`,
      survey_id: surveyId,
      business_id: businessId,
      rating: sample.rating,
      sentiment: sample.sentiment as 'positive' | 'neutral' | 'negative',
      sentiment_score: sample.score,
      transcription: sample.text,
      keywords: sample.keywords,
      language: i % 3 === 0 ? 'ar' : i % 3 === 1 ? 'fr' : 'en',
      ip_address: `192.168.1.${(i % 254) + 1}`,
      user_agent: 'Mozilla/5.0 (compatible; TestBot/1.0)',
      created_at: createdAt.toISOString(),
      processed_at: createdAt.toISOString(),
      is_spam: false
    })
  }
  
  return responses
}

export function getEmptyAnalytics() {
  return {
    totalResponses: 0,
    averageRating: 0,
    sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
    trends: [],
    recentResponses: [],
    responseRate: 0,
    topKeywords: [],
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    keywordCounts: {}
  }
}
