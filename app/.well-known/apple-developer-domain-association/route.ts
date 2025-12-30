/**
 * Apple Developer Domain Association File
 *
 * This endpoint serves the domain verification file required by Apple
 * for Sign In with Apple to work correctly.
 *
 * Apple checks this file at: https://jettoptics.ai/.well-known/apple-developer-domain-association
 */

import { NextResponse } from "next/server"

export async function GET() {
  // Apple Developer Domain Association for Sign In with Apple
  // Format: TeamID.ServiceID
  // Services ID: ai.jettoptics.gazeauth.web
  // Team ID: SFYR62R3DY (verify this matches your Apple Developer account)

  const content = `{
  "applinks": {
    "apps": [],
    "details": []
  },
  "webcredentials": {
    "apps": [
      "SFYR62R3DY.ai.jettoptics.gazeauth.web"
    ]
  }
}`

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
