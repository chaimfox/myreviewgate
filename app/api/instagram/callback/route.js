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
  const redirectUri = `${siteUrl}/api/instagram/callback`

  if (error || !code || !userId) {
    return NextResponse.redirect(`${siteUrl}/dashboard?instagram_error=1`)
  }

  try {
    // Exchange code for a short-lived user access token
    const tokenParams = new URLSearchParams({
      client_id: process.env.META_APP_ID,
      client_secret: process.env.META_APP_SECRET,
      redirect_uri: redirectUri,
      code,
    })
    const tokenRes = await fetch(`https://graph.facebook.com/v21.0/oauth/access_token?${tokenParams}`)
    const tokenData = await tokenRes.json()
    if (!tokenData.access_token) {
      return NextResponse.redirect(`${siteUrl}/dashboard?instagram_error=2`)
    }

    // Exchange for a long-lived token (~60 days)
    const exchangeParams = new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: process.env.META_APP_ID,
      client_secret: process.env.META_APP_SECRET,
      fb_exchange_token: tokenData.access_token,
    })
    const exchangeRes = await fetch(`https://graph.facebook.com/v21.0/oauth/access_token?${exchangeParams}`)
    const exchangeData = await exchangeRes.json()
    const accessToken = exchangeData.access_token ?? tokenData.access_token
    const expiresIn = exchangeData.expires_in ?? tokenData.expires_in ?? 5184000 // 60 days fallback
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

    // Find the user's Facebook Page, then its linked Instagram Business account
    let pageId = null
    let igBusinessId = null
    let igUsername = null
    try {
      const pagesRes = await fetch(
        `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,instagram_business_account&access_token=${accessToken}`
      )
      const pagesData = await pagesRes.json()
      const pageWithIg = (pagesData.data ?? []).find(p => p.instagram_business_account)

      if (pageWithIg) {
        pageId = pageWithIg.id
        igBusinessId = pageWithIg.instagram_business_account.id

        const igRes = await fetch(
          `https://graph.facebook.com/v21.0/${igBusinessId}?fields=username&access_token=${accessToken}`
        )
        const igData = await igRes.json()
        igUsername = igData.username ?? null
      }
    } catch (_) {
      // Page/IG lookup failed — token still saved, sync can retry later
    }

    if (!igBusinessId) {
      return NextResponse.redirect(`${siteUrl}/dashboard?instagram_error=3`)
    }

    const { data: store } = await svc()
      .from('stores')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!store) {
      return NextResponse.redirect(`${siteUrl}/dashboard?instagram_error=4`)
    }

    await svc().from('instagram_oauth_tokens').upsert({
      store_id: store.id,
      access_token: accessToken,
      expires_at: expiresAt,
      facebook_page_id: pageId,
      instagram_business_id: igBusinessId,
      instagram_username: igUsername,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'store_id' })

    return NextResponse.redirect(`${siteUrl}/dashboard?instagram_connected=1`)
  } catch (err) {
    return NextResponse.redirect(`${siteUrl}/dashboard?instagram_error=500`)
  }
}
