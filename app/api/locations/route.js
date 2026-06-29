import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const svc = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// GET /api/locations — list all locations for the current store
export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: store } = await supabase.from('stores').select('id, type, max_locations, location_slug_prefix').eq('user_id', user.id).single()
  if (!store) return NextResponse.json({ locations: [], chain: null })

  const { data: locations } = await svc()
    .from('locations')
    .select('*')
    .eq('store_id', store.id)
    .order('created_at', { ascending: true })

  // For each location, get review counts
  const enriched = await Promise.all((locations ?? []).map(async (loc) => {
    const [{ count: privateCount }, { count: googleCount }] = await Promise.all([
      svc().from('feedback').select('*', { count: 'exact', head: true }).eq('location_id', loc.id),
      svc().from('google_reviews').select('*', { count: 'exact', head: true }).eq('location_id', loc.id),
    ])
    return { ...loc, private_review_count: privateCount ?? 0, google_review_count_local: googleCount ?? 0 }
  }))

  return NextResponse.json({
    locations: enriched,
    chain: {
      type: store.type,
      max_locations: store.max_locations,
      prefix: store.location_slug_prefix,
      used: enriched.length,
    }
  })
}

// POST /api/locations — create a new location
export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: store } = await supabase.from('stores').select('id, type, max_locations, location_slug_prefix').eq('user_id', user.id).single()
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 })

  if (store.type !== 'chain') {
    return NextResponse.json({ error: 'החשבון שלך אינו חשבון רשת' }, { status: 403 })
  }

  // Check location limit
  const { count } = await svc().from('locations').select('*', { count: 'exact', head: true }).eq('store_id', store.id)
  if ((count ?? 0) >= store.max_locations) {
    return NextResponse.json({ error: `הגעת למגבלת הסניפים (${store.max_locations})` }, { status: 403 })
  }

  const body = await request.json()
  const { name, address, suffix, google_review_url } = body

  if (!name || !suffix) return NextResponse.json({ error: 'name and suffix are required' }, { status: 400 })

  // Build slug: prefix-suffix
  const prefix = store.location_slug_prefix || 'branch'
  const slug = `${prefix}-${suffix.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}`

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: 'מזהה לא חוקי' }, { status: 400 })
  }

  const { data: location, error } = await svc()
    .from('locations')
    .insert({ store_id: store.id, name, address: address || null, slug, google_review_url: google_review_url || null })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'כתובת URL זו כבר בשימוש' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ location })
}
