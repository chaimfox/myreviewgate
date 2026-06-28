import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { sendFeedbackEmail } from '@/lib/email'

const svc = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  const { storeId, rating, comment, customerId, customerPhone, customerEmail } = await request.json()

  if (!storeId || !rating || !comment) {
    return NextResponse.json({ error: 'חסרים פרטים' }, { status: 400 })
  }

  const db = svc()

  // Insert feedback
  const { error } = await db.from('feedback').insert({
    store_id: storeId,
    rating,
    comment,
    customer_id: customerId ?? null,
    customer_phone: customerPhone || null,
    customer_name: customerEmail || null,
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
