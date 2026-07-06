'use client'

import { createAuthClient } from 'better-auth/react'

const getBaseUrl = () => {
  if (typeof window === 'undefined') return ''
  
  // For v0 preview
  if (window.location.hostname.includes('v0.app')) {
    return ''
  }
  
  // For production and preview deployments
  return ''
}

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
})

export const { signIn, signUp, signOut, useSession } = authClient
