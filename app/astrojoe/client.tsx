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
  Terminal, ChevronDown, ChevronRight,
  Globe, Brain, Circle, Cpu, Database, Layers, Shield, Wallet,
  Zap, Network, Hash, Lock, Server,
  ExternalLink, CheckCircle2, FileText, X,
  Sun, Moon, MessageSquare, Activity, GitBranch,
  Menu, PanelLeftClose, Plus, ArrowUp, Copy, Check,
  Paperclip, Code2, RefreshCw, Search,
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
const JTX_MINT = "9XpJiKEYzq5yDo5pJzRfjSRMPL2yPfDQXgiN7uYtBhUj"
const JTX_DECIMALS = 9
const JTX_MIN_BALANCE = 1 // Minimum 1 full JTX token required for tool access
const TOKEN_2022_PROGRAM_ID = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"

// Solana RPC endpoint (same config as solana-provider)
const _heliusKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY || ""
const _network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "mainnet-beta"
const _isMainnet = _network.includes("mainnet")
const SOLANA_RPC = process.env.NEXT_PUBLIC_HELIUS_RPC_URL
  || (_heliusKey ? `https://${_isMainnet ? "mainnet" : "devnet"}.helius-rpc.com/?api-key=${_heliusKey}` : "")
  || (_isMainnet ? "https://api.mainnet-beta.solana.com" : "https://api.devnet.solana.com")

// ─── JTX Balance Helper ─────────────────────────────────────
async function getJTXBalance(wallet: string): Promise<number> {
  try {
    // Try standard SPL Token program first
    const res = await fetch(SOLANA_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0", id: 1, method: "getTokenAccountsByOwner",
        params: [wallet, { mint: JTX_MINT }, { encoding: "jsonParsed" }],
      }),
    })
    const data = await res.json()
    const accounts = data.result?.value || []
    if (accounts.length > 0) {
      const amount = accounts[0].account.data.parsed.info.tokenAmount.amount
      return Number(amount) / Math.pow(10, JTX_DECIMALS)
    }

    // Fallback: try Token-2022 program ID (JTX may use Token-2022)
    const res2 = await fetch(SOLANA_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0", id: 1, method: "getTokenAccountsByOwner",
        params: [wallet, { programId: TOKEN_2022_PROGRAM_ID }, { encoding: "jsonParsed" }],
      }),
    })
    const data2 = await res2.json()
    const accounts2 = data2.result?.value || []
    for (const acc of accounts2) {
      if (acc.account.data.parsed.info.mint === JTX_MINT) {
        const amount = acc.account.data.parsed.info.tokenAmount.amount
        return Number(amount) / Math.pow(10, JTX_DECIMALS)
      }
    }
    return 0
  } catch { return 0 }
}

// ─── Theme Hook ──────────────────────────────────────────────
function useTheme() {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    // Always keep global dark class so the rest of the site stays dark
    document.documentElement.classList.add("dark")
  }, [])

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev)
  }, [])

  // isDark controls .astrojoe-light class on the local wrapper, NOT documentElement
  return { isDark, toggleTheme }
}

// ─── Animation Styles (injected once) ────────────────────────
function AnimationStyles() {
  return (
    <style>{`
      @keyframes messageAppear {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-message-appear {
        animation: messageAppear 200ms ease-out forwards;
      }
      @keyframes thinkingPulse {
        0%, 100% { opacity: 0.3; transform: scale(0.85); }
        50% { opacity: 1; transform: scale(1.1); }
      }
      @keyframes sendPress {
        0% { transform: scale(1); }
        50% { transform: scale(0.92); }
        100% { transform: scale(1); }
      }
      .animate-send-press:active {
        animation: sendPress 150ms ease-out;
      }
      /* Theme transition */
      * { transition: background-color 0.3s ease, border-color 0.3s ease, color 0.15s ease; }
      /* Sidebar transition */
      .sidebar-transition { transition: width 0.2s ease, opacity 0.15s ease; }
    `}</style>
  )
}

// ─── Thinking Dots ──────────────────────────────────────────
function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[#00d4aa]"
          style={{
            animation: "thinkingPulse 1.2s ease-in-out infinite",
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </span>
  )
}

function SpinnerSVG({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

// ─── Action Block (Perplexity-style collapsible) ─────────────
function ActionBlock({ actions, isLoading }: { actions: string[]; isLoading: boolean }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="border border-[#222] dark:border-[#222] rounded-lg overflow-hidden my-2 bg-[#111] dark:bg-[#111]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#666] dark:text-[#666] hover:bg-[#1a1a1a] dark:hover:bg-[#1a1a1a] transition-colors"
      >
        {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        {isLoading && <SpinnerSVG className="w-4 h-4 animate-spin text-[#00d4aa]" />}
        <span className="text-xs">
          {isLoading ? "Running tasks in parallel" : `Completed ${actions.length} task${actions.length !== 1 ? "s" : ""}`}
        </span>
      </button>
      {expanded && (
        <div className="px-3 py-2 border-t border-[#222] dark:border-[#222] space-y-1.5">
          {actions.map((action, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-[#666] dark:text-[#666]">
              {action.toLowerCase().includes("brain") || action.toLowerCase().includes("query") ? (
                <Brain className="w-3.5 h-3.5 flex-shrink-0" />
              ) : (
                <Globe className="w-3.5 h-3.5 flex-shrink-0" />
              )}
              <span>{action}</span>
              {!isLoading && (
                <CheckCircle2 className="w-3 h-3 text-green-500/70 ml-auto flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Code Block with copy ────────────────────────────────────
function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-[#0c0c0c] dark:bg-[#0c0c0c] border border-[#222] dark:border-[#222] rounded-lg overflow-hidden my-2">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5 text-[#555]" />
          <span className="text-[11px] font-mono text-[#555]">{language || "code"}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] font-mono text-[#555] hover:text-[#999] transition-colors px-2 py-0.5 rounded hover:bg-[#1a1a1a]"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="px-3 py-3 overflow-x-auto text-[13px] leading-relaxed font-mono text-[#ccc] dark:text-[#ccc]">
        <code>{code}</code>
      </pre>
    </div>
  )
}

// ─── Parse markdown-like content in JOE messages ─────────────
function parseMessageContent(content: string) {
  const parts: React.ReactNode[] = []
  const lines = content.split("\n")
  let i = 0

  while (i < lines.length) {
    if (lines[i].startsWith("```")) {
      const lang = lines[i].slice(3).trim()
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i])
        i++
      }
      if (i < lines.length) i++
      parts.push(
        <CodeBlock key={`code-${parts.length}`} code={codeLines.join("\n")} language={lang} />
      )
    } else {
      const line = lines[i]
      if (line.trim() === "") {
        parts.push(<div key={`br-${i}`} className="h-2" />)
      } else {
        parts.push(
          <p key={`p-${i}`} className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">
            {renderInlineMarkdown(line)}
          </p>
        )
      }
      i++
    }
  }
  return parts
}

function renderInlineMarkdown(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }
    const token = match[0]
    if (token.startsWith("**") && token.endsWith("**")) {
      nodes.push(
        <strong key={`b-${match.index}`} className="font-semibold text-white dark:text-white">
          {token.slice(2, -2)}
        </strong>
      )
    } else if (token.startsWith("`") && token.endsWith("`")) {
      nodes.push(
        <code key={`c-${match.index}`} className="px-1.5 py-0.5 rounded bg-[#1a1a1a] dark:bg-[#1a1a1a] text-[#00d4aa] text-[13px] font-mono">
          {token.slice(1, -1)}
        </code>
      )
    }
    lastIndex = match.index + token.length
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }
  return nodes
}

// ─── Detect action lines in JOE responses ────────────────────
function extractActions(content: string): { actions: string[]; cleanContent: string } {
  const actionPatterns = [
    /^(?:→|↗|▸|>)\s*(.+)$/,
    /^(?:Querying|Searching|Running|Executing|Loading|Connecting|Processing|Analyzing)\s+.+/i,
  ]
  const lines = content.split("\n")
  const actions: string[] = []
  const cleanLines: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    let isAction = false
    for (const pattern of actionPatterns) {
      const m = trimmed.match(pattern)
      if (m) {
        actions.push(m[1] || trimmed)
        isAction = true
        break
      }
    }
    if (!isAction) {
      cleanLines.push(line)
    }
  }

  return { actions, cleanContent: cleanLines.join("\n").trim() }
}

// ─── Chat Message Types ─────────────────────────────────────
interface ChatMessage {
  id: string
  sender: string
  content: string
  type: "chat" | "joe" | "system" | "dev" | "error"
  timestamp: number
}

// ─── Chat Message Rendering (Grok-style) ─────────────────────
function ChatBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.type === "chat" || msg.type === "dev"
  const isJoe = msg.type === "joe"
  const isSystem = msg.type === "system"
  const isError = msg.type === "error"

  if (isSystem) {
    return (
      <div className="flex justify-center my-3 animate-message-appear">
        <div className="text-[11px] font-mono text-[#555] bg-[#111] dark:bg-[#111] border border-[#222] dark:border-[#222] rounded-full px-3 py-1 max-w-[90%] text-center">
          {msg.content.split("\n")[0]}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex justify-center my-2 animate-message-appear">
        <div className="text-[12px] font-mono text-red-400/80 bg-red-950/20 border border-red-900/30 rounded-lg px-3 py-1.5 max-w-[85%] text-center">
          {msg.content}
        </div>
      </div>
    )
  }

  const { actions, cleanContent } = isJoe ? extractActions(msg.content) : { actions: [], cleanContent: msg.content }

  // User message — pill-shaped, right-aligned
  if (isUser) {
    return (
      <div className="flex justify-end mb-4 animate-message-appear">
        <div className="max-w-[85%] sm:max-w-[70%]">
          <div className="bg-[#1a1a1a] dark:bg-[#1a1a1a] rounded-[20px] px-4 py-2.5">
            <p className="text-[15px] leading-relaxed text-white dark:text-white break-words whitespace-pre-wrap">
              {msg.content}
            </p>
          </div>
          <div className="flex justify-end mt-1 pr-2">
            <span className="text-[10px] text-[#444] font-mono">
              {new Date(msg.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // JOE message — full-width, no bubble, just text on surface (Grok-style)
  return (
    <div className="mb-6 animate-message-appear">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full overflow-hidden border border-[#00d4aa]/30 flex-shrink-0">
          <img src="/astroknots-icon.jpg" alt="JOE" className="w-full h-full object-cover" />
        </div>
        <span className="text-sm font-medium text-[#00d4aa]">JOE</span>
        <span className="text-[10px] text-[#444] font-mono">
          {new Date(msg.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
        </span>
      </div>
      <div className="pl-8">
        {actions.length > 0 && (
          <ActionBlock actions={actions} isLoading={false} />
        )}
        <div className="text-[#ccc] dark:text-[#ccc]">
          {parseMessageContent(cleanContent)}
        </div>
      </div>
    </div>
  )
}

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
    name: "PRIVATE LAYER (ASTROJOE BRAIN)",
    color: "#f97316",
    nodes: [
      { name: "AstroJOE Brain", tags: ["port :5555", "CorsairOne", "Docker", "DEFENSE"] },
      { name: "SpacetimeDB Brain", tags: ["52 tables", "22 reducers", "WASM", "Rust"] },
      { name: "OpenGauss Engine", tags: ["Lean4", "prove", "formalize", "SYMBOLIC"] },
      { name: "OpenShell Sandbox", tags: ["NemoClaw", "policy-enforced", "SANDBOX"] },
      { name: "Private Knot-Engine", tags: ["AstroKnots theory", "Rust", "QUANTUM"] },
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
  {
    category: "Computational Intelligence",
    modules: [
      { table: "openshell_executions", reducers: ["store_openshell_result", "exec_sandboxed"] },
      { table: "gauss_proofs", reducers: ["store_gauss_result", "verify_proof"] },
      { table: "compute_routing_log", reducers: ["log_compute_routing", "classify_query"] },
      { table: "symbolic_cache", reducers: ["cache_symbolic_result", "check_cache"] },
    ],
  },
]

// ─── Topology SVG ───────────────────────────────────────────
function TopologySVG() {
  const nodes = [
    { id: "perplexity", label: "PERPLEXITY", x: 80, y: 30, color: "#06b6d4" },
    { id: "grok", label: "GROK 4.20", x: 240, y: 30, color: "#06b6d4" },
    { id: "matrix", label: "MATRIX", x: 400, y: 30, color: "#06b6d4" },
    { id: "jettoptics", label: "jettoptics.ai", x: 560, y: 30, color: "#06b6d4" },
    { id: "joe", label: "JOE CORE", x: 320, y: 110, color: "#a855f7" },
    { id: "nemoclaw", label: "NemoClaw", x: 120, y: 110, color: "#a855f7" },
    { id: "aaron", label: "AARON", x: 520, y: 110, color: "#a855f7" },
    { id: "brain", label: "SpacetimeDB", x: 320, y: 180, color: "#ec4899" },
    { id: "hedgehog", label: "AstroJOE Brain", x: 120, y: 250, color: "#f97316" },
    { id: "openshell", label: "OpenShell", x: 280, y: 250, color: "#8b5cf6" },
    { id: "gauss", label: "OpenGauss", x: 440, y: 250, color: "#10b981" },
    { id: "knot", label: "Knot-Engine", x: 580, y: 250, color: "#f97316" },
    { id: "jetson", label: "JETSON JOE", x: 320, y: 320, color: "#22c55e" },
    { id: "solana", label: "Solana", x: 160, y: 390, color: "#eab308" },
    { id: "xrpl", label: "XRPL", x: 320, y: 390, color: "#eab308" },
    { id: "evm", label: "EVM", x: 480, y: 390, color: "#eab308" },
    { id: "poi", label: "PoI Network", x: 320, y: 460, color: "#ef4444" },
  ]

  const edges = [
    { from: "perplexity", to: "joe" }, { from: "grok", to: "joe" },
    { from: "matrix", to: "joe" }, { from: "jettoptics", to: "joe" },
    { from: "joe", to: "nemoclaw" }, { from: "joe", to: "aaron" },
    { from: "joe", to: "brain" },
    { from: "brain", to: "hedgehog" }, { from: "brain", to: "knot" },
    { from: "brain", to: "openshell" },
    { from: "brain", to: "gauss" },
    { from: "hedgehog", to: "jetson" }, { from: "knot", to: "jetson" },
    { from: "openshell", to: "jetson" },
    { from: "gauss", to: "jetson" },
    { from: "jetson", to: "solana" }, { from: "jetson", to: "xrpl" },
    { from: "jetson", to: "evm" },
    { from: "solana", to: "poi" }, { from: "xrpl", to: "poi" },
    { from: "evm", to: "poi" },
  ]

  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]))

  return (
    <svg viewBox="0 0 680 500" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
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
            x1={from.x} y1={from.y + 12}
            x2={to.x} y2={to.y - 12}
            stroke={to.color}
            strokeWidth="1"
            strokeOpacity="0.4"
          />
        )
      })}
      {nodes.map((n) => (
        <g key={n.id} filter="url(#glow)">
          <rect
            x={n.x - 55} y={n.y - 12}
            width="110" height="24" rx="4"
            fill="rgba(0,0,0,0.6)"
            stroke={n.color} strokeWidth="1" strokeOpacity="0.6"
          />
          <text
            x={n.x} y={n.y + 4}
            textAnchor="middle"
            fill={n.color}
            fontSize="9"
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

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#222] dark:border-[#222]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#00d4aa]" />
          <h2 className="font-mono text-sm font-bold tracking-wider text-[#00d4aa]">
            OPTX AGENTIC OS (jOSH)
          </h2>
        </div>
        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[10px]">
          Mesh v2.9
        </Badge>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 px-4 py-2 border-b border-[#1a1a1a]">
        {LAYERS.map((l) => (
          <span key={l.id} className="text-[10px] font-mono flex items-center gap-1" style={{ color: l.color }}>
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: l.color }} />
            {l.id}
          </span>
        ))}
      </div>

      {/* Layers */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {LAYERS.map((layer) => (
          <div key={layer.id} className="rounded-lg overflow-hidden">
            <button
              onClick={() => toggle(layer.id)}
              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[#161616] dark:hover:bg-[#161616] transition-colors rounded-lg"
            >
              {expanded[layer.id] ? (
                <ChevronDown className="w-3 h-3 flex-shrink-0" style={{ color: layer.color }} />
              ) : (
                <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: layer.color }} />
              )}
              <span className="font-mono text-[11px] font-bold tracking-wider" style={{ color: layer.color }}>
                {layer.id} — {layer.name}
              </span>
            </button>
            {expanded[layer.id] && (
              <div className="grid gap-1 px-2 pb-2">
                {layer.nodes.map((node, ni) => (
                  <div
                    key={ni}
                    className="flex items-start gap-2 px-3 py-2 rounded-md bg-[#111] dark:bg-[#111] border border-[#1a1a1a] hover:border-[#333] transition-colors"
                  >
                    <NodeIcon layer={layer.id} className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: layer.color }} />
                    <div className="min-w-0">
                      <div className="text-xs font-mono text-[#ccc] truncate">{node.name}</div>
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
            className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[#161616] dark:hover:bg-[#161616] transition-colors rounded-lg"
          >
            {brainExpanded ? (
              <ChevronDown className="w-3 h-3 flex-shrink-0 text-pink-400" />
            ) : (
              <ChevronRight className="w-3 h-3 flex-shrink-0 text-pink-400" />
            )}
            <Brain className="w-3.5 h-3.5 text-pink-400" />
            <span className="font-mono text-[11px] font-bold tracking-wider text-pink-400">
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
                  <div className="text-[10px] font-mono font-bold text-pink-400/70 px-3 py-1 uppercase tracking-widest">
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
                          <div className="text-[11px] font-mono text-pink-300">{mod.table}</div>
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
            </div>
          )}
        </div>

        {/* Topology SVG */}
        <div className="mt-2 rounded-lg border border-[#222] bg-[#0a0a0a] dark:bg-[#0a0a0a] p-2">
          <div className="text-[10px] font-mono text-[#555] px-2 py-1 uppercase tracking-widest">
            Topology
          </div>
          <TopologySVG />
        </div>
      </div>
    </div>
  )
}

// ─── Status Dashboard Panel ──────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function StatusDashboard({ statusData, onRefresh }: { statusData: Record<string, any> | null; onRefresh: () => void }) {
  if (!statusData) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-[#555]">
        <Activity className="w-8 h-8" />
        <p className="text-sm">Loading system status...</p>
        <SpinnerSVG className="w-6 h-6 animate-spin text-[#00d4aa]" />
      </div>
    )
  }

  const services = statusData.services ?? []
  const meshNodes = statusData.mesh?.nodes ?? []
  const agt = statusData.agt

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#222] dark:border-[#222]">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#00d4aa]" />
          <h2 className="font-mono text-sm font-bold tracking-wider text-[#00d4aa]">
            SYSTEM STATUS
          </h2>
        </div>
        <button
          onClick={onRefresh}
          className="p-1.5 rounded-md hover:bg-[#161616] text-[#555] hover:text-[#999] transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Health Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Orchestrator */}
          <StatusCard
            title="Orchestrator"
            subtitle={statusData.orchestrator?.host}
            online={statusData.orchestrator?.online}
            details={[
              { label: "Type", value: statusData.orchestrator?.type },
              { label: "IP", value: statusData.orchestrator?.ip },
              { label: "Role", value: statusData.orchestrator?.role },
            ]}
            icon={<Cpu className="w-4 h-4" />}
            color="#06b6d4"
          />

          {/* Brain API */}
          <StatusCard
            title="AstroJOE Brain"
            subtitle={statusData.brain?.host}
            online={statusData.brain?.online}
            details={[
              { label: "Version", value: statusData.brain?.version },
              { label: "Latency", value: statusData.brain?.latencyMs ? `${statusData.brain.latencyMs}ms` : "—" },
              { label: "Port", value: statusData.brain?.port?.toString() },
            ]}
            icon={<Brain className="w-4 h-4" />}
            color="#f97316"
          />

          {/* SpacetimeDB */}
          <StatusCard
            title="SpacetimeDB"
            subtitle="WASM Runtime"
            online={statusData.spacetimedb?.online}
            details={[
              { label: "Tables", value: statusData.spacetimedb?.tables?.toString() ?? "52" },
              { label: "Reducers", value: statusData.spacetimedb?.reducers?.toString() ?? "22" },
              { label: "Runtime", value: "WASM" },
            ]}
            icon={<Database className="w-4 h-4" />}
            color="#ec4899"
          />

          {/* Conduit / Matrix */}
          <StatusCard
            title="Conduit Matrix"
            subtitle={statusData.conduit?.serverName}
            online={statusData.conduit?.online}
            details={[
              { label: "Version", value: statusData.conduit?.version },
              { label: "Latency", value: statusData.conduit?.latencyMs ? `${statusData.conduit.latencyMs}ms` : "—" },
              { label: "Room", value: statusData.conduit?.roomAccessible ? "Joined" : "Closed" },
            ]}
            icon={<Network className="w-4 h-4" />}
            color="#a855f7"
          />

          {/* OpenGauss */}
          <StatusCard
            title="OpenGauss Engine"
            subtitle="Lean4 Orchestrator"
            online={statusData.opengauss?.online}
            details={[
              { label: "Capabilities", value: (statusData.opengauss?.capabilities ?? []).slice(0, 3).join(", ") },
            ]}
            icon={<Zap className="w-4 h-4" />}
            color="#10b981"
          />

          {/* OpenShell */}
          <StatusCard
            title="OpenShell Sandbox"
            subtitle="NemoClaw"
            online={statusData.openshell?.online}
            details={[
              { label: "Capabilities", value: (statusData.openshell?.capabilities ?? []).slice(0, 3).join(", ") },
            ]}
            icon={<Shield className="w-4 h-4" />}
            color="#8b5cf6"
          />
        </div>

        {/* AGT Tensors */}
        {agt && (
          <div className="rounded-lg border border-[#222] dark:border-[#222] bg-[#111] dark:bg-[#111] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Hash className="w-4 h-4 text-[#00d4aa]" />
              <span className="font-mono text-xs font-bold tracking-wider text-[#00d4aa]">AGT GAZE TENSORS</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {["COG", "EMO", "ENV"].map((key) => {
                const val = agt[key.toLowerCase()] ?? agt[key] ?? 0
                const pct = Math.min(100, Math.max(0, typeof val === "number" ? val * 100 : parseFloat(val) * 100 || 0))
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-[#666]">{key}</span>
                      <span className="text-[10px] font-mono text-[#999]">{pct.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#1a1a1a] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: key === "COG" ? "#06b6d4" : key === "EMO" ? "#a855f7" : "#22c55e",
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Mesh Nodes */}
        <div className="rounded-lg border border-[#222] dark:border-[#222] bg-[#111] dark:bg-[#111] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Network className="w-4 h-4 text-[#00d4aa]" />
            <span className="font-mono text-xs font-bold tracking-wider text-[#00d4aa]">MESH NODES</span>
            <span className="text-[10px] font-mono text-[#555] ml-auto">
              {meshNodes.filter((n: { online: boolean }) => n.online).length}/{meshNodes.length} online
            </span>
          </div>
          <div className="space-y-2">
            {meshNodes.map((node: { online: boolean; name: string; role: string; type: string; ip: string }, i: number) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2 rounded-md bg-[#0a0a0a] dark:bg-[#0a0a0a] border border-[#1a1a1a]"
              >
                <Circle className={`w-2 h-2 flex-shrink-0 ${node.online ? "text-green-400 fill-green-400" : "text-red-400 fill-red-400"}`} />
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-mono text-[#ccc] font-semibold">{node.name}</span>
                  <span className="text-[9px] font-mono text-[#555] ml-2">{node.role}</span>
                </div>
                <span className="text-[9px] font-mono text-[#444]">{node.ip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Services */}
        <div className="rounded-lg border border-[#222] dark:border-[#222] bg-[#111] dark:bg-[#111] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Server className="w-4 h-4 text-[#00d4aa]" />
            <span className="font-mono text-xs font-bold tracking-wider text-[#00d4aa]">SERVICES</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {services.map((svc: { status: string; name: string; latencyMs?: number; host?: string }, i: number) => (
              <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-[#0a0a0a] dark:bg-[#0a0a0a] border border-[#1a1a1a]">
                <Circle className={`w-1.5 h-1.5 flex-shrink-0 ${
                  svc.status === "online" || svc.status === "joined" ? "text-green-400 fill-green-400"
                  : svc.status === "unknown" || svc.status === "pending" ? "text-yellow-400 fill-yellow-400"
                  : "text-red-400 fill-red-400"
                }`} />
                <span className="text-[9px] font-mono text-[#888] truncate">{svc.name}</span>
                {svc.latencyMs !== undefined && svc.latencyMs > 0 && (
                  <span className="text-[8px] font-mono text-[#444] ml-auto flex-shrink-0">{svc.latencyMs}ms</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Status Card ─────────────────────────────────────────────
function StatusCard({ title, subtitle, online, details, icon, color }: {
  title: string
  subtitle?: string
  online?: boolean
  details: { label: string; value?: string }[]
  icon: React.ReactNode
  color: string
}) {
  return (
    <div className="rounded-lg border border-[#222] dark:border-[#222] bg-[#111] dark:bg-[#111] p-3">
      <div className="flex items-center gap-2 mb-2">
        <div style={{ color }}>{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-mono font-semibold text-[#ccc] truncate">{title}</div>
          {subtitle && <div className="text-[9px] font-mono text-[#555]">{subtitle}</div>}
        </div>
        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono ${
          online ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
        }`}>
          <Circle className={`w-1.5 h-1.5 ${online ? "fill-green-400" : "fill-red-400"}`} />
          {online ? "Online" : "Offline"}
        </div>
      </div>
      <div className="space-y-1">
        {details.map((d, i) => d.value ? (
          <div key={i} className="flex items-center justify-between">
            <span className="text-[9px] font-mono text-[#555]">{d.label}</span>
            <span className="text-[9px] font-mono text-[#888] truncate ml-2 max-w-[60%] text-right">{d.value}</span>
          </div>
        ) : null)}
      </div>
    </div>
  )
}

// ─── Wallet Connect Button ──────────────────────────────────
function WalletConnectButton({
  connected,
  isFounder,
  walletAddress,
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
              : "bg-[#161616] text-[#888] border-[#222]"
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
        <div className="astrojoe-wallet-sm">
          <style jsx global>{`
            .astrojoe-wallet-sm .wallet-adapter-button {
              background: transparent !important;
              border: 1px solid rgba(34,34,34,0.8) !important;
              border-radius: 0.375rem !important;
              font-family: "Geist Mono", monospace !important;
              font-size: 0.55rem !important;
              padding: 0.15rem 0.5rem !important;
              height: 22px !important;
              color: #666 !important;
              line-height: 1 !important;
            }
            .astrojoe-wallet-sm .wallet-adapter-button:hover {
              border-color: rgba(0,212,170,0.3) !important;
              color: #999 !important;
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
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00d4aa] hover:bg-[#00c49a] text-black text-[10px] font-mono font-bold transition-colors"
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
          background-color: #00d4aa !important;
          border: 1px solid rgba(0, 212, 170, 0.4) !important;
          border-radius: 0.5rem !important;
          font-family: "Geist Mono", ui-monospace, monospace !important;
          font-size: 0.65rem !important;
          font-weight: 600 !important;
          padding: 0.25rem 0.75rem !important;
          height: 28px !important;
          line-height: 1 !important;
          letter-spacing: 0.05em !important;
          transition: background-color 0.2s !important;
          color: #000 !important;
        }
        .astrojoe-wallet-btn .wallet-adapter-button:hover {
          background-color: #00c49a !important;
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

// ─── Chat Session Types ─────────────────────────────────────
interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
}

function getDateGroup(date: Date): string {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  if (d.getTime() === today.getTime()) return "Today"
  if (d.getTime() === yesterday.getTime()) return "Yesterday"
  return "Earlier"
}

// ─── Knowledge Graph Data ────────────────────────────────────
interface GraphNode {
  id: string
  label: string
  category: string
  isHub: boolean
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  description: string
}

interface GraphEdge {
  source: string
  target: string
}

const VAULT_NODES_RAW: { id: string; label: string; category: string; isHub: boolean; description: string }[] = [
  { id: "MOC", label: "MOC.md", category: "00-Index", isHub: true, description: "Master index — Map of Content linking all vault sections." },
  { id: "AARON-Router", label: "AARON-Router.md", category: "01-Architecture", isHub: true, description: "Autonomous routing engine — x402 payment-gated API proxy on port :8888." },
  { id: "AstroJOE-Harness", label: "AstroJOE-Harness.md", category: "01-Architecture", isHub: false, description: "Harness wiring JOE's brain to Matrix, AARON, and SpacetimeDB." },
  { id: "Infrastructure-Topology", label: "Infrastructure-Topology.md", category: "01-Architecture", isHub: true, description: "Mesh topology: Jetson ↔ CorsairOne ↔ Tailscale overlay. Hub of infra notes." },
  { id: "K3s-Cluster", label: "K3s-Cluster.md", category: "01-Architecture", isHub: false, description: "Lightweight Kubernetes cluster powering containerized subagents." },
  { id: "Neuromorphic-Pipeline", label: "Neuromorphic-Pipeline.md", category: "01-Architecture", isHub: false, description: "INT8 quantized inference pipeline running on Jetson Orin Nano." },
  { id: "AstroJOE-Brain", label: "AstroJOE-Brain.md", category: "02-Agents", isHub: false, description: "Brain API server (port :5555) — SpacetimeDB-backed cognition layer." },
  { id: "HEDGEHOG-MCP", label: "HEDGEHOG-MCP.md", category: "02-Agents", isHub: false, description: "Model Context Protocol server exposing 19 tools to Grok/Claude." },
  { id: "JOE-Orchestrator", label: "JOE-Orchestrator.md", category: "02-Agents", isHub: false, description: "Central orchestrator dispatching tasks to subagents via Matrix." },
  { id: "NemoClaw-OpenClaw", label: "NemoClaw-OpenClaw.md", category: "02-Agents", isHub: false, description: "Sandboxed code execution harness with policy enforcement." },
  { id: "DePIN-Protocol", label: "DePIN-Protocol.md", category: "03-Blockchain", isHub: false, description: "Decentralized Physical Infrastructure Network design for OPTX." },
  { id: "Token-Addresses", label: "Token-Addresses.md", category: "03-Blockchain", isHub: false, description: "Registry of JTX, OPTX, SOL, XRP token mint addresses and pools." },
  { id: "Patent-US20250392457A1", label: "US20250392457A1.md", category: "04-Patents", isHub: false, description: "Granted patent: AGT (Anticipatory Gaze Tensor) for attention prediction." },
  { id: "Dev-Log-2026-03-25", label: "2026-03-25.md", category: "05-Dev-Log", isHub: false, description: "Dev log entry — brain API migration, Conduit restart, Jetson sync." },
  { id: "astroknots-space", label: "astroknots-space.md", category: "06-Domains", isHub: false, description: "Astro Knots Vault landing domain — JTX token portal." },
  { id: "jettoptics-ai", label: "jettoptics-ai.md", category: "06-Domains", isHub: false, description: "Jett Optics AI main web app — Next.js + Convex + Clerk." },
  { id: "Conduit-Config", label: "Conduit-Config.md", category: "07-Matrix", isHub: false, description: "Conduit homeserver configuration — federation, rooms, ACLs." },
  { id: "Funnel-Routes", label: "Funnel-Routes.md", category: "07-Matrix", isHub: false, description: "Matrix room funnel routing for user onboarding and escalation." },
  { id: "Room-Topology", label: "Room-Topology.md", category: "07-Matrix", isHub: false, description: "Matrix room hierarchy — #astrojoe, #dev, #system, #alerts." },
  { id: "recruiterJOE", label: "recruiterJOE/README.md", category: "08-Subagents", isHub: false, description: "Recruitment subagent — resume parsing, outreach drafts." },
  { id: "researchJOE", label: "researchJOE/README.md", category: "08-Subagents", isHub: false, description: "Research subagent — Perplexity Sonar integration, RAG queries." },
  { id: "twitterJOE", label: "twitterJOE/README.md", category: "08-Subagents", isHub: false, description: "Twitter subagent — automated posting, engagement tracking." },
  { id: "agt-README", label: "agt/README.md", category: "09-Tensors", isHub: false, description: "Anticipatory Gaze Tensor — Markov-based attention prediction system." },
  { id: "cog-README", label: "cog/README.md", category: "09-Tensors", isHub: false, description: "Cognitive tensor — reasoning load and task complexity metrics." },
  { id: "emo-README", label: "emo/README.md", category: "09-Tensors", isHub: false, description: "Emotional tensor — sentiment and affective state tracking." },
  { id: "env-README", label: "env/README.md", category: "09-Tensors", isHub: false, description: "Environmental tensor — system health, network, temperature." },
  { id: "Vault-Sync", label: "README.md", category: "10-Vault-Sync", isHub: false, description: "Obsidian vault ↔ Git sync pipeline for knowledge persistence." },
  { id: "template-architecture", label: "architecture-doc.md", category: "Templates", isHub: false, description: "Template for new architecture documentation notes." },
  { id: "template-daily", label: "daily-log.md", category: "Templates", isHub: false, description: "Template for daily development log entries." },
  { id: "seek-and-you-shall-find", label: "seek-and-you-shall-find.md", category: "00-Index", isHub: true, description: "Philosophical index — guiding principles, search-first epistemology." },
]

const VAULT_EDGES: GraphEdge[] = [
  // MOC links to many
  { source: "MOC", target: "AARON-Router" },
  { source: "MOC", target: "Infrastructure-Topology" },
  { source: "MOC", target: "AstroJOE-Brain" },
  { source: "MOC", target: "HEDGEHOG-MCP" },
  { source: "MOC", target: "Token-Addresses" },
  { source: "MOC", target: "DePIN-Protocol" },
  { source: "MOC", target: "agt-README" },
  { source: "MOC", target: "Room-Topology" },
  { source: "MOC", target: "seek-and-you-shall-find" },
  { source: "MOC", target: "K3s-Cluster" },
  { source: "MOC", target: "Patent-US20250392457A1" },
  // seek-and-you-shall-find links
  { source: "seek-and-you-shall-find", target: "AstroJOE-Harness" },
  { source: "seek-and-you-shall-find", target: "researchJOE" },
  { source: "seek-and-you-shall-find", target: "agt-README" },
  // Infrastructure-Topology links
  { source: "Infrastructure-Topology", target: "K3s-Cluster" },
  { source: "Infrastructure-Topology", target: "Neuromorphic-Pipeline" },
  { source: "Infrastructure-Topology", target: "Conduit-Config" },
  { source: "Infrastructure-Topology", target: "jettoptics-ai" },
  // AARON-Router links
  { source: "AARON-Router", target: "AstroJOE-Harness" },
  { source: "AARON-Router", target: "HEDGEHOG-MCP" },
  { source: "AARON-Router", target: "Token-Addresses" },
  { source: "AARON-Router", target: "NemoClaw-OpenClaw" },
  // AstroJOE-Harness links
  { source: "AstroJOE-Harness", target: "AstroJOE-Brain" },
  { source: "AstroJOE-Harness", target: "JOE-Orchestrator" },
  // HEDGEHOG-MCP links
  { source: "HEDGEHOG-MCP", target: "recruiterJOE" },
  { source: "HEDGEHOG-MCP", target: "twitterJOE" },
  // Tensor links
  { source: "agt-README", target: "cog-README" },
  { source: "agt-README", target: "emo-README" },
  { source: "agt-README", target: "env-README" },
  { source: "Patent-US20250392457A1", target: "agt-README" },
  // Matrix links
  { source: "Room-Topology", target: "Funnel-Routes" },
  { source: "Room-Topology", target: "Conduit-Config" },
  // Blockchain links
  { source: "DePIN-Protocol", target: "Token-Addresses" },
  // Domain links
  { source: "Neuromorphic-Pipeline", target: "Vault-Sync" },
  { source: "astroknots-space", target: "Token-Addresses" },
  { source: "Dev-Log-2026-03-25", target: "Infrastructure-Topology" },
  { source: "template-architecture", target: "template-daily" },
]

const VAULT_CATEGORIES: { name: string; count: number }[] = [
  { name: "Architecture", count: 5 },
  { name: "Agents", count: 4 },
  { name: "Blockchain", count: 2 },
  { name: "Patents", count: 1 },
  { name: "Dev-Log", count: 1 },
  { name: "Domains", count: 2 },
  { name: "Matrix", count: 3 },
  { name: "Subagents", count: 3 },
  { name: "Tensors", count: 4 },
  { name: "Vault-Sync", count: 1 },
]

const CATEGORY_MAP: Record<string, string> = {
  "00-Index": "Index",
  "01-Architecture": "Architecture",
  "02-Agents": "Agents",
  "03-Blockchain": "Blockchain",
  "04-Patents": "Patents",
  "05-Dev-Log": "Dev-Log",
  "06-Domains": "Domains",
  "07-Matrix": "Matrix",
  "08-Subagents": "Subagents",
  "09-Tensors": "Tensors",
  "10-Vault-Sync": "Vault-Sync",
  "Templates": "Templates",
}

// ─── Knowledge Graph Component ───────────────────────────────
function KnowledgeGraphPanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nodesRef = useRef<GraphNode[]>([])
  const edgesRef = useRef<GraphEdge[]>(VAULT_EDGES)
  const animFrameRef = useRef<number>(0)
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [popupPos, setPopupPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  // Camera state refs (no re-renders on pan/zoom)
  const cameraRef = useRef({ x: 0, y: 0, zoom: 1 })
  const dragRef = useRef<{ isDragging: boolean; startX: number; startY: number; nodeDrag: GraphNode | null; panStartCamX: number; panStartCamY: number }>({
    isDragging: false, startX: 0, startY: 0, nodeDrag: null, panStartCamX: 0, panStartCamY: 0
  })
  const particlesRef = useRef<{ edge: number; t: number; speed: number }[]>([])
  const alphaRef = useRef(1)
  const tickRef = useRef(0)

  // Initialize nodes with positions
  useEffect(() => {
    const nodes: GraphNode[] = VAULT_NODES_RAW.map((n, i) => {
      const angle = (i / VAULT_NODES_RAW.length) * Math.PI * 2
      const radius = n.isHub ? 80 + Math.random() * 40 : 150 + Math.random() * 200
      return {
        ...n,
        x: Math.cos(angle) * radius + (Math.random() - 0.5) * 60,
        y: Math.sin(angle) * radius + (Math.random() - 0.5) * 60,
        vx: 0,
        vy: 0,
        radius: n.isHub ? 16 : 5,
      }
    })
    nodesRef.current = nodes

    // Init particles
    const parts: { edge: number; t: number; speed: number }[] = []
    for (let i = 0; i < VAULT_EDGES.length; i++) {
      const count = 1 + Math.floor(Math.random() * 2)
      for (let j = 0; j < count; j++) {
        parts.push({ edge: i, t: Math.random(), speed: 0.001 + Math.random() * 0.002 })
      }
    }
    particlesRef.current = parts
    alphaRef.current = 1
  }, [])

  // Force simulation + render loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    function resize() {
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
    }
    resize()
    window.addEventListener("resize", resize)

    function simulateForces() {
      const nodes = nodesRef.current
      const edges = edgesRef.current
      const alpha = alphaRef.current
      if (alpha < 0.001) return

      const nodeMap: Record<string, GraphNode> = {}
      for (const n of nodes) nodeMap[n.id] = n

      // Charge repulsion (simplified Barnes-Hut)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j]
          let dx = b.x - a.x, dy = b.y - a.y
          let dist = Math.sqrt(dx * dx + dy * dy) || 1
          if (dist < 1) dist = 1
          const repulse = -600 * alpha / (dist * dist)
          const fx = (dx / dist) * repulse
          const fy = (dy / dist) * repulse
          a.vx -= fx
          a.vy -= fy
          b.vx += fx
          b.vy += fy
        }
      }

      // Spring force on edges
      for (const e of edges) {
        const s = nodeMap[e.source], t = nodeMap[e.target]
        if (!s || !t) continue
        let dx = t.x - s.x, dy = t.y - s.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const targetLen = 120
        const force = (dist - targetLen) * 0.03 * alpha
        const fx = (dx / dist) * force
        const fy = (dy / dist) * force
        s.vx += fx
        s.vy += fy
        t.vx -= fx
        t.vy -= fy
      }

      // Center gravity
      for (const n of nodes) {
        n.vx -= n.x * 0.005 * alpha
        n.vy -= n.y * 0.005 * alpha
      }

      // Velocity damping + apply
      for (const n of nodes) {
        n.vx *= 0.6
        n.vy *= 0.6
        if (dragRef.current.nodeDrag?.id === n.id) continue
        n.x += n.vx
        n.y += n.vy
      }

      // Collision
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j]
          const dx = b.x - a.x, dy = b.y - a.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const minDist = a.radius + b.radius + 8
          if (dist < minDist) {
            const push = (minDist - dist) / 2
            const nx = dx / dist, ny = dy / dist
            a.x -= nx * push
            a.y -= ny * push
            b.x += nx * push
            b.y += ny * push
          }
        }
      }

      alphaRef.current *= 0.995
    }

    function render() {
      if (!ctx || !canvas) return
      const dpr = window.devicePixelRatio
      const w = canvas.width / dpr
      const h = canvas.height / dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Dark background
      ctx.fillStyle = "#0a0a0a"
      ctx.fillRect(0, 0, w, h)

      // Subtle radial glow at center
      const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.5)
      grad.addColorStop(0, "rgba(0, 212, 170, 0.015)")
      grad.addColorStop(1, "transparent")
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)

      const cam = cameraRef.current
      ctx.save()
      ctx.translate(w / 2 + cam.x, h / 2 + cam.y)
      ctx.scale(cam.zoom, cam.zoom)

      const nodes = nodesRef.current
      const edges = edgesRef.current
      const nodeMap: Record<string, GraphNode> = {}
      for (const n of nodes) nodeMap[n.id] = n

      // Filter by active category
      const visibleIds = new Set<string>()
      if (activeCategory) {
        for (const n of nodes) {
          if (CATEGORY_MAP[n.category] === activeCategory || n.category === activeCategory) {
            visibleIds.add(n.id)
          }
        }
        // Also show connected nodes
        for (const e of edges) {
          if (visibleIds.has(e.source)) visibleIds.add(e.target)
          if (visibleIds.has(e.target)) visibleIds.add(e.source)
        }
      } else {
        for (const n of nodes) visibleIds.add(n.id)
      }

      // Search filter
      const searchLower = searchQuery.toLowerCase()
      const searchIds = searchLower
        ? new Set(nodes.filter(n => n.label.toLowerCase().includes(searchLower) || n.description.toLowerCase().includes(searchLower)).map(n => n.id))
        : null

      // Edges
      for (let i = 0; i < edges.length; i++) {
        const e = edges[i]
        const s = nodeMap[e.source], t = nodeMap[e.target]
        if (!s || !t) continue
        if (!visibleIds.has(s.id) && !visibleIds.has(t.id)) continue
        const dimmed = searchIds && !searchIds.has(s.id) && !searchIds.has(t.id)
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(t.x, t.y)
        ctx.strokeStyle = dimmed ? "rgba(245, 240, 232, 0.01)" : "rgba(245, 240, 232, 0.035)"
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      // Particles
      tickRef.current++
      for (const p of particlesRef.current) {
        const e = edges[p.edge]
        if (!e) continue
        const s = nodeMap[e.source], t = nodeMap[e.target]
        if (!s || !t) continue
        if (!visibleIds.has(s.id) && !visibleIds.has(t.id)) continue
        p.t += p.speed
        if (p.t > 1) p.t -= 1
        const px = s.x + (t.x - s.x) * p.t
        const py = s.y + (t.y - s.y) * p.t
        ctx.beginPath()
        ctx.arc(px, py, 1.2, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(245, 240, 232, 0.2)"
        ctx.fill()
      }

      // Nodes
      for (const n of nodes) {
        if (!visibleIds.has(n.id)) continue
        const dimmed = searchIds && !searchIds.has(n.id)
        const isSelected = selectedNode?.id === n.id

        // Pulsing ring on selected
        if (isSelected) {
          const pulse = 1 + Math.sin(tickRef.current * 0.06) * 0.3
          ctx.beginPath()
          ctx.arc(n.x, n.y, n.radius * 2.2 * pulse, 0, Math.PI * 2)
          ctx.strokeStyle = "rgba(0, 212, 170, 0.3)"
          ctx.lineWidth = 1.5
          ctx.stroke()
        }

        // Node circle
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2)
        if (n.isHub) {
          ctx.fillStyle = dimmed ? "rgba(180, 150, 100, 0.2)" : "rgba(180, 150, 100, 0.72)"
        } else {
          ctx.fillStyle = dimmed ? "rgba(245, 240, 232, 0.15)" : "rgba(245, 240, 232, 0.55)"
        }
        ctx.fill()

        // Glow on hubs
        if (n.isHub && !dimmed) {
          ctx.beginPath()
          ctx.arc(n.x, n.y, n.radius + 4, 0, Math.PI * 2)
          ctx.strokeStyle = "rgba(180, 150, 100, 0.15)"
          ctx.lineWidth = 2
          ctx.stroke()
        }

        // Zoom-gated labels
        if (cam.zoom > 1.2 || (n.isHub && cam.zoom > 0.6)) {
          ctx.font = `${n.isHub ? 11 : 9}px "Geist Mono", monospace`
          ctx.fillStyle = dimmed ? "rgba(245, 240, 232, 0.15)" : "rgba(245, 240, 232, 0.6)"
          ctx.textAlign = "center"
          ctx.fillText(n.label.replace(".md", "").replace("/README", ""), n.x, n.y + n.radius + 14)
        }
      }

      ctx.restore()
      simulateForces()
      animFrameRef.current = requestAnimationFrame(render)
    }

    animFrameRef.current = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener("resize", resize)
    }
  // We intentionally don't include selectedNode/searchQuery/activeCategory in deps
  // to avoid recreating the animation loop. They're read from refs or closure.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNode, searchQuery, activeCategory])

  // Mouse handlers
  function screenToWorld(sx: number, sy: number) {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const cam = cameraRef.current
    const cx = sx - rect.left - rect.width / 2 - cam.x
    const cy = sy - rect.top - rect.height / 2 - cam.y
    return { x: cx / cam.zoom, y: cy / cam.zoom }
  }

  function findNodeAt(wx: number, wy: number): GraphNode | null {
    const nodes = nodesRef.current
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i]
      const dx = wx - n.x, dy = wy - n.y
      const hitR = Math.max(n.radius, 12)
      if (dx * dx + dy * dy < hitR * hitR) return n
    }
    return null
  }

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const { x, y } = screenToWorld(e.clientX, e.clientY)
    const node = findNodeAt(x, y)
    if (node) {
      dragRef.current = { isDragging: true, startX: e.clientX, startY: e.clientY, nodeDrag: node, panStartCamX: 0, panStartCamY: 0 }
    } else {
      dragRef.current = { isDragging: true, startX: e.clientX, startY: e.clientY, nodeDrag: null, panStartCamX: cameraRef.current.x, panStartCamY: cameraRef.current.y }
    }
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const d = dragRef.current
    if (!d.isDragging) return
    if (d.nodeDrag) {
      const { x, y } = screenToWorld(e.clientX, e.clientY)
      d.nodeDrag.x = x
      d.nodeDrag.y = y
      d.nodeDrag.vx = 0
      d.nodeDrag.vy = 0
      alphaRef.current = Math.max(alphaRef.current, 0.3)
    } else {
      const dx = e.clientX - d.startX
      const dy = e.clientY - d.startY
      cameraRef.current.x = d.panStartCamX + dx
      cameraRef.current.y = d.panStartCamY + dy
    }
  }, [])

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    const d = dragRef.current
    const movedDist = Math.abs(e.clientX - d.startX) + Math.abs(e.clientY - d.startY)
    if (movedDist < 5) {
      // It was a click
      const { x, y } = screenToWorld(e.clientX, e.clientY)
      const node = findNodeAt(x, y)
      if (node) {
        setSelectedNode(node)
        // Position popup near the node
        const canvas = canvasRef.current
        if (canvas) {
          const rect = canvas.getBoundingClientRect()
          const cam = cameraRef.current
          const px = node.x * cam.zoom + cam.x + rect.width / 2
          const py = node.y * cam.zoom + cam.y + rect.height / 2
          setPopupPos({ x: Math.min(px + 20, rect.width - 280), y: Math.min(py - 40, rect.height - 180) })
        }
      } else {
        setSelectedNode(null)
      }
    }
    dragRef.current = { isDragging: false, startX: 0, startY: 0, nodeDrag: null, panStartCamX: 0, panStartCamY: 0 }
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    cameraRef.current.zoom = Math.max(0.2, Math.min(5, cameraRef.current.zoom * delta))
  }, [])

  const connectionCount = (nodeId: string) => {
    return VAULT_EDGES.filter(e => e.source === nodeId || e.target === nodeId).length
  }

  return (
    <div className="flex h-full">
      {/* Graph Sidebar */}
      <div className="w-[240px] flex-shrink-0 border-r border-[#222] bg-[#0e0e0e] flex flex-col h-full overflow-hidden">
        <div className="px-3 py-3 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-2 mb-3">
            <Network className="w-4 h-4 text-[#00d4aa]" />
            <span className="font-mono text-xs font-bold tracking-wider text-[#00d4aa]">OPTX VAULT</span>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#444]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full bg-[#161616] border border-[#222] rounded-lg pl-8 pr-3 py-1.5 text-[12px] font-mono text-[#ccc] placeholder:text-[#444] outline-none focus:border-[#333]"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
          <button
            onClick={() => setActiveCategory(null)}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-mono transition-colors ${
              !activeCategory ? "bg-[#00d4aa]/10 text-[#00d4aa]" : "text-[#888] hover:text-[#ccc] hover:bg-[#161616]"
            }`}
          >
            <span>All Notes</span>
            <span className="text-[9px] text-[#555]">30</span>
          </button>
          {VAULT_CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-mono transition-colors ${
                activeCategory === cat.name ? "bg-[#00d4aa]/10 text-[#00d4aa]" : "text-[#888] hover:text-[#ccc] hover:bg-[#161616]"
              }`}
            >
              <span>{cat.name}</span>
              <span className="text-[9px] text-[#555]">{cat.count}</span>
            </button>
          ))}
        </div>
        <div className="px-3 py-2 border-t border-[#1a1a1a]">
          <span className="text-[9px] font-mono text-[#444]">30 notes · {VAULT_EDGES.length} connections</span>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative bg-[#0a0a0a] overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
        />

        {/* Zoom indicator */}
        <div className="absolute top-3 right-3 text-[9px] font-mono text-[#444] bg-[#111]/80 px-2 py-1 rounded">
          {(cameraRef.current.zoom * 100).toFixed(0)}% · scroll to zoom
        </div>

        {/* Selected node popup */}
        {selectedNode && (
          <div
            className="absolute z-10 w-[260px] bg-[#111] border border-[#333] rounded-xl p-4 shadow-2xl shadow-black/50"
            style={{ left: popupPos.x, top: popupPos.y }}
          >
            <button
              onClick={() => setSelectedNode(null)}
              className="absolute top-2 right-2 text-[#555] hover:text-[#999]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: selectedNode.isHub ? "rgba(180, 150, 100, 0.72)" : "rgba(245, 240, 232, 0.55)" }}
              />
              <span className="font-mono text-sm font-semibold text-[#eee] truncate">{selectedNode.label}</span>
            </div>
            <div className="text-[10px] font-mono text-[#00d4aa] mb-2">{CATEGORY_MAP[selectedNode.category] || selectedNode.category}</div>
            <p className="text-[12px] text-[#999] leading-relaxed mb-3">{selectedNode.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#555]">{connectionCount(selectedNode.id)} connections</span>
              <button className="text-[10px] font-mono text-[#00d4aa] hover:text-[#00eabb] transition-colors flex items-center gap-1">
                <FileText className="w-3 h-3" />
                Open note
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Sidebar ─────────────────────────────────────────────────
type SidebarView = "chat" | "status" | "mesh" | "arch" | "graph"

function Sidebar({
  activeView,
  onViewChange,
  isDark,
  toggleTheme,
  connected,
  isFounder,
  walletAddress,
  setWalletModalVisible,
  user,
  collapsed,
  onToggleCollapsed,
  chatSessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
}: {
  activeView: SidebarView
  onViewChange: (view: SidebarView) => void
  isDark: boolean
  toggleTheme: () => void
  connected: boolean
  isFounder: boolean
  walletAddress: string | null
  setWalletModalVisible: (v: boolean) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any
  collapsed: boolean
  onToggleCollapsed: () => void
  chatSessions: ChatSession[]
  activeSessionId: string | null
  onSelectSession: (id: string) => void
  onNewChat: () => void
}) {
  const navItems: { id: SidebarView; label: string; icon: React.ReactNode }[] = [
    { id: "chat", label: "Chat", icon: <MessageSquare className="w-4 h-4" /> },
    { id: "status", label: "Status", icon: <Activity className="w-4 h-4" /> },
    { id: "mesh", label: "Mesh", icon: <Network className="w-4 h-4" /> },
    { id: "arch", label: "Architecture", icon: <GitBranch className="w-4 h-4" /> },
    { id: "graph", label: "Knowledge Graph", icon: <Layers className="w-4 h-4" /> },
  ]

  return (
    <div
      className={`flex flex-col h-full bg-[#111] dark:bg-[#111] border-r border-[#222] dark:border-[#222] sidebar-transition flex-shrink-0 ${
        collapsed ? "w-[52px]" : "w-[220px]"
      }`}
    >
      {/* Logo + collapse */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-[#1a1a1a]">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full overflow-hidden border border-[#00d4aa]/30 flex-shrink-0">
              <img src="/astroknots-icon.jpg" alt="JOE" className="w-full h-full object-cover" />
            </div>
            <span className="font-mono text-sm font-bold text-[#00d4aa] tracking-wider">ASTROJOE</span>
          </div>
        )}
        <button
          onClick={onToggleCollapsed}
          className="p-1.5 rounded-md hover:bg-[#1a1a1a] text-[#555] hover:text-[#999] transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <Menu className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="px-2 py-2 space-y-0.5">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
              activeView === item.id
                ? "bg-[#00d4aa]/10 text-[#00d4aa]"
                : "text-[#888] hover:text-[#ccc] hover:bg-[#161616]"
            }`}
            title={collapsed ? item.label : undefined}
          >
            {item.icon}
            {!collapsed && <span className="font-mono text-[13px]">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* New Chat Button */}
      {!collapsed && (
        <div className="px-3 mt-2">
          <button
            onClick={() => { onNewChat(); onViewChange("chat") }}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full border border-[#333] text-[11px] font-mono text-[#888] hover:text-[#ccc] hover:border-[#555] transition-colors"
          >
            <Plus className="w-3 h-3" />
            New Chat
          </button>
        </div>
      )}

      {/* Recent Chat Sessions */}
      {!collapsed && chatSessions.length > 0 && (
        <div className="px-3 mt-3 flex-shrink-0 overflow-y-auto" style={{ maxHeight: "40%" }}>
          <div className="text-[9px] font-mono text-[#444] uppercase tracking-widest mb-2">RECENT</div>
          <div className="space-y-0.5">
            {(() => {
              const sorted = [...chatSessions].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
              const groups: Record<string, ChatSession[]> = {}
              for (const s of sorted) {
                const g = getDateGroup(s.createdAt)
                if (!groups[g]) groups[g] = []
                groups[g].push(s)
              }
              const order = ["Today", "Yesterday", "Earlier"]
              return order.map((group) => {
                const sessions = groups[group]
                if (!sessions || sessions.length === 0) return null
                return (
                  <div key={group}>
                    <div className="text-[8px] font-mono text-[#333] uppercase tracking-widest mt-1.5 mb-0.5 px-2">{group}</div>
                    {sessions.slice(0, 6).map((session) => (
                      <button
                        key={session.id}
                        onClick={() => { onSelectSession(session.id); onViewChange("chat") }}
                        className={`w-full text-left text-[11px] font-mono truncate px-2 py-1 rounded transition-colors ${
                          activeSessionId === session.id
                            ? "bg-[#00d4aa]/10 text-[#00d4aa]"
                            : "text-[#666] hover:bg-[#161616] hover:text-[#999]"
                        }`}
                        title={session.title}
                      >
                        <div className="truncate">{session.title}</div>
                        <div className="text-[8px] text-[#444]">
                          {session.createdAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
                        </div>
                      </button>
                    ))}
                  </div>
                )
              })
            })()}
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom: Theme + Wallet + User */}
      <div className="border-t border-[#1a1a1a] px-2 py-2 space-y-1">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[#888] hover:text-[#ccc] hover:bg-[#161616] transition-colors"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {!collapsed && <span className="font-mono text-[13px]">{isDark ? "Light Mode" : "Dark Mode"}</span>}
        </button>

        {/* Wallet */}
        {!collapsed && (
          <div className="px-1 py-1">
            <WalletConnectButton
              connected={connected}
              isFounder={isFounder}
              walletAddress={walletAddress}
              setWalletModalVisible={setWalletModalVisible}
            />
          </div>
        )}

        {/* User avatar */}
        {!collapsed && user && (
          <div className="flex items-center gap-2 px-2.5 py-1.5">
            <div className="w-6 h-6 rounded-full bg-[#222] flex items-center justify-center text-[10px] font-mono text-[#888]">
              {(user.firstName || user.username || "?")[0].toUpperCase()}
            </div>
            <span className="text-[11px] font-mono text-[#666] truncate">
              {user.firstName || user.username || "User"}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Chat Panel (main chat view) ─────────────────────────────
function ChatPanel({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  statusData,
  activeSessionId,
  onSessionMessage,
  sessionMessages,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  statusData: Record<string, any> | null
  activeSessionId: string | null
  onSessionMessage: (sessionId: string, msg: ChatMessage) => void
  sessionMessages: ChatMessage[]
}) {
  const { user } = useUser()
  const { publicKey, connected } = useWallet()
  const { setVisible: setWalletModalVisible } = useWalletModal()

  const walletAddress = publicKey?.toBase58() ?? null
  const isFounder = walletAddress === FOUNDER_WALLET
  const [commandMode, setCommandMode] = useState(false)
  const [jtxBalance, setJtxBalance] = useState<number | null>(null)
  const [jtxLoading, setJtxLoading] = useState(false)
  const [showVaultModal, setShowVaultModal] = useState(false)

  // Check JTX balance when wallet connects
  useEffect(() => {
    if (!walletAddress || isFounder) {
      setJtxBalance(isFounder ? Infinity : null)
      return
    }
    let cancelled = false
    setJtxLoading(true)
    getJTXBalance(walletAddress).then((bal) => {
      if (!cancelled) {
        setJtxBalance(bal)
        setJtxLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [walletAddress, isFounder])

  const hasJTX = isFounder || (jtxBalance !== null && jtxBalance >= JTX_MIN_BALANCE)
  const mode = (isFounder && commandMode) ? "dev" : "public"
  const channelName = (isFounder && commandMode) ? "astrojoe-dev" : "astrojoe"

  // Convex channel setup
  const channels = useQuery(api.messages.listChannels)
  const channel = channels?.find((c: { name: string }) => c.name === channelName) ?? null
  const convexMessages = useQuery(
    api.messages.listMessages,
    channel ? { channelId: channel._id, limit: 100 } : "skip"
  )
  const sendConvexMsg = useMutation(api.messages.sendMessage)

  // Local state
  const [input, setInput] = useState("")
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([])
  const [joeOnline, setJoeOnline] = useState(true)
  const [codeMode, setCodeMode] = useState(false)
  const [sending, setSending] = useState(false)
  const [attachments, setAttachments] = useState<{ name: string; type: string; content: string; preview?: string }[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Rotating placeholders
  const placeholders = [
    "Ask JOE anything...",
    "Type /status for system health",
    "Type /brain for architecture",
    "Analyze an image with Grok Vision",
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [placeholders.length])

  // Set joe online from statusData
  useEffect(() => {
    if (statusData) {
      setJoeOnline(statusData.online)
    }
  }, [statusData])

  // Handle file selection
  const handleFiles = useCallback((files: FileList | File[]) => {
    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith("image/")
      const isText = file.name.endsWith(".md") || file.name.endsWith(".markdown") || file.name.endsWith(".txt") || file.type === "text/plain" || file.type === "text/markdown"
      if (!isImage && !isText) return

      if (isImage) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const data = e.target?.result as string
          setAttachments((prev) => [
            ...prev,
            { name: file.name, type: "image", content: data, preview: data },
          ])
        }
        reader.readAsDataURL(file)
      } else {
        const reader = new FileReader()
        reader.onload = (e) => {
          const text = e.target?.result as string
          setAttachments((prev) => [
            ...prev,
            { name: file.name, type: "text", content: text },
          ])
        }
        reader.readAsText(file)
      }
    })
  }, [])

  // Clipboard paste handler
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return
    const pasteFiles: File[] = []
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/") || items[i].type === "text/plain" || items[i].type === "text/markdown") {
        const file = items[i].getAsFile()
        if (file) pasteFiles.push(file)
      }
    }
    if (pasteFiles.length > 0) {
      e.preventDefault()
      handleFiles(pasteFiles)
    }
  }, [handleFiles])

  // Drag-and-drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  // Build message list
  const messages: ChatMessage[] = [
    {
      id: "boot",
      sender: "SYSTEM",
      content: `AstroJOE v5.2 — ${mode === "dev" ? "COMMAND MODE" : "CHAT MODE"} · Grok 4.20`,
      type: "system",
      timestamp: Date.now() - 100000,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(convexMessages ?? []).map((m: any) => ({
      id: m._id,
      sender: m.displayName,
      content: m.content,
      type: m.messageType as ChatMessage["type"],
      timestamp: m.createdAt,
    })),
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
    if ((!trimmed && attachments.length === 0) || sending) return
    if (!user && !connected) return

    if (!hasJTX) {
      setShowVaultModal(true)
      return
    }

    const isSlashCommand = trimmed.startsWith("/")
    const baseContent = (codeMode && !isSlashCommand) ? "```\n" + trimmed + "\n```" : trimmed
    const attachmentLabel = attachments.length > 0
      ? `${attachments.map((a) => `[${a.type === "image" ? "🖼" : "📄"} ${a.name}]`).join(" ")}${trimmed ? "\n" : ""}`
      : ""
    const content = attachmentLabel + baseContent
    const now = Date.now()

    const userMsg: ChatMessage = {
      id: `local-${now}`,
      sender: user?.firstName || user?.username || (walletAddress ? `${walletAddress.slice(0,4)}...${walletAddress.slice(-4)}` : "user"),
      content: content || "[attachments]",
      type: mode === "dev" ? "dev" : "chat",
      timestamp: now,
    }
    setLocalMessages((prev) => [...prev, userMsg])
    if (activeSessionId) onSessionMessage(activeSessionId, userMsg)
    setInput("")
    setSending(true)
    if (inputRef.current) {
      inputRef.current.style.height = "auto"
    }

    try {
      if (channel) {
        await sendConvexMsg({
          channelId: channel._id,
          clerkUserId: user?.id || walletAddress || "wallet-user",
          displayName: user?.firstName || user?.username || (walletAddress ? `${walletAddress.slice(0,4)}...${walletAddress.slice(-4)}` : "user"),
          content,
          messageType: mode === "dev" ? "dev" : "chat",
        })
        setLocalMessages((prev) => prev.filter((m) => m.id !== userMsg.id))
      }

      const res = await fetch("/api/astrojoe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          mode,
          wallet: walletAddress,
          attachments: attachments.map((att) => ({
            type: att.type,
            content: att.content,
            name: att.name,
          })),
        }),
      })
      const data = await res.json()

      if (data.response) {
        const joeMsg: ChatMessage = {
          id: `joe-${Date.now()}`,
          sender: "JOE",
          content: data.response,
          type: data.type === "system" ? "system" : "joe",
          timestamp: Date.now(),
        }
        if (activeSessionId) onSessionMessage(activeSessionId, joeMsg)
        if (channel) {
          await sendConvexMsg({
            channelId: channel._id,
            clerkUserId: "joe-system",
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
      setAttachments([])
    }
  }, [input, user, sending, codeMode, mode, channel, sendConvexMsg, walletAddress, connected, attachments, hasJTX, activeSessionId, onSessionMessage])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      className={`flex flex-col h-full relative ${isDragOver ? "ring-2 ring-inset ring-[#00d4aa]/50" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-40 bg-[#00d4aa]/5 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-2 text-[#00d4aa]">
            <Paperclip className="w-8 h-8 animate-pulse" />
            <span className="text-sm">Drop files here</span>
            <span className="text-[10px] text-[#555]">Images, .md, .txt</span>
          </div>
        </div>
      )}

      {/* ── Top bar: mode toggle + JTX + status ── */}
      <div className="flex items-center justify-between px-4 h-11 border-b border-[#222] dark:border-[#222] flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Online indicator */}
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${joeOnline ? "bg-green-400" : "bg-red-400"}`} />
            <span className="text-[11px] font-mono text-[#666]">
              {joeOnline ? "Online" : "Offline"}
            </span>
          </div>

          {/* CHAT / CMD toggle (founder only) */}
          {isFounder && (
            <div className="flex items-center bg-[#0a0a0a] dark:bg-[#0a0a0a] border border-[#222] rounded-full p-0.5">
              <button
                onClick={() => setCommandMode(false)}
                className={`px-3 py-1 rounded-full text-[10px] font-mono font-medium transition-all ${
                  !commandMode
                    ? "bg-[#00d4aa]/15 text-[#00d4aa] border border-[#00d4aa]/30"
                    : "text-[#555] border border-transparent"
                }`}
              >
                CHAT
              </button>
              <button
                onClick={() => setCommandMode(true)}
                className={`px-3 py-1 rounded-full text-[10px] font-mono font-medium transition-all ${
                  commandMode
                    ? "bg-[#00d4aa]/15 text-[#00d4aa] border border-[#00d4aa]/30"
                    : "text-[#555] border border-transparent"
                }`}
              >
                CMD
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* JTX balance badge */}
          {connected && !isFounder && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono ${
              jtxLoading
                ? "bg-[#161616] text-[#555]"
                : hasJTX
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}>
              {jtxLoading ? (
                <SpinnerSVG className="w-3 h-3 animate-spin" />
              ) : hasJTX ? (
                <span>{jtxBalance === Infinity ? "∞" : jtxBalance?.toFixed(1)} JTX</span>
              ) : (
                <>
                  <Lock className="w-3 h-3" />
                  <span>0 JTX</span>
                </>
              )}
            </div>
          )}

          {/* Model badge */}
          <Badge className="bg-[#161616] dark:bg-[#161616] text-[#666] dark:text-[#666] border-[#222] dark:border-[#222] text-[9px] font-mono">
            Grok 4.20
          </Badge>
        </div>
      </div>

      {/* ── JTX Gate Banner ── */}
      {connected && !hasJTX && (
        <div
          className="mx-4 mt-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-center cursor-pointer"
          onClick={() => setShowVaultModal(true)}
        >
          <p className="text-sm text-red-400 font-medium">
            You need at least 1 JTX token to use AstroJOE.
          </p>
          <p className="text-xs text-red-400/70 mt-1">
            Visit{" "}
            <a href="https://astroknots.space" target="_blank" rel="noopener noreferrer" className="underline hover:text-red-300">
              astroknots.space
            </a>{" "}
            to get JTX.
          </p>
        </div>
      )}

      {/* ── Message Thread ── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto py-6 px-4 sm:px-8"
      >
        {messages.length <= 1 && !sending && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#00d4aa]/20 mb-4">
              <img src="/astroknots-icon.jpg" alt="JOE" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-lg font-mono font-semibold text-[#ccc] mb-1">AstroJOE</h2>
            <p className="text-sm text-[#555] max-w-md">
              Ask me about OPTX, the Agentic OS architecture, run system commands, or analyze images with Grok Vision.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <ChatBubble key={msg.id} msg={msg} />
        ))}

        {/* Thinking indicator */}
        {sending && (
          <div className="mb-6 animate-message-appear">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full overflow-hidden border border-[#00d4aa]/30 flex-shrink-0">
                <img src="/astroknots-icon.jpg" alt="JOE" className="w-full h-full object-cover" />
              </div>
              <span className="text-sm font-medium text-[#00d4aa]">JOE</span>
            </div>
            <div className="pl-8">
              <div className="flex items-center gap-2 text-[#666] text-sm mb-2">
                <ThinkingDots />
                <span className="text-xs text-[#555]">Thinking...</span>
              </div>
              <ActionBlock
                actions={[
                  "Querying AstroJOE Brain v5.2",
                  "Processing with Grok 4.20",
                ]}
                isLoading={true}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Attachment Strip ── */}
      {attachments.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 border-t border-[#222] dark:border-[#222] overflow-x-auto flex-shrink-0">
          {attachments.map((att, i) => (
            <div key={i} className="relative flex-shrink-0 group">
              {att.type === "image" && att.preview ? (
                <img
                  src={att.preview}
                  alt={att.name}
                  className="w-10 h-10 rounded-lg object-cover border border-[#333]"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg border border-[#333] bg-[#161616] flex flex-col items-center justify-center gap-0.5">
                  <FileText className="w-3.5 h-3.5 text-green-400/80" />
                  <span className="text-[6px] font-mono text-[#555] uppercase">
                    {att.name.split(".").pop()}
                  </span>
                </div>
              )}
              <button
                onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#333] text-[#ccc] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Input Area (pill-shaped) ── */}
      <div className="flex-shrink-0 px-4 pb-4 pt-2" style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 1rem)" }}>
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.md,.txt,.markdown"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files)
            e.target.value = ""
          }}
        />

        {/* Dev tool buttons */}
        {mode === "dev" && (
          <div className="flex items-center gap-1 px-2 py-1.5 mb-2">
            <button
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono transition-colors ${
                codeMode ? "bg-[#00d4aa]/15 text-[#00d4aa] border border-[#00d4aa]/30" : "text-[#555] hover:text-[#999] hover:bg-[#161616]"
              }`}
              onClick={() => setCodeMode(!codeMode)}
              title="Toggle code mode"
            >
              <Code2 className="w-3 h-3" />
              Code
            </button>
            <button
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono text-[#555] hover:text-[#999] hover:bg-[#161616] transition-colors"
              onClick={() => {
                if (!hasJTX) { setShowVaultModal(true); return }
                const url = window.prompt("Enter URL for JOE to browse:")
                if (url) {
                  setInput(`/browse ${url}`)
                  inputRef.current?.focus()
                }
              }}
            >
              <Globe className="w-3 h-3" />
              Browse
            </button>
            <button
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono text-[#555] hover:text-[#999] hover:bg-[#161616] transition-colors"
              onClick={() => {
                if (!hasJTX) { setShowVaultModal(true); return }
                setInput("/brain")
                inputRef.current?.focus()
              }}
            >
              <Brain className="w-3 h-3" />
              Brain
            </button>
            <span className="text-[9px] font-mono text-[#444] ml-auto hidden sm:inline">
              /execute /code /browse /brain /status /sandbox /search /research
            </span>
          </div>
        )}

        {/* Pill input */}
        <div
          className={`flex items-end gap-2 bg-[#161616] dark:bg-[#161616] border border-[#222] dark:border-[#222] rounded-[20px] px-3 py-2 transition-colors ${
            !hasJTX && connected ? "cursor-pointer opacity-60" : "focus-within:border-[#333]"
          }`}
          onClick={() => { if (!hasJTX && connected) setShowVaultModal(true) }}
        >
          {/* Attach button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (!hasJTX && connected) { setShowVaultModal(true); return }
              fileInputRef.current?.click()
            }}
            disabled={!hasJTX && connected}
            className={`flex-shrink-0 p-1.5 rounded-full transition-colors ${
              !hasJTX && connected
                ? "text-[#333] cursor-not-allowed"
                : attachments.length > 0 ? "text-[#00d4aa] bg-[#00d4aa]/10" : "text-[#555] hover:text-[#999] hover:bg-[#1a1a1a]"
            }`}
            title={!hasJTX && connected ? "Requires 1+ $JTX" : "Attach file"}
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Textarea */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={!hasJTX && connected ? "Hold at least 1 JTX to chat — Visit astroknots.space" : placeholders[placeholderIndex]}
            className="flex-1 bg-transparent text-[15px] text-[#eee] dark:text-[#eee] placeholder:text-[#444] outline-none caret-[#00d4aa] resize-none leading-relaxed"
            rows={1}
            disabled={(!user && !connected) || (!hasJTX && connected)}
            style={{ minHeight: "24px", maxHeight: "200px", overflow: "hidden" }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = "auto"
              target.style.height = Math.min(target.scrollHeight, 200) + "px"
            }}
          />

          {/* Send button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleSend()
            }}
            disabled={(!input.trim() && attachments.length === 0) || sending || (!user && !connected) || (!hasJTX && connected)}
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all animate-send-press ${
              input.trim() || attachments.length > 0
                ? "bg-[#00d4aa] text-black hover:bg-[#00c49a]"
                : "bg-[#222] text-[#555]"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Vault Modal ── */}
      {showVaultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowVaultModal(false)}>
          <div className="relative w-full max-w-sm mx-4 bg-[#111] border border-[#222] rounded-2xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowVaultModal(false)}
              className="absolute top-3 right-3 text-[#555] hover:text-[#999] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#00d4aa]/10 border border-[#00d4aa]/30 flex items-center justify-center">
                <Lock className="w-7 h-7 text-[#00d4aa]" />
              </div>
              <h3 className="text-lg font-semibold text-[#eee]">
                $JTX Required
              </h3>
              <p className="text-sm text-[#888] leading-relaxed">
                You need at least <span className="text-[#00d4aa] font-semibold">1 $JTX</span> token to unlock tools, commands, and advanced features.
              </p>
              <div className="bg-[#0a0a0a] rounded-xl p-3 border border-[#1a1a1a]">
                <p className="text-[10px] font-mono text-[#555] mb-1">Your balance</p>
                <p className="text-lg font-mono font-bold text-red-400">
                  {jtxBalance !== null ? `${jtxBalance.toFixed(4)} JTX` : "0 JTX"}
                </p>
                <p className="text-[10px] font-mono text-[#444] mt-1">Minimum required: 1.0000 JTX</p>
              </div>
              <a
                href="https://astroknots.space"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-[#00d4aa] hover:bg-[#00c49a] text-black text-sm font-semibold border border-[#00d4aa]/30 transition-all shadow-lg shadow-[#00d4aa]/20"
              >
                <Wallet className="w-4 h-4" />
                Get $JTX at Astro Knots Vault
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </a>
              <p className="text-[9px] font-mono text-[#444]">
                $JTX powers the OPTX ecosystem · Buy on Jupiter, Raydium, or Orca
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Wallet Gate Screen ─────────────────────────────────────
function WalletGateScreen() {
  const { publicKey, connected } = useWallet()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
  }, [])

  const phantomDeepLink = `https://phantom.app/ul/browse/${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "https://jettoptics.ai/astrojoe")}?ref=${encodeURIComponent("https://jettoptics.ai")}`

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden">
      {/* Subtle radial gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,212,170,0.04)_0%,_transparent_70%)]" />
      <div className="absolute inset-0" style={{
        backgroundImage: "linear-gradient(rgba(0,212,170,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,170,0.015) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }} />

      <div className="max-w-md mx-4 w-full relative z-10">
        <Card className="bg-[#111]/90 border-[#222] backdrop-blur-xl shadow-2xl shadow-[#00d4aa]/5">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-5">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#00d4aa]/30 shadow-lg shadow-[#00d4aa]/10">
                  <img
                    src="/astroknots-icon.jpg"
                    alt="AstroKnots"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#111] border-2 border-[#00d4aa]/40 flex items-center justify-center shadow-lg">
                  <Terminal className="w-3.5 h-3.5 text-[#00d4aa]" />
                </div>
              </div>
            </div>
            <CardTitle className="font-mono text-[#00d4aa] text-xl tracking-[0.15em]">
              ASTROJOE
            </CardTitle>
            <p className="text-xs font-mono text-[#555] mt-1.5">
              JOEclaw Terminal — OPTX Agentic OS
            </p>
          </CardHeader>
          <CardContent className="space-y-5 pt-2">
            <p className="text-sm text-[#888] text-center leading-relaxed">
              Connect your Solana wallet to access the terminal.
              <span className="block text-[#555] text-xs mt-1">Dev access requires authorized wallet.</span>
            </p>

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
                  className="flex items-center justify-center gap-2 w-full px-4 py-3.5 rounded-xl bg-[#00d4aa] hover:bg-[#00c49a] text-black font-mono text-sm border border-[#00d4aa]/30 transition-all shadow-lg shadow-[#00d4aa]/20"
                >
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
                      background: #00d4aa !important;
                      border: 1px solid rgba(0, 212, 170, 0.4) !important;
                      border-radius: 0.75rem !important;
                      font-family: "Geist Mono", ui-monospace, monospace !important;
                      font-size: 0.875rem !important;
                      font-weight: 600 !important;
                      padding: 0.875rem 1rem !important;
                      height: auto !important;
                      letter-spacing: 0.05em !important;
                      transition: all 0.2s !important;
                      box-shadow: 0 4px 20px rgba(0, 212, 170, 0.2) !important;
                      color: #000 !important;
                    }
                    .astrojoe-gate-wallet .wallet-adapter-button:hover {
                      background: #00c49a !important;
                      box-shadow: 0 4px 24px rgba(0, 212, 170, 0.35) !important;
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

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#333] to-transparent" />
              <span className="text-[10px] font-mono text-[#444] uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#333] to-transparent" />
            </div>

            <Link href="/optx-login" className="block">
              <Button
                variant="outline"
                className="w-full border-[#333] text-[#888] hover:text-[#ccc] hover:border-[#555] font-mono text-sm h-11 transition-all"
              >
                Sign in with OPTX Account
              </Button>
            </Link>

            {/* Supported wallets */}
            <div className="flex items-center justify-center gap-5 pt-3 pb-1">
              {[
                { name: "Phantom", color: "purple", icon: <svg width="18" height="18" viewBox="0 0 128 128" className="text-[#555] group-hover:text-purple-400 transition-colors"><path d="M110.6 57.4C110.6 30.4 88.1 8.4 61 8.4c-24.9 0-45.7 18.4-49.2 42.4-.3 2-.4 4.1-.4 6.2 0 3.5.4 6.9 1 10.2C16.7 92.8 36.7 112 61 112c2.6 0 5.1-.2 7.5-.6-.2-1.5-.3-3-.3-4.5 0-17.6 13.9-32 31.3-33.4 7.1-.6 11.1-6.2 11.1-12.3v-3.8z" fill="currentColor"/><circle cx="44" cy="55" r="7" fill="currentColor" opacity="0.3"/><circle cx="72" cy="55" r="7" fill="currentColor" opacity="0.3"/></svg> },
                { name: "Solflare", color: "orange", icon: <svg width="18" height="18" viewBox="0 0 24 24" className="text-[#555] group-hover:text-orange-400 transition-colors"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg> },
                { name: "Backpack", color: "red", icon: <svg width="16" height="16" viewBox="0 0 24 24" className="text-[#555] group-hover:text-red-400 transition-colors"><rect x="4" y="8" width="16" height="13" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M8 8V6a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/><line x1="4" y1="14" x2="20" y2="14" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="14" r="1.5" fill="currentColor"/></svg> },
                { name: "OKX", color: "zinc", icon: <span className="text-[10px] font-bold text-[#555] group-hover:text-[#ccc] transition-colors tracking-tight">OKX</span> },
              ].map((w) => (
                <div key={w.name} className="flex flex-col items-center gap-1.5 group cursor-default">
                  <div className={`w-9 h-9 rounded-xl bg-[#161616] border border-[#222] flex items-center justify-center group-hover:border-${w.color}-500/40 transition-all`}>
                    {w.icon}
                  </div>
                  <span className="text-[9px] font-mono text-[#444] group-hover:text-[#888] transition-colors">{w.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-[9px] font-mono text-[#444] mt-4">
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
  const { setVisible: setWalletModalVisible } = useWalletModal()

  const walletAddress = publicKey?.toBase58() ?? null
  const isFounder = walletAddress === FOUNDER_WALLET

  const { isDark, toggleTheme } = useTheme()
  const [activeView, setActiveView] = useState<SidebarView>("chat")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [statusData, setStatusData] = useState<Record<string, any> | null>(null)

  // Chat session management
  const [sessionState] = useState(() => {
    const id = `session-${Date.now()}`
    return {
      initialSessions: [{ id, title: "New conversation", messages: [] as ChatMessage[], createdAt: new Date() }],
      initialId: id,
    }
  })
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(sessionState.initialSessions)
  const [activeSessionId, setActiveSessionId] = useState<string>(sessionState.initialId)

  // Sync initial session id
  useEffect(() => {
    if (chatSessions.length > 0 && !chatSessions.find(s => s.id === activeSessionId)) {
      setActiveSessionId(chatSessions[0].id)
    }
  }, [chatSessions, activeSessionId])

  const handleNewChat = useCallback(() => {
    const newId = `session-${Date.now()}`
    setChatSessions((prev) => [
      { id: newId, title: "New conversation", messages: [], createdAt: new Date() },
      ...prev,
    ])
    setActiveSessionId(newId)
  }, [])

  const handleSelectSession = useCallback((id: string) => {
    setActiveSessionId(id)
  }, [])

  const handleSessionMessage = useCallback((sessionId: string, msg: ChatMessage) => {
    setChatSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s
        const updated = { ...s, messages: [...s.messages, msg] }
        // Update title from first user message
        if (s.title === "New conversation" && (msg.type === "chat" || msg.type === "dev")) {
          updated.title = msg.content.slice(0, 40) + (msg.content.length > 40 ? "..." : "")
        }
        return updated
      })
    )
  }, [])

  // Fetch status on mount and interval
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/astrojoe/status")
      const data = await res.json()
      setStatusData(data)
    } catch {
      setStatusData(null)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [fetchStatus])

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <SpinnerSVG className="w-8 h-8 text-[#00d4aa] animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#555]">Initializing...</p>
        </div>
      </div>
    )
  }

  // Not signed in AND no wallet connected → wallet gate
  if (!user && !connected) {
    return <WalletGateScreen />
  }

  return (
    <div className={`h-screen bg-[#0a0a0a] text-[#ccc] flex overflow-hidden ${!isDark ? "astrojoe-light" : ""}`}>
      <AnimationStyles />

      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        isDark={isDark}
        toggleTheme={toggleTheme}
        connected={connected}
        isFounder={isFounder}
        walletAddress={walletAddress}
        setWalletModalVisible={setWalletModalVisible}
        user={user}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed(!sidebarCollapsed)}
        chatSessions={chatSessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {activeView === "chat" && (
          <ChatPanel
            statusData={statusData}
            activeSessionId={activeSessionId}
            onSessionMessage={handleSessionMessage}
            sessionMessages={chatSessions.find(s => s.id === activeSessionId)?.messages || []}
          />
        )}
        {activeView === "status" && (
          <StatusDashboard statusData={statusData} onRefresh={fetchStatus} />
        )}
        {activeView === "mesh" && (
          <StatusDashboard statusData={statusData} onRefresh={fetchStatus} />
        )}
        {activeView === "arch" && (
          <ArchitecturePanel />
        )}
        {activeView === "graph" && (
          <KnowledgeGraphPanel />
        )}
      </main>
    </div>
  )
}
