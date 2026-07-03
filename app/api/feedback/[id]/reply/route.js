import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { sendOwnerReplyEmail } from '@/lib/email'

const svc = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// POST /api/feedback/[id]/reply — store owner replies to a private feedback entry
export async function POST(request, { params }) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { reply } = await request.json()
  if (!reply?.trim()) return NextResponse.json({ error: 'חסרה תגובה' }, { status: 400 })

  const { data: store } = await supabase.from('stores').select('id').eq('user_id', user.id).single()
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 })

  const db = svc()

  // Make sure this feedback actually belongs to the caller's store
  const { data: feedback } = await db
    .from('feedback')
    .select('id, store_id, comment, customer_email')
    .eq('id', params.id)
    .single()
  if (!feedback || feedback.store_id !== store.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { error } = await db
    .from('feedback')
    .update({ owner_reply: reply.trim(), owner_reply_at: new Date().toISOString() })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (feedback.customer_email) {
    const { data: storeRow } = await db.from('stores').select('name').eq('id', store.id).single()
    await sendOwnerReplyEmail({
      customerEmail: feedback.customer_email,
      storeName: storeRow?.name ?? '',
      originalComment: feedback.comment,
      reply: reply.trim(),
    })
  }

  return NextResponse.json({ ok: true })
}
