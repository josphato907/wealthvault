'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'

export default function LandingPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const session = await authClient.getSession()
      if (session?.user) {
        setIsAuthenticated(true)
        router.push('/dashboard')
      } else {
        setIsAuthenticated(false)
      }
    }
    checkAuth()
  }, [router])

  if (isAuthenticated === null) {
    return <div className="min-h-screen bg-background" />
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="text-2xl font-bold text-primary">WealthVault</div>
        <div className="flex gap-4">
          <Link href="/sign-in">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
            Invest in <span className="text-primary">Gold & Crypto</span> with Confidence
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-balance">
            Premium investment plans with daily profits. Secure, transparent, and designed for wealth building.
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg">
              Start Investing Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-card border-y border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-16 text-center">Why Choose WealthVault?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-lg border border-border bg-background">
              <div className="text-3xl font-bold text-primary mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-3">Secure & Safe</h3>
              <p className="text-muted-foreground">
                Your investments are protected with industry-leading security measures and transparent operations.
              </p>
            </div>
            <div className="p-8 rounded-lg border border-border bg-background">
              <div className="text-3xl font-bold text-primary mb-4">📈</div>
              <h3 className="text-xl font-bold mb-3">Daily Profits</h3>
              <p className="text-muted-foreground">
                Earn consistent daily returns on your investments with our carefully crafted plans.
              </p>
            </div>
            <div className="p-8 rounded-lg border border-border bg-background">
              <div className="text-3xl font-bold text-primary mb-4">💰</div>
              <h3 className="text-xl font-bold mb-3">Multiple Plans</h3>
              <p className="text-muted-foreground">
                Choose from Gold and Crypto investment plans tailored to your investment goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Plans Preview */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-16 text-center">Investment Plans</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-lg border-2 border-primary bg-background">
              <div className="text-primary mb-4">✨ GOLD INVESTMENT</div>
              <h3 className="text-2xl font-bold mb-6">Gold Plans</h3>
              <div className="space-y-4 mb-8">
                <div>
                  <div className="text-lg font-semibold">Gold Starter</div>
                  <div className="text-muted-foreground">Min: $100 • Daily: 2.5%</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">Gold Premium</div>
                  <div className="text-muted-foreground">Min: $1,000 • Daily: 3.5%</div>
                </div>
              </div>
              <Link href="/sign-up">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Invest Now
                </Button>
              </Link>
            </div>

            <div className="p-8 rounded-lg border-2 border-primary bg-background">
              <div className="text-primary mb-4">💎 CRYPTO INVESTMENT</div>
              <h3 className="text-2xl font-bold mb-6">Crypto Plans</h3>
              <div className="space-y-4 mb-8">
                <div>
                  <div className="text-lg font-semibold">Crypto Starter</div>
                  <div className="text-muted-foreground">Min: $500 • Daily: 3%</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">Crypto VIP</div>
                  <div className="text-muted-foreground">Min: $5,000 • Daily: 5%</div>
                </div>
              </div>
              <Link href="/sign-up">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Invest Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-card border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Building Wealth?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of investors who are already earning with WealthVault.
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg">
              Open Account Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-border text-center text-muted-foreground">
        <p>&copy; 2026 WealthVault. All rights reserved. Your trusted investment platform.</p>
      </footer>
    </div>
  )
}
