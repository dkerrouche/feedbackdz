import { supabase } from './supabase'

export async function testSupabaseConnection() {
  try {
    console.log('🔍 Testing Supabase connection...')
    
    // Test basic connection
    const { data, error } = await supabase
      .from('businesses')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message)
      return false
    }
    
    console.log('✅ Supabase connection successful!')
    return true
    
  } catch (error) {
    console.error('❌ Connection test failed:', error)
    return false
  }
}