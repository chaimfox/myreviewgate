import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const svc = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  const { name, email, subject, message } = await request.json()
  if (!name || !email || !message) {
    return NextResponse.json({ error: 'שדות חובה חסרים' }, { status: 400 })
  }
  const { error } = await svc().from('contact_messages').insert({ name, email, subject, message })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
