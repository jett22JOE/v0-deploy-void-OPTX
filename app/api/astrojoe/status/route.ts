import { NextResponse } from "next/server"

const MATRIX_HOMESERVER =
  process.env.MATRIX_HOMESERVER || "https://jettoptx-joe.taile11759.ts.net/conduit"
const MATRIX_ACCESS_TOKEN = process.env.MATRIX_ACCESS_TOKEN || ""
const MATRIX_ROOM_ID =
  process.env.MATRIX_ROOM_ID ||
  "!ex1nY7tFxIMTZxZ6Xh3GREOfCYGgUq3a18-rMBSe8ZQ"

export async function GET() {
  // Ping Conduit homeserver via Tailscale Funnel
  let conduitOnline = false
  let conduitVersion = "unknown"
  let roomJoined = false

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

  // Check if we can read the room (validates token + room membership)
  if (conduitOnline && MATRIX_ACCESS_TOKEN) {
    try {
      const roomRes = await fetch(
        `${MATRIX_HOMESERVER}/_matrix/client/v3/rooms/${encodeURIComponent(MATRIX_ROOM_ID)}/state/m.room.name/`,
        {
          headers: { Authorization: `Bearer ${MATRIX_ACCESS_TOKEN}` },
          signal: AbortSignal.timeout(5000),
          cache: "no-store",
        }
      )
      roomJoined = roomRes.ok
    } catch {
      roomJoined = false
    }
  }

  return NextResponse.json({
    online: true,
    conduit: {
      online: conduitOnline,
      homeserver: MATRIX_HOMESERVER,
      serverName: "jettoptx-joe",
      botUser: "@joe:jettoptx-joe",
      adminUser: "@jett:jettoptx-joe",
      version: conduitVersion,
      roomId: MATRIX_ROOM_ID,
      roomAccessible: roomJoined,
      tokenConfigured: !!MATRIX_ACCESS_TOKEN,
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
      nodes: 5,
      jetson: "jettoptx-joe",
    },
    model: "grok-4.20-multi-agent-0309",
    harness: "NemoClaw + OpenShell",
    services: [
      { name: "Conduit (Matrix)", port: 6167, status: conduitOnline ? "online" : "unreachable" },
      { name: "OPTX Command Room", status: roomJoined ? "joined" : "not accessible" },
      { name: "HEDGEHOG MCP", port: 5555, status: conduitOnline ? "online" : "unreachable" },
      { name: "AARON Router", port: 8888, status: "online" },
      { name: "WebSocket Bridge", port: 8765, status: conduitOnline ? "online" : "unreachable" },
      { name: "SpacetimeDB", port: 3000, status: conduitOnline ? "online" : "unreachable" },
    ],
  })
}
