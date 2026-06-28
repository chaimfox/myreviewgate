import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(request) {
  const { email } = await request.json()
  if (!email) return NextResponse.json({ error: 'חסר מייל' }, { status: 400 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data, error } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    },
  })

  if (error) {
    // Don't expose whether the email exists — always return OK
    console.error('[forgot-password]', error.message)
    return NextResponse.json({ ok: true })
  }

  await sendPasswordResetEmail({ email, resetLink: data.properties.action_link })

  return NextResponse.json({ ok: true })
}
