/**
 * Xaman (Xumm) SDK Wrapper Utilities
 * ====================================
 * USDC on XRPL uses trust lines:
 *   - Currency code: "USD"
 *   - Issuer: Circle's XRPL gateway address
 */

// Circle XRPL USDC issuer (mainnet gateway)
const CIRCLE_XRPL_ISSUER = "rcEGREd8NmkKRE8GE424sksyt1tJVFZwu"

// Xaman REST API
const XAMAN_API_BASE = "https://xumm.app/api/v1"
const XAMAN_API_KEY = process.env.NEXT_PUBLIC_XAMAN_API_KEY || ""

// ─── Types ──────────────────────────────────────────────────────────────────
export interface XamanPayloadResult {
  uuid: string
  next: { always: string }
  refs: { qr_png: string; websocket_status: string }
}

export interface PayloadStatus {
  resolved: boolean
  signed: boolean
  rejected: boolean
  txHash?: string
  account?: string
}

// ─── Create USDC Payment Payload ────────────────────────────────────────────
/**
 * Creates an XRPL USDC (trust line token) payment template via Xaman API.
 * The user signs this in their Xaman wallet to lock USDC on XRPL.
 */
export async function createUSDCPayload(
  amount: number,
  destination: string
): Promise<XamanPayloadResult | null> {
  try {
    const res = await fetch(`${XAMAN_API_BASE}/platform/payload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": XAMAN_API_KEY,
      },
      body: JSON.stringify({
        txjson: {
          TransactionType: "Payment",
          Destination: destination,
          Amount: {
            currency: "USD",
            value: String(amount),
            issuer: CIRCLE_XRPL_ISSUER,
          },
        },
        options: {
          submit: true,
          expire: 30, // 30 minutes
          return_url: {
            web: `${typeof window !== "undefined" ? window.location.origin : ""}/bridge?status=signed`,
          },
        },
      }),
    })

    if (!res.ok) {
      console.error("[Xaman] USDC payload creation failed:", res.status)
      return null
    }

    return (await res.json()) as XamanPayloadResult
  } catch (err) {
    console.error("[Xaman] USDC payload error:", err)
    return null
  }
}

// ─── Poll Payload Status ────────────────────────────────────────────────────
/**
 * Polls a Xaman payload to check if the user signed or rejected.
 * Returns resolved status without blocking.
 */
export async function pollPayloadStatus(payloadId: string): Promise<PayloadStatus> {
  try {
    const res = await fetch(`${XAMAN_API_BASE}/platform/payload/${payloadId}`, {
      headers: { "X-API-Key": XAMAN_API_KEY },
    })

    if (!res.ok) {
      return { resolved: false, signed: false, rejected: false }
    }

    const data = await res.json()
    return {
      resolved: data.meta?.resolved ?? false,
      signed: data.meta?.signed ?? false,
      rejected: data.meta?.cancelled ?? false,
      txHash: data.response?.txid || undefined,
      account: data.response?.account || undefined,
    }
  } catch (err) {
    console.error("[Xaman] Poll error:", err)
    return { resolved: false, signed: false, rejected: false }
  }
}

// ─── Poll Until Resolved ────────────────────────────────────────────────────
/**
 * Polls payload status at interval until resolved or timeout.
 * @param payloadId - Xaman payload UUID
 * @param timeoutMs - Max wait time (default 5 minutes)
 * @param intervalMs - Poll interval (default 3 seconds)
 */
export async function waitForPayloadResolution(
  payloadId: string,
  timeoutMs = 5 * 60 * 1000,
  intervalMs = 3000
): Promise<PayloadStatus> {
  const deadline = Date.now() + timeoutMs

  return new Promise((resolve) => {
    const check = async () => {
      if (Date.now() > deadline) {
        resolve({ resolved: false, signed: false, rejected: false })
        return
      }

      const status = await pollPayloadStatus(payloadId)
      if (status.resolved) {
        resolve(status)
        return
      }

      setTimeout(check, intervalMs)
    }
    check()
  })
}
