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

export default function ConfirmInvestmentPage() {
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
        console.error('Error loading plan:', err)
        setError('Failed to load plan details')
      } finally {
        setLoading(false)
      }
    }

    loadPlan()
  }, [planId, amount, router])

  const handleConfirm = async () => {
    if (!plan || !amount) return

    setIsProcessing(true)
    setError('')

    try {
      const investmentAmount = parseFloat(amount)
      await createInvestment(plan.id, investmentAmount)
      router.push('/dashboard?success=true')
    } catch (err: any) {
      setError(err.message || 'Failed to create investment')
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!plan || !amount) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Invalid investment details</p>
          <Link href="/investments/browse">
            <Button variant="outline">Back to Plans</Button>
          </Link>
        </div>
      </div>
    )
  }

  const investmentAmount = parseFloat(amount)
  const dailyReturn = (investmentAmount * parseFloat(plan.dailyProfit)) / 100
  const totalReturn = (investmentAmount * parseFloat(plan.totalROI)) / 100
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + plan.duration)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary">WealthVault</h1>
          <Link href="/investments/browse">
            <Button variant="outline">Back</Button>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-4">Confirm Your Investment</h2>
          <p className="text-muted-foreground">Review the details before finalizing your investment</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Investment Summary */}
          <div className="bg-card rounded-lg border border-border p-8">
            <h3 className="text-2xl font-bold mb-8">Investment Details</h3>

            <div className="space-y-6">
              <div>
                <div className="text-muted-foreground text-sm mb-2">Plan Name</div>
                <div className="text-xl font-bold">{plan.name}</div>
              </div>

              <div>
                <div className="text-muted-foreground text-sm mb-2">Investment Amount</div>
                <div className="text-3xl font-bold text-primary">${investmentAmount.toFixed(2)}</div>
              </div>

              <div className="bg-background p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Daily Return</span>
                  <span className="font-bold text-primary">${dailyReturn.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-3">
                  <span className="text-muted-foreground">Total Return (30 days)</span>
                  <span className="font-bold text-primary">${totalReturn.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <div className="text-muted-foreground text-sm mb-2">Investment Period</div>
                <div className="font-semibold">{plan.duration} Days</div>
                <div className="text-sm text-muted-foreground">
                  Until {endDate.toLocaleDateString()}
                </div>
              </div>

              <div>
                <div className="text-muted-foreground text-sm mb-2">Total ROI</div>
                <div className="text-xl font-bold text-primary">{plan.totalROI}%</div>
              </div>
            </div>
          </div>

          {/* Confirmation */}
          <div className="bg-card rounded-lg border border-border p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-8">Complete Your Investment</h3>

              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/20 text-primary">
                      ✓
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold">Secure Investment</div>
                    <div className="text-sm text-muted-foreground">Your funds are protected</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/20 text-primary">
                      ✓
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold">Daily Returns</div>
                    <div className="text-sm text-muted-foreground">Earn ${dailyReturn.toFixed(2)} every day</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/20 text-primary">
                      ✓
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold">Automatic Compounding</div>
                    <div className="text-sm text-muted-foreground">
                      Your returns are automatically added to your account
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-destructive/20 border border-destructive rounded-lg text-destructive text-sm">
                  {error}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-lg font-semibold"
                onClick={handleConfirm}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Confirm Investment'}
              </Button>
              <Link href="/investments/browse" className="block">
                <Button variant="outline" className="w-full py-6 text-lg">
                  Cancel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
