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
  const isExpiringSoon = new Date(tokenRow.expires_at) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  if (!isExpiringSoon) return tokenRow.access_token

  const params = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: process.env.META_APP_ID,
    client_secret: process.env.META_APP_SECRET,
    fb_exchange_token: tokenRow.access_token,
  })
  const res = await fetch(`https://graph.facebook.com/v21.0/oauth/access_token?${params}`)
  const data = await res.json()
  if (!data.access_token) throw new Error('Token refresh failed')

  const expiresAt = new Date(Date.now() + (data.expires_in ?? 5184000) * 1000).toISOString()
  await svc().from('instagram_oauth_tokens').update({
    access_token: data.access_token,
    expires_at: expiresAt,
    updated_at: new Date().toISOString(),
  }).eq('store_id', tokenRow.store_id)

  return data.access_token
}

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: store } = await supabase.from('stores').select('id, instagram_followers, instagram_media_count').eq('user_id', user.id).single()
  if (!store) return NextResponse.json({ connected: false })

  const { data: tokenRow } = await svc()
    .from('instagram_oauth_tokens')
    .select('instagram_username')
    .eq('store_id', store.id)
    .single()

  return NextResponse.json({
    connected: !!tokenRow,
    username: tokenRow?.instagram_username ?? null,
    followers_count: store.instagram_followers,
    media_count: store.instagram_media_count,
  }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST() {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: store } = await supabase.from('stores').select('id').eq('user_id', user.id).single()
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 })

  const { data: tokenRow } = await svc()
    .from('instagram_oauth_tokens')
    .select('*')
    .eq('store_id', store.id)
    .single()

  if (!tokenRow) return NextResponse.json({ error: 'Not connected to Instagram' }, { status: 400 })

  try {
    const accessToken = await getValidToken(tokenRow)

    const res = await fetch(
      `https://graph.facebook.com/v21.0/${tokenRow.instagram_business_id}?fields=username,followers_count,media_count&access_token=${accessToken}`
    )
    const data = await res.json()
    if (data.error) throw new Error(data.error.message)

    await svc().from('stores').update({
      instagram_followers: data.followers_count ?? null,
      instagram_media_count: data.media_count ?? null,
    }).eq('id', store.id)

    if (data.username && data.username !== tokenRow.instagram_username) {
      await svc().from('instagram_oauth_tokens').update({ instagram_username: data.username }).eq('store_id', store.id)
    }

    return NextResponse.json({
      followers_count: data.followers_count ?? null,
      media_count: data.media_count ?? null,
      username: data.username ?? tokenRow.instagram_username,
    })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
