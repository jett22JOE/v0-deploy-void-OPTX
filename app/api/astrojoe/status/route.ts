import { NextResponse } from "next/server"

const MATRIX_HOMESERVER =
  process.env.MATRIX_HOMESERVER || "https://jettoptx-joe.taile11759.ts.net/conduit"
const MATRIX_ACCESS_TOKEN = process.env.MATRIX_ACCESS_TOKEN || ""
const MATRIX_ROOM_ID =
  process.env.MATRIX_ROOM_ID ||
  "!ex1nY7tFxIMTZxZ6Xh3GREOfCYGgUq3a18-rMBSe8ZQ"

// Edge node endpoints via Tailscale mesh
const HEDGEHOG_URL = process.env.HEDGEHOG_URL || "http://100.105.218.115:5555"
const JETSON_CONDUIT = MATRIX_HOMESERVER
const CORSAIR_IP = "100.105.218.115"
const JETSON_IP = "100.85.183.16"

async function pingEndpoint(url: string, timeoutMs = 5000): Promise<{ ok: boolean; ms: number; data?: unknown }> {
  const start = Date.now()
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    })
    const ms = Date.now() - start
    if (res.ok) {
      try {
        const data = await res.json()
        return { ok: true, ms, data }
      } catch {
        return { ok: true, ms }
      }
    }
    return { ok: false, ms }
  } catch {
    return { ok: false, ms: Date.now() - start }
  }
}

export async function GET() {
  // Parallel health checks
  const [conduitPing, hedgehogPing, roomCheck] = await Promise.all([
    // 1. Conduit (Matrix homeserver on Jetson via Funnel)
    pingEndpoint(`${MATRIX_HOMESERVER}/_matrix/client/versions`),

    // 2. HEDGEHOG MCP (Docker on CorsairOne via Tailscale)
    pingEndpoint(`${HEDGEHOG_URL}/health`).then(async (r) => {
      // Try /health first, fall back to root /
      if (!r.ok) return pingEndpoint(HEDGEHOG_URL)
      return r
    }),

    // 3. Room access check
    (async () => {
      if (!MATRIX_ACCESS_TOKEN) return false
      try {
        const res = await fetch(
          `${MATRIX_HOMESERVER}/_matrix/client/v3/joined_rooms`,
          {
            headers: { Authorization: `Bearer ${MATRIX_ACCESS_TOKEN}` },
            signal: AbortSignal.timeout(5000),
            cache: "no-store",
          }
        )
        if (!res.ok) return false
        const data = await res.json()
        return (data.joined_rooms ?? []).includes(
          "!ex1nY7tFxIMTZxZ6Xh3GREOfCYGgUq3a18-rMBSe8ZQ"
        )
      } catch {
        return false
      }
    })(),
  ])

  const conduitOnline = conduitPing.ok
  const hedgehogOnline = hedgehogPing.ok
  const roomJoined = roomCheck as boolean

  // Extract Conduit version
  let conduitVersion = "unknown"
  if (conduitPing.data && typeof conduitPing.data === "object") {
    const versions = (conduitPing.data as { versions?: string[] }).versions
    if (versions?.length) conduitVersion = versions[versions.length - 1]
  }

  return NextResponse.json({
    online: true,
    conduit: {
      online: conduitOnline,
      latencyMs: conduitPing.ms,
      homeserver: MATRIX_HOMESERVER,
      serverName: "jettoptx-joe",
      botUser: "@joe:jettoptx-joe",
      webUser: "@web:jettoptx-joe",
      version: conduitVersion,
      roomId: MATRIX_ROOM_ID,
      roomAccessible: roomJoined,
      tokenConfigured: !!MATRIX_ACCESS_TOKEN,
    },
    hedgehog: {
      online: hedgehogOnline,
      latencyMs: hedgehogPing.ms,
      url: HEDGEHOG_URL,
      host: "corsairone",
      ip: CORSAIR_IP,
      port: 5555,
      runtime: "Docker (--network host)",
    },
    brain: {
      type: "SpacetimeDB",
      tables: 48,
      reducers: 16,
      runtime: "WASM",
    },
    mesh: {
      protocol: "Tailscale Funnel",
      version: "v2.9",
      nodes: [
        { name: "jettoptx-joe", role: "Edge Compute", ip: JETSON_IP, type: "Jetson Orin Nano", online: conduitOnline },
        { name: "corsairone", role: "HEDGEHOG MCP", ip: CORSAIR_IP, type: "CorsairOne (WSL2)", online: hedgehogOnline },
        { name: "astrojoe-corsairone", role: "NemoClaw Sandbox", ip: CORSAIR_IP, type: "OpenShell", online: hedgehogOnline },
      ],
    },
    model: "grok-4.20-multi-agent-0309",
    harness: "NemoClaw + OpenShell",
    services: [
      { name: "Conduit (Matrix)", port: 6167, host: "jettoptx-joe", status: conduitOnline ? "online" : "unreachable", latencyMs: conduitPing.ms },
      { name: "HEDGEHOG MCP", port: 5555, host: "corsairone", status: hedgehogOnline ? "online" : "unreachable", latencyMs: hedgehogPing.ms },
      { name: "OPTX Command Room", port: null, host: "conduit", status: roomJoined ? "joined" : "not accessible" },
      { name: "AARON Router", port: 8888, host: "jettoptx-joe", status: conduitOnline ? "online" : "unknown" },
      { name: "WebSocket Bridge", port: 8765, host: "jettoptx-joe", status: conduitOnline ? "online" : "unknown" },
      { name: "SpacetimeDB", port: 3000, host: "jettoptx-joe", status: conduitOnline ? "online" : "unknown" },
    ],
  })
}
