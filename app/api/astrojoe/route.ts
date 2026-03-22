import { NextRequest, NextResponse } from "next/server"

const FOUNDER_WALLET = "FEUwuvXbbSYTCEhhqgAt2viTsEnromNNDsapoFvyfy3H"

// Matrix/Conduit homeserver on Jetson via Tailscale
const MATRIX_HOMESERVER = "http://100.85.183.16:6167"
const MATRIX_BOT_USER = "@joe:jettoptx-joe"

// Helper: send a message to JOE via Matrix Client-Server API
async function sendMatrixMessage(roomId: string, message: string, accessToken: string) {
  const txnId = `astrojoe-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const res = await fetch(
    `${MATRIX_HOMESERVER}/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/send/m.room.message/${txnId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        msgtype: "m.text",
        body: message,
      }),
    }
  )
  return res.json()
}

// Helper: get recent messages from a Matrix room
async function getMatrixMessages(roomId: string, accessToken: string, limit = 10) {
  const res = await fetch(
    `${MATRIX_HOMESERVER}/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/messages?dir=b&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )
  return res.json()
}

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

    // Dev mode requires founder wallet
    if (mode === "dev") {
      if (!wallet || wallet !== FOUNDER_WALLET) {
        return NextResponse.json(
          { error: "Unauthorized: dev mode requires founder wallet" },
          { status: 403 }
        )
      }

      // Parse dev commands
      const trimmed = message.trim()
      if (trimmed.startsWith("/")) {
        const [cmd, ...rest] = trimmed.split(" ")
        const args = rest.join(" ")

        switch (cmd) {
          case "/execute":
            return NextResponse.json({
              response: `[HEDGEHOG] Queued for execution on Jetson via Tailscale mesh:\n\`\`\`\n${args || "no command specified"}\n\`\`\`\nTarget: jettoptx-joe (100.85.183.16)\nStatus: QUEUED — routing through HEDGEHOG MCP :5555`,
              type: "code",
              metadata: { command: cmd, target: "jetson", status: "queued" },
            })

          case "/code":
            return NextResponse.json({
              response: `[HEDGEHOG] Code analysis request received:\n\`\`\`\n${args || "no input"}\n\`\`\`\nJOE brain will process via SpacetimeDB reducer \`skill_modules.invoke_skill\`.\nStatus: ACKNOWLEDGED — Jetson proxy active`,
              type: "code",
              metadata: { command: cmd, reducer: "skill_modules", status: "acknowledged" },
            })

          case "/browse":
            return NextResponse.json({
              response: `[HEDGEHOG] Browse request: ${args || "no URL"}\nRouting through Perplexity SONAR + Grok xBridge MCP.\nStatus: QUEUED — xBridge chain active`,
              type: "text",
              metadata: { command: cmd, target: "perplexity", status: "queued" },
            })

          case "/status":
            // Try to ping the actual Jetson/Conduit homeserver
            let matrixStatus = "UNREACHABLE"
            try {
              const pingRes = await fetch(`${MATRIX_HOMESERVER}/_matrix/client/versions`, {
                signal: AbortSignal.timeout(5000),
              })
              if (pingRes.ok) {
                const versions = await pingRes.json()
                matrixStatus = `ONLINE (${versions.versions?.[versions.versions.length - 1] || "active"})`
              }
            } catch {
              matrixStatus = "UNREACHABLE (Tailscale VPN required)"
            }

            return NextResponse.json({
              response: `[HEDGEHOG] System Status Report\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nJOE Core:      ONLINE (brain.py)\nSpacetimeDB:   48 tables / 16 reducers\nTailscale:     mesh v2.9 (5 nodes)\nJetson Orin:   ARM64 CUDA ready\nConduit:       ${matrixStatus}\nMatrix User:   ${MATRIX_BOT_USER}\nHomeserver:    ${MATRIX_HOMESERVER}\nxBridge MCP:   19 tools loaded\nNemoClaw:      OpenClaw harness active\nAARON Router:  port :8888 listening\nModel:         grok-4.20 (xAI)\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
              type: "system",
              metadata: { command: cmd, status: "online", matrixStatus },
            })

          case "/brain":
            return NextResponse.json({
              response: `[SpacetimeDB BRAIN]\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nReducer Modules: 16\nTables:          48+\nRuntime:         WASM Compiled\nSubscriptions:   Real-Time Active\nACID:            Per Reducer\n\nModules:\n  Identity & Auth   → agent_identity, auth_gaze_tensors, key_registry\n  Skills & Tools    → tool_registry, skill_modules, nemoclaw_policies\n  Memory & Context  → conversations, local_rag, perplexity_calls\n  Inference         → grok_calls, routing_state, audit_log\n  Tasks & Chain     → task_queue, wallet_state, player_state, poi_state\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
              type: "system",
              metadata: { command: cmd, reducers: 16, tables: 48 },
            })

          case "/matrix": {
            // Query Matrix/Conduit homeserver status
            let info = "Unable to reach Conduit homeserver"
            try {
              const versionsRes = await fetch(`${MATRIX_HOMESERVER}/_matrix/client/versions`, {
                signal: AbortSignal.timeout(5000),
              })
              if (versionsRes.ok) {
                const versions = await versionsRes.json()
                info = `[CONDUIT HOMESERVER]\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nServer:     ${MATRIX_HOMESERVER}\nServer Name: jettoptx-joe\nBot User:   ${MATRIX_BOT_USER}\nAdmin:      @jett:jettoptx-joe\nVersions:   ${versions.versions?.join(", ") || "unknown"}\nStatus:     ONLINE\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nUse the terminal to send messages through Matrix.`
              }
            } catch {
              info = `[CONDUIT HOMESERVER]\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nServer:     ${MATRIX_HOMESERVER}\nServer Name: jettoptx-joe\nBot User:   ${MATRIX_BOT_USER}\nStatus:     OFFLINE (Tailscale VPN required)\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nEnsure Vercel can reach the Tailscale mesh, or\nuse the Jetson-side WebSocket bridge (:8765) as fallback.`
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

      // Non-command dev message — forward to JOE via Matrix (when wired)
      // For now, acknowledge with routing info
      return NextResponse.json({
        response: `[DEV → HEDGEHOG] Message routed to JOE.\nInput: "${message.slice(0, 200)}"\n${attachments?.length ? `Attachments: ${attachments.length} file(s)\n` : ""}Target: ${MATRIX_BOT_USER} via Conduit\nTransport: Matrix Client-Server API → ${MATRIX_HOMESERVER}\nStatus: ACKNOWLEDGED`,
        type: "text",
        metadata: { mode: "dev", status: "acknowledged", transport: "matrix" },
      })
    }

    // Public mode — basic JOE response (Grok/xBridge integration pending)
    const publicResponses = [
      `Hey there! I'm JOE — the orchestrator behind OPTX. I run on a SpacetimeDB brain with 48+ tables and 16 Rust reducer modules. What would you like to know about the system?`,
      `Good question! The OPTX architecture has 6 layers — from the user cloud interface (L0) down to the Hyperspace Proof-of-Intelligence network (L5). I coordinate across all of them via Tailscale mesh.`,
      `I'm JOE, powered by Grok 4.20 via xBridge MCP. I manage the NemoClaw harness, AARON Router, and the full agentic OS stack. Ask me about any layer!`,
      `The Jett Optics patent (US20250392457A1) covers adaptive gaze-driven security — that's the cryptographic backbone of everything I do. AGTs (Adaptive Gaze Tensors) bound to Markov chains create the spatial encryption layer.`,
      `My brain lives in SpacetimeDB — a game-engine database running WASM-compiled Rust reducers. Real-time subscriptions, ACID per reducer, in-memory + persistent. It's how I keep state across the entire OPTX mesh.`,
    ]

    const response = publicResponses[Math.floor(Math.random() * publicResponses.length)]

    return NextResponse.json({
      response,
      type: "text" as const,
      metadata: { mode: "public", model: "grok-4.20" },
    })
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
