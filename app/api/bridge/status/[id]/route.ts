import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

/**
 * GET /api/bridge/status/[id] — Returns bridge request status
 *
 * Returns: { bridgeId, status, steps: [{name, status, txHash?}], timestamps }
 *
 * Queries SpacetimeDB or Convex for the bridge record and formats
 * the response with step-by-step status for the frontend timeline.
 */

// Bridge state progression
const BRIDGE_STATES = [
  "initiated",
  "xrp_locked",
  "xrp_confirmed",
  "sol_releasing",
  "sol_confirmed",
  "complete",
] as const

type BridgeState = typeof BRIDGE_STATES[number] | "failed" | "refunded"

interface BridgeStep {
  name: string
  status: "pending" | "active" | "done" | "error"
  txHash?: string
  timestamp?: string
}

function buildSteps(currentStatus: BridgeState, record: Record<string, unknown>): BridgeStep[] {
  const currentIdx = BRIDGE_STATES.indexOf(currentStatus as typeof BRIDGE_STATES[number])
  const isFailed = currentStatus === "failed" || currentStatus === "refunded"

  return BRIDGE_STATES.map((state, i) => {
    let stepStatus: BridgeStep["status"]
    if (isFailed) {
      stepStatus = "error"
    } else if (i < currentIdx) {
      stepStatus = "done"
    } else if (i === currentIdx) {
      stepStatus = "active"
    } else {
      stepStatus = "pending"
    }

    return {
      name: state,
      status: stepStatus,
      txHash: (record[`${state}_tx_hash`] as string) || undefined,
      timestamp: (record[`${state}_at`] as string) || undefined,
    }
  })
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id: bridgeId } = await params

  if (!bridgeId) {
    return NextResponse.json({ error: "Missing bridge ID" }, { status: 400 })
  }

  try {
    // TODO: Query SpacetimeDB or Convex for bridge record
    // const record = await spacetimedb.sql_query(
    //   `SELECT * FROM bridge_requests WHERE id = '${bridgeId}'`
    // )
    //
    // For now, check AARON router for status
    const aaronUrl = process.env.AARON_ROUTER_URL
    if (aaronUrl) {
      try {
        const res = await fetch(`${aaronUrl}/bridge/${bridgeId}/status`, {
          signal: AbortSignal.timeout(5_000),
        })
        if (res.ok) {
          const data = await res.json()
          const status = (data.status || "initiated") as BridgeState
          return NextResponse.json({
            bridgeId,
            status,
            steps: buildSteps(status, data),
            timestamps: {
              createdAt: data.created_at || null,
              updatedAt: data.updated_at || null,
            },
            fees: data.fees || null,
          })
        }
      } catch {
        // AARON unavailable — fall through to default response
      }
    }

    // Default: return initiated status (bridge record not yet persisted)
    return NextResponse.json({
      bridgeId,
      status: "initiated",
      steps: buildSteps("initiated", {}),
      timestamps: {
        createdAt: null,
        updatedAt: null,
      },
    })
  } catch (err) {
    console.error("[bridge/status] Error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
