import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, {
                ...options,
                maxAge: 60 * 60 * 24 * 365, // Persistent for 1 year
            })
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Whitelisted paths that don't require authentication
  const isAuthPath = pathname.startsWith('/login') || 
                     pathname.startsWith('/auth') || 
                     pathname.startsWith('/signup') || 
                     pathname === '/'

  // Paths that are role-specific
  const rolePaths = ['student', 'tutor', 'parent', 'admin']
  const pathRole = pathname.split('/')[1]
  const isRolePath = rolePaths.includes(pathRole)

  // 1. If logged in, enforce role-based access
  if (user && isRolePath) {
    const userRole = user.user_metadata?.role

    if (userRole && pathRole !== userRole) {
      // Role mismatch! Redirect to their correct dashboard
      const url = request.nextUrl.clone()
      url.pathname = `/${userRole}`
      return NextResponse.redirect(url)
    }
  }

  // 2. If NOT logged in, allow "Preview" access to role paths but block others
  if (!user && !isAuthPath && !isRolePath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
