'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { getInvestmentPlans, createInvestment } from '@/app/actions/investments'

interface InvestmentPlan {
  id: string
  name: string
  dailyProfit: string
  duration: number
  totalROI: string
}

export function InvestmentConfirmClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planId = searchParams.get('planId')
  const amount = searchParams.get('amount')

  const [plan, setPlan] = useState<InvestmentPlan | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const session = await authClient.getSession()
        if (!session?.user) {
          router.push('/sign-in')
          return
        }

        if (!planId || !amount) {
          router.push('/investments/browse')
          return
        }

        const plans = await getInvestmentPlans()
        const selectedPlan = plans.find((p) => p.id === planId)
        if (selectedPlan) {
          setPlan(selectedPlan as InvestmentPlan)
        } else {
          router.push('/investments/browse')
        }
      } catch (err) {
        setError('Failed to load investment plan')
      } finally {
        setLoading(false)
      }
    }

    loadPlan()
  }, [planId, amount, router])

  const handleConfirm = async () => {
    if (!planId || !amount || !plan) return

    setIsProcessing(true)
    setError('')

    try {
      const session = await authClient.getSession()
      if (!session?.user) {
        router.push('/sign-in')
        return
      }

      await createInvestment({
        planId,
        amount: parseFloat(amount),
      })

      router.push('/dashboard?investment=success')
    } catch (err) {
      setError('Failed to create investment. Please try again.')
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading investment details...</p>
        </div>
      </div>
    )
  }

  if (!plan || !planId || !amount) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Invalid investment details</p>
          <Link href="/investments/browse">
            <Button>Back to Investment Plans</Button>
          </Link>
        </div>
      </div>
    )
  }

  const investmentAmount = parseFloat(amount)
  const dailyProfit = (investmentAmount * parseFloat(plan.dailyProfit)) / 100
  const totalEarnings = dailyProfit * plan.duration
  const totalReturn = investmentAmount + totalEarnings

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Confirm Investment</h1>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        <div className="bg-card border border-border rounded-lg p-8 space-y-6">
          <div className="space-y-2">
            <p className="text-muted-foreground">Investment Plan</p>
            <p className="text-2xl font-bold text-primary">{plan.name}</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-muted-foreground text-sm">Investment Amount</p>
              <p className="text-2xl font-bold">${investmentAmount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Daily Profit Rate</p>
              <p className="text-2xl font-bold text-primary">{plan.dailyProfit}%</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Daily Earnings</p>
              <p className="text-2xl font-bold text-accent">${dailyProfit.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Duration</p>
              <p className="text-2xl font-bold">{plan.duration} days</p>
            </div>
          </div>

          <div className="border-t border-border pt-6 space-y-3">
            <div className="flex justify-between text-lg">
              <span className="text-muted-foreground">Total Earnings (30 days)</span>
              <span className="font-bold text-primary">${totalEarnings.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-2xl font-bold">
              <span>Total Return</span>
              <span className="text-primary">${totalReturn.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-muted/30 border border-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              By confirming, you agree to invest the specified amount in this plan. Your investment will start earning daily profits immediately.
            </p>
          </div>

          <div className="flex gap-4">
            <Link href="/investments/browse" className="flex-1">
              <Button variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
            <Button
              onClick={handleConfirm}
              disabled={isProcessing}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isProcessing ? 'Processing...' : 'Confirm Investment'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
