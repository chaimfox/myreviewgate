import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const svc = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// listUsers() is paginated (default 50/page) — walk every page so owners
// who signed up after the first ~1000 users can still be found by email.
async function findUserByEmail(admin, email) {
  const target = email.toLowerCase()
  const perPage = 1000
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage })
    if (error) throw error
    const found = data.users.find(u => u.email?.toLowerCase() === target)
    if (found) return found
    if (data.users.length < perPage) return null
  }
}

// POST /api/admin/assign-location
// Body: { email, location_id }  — assigns a user as branch manager for a location
export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'super_admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { email, location_id } = await request.json()
  if (!email || !location_id) return NextResponse.json({ error: 'email and location_id required' }, { status: 400 })

  // Find user by email using admin API
  let target
  try {
    target = await findUserByEmail(svc(), email)
  } catch (listErr) {
    return NextResponse.json({ error: listErr.message }, { status: 500 })
  }
  if (!target) return NextResponse.json({ error: 'משתמש לא נמצא עם המייל הזה' }, { status: 404 })

  // Upsert profile with location_id
  const { error } = await svc().from('profiles').upsert({
    id: target.id,
    location_id,
    role: 'branch_manager',
  }, { onConflict: 'id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, user_email: target.email })
}

// DELETE /api/admin/assign-location
// Body: { location_id } — removes branch manager from a location
export async function DELETE(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'super_admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { location_id } = await request.json()

  // Clear location_id for all managers of this location
  await svc().from('profiles')
    .update({ location_id: null, role: null })
    .eq('location_id', location_id)
    .eq('role', 'branch_manager')

  return NextResponse.json({ ok: true })
}
