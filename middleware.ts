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
  "/aaron-docs(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  "/vault(.*)",
  // OAuth callback routes - critical for social login flows
  "/sso-callback(.*)",
  "/oauth-callback(.*)",
])

// Clerk middleware for Next.js 16 - handles auth state and OAuth flows
export default clerkMiddleware(async (auth, request) => {
  const url = new URL(request.url)
  const hostname = url.hostname

  // Redirect vault.jettoptics.ai → astroknots.space (permanent)
  if (hostname === "vault.jettoptics.ai") {
    return NextResponse.redirect(`https://astroknots.space${url.pathname === "/vault" ? "" : url.pathname.replace(/^\/vault/, "")}`, 301)
  }

  // Primary vault domain: astroknots.space → /vault (and /docs → /aaron-docs)
  if (hostname === "astroknots.space" || hostname === "www.astroknots.space") {
    // /docs on astroknots.space → public AARON docs
    if (url.pathname === "/docs" || url.pathname.startsWith("/docs/")) {
      url.pathname = url.pathname.replace(/^\/docs/, "/aaron-docs")
      return NextResponse.rewrite(url)
    }
    // Vault routes
    if (url.pathname === "/" || url.pathname.startsWith("/vault")) {
      if (!url.pathname.startsWith("/vault")) {
        url.pathname = "/vault"
        return NextResponse.rewrite(url)
      }
    } else {
      // Everything else → redirect to jettoptics.ai
      return NextResponse.redirect(`https://jettoptics.ai${url.pathname}`, 302)
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
