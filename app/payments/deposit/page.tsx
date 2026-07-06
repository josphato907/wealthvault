import { Suspense } from 'react'
import { DepositClient } from '@/components/deposit-client'

export default function DepositPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading deposit form...</p>
        </div>
      </div>
    }>
      <DepositClient />
    </Suspense>
  )
}
