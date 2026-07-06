'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { getUserWallet, getTransactionHistory } from '@/app/actions/investments'

interface Transaction {
  id: string
  type: string
  method: string
  amount: string
  status: string
  reference?: string
  notes?: string
  createdAt: Date
}

export default function WalletPage() {
  const router = useRouter()
  const [wallet, setWallet] = useState<any>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const session = await authClient.getSession()
        if (!session?.user) {
          router.push('/sign-in')
          return
        }

        const [walletData, txData] = await Promise.all([
          getUserWallet(),
          getTransactionHistory(50),
        ])

        setWallet(walletData)
        setTransactions(txData)
      } catch (error) {
        console.error('Error loading wallet:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  if (loading || !wallet) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const balance = parseFloat(wallet.balance || '0')
  const availableBalance = parseFloat(wallet.availableBalance || '0')

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
          <h2 className="text-4xl font-bold mb-4">Wallet</h2>
          <p className="text-muted-foreground">Manage your funds and view transaction history</p>
        </div>

        {/* Wallet Balance Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="p-8 rounded-lg bg-card border-2 border-primary">
            <div className="text-muted-foreground text-sm mb-2">Total Balance</div>
            <div className="text-4xl font-bold text-primary mb-2">${balance.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">All funds in your account</div>
          </div>
          <div className="p-8 rounded-lg bg-card border-2 border-border">
            <div className="text-muted-foreground text-sm mb-2">Available for Withdrawal</div>
            <div className="text-4xl font-bold text-foreground mb-2">${availableBalance.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Ready to withdraw immediately</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-12">
          <Link href="/payments/methods">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-6">
              Deposit Funds
            </Button>
          </Link>
          <Button variant="outline" className="px-6">
            Request Withdrawal
          </Button>
        </div>

        {/* Transaction History */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="p-8 border-b border-border">
            <h3 className="text-2xl font-bold">Transaction History</h3>
          </div>

          {transactions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No transactions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-background">
                    <th className="text-left py-4 px-6 font-semibold">Type</th>
                    <th className="text-left py-4 px-6 font-semibold">Amount</th>
                    <th className="text-left py-4 px-6 font-semibold">Status</th>
                    <th className="text-left py-4 px-6 font-semibold">Date</th>
                    <th className="text-left py-4 px-6 font-semibold">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-border hover:bg-background transition-colors">
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold capitalize">
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={tx.type === 'withdrawal' ? 'text-destructive' : 'text-primary'}>
                          {tx.type === 'withdrawal' ? '-' : '+'}${parseFloat(tx.amount).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                            tx.status === 'completed'
                              ? 'bg-green-900/20 text-green-400'
                              : tx.status === 'pending'
                                ? 'bg-yellow-900/20 text-yellow-400'
                                : 'bg-destructive/20 text-destructive'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-sm text-muted-foreground">
                        {tx.method} {tx.reference && `- ${tx.reference.slice(0, 8)}...`}
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
