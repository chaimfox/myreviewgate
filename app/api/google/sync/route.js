import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const svc = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function refreshAccessToken(refreshToken) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      grant_type: 'refresh_token',
    }),
  })
  return res.json()
}

async function getValidToken(tokenRow) {
  if (!tokenRow) return null
  const expired = tokenRow.expires_at && new Date(tokenRow.expires_at) < new Date(Date.now() + 60_000)
  if (!expired) return tokenRow.access_token

  if (!tokenRow.refresh_token) return null
  const fresh = await refreshAccessToken(tokenRow.refresh_token)
  if (!fresh.access_token) return null

  await svc().from('google_oauth_tokens').update({
    access_token: fresh.access_token,
    expires_at: new Date(Date.now() + fresh.expires_in * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('store_id', tokenRow.store_id)

  return fresh.access_token
}

export async function POST(request) {
  const { store_id } = await request.json()
  if (!store_id) return NextResponse.json({ error: 'store_id required' }, { status: 400 })

  const { data: tokenRow } = await svc()
    .from('google_oauth_tokens')
    .select('*')
    .eq('store_id', store_id)
    .single()

  if (!tokenRow) return NextResponse.json({ error: 'not_connected' }, { status: 404 })

  const accessToken = await getValidToken(tokenRow)
  if (!accessToken) return NextResponse.json({ error: 'token_expired' }, { status: 401 })

  if (!tokenRow.google_location_name) {
    return NextResponse.json({ error: 'no_location' }, { status: 400 })
  }

  // Fetch reviews from Google
  const reviewsRes = await fetch(
    `https://mybusiness.googleapis.com/v4/${tokenRow.google_location_name}/reviews?pageSize=50`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  const reviewsData = await reviewsRes.json()
  const reviews = reviewsData.reviews ?? []

  if (reviews.length === 0) {
    return NextResponse.json({ synced: 0 })
  }

  const ratingMap = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 }

  const rows = reviews.map(r => ({
    store_id,
    google_review_id: r.reviewId,
    author_name: r.reviewer?.displayName ?? 'אנונימי',
    author_photo: r.reviewer?.profilePhotoUrl ?? null,
    rating: ratingMap[r.starRating] ?? null,
    comment: r.comment ?? null,
    published_at: r.createTime ?? null,
    synced_at: new Date().toISOString(),
  }))

  const { error } = await svc()
    .from('google_reviews')
    .upsert(rows, { onConflict: 'store_id,google_review_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ synced: rows.length })
}
