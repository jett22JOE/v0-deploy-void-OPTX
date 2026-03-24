"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useUser } from "@clerk/nextjs"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Send, Terminal, ChevronDown, ChevronRight, Image, Code2,
  Globe, Brain, Circle, Cpu, Database, Layers, Shield, Wallet,
  Zap, Network, Hash, Activity, Lock, Unlock, Server,
  ArrowLeft, ExternalLink, CheckCircle2,
} from "lucide-react"
import Link from "next/link"
import nextDynamic from "next/dynamic"

// Dynamic import WalletMultiButton (SSR-safe)
const WalletMultiButton = nextDynamic(
  () => import("@solana/wallet-adapter-react-ui").then((mod) => mod.WalletMultiButton),
  { ssr: false }
)

// ─── Constants ──────────────────────────────────────────────
const FOUNDER_WALLET = "FEUwuvXbbSYTCEhhqgAt2viTsEnromNNDsapoFvyfy3H"

// ─── Architecture Data ──────────────────────────────────────
const LAYERS = [
  {
    id: "L0",
    name: "USER / CLOUD INTERFACE",
    color: "#06b6d4",
    nodes: [
      { name: "Perplexity Max + Computer", tags: ["SEARCH API", "SONAR"] },
      { name: "Grok 4.20 (xAI)", tags: ["xBridge MCP"] },
      { name: "Matrix Protocol (Admin)", tags: ["E2E", "Conduit"] },
      { name: "jettoptics.ai", tags: ["Next.js", "Convex", "Clerk"] },
    ],
  },
  {
    id: "L1",
    name: "JOE AGENT (ORCHESTRATOR)",
    color: "#a855f7",
    nodes: [
      { name: "JOE Core (brain.py)", tags: ["SpacetimeDB", "Python", "SOVEREIGN"] },
      { name: "NemoClaw Harness", tags: ["OpenClaw", "OpenShell", "K8s"] },
      { name: "AARON Router", tags: ["port :8888", "x402", "Web3/4"] },
      { name: "JOEclaw Subagents", tags: ["MCP", "Stripe", "SWARM"] },
      { name: "Tailscale Mesh Network", tags: ["100.x.x.x overlay"] },
      { name: "WebSocket Bridge", tags: ["port :8765", "WSS"] },
    ],
  },
  {
    id: "L2",
    name: "PRIVATE LAYER (HEDGEHOG SPACETIME)",
    color: "#f97316",
    nodes: [
      { name: "HEDGEHOG MCP", tags: ["port :5555", "Grok 4.1", "xBridge", "DEFENSE"] },
      { name: "Private Knot-Engine", tags: ["AstroKnots theory", "Rust", "QUANTUM"] },
      { name: "SpacetimeDB", tags: ["Rust Reducers", "systemd", "WASM"] },
      { name: "AGTs (Gaze Tensors)", tags: ["Patent US20250392457A1", "Markov"] },
      { name: "Xaman Wallet", tags: ["XRPL", "Xahau", "HOOKS"] },
      { name: "ERC-8004 Agent Wallet", tags: ["ERC-8004", "READ-ONLY"] },
    ],
  },
  {
    id: "L3",
    name: "EDGE COMPUTE (JETSON JOE)",
    color: "#22c55e",
    nodes: [
      { name: "NVIDIA Jetson Orin Nano", tags: ["ARM64", "CUDA", "Tailscale"] },
      { name: "Docker Runtime", tags: ["Conduit :6167", "xBridge-MCP"] },
      { name: "xBridge MCP Server", tags: ["19 tools", "xAI", "BYOK"] },
      { name: "Nemotron Local", tags: ["NemoClaw", "INT8", "LOCAL"] },
      { name: "Corsair Workstation", tags: ["WSL2", "Docker", "RTX"] },
    ],
  },
  {
    id: "L4",
    name: "MULTI-CHAIN SETTLEMENT",
    color: "#eab308",
    nodes: [
      { name: "Solana", tags: ["USDC/SOL", "JTX/SOL", "OPTX/JTX", "Raydium"] },
      { name: "XRPL / Xahau", tags: ["USDC/XRP", "MAG/RLUSD", "AMM"] },
      { name: "EVM (Ethereum)", tags: ["WLFI", "USD1", "ERC-8004"] },
      { name: "Revenue Streams", tags: ["swap fees", "LP yield", "x402", "RWA"] },
    ],
  },
  {
    id: "L5",
    name: "HYPERSPACE PROOF OF INTELLIGENCE",
    color: "#ef4444",
    nodes: [
      { name: "PoI Experiment Loop", tags: ["GossipSub", "libp2p", "AGENTCOMMIT 0xF3"] },
      { name: "ResearchDAG", tags: ["Merkle DAG", "zkWASM"] },
      { name: "HSCP Verification", tags: ["SHA-256", "INT8"] },
      { name: "Hyperspace Node Roles", tags: ["Miner", "Fullnode", "Router", "Relay"] },
      { name: "Slashing & Security", tags: ["VRF", "sybil detection"] },
    ],
  },
]

const BRAIN_MODULES = [
  {
    category: "Identity & Auth",
    modules: [
      { table: "agent_identity", reducers: ["init_identity", "update_identity"] },
      { table: "auth_gaze_tensors", reducers: ["verify_gaze", "bind_agt"] },
      { table: "key_registry", reducers: ["store_key_entry", "revoke_key"] },
    ],
  },
  {
    category: "Skills & Tools",
    modules: [
      { table: "tool_registry", reducers: ["register_tool", "deregister_tool"] },
      { table: "skill_modules", reducers: ["learn_skill", "invoke_skill"] },
      { table: "nemoclaw_policies", reducers: ["set_policy", "check_policy"] },
    ],
  },
  {
    category: "Memory & Context",
    modules: [
      { table: "conversations", reducers: ["store_message", "get_history"] },
      { table: "local_rag", reducers: ["index_doc", "query_rag"] },
      { table: "perplexity_calls", reducers: ["execute_search", "cache_result"] },
    ],
  },
  {
    category: "Inference & Routing",
    modules: [
      { table: "grok_calls", reducers: ["log_grok_call", "track_cost"] },
      { table: "routing_state", reducers: ["route_request", "select_model"] },
      { table: "audit_log", reducers: ["log_action", "query_audit"] },
    ],
  },
  {
    category: "Tasks & On-Chain",
    modules: [
      { table: "task_queue", reducers: ["enqueue_task", "complete_task"] },
      { table: "wallet_state", reducers: ["record_tx", "sync_balance"] },
      { table: "player_state", reducers: ["update_dojo", "earn_optx"] },
      { table: "poi_state", reducers: ["commit_experiment", "log_adoption"] },
    ],
  },
]

// ─── Topology SVG ───────────────────────────────────────────
function TopologySVG() {
  const nodes = [
    // L0
    { id: "perplexity", label: "PERPLEXITY", x: 80, y: 30, color: "#06b6d4" },
    { id: "grok", label: "GROK 4.20", x: 240, y: 30, color: "#06b6d4" },
    { id: "matrix", label: "MATRIX", x: 400, y: 30, color: "#06b6d4" },
    { id: "jettoptics", label: "jettoptics.ai", x: 560, y: 30, color: "#06b6d4" },
    // L1
    { id: "joe", label: "JOE CORE", x: 320, y: 110, color: "#a855f7" },
    { id: "nemoclaw", label: "NemoClaw", x: 120, y: 110, color: "#a855f7" },
    { id: "aaron", label: "AARON", x: 520, y: 110, color: "#a855f7" },
    // Brain
    { id: "brain", label: "SpacetimeDB", x: 320, y: 180, color: "#ec4899" },
    // L2
    { id: "hedgehog", label: "HEDGEHOG", x: 200, y: 250, color: "#f97316" },
    { id: "knot", label: "Knot-Engine", x: 440, y: 250, color: "#f97316" },
    // L3
    { id: "jetson", label: "JETSON JOE", x: 320, y: 320, color: "#22c55e" },
    // L4
    { id: "solana", label: "Solana", x: 160, y: 390, color: "#eab308" },
    { id: "xrpl", label: "XRPL", x: 320, y: 390, color: "#eab308" },
    { id: "evm", label: "EVM", x: 480, y: 390, color: "#eab308" },
    // L5
    { id: "poi", label: "PoI Network", x: 320, y: 460, color: "#ef4444" },
  ]

  const edges = [
    { from: "perplexity", to: "joe" }, { from: "grok", to: "joe" },
    { from: "matrix", to: "joe" }, { from: "jettoptics", to: "joe" },
    { from: "joe", to: "nemoclaw" }, { from: "joe", to: "aaron" },
    { from: "joe", to: "brain" },
    { from: "brain", to: "hedgehog" }, { from: "brain", to: "knot" },
    { from: "hedgehog", to: "jetson" }, { from: "knot", to: "jetson" },
    { from: "jetson", to: "solana" }, { from: "jetson", to: "xrpl" },
    { from: "jetson", to: "evm" },
    { from: "solana", to: "poi" }, { from: "xrpl", to: "poi" },
    { from: "evm", to: "poi" },
  ]

  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]))

  return (
    <svg viewBox="0 0 660 500" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {edges.map((e, i) => {
        const from = nodeMap[e.from]
        const to = nodeMap[e.to]
        return (
          <line
            key={i}
            x1={from.x}
            y1={from.y + 12}
            x2={to.x}
            y2={to.y - 12}
            stroke={to.color}
            strokeWidth="1"
            strokeOpacity="0.4"
          />
        )
      })}
      {nodes.map((n) => (
        <g key={n.id} filter="url(#glow)">
          <rect
            x={n.x - 50}
            y={n.y - 12}
            width="100"
            height="24"
            rx="4"
            fill="rgba(0,0,0,0.6)"
            stroke={n.color}
            strokeWidth="1"
            strokeOpacity="0.6"
          />
          <text
            x={n.x}
            y={n.y + 4}
            textAnchor="middle"
            fill={n.color}
            fontSize="10"
            fontFamily="var(--font-geist-mono), monospace"
          >
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  )
}

// ─── Architecture Panel ─────────────────────────────────────
function ArchitecturePanel() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ L1: true })
  const [brainExpanded, setBrainExpanded] = useState(false)

  const toggle = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h2 className="font-orbitron text-sm font-bold tracking-wider text-cyan-400">
            OPTX AGENTIC OS (jOSH)
          </h2>
        </div>
        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[10px]">
          Mesh v2.9
        </Badge>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 px-4 py-2 border-b border-zinc-800/50">
        {LAYERS.map((l) => (
          <span
            key={l.id}
            className="text-[10px] font-mono flex items-center gap-1"
            style={{ color: l.color }}
          >
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: l.color }}
            />
            {l.id}
          </span>
        ))}
        <span className="text-[10px] font-mono flex items-center gap-1 text-pink-400">
          <span className="w-2 h-2 rounded-full inline-block bg-pink-400" />
          Brain
        </span>
      </div>

      {/* Layers */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {LAYERS.map((layer) => (
          <div key={layer.id} className="rounded-lg overflow-hidden">
            <button
              onClick={() => toggle(layer.id)}
              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-zinc-800/50 transition-colors rounded-lg"
            >
              {expanded[layer.id] ? (
                <ChevronDown className="w-3 h-3 flex-shrink-0" style={{ color: layer.color }} />
              ) : (
                <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: layer.color }} />
              )}
              <span
                className="font-orbitron text-[11px] font-bold tracking-wider"
                style={{ color: layer.color }}
              >
                {layer.id} — {layer.name}
              </span>
            </button>
            {expanded[layer.id] && (
              <div className="grid gap-1 px-2 pb-2">
                {layer.nodes.map((node, ni) => (
                  <div
                    key={ni}
                    className="flex items-start gap-2 px-3 py-2 rounded-md bg-zinc-900/60 border border-zinc-800/50 hover:border-zinc-700/50 transition-colors"
                  >
                    <NodeIcon layer={layer.id} className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: layer.color }} />
                    <div className="min-w-0">
                      <div className="text-xs font-mono text-zinc-200 truncate">
                        {node.name}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {node.tags.map((tag, ti) => (
                          <span
                            key={ti}
                            className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm"
                            style={{
                              backgroundColor: `${layer.color}15`,
                              color: layer.color,
                              border: `1px solid ${layer.color}30`,
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* SpacetimeDB Brain Section */}
        <div className="rounded-lg overflow-hidden">
          <button
            onClick={() => setBrainExpanded(!brainExpanded)}
            className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-zinc-800/50 transition-colors rounded-lg"
          >
            {brainExpanded ? (
              <ChevronDown className="w-3 h-3 flex-shrink-0 text-pink-400" />
            ) : (
              <ChevronRight className="w-3 h-3 flex-shrink-0 text-pink-400" />
            )}
            <Brain className="w-3.5 h-3.5 text-pink-400" />
            <span className="font-orbitron text-[11px] font-bold tracking-wider text-pink-400">
              JOE BRAIN — SPACETIMEDB
            </span>
            <Badge className="ml-auto bg-pink-500/20 text-pink-400 border-pink-500/30 text-[9px]">
              16 reducers · 48+ tables
            </Badge>
          </button>
          {brainExpanded && (
            <div className="px-2 pb-2 space-y-2">
              {BRAIN_MODULES.map((cat, ci) => (
                <div key={ci}>
                  <div className="text-[10px] font-orbitron font-bold text-pink-400/70 px-3 py-1 uppercase tracking-widest">
                    {cat.category}
                  </div>
                  <div className="grid gap-1">
                    {cat.modules.map((mod, mi) => (
                      <div
                        key={mi}
                        className="flex items-start gap-2 px-3 py-1.5 rounded-md bg-pink-950/20 border border-pink-900/20"
                      >
                        <Database className="w-3 h-3 mt-0.5 text-pink-400/60 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-[11px] font-mono text-pink-300">
                            {mod.table}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {mod.reducers.map((r, ri) => (
                              <span
                                key={ri}
                                className="text-[9px] font-mono px-1 py-0.5 rounded-sm bg-pink-500/10 text-pink-400/80 border border-pink-500/20"
                              >
                                {r}()
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex flex-wrap gap-2 px-3 py-2 text-[9px] font-mono text-pink-400/60">
                <span>WASM Compiled</span>
                <span>·</span>
                <span>Real-Time Subscriptions</span>
                <span>·</span>
                <span>ACID per Reducer</span>
              </div>
            </div>
          )}
        </div>

        {/* Topology SVG */}
        <div className="mt-2 rounded-lg border border-zinc-800/50 bg-zinc-950/50 p-2">
          <div className="text-[10px] font-orbitron text-zinc-500 px-2 py-1 uppercase tracking-widest">
            Topology
          </div>
          <TopologySVG />
        </div>
      </div>
    </div>
  )
}

function NodeIcon({ layer, className, style }: { layer: string; className?: string; style?: React.CSSProperties }) {
  switch (layer) {
    case "L0": return <Globe className={className} style={style} />
    case "L1": return <Cpu className={className} style={style} />
    case "L2": return <Shield className={className} style={style} />
    case "L3": return <Server className={className} style={style} />
    case "L4": return <Wallet className={className} style={style} />
    case "L5": return <Zap className={className} style={style} />
    default: return <Hash className={className} style={style} />
  }
}

// ─── Wallet Connect Button ──────────────────────────────────
function WalletConnectButton({
  connected,
  isFounder,
  walletAddress,
  setWalletModalVisible,
}: {
  connected: boolean
  isFounder: boolean
  walletAddress: string | null
  setWalletModalVisible: (v: boolean) => void
}) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
  }, [])

  if (connected && walletAddress) {
    return (
      <div className="flex items-center gap-1.5">
        <Badge
          className={`text-[9px] font-mono ${
            isFounder
              ? "bg-red-500/20 text-red-400 border-red-500/30"
              : "bg-zinc-700/30 text-zinc-400 border-zinc-600/30"
          }`}
        >
          {isFounder ? (
            <>
              <Lock className="w-2.5 h-2.5 mr-1" />
              DEV
            </>
          ) : (
            <>
              <CheckCircle2 className="w-2.5 h-2.5 mr-1 text-green-400" />
              {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
            </>
          )}
        </Badge>
        {/* Disconnect / switch wallet */}
        <div className="astrojoe-wallet-sm">
          <style jsx global>{`
            .astrojoe-wallet-sm .wallet-adapter-button {
              background: transparent !important;
              border: 1px solid rgba(113,113,122,0.3) !important;
              border-radius: 0.375rem !important;
              font-family: "Geist Mono", monospace !important;
              font-size: 0.55rem !important;
              padding: 0.15rem 0.5rem !important;
              height: 22px !important;
              color: #a1a1aa !important;
              line-height: 1 !important;
            }
            .astrojoe-wallet-sm .wallet-adapter-button:hover {
              border-color: rgba(161,161,170,0.5) !important;
              color: #e4e4e7 !important;
            }
            .astrojoe-wallet-sm .wallet-adapter-button-start-icon {
              display: none !important;
            }
          `}</style>
          <WalletMultiButton />
        </div>
      </div>
    )
  }

  if (isMobile) {
    const phantomDeepLink = `https://phantom.app/ul/browse/${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "https://jettoptics.ai/astrojoe")}?ref=${encodeURIComponent("https://jettoptics.ai")}`
    return (
      <a
        href={phantomDeepLink}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-mono font-bold transition-colors"
      >
        <Wallet className="w-3 h-3" />
        Phantom
        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
      </a>
    )
  }

  return (
    <div className="astrojoe-wallet-btn">
      <style jsx global>{`
        .astrojoe-wallet-btn .wallet-adapter-button {
          background-color: #0891b2 !important;
          border: 1px solid rgba(6, 182, 212, 0.4) !important;
          border-radius: 0.5rem !important;
          font-family: "Geist Mono", ui-monospace, monospace !important;
          font-size: 0.65rem !important;
          font-weight: 600 !important;
          padding: 0.25rem 0.75rem !important;
          height: 28px !important;
          line-height: 1 !important;
          letter-spacing: 0.05em !important;
          transition: background-color 0.2s !important;
        }
        .astrojoe-wallet-btn .wallet-adapter-button:hover {
          background-color: #06b6d4 !important;
        }
        .astrojoe-wallet-btn .wallet-adapter-button-start-icon {
          width: 14px !important;
          height: 14px !important;
          margin-right: 4px !important;
        }
      `}</style>
      <WalletMultiButton />
    </div>
  )
}

// ─── Terminal Message ───────────────────────────────────────
interface TerminalMessage {
  id: string
  sender: string
  content: string
  type: "chat" | "joe" | "system" | "dev" | "error"
  timestamp: number
}

function TerminalLine({ msg }: { msg: TerminalMessage }) {
  const colorMap: Record<string, string> = {
    chat: "text-zinc-300",
    joe: "text-cyan-400",
    system: "text-yellow-400",
    dev: "text-green-400",
    error: "text-red-400",
  }

  const prefixMap: Record<string, string> = {
    chat: "user",
    joe: "JOE",
    system: "SYS",
    dev: "DEV",
    error: "ERR",
  }

  const time = new Date(msg.timestamp).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className="group px-3 py-0.5 hover:bg-zinc-800/30">
      <div className="flex items-start gap-2 text-xs font-mono">
        <span className="text-zinc-600 flex-shrink-0 select-none">{time}</span>
        <span className={`flex-shrink-0 ${colorMap[msg.type]}`}>
          [{prefixMap[msg.type]}]
        </span>
        {msg.type === "chat" && (
          <span className="text-zinc-500 flex-shrink-0">{msg.sender}:</span>
        )}
        <span
          className={`break-words whitespace-pre-wrap ${
            msg.type === "joe" || msg.type === "dev"
              ? colorMap[msg.type]
              : "text-zinc-300"
          }`}
        >
          {msg.content}
        </span>
      </div>
    </div>
  )
}

// ─── JOEclaw Terminal Panel ─────────────────────────────────
function TerminalPanel() {
  const { user } = useUser()
  const { publicKey, connected } = useWallet()
  const { setVisible: setWalletModalVisible } = useWalletModal()

  const walletAddress = publicKey?.toBase58() ?? null
  const isFounder = walletAddress === FOUNDER_WALLET
  const mode = isFounder ? "dev" : "public"
  const channelName = isFounder ? "astrojoe-dev" : "astrojoe"

  // Convex channel setup — uses existing messages API (already deployed)
  const channels = useQuery(api.messages.listChannels)
  const channel = channels?.find((c: { name: string }) => c.name === channelName) ?? null
  const convexMessages = useQuery(
    api.messages.listMessages,
    channel ? { channelId: channel._id, limit: 100 } : "skip"
  )
  const sendConvexMsg = useMutation(api.messages.sendMessage)

  // Local state
  const [input, setInput] = useState("")
  const [localMessages, setLocalMessages] = useState<TerminalMessage[]>([])
  const [joeOnline, setJoeOnline] = useState(true)
  const [conduitOnline, setConduitOnline] = useState(false)
  const [codeMode, setCodeMode] = useState(false)
  const [sending, setSending] = useState(false)
  const [attachedImages, setAttachedImages] = useState<{ name: string; data: string; preview: string }[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const channelCreated = useRef(false)

  // Handle file selection (from picker or paste)
  const handleFiles = useCallback((files: FileList | File[]) => {
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return
      const reader = new FileReader()
      reader.onload = (e) => {
        const data = e.target?.result as string
        setAttachedImages((prev) => [
          ...prev,
          { name: file.name, data, preview: data },
        ])
      }
      reader.readAsDataURL(file)
    })
  }, [])

  // Clipboard paste handler
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return
    const imageFiles: File[] = []
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile()
        if (file) imageFiles.push(file)
      }
    }
    if (imageFiles.length > 0) {
      e.preventDefault()
      handleFiles(imageFiles)
    }
  }, [handleFiles])

  // Channel is found from the existing channels list above.
  // If it doesn't exist yet, the first sendMessage will work
  // once a channel is manually created in Convex dashboard.
  // No auto-create needed — messages go to Matrix directly via API route.

  // Check JOE status
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/astrojoe/status")
        const data = await res.json()
        setJoeOnline(data.online)
        setConduitOnline(data.conduit?.online ?? false)
      } catch {
        setJoeOnline(false)
        setConduitOnline(false)
      }
    }
    check()
    const interval = setInterval(check, 30000)
    return () => clearInterval(interval)
  }, [])

  // Build message list from Convex + local
  const messages: TerminalMessage[] = [
    // System boot message
    {
      id: "boot",
      sender: "SYSTEM",
      content: `JOEclaw Terminal v2.9 — ${mode === "dev" ? "DEV MODE" : "PUBLIC MODE"}\nMatrix: @joe:jettoptx-joe via Conduit\nType a message to chat with JOE. ${mode === "dev" ? "Commands: /execute, /code, /browse, /status, /brain, /matrix" : ""}`,
      type: "system",
      timestamp: Date.now() - 100000,
    },
    // Convex messages
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(convexMessages ?? []).map((m: any) => ({
      id: m._id,
      sender: m.displayName,
      content: m.content,
      type: m.messageType as TerminalMessage["type"],
      timestamp: m.createdAt,
    })),
    // Local messages (pending / JOE responses not yet in Convex)
    ...localMessages,
  ]

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages.length])

  const handleSend = useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed || sending) return
    // Allow wallet-only users (no Clerk user required)
    if (!user && !connected) return

    // Don't wrap slash commands in code blocks — they need to be parsed raw
    const isSlashCommand = trimmed.startsWith("/")
    const content = (codeMode && !isSlashCommand) ? "```\n" + trimmed + "\n```" : trimmed
    const now = Date.now()

    // Add user message locally
    const userMsg: TerminalMessage = {
      id: `local-${now}`,
      sender: user?.firstName || user?.username || (walletAddress ? `${walletAddress.slice(0,4)}...${walletAddress.slice(-4)}` : "user"),
      content,
      type: mode === "dev" ? "dev" : "chat",
      timestamp: now,
    }
    setLocalMessages((prev) => [...prev, userMsg])
    setInput("")
    setSending(true)

    try {
      // Save to Convex if channel exists
      if (channel) {
        await sendConvexMsg({
          channelId: channel._id,
          clerkUserId: user?.id || walletAddress || "wallet-user",
          displayName: user?.firstName || user?.username || (walletAddress ? `${walletAddress.slice(0,4)}...${walletAddress.slice(-4)}` : "user"),
          content,
          messageType: mode === "dev" ? "dev" : "chat",
        })
        // Remove local copy (Convex subscription will provide it)
        setLocalMessages((prev) => prev.filter((m) => m.id !== userMsg.id))
      }

      // Call API for JOE response
      const res = await fetch("/api/astrojoe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          mode,
          wallet: walletAddress,
          attachments: attachedImages.map((img) => ({
            type: "image",
            data: img.data,
            name: img.name,
          })),
        }),
      })
      const data = await res.json()

      if (data.response) {
        const joeMsg: TerminalMessage = {
          id: `joe-${Date.now()}`,
          sender: "JOE",
          content: data.response,
          type: data.type === "system" ? "system" : "joe",
          timestamp: Date.now(),
        }
        // Save JOE response to Convex
        if (channel) {
          await sendConvexMsg({
            channelId: channel._id,
            clerkUserId: "joe-system",  // JOE system messages bypass auth
            displayName: "JOE",
            content: data.response,
            messageType: "joe",
          })
        } else {
          setLocalMessages((prev) => [...prev, joeMsg])
        }
      }
    } catch {
      setLocalMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "SYSTEM",
          content: "Failed to reach JOE. Check connection.",
          type: "error",
          timestamp: Date.now(),
        },
      ])
    } finally {
      setSending(false)
      setAttachedImages([])
    }
  }, [input, user, sending, codeMode, mode, channel, sendConvexMsg, walletAddress, connected, attachedImages])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const prompt = mode === "dev" ? "astrojoe@hedgehog:~# " : "astrojoe@hedgehog:~$ "

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-l border-zinc-800 lg:border-l">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-green-400" />
          <h2 className="font-orbitron text-sm font-bold tracking-wider text-green-400">
            JOEclaw CLI
          </h2>
          {mode === "dev" && (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px]">
              DEV MODE
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Status indicator */}
          <div className="flex items-center gap-1.5">
            <Circle
              className={`w-2 h-2 ${joeOnline ? "text-green-400 fill-green-400" : "text-red-400 fill-red-400"}`}
            />
            <span className="text-[10px] font-mono text-zinc-500">
              {joeOnline ? "API ON" : "OFFLINE"}
            </span>
            <Circle
              className={`w-2 h-2 ${conduitOnline ? "text-green-400 fill-green-400" : "text-yellow-400 fill-yellow-400"}`}
            />
            <span className="text-[10px] font-mono text-zinc-500">
              {conduitOnline ? "CONDUIT" : "NO MESH"}
            </span>
          </div>
          {/* Wallet connect — full WalletMultiButton */}
          <WalletConnectButton
            connected={connected}
            isFounder={isFounder}
            walletAddress={walletAddress}
            setWalletModalVisible={setWalletModalVisible}
          />
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent"
      >
        {messages.map((msg) => (
          <TerminalLine key={msg.id} msg={msg} />
        ))}
        {sending && (
          <div className="px-3 py-0.5">
            <span className="text-xs font-mono text-cyan-400/60 animate-pulse">
              JOE is thinking...
            </span>
          </div>
        )}
      </div>

      {/* Image preview strip */}
      {attachedImages.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 border-t border-zinc-800/50 bg-zinc-900/30 overflow-x-auto">
          {attachedImages.map((img, i) => (
            <div key={i} className="relative flex-shrink-0 group">
              <img
                src={img.preview}
                alt={img.name}
                className="w-12 h-12 rounded-md object-cover border border-zinc-700"
              />
              <button
                onClick={() => setAttachedImages((prev) => prev.filter((_, idx) => idx !== i))}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
              <span className="block text-[7px] font-mono text-zinc-600 mt-0.5 max-w-[48px] truncate">
                {img.name}
              </span>
            </div>
          ))}
          <span className="text-[9px] font-mono text-zinc-600">
            {attachedImages.length} image{attachedImages.length > 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-1.5 border-t border-zinc-800/50 bg-zinc-900/30">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files)
            e.target.value = "" // reset so same file can be re-selected
          }}
        />
        <Button
          variant="ghost"
          size="sm"
          className={`h-6 w-6 p-0 ${attachedImages.length > 0 ? "text-cyan-400" : "text-zinc-500 hover:text-zinc-300"}`}
          title="Attach image"
          onClick={() => fileInputRef.current?.click()}
        >
          <Image className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`h-6 w-6 p-0 ${codeMode ? "text-cyan-400" : "text-zinc-500 hover:text-zinc-300"}`}
          title="Toggle code mode"
          onClick={() => setCodeMode(!codeMode)}
        >
          <Code2 className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-zinc-500 hover:text-zinc-300"
          title="Browse URL"
          onClick={() => {
            const url = window.prompt("Enter URL for JOE to browse:")
            if (url) {
              setInput(`/browse ${url}`)
              inputRef.current?.focus()
            }
          }}
        >
          <Globe className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-zinc-500 hover:text-zinc-300"
          title="SpacetimeDB Brain"
          onClick={() => {
            setInput("/brain")
            inputRef.current?.focus()
          }}
        >
          <Brain className="w-3.5 h-3.5" />
        </Button>
        {mode === "dev" && (
          <>
            <div className="w-px h-4 bg-zinc-800 mx-1" />
            <Badge className="bg-green-500/10 text-green-400/60 border-green-500/20 text-[8px] select-none">
              /execute /code /browse /status /brain /matrix
            </Badge>
          </>
        )}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-3 py-2 border-t border-zinc-800 bg-black">
        <span className="text-xs font-mono text-green-400 flex-shrink-0 select-none">
          {prompt}
        </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={mode === "dev" ? "Enter command or message... (paste images here)" : "Chat with JOE... (paste images here)"}
          className="flex-1 bg-transparent text-xs font-mono text-zinc-200 placeholder:text-zinc-600 outline-none caret-green-400"
          disabled={!user && !connected}
        />
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-green-400 hover:text-green-300 disabled:text-zinc-700"
          onClick={handleSend}
          disabled={!input.trim() || sending || (!user && !connected)}
        >
          <Send className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  )
}

// ─── Wallet Gate Screen ─────────────────────────────────────
// This is the ONE page that uses direct wallet auth — no gaze-verify redirect
function WalletGateScreen() {
  const { publicKey, connected } = useWallet()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
  }, [])

  const phantomDeepLink = `https://phantom.app/ul/browse/${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "https://jettoptics.ai/astrojoe")}?ref=${encodeURIComponent("https://jettoptics.ai")}`

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Subtle radial gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(6,182,212,0.06)_0%,_transparent_70%)]" />
      <div className="absolute inset-0" style={{
        backgroundImage: 'linear-gradient(rgba(6,182,212,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.015) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      <div className="max-w-md mx-4 w-full relative z-10">
        <Card className="bg-zinc-900/90 border-zinc-800/80 backdrop-blur-xl shadow-2xl shadow-cyan-500/5">
          <CardHeader className="text-center pb-2">
            {/* AstroKnots Icon */}
            <div className="flex justify-center mb-5">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-cyan-500/30 shadow-lg shadow-cyan-500/10">
                  <img
                    src="/astroknots-icon.jpg"
                    alt="AstroKnots"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-zinc-900 border-2 border-cyan-500/40 flex items-center justify-center shadow-lg">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                </div>
              </div>
            </div>
            <CardTitle className="font-orbitron text-cyan-400 text-xl tracking-[0.15em]">
              ASTROJOE
            </CardTitle>
            <p className="text-xs font-mono text-zinc-500 mt-1.5">
              JOEclaw Terminal — OPTX Agentic OS
            </p>
          </CardHeader>
          <CardContent className="space-y-5 pt-2">
            <p className="text-sm text-zinc-400 text-center leading-relaxed">
              Connect your Solana wallet to access the terminal.
              <span className="block text-zinc-600 text-xs mt-1">Dev access requires authorized wallet.</span>
            </p>

            {/* Wallet Connect */}
            <div className="space-y-3">
              {connected && publicKey ? (
                <div className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-green-500/10 border border-green-500/20">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="font-mono text-sm text-green-400">
                    {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
                  </span>
                </div>
              ) : isMobile ? (
                <a
                  href={phantomDeepLink}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-mono text-sm border border-cyan-400/30 transition-all shadow-lg shadow-cyan-500/20"
                >
                  {/* Phantom icon */}
                  <svg width="18" height="18" viewBox="0 0 128 128" fill="currentColor"><path d="M110.6 57.4C110.6 30.4 88.1 8.4 61 8.4c-24.9 0-45.7 18.4-49.2 42.4-.3 2-.4 4.1-.4 6.2 0 3.5.4 6.9 1 10.2C16.7 92.8 36.7 112 61 112c2.6 0 5.1-.2 7.5-.6-.2-1.5-.3-3-.3-4.5 0-17.6 13.9-32 31.3-33.4 7.1-.6 11.1-6.2 11.1-12.3v-3.8z"/><circle cx="44" cy="55" r="8"/><circle cx="72" cy="55" r="8"/></svg>
                  Open in Phantom
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </a>
              ) : (
                <div className="astrojoe-gate-wallet flex justify-center">
                  <style jsx global>{`
                    .astrojoe-gate-wallet .wallet-adapter-button {
                      width: 100% !important;
                      justify-content: center !important;
                      background: linear-gradient(135deg, #0891b2, #06b6d4) !important;
                      border: 1px solid rgba(6, 182, 212, 0.4) !important;
                      border-radius: 0.75rem !important;
                      font-family: "Geist Mono", ui-monospace, monospace !important;
                      font-size: 0.875rem !important;
                      font-weight: 600 !important;
                      padding: 0.875rem 1rem !important;
                      height: auto !important;
                      letter-spacing: 0.05em !important;
                      transition: all 0.2s !important;
                      box-shadow: 0 4px 20px rgba(6, 182, 212, 0.2) !important;
                    }
                    .astrojoe-gate-wallet .wallet-adapter-button:hover {
                      background: linear-gradient(135deg, #06b6d4, #22d3ee) !important;
                      box-shadow: 0 4px 24px rgba(6, 182, 212, 0.35) !important;
                      transform: translateY(-1px) !important;
                    }
                    .astrojoe-gate-wallet .wallet-adapter-button-start-icon {
                      width: 20px !important;
                      height: 20px !important;
                      margin-right: 8px !important;
                    }
                  `}</style>
                  <WalletMultiButton className="!w-full" />
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-700/60 to-transparent" />
              <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-700/60 to-transparent" />
            </div>

            {/* Clerk sign-in fallback */}
            <Link href="/optx-login" className="block">
              <Button
                variant="outline"
                className="w-full border-zinc-700/60 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 font-mono text-sm h-11 transition-all"
              >
                Sign in with OPTX Account
              </Button>
            </Link>

            {/* Supported wallets with brand icons */}
            <div className="flex items-center justify-center gap-5 pt-3 pb-1">
              {/* Phantom */}
              <div className="flex flex-col items-center gap-1.5 group cursor-default">
                <div className="w-9 h-9 rounded-xl bg-zinc-800/60 border border-zinc-700/40 flex items-center justify-center group-hover:border-purple-500/40 group-hover:bg-purple-500/5 transition-all">
                  <svg width="18" height="18" viewBox="0 0 128 128" className="text-zinc-500 group-hover:text-purple-400 transition-colors">
                    <path d="M110.6 57.4C110.6 30.4 88.1 8.4 61 8.4c-24.9 0-45.7 18.4-49.2 42.4-.3 2-.4 4.1-.4 6.2 0 3.5.4 6.9 1 10.2C16.7 92.8 36.7 112 61 112c2.6 0 5.1-.2 7.5-.6-.2-1.5-.3-3-.3-4.5 0-17.6 13.9-32 31.3-33.4 7.1-.6 11.1-6.2 11.1-12.3v-3.8z" fill="currentColor"/>
                    <circle cx="44" cy="55" r="7" fill="currentColor" opacity="0.3"/>
                    <circle cx="72" cy="55" r="7" fill="currentColor" opacity="0.3"/>
                  </svg>
                </div>
                <span className="text-[9px] font-mono text-zinc-600 group-hover:text-zinc-400 transition-colors">Phantom</span>
              </div>

              {/* Solflare */}
              <div className="flex flex-col items-center gap-1.5 group cursor-default">
                <div className="w-9 h-9 rounded-xl bg-zinc-800/60 border border-zinc-700/40 flex items-center justify-center group-hover:border-orange-500/40 group-hover:bg-orange-500/5 transition-all">
                  <svg width="18" height="18" viewBox="0 0 24 24" className="text-zinc-500 group-hover:text-orange-400 transition-colors">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-[9px] font-mono text-zinc-600 group-hover:text-zinc-400 transition-colors">Solflare</span>
              </div>

              {/* Backpack */}
              <div className="flex flex-col items-center gap-1.5 group cursor-default">
                <div className="w-9 h-9 rounded-xl bg-zinc-800/60 border border-zinc-700/40 flex items-center justify-center group-hover:border-red-500/40 group-hover:bg-red-500/5 transition-all">
                  <svg width="16" height="16" viewBox="0 0 24 24" className="text-zinc-500 group-hover:text-red-400 transition-colors">
                    <rect x="4" y="8" width="16" height="13" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    <path d="M8 8V6a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                    <line x1="4" y1="14" x2="20" y2="14" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="12" cy="14" r="1.5" fill="currentColor"/>
                  </svg>
                </div>
                <span className="text-[9px] font-mono text-zinc-600 group-hover:text-zinc-400 transition-colors">Backpack</span>
              </div>

              {/* OKX */}
              <div className="flex flex-col items-center gap-1.5 group cursor-default">
                <div className="w-9 h-9 rounded-xl bg-zinc-800/60 border border-zinc-700/40 flex items-center justify-center group-hover:border-zinc-400/40 group-hover:bg-zinc-500/5 transition-all">
                  <span className="text-[10px] font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors tracking-tight">OKX</span>
                </div>
                <span className="text-[9px] font-mono text-zinc-600 group-hover:text-zinc-400 transition-colors">OKX</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Powered by line */}
        <p className="text-center text-[9px] font-mono text-zinc-700 mt-4">
          Powered by Jett Optics · SpacetimeDB · Grok 4.20
        </p>
      </div>
    </div>
  )
}

// ─── Main Page ──────────────────────────────────────────────
export default function AstroJoeClient() {
  const { user, isLoaded } = useUser()
  const { publicKey, connected } = useWallet()

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-8 h-8 text-cyan-400 animate-pulse mx-auto mb-3" />
          <p className="text-sm font-mono text-zinc-500">Initializing JOEclaw...</p>
        </div>
      </div>
    )
  }

  // Not signed in AND no wallet connected → wallet gate
  // This is the ONE page that uses wallet-first auth (no gaze-verify)
  if (!user && !connected) {
    return <WalletGateScreen />
  }

  const displayName = user?.firstName || user?.username || (publicKey ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}` : "anon")

  return (
    <div className="min-h-screen bg-black text-zinc-200">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-950">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-cyan-400" />
            <h1 className="font-orbitron text-sm font-bold tracking-wider text-cyan-400">
              ASTROJOE
            </h1>
          </div>
          <Badge className="bg-zinc-800 text-zinc-500 border-zinc-700 text-[10px]">
            OPTX Agentic OS
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-600">
          <span>{displayName}</span>
          <span>·</span>
          <span>grok-4.20</span>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="flex flex-col lg:flex-row" style={{ height: "calc(100vh - 41px)" }}>
        {/* Left: Architecture Viewer */}
        <div className="w-full lg:w-1/2 h-[50vh] lg:h-full border-b lg:border-b-0 border-zinc-800 bg-zinc-950">
          <ArchitecturePanel />
        </div>

        {/* Right: Terminal */}
        <div className="w-full lg:w-1/2 h-[50vh] lg:h-full">
          <TerminalPanel />
        </div>
      </div>
    </div>
  )
}
