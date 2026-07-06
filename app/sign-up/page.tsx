import { headers } from 'next/headers'
import { AuthForm } from '@/components/auth-form'
import { auth } from '@/lib/auth'

export default async function SignUpPage() {
  try {
    const headersList = await headers()
    const session = await auth.api.getSession({ headers: headersList })
    if (session?.user) {
      const { redirect } = await import('next/navigation')
      redirect('/')
    }
  } catch (error) {
    console.error('[v0] Error checking session in sign-up:', error)
    // Continue to show sign-up form even if session check fails
  }
  
  return <AuthForm mode="sign-up" />
}
