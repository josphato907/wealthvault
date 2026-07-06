'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { createDepositTransaction } from '@/app/actions/payments'

const methodDetails = {
  'bank-transfer': {
    name: 'Bank Transfer',
    instructions: [
      'Our Bank Details:',
      'Bank Name: Global Investment Bank',
      'Account: 1234567890',
      'SWIFT: GIBAUS33',
      'Reference: Use your email as reference',
    ],
    minAmount: 100,
    maxAmount: 100000,
  },
  crypto: {
    name: 'Cryptocurrency',
    instructions: [
      'Send to our crypto wallet:',
      'Bitcoin: 1A1z7agoat2...',
      'Ethereum: 0x742d35Cc6634C0532925a3b844Bc9e7595f...',
      'Ensure sufficient network fees',
      'Send from verified wallet only',
    ],
    minAmount: 100,
    maxAmount: 500000,
  },
  mpesa: {
    name: 'M-Pesa',
    instructions: [
      'Dial *150#',
      'Select Lipa na M-Pesa Online',
      'Business Shortcode: 174379',
      'Amount: Enter desired amount',
      'PIN: Enter your M-Pesa PIN',
    ],
    minAmount: 100,
    maxAmount: 70000,
  },
  'credit-card': {
    name: 'Credit/Debit Card',
    instructions: [
      'You will be redirected to our secure payment processor',
      'Accepted: Visa, Mastercard',
      '2.5% processing fee applies',
      'Payments processed instantly',
      'You will receive confirmation email',
    ],
    minAmount: 50,
    maxAmount: 50000,
  },
}

export default function DepositPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const method = searchParams.get('method') || 'bank-transfer'

  const [amount, setAmount] = useState('')
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const methodInfo = methodDetails[method as keyof typeof methodDetails] || methodDetails['bank-transfer']

  useEffect(() => {
    const checkAuth = async () => {
      const userSession = await authClient.getSession()
      if (!userSession?.user) {
        router.push('/sign-in')
      } else {
        setSession(userSession)
      }
      setLoading(false)
    }

    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!amount || parseFloat(amount) < methodInfo.minAmount) {
      setError(`Minimum deposit is $${methodInfo.minAmount}`)
      return
    }

    if (parseFloat(amount) > methodInfo.maxAmount) {
      setError(`Maximum deposit is $${methodInfo.maxAmount}`)
      return
    }

    try {
      setSubmitting(true)
      await createDepositTransaction({
        amount: parseFloat(amount),
        method,
      })
      router.push('/payments/confirmation?amount=' + amount + '&method=' + method)
    } catch (err) {
      setError('Failed to create transaction. Please try again.')
      console.error('[v0] Error creating deposit:', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-background" />

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
        <Link href="/dashboard" className="text-2xl font-bold text-primary">
          WealthVault
        </Link>
        <Button variant="ghost" onClick={() => router.back()}>
          Back
        </Button>
      </nav>

      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Deposit Funds</h1>
          <p className="text-muted-foreground text-lg">via {methodInfo.name}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Deposit Form */}
          <div className="p-6 rounded-lg border border-border bg-card">
            <h2 className="text-2xl font-bold mb-6">Enter Amount</h2>

            {error && (
              <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Deposit Amount (USD)</label>
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-muted-foreground mr-2">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min={methodInfo.minAmount}
                    max={methodInfo.maxAmount}
                    className="flex-1 px-4 py-3 rounded bg-input border border-border text-foreground placeholder-muted-foreground text-2xl font-bold"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Min: ${methodInfo.minAmount} | Max: ${methodInfo.maxAmount}
                </p>
              </div>

              {amount && (
                <div className="p-4 rounded bg-muted/30 border border-border">
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-semibold">${parseFloat(amount || '0').toFixed(2)}</span>
                  </div>
                  {method === 'credit-card' && (
                    <div className="flex justify-between mb-2">
                      <span className="text-muted-foreground">Fee (2.5%):</span>
                      <span className="font-semibold">${(parseFloat(amount) * 0.025).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-border pt-2 flex justify-between">
                    <span className="font-bold">Total:</span>
                    <span className="font-bold text-primary">
                      ${(parseFloat(amount || '0') * (method === 'credit-card' ? 1.025 : 1)).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={!amount || submitting}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-lg font-semibold"
              >
                {submitting ? 'Processing...' : 'Continue to Payment'}
              </Button>
            </form>
          </div>

          {/* Payment Instructions */}
          <div className="p-6 rounded-lg border border-border bg-card">
            <h2 className="text-2xl font-bold mb-6">Payment Instructions</h2>
            <div className="space-y-4">
              {methodInfo.instructions.map((instruction, idx) => (
                <div key={idx} className={instruction.includes(':') ? 'font-semibold' : ''}>
                  {instruction}
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm">
              <p className="font-semibold mb-2">Important:</p>
              <ul className="space-y-1 text-xs">
                <li>• Keep your transaction reference for support</li>
                <li>• Deposits are verified within 24 hours</li>
                <li>• Contact support if funds are not credited</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
