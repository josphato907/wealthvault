import { pgTable, text, timestamp, boolean, decimal, integer } from 'drizzle-orm/pg-core'

// Better Auth tables (user, session, account, verification) are managed by Better Auth/Neon Auth
// and live in the neon_auth schema. Do not define them here as Drizzle schemas.

// --- App tables ------------------------------------------------------------
// Add your app tables below. Always include a plain `userId` column so queries
// can be scoped per user — the security model depends on this column existing,
// not on a foreign key. Do NOT add a foreign key constraint
// (`.references(() => user.id, ...)`) unless the user explicitly asks for
// foreign keys or referential integrity; FK constraints make iterating on the
// schema harder.
//
// Example:
//
// import { serial } from "drizzle-orm/pg-core"
//
// export const todos = pgTable("todos", {
//   id: serial("id").primaryKey(),
//   userId: text("userId").notNull(),
//   title: text("title").notNull(),
//   completed: boolean("completed").notNull().default(false),
//   createdAt: timestamp("createdAt").notNull().defaultNow(),
// })
//
// If the user asks for foreign keys, add the reference back in:
//   userId: text("userId")
//     .notNull()
//     .references(() => user.id, { onDelete: "cascade" }),

// Investment Platform Tables

export const userProfile = pgTable('user_profile', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().unique(),
  role: text('role').notNull().default('user'),
  phone: text('phone'),
  country: text('country'),
  address: text('address'),
  totalInvested: decimal('totalInvested', { precision: 18, scale: 2 }).default('0'),
  totalEarned: decimal('totalEarned', { precision: 18, scale: 2 }).default('0'),
  totalWithdrawn: decimal('totalWithdrawn', { precision: 18, scale: 2 }).default('0'),
  accountVerified: boolean('accountVerified').default(false),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const investmentPlan = pgTable('investment_plan', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(),
  minAmount: decimal('minAmount', { precision: 18, scale: 2 }).notNull(),
  maxAmount: decimal('maxAmount', { precision: 18, scale: 2 }),
  dailyProfit: decimal('dailyProfit', { precision: 5, scale: 2 }).notNull(),
  duration: integer('duration').notNull(),
  totalROI: decimal('totalROI', { precision: 5, scale: 2 }).notNull(),
  featured: boolean('featured').default(false),
  active: boolean('active').default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const investment = pgTable('investment', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  planId: text('planId').notNull(),
  amount: decimal('amount', { precision: 18, scale: 2 }).notNull(),
  startDate: timestamp('startDate').notNull(),
  endDate: timestamp('endDate').notNull(),
  status: text('status').notNull().default('active'),
  profitEarned: decimal('profitEarned', { precision: 18, scale: 2 }).default('0'),
  withdrawnAmount: decimal('withdrawnAmount', { precision: 18, scale: 2 }).default('0'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const transaction = pgTable('transaction', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  type: text('type').notNull(),
  method: text('method').notNull(),
  amount: decimal('amount', { precision: 18, scale: 2 }).notNull(),
  status: text('status').notNull().default('pending'),
  reference: text('reference'),
  approvedBy: text('approvedBy'),
  notes: text('notes'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const wallet = pgTable('wallet', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().unique(),
  balance: decimal('balance', { precision: 18, scale: 2 }).default('0'),
  availableBalance: decimal('availableBalance', { precision: 18, scale: 2 }).default('0'),
  currency: text('currency').default('USD'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})
