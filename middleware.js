import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  const { pathname } = req.nextUrl

  const isAdminPath = pathname.startsWith('/admin')
  const isDashboardPath = pathname.startsWith('/dashboard')
  const isLoginPath = pathname === '/login'

  // No session → send to login
  if (!session && (isAdminPath || isDashboardPath)) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Has session on login → decide where to go based on role
  if (session && isLoginPath) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile?.role === 'super_admin') {
      return NextResponse.redirect(new URL('/admin', req.url))
    }
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Let all other authenticated requests through — pages handle their own role checks
  return res
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/login'],
}
