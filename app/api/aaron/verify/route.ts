import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

/**
 * POST /api/aaron/verify — Proxy gaze proof submission to Aaron Router on Jetson
 * GET  /api/aaron/verify?sessionId=xxx — Poll verification status (alias for session poll)
 *
 * MOJO app submits gaze proof here after completing the 6-step AGT calibration.
 * This proxies to the Jetson Aaron Router which validates and stores the attestation.
 */

// Tailscale Funnel exposes Aaron Router publicly at /aaron path
function getAaronUrl() {
  const url = process.env.AARON_ROUTER_URL
  if (!url) throw new Error("AARON_ROUTER_URL not configured")
  return url
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()

    // Convert camelCase (frontend) → snake_case (Aaron Router / FastAPI)
    // Also map zone numbers (1=COG, 2=EMO, 3=ENV) to strings if needed
    const ZONE_MAP: Record<number, string> = { 1: "COG", 2: "EMO", 3: "ENV" }
    const rawSequence = body.gazeSequence || body.gaze_sequence || []
    const gazeSequence = rawSequence.map((z: number | string) =>
      typeof z === "number" ? ZONE_MAP[z] || String(z) : z
    )

    const snakeBody = {
      session_id: body.sessionId || body.session_id,
      challenge: body.challenge,
      gaze_sequence: gazeSequence,
      hold_durations: body.holdDurations || body.hold_durations,
      polynomial_encoding: body.polynomialEncoding || body.polynomial_encoding,
      verification_hash: body.verificationHash || body.verification_hash,
      wallet_address: body.walletAddress || body.wallet_address || null,
    }

    const res = await fetch(`${getAaronUrl()}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(snakeBody),
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
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const sessionId = req.nextUrl.searchParams.get("sessionId")
  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 })
  }

  // Poll session status (same endpoint as /api/aaron/session GET)
  try {
    const res = await fetch(`${getAaronUrl()}/session/${sessionId}`, {
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
