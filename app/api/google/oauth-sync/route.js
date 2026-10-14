import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const svc = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function getValidToken(tokenRow) {
  const isExpired = new Date(tokenRow.expires_at) <= new Date(Date.now() + 60_000)
  if (!isExpired) return tokenRow.access_token

  if (!tokenRow.refresh_token) throw new Error('No refresh token')

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: tokenRow.refresh_token,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  })
  const data = await res.json()
  if (!data.access_token) throw new Error('Token refresh failed')

  const expiresAt = new Date(Date.now() + (data.expires_in ?? 3600) * 1000).toISOString()
  await svc().from('google_oauth_tokens').update({
    access_token: data.access_token,
    expires_at: expiresAt,
    updated_at: new Date().toISOString(),
  }).eq('store_id', tokenRow.store_id)

  return data.access_token
}

export async function POST() {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: store } = await supabase
    .from('stores')
    .select('id, google_place_id')
    .eq('user_id', user.id)
    .single()
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 })

  const { data: tokenRow } = await svc()
    .from('google_oauth_tokens')
    .select('*')
    .eq('store_id', store.id)
    .single()

  if (!tokenRow) return NextResponse.json({ error: 'Not connected to Google' }, { status: 400 })

  try {
    const accessToken = await getValidToken(tokenRow)

    // Build location path from saved account + location IDs
    let locationPath = null
    if (tokenRow.google_account_id && tokenRow.google_location_name) {
      const accountId = tokenRow.google_account_id.replace('accounts/', '')
      const locationId = tokenRow.google_location_name.replace('locations/', '')
      locationPath = `accounts/${accountId}/locations/${locationId}`
    }

    // If no location saved yet, try to fetch it now
    if (!locationPath) {
      const accountsRes = await fetch(
        'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      const accountsData = await accountsRes.json()

      const account = accountsData.accounts?.[0]
      if (!account) return NextResponse.json({
        error: 'No Google Business account found',
        debug: accountsData,
      }, { status: 404 })

      const locRes = await fetch(
        `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      const locData = await locRes.json()
      const loc = locData.locations?.[0]
      if (!loc) return NextResponse.json({ error: 'No business location found', debug: locData }, { status: 404 })

      const accountId = account.name.split('/')[1]
      const locationId = loc.name.split('/')[1]
      locationPath = `accounts/${accountId}/locations/${locationId}`

      // Save for next time
      await svc().from('google_oauth_tokens').update({
        google_account_id: account.name,
        google_location_name: loc.name,
      }).eq('store_id', store.id)
    }

    // Fetch ALL reviews (paginated)
    let allReviews = []
    let nextPageToken = null
    do {
      const url = `https://mybusiness.googleapis.com/v4/${locationPath}/reviews?pageSize=50${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`
      const reviewsRes = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const reviewsData = await reviewsRes.json()
      if (reviewsData.error) return NextResponse.json({ error: reviewsData.error.message, debug: reviewsData, locationPath }, { status: 400 })
      allReviews = allReviews.concat(reviewsData.reviews ?? [])
      nextPageToken = reviewsData.nextPageToken ?? null
    } while (nextPageToken)

    if (allReviews.length === 0) {
      return NextResponse.json({ synced: 0, message: 'No reviews found' })
    }

    // Upsert all reviews
    const rows = allReviews.map(r => ({
      store_id: store.id,
      google_review_id: r.reviewId,
      author_name: r.reviewer?.displayName ?? 'אנונימי',
      author_photo: r.reviewer?.profilePhotoUrl ?? null,
      rating: { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 }[r.starRating] ?? null,
      comment: r.comment ?? null,
      published_at: r.createTime ?? null,
      synced_at: new Date().toISOString(),
    }))

    await svc()
      .from('google_reviews')
      .upsert(rows, { onConflict: 'store_id,google_review_id' })

    // Update overall rating on store
    const avgRating = rows.filter(r => r.rating).reduce((s, r) => s + r.rating, 0) / (rows.filter(r => r.rating).length || 1)
    await svc().from('stores').update({
      google_review_count: allReviews.length,
      google_rating: parseFloat(avgRating.toFixed(1)),
    }).eq('id', store.id)

    return NextResponse.json({ synced: allReviews.length, locationPath })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
