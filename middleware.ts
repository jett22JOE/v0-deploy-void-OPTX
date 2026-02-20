import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/loading(.*)",
  "/pricing(.*)",
  "/seo(.*)",
  "/optical-spatial-encryption(.*)",
  "/api/webhooks(.*)",
  "/api/waitlist(.*)",
  "/api/hedgehog(.*)",
  "/api/create-checkout(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/optx-login(.*)",
  "/gaze-verify(.*)",
  "/vault(.*)",
  // OAuth callback routes - critical for social login flows
  "/sso-callback(.*)",
  "/oauth-callback(.*)",
])

// Clerk middleware for Next.js 16 - handles auth state and OAuth flows
export default clerkMiddleware(async (auth, request) => {
  const url = new URL(request.url)
  const hostname = url.hostname

  // Subdomain routing: vault.jettoptics.ai → /vault
  // Domain routing: astroknots.space → /vault (SNS .sol domain landing)
  if (hostname === "vault.jettoptics.ai" || hostname === "astroknots.space" || hostname === "www.astroknots.space") {
    if (!url.pathname.startsWith("/vault")) {
      url.pathname = `/vault${url.pathname === "/" ? "" : url.pathname}`
      return NextResponse.rewrite(url)
    }
  }

  const { pathname } = url

  // CRITICAL FIX: Do NOT early return for OAuth/SSO callbacks
  // These need to be processed by Clerk to set session cookies
  const isCallback = pathname.startsWith('/oauth-callback') || pathname.startsWith('/sso-callback')

  // For public routes (except callbacks), don't require authentication
  // This allows the Waitlist component to work properly
  if (isPublicRoute(request) && !isCallback) {
    return
  }

  // For OAuth/SSO callbacks: Let Clerk middleware process them automatically
  // For protected routes: Optionally add auth.protect() to enforce authentication
  // await auth.protect()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
