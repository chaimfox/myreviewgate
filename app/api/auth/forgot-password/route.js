import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const { email } = await request.json()
  if (!email) return NextResponse.json({ error: 'חסר מייל' }, { status: 400 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Supabase sends the reset email automatically (via our custom Gmail SMTP in dashboard)
  await admin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    },
  })

  // Always return OK — don't expose whether the email exists
  return NextResponse.json({ ok: true })
}
