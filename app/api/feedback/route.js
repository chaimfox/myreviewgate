import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { sendFeedbackEmail } from '@/lib/email'

const svc = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  const { storeId, rating, comment, customerPhone, customerEmail } = await request.json()

  if (!storeId || !rating || !comment) {
    return NextResponse.json({ error: 'חסרים פרטים' }, { status: 400 })
  }

  // Derive the customer's identity from their own session — never trust a
  // client-supplied id, or the "one feedback per customer" limit becomes
  // trivial to bypass by sending a different id each time.
  const authClient = createRouteHandlerClient({ cookies })
  const { data: { user } } = await authClient.auth.getUser()

  const db = svc()

  // Insert feedback
  const { error } = await db.from('feedback').insert({
    store_id: storeId,
    rating,
    comment,
    customer_id: user?.id ?? null,
    customer_phone: customerPhone || null,
    customer_email: customerEmail || null,
  })

  if (error) {
    const msg = error.message?.includes('unique')
      ? 'כבר שלחת משוב לחנות זו'
      : error.message
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  // Fetch store details for the email
  const { data: store } = await db
    .from('stores')
    .select('name, owner_email')
    .eq('id', storeId)
    .single()

  if (store?.owner_email) {
    await sendFeedbackEmail({
      ownerEmail: store.owner_email,
      storeName: store.name,
      rating,
      comment,
      customerPhone: customerPhone || null,
      customerEmail: customerEmail || null,
    })
  }

  return NextResponse.json({ ok: true })
}
