import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { pathname } = req.nextUrl

  // ── Slug pages: block suspended stores before the page even renders ──
  const isSlugPage = /^\/[^/]+$/.test(pathname) &&
    !['/', '/login', '/register', '/privacy', '/terms', '/contact', '/accessibility'].includes(pathname) &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/_next')

  if (isSlugPage) {
    const slug = pathname.slice(1)
    const { data: store } = await supabase
      .from('stores')
      .select('status')
      .eq('slug', slug)
      .single()

    if (store?.status === 'suspended') {
      return NextResponse.redirect(new URL(`/suspended?store=${encodeURIComponent(slug)}`, req.url))
    }
  }

  // ── Auth routes ──────────────────────────────────────────────────────
  const { data: { session } } = await supabase.auth.getSession()
  const isAdminPath     = pathname.startsWith('/admin')
  const isDashboardPath = pathname.startsWith('/dashboard')
  const isLoginPath     = pathname === '/login'

  if (!session && (isAdminPath || isDashboardPath)) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

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

  return res
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/login',
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
}
