import { headers } from "next/headers"
import { Webhook } from "svix"
import { WebhookEvent } from "@clerk/nextjs/server"
import { api } from "@/convex/_generated/api"
import { ConvexHttpClient } from "convex/browser"

// Lazy-load the Convex client to avoid build-time errors
function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!url) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is not set")
  }
  return new ConvexHttpClient(url)
}

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your webhook secret
  const clerkWebhookSecret = process.env.CLERK_WEBHOOK_SECRET
  if (!clerkWebhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET is not set")
    return new Response("Error: Missing webhook secret configuration", {
      status: 500,
    })
  }
  const wh = new Webhook(clerkWebhookSecret)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error("Error verifying webhook:", err)
    return new Response("Error: Verification failed", {
      status: 400,
    })
  }

  // Get Convex client at runtime
  const convex = getConvexClient()

  // Handle the webhook
  const eventType = evt.type

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data

    try {
      // Sync user profile to Convex
      await convex.mutation(api.users.syncProfile, {
        clerkUserId: id,
        email: email_addresses[0]?.email_address || "",
        name: first_name && last_name ? `${first_name} ${last_name}` : first_name || "",
        avatarUrl: image_url,
      })

      console.log(`✅ User synced to Convex: ${email_addresses[0]?.email_address}`)

      return new Response("User synced successfully", { status: 200 })
    } catch (error) {
      console.error("Error syncing user to Convex:", error)
      return new Response("Error syncing user", { status: 500 })
    }
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data

    try {
      // Update user profile in Convex
      await convex.mutation(api.users.syncProfile, {
        clerkUserId: id,
        email: email_addresses[0]?.email_address || "",
        name: first_name && last_name ? `${first_name} ${last_name}` : first_name || "",
        avatarUrl: image_url,
      })

      console.log(`✅ User updated in Convex: ${email_addresses[0]?.email_address}`)

      return new Response("User updated successfully", { status: 200 })
    } catch (error) {
      console.error("Error updating user in Convex:", error)
      return new Response("Error updating user", { status: 500 })
    }
  }

  return new Response("Webhook received", { status: 200 })
}
