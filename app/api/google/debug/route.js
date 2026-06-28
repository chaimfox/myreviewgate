import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const svc = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: userErr } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ step: 'auth', error: userErr?.message ?? 'not logged in' })

    const { data: store, error: storeErr } = await supabase.from('stores').select('id').eq('user_id', user.id).single()
    if (!store) return NextResponse.json({ step: 'store', error: storeErr?.message ?? 'no store', user_id: user.id })

    const { data: tokenRow, error: tokenErr } = await svc()
      .from('google_oauth_tokens').select('*').eq('store_id', store.id).single()
    if (!tokenRow) return NextResponse.json({ step: 'token', error: tokenErr?.message ?? 'no token row', store_id: store.id })

    const result = {
      step: 'ok',
      store_id: store.id,
      token_stored: !!tokenRow.access_token,
      stored_location_name: tokenRow.google_location_name,
      stored_account_id: tokenRow.google_account_id,
      expires_at: tokenRow.expires_at,
    }

    // Test accounts API
    try {
      const accountsRes = await fetch(
        'https://mybusiness.googleapis.com/v4/accounts',
        { headers: { Authorization: `Bearer ${tokenRow.access_token}` } }
      )
      result.accounts = await accountsRes.json()
    } catch (e) {
      result.accounts_error = e.message
    }

    // Test locations if we have an account
    const accountName = result.accounts?.accounts?.[0]?.name
    if (accountName) {
      try {
        const locRes = await fetch(
          `https://mybusiness.googleapis.com/v4/${accountName}/locations?pageSize=10`,
          { headers: { Authorization: `Bearer ${tokenRow.access_token}` } }
        )
        result.locations = await locRes.json()
      } catch (e) {
        result.locations_error = e.message
      }
    }

    // Test reviews if we have stored location
    if (tokenRow.google_location_name) {
      try {
        const revRes = await fetch(
          `https://mybusiness.googleapis.com/v4/${tokenRow.google_location_name}/reviews`,
          { headers: { Authorization: `Bearer ${tokenRow.access_token}` } }
        )
        result.reviews = await revRes.json()
      } catch (e) {
        result.reviews_error = e.message
      }
    }

    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ step: 'crash', error: err.message, stack: err.stack?.split('\n').slice(0,5) })
  }
}
