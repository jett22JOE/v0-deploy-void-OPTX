import { NextResponse } from "next/server"
import Stripe from "stripe"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"
import { STRIPE_PRICE_TO_TIER } from "@/lib/stripe"
import { auth } from "@clerk/nextjs/server"

function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set")
  return new Stripe(key, { apiVersion: "2024-12-18.acacia" })
}

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is not set")
  return new ConvexHttpClient(url)
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { sessionId } = await req.json()

    const stripe = getStripeClient()
    const convex = getConvexClient()

    // If we have a session_id from checkout redirect, verify it directly with Stripe
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

      // Fix: Set clerkUserId on Stripe customer so future webhook events work
      if (customerId) {
        try {
          await stripe.customers.update(customerId, {
            metadata: { clerkUserId: userId },
          })
        } catch (e) {
          console.error("Failed to update customer metadata:", e)
        }
      }

      // Update Convex with verified subscription data
      await convex.mutation(api.users.updateStripeInfo, {
        clerkUserId: userId,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        stripeStatus: subscription.status,
      })

      // Also sync the subscription tier
      const priceId = subscription.items.data[0]?.price?.id
      const resolvedTier = priceId ? (STRIPE_PRICE_TO_TIER[priceId] || tier) : tier

      if (resolvedTier && resolvedTier !== "free") {
        await convex.mutation(api.dev.updateStripeSubscription, {
          clerkUserId: userId,
          customerId,
          subscriptionId: subscription.id,
          status: subscription.status,
        })
      }

      return NextResponse.json({
        status: subscription.status === "active" ? "active" : "pending",
        tier: resolvedTier,
        subscriptionId: subscription.id,
      })
    }

    // No session_id: check Convex for existing subscription status
    const devStatus = await convex.query(api.dev.getUserDevStatus, {
      clerkUserId: userId,
    })

    if (devStatus?.stripeStatus === "active" && devStatus?.stripeSubscriptionId) {
      return NextResponse.json({
        status: "active",
        tier: "subscribed",
        subscriptionId: devStatus.stripeSubscriptionId,
      })
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
