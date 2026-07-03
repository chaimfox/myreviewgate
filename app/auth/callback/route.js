import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Supabase OAuth (e.g. "Sign in with Google") redirects here with a ?code=
// param after the provider approves the user; exchanging it sets the
// session cookie. From here we branch: existing store owners / admins /
// branch managers go straight to /dashboard, but a brand-new Google
// sign-up has no store row yet and needs to finish the business-details
// step of registration first.
export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const [{ data: store }, { data: profile }] = await Promise.all([
        supabase.from('stores').select('id').eq('user_id', user.id).maybeSingle(),
        supabase.from('profiles').select('role, location_id').eq('id', user.id).maybeSingle(),
      ])
      const hasAccess = !!store || profile?.role === 'super_admin' || !!profile?.location_id
      if (!hasAccess) {
        return NextResponse.redirect(new URL('/register?google=1', requestUrl.origin))
      }
    }
  }

  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
}
