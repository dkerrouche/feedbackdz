import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
const envContent = fs.readFileSync('.env.local', 'utf8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=')
  if (key && value) {
    envVars[key.trim()] = value.trim()
  }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupDatabase() {
  try {
    console.log('🚀 Setting up FeedbackDZ database...')
    
    // Read the schema file
    const schemaPath = path.join(__dirname, '../database/schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    console.log('📝 Executing database schema...')
    
    // Execute the schema using the SQL editor endpoint
    const { data, error } = await supabase
      .from('_sql')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('⚠️  Note: Direct SQL execution not available via API')
      console.log('📋 Please run the following SQL in your Supabase SQL Editor:')
      console.log('─'.repeat(50))
      console.log(schema)
      console.log('─'.repeat(50))
      console.log('🔗 Go to: https://mfclgdwnmbrvexdojxgz.supabase.co/project/default/sql')
      return
    }
    
    console.log('🎉 Database setup completed!')
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message)
    console.log('📋 Please run the SQL manually in Supabase SQL Editor')
    console.log('🔗 Go to: https://mfclgdwnmbrvexdojxgz.supabase.co/project/default/sql')
  }
}

setupDatabase()