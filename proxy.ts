import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/loading(.*)",
  "/seo(.*)",
  "/optical-spatial-encryption(.*)",
  "/api/webhook(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
])

// Clerk middleware for Next.js 16 - handles auth state and waitlist functionality
// Next.js 16 uses 'proxy' export instead of 'default' export
export const proxy = clerkMiddleware(async (auth, request) => {
  // For public routes, don't require authentication
  // This allows the Waitlist component to work properly
  if (isPublicRoute(request)) {
    return
  }

  // For protected routes, you can add auth.protect() here
  // await auth.protect()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
