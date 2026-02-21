import { httpRouter } from "convex/server"
import { httpAction } from "./_generated/server"
import { api } from "./_generated/api"

const http = httpRouter()

// Verify a Svix (Clerk) webhook signature using HMAC-SHA-256
async function verifySvixSignature(
  body: string,
  svixId: string,
  svixTimestamp: string,
  svixSignature: string,
  secret: string
): Promise<boolean> {
  // Svix secrets are prefixed with "whsec_" and base64-encoded
  const rawSecret = secret.startsWith("whsec_")
    ? secret.slice("whsec_".length)
    : secret

  let keyBytes: Uint8Array
  try {
    keyBytes = Uint8Array.from(atob(rawSecret), (c) => c.charCodeAt(0))
  } catch {
    console.error("Clerk webhook: invalid secret format (bad base64)")
    return false
  }

  const message = `${svixId}.${svixTimestamp}.${body}`
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes.buffer.slice(keyBytes.byteOffset, keyBytes.byteOffset + keyBytes.byteLength),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const sigBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(message)
  )
  const computed = btoa(String.fromCharCode(...new Uint8Array(sigBytes)))

  // svix-signature header may contain multiple space-separated "v1,<b64>" entries
  const signatures = svixSignature.split(" ")
  for (const entry of signatures) {
    const [version, provided] = entry.split(",")
    if (version === "v1" && provided) {
      if (provided.length === computed.length) {
        let mismatch = 0
        for (let i = 0; i < provided.length; i++) {
          mismatch |= provided.charCodeAt(i) ^ computed.charCodeAt(i)
        }
        if (mismatch === 0) return true
      }
    }
  }
  return false
}

// --- Clerk Webhook ---
http.route({
  path: "/clerkWebhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const svixId = request.headers.get("svix-id")
    const svixTimestamp = request.headers.get("svix-timestamp")
    const svixSignature = request.headers.get("svix-signature")

    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error("Clerk webhook: missing svix headers")
      return new Response("Missing svix headers", { status: 400 })
    }

    const body = await request.text()

    const clerkWebhookSecret = process.env.CLERK_WEBHOOK_SECRET
    if (!clerkWebhookSecret) {
      console.error("CLERK_WEBHOOK_SECRET is not set")
      return new Response("Webhook secret not configured", { status: 500 })
    }

    const valid = await verifySvixSignature(
      body,
      svixId,
      svixTimestamp,
      svixSignature,
      clerkWebhookSecret
    )
    if (!valid) {
      console.error("Clerk webhook: signature verification failed")
      return new Response("Invalid signature", { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = JSON.parse(body) as any
    console.log("Clerk webhook:", payload.type)

    if (payload.type === "user.created") {
      const email = payload.data.email_addresses?.[0]?.email_address
      const firstName = payload.data.first_name || ""
      const lastName = payload.data.last_name || ""
      const clerkUserId = payload.data.id

      if (email) {
        await ctx.runMutation(api.waitlist.add, {
          email,
          firstName,
          lastName,
          clerkUserId,
        })
      }
    }

    if (payload.type === "email.created") {
      const email = payload.data.email_address
      const clerkUserId = payload.data.user_id

      const existing = await ctx.runQuery(api.waitlist.getWaitlistByEmail, {
        email,
      })
      if (!existing) {
        await ctx.runMutation(api.waitlist.add, {
          email,
          firstName: "",
          lastName: "",
          clerkUserId,
        })
      }
    }

    return new Response("OK", { status: 200 })
  }),
})

// --- Stripe Webhook ---
async function verifyStripeSignature(
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const parts = signature.split(",")
  const timestamp = parts.find((p) => p.startsWith("t="))?.split("=")[1]
  const sig = parts.find((p) => p.startsWith("v1="))?.split("=")[1]
  if (!timestamp || !sig) return false

  // Reject events older than 5 minutes
  const age = Math.floor(Date.now() / 1000) - parseInt(timestamp, 10)
  if (age > 300) return false

  const payload = `${timestamp}.${body}`
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret).buffer as ArrayBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const sigBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload).buffer as ArrayBuffer
  )
  const expected = Array.from(new Uint8Array(sigBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")

  // Use constant-time comparison to prevent timing attacks
  if (expected.length !== sig.length) return false
  let mismatch = 0
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ sig.charCodeAt(i)
  }
  return mismatch === 0
}

http.route({
  path: "/api/stripe",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    // Verify webhook signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (webhookSecret && signature) {
      const valid = await verifyStripeSignature(body, signature, webhookSecret)
      if (!valid) {
        console.error("Stripe webhook signature verification failed")
        return new Response("Invalid signature", { status: 400 })
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const event = JSON.parse(body) as any
    console.log("Stripe event:", event.type, event.id)

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object
        const email =
          session.customer_email || session.customer_details?.email
        const customerId = session.customer
        const tier = session.metadata?.tier

        if (email && tier) {
          await ctx.runMutation(api.users.syncStripeSubscription, {
            email,
            stripeCustomerId: customerId || "",
            subscriptionTier: tier,
          })
          console.log(`Stripe checkout: ${email} → ${tier}`)
        } else {
          console.error("Stripe checkout missing email or tier:", {
            email,
            tier,
            sessionId: session.id,
          })
        }
        break
      }

      case "customer.subscription.updated": {
        const sub = event.data.object
        const tier = sub.metadata?.tier
        if (!tier || sub.status !== "active") break

        const email = await fetchStripeCustomerEmail(sub.customer)
        if (email) {
          await ctx.runMutation(api.users.syncStripeSubscription, {
            email,
            stripeCustomerId: sub.customer,
            subscriptionTier: tier,
          })
          console.log(`Stripe sub updated: ${email} → ${tier}`)
        }
        break
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object
        const email = await fetchStripeCustomerEmail(sub.customer)
        if (email) {
          await ctx.runMutation(api.users.syncStripeSubscription, {
            email,
            stripeCustomerId: sub.customer,
            subscriptionTier: "free",
          })
          console.log(`Stripe sub cancelled: ${email} → free`)
        }
        break
      }

      default:
        console.log(`Stripe event ignored: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  }),
})

// Fetch customer email from Stripe API (for subscription events that lack email)
async function fetchStripeCustomerEmail(
  customerId: string
): Promise<string | null> {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey || !customerId) return null

  try {
    const res = await fetch(
      `https://api.stripe.com/v1/customers/${customerId}`,
      { headers: { Authorization: `Bearer ${stripeKey}` } }
    )
    if (!res.ok) return null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const customer = (await res.json()) as any
    return customer.email || null
  } catch (err) {
    console.error("Failed to fetch Stripe customer:", err)
    return null
  }
}

export default http
