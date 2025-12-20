import { Webhook } from "svix"
import { headers } from "next/headers"
import { WebhookEvent } from "@clerk/nextjs/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(req: Request) {
  // Get the webhook secret from environment variables
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET environment variable")
    return new Response("Missing webhook secret", { status: 500 })
  }

  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with the webhook secret
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the webhook
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error("Error verifying webhook:", err)
    return new Response("Invalid webhook signature", { status: 400 })
  }

  // Handle the webhook event
  const eventType = evt.type

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data

    const primaryEmail = email_addresses?.find(
      (email) => email.id === evt.data.primary_email_address_id
    )?.email_address

    if (!primaryEmail) {
      console.error("No primary email found for user:", id)
      return new Response("No primary email found", { status: 400 })
    }

    const fullName = [first_name, last_name].filter(Boolean).join(" ") || primaryEmail.split("@")[0]

    try {
      // Sync to users table
      await convex.mutation(api.users.syncProfile, {
        clerkUserId: id,
        email: primaryEmail,
        name: fullName,
        avatarUrl: image_url,
      })

      // Add to waitlist table (for new users)
      if (eventType === "user.created") {
        try {
          await convex.mutation(api.waitlist.add, {
            email: primaryEmail,
            firstName: first_name || "",
            lastName: last_name || "",
            clerkUserId: id,
          })
        } catch (err) {
          // User might already be in waitlist, that's okay
          console.log("Waitlist entry may already exist:", err)
        }
      }

      console.log(`Successfully synced user ${id} to Convex`)
      return new Response("User synced to Convex", { status: 200 })
    } catch (error) {
      console.error("Error syncing user to Convex:", error)
      return new Response("Error syncing user", { status: 500 })
    }
  }

  // Return 200 for unhandled event types
  return new Response("Webhook received", { status: 200 })
}
