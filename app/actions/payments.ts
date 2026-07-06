'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { transaction, wallet } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { nanoid } from 'nanoid'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function createDepositTransaction({
  amount,
  method,
}: {
  amount: number
  method: string
}) {
  const userId = await getUserId()

  // Create transaction record with pending status
  const txId = nanoid()
  await db.insert(transaction).values({
    id: txId,
    userId,
    type: 'deposit',
    method,
    amount: amount.toString(),
    status: 'pending',
    reference: `DEP-${txId.substring(0, 8).toUpperCase()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  revalidatePath('/wallet')
  return txId
}

export async function createWithdrawalTransaction({
  amount,
  method,
  accountDetails,
}: {
  amount: number
  method: string
  accountDetails: string
}) {
  const userId = await getUserId()

  // Check wallet balance
  const userWallet = await db.select().from(wallet).where(eq(wallet.userId, userId)).limit(1)

  if (!userWallet.length) {
    throw new Error('Wallet not found')
  }

  const availableBalance = parseFloat(userWallet[0].availableBalance || '0')
  if (availableBalance < amount) {
    throw new Error('Insufficient balance')
  }

  // Create withdrawal transaction record
  const txId = nanoid()
  await db.insert(transaction).values({
    id: txId,
    userId,
    type: 'withdrawal',
    method,
    amount: amount.toString(),
    status: 'pending',
    reference: `WIT-${txId.substring(0, 8).toUpperCase()}`,
    notes: accountDetails,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  revalidatePath('/wallet')
  return txId
}

export async function processApprovedDeposit(transactionId: string) {
  // Get transaction details
  const txData = await db
    .select()
    .from(transaction)
    .where(eq(transaction.id, transactionId))
    .limit(1)

  if (!txData.length) {
    throw new Error('Transaction not found')
  }

  const tx = txData[0]
  const userId = tx.userId

  // Update wallet balance
  const userWallet = await db.select().from(wallet).where(eq(wallet.userId, userId)).limit(1)

  if (userWallet.length) {
    const newBalance = (parseFloat(userWallet[0].balance || '0') + parseFloat(tx.amount || '0')).toString()
    const newAvailable = (parseFloat(userWallet[0].availableBalance || '0') + parseFloat(tx.amount || '0')).toString()

    await db
      .update(wallet)
      .set({
        balance: newBalance,
        availableBalance: newAvailable,
        updatedAt: new Date(),
      })
      .where(eq(wallet.userId, userId))
  }

  revalidatePath('/wallet')
}

export async function processApprovedWithdrawal(transactionId: string) {
  // Get transaction details
  const txData = await db
    .select()
    .from(transaction)
    .where(eq(transaction.id, transactionId))
    .limit(1)

  if (!txData.length) {
    throw new Error('Transaction not found')
  }

  const tx = txData[0]
  const userId = tx.userId

  // Update wallet balance - reduce available balance
  const userWallet = await db.select().from(wallet).where(eq(wallet.userId, userId)).limit(1)

  if (userWallet.length) {
    const newAvailable = (parseFloat(userWallet[0].availableBalance || '0') - parseFloat(tx.amount || '0')).toString()

    await db
      .update(wallet)
      .set({
        availableBalance: newAvailable,
        updatedAt: new Date(),
      })
      .where(eq(wallet.userId, userId))
  }

  revalidatePath('/wallet')
}
