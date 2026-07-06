'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getAdminUsers, verifyUserAccount } from '@/app/actions/admin'
import { authClient } from '@/lib/auth-client'

type User = {
  id: string
  email: string
  name?: string
  profile?: {
    accountVerified: boolean
    totalInvested: string
    totalEarned: string
    totalWithdrawn: string
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const session = await authClient.getSession()
        if (!session?.user) {
          window.location.href = '/sign-in'
          return
        }

        const usersData = await getAdminUsers()
        setUsers(usersData)
      } catch (err) {
        setError('Failed to load users')
        console.error('[v0] Error loading users:', err)
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [])

  const handleVerifyUser = async (userId: string) => {
    try {
      await verifyUserAccount(userId)
      // Refresh users list
      const usersData = await getAdminUsers()
      setUsers(usersData)
    } catch (err) {
      setError('Failed to verify user')
      console.error('[v0] Error verifying user:', err)
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
          <h2 className="text-3xl font-bold mb-2">User Management</h2>
          <p className="text-muted-foreground">Manage investor accounts and verify users</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-lg text-muted-foreground">Loading users...</div>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 rounded-lg bg-card border border-border text-center">
            <p className="text-muted-foreground">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full">
              <thead className="bg-card border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Total Invested</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Total Earned</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-border hover:bg-card/50">
                    <td className="px-6 py-4 text-sm">{user.email}</td>
                    <td className="px-6 py-4 text-sm">{user.name || '-'}</td>
                    <td className="px-6 py-4 text-sm">
                      {user.profile?.accountVerified ? (
                        <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">
                          Verified
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-semibold">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">${parseFloat(user.profile?.totalInvested || '0').toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-primary">${parseFloat(user.profile?.totalEarned || '0').toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm">
                      {!user.profile?.accountVerified && (
                        <Button
                          size="sm"
                          onClick={() => handleVerifyUser(user.id)}
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          Verify
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
