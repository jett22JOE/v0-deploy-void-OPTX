/**
 * MPP (Machine Payments Protocol) Integration
 * =============================================
 * Wraps HTTP 402 payment flow for AARON API endpoints.
 * Supports Tempo stablecoin and Stripe payment methods.
 * Compatible with x402 standard used in AARON architecture.
 */

// ─── Types ──────────────────────────────────────────────────────────────────
export interface MPPCharge {
  chargeId: string
  amount: number
  currency: string
  description: string
  paymentUrl: string
  expiresAt: number
  methods: MPPPaymentMethod[]
}

export interface MPPPaymentMethod {
  type: "tempo" | "stripe" | "lightning" | "card"
  uri: string
  metadata?: Record<string, unknown>
}

export interface MPPReceipt {
  receiptId: string
  chargeId: string
  paid: boolean
  method: string
  txHash?: string
  timestamp: number
}

export interface MPPSession {
  sessionId: string
  status: "active" | "expired" | "cancelled"
  balance: number
  expiresAt: number
}

// ─── Configuration ──────────────────────────────────────────────────────────
const AARON_BASE = process.env.NEXT_PUBLIC_AARON_ROUTER_URL || "/api/aaron"

// ─── Create MPP Charge ──────────────────────────────────────────────────────
/**
 * Creates a one-time MPP charge for a bridge operation or gaze verification.
 * Returns a charge object with payment URLs for each supported method.
 */
export async function createMPPCharge(
  amount: number,
  description: string
): Promise<MPPCharge | null> {
  try {
    const res = await fetch(`${AARON_BASE}/mpp/charge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        currency: "USD",
        description,
        methods: ["tempo", "stripe"],
      }),
    })

    if (res.status === 402) {
      // Parse the 402 response — it contains the payment challenge itself
      const challenge = await res.json()
      return {
        chargeId: challenge.charge_id || crypto.randomUUID(),
        amount: challenge.amount || amount,
        currency: challenge.currency || "USD",
        description: challenge.description || description,
        paymentUrl: challenge.payment_url || "",
        expiresAt: challenge.expires_at || Date.now() + 30 * 60 * 1000,
        methods: (challenge.methods || []).map((m: Record<string, unknown>) => ({
          type: m.type as MPPPaymentMethod["type"],
          uri: m.uri as string,
          metadata: m.metadata as Record<string, unknown> | undefined,
        })),
      }
    }

    if (!res.ok) {
      console.error("[MPP] Charge creation failed:", res.status)
      return null
    }

    return (await res.json()) as MPPCharge
  } catch (err) {
    console.error("[MPP] Charge error:", err)
    return null
  }
}

// ─── Verify MPP Payment ─────────────────────────────────────────────────────
/**
 * Verifies an MPP payment receipt against the AARON API.
 * The receipt is typically provided after the user completes payment.
 */
export async function verifyMPPPayment(receipt: string): Promise<MPPReceipt | null> {
  try {
    const res = await fetch(`${AARON_BASE}/mpp/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${receipt}`,
      },
    })

    if (!res.ok) {
      console.error("[MPP] Verification failed:", res.status)
      return null
    }

    return (await res.json()) as MPPReceipt
  } catch (err) {
    console.error("[MPP] Verify error:", err)
    return null
  }
}

// ─── Create MPP Session ─────────────────────────────────────────────────────
/**
 * Creates a streaming MPP session for multiple operations.
 * Sessions allow pay-per-action without re-authenticating each time.
 */
export async function createMPPSession(): Promise<MPPSession | null> {
  try {
    const res = await fetch(`${AARON_BASE}/mpp/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intent: "session" }),
    })

    if (!res.ok) {
      console.error("[MPP] Session creation failed:", res.status)
      return null
    }

    return (await res.json()) as MPPSession
  } catch (err) {
    console.error("[MPP] Session error:", err)
    return null
  }
}

// ─── 402 Middleware Helper ───────────────────────────────────────────────────
/**
 * Wraps a fetch call with MPP 402 handling.
 * If the endpoint returns 402, extracts the payment challenge and returns it.
 * If a valid receipt is provided, attaches it as Authorization header.
 */
export async function fetchWithMPP(
  url: string,
  options: RequestInit = {},
  receipt?: string
): Promise<{ ok: boolean; data?: unknown; paymentRequired?: MPPCharge }> {
  const headers = new Headers(options.headers || {})
  if (receipt) {
    headers.set("Authorization", `x402 ${receipt}`)
  }

  try {
    const res = await fetch(url, { ...options, headers })

    if (res.status === 402) {
      const challenge = await res.json()
      return {
        ok: false,
        paymentRequired: {
          chargeId: challenge.charge_id || "",
          amount: challenge.amount || 0,
          currency: challenge.currency || "USD",
          description: challenge.description || "Payment required",
          paymentUrl: challenge.payment_url || "",
          expiresAt: challenge.expires_at || Date.now() + 30 * 60 * 1000,
          methods: challenge.methods || [],
        },
      }
    }

    if (!res.ok) {
      return { ok: false }
    }

    const data = await res.json()
    return { ok: true, data }
  } catch (err) {
    console.error("[MPP] Fetch error:", err)
    return { ok: false }
  }
}
