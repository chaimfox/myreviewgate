import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { sendNewStoreAdminEmail } from '@/lib/email'

export async function POST(req) {
  const { userId, name, slug, googleUrl, ownerEmail, fullName, email } = await req.json()

  if (!userId || !name || !slug || !googleUrl) {
    return NextResponse.json({ error: 'חסרים פרטים' }, { status: 400 })
  }

  // Service role bypasses RLS — safe because this is server-side only
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Upsert profile
  await admin.from('profiles').upsert({
    id: userId,
    full_name: fullName,
    email,
    role: 'store_owner',
    pending_store_name: name,
    pending_slug: slug,
    pending_google_url: googleUrl,
    pending_owner_email: ownerEmail,
  })

  // Insert store as pending
  const { error } = await admin.from('stores').insert({
    user_id: userId,
    name,
    slug,
    google_review_url: googleUrl,
    owner_email: ownerEmail,
    status: 'pending',
  })

  if (error) {
    const msg = error.message?.includes('unique')
      ? 'כתובת ה-URL הזו כבר תפוסה. בחר אחרת.'
      : error.message
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  // Notify admin about new pending store
  await sendNewStoreAdminEmail({
    storeName: name,
    slug,
    ownerEmail,
    ownerName: fullName,
  })

  return NextResponse.json({ ok: true })
}
