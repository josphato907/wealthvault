'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'

const paymentMethods = [
  {
    id: 'bank-transfer',
    name: 'Bank Transfer',
    description: 'Direct deposit to our verified bank account',
    icon: '🏦',
    fees: 'Variable by bank',
    time: '1-3 business days',
  },
  {
    id: 'crypto',
    name: 'Cryptocurrency',
    description: 'Bitcoin, Ethereum, and major altcoins',
    icon: '₿',
    fees: 'Network fees only',
    time: 'Instant to 30 mins',
  },
  {
    id: 'mpesa',
    name: 'M-Pesa',
    description: 'Mobile money payments (Africa)',
    icon: '📱',
    fees: 'Standard M-Pesa rates',
    time: 'Instant',
  },
  {
    id: 'credit-card',
    name: 'Credit/Debit Card',
    description: 'Visa, Mastercard, and other cards',
    icon: '💳',
    fees: '2.5% processing fee',
    time: 'Instant',
  },
]

export default function PaymentMethodsPage() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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

  if (loading) return <div className="min-h-screen bg-background" />

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
        <Link href="/dashboard" className="text-2xl font-bold text-primary">
          WealthVault
        </Link>
        <div className="flex gap-4">
          <Link href="/wallet">
            <Button variant="ghost">Wallet</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost">Dashboard</Button>
          </Link>
        </div>
      </nav>

      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-3">Deposit Funds</h1>
          <p className="text-xl text-muted-foreground">Choose your preferred payment method to fund your account</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {paymentMethods.map((method) => (
            <div key={method.id} className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
              <div className="text-5xl mb-4">{method.icon}</div>
              <h3 className="text-2xl font-bold mb-2">{method.name}</h3>
              <p className="text-muted-foreground mb-4">{method.description}</p>

              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Processing Fees:</span>
                  <span className="font-semibold">{method.fees}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Processing Time:</span>
                  <span className="font-semibold">{method.time}</span>
                </div>
              </div>

              <Button
                onClick={() => router.push(`/payments/deposit?method=${method.id}`)}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Deposit via {method.name}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 rounded-lg bg-card border border-border">
          <h3 className="text-xl font-bold mb-3">How It Works</h3>
          <ol className="space-y-3 text-muted-foreground">
            <li className="flex gap-3">
              <span className="font-bold text-primary">1.</span>
              <span>Choose your preferred payment method</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">2.</span>
              <span>Enter the deposit amount and complete payment</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">3.</span>
              <span>Funds will be credited to your wallet after verification</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">4.</span>
              <span>Start investing in your chosen plans immediately</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}
