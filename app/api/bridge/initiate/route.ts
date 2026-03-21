import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

/**
 * POST /api/bridge/initiate — Creates a new bridge request
 *
 * Accepts: { direction, amount, solWallet, xrpAddress, gazeVerified? }
 * Returns: { bridgeId, xamanPayloadUrl?, status }
 *
 * For XRP→SOL direction, creates a Xaman payload URL for the user to sign.
 * For SOL→XRP, the Solana lock is handled client-side via wallet adapter.
 * Proxies to AARON router for attestation if gaze-gated.
 */

// XRPL Hook account that receives locked USDC
const XRPL_HOOK_ACCOUNT = "rLXCpNStZodh9HjXn5DyoSFMKies1vKBUG"
const CIRCLE_XRPL_ISSUER = "rcEGREd8NmkKRE8GE424sksyt1tJVFZwu"
const GAZE_GATE_THRESHOLD = 100

// Xaman API
const XAMAN_API_BASE = "https://xumm.app/api/v1"
const XAMAN_API_KEY = process.env.XAMAN_API_KEY || ""
const XAMAN_API_SECRET = process.env.XAMAN_API_SECRET || ""

// AARON Router
function getAaronUrl() {
  return process.env.AARON_ROUTER_URL || ""
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { direction, amount, solWallet, xrpAddress, gazeVerified } = body

    // Validate inputs
    if (!direction || !["xrp_to_sol", "sol_to_xrp"].includes(direction)) {
      return NextResponse.json({ error: "Invalid direction" }, { status: 400 })
    }
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }
    if (direction === "xrp_to_sol" && !xrpAddress) {
      return NextResponse.json({ error: "XRP address required for XRP→SOL bridge" }, { status: 400 })
    }
    if (direction === "sol_to_xrp" && !solWallet) {
      return NextResponse.json({ error: "SOL wallet required for SOL→XRP bridge" }, { status: 400 })
    }

    // Gaze gate check
    if (amount > GAZE_GATE_THRESHOLD && !gazeVerified) {
      return NextResponse.json(
        { error: `Gaze verification required for amounts over ${GAZE_GATE_THRESHOLD} USDC` },
        { status: 403 }
      )
    }

    // Generate bridge ID
    const bridgeId = crypto.randomUUID()

    // Calculate GENSYS fee split (80/15/5)
    const totalFee = amount * 0.005 // 0.5%
    const feeLiquidity = totalFee * 0.80
    const feeJtx = totalFee * 0.15
    const feeTreasury = totalFee - feeLiquidity - feeJtx

    // If gaze-gated, proxy attestation to AARON
    let gazeAttestation = null
    if (amount > GAZE_GATE_THRESHOLD && gazeVerified) {
      const aaronUrl = getAaronUrl()
      if (aaronUrl) {
        try {
          const attestRes = await fetch(`${aaronUrl}/attestation/bridge`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bridge_id: bridgeId,
              amount,
              direction,
              wallet: solWallet || xrpAddress,
            }),
            signal: AbortSignal.timeout(10_000),
          })
          if (attestRes.ok) {
            gazeAttestation = await attestRes.json()
          }
        } catch {
          // Attestation is best-effort — bridge proceeds without it
          console.warn("[bridge/initiate] AARON attestation unavailable")
        }
      }
    }

    // For XRP→SOL: create Xaman payload
    let xamanPayloadUrl: string | null = null
    if (direction === "xrp_to_sol" && XAMAN_API_KEY) {
      try {
        const payloadRes = await fetch(`${XAMAN_API_BASE}/platform/payload`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": XAMAN_API_KEY,
            "X-API-Secret": XAMAN_API_SECRET,
          },
          body: JSON.stringify({
            txjson: {
              TransactionType: "Payment",
              Destination: XRPL_HOOK_ACCOUNT,
              Amount: {
                currency: "USD",
                value: String(amount),
                issuer: CIRCLE_XRPL_ISSUER,
              },
              Memos: [
                {
                  Memo: {
                    MemoType: Buffer.from("bridge_id").toString("hex"),
                    MemoData: Buffer.from(bridgeId).toString("hex"),
                  },
                },
              ],
            },
            options: {
              submit: true,
              expire: 30,
              return_url: {
                web: `${req.nextUrl.origin}/bridge?bridgeId=${bridgeId}&status=signed`,
              },
            },
          }),
          signal: AbortSignal.timeout(10_000),
        })

        if (payloadRes.ok) {
          const payloadData = await payloadRes.json()
          xamanPayloadUrl = payloadData.next?.always || null
        }
      } catch (err) {
        console.error("[bridge/initiate] Xaman payload error:", err)
        // Bridge can still proceed — user can create payload client-side
      }
    }

    // Build bridge record (would be persisted to SpacetimeDB/Convex in production)
    const bridgeRecord = {
      bridgeId,
      direction,
      amount,
      solWallet: solWallet || null,
      xrpAddress: xrpAddress || null,
      status: "initiated",
      xamanPayloadUrl,
      gazeAttestation: gazeAttestation?.gaze_hash || null,
      fees: { liquidity: feeLiquidity, jtx: feeJtx, treasury: feeTreasury },
      createdAt: new Date().toISOString(),
    }

    // TODO: Persist to SpacetimeDB via reducer call
    // await spacetimedb.call_reducer("create_bridge_request", [bridgeRecord])

    return NextResponse.json({
      bridgeId: bridgeRecord.bridgeId,
      xamanPayloadUrl: bridgeRecord.xamanPayloadUrl,
      status: bridgeRecord.status,
      fees: bridgeRecord.fees,
    })
  } catch (err) {
    console.error("[bridge/initiate] Error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
