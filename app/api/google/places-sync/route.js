import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const svc = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { place_id } = await request.json()
  if (!place_id) return NextResponse.json({ error: 'place_id required' }, { status: 400 })

  // Get store
  const { data: store } = await supabase.from('stores').select('id').eq('user_id', user.id).single()
  if (!store) return NextResponse.json({ error: 'no store' }, { status: 404 })

  // Save place_id to store
  await svc().from('stores').update({ google_place_id: place_id }).eq('id', store.id)

  // Fetch reviews from Places API (New)
  const res = await fetch(
    `https://places.googleapis.com/v1/places/${place_id}?fields=reviews,displayName,rating&languageCode=iw`,
    {
      headers: {
        'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY,
        'Accept': 'application/json',
      },
    }
  )

  const data = await res.json()

  if (data.error) {
    return NextResponse.json({ error: data.error.message }, { status: 400 })
  }

  const reviews = data.reviews ?? []

  if (reviews.length === 0) {
    return NextResponse.json({ synced: 0, business_name: data.displayName?.text })
  }

  const rows = reviews.map(r => ({
    store_id: store.id,
    google_review_id: r.name ?? `${place_id}_${r.publishTime}`,
    author_name: r.authorAttribution?.displayName ?? 'אנונימי',
    author_photo: r.authorAttribution?.photoUri ?? null,
    rating: r.rating ?? null,
    comment: r.text?.text ?? null,
    published_at: r.publishTime ?? null,
    synced_at: new Date().toISOString(),
  }))

  const { error } = await svc()
    .from('google_reviews')
    .upsert(rows, { onConflict: 'store_id,google_review_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    synced: rows.length,
    business_name: data.displayName?.text,
    overall_rating: data.rating,
  })
}
