import { NextResponse } from "next/server"
import Stripe from "stripe"

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
    const { priceId, clerkUserId, customerEmail } = await req.json()

    if (!priceId || !clerkUserId) {
      return NextResponse.json(
        { error: "Missing priceId or clerkUserId" },
        { status: 400 }
      )
    }

    const stripe = getStripeClient()

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://jettoptics.ai"}/dev?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://jettoptics.ai"}/pricing`,
      metadata: { clerkUserId },
      customer_email: customerEmail,
      subscription_data: {
        metadata: { clerkUserId },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("Checkout session error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
