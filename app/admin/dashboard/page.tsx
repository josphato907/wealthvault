'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'

interface AdminStats {
  totalUsers: number
  totalInvested: number
  totalEarnings: number
  activeInvestments: number
  pendingTransactions: number
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const userSession = await authClient.getSession()
        if (!userSession?.user) {
          router.push('/sign-in')
          return
        }

        // In a real app, check if user is admin
        // For now, we'll just load admin data
        setSession(userSession)

        // Mock admin stats
        setStats({
          totalUsers: 156,
          totalInvested: 485000,
          totalEarnings: 98500,
          activeInvestments: 342,
          pendingTransactions: 12,
        })
      } catch (error) {
        console.error('Error loading admin dashboard:', error)
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">WealthVault Admin</h1>
            <p className="text-muted-foreground">Platform Management Dashboard</p>
          </div>
          <div className="flex gap-4">
            <Link href="/dashboard">
              <Button variant="outline">Back to Investor</Button>
            </Link>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-5 gap-4 mb-12">
          <div className="p-6 rounded-lg bg-card border border-border">
            <div className="text-muted-foreground text-sm mb-2">Total Users</div>
            <div className="text-3xl font-bold text-primary">{stats?.totalUsers || 0}</div>
            <div className="text-xs text-muted-foreground mt-2">Active investors</div>
          </div>
          <div className="p-6 rounded-lg bg-card border border-border">
            <div className="text-muted-foreground text-sm mb-2">Total Invested</div>
            <div className="text-3xl font-bold text-primary">
              ${(stats?.totalInvested || 0).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-2">USD value</div>
          </div>
          <div className="p-6 rounded-lg bg-card border border-border">
            <div className="text-muted-foreground text-sm mb-2">Total Earnings</div>
            <div className="text-3xl font-bold text-primary">
              ${(stats?.totalEarnings || 0).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-2">Platform profits</div>
          </div>
          <div className="p-6 rounded-lg bg-card border border-border">
            <div className="text-muted-foreground text-sm mb-2">Active Investments</div>
            <div className="text-3xl font-bold text-primary">{stats?.activeInvestments || 0}</div>
            <div className="text-xs text-muted-foreground mt-2">Running plans</div>
          </div>
          <div className="p-6 rounded-lg bg-card border border-border">
            <div className="text-muted-foreground text-sm mb-2">Pending Actions</div>
            <div className="text-3xl font-bold text-primary">{stats?.pendingTransactions || 0}</div>
            <div className="text-xs text-muted-foreground mt-2">Awaiting approval</div>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* User Management */}
          <div className="bg-card rounded-lg border border-border p-8">
            <h2 className="text-2xl font-bold mb-6">User Management</h2>
            <div className="space-y-4">
              <div className="p-4 bg-background rounded-lg border border-border">
                <div className="font-semibold mb-2">Manage Users</div>
                <p className="text-sm text-muted-foreground mb-4">
                  View, verify, and manage investor accounts
                </p>
                <Link href="/admin/users">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    View All Users
                  </Button>
                </Link>
              </div>
              <div className="p-4 bg-background rounded-lg border border-border">
                <div className="font-semibold mb-2">Account Verification</div>
                <p className="text-sm text-muted-foreground mb-4">
                  Review pending account verifications
                </p>
                <Button variant="outline" className="w-full">
                  Pending: {Math.floor(Math.random() * 5)} accounts
                </Button>
              </div>
            </div>
          </div>

          {/* Transaction Management */}
          <div className="bg-card rounded-lg border border-border p-8">
            <h2 className="text-2xl font-bold mb-6">Transaction Management</h2>
            <div className="space-y-4">
              <div className="p-4 bg-background rounded-lg border border-border">
                <div className="font-semibold mb-2">Pending Approvals</div>
                <p className="text-sm text-muted-foreground mb-4">
                  Review and approve pending deposits and withdrawals
                </p>
                <Link href="/admin/transactions">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Review Transactions
                  </Button>
                </Link>
              </div>
              <div className="p-4 bg-background rounded-lg border border-border">
                <div className="font-semibold mb-2">Transaction History</div>
                <p className="text-sm text-muted-foreground mb-4">
                  View complete transaction logs and audit trail
                </p>
                <Button variant="outline" className="w-full">
                  Last 30 days: {Math.floor(Math.random() * 500)} transactions
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Investment Management */}
        <div className="bg-card rounded-lg border border-border p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">Investment Plan Management</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-background rounded-lg border border-border">
              <div className="font-semibold mb-2">Active Plans</div>
              <div className="text-2xl font-bold text-primary mb-4">4</div>
              <Button variant="outline" className="w-full">
                Manage Plans
              </Button>
            </div>
            <div className="p-4 bg-background rounded-lg border border-border">
              <div className="font-semibold mb-2">Plan Performance</div>
              <div className="text-2xl font-bold text-primary mb-4">98.5%</div>
              <Button variant="outline" className="w-full">
                View Analytics
              </Button>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-card rounded-lg border border-border p-8">
          <h2 className="text-2xl font-bold mb-6">System Health</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
              <div>
                <div className="font-semibold">Database Status</div>
                <div className="text-sm text-muted-foreground">Connection healthy</div>
              </div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
              <div>
                <div className="font-semibold">API Response Time</div>
                <div className="text-sm text-muted-foreground">Average: 145ms</div>
              </div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
              <div>
                <div className="font-semibold">Platform Uptime</div>
                <div className="text-sm text-muted-foreground">99.9% (30 days)</div>
              </div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
