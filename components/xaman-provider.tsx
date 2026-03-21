"use client"

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react"

// ─── Types ──────────────────────────────────────────────────────────────────
interface XamanPayload {
  uuid: string
  next: { always: string }
  refs: { qr_png: string; websocket_status: string }
}

interface XamanContextType {
  address: string | null
  connected: boolean
  network: "mainnet" | "testnet"
  connecting: boolean
  connect: () => Promise<void>
  disconnect: () => void
  createPayload: (txJson: Record<string, unknown>) => Promise<XamanPayload | null>
  signPayload: (payloadId: string) => Promise<{ signed: boolean; txHash?: string }>
}

const XamanContext = createContext<XamanContextType | null>(null)

// ─── Xaman REST API base ────────────────────────────────────────────────────
const XAMAN_API_BASE = "https://xumm.app/api/v1"
const XAMAN_API_KEY = process.env.NEXT_PUBLIC_XAMAN_API_KEY || ""

// ─── Provider ───────────────────────────────────────────────────────────────
export function XamanProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [network] = useState<"mainnet" | "testnet">("mainnet")
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Restore persisted address on mount
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("xaman-address") : null
    if (saved) {
      setAddress(saved)
      setConnected(true)
    }
  }, [])

  // Cleanup poll on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  const createPayload = useCallback(async (txJson: Record<string, unknown>): Promise<XamanPayload | null> => {
    try {
      const res = await fetch(`${XAMAN_API_BASE}/platform/payload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": XAMAN_API_KEY,
        },
        body: JSON.stringify({ txjson: txJson }),
      })
      if (!res.ok) {
        console.error("[Xaman] Payload creation failed:", res.status)
        return null
      }
      const data = await res.json()
      return data as XamanPayload
    } catch (err) {
      console.error("[Xaman] Payload creation error:", err)
      return null
    }
  }, [])

  const signPayload = useCallback(async (payloadId: string): Promise<{ signed: boolean; txHash?: string }> => {
    // Poll payload status until resolved or timeout (5 minutes)
    const deadline = Date.now() + 5 * 60 * 1000
    return new Promise((resolve) => {
      pollRef.current = setInterval(async () => {
        if (Date.now() > deadline) {
          if (pollRef.current) clearInterval(pollRef.current)
          resolve({ signed: false })
          return
        }
        try {
          const res = await fetch(`${XAMAN_API_BASE}/platform/payload/${payloadId}`, {
            headers: { "X-API-Key": XAMAN_API_KEY },
          })
          if (!res.ok) return
          const data = await res.json()
          if (data.meta?.resolved) {
            if (pollRef.current) clearInterval(pollRef.current)
            if (data.meta.signed) {
              resolve({ signed: true, txHash: data.response?.txid })
            } else {
              resolve({ signed: false })
            }
          }
        } catch {
          // Continue polling on transient errors
        }
      }, 3000)
    })
  }, [])

  const connect = useCallback(async () => {
    if (connected || connecting) return
    setConnecting(true)
    try {
      // Create a SignIn payload to get the user's XRPL address
      const payload = await createPayload({ TransactionType: "SignIn" })
      if (!payload) {
        setConnecting(false)
        return
      }

      // Open Xaman deep link / QR
      window.open(payload.next.always, "_blank")

      // Wait for sign
      const result = await signPayload(payload.uuid)
      if (result.signed) {
        // Fetch the payload to get the signer address
        const res = await fetch(`${XAMAN_API_BASE}/platform/payload/${payload.uuid}`, {
          headers: { "X-API-Key": XAMAN_API_KEY },
        })
        if (res.ok) {
          const data = await res.json()
          const addr = data.response?.account
          if (addr) {
            setAddress(addr)
            setConnected(true)
            localStorage.setItem("xaman-address", addr)
          }
        }
      }
    } catch (err) {
      console.error("[Xaman] Connect error:", err)
    } finally {
      setConnecting(false)
    }
  }, [connected, connecting, createPayload, signPayload])

  const disconnect = useCallback(() => {
    setAddress(null)
    setConnected(false)
    localStorage.removeItem("xaman-address")
  }, [])

  return (
    <XamanContext.Provider
      value={{ address, connected, network, connecting, connect, disconnect, createPayload, signPayload }}
    >
      {children}
    </XamanContext.Provider>
  )
}

// ─── Hook ───────────────────────────────────────────────────────────────────
export function useXaman() {
  const ctx = useContext(XamanContext)
  if (!ctx) throw new Error("useXaman must be used within <XamanProvider>")
  return ctx
}
