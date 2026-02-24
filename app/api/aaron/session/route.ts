import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/aaron/session — Proxy to Aaron Router on Jetson edge node
 * GET  /api/aaron/session?sessionId=xxx — Poll session status
 *
 * The Aaron Router runs on the Jetson Orin Nano (edge compute).
 * In production, this reaches the Jetson via Tailscale mesh.
 * For local dev, falls back to localhost:8888 if AARON_URL isn't set.
 */

// Tailscale Funnel exposes Aaron Router publicly at /aaron path
// Env var override for custom deployments; default is Funnel URL
const AARON_URL = process.env.AARON_ROUTER_URL || "https://jettoptx-joe.taile11759.ts.net/aaron"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const res = await fetch(`${AARON_URL}/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json(
        { error: `Aaron session error: ${text}` },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error("[/api/aaron/session] Proxy error:", err)
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

  try {
    const res = await fetch(`${AARON_URL}/session/${sessionId}`, {
      signal: AbortSignal.timeout(5_000),
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json(
        { error: `Session lookup failed: ${text}` },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error("[/api/aaron/session] Poll error:", err)
    return NextResponse.json(
      { error: "Aaron Router unreachable" },
      { status: 502 }
    )
  }
}
