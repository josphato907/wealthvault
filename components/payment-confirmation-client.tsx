'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function PaymentConfirmationClient() {
  const searchParams = useSearchParams()
  const amount = searchParams.get('amount') || '0'
  const method = searchParams.get('method') || 'unknown'

  const methodNames: { [key: string]: string } = {
    'bank-transfer': 'Bank Transfer',
    crypto: 'Cryptocurrency',
    mpesa: 'M-Pesa',
    'credit-card': 'Credit/Debit Card',
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="p-8 rounded-lg border border-border bg-card text-center">
          <div className="text-6xl mb-6">✓</div>
          <h1 className="text-3xl font-bold mb-3">Deposit Submitted</h1>
          <p className="text-muted-foreground mb-8">Your deposit request has been submitted for verification</p>

          <div className="bg-muted/30 rounded p-6 mb-8 space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Amount</div>
              <div className="text-3xl font-bold text-primary">${parseFloat(amount).toFixed(2)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Payment Method</div>
              <div className="text-lg font-semibold">{methodNames[method] || method}</div>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded p-4 mb-8 text-sm text-left">
            <p className="font-semibold text-blue-300 mb-2">What happens next:</p>
            <ol className="space-y-2 text-blue-200 text-xs">
              <li>1. Our team will verify your deposit within 24 hours</li>
              <li>2. Funds will be credited to your wallet</li>
              <li>3. You can then invest in your preferred plans</li>
              <li>4. You will receive an email confirmation</li>
            </ol>
          </div>

          <div className="space-y-3">
            <Link href="/wallet" className="block">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                View Wallet
              </Button>
            </Link>
            <Link href="/dashboard" className="block">
              <Button variant="outline" className="w-full">
                Back to Dashboard
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground mt-6">
            Transaction ID: <span className="font-mono">TXN-{Math.random().toString(36).substring(7).toUpperCase()}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
