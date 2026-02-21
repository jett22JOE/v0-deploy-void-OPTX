import { NextResponse } from "next/server"
import Stripe from "stripe"
import { VALID_PRICE_IDS, STRIPE_PRICE_TO_TIER } from "@/lib/stripe"
import { auth } from "@clerk/nextjs/server"

function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set")
  }
  return new Stripe(key, {
    apiVersion: "2024-12-18.acacia",
  })
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { priceId, customerEmail } = await req.json()

    if (!priceId) {
      return NextResponse.json(
        { error: "Missing priceId" },
        { status: 400 }
      )
    }

    if (!VALID_PRICE_IDS.has(priceId)) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 })
    }

    const stripe = getStripeClient()
    const tier = STRIPE_PRICE_TO_TIER[priceId] || "free"

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://jettoptics.ai"}/dojo?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://jettoptics.ai"}/security`,
      metadata: { clerkUserId: userId, tier },
      customer_email: customerEmail,
      subscription_data: {
        metadata: { clerkUserId: userId, tier },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("Checkout session error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
