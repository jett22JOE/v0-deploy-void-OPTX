import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/aaron/mint — Proxy OPTX mint request to Aaron Router on Jetson
 *
 * Called after successful gaze verification to mint OPTX tokens.
 * Aaron Router validates the verification ID and records the mint attestation.
 * Program: HkJoo6829ANVxPNCVDURjZazRncWv1ht3WfyDc2GD5oH (devnet)
 */

const AARON_URL = process.env.AARON_ROUTER_URL || "https://jettoptx-joe.taile11759.ts.net/aaron"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const mintBody = {
      verification_id: body.verificationId || body.verification_id,
      wallet_address: body.walletAddress || body.wallet_address,
      entropy_score: body.entropyScore || body.entropy_score || 750,
      agt_weights: body.agtWeights || body.agt_weights || {},
    }

    if (!mintBody.verification_id || !mintBody.wallet_address) {
      return NextResponse.json(
        { error: "Missing verificationId or walletAddress" },
        { status: 400 }
      )
    }

    const res = await fetch(`${AARON_URL}/mint`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mintBody),
      signal: AbortSignal.timeout(15_000),
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json(
        { error: `Aaron mint error: ${text}` },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error("[/api/aaron/mint] Proxy error:", err)
    return NextResponse.json(
      { error: "Aaron Router unreachable — edge node may be offline" },
      { status: 502 }
    )
  }
}
