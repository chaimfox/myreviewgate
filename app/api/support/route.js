import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { sendSupportAdminEmail } from '@/lib/email'

const svc = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { category, message } = await request.json()
  if (!message?.trim()) {
    return NextResponse.json({ error: 'חסרה הודעה' }, { status: 400 })
  }

  const { data: store } = await supabase.from('stores').select('id, name, owner_email').eq('user_id', user.id).single()
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 })

  const { error } = await svc().from('support_messages').insert({
    store_id: store.id,
    category: category || null,
    message,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await sendSupportAdminEmail({
    storeName: store.name,
    ownerEmail: store.owner_email,
    category,
    message,
  })

  return NextResponse.json({ ok: true })
}
