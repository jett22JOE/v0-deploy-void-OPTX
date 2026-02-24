import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/aaron/verify — Proxy gaze proof submission to Aaron Router on Jetson
 * GET  /api/aaron/verify?sessionId=xxx — Poll verification status (alias for session poll)
 *
 * MOJO app submits gaze proof here after completing the 6-step AGT calibration.
 * This proxies to the Jetson Aaron Router which validates and stores the attestation.
 */

// Tailscale Funnel exposes Aaron Router publicly at /aaron path
const AARON_URL = process.env.AARON_ROUTER_URL || "https://jettoptx-joe.taile11759.ts.net/aaron"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const res = await fetch(`${AARON_URL}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15_000),
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json(
        { error: `Aaron verification error: ${text}` },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error("[/api/aaron/verify] Proxy error:", err)
    return NextResponse.json(
      { error: "Aaron Router unreachable — edge node may be offline" },
      { status: 502 }
    )
  }
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId")
  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 })
  }

  // Poll session status (same endpoint as /api/aaron/session GET)
  try {
    const res = await fetch(`${AARON_URL}/session/${sessionId}`, {
      signal: AbortSignal.timeout(5_000),
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json(
        { error: `Session poll failed: ${text}` },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error("[/api/aaron/verify] Poll error:", err)
    return NextResponse.json(
      { error: "Aaron Router unreachable" },
      { status: 502 }
    )
  }
}
