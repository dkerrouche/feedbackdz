import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.business_id || !body.qr_code || !body.questions || !body.languages) {
      return NextResponse.json(
        { error: 'Missing required fields: business_id, qr_code, questions, languages' },
        { status: 400 }
      )
    }

    // Validate questions structure
    if (!Array.isArray(body.questions) || body.questions.length === 0) {
      return NextResponse.json(
        { error: 'Questions must be a non-empty array' },
        { status: 400 }
      )
    }

    console.log('📝 Creating survey for business:', body.business_id)
    
    // Create survey in database
    const { data, error } = await supabase
      .from('surveys')
      .insert({
        business_id: body.business_id,
        qr_code: body.qr_code,
        questions: body.questions,
        languages: body.languages,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Survey created successfully:', data.id)
    
    return NextResponse.json({
      success: true,
      survey: data
    })

  } catch (error: any) {
    console.error('❌ API Error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('business_id')

    if (!businessId) {
      return NextResponse.json(
        { error: 'business_id parameter is required' },
        { status: 400 }
      )
    }

    console.log('📋 Fetching surveys for business:', businessId)
    
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      surveys: data
    })

  } catch (error: any) {
    console.error('❌ API Error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}