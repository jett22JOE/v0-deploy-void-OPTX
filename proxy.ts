import { clerkMiddleware } from "@clerk/nextjs/server"

// Next.js 16 proxy function with Clerk middleware
// Clerk middleware handles auth state for Waitlist and other components
export const proxy = clerkMiddleware()

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
