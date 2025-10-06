/**
 * Test script to verify Supabase auth setup
 * Run with: npx ts-node scripts/test-auth.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAuth() {
  console.log('🧪 Testing Supabase Auth Setup\n')

  // Test 1: Check if we can connect
  console.log('1️⃣ Testing connection...')
  try {
    const { data, error } = await supabase.from('businesses').select('count').limit(1)
    if (error) {
      console.log('   ⚠️  Connection OK but query failed (this is expected if RLS is enabled)')
      console.log('   Error:', error.message)
    } else {
      console.log('   ✅ Connection successful')
    }
  } catch (err) {
    console.error('   ❌ Connection failed:', err)
    return
  }

  // Test 2: Check email provider
  console.log('\n2️⃣ Checking auth providers...')
  console.log('   ℹ️  Go to Supabase Dashboard → Authentication → Providers')
  console.log('   ℹ️  Ensure Email provider is enabled')

  // Test 3: Test sign up (with a test email)
  console.log('\n3️⃣ Testing email sign-up...')
  const testEmail = `test-${Date.now()}@example.com`
  const testPassword = 'test123456'
  
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
  })

  if (signUpError) {
    console.log('   ❌ Sign-up failed:', signUpError.message)
    if (signUpError.message.includes('Email rate limit exceeded')) {
      console.log('   ℹ️  This is normal - Supabase has rate limits for testing')
    }
  } else if (signUpData.user) {
    console.log('   ✅ Sign-up successful!')
    console.log('   User ID:', signUpData.user.id)
    console.log('   Email:', signUpData.user.email)
    
    // Test 4: Check if user can create a business
    console.log('\n4️⃣ Testing business creation...')
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .insert({
        user_id: signUpData.user.id,
        name: 'Test Restaurant',
        category: 'Test',
        description: 'Test business for auth verification',
        subscription_tier: 'free'
      })
      .select()
      .single()

    if (businessError) {
      console.log('   ❌ Business creation failed:', businessError.message)
      console.log('   ℹ️  Make sure you ran database/setup-auth.sql')
    } else {
      console.log('   ✅ Business created successfully!')
      console.log('   Business ID:', business.id)
      
      // Cleanup
      await supabase.from('businesses').delete().eq('id', business.id)
    }

    // Cleanup test user (requires service role key)
    console.log('\n🧹 Cleaning up test user...')
    await supabase.auth.signOut()
    console.log('   ✅ Signed out')
  }

  console.log('\n✅ Auth test complete!')
  console.log('\n📝 Next steps:')
  console.log('   1. Run database/setup-auth.sql in Supabase SQL Editor')
  console.log('   2. Enable Email provider in Supabase Dashboard')
  console.log('   3. Test sign-up at http://localhost:3000/auth')
  console.log('   4. Check docs/AUTH_SETUP.md for detailed instructions')
}

testAuth().catch(console.error)
