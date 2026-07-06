'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { userProfile, transaction } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getAdminId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')

  // Check if user has admin role
  const adminProfile = await db
    .select()
    .from(userProfile)
    .where(eq(userProfile.userId, session.user.id))
    .limit(1)

  if (!adminProfile.length || adminProfile[0].role !== 'admin') {
    throw new Error('Forbidden: Admin access required')
  }

  return session.user.id
}

export async function getAdminUsers() {
  await getAdminId() // Verify admin access

  // Query users from neon_auth schema since Better Auth manages them there
  const users = await db.execute(sql`
    SELECT 
      u."id",
      u."email",
      u."name",
      up.*
    FROM neon_auth."user" u
    LEFT JOIN public.user_profile up ON up."userId" = u."id"
  `)

  return users.rows.map((u: any) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    profile: u.userId
      ? {
          accountVerified: u.accountVerified,
          totalInvested: u.totalInvested,
          totalEarned: u.totalEarned,
          totalWithdrawn: u.totalWithdrawn,
        }
      : null,
  }))
}

export async function verifyUserAccount(userId: string) {
  await getAdminId() // Verify admin access

  await db
    .update(userProfile)
    .set({ accountVerified: true, updatedAt: new Date() })
    .where(eq(userProfile.userId, userId))

  revalidatePath('/admin/users')
}

export async function getPendingTransactions() {
  await getAdminId() // Verify admin access

  return db
    .select()
    .from(transaction)
    .where(eq(transaction.status, 'pending'))
}

export async function approveTransaction(transactionId: string) {
  const adminId = await getAdminId() // Verify admin access

  await db
    .update(transaction)
    .set({
      status: 'approved',
      approvedBy: adminId,
      updatedAt: new Date(),
    })
    .where(eq(transaction.id, transactionId))

  revalidatePath('/admin/transactions')
}

export async function rejectTransaction(transactionId: string, reason: string) {
  const adminId = await getAdminId() // Verify admin access

  await db
    .update(transaction)
    .set({
      status: 'rejected',
      approvedBy: adminId,
      notes: reason,
      updatedAt: new Date(),
    })
    .where(eq(transaction.id, transactionId))

  revalidatePath('/admin/transactions')
}

export async function getAdminStats() {
  await getAdminId() // Verify admin access

  // Get total users from neon_auth schema
  const totalUsersResult = await db.execute(sql`SELECT COUNT(*) as count FROM neon_auth."user"`)
  const totalUsers = parseInt(totalUsersResult.rows[0]?.count || '0')
  
  const verifiedUsers = await db
    .select()
    .from(userProfile)
    .where(eq(userProfile.accountVerified, true))

  // Get total invested and earned
  const stats = await db
    .select({
      totalInvested: userProfile.totalInvested,
      totalEarned: userProfile.totalEarned,
    })
    .from(userProfile)

  const totalInvested = stats.reduce((sum, s) => sum + parseFloat(s.totalInvested || '0'), 0)
  const totalEarned = stats.reduce((sum, s) => sum + parseFloat(s.totalEarned || '0'), 0)

  return {
    totalUsers,
    verifiedUsers: verifiedUsers.length,
    totalInvested,
    totalEarned,
  }
}
