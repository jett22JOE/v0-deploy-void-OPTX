import { NextRequest, NextResponse } from "next/server"

const FOUNDER_WALLET = "FEUwuvXbbSYTCEhhqgAt2viTsEnromNNDsapoFvyfy3H"

// Matrix/Conduit homeserver — exposed via Tailscale Funnel
// Vercel env: MATRIX_HOMESERVER
// Production: Tailscale Funnel public URL
// Local dev fallback: Tailscale private IP
// Conduit is on the /conduit subpath via Tailscale Funnel
const MATRIX_HOMESERVER =
  process.env.MATRIX_HOMESERVER || "https://jettoptx-joe.taile11759.ts.net/conduit"
const MATRIX_ACCESS_TOKEN = process.env.MATRIX_ACCESS_TOKEN || ""
const MATRIX_ROOM_ID =
  process.env.MATRIX_ROOM_ID ||
  "!ex1nY7tFxIMTZxZ6Xh3GREOfCYGgUq3a18-rMBSe8ZQ"

const MATRIX_BOT_USER = "@joe:jettoptx-joe"

// ─── Matrix Client-Server API helpers ────────────────────────

async function matrixSend(roomId: string, body: string): Promise<string | null> {
  const txnId = `web-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  try {
    const res = await fetch(
      `${MATRIX_HOMESERVER}/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/send/m.room.message/${txnId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${MATRIX_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ msgtype: "m.text", body }),
        signal: AbortSignal.timeout(10000),
      }
    )
    if (!res.ok) {
      const err = await res.text()
      console.error("[Matrix] send failed:", res.status, err)
      return null
    }
    const data = await res.json()
    return data.event_id ?? null
  } catch (e) {
    console.error("[Matrix] send error:", e)
    return null
  }
}

async function matrixPollResponse(
  roomId: string,
  afterEventId: string,
  timeoutMs = 12000,
  pollIntervalMs = 1500
): Promise<string | null> {
  // Poll room messages backwards from "now" until we find a message from JOE
  // that was sent after our command
  const deadline = Date.now() + timeoutMs
  let lastToken: string | null = null

  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, pollIntervalMs))

    try {
      const url = new URL(
        `${MATRIX_HOMESERVER}/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/messages`
      )
      url.searchParams.set("dir", "b") // backwards from latest
      url.searchParams.set("limit", "10")
      if (lastToken) url.searchParams.set("from", lastToken)

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${MATRIX_ACCESS_TOKEN}` },
        signal: AbortSignal.timeout(5000),
      })

      if (!res.ok) continue

      const data = await res.json()
      lastToken = data.end ?? lastToken

      // Look for a response from JOE (not from us)
      for (const event of data.chunk ?? []) {
        if (
          event.type === "m.room.message" &&
          event.sender === MATRIX_BOT_USER &&
          event.content?.body &&
          // Only consider events newer than our sent event
          event.unsigned?.age !== undefined &&
          event.unsigned.age < timeoutMs
        ) {
          return event.content.body
        }
      }
    } catch {
      // continue polling
    }
  }

  return null
}

// Send command to Matrix room and wait for JOE's response
async function sendAndWait(command: string, waitMs = 12000): Promise<string> {
  if (!MATRIX_ACCESS_TOKEN) {
    return `[ERROR] MATRIX_ACCESS_TOKEN not configured. Set it in Vercel env vars.`
  }

  const eventId = await matrixSend(MATRIX_ROOM_ID, command)
  if (!eventId) {
    return `[ERROR] Failed to send to Matrix room. Check Tailscale Funnel and Conduit status.\nHomeserver: ${MATRIX_HOMESERVER}\nRoom: ${MATRIX_ROOM_ID}`
  }

  const response = await matrixPollResponse(MATRIX_ROOM_ID, eventId, waitMs)
  if (!response) {
    return `[HEDGEHOG] Command sent to Matrix room. JOE did not respond within ${waitMs / 1000}s.\nThe command was delivered — JOE may still process it.\nCheck Matrix room or run /matrix for homeserver status.`
  }

  return response
}

// ─── Route handler ───────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, mode, wallet, attachments } = body as {
      message: string
      mode: "public" | "dev"
      wallet?: string
      attachments?: { type: string; data: string; name?: string }[]
    }

    if (!message || !mode) {
      return NextResponse.json(
        { error: "Missing required fields: message, mode" },
        { status: 400 }
      )
    }

    // ─── DEV MODE ──────────────────────────────────────────
    if (mode === "dev") {
      if (!wallet || wallet !== FOUNDER_WALLET) {
        return NextResponse.json(
          { error: "Unauthorized: dev mode requires founder wallet" },
          { status: 403 }
        )
      }

      const trimmed = message.trim()

      if (trimmed.startsWith("/")) {
        const [cmd, ...rest] = trimmed.split(" ")
        const args = rest.join(" ")

        switch (cmd) {
          case "/execute": {
            const response = await sendAndWait(
              `/execute ${args || "echo 'no command specified'"}`,
              15000
            )
            return NextResponse.json({
              response: `[HEDGEHOG → JETSON]\n${response}`,
              type: "code",
              metadata: { command: cmd, target: "jetson", transport: "matrix" },
            })
          }

          case "/code": {
            const response = await sendAndWait(
              `/code ${args || "# no input"}`,
              15000
            )
            return NextResponse.json({
              response: `[HEDGEHOG → BRAIN]\n${response}`,
              type: "code",
              metadata: { command: cmd, reducer: "skill_modules", transport: "matrix" },
            })
          }

          case "/browse": {
            const response = await sendAndWait(
              `/browse ${args || "https://jettoptics.ai"}`,
              20000 // Browsing takes longer
            )
            return NextResponse.json({
              response: `[HEDGEHOG → PERPLEXITY]\n${response}`,
              type: "text",
              metadata: { command: cmd, target: "perplexity", transport: "matrix" },
            })
          }

          case "/status": {
            const response = await sendAndWait("/status", 10000)
            return NextResponse.json({
              response: response,
              type: "system",
              metadata: { command: cmd, transport: "matrix" },
            })
          }

          case "/brain": {
            const response = await sendAndWait("/brain", 10000)
            return NextResponse.json({
              response: response,
              type: "system",
              metadata: { command: cmd, transport: "matrix" },
            })
          }

          case "/matrix": {
            // Direct Conduit health check — doesn't go through the bot
            let info = "Unable to reach Conduit homeserver"
            try {
              const versionsRes = await fetch(
                `${MATRIX_HOMESERVER}/_matrix/client/versions`,
                { signal: AbortSignal.timeout(5000) }
              )
              if (versionsRes.ok) {
                const versions = await versionsRes.json()

                // Also check room state
                let roomName = "unknown"
                try {
                  const stateRes = await fetch(
                    `${MATRIX_HOMESERVER}/_matrix/client/v3/rooms/${encodeURIComponent(MATRIX_ROOM_ID)}/state/m.room.name/`,
                    {
                      headers: { Authorization: `Bearer ${MATRIX_ACCESS_TOKEN}` },
                      signal: AbortSignal.timeout(5000),
                    }
                  )
                  if (stateRes.ok) {
                    const stateData = await stateRes.json()
                    roomName = stateData.name || "OPTX Command"
                  }
                } catch {
                  roomName = "OPTX Command (state fetch failed)"
                }

                info = `[CONDUIT HOMESERVER — LIVE]\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nServer:      ${MATRIX_HOMESERVER}\nServer Name: jettoptx-joe\nBot User:    ${MATRIX_BOT_USER}\nAdmin:       @jett:jettoptx-joe\nRoom:        ${roomName}\nRoom ID:     ${MATRIX_ROOM_ID}\nVersions:    ${versions.versions?.join(", ") || "unknown"}\nTransport:   Tailscale Funnel → Conduit\nStatus:      ✓ ONLINE\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
              }
            } catch {
              info = `[CONDUIT HOMESERVER — OFFLINE]\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nServer:      ${MATRIX_HOMESERVER}\nBot User:    ${MATRIX_BOT_USER}\nStatus:      ✗ UNREACHABLE\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nEnsure Tailscale Funnel is running on the Jetson:\n  sudo tailscale serve --bg 6167\n  sudo tailscale funnel --bg 443`
            }
            return NextResponse.json({
              response: info,
              type: "system",
              metadata: { command: cmd, homeserver: MATRIX_HOMESERVER },
            })
          }

          default:
            return NextResponse.json({
              response: `[HEDGEHOG] Unknown command: ${cmd}\nAvailable: /execute, /code, /browse, /status, /brain, /matrix`,
              type: "system",
              metadata: { command: cmd, status: "unknown" },
            })
        }
      }

      // Non-command dev message — send directly to Matrix room as chat
      const response = await sendAndWait(trimmed, 15000)
      return NextResponse.json({
        response: `[JOE]\n${response}`,
        type: "text",
        metadata: {
          mode: "dev",
          transport: "matrix",
          attachments: attachments?.length || 0,
        },
      })
    }

    // ─── PUBLIC MODE ───────────────────────────────────────
    // Send the raw message to Matrix — the bot handles all routing
    // Slash commands go through as-is so the bot can parse them
    const trimmedPublic = message.trim().slice(0, 500)
    const response = await sendAndWait(trimmedPublic, 12000)

    return NextResponse.json({
      response: response,
      type: "text" as const,
      metadata: { mode: "public", model: "grok-4.20", transport: "matrix" },
    })
  } catch (e) {
    console.error("[astrojoe] error:", e)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
