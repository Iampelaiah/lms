import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const intendedRole = next.split('?')[0].split('/').filter(Boolean)[0] // e.g. 'tutor' or 'student'

      // Check if user already has a profile (returning user)
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (existingProfile) {
        // RETURNING USER: enforce role — block if they're trying the wrong portal
        if (intendedRole && existingProfile.role?.toLowerCase() !== intendedRole.toLowerCase()) {
          await supabase.auth.signOut()
          return NextResponse.redirect(
            `${origin}/login?error=${encodeURIComponent(`This account is registered as a ${existingProfile.role}. Please use the correct portal.`)}`
          )
        }

        // Check approval status
        if (!existingProfile.is_approved) {
          await supabase.auth.signOut()
          return NextResponse.redirect(
            `${origin}/login?message=${encodeURIComponent('Your account is pending admin approval.')}`
          )
        }

        // Redirect to their actual dashboard
        let rolePath = existingProfile.role.toLowerCase()
        if (rolePath === 'school admin') rolePath = 'admin'

        const destination = `/${rolePath}`
        return NextResponse.redirect(`${origin}${destination}`)
      }

      // NEW USER: The database trigger handle_new_user should have already created the profile.
      // We just need to check if it's approved (unlikely for new users) and redirect.

      await supabase.auth.signOut()

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      const message = encodeURIComponent('Signup successful! Your account is pending admin approval.')
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}/login?message=${message}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}/login?message=${message}`)
      } else {
        return NextResponse.redirect(`${origin}/login?message=${message}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
