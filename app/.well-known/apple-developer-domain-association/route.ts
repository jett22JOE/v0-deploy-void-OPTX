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
  // TODO: Replace this placeholder content with actual content from Apple Developer Portal
  //
  // To get the correct content:
  // 1. Go to https://developer.apple.com/account/resources/identifiers
  // 2. Click on Services ID: ai.jettoptics.gazeauth.OPTX
  // 3. Click "Download" under "Associated Domains"
  // 4. Copy the content from the downloaded file
  // 5. Replace the content below

  const content = `{
  "applinks": {
    "apps": [],
    "details": []
  },
  "webcredentials": {
    "apps": [
      "YOUR_APPLE_TEAM_ID.ai.jettoptics.gazeauth.OPTX"
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
