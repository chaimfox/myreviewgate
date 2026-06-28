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
  const { data, error } = await svc().from('site_settings').select('key, value')
  if (error) return NextResponse.json({}, { headers: { 'Cache-Control': 'no-store' } })
  const result = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]))
  return NextResponse.json(result, {
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
  })
}

export async function PUT(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'super_admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const now = new Date().toISOString()
  const errors = []

  for (const [key, value] of Object.entries(body)) {
    // Try UPDATE first
    const { data: updated, error: updateErr } = await svc()
      .from('site_settings')
      .update({ value: String(value), updated_at: now })
      .eq('key', key)
      .select()

    if (updateErr) {
      errors.push(`update ${key}: ${updateErr.message}`)
      continue
    }

    // If no row was updated, INSERT
    if (!updated || updated.length === 0) {
      const { error: insertErr } = await svc()
        .from('site_settings')
        .insert({ key, value: String(value), updated_at: now })
      if (insertErr) errors.push(`insert ${key}: ${insertErr.message}`)
    }
  }

  if (errors.length > 0) {
    console.error('settings save errors:', errors)
    return NextResponse.json({ error: errors.join('; ') }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
