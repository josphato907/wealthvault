'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import {
  getUserProfile,
  getUserWallet,
  getUserInvestments,
  initializeUserAccount,
} from '@/app/actions/investments'

interface Investment {
  id: string
  planId: string
  amount: string
  startDate: Date
  endDate: Date
  status: string
  profitEarned: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [wallet, setWallet] = useState<any>(null)
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const userSession = await authClient.getSession()
        if (!userSession?.user) {
          router.push('/sign-in')
          return
        }

        setSession(userSession)

        // Initialize user account on first login
        await initializeUserAccount()

        const [profileData, walletData, investmentsData] = await Promise.all([
          getUserProfile(),
          getUserWallet(),
          getUserInvestments(),
        ])

        setProfile(profileData)
        setWallet(walletData)
        setInvestments(investmentsData)
      } catch (error) {
        console.error('Error loading dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  const handleLogout = async () => {
    await authClient.signOut()
    router.push('/')
  }

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const totalInvested = profile?.totalInvested ? parseFloat(profile.totalInvested) : 0
  const totalEarned = profile?.totalEarned ? parseFloat(profile.totalEarned) : 0
  const walletBalance = wallet?.availableBalance ? parseFloat(wallet.availableBalance) : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">WealthVault</h1>
            <p className="text-muted-foreground">Welcome back, {session.user.name || session.user.email}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-lg bg-card border border-border">
            <div className="text-muted-foreground text-sm mb-2">Total Invested</div>
            <div className="text-3xl font-bold text-primary mb-2">${totalInvested.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Across all plans</div>
          </div>
          <div className="p-6 rounded-lg bg-card border border-border">
            <div className="text-muted-foreground text-sm mb-2">Total Earned</div>
            <div className="text-3xl font-bold text-primary mb-2">${totalEarned.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Profit from investments</div>
          </div>
          <div className="p-6 rounded-lg bg-card border border-border">
            <div className="text-muted-foreground text-sm mb-2">Available Balance</div>
            <div className="text-3xl font-bold text-primary mb-2">${walletBalance.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Ready to withdraw or invest</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          <Link href="/investments/browse">
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-lg">
              Browse Investment Plans
            </Button>
          </Link>
          <Link href="/wallet">
            <Button variant="outline" className="w-full py-6 text-lg">
              Manage Wallet
            </Button>
          </Link>
        </div>

        {/* Active Investments */}
        <div className="bg-card rounded-lg border border-border p-8">
          <h2 className="text-2xl font-bold mb-6">Your Investments</h2>
          {investments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No active investments yet</p>
              <Link href="/investments/browse">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Start Investing
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Plan ID</th>
                    <th className="text-left py-3 px-4 font-semibold">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold">Start Date</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Profit Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {investments.map((investment) => (
                    <tr key={investment.id} className="border-b border-border hover:bg-background">
                      <td className="py-3 px-4 text-sm">{investment.planId.slice(0, 8)}...</td>
                      <td className="py-3 px-4 text-sm">${parseFloat(investment.amount).toFixed(2)}</td>
                      <td className="py-3 px-4 text-sm">
                        {new Date(investment.startDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">
                          {investment.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-primary">
                        ${parseFloat(investment.profitEarned).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
