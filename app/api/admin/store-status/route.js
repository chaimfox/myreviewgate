import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { sendApprovalEmail } from '@/lib/email'

const svc = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function requireSuperAdmin() {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'super_admin' ? user : null
}

export async function POST(request) {
  const admin = await requireSuperAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { storeId, status, blockedReason } = await request.json()
  if (!storeId || !status) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const update = { status }
  if (status === 'suspended') update.blocked_reason = blockedReason || null
  if (status === 'approved')  update.blocked_reason = null

  const db = svc()
  const { error } = await db.from('stores').update(update).eq('id', storeId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Send approval email to store owner
  if (status === 'approved') {
    const { data: store } = await db
      .from('stores')
      .select('name, owner_email, slug')
      .eq('id', storeId)
      .single()
    if (store) {
      await sendApprovalEmail({
        ownerEmail: store.owner_email,
        storeName: store.name,
        slug: store.slug,
      })
    }
  }

  return NextResponse.json({ ok: true })
}
