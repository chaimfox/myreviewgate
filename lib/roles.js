import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export async function getMyProfile() {
  const supabase = createClientComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  return data
}

export function roleRedirect(role) {
  if (role === 'super_admin') return '/admin'
  if (role === 'store_owner') return '/dashboard'
  return null
}
