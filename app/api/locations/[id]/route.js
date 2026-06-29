import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const svc = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// DELETE /api/locations/[id]
export async function DELETE(request, { params }) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: store } = await supabase.from('stores').select('id').eq('user_id', user.id).single()
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 })

  // Make sure the location belongs to this store
  const { data: loc } = await svc().from('locations').select('store_id').eq('id', params.id).single()
  if (!loc || loc.store_id !== store.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await svc().from('locations').delete().eq('id', params.id)

  return NextResponse.json({ ok: true })
}

// PATCH /api/locations/[id] — update name/address/google_review_url
export async function PATCH(request, { params }) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: store } = await supabase.from('stores').select('id').eq('user_id', user.id).single()
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 })

  const { data: loc } = await svc().from('locations').select('store_id').eq('id', params.id).single()
  if (!loc || loc.store_id !== store.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await request.json()
  const allowed = ['name', 'address', 'google_review_url']
  const updates = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)))

  const { data: updated, error } = await svc()
    .from('locations')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ location: updated })
}
