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
  if (!store) return NextResponse.json({ reviews: [], connected: false })

  const { data: tokenRow } = await svc()
    .from('google_oauth_tokens')
    .select('google_location_name, updated_at')
    .eq('store_id', store.id)
    .single()

  const { data: reviews } = await svc()
    .from('google_reviews')
    .select('*')
    .eq('store_id', store.id)
    .order('published_at', { ascending: false })

  return NextResponse.json({
    connected: !!tokenRow,
    location: tokenRow?.google_location_name ?? null,
    last_sync: tokenRow?.updated_at ?? null,
    reviews: reviews ?? [],
  }, { headers: { 'Cache-Control': 'no-store' } })
}
