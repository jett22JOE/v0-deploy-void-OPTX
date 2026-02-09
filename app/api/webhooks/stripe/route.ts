import { headers } from "next/headers"
import { NextResponse } from "next/server"
import Stripe from "stripe"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

// Lazy-load clients to avoid build-time errors
function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set")
  }
  return new Stripe(key, {
    apiVersion: "2024-12-18.acacia",
  })
}

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!url) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is not set")
  }
  return new ConvexHttpClient(url)
}

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  // Get clients at runtime
  const stripe = getStripeClient()
  const convex = getConvexClient()

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error(`Webhook signature verification failed: ${message}`)
    return NextResponse.json({ error: message }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string
        const clerkUserId = session.metadata?.clerkUserId

        if (clerkUserId) {
          // Set clerkUserId on Stripe customer so future subscription events can find user
          if (customerId) {
            try {
              await stripe.customers.update(customerId, {
                metadata: { clerkUserId },
              })
            } catch (e) {
              console.error("Failed to set customer metadata:", e)
            }
          }

          await convex.mutation(api.users.updateStripeInfo, {
            clerkUserId,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            stripeStatus: "active",
          })
        }
        break
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const status = subscription.status

        // Find user by stripe customer ID and update
        const customer = await stripe.customers.retrieve(customerId)
        if (!customer.deleted && customer.metadata?.clerkUserId) {
          await convex.mutation(api.users.updateStripeInfo, {
            clerkUserId: customer.metadata.clerkUserId,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscription.id,
            stripeStatus: status,
          })
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const customer = await stripe.customers.retrieve(customerId)
        if (!customer.deleted && customer.metadata?.clerkUserId) {
          await convex.mutation(api.users.updateStripeInfo, {
            clerkUserId: customer.metadata.clerkUserId,
            stripeCustomerId: customerId,
            stripeSubscriptionId: null,
            stripeStatus: "canceled",
          })
        }
        break
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice
        console.log(`Invoice paid: ${invoice.id}`)
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const customer = await stripe.customers.retrieve(customerId)
        if (!customer.deleted && customer.metadata?.clerkUserId) {
          await convex.mutation(api.users.updateStripeInfo, {
            clerkUserId: customer.metadata.clerkUserId,
            stripeCustomerId: customerId,
            stripeSubscriptionId: invoice.subscription as string,
            stripeStatus: "past_due",
          })
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook handler error:", error)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }
}
