import { NextResponse } from "next/server"

const MATRIX_HOMESERVER = "http://100.85.183.16:6167"

export async function GET() {
  // Ping Conduit homeserver via Tailscale
  let conduitOnline = false
  let conduitVersion = "unknown"
  try {
    const res = await fetch(`${MATRIX_HOMESERVER}/_matrix/client/versions`, {
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    })
    if (res.ok) {
      const data = await res.json()
      conduitOnline = true
      conduitVersion = data.versions?.[data.versions.length - 1] || "active"
    }
  } catch {
    conduitOnline = false
  }

  return NextResponse.json({
    online: true, // API itself is always online if this responds
    conduit: {
      online: conduitOnline,
      homeserver: MATRIX_HOMESERVER,
      serverName: "jettoptx-joe",
      botUser: "@joe:jettoptx-joe",
      adminUser: "@jett:jettoptx-joe",
      version: conduitVersion,
    },
    brain: {
      type: "SpacetimeDB",
      tables: 48,
      reducers: 16,
      runtime: "WASM",
    },
    mesh: {
      protocol: "Tailscale",
      version: "v2.9",
      nodes: 5,
      jetson: "100.85.183.16",
    },
    model: "grok-4.20-multi-agent-0309",
    harness: "NemoClaw + OpenShell",
    services: [
      { name: "HEDGEHOG MCP", port: 5555, status: conduitOnline ? "online" : "unreachable" },
      { name: "AARON Router", port: 8888, status: "online" },
      { name: "WebSocket Bridge", port: 8765, status: conduitOnline ? "online" : "unreachable" },
      { name: "Conduit (Matrix)", port: 6167, status: conduitOnline ? "online" : "unreachable" },
      { name: "SpacetimeDB", port: 3000, status: conduitOnline ? "online" : "unreachable" },
    ],
  })
}
