'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { getInvestmentPlans } from '@/app/actions/investments'

interface InvestmentPlan {
  id: string
  name: string
  description?: string
  type: string
  minAmount: string
  maxAmount?: string
  dailyProfit: string
  duration: number
  totalROI: string
  featured: boolean
}

export default function BrowsePlansPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<InvestmentPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [investmentAmount, setInvestmentAmount] = useState('')

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const session = await authClient.getSession()
        if (!session?.user) {
          router.push('/sign-in')
          return
        }

        const plansData = await getInvestmentPlans()
        setPlans(plansData)
      } catch (error) {
        console.error('Error loading plans:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPlans()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading investment plans...</div>
      </div>
    )
  }

  const goldPlans = plans.filter((p) => p.type === 'gold')
  const cryptoPlans = plans.filter((p) => p.type === 'crypto')

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary">WealthVault</h1>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-4">Investment Plans</h2>
          <p className="text-muted-foreground">
            Choose the perfect investment plan to grow your wealth with daily returns
          </p>
        </div>

        {/* Gold Plans */}
        {goldPlans.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <span className="text-3xl">✨</span> Gold Investment Plans
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              {goldPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`p-8 rounded-lg border-2 transition-all ${
                    selectedPlan === plan.id
                      ? 'border-primary bg-background'
                      : 'border-border hover:border-primary'
                  }`}
                >
                  <div className="mb-6">
                    <h4 className="text-2xl font-bold mb-2">{plan.name}</h4>
                    {plan.description && (
                      <p className="text-muted-foreground text-sm">{plan.description}</p>
                    )}
                  </div>

                  <div className="space-y-4 mb-8 bg-card p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Daily Return</span>
                      <span className="font-bold text-primary">{plan.dailyProfit}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total ROI</span>
                      <span className="font-bold text-primary">{plan.totalROI}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-bold">{plan.duration} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Min Investment</span>
                      <span className="font-bold">${parseFloat(plan.minAmount).toFixed(2)}</span>
                    </div>
                    {plan.maxAmount && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Max Investment</span>
                        <span className="font-bold">${parseFloat(plan.maxAmount).toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  {selectedPlan === plan.id ? (
                    <div className="space-y-4">
                      <input
                        type="number"
                        placeholder="Investment Amount"
                        value={investmentAmount}
                        onChange={(e) => setInvestmentAmount(e.target.value)}
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        min={parseFloat(plan.minAmount)}
                        max={plan.maxAmount ? parseFloat(plan.maxAmount) : undefined}
                      />
                      <div className="flex gap-4">
                        <Button
                          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                          onClick={() => {
                            if (investmentAmount) {
                              router.push(`/investments/confirm?planId=${plan.id}&amount=${investmentAmount}`)
                            }
                          }}
                        >
                          Invest Now
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setSelectedPlan(null)
                            setInvestmentAmount('')
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      Select Plan
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Crypto Plans */}
        {cryptoPlans.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <span className="text-3xl">💎</span> Crypto Investment Plans
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              {cryptoPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`p-8 rounded-lg border-2 transition-all ${
                    selectedPlan === plan.id
                      ? 'border-primary bg-background'
                      : 'border-border hover:border-primary'
                  }`}
                >
                  <div className="mb-6">
                    <h4 className="text-2xl font-bold mb-2">{plan.name}</h4>
                    {plan.description && (
                      <p className="text-muted-foreground text-sm">{plan.description}</p>
                    )}
                  </div>

                  <div className="space-y-4 mb-8 bg-card p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Daily Return</span>
                      <span className="font-bold text-primary">{plan.dailyProfit}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total ROI</span>
                      <span className="font-bold text-primary">{plan.totalROI}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-bold">{plan.duration} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Min Investment</span>
                      <span className="font-bold">${parseFloat(plan.minAmount).toFixed(2)}</span>
                    </div>
                    {plan.maxAmount && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Max Investment</span>
                        <span className="font-bold">${parseFloat(plan.maxAmount).toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  {selectedPlan === plan.id ? (
                    <div className="space-y-4">
                      <input
                        type="number"
                        placeholder="Investment Amount"
                        value={investmentAmount}
                        onChange={(e) => setInvestmentAmount(e.target.value)}
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        min={parseFloat(plan.minAmount)}
                        max={plan.maxAmount ? parseFloat(plan.maxAmount) : undefined}
                      />
                      <div className="flex gap-4">
                        <Button
                          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                          onClick={() => {
                            if (investmentAmount) {
                              router.push(`/investments/confirm?planId=${plan.id}&amount=${investmentAmount}`)
                            }
                          }}
                        >
                          Invest Now
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setSelectedPlan(null)
                            setInvestmentAmount('')
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      Select Plan
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {plans.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No investment plans available at the moment</p>
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
