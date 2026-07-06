import { Suspense } from 'react'
import { InvestmentConfirmClient } from '@/components/investment-confirm-client'

export default function ConfirmInvestmentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading investment details...</p>
        </div>
      </div>
    }>
      <InvestmentConfirmClient />
    </Suspense>
  )
}
