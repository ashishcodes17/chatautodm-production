# ChatAutoDM - Paid Subscription Implementation Guide

> **⚠️ IMPORTANT**: This is a planning document. No changes have been made to the codebase yet.

## 📋 Executive Summary

This guide outlines a comprehensive plan to transform ChatAutoDM from a free platform to a paid SaaS with subscription tiers. The implementation follows industry best practices and is designed for scalability, compliance, and excellent user experience.

---

## 🎯 Phase 1: Business & Product Design

### 1.1 Subscription Model Design

**Recommended Tier Structure:**

| Feature | Free | Pro | Team | Enterprise |
|---------|------|-----|------|------------|
| **Price** | $0 | $29/mo | $99/mo | Custom |
| **Automations** | 2 active | 20 active | 100 active | Unlimited |
| **DMs/month** | 500 | 10,000 | 50,000 | Unlimited |
| **Contacts** | 1,000 | 25,000 | 100,000 | Unlimited |
| **Workspaces** | 1 | 3 | 10 | Unlimited |
| **Analytics** | Basic | Advanced | Advanced | Custom |
| **Support** | Community | Email | Priority | Dedicated |
| **Team Members** | 1 | 1 | 5 | Unlimited |
| **API Access** | ❌ | ❌ | ✅ | ✅ |
| **White Label** | ❌ | ❌ | ❌ | ✅ |
| **Custom Integrations** | ❌ | ❌ | ✅ | ✅ |

**Trial Policy:**
- 14-day free trial on Pro and Team plans
- No credit card required to start
- Full feature access during trial
- Automatic email reminders at days 7, 12, and 14

**Billing Policy:**
- Monthly and annual billing (save 20% on annual)
- Prorated upgrades/downgrades
- 7-day grace period for failed payments
- 30-day money-back guarantee
- Automatic renewal with 7-day advance notice

---

## 🗄️ Phase 2: Database Schema Changes

### 2.1 Add Billing Fields to Workspaces Collection

\`\`\`typescript
// lib/types/workspace.ts
interface Workspace {
  _id: string
  userId: string
  name: string
  description: string
  createdAt: Date
  updatedAt: Date
  
  // NEW: Billing fields
  subscription: {
    planId: 'free' | 'pro' | 'team' | 'enterprise'
    planName: string
    status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete'
    
    // Stripe IDs
    stripeCustomerId: string | null
    stripeSubscriptionId: string | null
    
    // Trial tracking
    trialStartsAt: Date | null
    trialEndsAt: Date | null
    
    // Subscription periods
    currentPeriodStart: Date | null
    currentPeriodEnd: Date | null
    cancelAtPeriodEnd: boolean
    canceledAt: Date | null
    
    // Features & Limits
    features: {
      maxAutomations: number
      maxDMsPerMonth: number
      maxContacts: number
      maxWorkspaces: number
      hasAdvancedAnalytics: boolean
      hasApiAccess: boolean
      hasPrioritySupport: boolean
      hasWhiteLabel: boolean
    }
    
    // Usage tracking (reset monthly)
    usage: {
      dmsThisMonth: number
      automationsActive: number
      contactsTotal: number
      lastResetAt: Date
    }
  }
}
\`\`\`

### 2.2 Migration Script

**File:** `scripts/add-billing-to-workspaces.ts`

\`\`\`typescript
import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI!

async function migrate() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    const db = client.db('instaautodm')
    const workspaces = db.collection('workspaces')
    
    console.log('🔄 Starting migration: Adding billing fields...')
    
    const result = await workspaces.updateMany(
      { 'subscription': { $exists: false } }, // Only update docs without subscription
      {
        $set: {
          'subscription': {
            planId: 'free',
            planName: 'Free Plan',
            status: 'active',
            stripeCustomerId: null,
            stripeSubscriptionId: null,
            trialStartsAt: null,
            trialEndsAt: null,
            currentPeriodStart: null,
            currentPeriodEnd: null,
            cancelAtPeriodEnd: false,
            canceledAt: null,
            features: {
              maxAutomations: 2,
              maxDMsPerMonth: 500,
              maxContacts: 1000,
              maxWorkspaces: 1,
              hasAdvancedAnalytics: false,
              hasApiAccess: false,
              hasPrioritySupport: false,
              hasWhiteLabel: false,
            },
            usage: {
              dmsThisMonth: 0,
              automationsActive: 0,
              contactsTotal: 0,
              lastResetAt: new Date(),
            },
          },
        },
      }
    )
    
    console.log(`✅ Migration complete! Updated ${result.modifiedCount} workspaces.`)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await client.close()
  }
}

migrate()
\`\`\`

**Rollback Script:** `scripts/rollback-billing.ts`

\`\`\`typescript
async function rollback() {
  // Remove subscription field from all workspaces
  await workspaces.updateMany(
    {},
    { $unset: { subscription: "" } }
  )
  console.log('✅ Rollback complete!')
}
\`\`\`

---

## 💳 Phase 3: Stripe Integration

### 3.1 Environment Variables

Add to `.env.local`:

\`\`\`bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (create in Stripe Dashboard)
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...
STRIPE_PRICE_TEAM_MONTHLY=price_...
STRIPE_PRICE_TEAM_YEARLY=price_...

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### 3.2 Install Stripe SDK

\`\`\`bash
pnpm add stripe @stripe/stripe-js
\`\`\`

### 3.3 Stripe Client Setup

**File:** `lib/stripe.ts`

\`\`\`typescript
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export const PLAN_PRICES = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY!,
  pro_yearly: process.env.STRIPE_PRICE_PRO_YEARLY!,
  team_monthly: process.env.STRIPE_PRICE_TEAM_MONTHLY!,
  team_yearly: process.env.STRIPE_PRICE_TEAM_YEARLY!,
}
\`\`\`

### 3.4 Checkout Session API

**File:** `app/api/billing/checkout/route.ts`

\`\`\`typescript
import { NextRequest, NextResponse } from 'next/server'
import { stripe, PLAN_PRICES } from '@/lib/stripe'
import { getDatabase } from '@/lib/mongodb'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { workspaceId, priceId, successUrl, cancelUrl } = await request.json()

    const db = await getDatabase()
    const workspace = await db.collection('workspaces').findOne({
      _id: workspaceId,
      userId: user._id,
    })

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }

    // Create or retrieve Stripe customer
    let customerId = workspace.subscription?.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user._id,
          workspaceId,
        },
      })
      customerId = customer.id

      await db.collection('workspaces').updateOne(
        { _id: workspaceId },
        { $set: { 'subscription.stripeCustomerId': customerId } }
      )
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        workspaceId,
        userId: user._id,
      },
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          workspaceId,
        },
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
\`\`\`

### 3.5 Customer Portal API

**File:** `app/api/billing/portal/route.ts`

\`\`\`typescript
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getDatabase } from '@/lib/mongodb'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { workspaceId, returnUrl } = await request.json()

    const db = await getDatabase()
    const workspace = await db.collection('workspaces').findOne({
      _id: workspaceId,
      userId: user._id,
    })

    const customerId = workspace?.subscription?.stripeCustomerId

    if (!customerId) {
      return NextResponse.json(
        { error: 'No active subscription' },
        { status: 400 }
      )
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Portal error:', error)
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    )
  }
}
\`\`\`

---

## 🪝 Phase 4: Webhook Handler

**File:** `app/api/billing/webhooks/route.ts`

\`\`\`typescript
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getDatabase } from '@/lib/mongodb'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('⚠️  Webhook signature verification failed.', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const db = await getDatabase()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const workspaceId = session.metadata?.workspaceId

      if (session.mode === 'subscription' && workspaceId) {
        await db.collection('workspaces').updateOne(
          { _id: workspaceId },
          {
            $set: {
              'subscription.stripeSubscriptionId': session.subscription as string,
              'subscription.status': 'trialing',
              'subscription.trialStartsAt': new Date(),
              'subscription.trialEndsAt': new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            },
          }
        )
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const workspaceId = subscription.metadata.workspaceId

      const planMap: Record<string, any> = {
        [process.env.STRIPE_PRICE_PRO_MONTHLY!]: {
          planId: 'pro',
          planName: 'Pro Plan',
          features: {
            maxAutomations: 20,
            maxDMsPerMonth: 10000,
            maxContacts: 25000,
            maxWorkspaces: 3,
            hasAdvancedAnalytics: true,
            hasApiAccess: false,
            hasPrioritySupport: true,
            hasWhiteLabel: false,
          },
        },
        // ... other plans
      }

      const priceId = subscription.items.data[0]?.price.id
      const plan = planMap[priceId]

      if (workspaceId && plan) {
        await db.collection('workspaces').updateOne(
          { _id: workspaceId },
          {
            $set: {
              'subscription.status': subscription.status,
              'subscription.planId': plan.planId,
              'subscription.planName': plan.planName,
              'subscription.features': plan.features,
              'subscription.currentPeriodStart': new Date(subscription.current_period_start * 1000),
              'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
              'subscription.cancelAtPeriodEnd': subscription.cancel_at_period_end,
            },
          }
        )
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const workspaceId = subscription.metadata.workspaceId

      if (workspaceId) {
        await db.collection('workspaces').updateOne(
          { _id: workspaceId },
          {
            $set: {
              'subscription.status': 'canceled',
              'subscription.canceledAt': new Date(),
              'subscription.planId': 'free',
              'subscription.planName': 'Free Plan',
              'subscription.features': {
                maxAutomations: 2,
                maxDMsPerMonth: 500,
                maxContacts: 1000,
                maxWorkspaces: 1,
                hasAdvancedAnalytics: false,
                hasApiAccess: false,
                hasPrioritySupport: false,
                hasWhiteLabel: false,
              },
            },
          }
        )
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string

      // Send email notification
      // TODO: Implement email service
      console.log(`Payment failed for customer ${customerId}`)
      break
    }
  }

  return NextResponse.json({ received: true })
}
\`\`\`

---

## 🔒 Phase 5: Access Control & Middleware

### 5.1 Middleware for Protected Routes

**File:** `lib/billing/check-limits.ts`

\`\`\`typescript
import { getDatabase } from '@/lib/mongodb'

export async function checkWorkspaceLimits(workspaceId: string) {
  const db = await getDatabase()
  const workspace = await db.collection('workspaces').findOne({ _id: workspaceId })

  if (!workspace) {
    throw new Error('Workspace not found')
  }

  const subscription = workspace.subscription
  const usage = subscription.usage
  const features = subscription.features

  return {
    canCreateAutomation: usage.automationsActive < features.maxAutomations,
    canSendDM: usage.dmsThisMonth < features.maxDMsPerMonth,
    canAddContact: usage.contactsTotal < features.maxContacts,
    hasAdvancedAnalytics: features.hasAdvancedAnalytics,
    hasApiAccess: features.hasApiAccess,
    subscription,
  }
}

export async function incrementUsage(
  workspaceId: string,
  type: 'dms' | 'contacts' | 'automations'
) {
  const db = await getDatabase()

  const fieldMap = {
    dms: 'subscription.usage.dmsThisMonth',
    contacts: 'subscription.usage.contactsTotal',
    automations: 'subscription.usage.automationsActive',
  }

  await db.collection('workspaces').updateOne(
    { _id: workspaceId },
    { $inc: { [fieldMap[type]]: 1 } }
  )
}
\`\`\`

### 5.2 Update Automation Creation API

**File:** `app/api/[wsid]/automations/route.ts` (add checks)

\`\`\`typescript
import { checkWorkspaceLimits } from '@/lib/billing/check-limits'

export async function POST(request: NextRequest, { params }: { params: { wsid: string } }) {
  // ... existing auth code ...

  const limits = await checkWorkspaceLimits(params.wsid)

  if (!limits.canCreateAutomation) {
    return NextResponse.json(
      {
        error: 'LIMIT_REACHED',
        message: `You've reached the automation limit for your ${limits.subscription.planName}. Upgrade to create more automations.`,
        upgradeUrl: '/pricing',
      },
      { status: 402 } // Payment Required
    )
  }

  // ... rest of automation creation ...

  await incrementUsage(params.wsid, 'automations')

  return NextResponse.json({ success: true })
}
\`\`\`

---

## 🎨 Phase 6: UI Components

### 6.1 Upgrade Modal Component

**File:** `components/upgrade-modal.tsx`

\`\`\`typescript
'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, X, Sparkles } from 'lucide-react'
import { useState } from 'react'

interface UpgradeModalProps {
  open: boolean
  onClose: () => void
  currentPlan: string
  feature?: string
  workspaceId: string
}

export function UpgradeModal({ open, onClose, currentPlan, feature, workspaceId }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async (priceId: string) => {
    setLoading(true)
    
    const response = await fetch('/api/billing/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workspaceId,
        priceId,
        successUrl: `${window.location.origin}/dashboard?upgraded=true`,
        cancelUrl: window.location.href,
      }),
    })

    const { url } = await response.json()
    window.location.href = url
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">
            <Sparkles className="inline w-8 h-8 mr-2 text-purple-600" />
            Upgrade to Unlock {feature || 'Premium Features'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Pro Plan */}
          <div className="border-2 border-purple-600 rounded-lg p-6 relative">
            <Badge className="absolute -top-3 left-6 bg-purple-600">Most Popular</Badge>
            <h3 className="text-2xl font-bold mb-2">Pro Plan</h3>
            <div className="text-4xl font-bold mb-4">$29<span className="text-lg text-gray-500">/mo</span></div>
            
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                20 Active Automations
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                10,000 DMs/month
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                25,000 Contacts
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                Advanced Analytics
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                Priority Email Support
              </li>
            </ul>

            <Button 
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={() => handleUpgrade(process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY!)}
              disabled={loading}
            >
              Start 14-Day Free Trial
            </Button>
          </div>

          {/* Team Plan */}
          <div className="border-2 rounded-lg p-6">
            <h3 className="text-2xl font-bold mb-2">Team Plan</h3>
            <div className="text-4xl font-bold mb-4">$99<span className="text-lg text-gray-500">/mo</span></div>
            
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                100 Active Automations
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                50,000 DMs/month
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                100,000 Contacts
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                API Access
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                5 Team Members
              </li>
            </ul>

            <Button 
              className="w-full"
              variant="outline"
              onClick={() => handleUpgrade(process.env.NEXT_PUBLIC_STRIPE_PRICE_TEAM_MONTHLY!)}
              disabled={loading}
            >
              Start 14-Day Free Trial
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
\`\`\`

### 6.2 Usage Widget Component

**File:** `components/usage-widget.tsx`

\`\`\`typescript
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface UsageWidgetProps {
  subscription: any
}

export function UsageWidget({ subscription }: UsageWidgetProps) {
  const { usage, features } = subscription

  const usagePercentages = {
    automations: (usage.automationsActive / features.maxAutomations) * 100,
    dms: (usage.dmsThisMonth / features.maxDMsPerMonth) * 100,
    contacts: (usage.contactsTotal / features.maxContacts) * 100,
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Usage This Month
          <Link href="/pricing">
            <Button size="sm" variant="outline">
              <TrendingUp className="w-4 h-4 mr-2" />
              Upgrade
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Automations</span>
            <span className="font-medium">
              {usage.automationsActive} / {features.maxAutomations}
            </span>
          </div>
          <Progress value={usagePercentages.automations} />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>DMs Sent</span>
            <span className="font-medium">
              {usage.dmsThisMonth.toLocaleString()} / {features.maxDMsPerMonth.toLocaleString()}
            </span>
          </div>
          <Progress value={usagePercentages.dms} />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Contacts</span>
            <span className="font-medium">
              {usage.contactsTotal.toLocaleString()} / {features.maxContacts.toLocaleString()}
            </span>
          </div>
          <Progress value={usagePercentages.contacts} />
        </div>
      </CardContent>
    </Card>
  )
}
\`\`\`

---

## 📧 Phase 7: Email Notifications

### 7.1 Email Service Setup (Resend recommended)

\`\`\`bash
pnpm add resend
\`\`\`

**File:** `lib/email.ts`

\`\`\`typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendTrialExpiringEmail(
  email: string,
  name: string,
  daysLeft: number
) {
  await resend.emails.send({
    from: 'ChatAutoDM <billing@chatautodm.com>',
    to: email,
    subject: `Your trial expires in ${daysLeft} days`,
    html: `
      <h1>Hi ${name},</h1>
      <p>Your 14-day free trial ends in ${daysLeft} days.</p>
      <p>Upgrade now to continue enjoying premium features:</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing">View Plans</a>
    `,
  })
}

export async function sendPaymentFailedEmail(
  email: string,
  name: string
) {
  await resend.emails.send({
    from: 'ChatAutoDM <billing@chatautodm.com>',
    to: email,
    subject: 'Payment failed - Update your payment method',
    html: `
      <h1>Hi ${name},</h1>
      <p>We couldn't process your payment. Please update your payment method to avoid service interruption.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/billing">Update Payment Method</a>
    `,
  })
}
\`\`\`

### 7.2 Cron Job for Trial Reminders

**File:** `app/api/cron/trial-reminders/route.ts`

\`\`\`typescript
import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { sendTrialExpiringEmail } from '@/lib/email'

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = await getDatabase()
  const now = new Date()
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  // Find trials expiring in 7 days
  const workspaces = await db
    .collection('workspaces')
    .find({
      'subscription.status': 'trialing',
      'subscription.trialEndsAt': {
        $gte: now,
        $lte: in7Days,
      },
    })
    .toArray()

  for (const workspace of workspaces) {
    const user = await db.collection('users').findOne({ _id: workspace.userId })
    if (user) {
      await sendTrialExpiringEmail(user.email, user.name, 7)
    }
  }

  return NextResponse.json({ sent: workspaces.length })
}
\`\`\`

---

## 🧪 Phase 8: Testing

### 8.1 Test Stripe Webhooks Locally

\`\`\`bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3000/api/billing/webhooks

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger invoice.payment_failed
\`\`\`

### 8.2 Unit Tests Example

**File:** `__tests__/billing/limits.test.ts`

\`\`\`typescript
import { checkWorkspaceLimits } from '@/lib/billing/check-limits'

describe('Billing Limits', () => {
  it('should block automation creation when limit reached', async () => {
    const limits = await checkWorkspaceLimits('test-workspace-id')
    expect(limits.canCreateAutomation).toBe(false)
  })

  it('should allow DM sending within limits', async () => {
    const limits = await checkWorkspaceLimits('test-workspace-id')
    expect(limits.canSendDM).toBe(true)
  })
})
\`\`\`

---

## 🚀 Phase 9: Deployment Checklist

### Pre-Launch
- [ ] Create Stripe products and prices in production
- [ ] Set up webhook endpoint in Stripe Dashboard
- [ ] Configure production environment variables
- [ ] Run database migration on production DB
- [ ] Test checkout flow end-to-end
- [ ] Test webhook delivery and processing
- [ ] Set up email service (Resend/SendGrid)
- [ ] Configure cron jobs (Vercel Cron or similar)
- [ ] Add monitoring alerts (Sentry)
- [ ] Update Terms of Service with billing terms
- [ ] Create pricing page and FAQ

### Launch Day
- [ ] Enable Stripe webhooks
- [ ] Monitor webhook delivery
- [ ] Watch for failed payments
- [ ] Check email deliverability
- [ ] Monitor error logs
- [ ] Have rollback plan ready

### Post-Launch
- [ ] Send announcement email to existing users
- [ ] Monitor conversion rates
- [ ] Track churn metrics
- [ ] Collect customer feedback
- [ ] Iterate on pricing/features

---

## 📊 Monitoring & Analytics

### Key Metrics to Track

\`\`\`typescript
// Dashboard queries
const metrics = {
  // Revenue
  mrr: await getMRR(),
  arr: await getARR(),
  
  // Customers
  totalSubscribers: await getActiveSubscribers(),
  newSubscribers: await getNewSubscribers('last_30_days'),
  churnRate: await getChurnRate('last_30_days'),
  
  // Trials
  activeTrials: await getActiveTrials(),
  trialConversionRate: await getTrialConversionRate(),
  
  // Usage
  averageDMsPerUser: await getAverageDMs(),
  averageAutomationsPerUser: await getAverageAutomations(),
  
  // Support
  supportTickets: await getSupportTickets('last_7_days'),
  nps: await getNPS(),
}
\`\`\`

---

## 🔐 Security & Compliance

### PCI Compliance
- ✅ Use Stripe Checkout (PCI compliant by default)
- ✅ Never store card details on your servers
- ✅ Use Stripe Customer Portal for management
- ✅ All payment data handled by Stripe

### GDPR Compliance
- Add data export functionality
- Implement right to deletion
- Update privacy policy
- Add cookie consent for analytics

### SOC 2 Preparation (Future)
- Document access controls
- Implement audit logging
- Regular security reviews
- Vendor assessments

---

## 💰 Pricing Psychology & Optimization

### A/B Test Ideas
1. **Price points**: $29 vs $39 vs $49 for Pro
2. **Trial length**: 7 days vs 14 days vs 30 days
3. **Billing cycles**: Monthly vs Annual discount (15% vs 20% vs 25%)
4. **Feature bundling**: Different feature combinations

### Value Metrics
- DMs automated (usage-based)
- Contacts saved
- Time saved per month
- Revenue generated

### Upgrade Triggers
- Show upgrade modal when:
  - 80% of any limit reached
  - User tries to use premium feature
  - Trial expires in 3 days
  - Monthly invoice is generated

---

## 🎓 Customer Success

### Onboarding Flow for Paid Users
1. Welcome email with getting started guide
2. Personal onboarding call for Team+ plans
3. Setup checklist in dashboard
4. Integration tutorials
5. Best practices documentation

### Retention Strategies
- Send usage reports weekly
- Highlight value delivered ("You automated 5,000 DMs this month!")
- Feature announcements for paid users first
- Exclusive webinars and office hours
- Dedicated Slack/Discord channel

---

## 📝 Implementation Timeline

### Week 1-2: Foundation
- Database schema changes
- Stripe account setup
- Migration scripts
- Basic API routes

### Week 3-4: Core Features
- Checkout flow
- Webhook handlers
- Middleware & limits
- Usage tracking

### Week 5-6: UI/UX
- Pricing page
- Upgrade modals
- Settings/billing page
- Usage widgets

### Week 7-8: Polish & Testing
- Email notifications
- Admin dashboard
- Testing (unit + integration)
- Documentation

### Week 9-10: Launch Prep
- Beta testing with select users
- Fix bugs
- Performance optimization
- Marketing materials

### Week 11: Soft Launch
- Launch to 10% of users
- Monitor metrics
- Fix critical issues
- Gather feedback

### Week 12: Full Launch
- Launch to all users
- Marketing campaign
- Monitor closely
- Iterate based on feedback

---

## 🆘 Troubleshooting Guide

### Common Issues

**Webhook not receiving events**
- Check webhook URL in Stripe dashboard
- Verify webhook secret is correct
- Check firewall/CORS settings
- Test with Stripe CLI

**Payment failing**
- Check Stripe API keys
- Verify customer has valid payment method
- Check for any Stripe restrictions
- Review error logs

**Usage not tracking**
- Verify increment functions are called
- Check MongoDB connection
- Review automation creation flow
- Check for race conditions

**Trial not activating**
- Verify checkout session metadata
- Check webhook handler for trial logic
- Review subscription object in database
- Check trial_period_days in checkout

---

## 📚 Resources & References

### Documentation
- [Stripe Billing Docs](https://stripe.com/docs/billing)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [MongoDB Transactions](https://www.mongodb.com/docs/manual/core/transactions/)

### Tools
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Resend (Email)](https://resend.com)

### Monitoring
- [Sentry](https://sentry.io) - Error tracking
- [Vercel Analytics](https://vercel.com/analytics) - Performance
- [PostHog](https://posthog.com) - Product analytics

---

## ✅ Final Checklist

Before going live with billing:

- [ ] All Stripe products created in production
- [ ] Webhook endpoint configured and tested
- [ ] Environment variables set in production
- [ ] Database migration completed successfully
- [ ] Checkout flow tested end-to-end
- [ ] Upgrade/downgrade flow tested
- [ ] Cancellation flow tested
- [ ] Trial expiration flow tested
- [ ] Payment failure handling tested
- [ ] Email notifications working
- [ ] Usage limits enforced correctly
- [ ] Admin dashboard functional
- [ ] Terms of Service updated
- [ ] Privacy policy updated
- [ ] Pricing page published
- [ ] Support documentation ready
- [ ] Monitoring & alerts configured
- [ ] Rollback plan documented
- [ ] Team trained on new features

---

## 💡 Pro Tips

1. **Start with annual billing** - Better cash flow and lower churn
2. **Grandfather existing users** - Offer special pricing to early adopters
3. **Transparent pricing** - No hidden fees, clear limits
4. **Easy upgrades** - Make it frictionless to upgrade
5. **Fair downgrades** - Pro-rate credits, don't lock users in
6. **Excellent support** - Fast, helpful responses build loyalty
7. **Regular communication** - Keep users informed of changes
8. **Listen to feedback** - Iterate based on user needs

---

## 🎉 Conclusion

This implementation guide provides a complete roadmap for transforming ChatAutoDM into a sustainable SaaS business. Follow the phases sequentially, test thoroughly, and always put the customer experience first.

Remember: **Billing is not just about collecting money—it's about delivering value and building trust with your customers.**

Good luck! 🚀

---

**Document Version:** 1.0  
**Last Updated:** November 2, 2025  
**Maintained By:** Development Team  
**Status:** Ready for Implementation
