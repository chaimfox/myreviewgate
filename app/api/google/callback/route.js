import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const svc = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const userId = searchParams.get('state')
  const error = searchParams.get('error')

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

  if (error || !code || !userId) {
    return NextResponse.redirect(`${siteUrl}/dashboard?google_error=1`)
  }

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${siteUrl}/api/google/callback`,
      grant_type: 'authorization_code',
    }),
  })

  const tokens = await tokenRes.json()
  if (!tokens.access_token) {
    return NextResponse.redirect(`${siteUrl}/dashboard?google_error=2`)
  }

  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

  // Get their Google Business account + first location
  const accountsRes = await fetch(
    'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
    { headers: { Authorization: `Bearer ${tokens.access_token}` } }
  )
  const accountsData = await accountsRes.json()
  const account = accountsData.accounts?.[0]

  let locationName = null
  if (account) {
    const locRes = await fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title`,
      { headers: { Authorization: `Bearer ${tokens.access_token}` } }
    )
    const locData = await locRes.json()
    locationName = locData.locations?.[0]?.name ?? null
  }

  // Get store_id for this user
  const { data: store } = await svc()
    .from('stores')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (!store) {
    return NextResponse.redirect(`${siteUrl}/dashboard?google_error=3`)
  }

  // Save tokens
  await svc().from('google_oauth_tokens').upsert({
    store_id: store.id,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token ?? null,
    expires_at: expiresAt,
    google_account_id: account?.name ?? null,
    google_location_name: locationName,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'store_id' })

  // Trigger initial sync
  await fetch(`${siteUrl}/api/google/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ store_id: store.id }),
  })

  return NextResponse.redirect(`${siteUrl}/dashboard?google_connected=1`)
}
