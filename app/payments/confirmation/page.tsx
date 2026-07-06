import { Suspense } from 'react'
import { PaymentConfirmationClient } from '@/components/payment-confirmation-client'

export default function PaymentConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading payment confirmation...</p>
        </div>
      </div>
    }>
      <PaymentConfirmationClient />
    </Suspense>
  )
}
