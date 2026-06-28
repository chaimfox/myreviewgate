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

  // Test with just contact_email to debug
  const testKey = 'contact_email'
  const testValue = body[testKey]

  const { data: upData, error: upErr } = await svc()
    .from('site_settings')
    .update({ value: String(testValue ?? ''), updated_at: now })
    .eq('key', testKey)
    .select()

  console.log('DEBUG update result:', JSON.stringify({ data: upData, error: upErr }))

  // Full save for all keys
  const rows = Object.entries(body).map(([key, value]) => ({
    key,
    value: String(value),
    updated_at: now,
  }))

  const { data: upsData, error: upsErr } = await svc()
    .from('site_settings')
    .upsert(rows, { onConflict: 'key' })
    .select()

  console.log('DEBUG upsert result:', JSON.stringify({ count: upsData?.length, error: upsErr }))

  if (upsErr) return NextResponse.json({ error: upsErr.message, debug: { upData, upErr } }, { status: 500 })
  return NextResponse.json({ ok: true, debug: { updateRows: upData, upsertRows: upsData?.length } })
}
