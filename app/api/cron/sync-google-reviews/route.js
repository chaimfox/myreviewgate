import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const svc = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(request) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get all stores with a Place ID
  const { data: stores, error } = await svc()
    .from('stores')
    .select('id, name, google_place_id')
    .not('google_place_id', 'is', null)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!stores?.length) return NextResponse.json({ synced: 0, message: 'no stores with place_id' })

  const results = []

  for (const store of stores) {
    try {
      const res = await fetch(
        `https://places.googleapis.com/v1/places/${store.google_place_id}?fields=reviews,displayName,rating,userRatingCount&languageCode=iw`,
        {
          headers: {
            'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY,
            'Accept': 'application/json',
          },
        }
      )

      const data = await res.json()
      if (data.error) { results.push({ store: store.name, error: data.error.message }); continue }

      // Update overall rating + count
      await svc().from('stores').update({
        google_rating: data.rating ?? null,
        google_review_count: data.userRatingCount ?? null,
      }).eq('id', store.id)

      const reviews = data.reviews ?? []
      if (reviews.length === 0) { results.push({ store: store.name, synced: 0 }); continue }

      const rows = reviews.map(r => ({
        store_id: store.id,
        google_review_id: r.name ?? `${store.google_place_id}_${r.publishTime}`,
        author_name: r.authorAttribution?.displayName ?? 'אנונימי',
        author_photo: r.authorAttribution?.photoUri ?? null,
        rating: r.rating ?? null,
        comment: r.text?.text ?? null,
        published_at: r.publishTime ?? null,
        synced_at: new Date().toISOString(),
      }))

      await svc()
        .from('google_reviews')
        .upsert(rows, { onConflict: 'store_id,google_review_id' })

      results.push({ store: store.name, synced: rows.length })
    } catch (e) {
      results.push({ store: store.name, error: e.message })
    }
  }

  return NextResponse.json({ ok: true, results, ran_at: new Date().toISOString() })
}
