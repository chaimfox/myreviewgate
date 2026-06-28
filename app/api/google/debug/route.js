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
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: store } = await supabase.from('stores').select('id').eq('user_id', user.id).single()
  const { data: tokenRow } = await svc().from('google_oauth_tokens').select('*').eq('store_id', store.id).single()

  if (!tokenRow) return NextResponse.json({ error: 'no token row' })

  // Test accounts API (v4 legacy)
  const accountsRes = await fetch(
    'https://mybusiness.googleapis.com/v4/accounts',
    { headers: { Authorization: `Bearer ${tokenRow.access_token}` } }
  )
  const accounts = await accountsRes.json()

  // Test locations API if we have an account
  let locations = null
  const accountName = accounts.accounts?.[0]?.name
  if (accountName) {
    const locRes = await fetch(
      `https://mybusiness.googleapis.com/v4/${accountName}/locations?pageSize=10`,
      { headers: { Authorization: `Bearer ${tokenRow.access_token}` } }
    )
    locations = await locRes.json()
  }

  // Test reviews API with stored location name
  let reviews = null
  if (tokenRow.google_location_name) {
    const revRes = await fetch(
      `https://mybusiness.googleapis.com/v4/${tokenRow.google_location_name}/reviews`,
      { headers: { Authorization: `Bearer ${tokenRow.access_token}` } }
    )
    reviews = await revRes.json()
  }

  return NextResponse.json({
    token_stored: !!tokenRow.access_token,
    stored_location_name: tokenRow.google_location_name,
    stored_account_id: tokenRow.google_account_id,
    accounts,
    locations,
    reviews,
  })
}
