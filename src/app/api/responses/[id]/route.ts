import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/responses/[id] - Get a specific response
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: response, error } = await supabase
      .from('responses')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching response:', error)
      return NextResponse.json({ error: 'Failed to fetch response' }, { status: 500 })
    }

    if (!response) {
      return NextResponse.json({ error: 'Response not found' }, { status: 404 })
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in GET /api/responses/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/responses/[id] - Update a response (mark addressed, flag, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { action, data } = body

    let updateData: any = {}

    switch (action) {
      case 'mark_addressed':
        updateData = { is_addressed: true, addressed_at: new Date().toISOString() }
        break
      case 'unmark_addressed':
        updateData = { is_addressed: false, addressed_at: null }
        break
      case 'flag':
        updateData = { is_flagged: true, flagged_at: new Date().toISOString() }
        break
      case 'unflag':
        updateData = { is_flagged: false, flagged_at: null }
        break
      case 'mark_spam':
        updateData = { is_spam: true }
        break
      case 'unmark_spam':
        updateData = { is_spam: false }
        break
      case 'update_notes':
        updateData = { notes: data.notes }
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const { data: response, error } = await supabase
      .from('responses')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating response:', error)
      return NextResponse.json({ error: 'Failed to update response' }, { status: 500 })
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in PATCH /api/responses/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/responses/[id] - Delete a response
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('responses')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting response:', error)
      return NextResponse.json({ error: 'Failed to delete response' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Response deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/responses/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
