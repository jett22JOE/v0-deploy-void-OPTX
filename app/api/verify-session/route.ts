import { NextResponse } from "next/server"
import Stripe from "stripe"
import { STRIPE_PRICE_TO_TIER } from "@/lib/stripe"
import { auth, clerkClient } from "@clerk/nextjs/server"

function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set")
  return new Stripe(key, { apiVersion: "2024-12-18.acacia" })
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { sessionId } = await req.json()
    const stripe = getStripeClient()

    // Path 1: Verify a specific checkout session (post-payment redirect)
    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["subscription"],
      })

      if (session.payment_status !== "paid") {
        return NextResponse.json({
          status: "failed",
          message: "Payment not completed",
        })
      }

      const subscription = session.subscription as Stripe.Subscription
      if (!subscription) {
        return NextResponse.json({
          status: "failed",
          message: "No subscription found",
        })
      }

      const customerId = session.customer as string
      const tier = session.metadata?.tier || "free"

      // Set clerkUserId on Stripe customer for future webhook events
      if (customerId) {
        try {
          await stripe.customers.update(customerId, {
            metadata: { clerkUserId: userId },
          })
        } catch (e) {
          console.error("Failed to update customer metadata:", e)
        }
      }

      const priceId = subscription.items.data[0]?.price?.id
      const resolvedTier = priceId ? (STRIPE_PRICE_TO_TIER[priceId] || tier) : tier

      return NextResponse.json({
        status: subscription.status === "active" ? "active" : "pending",
        tier: resolvedTier,
        subscriptionId: subscription.id,
      })
    }

    // Path 2: No session_id — look up Stripe customer by Clerk email
    const clerk = await clerkClient()
    const clerkUser = await clerk.users.getUser(userId)
    const email = clerkUser.emailAddresses[0]?.emailAddress

    if (!email) {
      return NextResponse.json({ status: "inactive" })
    }

    // Search Stripe for active subscriptions by customer email
    const customers = await stripe.customers.list({ email, limit: 5 })

    for (const customer of customers.data) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: "active",
        limit: 1,
      })

      if (subscriptions.data.length > 0) {
        const sub = subscriptions.data[0]
        const priceId = sub.items.data[0]?.price?.id
        const tier = priceId ? (STRIPE_PRICE_TO_TIER[priceId] || "subscribed") : "subscribed"

        // Ensure customer has clerkUserId metadata
        if (!customer.metadata?.clerkUserId) {
          try {
            await stripe.customers.update(customer.id, {
              metadata: { clerkUserId: userId },
            })
          } catch (e) {
            console.error("Failed to update customer metadata:", e)
          }
        }

        return NextResponse.json({
          status: "active",
          tier,
          subscriptionId: sub.id,
        })
      }
    }

    return NextResponse.json({ status: "inactive" })
  } catch (error) {
    console.error("Verify session error:", error)
    return NextResponse.json(
      { error: "Verification failed", status: "failed" },
      { status: 500 }
    )
  }
}
