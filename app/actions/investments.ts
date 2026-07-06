'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  investmentPlan,
  investment,
  userProfile,
  wallet,
  transaction,
} from '@/lib/db/schema'
import { and, desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { nanoid } from 'nanoid'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function initializeUserAccount() {
  const userId = await getUserId()

  // Check if profile exists
  const existingProfile = await db
    .select()
    .from(userProfile)
    .where(eq(userProfile.userId, userId))
    .limit(1)

  if (!existingProfile.length) {
    // Create profile if it doesn't exist
    await db.insert(userProfile).values({
      id: nanoid(),
      userId,
      role: 'user',
      accountVerified: false,
    })
  }

  // Check if wallet exists
  const existingWallet = await db
    .select()
    .from(wallet)
    .where(eq(wallet.userId, userId))
    .limit(1)

  if (!existingWallet.length) {
    // Create wallet if it doesn't exist
    await db.insert(wallet).values({
      id: nanoid(),
      userId,
      balance: '0',
      availableBalance: '0',
      currency: 'USD',
    })
  }
}

export async function getInvestmentPlans() {
  return db
    .select()
    .from(investmentPlan)
    .where(eq(investmentPlan.active, true))
    .orderBy(investmentPlan.featured ? 'desc' : 'asc')
}

export async function getUserInvestments() {
  const userId = await getUserId()
  return db
    .select()
    .from(investment)
    .where(eq(investment.userId, userId))
    .orderBy(desc(investment.createdAt))
}

export async function getUserProfile() {
  const userId = await getUserId()
  const profile = await db
    .select()
    .from(userProfile)
    .where(eq(userProfile.userId, userId))
    .limit(1)
  return profile[0] || null
}

export async function getUserWallet() {
  const userId = await getUserId()
  const userWallet = await db
    .select()
    .from(wallet)
    .where(eq(wallet.userId, userId))
    .limit(1)
  return userWallet[0] || null
}

export async function createInvestment(planId: string, amount: number) {
  const userId = await getUserId()

  // Get the plan
  const plans = await db
    .select()
    .from(investmentPlan)
    .where(eq(investmentPlan.id, planId))
    .limit(1)
  const plan = plans[0]
  if (!plan) throw new Error('Investment plan not found')

  // Validate amount
  const minAmount = parseFloat(plan.minAmount.toString())
  const maxAmount = plan.maxAmount ? parseFloat(plan.maxAmount.toString()) : null
  if (amount < minAmount || (maxAmount && amount > maxAmount)) {
    throw new Error(
      `Amount must be between ${minAmount} and ${maxAmount || 'unlimited'}`,
    )
  }

  // Create investment
  const investmentId = nanoid()
  const startDate = new Date()
  const endDate = new Date(startDate.getTime() + plan.duration * 24 * 60 * 60 * 1000)

  await db.insert(investment).values({
    id: investmentId,
    userId,
    planId,
    amount: amount.toString(),
    startDate,
    endDate,
    status: 'active',
  })

  // Create deposit transaction
  const transactionId = nanoid()
  await db.insert(transaction).values({
    id: transactionId,
    userId,
    type: 'deposit',
    method: 'wallet',
    amount: amount.toString(),
    status: 'pending',
    reference: investmentId,
  })

  revalidatePath('/dashboard')
  revalidatePath('/investments')
  return { investmentId, transactionId }
}

export async function withdrawFunds(amount: number) {
  const userId = await getUserId()

  // Get user wallet
  const userWallet = await db
    .select()
    .from(wallet)
    .where(eq(wallet.userId, userId))
    .limit(1)
  const currentWallet = userWallet[0]
  if (!currentWallet) throw new Error('Wallet not found')

  const availableBalance = parseFloat(currentWallet.availableBalance.toString())
  if (amount > availableBalance) {
    throw new Error('Insufficient balance')
  }

  // Create withdrawal transaction
  const transactionId = nanoid()
  await db.insert(transaction).values({
    id: transactionId,
    userId,
    type: 'withdrawal',
    method: 'wallet',
    amount: amount.toString(),
    status: 'pending',
  })

  revalidatePath('/dashboard')
  revalidatePath('/wallet')
  return transactionId
}

export async function getTransactionHistory(limit = 20) {
  const userId = await getUserId()
  return db
    .select()
    .from(transaction)
    .where(eq(transaction.userId, userId))
    .orderBy(desc(transaction.createdAt))
    .limit(limit)
}
