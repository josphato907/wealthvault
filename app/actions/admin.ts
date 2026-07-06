'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user, userProfile, transaction } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
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

  const users = await db
    .select({
      id: user.id,
      email: user.email,
      name: user.name,
      profile: userProfile,
    })
    .from(user)
    .leftJoin(userProfile, eq(userProfile.userId, user.id))

  return users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    profile: u.profile
      ? {
          accountVerified: u.profile.accountVerified,
          totalInvested: u.profile.totalInvested,
          totalEarned: u.profile.totalEarned,
          totalWithdrawn: u.profile.totalWithdrawn,
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

  const totalUsers = await db.select().from(user)
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
    totalUsers: totalUsers.length,
    verifiedUsers: verifiedUsers.length,
    totalInvested,
    totalEarned,
  }
}
