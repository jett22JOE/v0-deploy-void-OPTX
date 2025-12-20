import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Next.js 16 proxy function (runs on Node.js runtime)
// Clerk auth handled client-side via ClerkProvider
export function proxy(request: NextRequest) {
  // Allow all routes - auth protection handled by components
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
}
