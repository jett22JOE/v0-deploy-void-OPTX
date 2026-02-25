"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useUser } from "@clerk/nextjs"
import { useSearchParams } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Send, Globe, Wallet, MessageCircle, Activity, ExternalLink,
  ArrowLeft, Wifi, WifiOff, Copy, Check, Clock, Eye, Zap,
  Shield, Target, RefreshCw, ChevronRight, Hash, Pencil, User,
  Layers, CreditCard, ArrowRightLeft, Loader2
} from "lucide-react"
import Link from "next/link"

// On-chain addresses
const DEPIN_PROGRAM = "91SqqYLMi5zNsfMab6rnvipwJhDpN4FEMSLgu8F3bbGq"
const JTX_MINT = "9XpJiKEYzq5yDo5pJzRfjSRMPL2yPfDQXgiN7uYtBhUj"
const OPTX_MINT = "4r9WoPsRjJzrYEuj6VdwowVrFZaXpu16Qt6xogcmdUXC"
const CSTB_MINT = "4waAAfTjqf5LNpj2TC5zoeiAgegVwKWoy4WiJgjdBkVL"

const JOE_WS_URL = process.env.NEXT_PUBLIC_JOE_WS_URL || "wss://jettoptx-joe.taile11759.ts.net/ws"

// Founder-only gating — Clerk user ID + Solana wallet
const FOUNDER_USER_IDS = ["user_37RFcXc9CeZJYdDIPEWdiuiZXpb"]
const FOUNDER_WALLETS = [
  "FEUwuvXbbSYTCEhhqgAt2viTsEnromNNDsapoFvyfy3H", // founder wallet
  "EFvgELE1Hb4PC5tbPTAe8v1uEDGee8nwYBMCU42bZRGk", // jettoptx.skr / JOE agent wallet
]

type Tab = "jettchat" | "sessions" | "wallets"

interface ChatMessage {
  id: string
  role: "user" | "joe" | "system"
  content: string
  timestamp: number
  tensor?: string
  cstb_score?: number
  tools_used?: string[]
}

interface Session {
  id: string
  started: string
  duration: string
  frames: number
  agt: { cog: number; emo: number; env: number }
  status: "active" | "completed" | "paused"
  cstbAttested: boolean
  optxReward: number
}

export default function ConnectionsPage() {
  const { user, isLoaded } = useUser()
  const searchParams = useSearchParams()
  const initialTab = (searchParams.get("tab") as Tab) || "jettchat"
  const { publicKey: phantomKey, connected: phantomConnected } = useWallet()
  const { setVisible: setWalletModalVisible } = useWalletModal()

  // Founder gating — Clerk user ID (primary) + Solana wallet (secondary)
  const isFounder = (() => {
    const clerkMatch = FOUNDER_USER_IDS.includes(user?.id || "")
    const walletMatch = phantomKey ? FOUNDER_WALLETS.includes(phantomKey.toBase58()) : false
    return clerkMatch || walletMatch
  })()

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  useEffect(() => {
    const saved = localStorage.getItem('dojo-theme') as 'dark' | 'light' | null;
    if (saved) setTheme(saved);
    const handler = (e: Event) => setTheme((e as CustomEvent).detail);
    window.addEventListener('dojo-theme-change', handler);
    return () => window.removeEventListener('dojo-theme-change', handler);
  }, []);
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<Tab>(initialTab)
  const [wsStatus, setWsStatus] = useState<"connecting" | "connected" | "disconnected">("disconnected")
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState<string>("")
  const [isEditingName, setIsEditingName] = useState(false)
  const [nameInput, setNameInput] = useState("")

  // Wallet state — live data from JOE WebSocket
  const [walletBalances, setWalletBalances] = useState<{sol: number; optx: number; jtx: number; cstb: number; public_key?: string} | null>(null)
  const [agentMetadata, setAgentMetadata] = useState<Record<string, unknown> | null>(null)
  const [attestationStatus, setAttestationStatus] = useState<{attestation_count: number; progress_pct: number; status: string; threshold_for_trust: number; next_milestone: number} | null>(null)
  const [x402Policy, setX402Policy] = useState<Record<string, unknown> | null>(null)
  const [bridgeStatus, setBridgeStatus] = useState<{bridge?: Record<string, unknown>; supply?: Record<string, unknown>} | null>(null)
  const [walletLoading, setWalletLoading] = useState(false)

  const wsRef = useRef<WebSocket | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  const [sessions] = useState<Session[]>([
    {
      id: "sess_001",
      started: "2026-02-17 22:14",
      duration: "3m 22s",
      frames: 4890,
      agt: { cog: 42, emo: 31, env: 27 },
      status: "completed",
      cstbAttested: true,
      optxReward: 12.5,
    },
    {
      id: "sess_002",
      started: "2026-02-17 23:01",
      duration: "1m 48s",
      frames: 2160,
      agt: { cog: 35, emo: 40, env: 25 },
      status: "completed",
      cstbAttested: true,
      optxReward: 6.8,
    },
  ])

  // Pull display name from Clerk: username > firstName > email prefix > anonymous
  useEffect(() => {
    if (!user) return
    const saved = typeof window !== "undefined" ? localStorage.getItem("jettchat-displayname") : null
    if (saved) {
      setDisplayName(saved)
    } else {
      const clerkName = user.username || user.firstName || user.primaryEmailAddress?.emailAddress?.split("@")[0] || "anonymous"
      setDisplayName(clerkName)
    }
  }, [user])

  const startEditingName = () => {
    setNameInput(displayName)
    setIsEditingName(true)
    setTimeout(() => nameInputRef.current?.focus(), 50)
  }

  const saveDisplayName = () => {
    const trimmed = nameInput.trim()
    if (trimmed && trimmed.length <= 24) {
      setDisplayName(trimmed)
      localStorage.setItem("jettchat-displayname", trimmed)
    }
    setIsEditingName(false)
  }

  const resetToClerkName = () => {
    const clerkName = user?.username || user?.firstName || user?.primaryEmailAddress?.emailAddress?.split("@")[0] || "anonymous"
    setDisplayName(clerkName)
    localStorage.removeItem("jettchat-displayname")
    setIsEditingName(false)
  }

  // Request wallet data when wallets tab is active and WS is connected
  const requestWalletData = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
    setWalletLoading(true)
    wsRef.current.send(JSON.stringify({ type: "wallet_status" }))
    wsRef.current.send(JSON.stringify({ type: "wallet_metadata" }))
    wsRef.current.send(JSON.stringify({ type: "x402_policy" }))
    wsRef.current.send(JSON.stringify({ type: "bridge_status" }))
  }, [])

  // Auto-request wallet data when switching to wallets tab while connected
  useEffect(() => {
    if (activeTab === "wallets" && wsStatus === "connected") {
      requestWalletData()
    }
  }, [activeTab, wsStatus, requestWalletData])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  const connectWs = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return
    setWsStatus("connecting")
    const ws = new WebSocket(JOE_WS_URL)

    ws.onopen = () => {
      setWsStatus("connected")
      setChatMessages((prev) => [
        ...prev,
        { id: `sys_${Date.now()}`, role: "system", content: "Connected to JOE agent on edge compute node", timestamp: Date.now() },
      ])
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        // Route by message type — wallet messages go to state, chat goes to messages
        if (data.type === "wallet_status" && data.data) {
          setWalletBalances(data.data.balances || null)
          setAttestationStatus(data.data.attestation || null)
          setWalletLoading(false)
          return
        }
        if (data.type === "wallet_metadata" && data.data) {
          setAgentMetadata(data.data)
          return
        }
        if (data.type === "x402_policy" && data.data) {
          setX402Policy(data.data)
          return
        }
        if (data.type === "bridge_status" && data.data) {
          setBridgeStatus(data.data)
          return
        }

        // Default: chat message
        setChatMessages((prev) => [
          ...prev,
          {
            id: `joe_${Date.now()}`, role: "joe",
            content: data.content || data.response || event.data,
            timestamp: Date.now(), cstb_score: data.cstb_score,
            tools_used: data.tools_used, tensor: data.tensor,
          },
        ])
      } catch {
        setChatMessages((prev) => [...prev, { id: `joe_${Date.now()}`, role: "joe", content: event.data, timestamp: Date.now() }])
      }
    }

    ws.onclose = () => {
      setWsStatus("disconnected")
      reconnectRef.current = setTimeout(connectWs, 5000)
    }
    ws.onerror = () => setWsStatus("disconnected")
    wsRef.current = ws
  }, [])

  useEffect(() => {
    if (activeTab === "jettchat") connectWs()
    return () => { if (reconnectRef.current) clearTimeout(reconnectRef.current) }
  }, [activeTab, connectWs])

  useEffect(() => {
    return () => { wsRef.current?.close(); if (reconnectRef.current) clearTimeout(reconnectRef.current) }
  }, [])

  const sendMessage = () => {
    if (!chatInput.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
    setChatMessages((prev) => [...prev, { id: `user_${Date.now()}`, role: "user", content: chatInput, timestamp: Date.now() }])
    wsRef.current.send(JSON.stringify({
      type: "chat",
      user: displayName || "anonymous",
      content: chatInput,
    }))
    setChatInput("")
  }

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr)
    setCopiedAddress(addr)
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  const formatTime = (ts: number) => {
    const d = new Date(ts)
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (!isLoaded) {
    return (
      <div className={`fixed inset-0 ${isDark ? 'bg-black' : 'bg-white'} flex items-center justify-center`}>
        <p className={`${isDark ? 'text-orange-400' : 'text-orange-600'} text-xl font-mono animate-pulse`}>Loading Connections...</p>
      </div>
    )
  }

  const tabs: { key: Tab; label: string; icon: typeof Globe; color: string }[] = [
    { key: "jettchat", label: "JettChat", icon: Globe, color: "text-yellow-400" },
    { key: "sessions", label: "Sessions", icon: MessageCircle, color: "text-blue-400" },
    { key: "wallets", label: "Wallets", icon: Wallet, color: "text-orange-400" },
  ]

  const totalSessions = sessions.length
  const totalFrames = sessions.reduce((a, s) => a + s.frames, 0)
  const totalRewards = sessions.reduce((a, s) => a + s.optxReward, 0)

  return (
    <div className={`h-screen flex flex-col overflow-hidden bg-gradient-to-br ${isDark ? 'from-gray-900 via-slate-900 to-black' : 'from-orange-50/50 via-white to-zinc-50'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-2.5 border-b ${isDark ? 'border-orange-500/20 bg-black/40' : 'border-orange-200/30 bg-white/60'} backdrop-blur`}>
        <div className="flex items-center gap-3">
          <Link href="/dojo" className={`${isDark ? 'text-orange-400 hover:text-orange-300' : 'text-orange-600 hover:text-orange-500'} transition-colors`}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className={`w-8 h-8 rounded-lg ${isDark ? 'bg-red-500/20' : 'bg-red-100'} flex items-center justify-center`}>
            <Zap className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
          </div>
          <div>
            <h1 className={`font-mono text-sm ${isDark ? 'text-orange-400' : 'text-orange-800'} tracking-widest`}>CONNECTIONS</h1>
            <p className={`font-mono text-[9px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>EMO tensor branch</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {wsStatus === "connected" ? (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs flex items-center gap-1">
              <Wifi className="w-3 h-3" /> JOE Online
            </Badge>
          ) : wsStatus === "connecting" ? (
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
              <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Connecting...
            </Badge>
          ) : (
            <Badge className="bg-zinc-500/20 text-zinc-400 border-zinc-500/30 text-xs flex items-center gap-1">
              <WifiOff className="w-3 h-3" /> Offline
            </Badge>
          )}
        </div>
      </div>

      {/* Tab Bar */}
      <div className={`flex border-b ${isDark ? 'border-orange-500/15 bg-black/20' : 'border-orange-200/20 bg-white/40'} px-4`}>
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 font-mono text-xs transition-all border-b-2 ${
                activeTab === tab.key
                  ? isDark ? "text-orange-400 border-orange-500 bg-orange-500/5" : "text-orange-700 border-orange-500 bg-orange-50"
                  : isDark ? "text-zinc-500 border-transparent hover:text-orange-400/70 hover:bg-orange-500/5" : "text-zinc-400 border-transparent hover:text-orange-600 hover:bg-orange-50/50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-4">

        {/* ===================== JETTCHAT TAB ===================== */}
        {activeTab === "jettchat" && (
          <div className="h-full flex flex-col max-w-5xl mx-auto gap-3">
            {/* Status bar */}
            <div className="flex items-center gap-3">
              <Card className={`${isDark ? 'border-orange-500/20 bg-black/40' : 'border-orange-200/30 bg-white/60'} flex-1`}>
                <CardContent className="p-2.5 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${isDark ? 'bg-orange-500/20' : 'bg-orange-100'} flex items-center justify-center`}>
                    <Globe className={`w-4 h-4 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-mono text-xs ${isDark ? 'text-orange-300' : 'text-orange-800'}`}>JOE Agent Chat</p>
                    <p className={`font-mono text-[9px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>$OPTX Signature Testing via OPTX edge protocol</p>
                  </div>
                  <Badge className={`${isDark ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-orange-100 text-orange-700 border-orange-200/30'} text-[9px]`}>CSTB Protocol</Badge>
                </CardContent>
              </Card>
            </div>

            {/* Display Name Editor */}
            <Card className={`${isDark ? 'border-orange-500/15 bg-black/30' : 'border-orange-200/20 bg-white/50'}`}>
              <CardContent className="p-2 flex items-center gap-3">
                <User className={`w-3.5 h-3.5 ${isDark ? 'text-orange-400/60' : 'text-orange-400'}`} />
                {isEditingName ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      ref={nameInputRef}
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveDisplayName()
                        if (e.key === "Escape") setIsEditingName(false)
                      }}
                      maxLength={24}
                      placeholder="Enter display name..."
                      className={`flex-1 px-2 py-1 ${isDark ? 'bg-black/40 border-orange-500/30 text-orange-200 placeholder:text-zinc-600' : 'bg-white border-orange-300 text-zinc-900 placeholder:text-zinc-400'} border rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-orange-500/40`}
                    />
                    <Button size="sm" onClick={saveDisplayName} className="h-6 text-[9px] px-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30">
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={resetToClerkName} className="h-6 text-[9px] px-2 text-zinc-400 hover:text-orange-400">
                      Reset
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-1">
                    <span className={`font-mono text-xs ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>{displayName}</span>
                    <button onClick={startEditingName} className="p-1 hover:bg-orange-500/15 rounded transition-colors" title="Change display name">
                      <Pencil className="w-3 h-3 text-zinc-500 hover:text-orange-400" />
                    </button>
                    <span className="font-mono text-[9px] text-zinc-600 ml-auto">
                      {user?.username ? `@${user.username}` : "No Clerk username set"}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Chat area */}
            <Card className={`${isDark ? 'border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent' : 'border-orange-200/30 bg-white/60'} backdrop-blur flex-1 flex flex-col min-h-0`}>
              <CardContent className="flex-1 flex flex-col min-h-0 p-0">
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
                  {chatMessages.length === 0 && (
                    <div className="text-center py-16">
                      <div className={`w-20 h-20 rounded-full ${isDark ? 'bg-orange-500/10 border-orange-500/20' : 'bg-orange-100 border-orange-200'} border flex items-center justify-center mx-auto mb-4`}>
                        <Globe className={`w-10 h-10 ${isDark ? 'text-orange-500/30' : 'text-orange-400'}`} />
                      </div>
                      <p className={`${isDark ? 'text-orange-400/60' : 'text-orange-600'} font-mono text-sm mb-1`}>JOE Agent</p>
                      <p className={`${isDark ? 'text-zinc-500' : 'text-zinc-400'} font-mono text-xs max-w-md mx-auto`}>
                        Real-time AI chat via encrypted edge tunnel. Ask about CSTB attestation, $OPTX rewards, gaze analysis, or anything.
                      </p>
                      {wsStatus === "disconnected" && (
                        <Button onClick={connectWs} size="sm" className="mt-6 bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30 font-mono">
                          <Wifi className="w-3 h-3 mr-2" /> Connect to JOE
                        </Button>
                      )}
                    </div>
                  )}
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : msg.role === "system" ? "justify-center" : "justify-start"}`}>
                      <div className={`max-w-[80%] ${
                        msg.role === "user"
                          ? isDark ? "bg-orange-500/15 border border-orange-500/25 rounded-2xl rounded-br-md" : "bg-orange-100 border border-orange-200 rounded-2xl rounded-br-md"
                          : msg.role === "joe"
                            ? isDark ? "bg-zinc-800/60 border border-zinc-700/40 rounded-2xl rounded-bl-md" : "bg-zinc-100 border border-zinc-200 rounded-2xl rounded-bl-md"
                            : "bg-transparent"
                      } ${msg.role === "system" ? "" : "p-3"}`}>
                        {msg.role === "system" ? (
                          <p className="text-zinc-500 font-mono text-[10px] flex items-center gap-1">
                            <Hash className="w-3 h-3" /> {msg.content}
                          </p>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="font-mono text-[10px] font-bold" style={{ color: msg.role === "user" ? "#fb923c" : "#60a5fa" }}>
                                {msg.role === "user" ? displayName : "JOE"}
                              </span>
                              <span className="font-mono text-[9px] text-zinc-600">{formatTime(msg.timestamp)}</span>
                              {msg.tensor && (
                                <span className="text-xs">{msg.tensor === "COG" ? "\u{1F9E0}" : msg.tensor === "EMO" ? "\u{2764}\u{FE0F}" : "\u{1F30D}"}</span>
                              )}
                              {msg.cstb_score !== undefined && (
                                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[8px] h-4">
                                  CSTB {msg.cstb_score}
                                </Badge>
                              )}
                            </div>
                            <p className={`font-mono text-xs leading-relaxed ${isDark ? 'text-orange-100/80' : 'text-zinc-700'}`}>{msg.content}</p>
                            {msg.tools_used && msg.tools_used.length > 0 && (
                              <div className="mt-2 flex gap-1 flex-wrap">
                                {msg.tools_used.map((t) => (
                                  <Badge key={t} className="bg-green-500/10 text-green-400/70 border-green-500/20 text-[8px] h-4">
                                    {t}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                <Separator className="bg-orange-500/10" />

                <div className="p-3 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder={wsStatus === "connected" ? "Message JOE..." : "Connecting to JOE..."}
                    disabled={wsStatus !== "connected"}
                    className={`flex-1 px-4 py-2.5 ${isDark ? 'bg-black/40 border-orange-500/20 text-orange-200 placeholder:text-zinc-600' : 'bg-white border-orange-200 text-zinc-900 placeholder:text-zinc-400'} border rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-orange-500/40 disabled:opacity-40 transition-all`}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={wsStatus !== "connected" || !chatInput.trim()}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 border-0 rounded-xl h-10 px-5 disabled:opacity-30 transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ===================== SESSIONS TAB ===================== */}
        {activeTab === "sessions" && (
          <div className="max-w-5xl mx-auto space-y-4">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {[
                { label: "Total Sessions", value: totalSessions.toString(), icon: Activity, color: "orange" },
                { label: "Frames Processed", value: totalFrames.toLocaleString(), icon: Eye, color: "yellow" },
                { label: "$OPTX Earned", value: totalRewards.toFixed(1), icon: Zap, color: "green" },
                { label: "CSTB Attestations", value: sessions.filter(s => s.cstbAttested).length.toString(), icon: Shield, color: "purple" },
              ].map((stat) => {
                const Icon = stat.icon
                return (
                  <Card key={stat.label} className={`border-${stat.color}-500/20 bg-gradient-to-br from-${stat.color}-500/5 to-transparent`}>
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-${stat.color}-500/15 flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 text-${stat.color}-400`} />
                      </div>
                      <div>
                        <p className={`font-mono text-lg ${isDark ? 'text-white' : 'text-zinc-900'} font-bold`}>{stat.value}</p>
                        <p className={`font-mono text-[9px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{stat.label}</p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Start Training CTA */}
            <Card className={`${isDark ? 'border-green-500/20 bg-gradient-to-r from-green-500/10 to-emerald-500/5' : 'border-green-200/30 bg-green-50/60'}`}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${isDark ? 'bg-green-500/20' : 'bg-green-100'} flex items-center justify-center`}>
                    <Target className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                  </div>
                  <div>
                    <p className={`font-mono text-sm ${isDark ? 'text-green-300' : 'text-green-700'} font-semibold`}>Start New Training Session</p>
                    <p className={`font-mono text-[10px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Calibrate gaze biometrics for on-chain CSTB attestation</p>
                  </div>
                </div>
                <Link href="/dojo/training">
                  <Button className="bg-gradient-to-r from-green-500 to-emerald-600 border-0 font-mono text-xs h-9 px-5">
                    <Target className="w-3.5 h-3.5 mr-2" /> Start Training
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Session List */}
            <div>
              <h3 className={`font-mono text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'} uppercase tracking-wider mb-3`}>Session History</h3>
              <div className="space-y-3">
                {sessions.map((session) => (
                  <Card key={session.id} className={`${isDark ? 'border-orange-500/15 bg-gradient-to-br from-orange-500/5 to-transparent hover:border-orange-500/30' : 'border-orange-200/20 bg-white/60 hover:border-orange-300/40'} transition-colors`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center">
                            <Eye className="w-4 h-4 text-orange-400" />
                          </div>
                          <div>
                            <span className={`font-mono text-xs ${isDark ? 'text-orange-300' : 'text-orange-700'} font-semibold`}>{session.id}</span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Clock className="w-3 h-3 text-zinc-500" />
                              <span className="font-mono text-[9px] text-zinc-500">{session.started}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {session.cstbAttested && (
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[9px]">
                              <Shield className="w-3 h-3 mr-1" /> CSTB Verified
                            </Badge>
                          )}
                          <Badge className={`text-[9px] ${
                            session.status === "active"
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : session.status === "completed"
                                ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                          }`}>
                            {session.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                          <span className="font-mono text-[9px] text-zinc-500 block mb-1">Duration</span>
                          <span className={`font-mono text-xs ${isDark ? 'text-white' : 'text-zinc-900'}`}>{session.duration}</span>
                        </div>
                        <div>
                          <span className={`font-mono text-[9px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'} block mb-1`}>Frames</span>
                          <span className={`font-mono text-xs ${isDark ? 'text-white' : 'text-zinc-900'}`}>{session.frames.toLocaleString()}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="font-mono text-[9px] text-zinc-500 block mb-1">AGT Distribution</span>
                          <div className="flex items-center gap-2">
                            <div className={`flex-1 flex h-2 rounded-full overflow-hidden ${isDark ? 'bg-black/30' : 'bg-zinc-200/60'}`}>
                              <div style={{ width: `${session.agt.cog}%`, backgroundColor: "oklch(0.82 0.18 95)" }} className="transition-all" />
                              <div style={{ width: `${session.agt.emo}%`, backgroundColor: "oklch(0.65 0.25 25)" }} className="transition-all" />
                              <div style={{ width: `${session.agt.env}%`, backgroundColor: "oklch(0.60 0.20 250)" }} className="transition-all" />
                            </div>
                            <span className="font-mono text-[9px] text-zinc-400 whitespace-nowrap">
                              {session.agt.cog}/{session.agt.emo}/{session.agt.env}
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="font-mono text-[9px] text-zinc-500 block mb-1">$OPTX Reward</span>
                          <span className="font-mono text-xs text-green-400 font-semibold">+{session.optxReward}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================== WALLETS TAB ===================== */}
        {activeTab === "wallets" && (
          <div className="max-w-5xl mx-auto space-y-4">
            {/* JOE Agent Wallet — Founder Only */}
            {isFounder ? (
            <Card className={`${isDark ? 'border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-yellow-500/5' : 'border-orange-200/30 bg-white/60'} overflow-hidden relative`}>
              <div className={`absolute top-0 right-0 w-32 h-32 ${isDark ? 'bg-orange-500/5' : 'bg-orange-100/30'} rounded-full -translate-y-1/2 translate-x-1/2`} />
              <CardHeader className={`p-4 border-b ${isDark ? 'border-orange-500/15' : 'border-orange-200/20'}`}>
                <CardTitle className={`text-sm ${isDark ? 'text-orange-300' : 'text-orange-800'} font-semibold flex items-center gap-2`}>
                  <Wallet className="w-4 h-4" />
                  JOE Agent Wallet
                  <Badge className={`${isDark ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-orange-100 text-orange-700 border-orange-200/30'} text-[9px]`}>ERC-8004</Badge>
                  <Badge className={`ml-auto ${isDark ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-yellow-100 text-yellow-700 border-yellow-200/30'} text-[9px]`}>DEVNET</Badge>
                  <button onClick={requestWalletData} disabled={wsStatus !== "connected" || walletLoading} className="p-1 hover:bg-orange-500/15 rounded transition-colors disabled:opacity-30" title="Refresh balances">
                    <RefreshCw className={`w-3.5 h-3.5 text-orange-400 ${walletLoading ? "animate-spin" : ""}`} />
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* Agent public key */}
                {walletBalances?.public_key && (
                  <div className={`flex items-center gap-2 p-2 rounded-lg ${isDark ? 'bg-black/20 border-orange-500/10' : 'bg-zinc-50 border-orange-200/20'} border`}>
                    <span className={`font-mono text-[9px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Agent:</span>
                    <code className={`font-mono text-[10px] ${isDark ? 'text-orange-300/80' : 'text-orange-700'}`}>{walletBalances.public_key.slice(0, 8)}...{walletBalances.public_key.slice(-6)}</code>
                    <button onClick={() => copyAddress(walletBalances.public_key!)} className="p-0.5 hover:bg-orange-500/15 rounded">
                      {copiedAddress === walletBalances.public_key ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-zinc-500" />}
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-black/30 border-orange-500/10' : 'bg-zinc-50 border-orange-200/20'} border`}>
                    <p className="font-mono text-[9px] text-zinc-500 mb-1">SOL</p>
                    <p className="font-mono text-lg text-blue-400 font-bold">{walletBalances ? walletBalances.sol.toFixed(4) : "—"}</p>
                    <p className="font-mono text-[9px] text-zinc-600">Devnet</p>
                  </div>
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-black/30 border-orange-500/10' : 'bg-zinc-50 border-orange-200/20'} border`}>
                    <p className="font-mono text-[9px] text-zinc-500 mb-1">$OPTX</p>
                    <p className="font-mono text-lg text-orange-400 font-bold">{walletBalances ? walletBalances.optx.toFixed(2) : "—"}</p>
                    <p className="font-mono text-[9px] text-zinc-600">Governance</p>
                  </div>
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-black/30 border-orange-500/10' : 'bg-zinc-50 border-orange-200/20'} border`}>
                    <p className="font-mono text-[9px] text-zinc-500 mb-1">$JTX</p>
                    <p className="font-mono text-lg text-yellow-400 font-bold">{walletBalances ? walletBalances.jtx.toFixed(2) : "—"}</p>
                    <p className="font-mono text-[9px] text-zinc-600">Utility</p>
                  </div>
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-black/30 border-orange-500/10' : 'bg-zinc-50 border-orange-200/20'} border`}>
                    <p className="font-mono text-[9px] text-zinc-500 mb-1">$CSTB</p>
                    <p className="font-mono text-lg text-purple-400 font-bold">{walletBalances ? walletBalances.cstb.toFixed(0) : "—"}</p>
                    <p className="font-mono text-[9px] text-zinc-600">Soulbound</p>
                  </div>
                </div>

                {wsStatus !== "connected" && !walletBalances && (
                  <div className="text-center py-3">
                    <p className="font-mono text-[10px] text-zinc-500 mb-2">Connect to JOE to load live balances</p>
                    <Button onClick={connectWs} size="sm" className="bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30 font-mono text-xs">
                      <Wifi className="w-3 h-3 mr-2" /> Connect
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            ) : (
              <Card className={`${isDark ? 'border-zinc-500/20 bg-gradient-to-br from-zinc-500/5 to-zinc-800/5' : 'border-zinc-200 bg-white/60'}`}>
                <CardContent className="p-6 text-center">
                  <Shield className={`w-8 h-8 ${isDark ? 'text-zinc-500' : 'text-zinc-400'} mx-auto mb-3`} />
                  <p className={`font-mono text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'} mb-1`}>Agent Wallet — Restricted</p>
                  <p className={`font-mono text-[10px] ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>JOE&apos;s internal wallet data is only visible to authorized administrators.</p>
                </CardContent>
              </Card>
            )}

            {/* User Phantom Wallet — visible to ALL users */}
            <Card className={`${isDark ? 'border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-indigo-500/5' : 'border-blue-200/30 bg-white/60'}`}>
              <CardHeader className={`p-4 border-b ${isDark ? 'border-blue-500/15' : 'border-blue-200/20'}`}>
                <CardTitle className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'} font-semibold flex items-center gap-2`}>
                  <Wallet className="w-4 h-4" />
                  Your Wallet
                  {phantomConnected && <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[9px]">Connected</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {phantomConnected && phantomKey ? (
                  <div className={`flex items-center gap-2 p-2.5 rounded-lg ${isDark ? 'bg-black/20 border-blue-500/10' : 'bg-zinc-50 border-blue-200/20'} border`}>
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Wallet className="w-3 h-3 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className={`font-mono text-[10px] ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>Phantom</p>
                      <code className="font-mono text-[9px] text-zinc-400">{phantomKey.toBase58().slice(0, 8)}...{phantomKey.toBase58().slice(-6)}</code>
                    </div>
                    <button onClick={() => copyAddress(phantomKey.toBase58())} className="p-1 hover:bg-blue-500/15 rounded">
                      {copiedAddress === phantomKey.toBase58() ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-zinc-500" />}
                    </button>
                    <a
                      href={`https://explorer.solana.com/address/${phantomKey.toBase58()}?cluster=devnet`}
                      target="_blank" rel="noopener noreferrer"
                      className="p-1 hover:bg-blue-500/15 rounded"
                    >
                      <ExternalLink className="w-3 h-3 text-zinc-500" />
                    </a>
                  </div>
                ) : (
                  <Button
                    onClick={() => setWalletModalVisible(true)}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 border-0 font-mono text-sm h-10"
                  >
                    <Wallet className="w-4 h-4 mr-2" /> Connect Phantom / OKX
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* x402 Payment Policy — Founder Only */}
            {isFounder && (
            <Card className={`${isDark ? 'border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5' : 'border-green-200/30 bg-white/60'}`}>
              <CardHeader className={`p-4 border-b ${isDark ? 'border-green-500/15' : 'border-green-200/20'}`}>
                <CardTitle className={`text-sm ${isDark ? 'text-green-300' : 'text-green-700'} font-semibold flex items-center gap-2`}>
                  <CreditCard className="w-4 h-4" />
                  x402 Payment Policy
                  <Badge className={`ml-auto ${isDark ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-100 text-green-700 border-green-200/30'} text-[9px]`}>HTTP 402</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {x402Policy ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {Object.entries((x402Policy as Record<string, unknown>).services as Record<string, {description: string; price: number; unit: string; per: string}> || {}).map(([key, svc]) => (
                        <div key={key} className={`p-2.5 rounded-lg ${isDark ? 'bg-black/20 border-green-500/10 hover:border-green-500/25' : 'bg-zinc-50 border-green-200/20 hover:border-green-300/40'} border transition-colors`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className={`font-mono text-[10px] ${isDark ? 'text-green-300' : 'text-green-700'} font-semibold`}>{key.replace(/_/g, " ")}</span>
                            <span className={`font-mono text-[10px] ${isDark ? 'text-green-400' : 'text-green-600'} font-bold`}>{svc.price} {svc.unit}/{svc.per}</span>
                          </div>
                          <p className="font-mono text-[9px] text-zinc-500">{svc.description}</p>
                        </div>
                      ))}
                    </div>
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-black/20 border-green-500/10' : 'bg-zinc-50 border-green-200/20'} border`}>
                      <p className={`font-mono text-[9px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        <span className={`${isDark ? 'text-green-400' : 'text-green-600'}`}>Free tier:</span> {((x402Policy as Record<string, unknown>).free_tier as Record<string, unknown>)?.chat_messages as number || 10} chat messages + {((x402Policy as Record<string, unknown>).free_tier as Record<string, unknown>)?.gaze_sessions as number || 1} gaze session
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="font-mono text-[10px] text-zinc-500 text-center py-3">
                    {wsStatus === "connected" ? <><Loader2 className="w-3 h-3 inline mr-1 animate-spin" /> Loading policy...</> : "Connect to JOE to view payment policy"}
                  </p>
                )}
              </CardContent>
            </Card>

            )}

            {/* LayerZero Bridge Status — Founder Only */}
            {isFounder && (
            <Card className={`${isDark ? 'border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-500/5' : 'border-cyan-200/30 bg-white/60'}`}>
              <CardHeader className={`p-4 border-b ${isDark ? 'border-cyan-500/15' : 'border-cyan-200/20'}`}>
                <CardTitle className={`text-sm ${isDark ? 'text-cyan-300' : 'text-cyan-700'} font-semibold flex items-center gap-2`}>
                  <ArrowRightLeft className="w-4 h-4" />
                  LayerZero Bridge
                  {bridgeStatus?.bridge && (
                    <Badge className="ml-auto bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-[9px]">
                      {(bridgeStatus.bridge as Record<string, unknown>).status as string || "unknown"}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {bridgeStatus ? (
                  <>
                    {bridgeStatus.supply && (
                      <div className={`p-2.5 rounded-lg ${isDark ? 'bg-black/20 border-cyan-500/10' : 'bg-zinc-50 border-cyan-200/20'} border`}>
                        <div className="flex items-center justify-between">
                          <span className={`font-mono text-[10px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>OPTX Supply (Solana)</span>
                          <span className={`font-mono text-sm ${isDark ? 'text-cyan-400' : 'text-cyan-600'} font-bold`}>{(bridgeStatus.supply as Record<string, unknown>).supply as number || 0}</span>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {((bridgeStatus.bridge as Record<string, unknown>)?.supported_chains as Array<{chain: string; network: string; status: string; endpoint_id: number}> || []).map((chain) => (
                        <div key={chain.chain} className={`p-2 rounded-lg ${isDark ? 'bg-black/20 border-cyan-500/10' : 'bg-zinc-50 border-cyan-200/20'} border text-center`}>
                          <p className={`font-mono text-[10px] ${isDark ? 'text-cyan-300' : 'text-cyan-700'} font-semibold`}>{chain.chain}</p>
                          <p className="font-mono text-[9px] text-zinc-500">{chain.network}</p>
                          <Badge className={`mt-1 text-[8px] h-4 ${chain.status === "active" ? "bg-green-500/15 text-green-400 border-green-500/25" : "bg-zinc-500/15 text-zinc-400 border-zinc-500/25"}`}>
                            {chain.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    {bridgeStatus.bridge && (
                      <div className={`p-2 rounded-lg ${isDark ? 'bg-black/20 border-cyan-500/10' : 'bg-zinc-50 border-cyan-200/20'} border`}>
                        <p className={`font-mono text-[9px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                          OFT Standard • Min: {((bridgeStatus.bridge as Record<string, unknown>).bridge_config as Record<string, unknown>)?.min_bridge_amount as number || 1} OPTX • Fee: {((bridgeStatus.bridge as Record<string, unknown>).bridge_config as Record<string, unknown>)?.bridge_fee_pct as number || 0.1}% • Est: {((bridgeStatus.bridge as Record<string, unknown>).bridge_config as Record<string, unknown>)?.estimated_time_seconds as number || 120}s
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="font-mono text-[10px] text-zinc-500 text-center py-3">
                    {wsStatus === "connected" ? <><Loader2 className="w-3 h-3 inline mr-1 animate-spin" /> Loading bridge status...</> : "Connect to JOE to view bridge status"}
                  </p>
                )}
              </CardContent>
            </Card>

            )}

            {/* CSTB Profile — Founder Only */}
            {isFounder && (
            <Card className={`${isDark ? 'border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5' : 'border-purple-200/30 bg-white/60'}`}>
              <CardHeader className={`p-4 border-b ${isDark ? 'border-purple-500/15' : 'border-purple-200/20'}`}>
                <CardTitle className={`text-sm ${isDark ? 'text-purple-300' : 'text-purple-700'} font-semibold flex items-center gap-2`}>
                  <Shield className="w-4 h-4" />
                  CSTB Identity Profile
                  <Badge className={`ml-auto ${isDark ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-purple-100 text-purple-700 border-purple-200/30'} text-[9px]`}>CompuStable</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <p className={`font-mono text-[10px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'} leading-relaxed`}>
                  JOE Agent Wallet includes CSTB profile URI in <code className={`${isDark ? 'text-purple-400 bg-purple-500/10' : 'text-purple-600 bg-purple-100'} px-1 rounded`}>agentMetadata()</code>.
                  Computational identity verified via proof hash + gaze attestation on Solana devnet.
                </p>

                {/* Attestation Status — Live from WebSocket */}
                <div className={`p-3 rounded-lg ${isDark ? 'bg-black/30 border-purple-500/15' : 'bg-zinc-50 border-purple-200/20'} border`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-mono text-xs ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>Attestation Progress</span>
                    <span className={`font-mono text-[10px] ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                      {attestationStatus ? `${attestationStatus.attestation_count} / ${attestationStatus.threshold_for_trust} required` : "2 / 5 required"}
                    </span>
                  </div>
                  <Progress value={attestationStatus ? attestationStatus.progress_pct : 40} className={`h-2 ${isDark ? 'bg-black/30' : 'bg-zinc-200'}`} />
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-mono text-[9px] text-zinc-500">Status: <span className={attestationStatus?.status === "trusted" ? "text-green-400" : "text-yellow-400"}>{attestationStatus?.status || "building_trust"}</span></span>
                    {attestationStatus && attestationStatus.next_milestone > 0 && (
                      <span className="font-mono text-[9px] text-zinc-500">{attestationStatus.next_milestone} more needed</span>
                    )}
                  </div>
                </div>

                {/* Agent Metadata from ERC-8004 */}
                {agentMetadata && (
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-black/20 border-purple-500/10' : 'bg-zinc-50 border-purple-200/20'} border`}>
                    <p className={`font-mono text-[9px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'} uppercase tracking-wider mb-2`}>ERC-8004 Agent Identity</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="font-mono text-[9px] text-zinc-500">Agent</span>
                        <p className={`font-mono text-[10px] ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>{(agentMetadata.identity as Record<string, unknown>)?.name as string || "JOE"}</p>
                      </div>
                      <div>
                        <span className={`font-mono text-[9px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Soulbound</span>
                        <p className={`font-mono text-[10px] ${isDark ? 'text-green-400' : 'text-green-600'}`}>{(agentMetadata.identity as Record<string, unknown>)?.soulbound ? "Yes" : "No"}</p>
                      </div>
                      <div>
                        <span className={`font-mono text-[9px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Signing</span>
                        <p className={`font-mono text-[10px] ${isDark ? 'text-orange-300' : 'text-orange-600'}`}>{(agentMetadata.signing as Record<string, unknown>)?.method as string || "deferred"}</p>
                      </div>
                      <div>
                        <span className={`font-mono text-[9px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Capabilities</span>
                        <p className={`font-mono text-[10px] ${isDark ? 'text-cyan-300' : 'text-cyan-600'}`}>{(agentMetadata.capabilities as string[])?.length || 0}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* On-Chain Addresses */}
                <div>
                  <h4 className={`font-mono text-[10px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'} uppercase tracking-wider mb-2`}>On-Chain Addresses</h4>
                  <div className="space-y-1.5">
                    {[
                      { label: "DePIN Program", addr: DEPIN_PROGRAM, net: "devnet", icon: Zap },
                      { label: "$OPTX Mint", addr: OPTX_MINT, net: "devnet", icon: Target },
                      { label: "$JTX Mint", addr: JTX_MINT, net: "mainnet", icon: Shield },
                      { label: "$CSTB Mint", addr: CSTB_MINT, net: "devnet", icon: Hash },
                    ].map((item) => {
                      const Icon = item.icon
                      return (
                        <div key={item.label} className={`flex items-center justify-between p-2.5 rounded-lg ${isDark ? 'bg-black/20 border-purple-500/10 hover:border-purple-500/25' : 'bg-zinc-50 border-purple-200/20 hover:border-purple-300/40'} border transition-colors`}>
                          <div className="flex items-center gap-2.5">
                            <Icon className={`w-3.5 h-3.5 ${isDark ? 'text-purple-400/60' : 'text-purple-400'}`} />
                            <span className={`font-mono text-[10px] ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>{item.label}</span>
                            <Badge className={`text-[8px] h-4 ${
                              item.net === "mainnet"
                                ? "bg-green-500/15 text-green-400 border-green-500/25"
                                : "bg-yellow-500/15 text-yellow-400 border-yellow-500/25"
                            }`}>
                              {item.net}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <code className={`font-mono text-[9px] ${isDark ? 'text-purple-300/80 bg-purple-500/5' : 'text-purple-600 bg-purple-50'} px-1.5 py-0.5 rounded`}>
                              {item.addr.slice(0, 6)}...{item.addr.slice(-4)}
                            </code>
                            <button onClick={() => copyAddress(item.addr)} className="p-1 hover:bg-purple-500/15 rounded transition-colors">
                              {copiedAddress === item.addr ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-zinc-500 hover:text-zinc-300" />}
                            </button>
                            <a
                              href={`https://explorer.solana.com/address/${item.addr}?cluster=${item.net === "mainnet" ? "mainnet-beta" : "devnet"}`}
                              target="_blank" rel="noopener noreferrer"
                              className="p-1 hover:bg-purple-500/15 rounded transition-colors"
                            >
                              <ExternalLink className="w-3 h-3 text-zinc-500 hover:text-zinc-300" />
                            </a>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            )}

            {/* Protocol Footer */}
            <div className="text-center py-2">
              <p className="font-mono text-[9px] text-zinc-600">
                JTX-CSTB Trust DePIN Protocol | Min gaze: 222cs | AGT weights: COG+EMO+ENV = 10,000 | Reward: 60% Provider / 30% Client / 10% Protocol
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
