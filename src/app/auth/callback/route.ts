import { NextResponse } from 'next/server'
// The client you created in Step 2
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in search params, use it as the redirection URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Fetch the user's role from the database to ensure correct redirection
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      const userRole = profile?.role
      const intendedRole = next.split('/')[1]
      const passwordSet = data.user.user_metadata?.password_set

      // If they chose a specific role but their account has a different one
      if (intendedRole && userRole && intendedRole !== userRole && intendedRole !== '') {
        return NextResponse.redirect(`${origin}/login?error=role_mismatch`)
      }

      // If they haven't set a password yet (first-time Google login)
      if (!passwordSet && userRole) {
        return NextResponse.redirect(`${origin}/auth/setup-password?role=${userRole}`)
      }

      if (userRole) {
        return NextResponse.redirect(`${origin}/${userRole}`)
      }
      
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
