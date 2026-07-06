import { db } from '@/lib/db'
import { investmentPlan } from '@/lib/db/schema'
import { nanoid } from 'nanoid'

const PLANS = [
  // Gold Plans
  {
    id: nanoid(),
    name: 'Gold Starter',
    description: 'Perfect for beginning investors looking to invest in gold',
    type: 'gold',
    minAmount: '100',
    maxAmount: '999',
    dailyProfit: '2.5',
    duration: 30,
    totalROI: '75',
    featured: false,
  },
  {
    id: nanoid(),
    name: 'Gold Premium',
    description: 'For experienced gold investors seeking premium returns',
    type: 'gold',
    minAmount: '1000',
    maxAmount: '9999',
    dailyProfit: '3.5',
    duration: 30,
    totalROI: '105',
    featured: true,
  },
  // Crypto Plans
  {
    id: nanoid(),
    name: 'Crypto Starter',
    description: 'Begin your cryptocurrency investment journey',
    type: 'crypto',
    minAmount: '500',
    maxAmount: '4999',
    dailyProfit: '3',
    duration: 30,
    totalROI: '90',
    featured: false,
  },
  {
    id: nanoid(),
    name: 'Crypto VIP',
    description: 'VIP cryptocurrency investment with maximum returns',
    type: 'crypto',
    minAmount: '5000',
    maxAmount: null,
    dailyProfit: '5',
    duration: 30,
    totalROI: '150',
    featured: true,
  },
]

async function seedPlans() {
  try {
    console.log('Seeding investment plans...')

    for (const plan of PLANS) {
      await db.insert(investmentPlan).values(plan)
      console.log(`Created plan: ${plan.name}`)
    }

    console.log('✓ Successfully seeded all investment plans!')
    process.exit(0)
  } catch (error) {
    console.error('Error seeding plans:', error)
    process.exit(1)
  }
}

seedPlans()
