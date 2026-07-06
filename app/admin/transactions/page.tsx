'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getPendingTransactions, approveTransaction, rejectTransaction } from '@/app/actions/admin'
import { authClient } from '@/lib/auth-client'

type Transaction = {
  id: string
  userId: string
  type: string
  method: string
  amount: string
  status: string
  reference?: string
  notes?: string
  createdAt: Date
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rejectReason, setRejectReason] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const session = await authClient.getSession()
        if (!session?.user) {
          window.location.href = '/sign-in'
          return
        }

        const txData = await getPendingTransactions()
        setTransactions(txData)
      } catch (err) {
        setError('Failed to load transactions')
        console.error('[v0] Error loading transactions:', err)
      } finally {
        setLoading(false)
      }
    }

    loadTransactions()
  }, [])

  const handleApprove = async (txId: string) => {
    try {
      await approveTransaction(txId)
      setTransactions(transactions.filter((t) => t.id !== txId))
    } catch (err) {
      setError('Failed to approve transaction')
      console.error('[v0] Error approving transaction:', err)
    }
  }

  const handleReject = async (txId: string) => {
    const reason = rejectReason[txId] || 'Rejected by admin'
    try {
      await rejectTransaction(txId, reason)
      setTransactions(transactions.filter((t) => t.id !== txId))
      setRejectReason({ ...rejectReason, [txId]: '' })
    } catch (err) {
      setError('Failed to reject transaction')
      console.error('[v0] Error rejecting transaction:', err)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h1 className="text-2xl font-bold text-primary">WealthVault Admin</h1>
        <Link href="/admin/dashboard">
          <Button variant="ghost">Dashboard</Button>
        </Link>
      </nav>

      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Transaction Approvals</h2>
          <p className="text-muted-foreground">Review and approve pending deposits and withdrawals</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-lg text-muted-foreground">Loading transactions...</div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 rounded-lg bg-card border border-border text-center">
            <p className="text-muted-foreground">No pending transactions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-6 rounded-lg border border-border bg-card">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Type</div>
                    <div className="font-semibold capitalize">{tx.type}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Method</div>
                    <div className="font-semibold capitalize">{tx.method}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Amount</div>
                    <div className="font-semibold text-primary">${parseFloat(tx.amount).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Date</div>
                    <div className="font-semibold text-sm">{new Date(tx.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>

                {tx.reference && (
                  <div className="mb-4 p-3 rounded bg-muted/30 text-sm">
                    <strong>Reference:</strong> {tx.reference}
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Rejection reason (if rejecting):
                    </label>
                    <input
                      type="text"
                      value={rejectReason[tx.id] || ''}
                      onChange={(e) =>
                        setRejectReason({ ...rejectReason, [tx.id]: e.target.value })
                      }
                      placeholder="Enter reason for rejection"
                      className="w-full px-3 py-2 rounded bg-input border border-border text-foreground placeholder-muted-foreground text-sm"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleApprove(tx.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(tx.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
