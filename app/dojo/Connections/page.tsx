"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useUser } from "@clerk/nextjs"
import { useSearchParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Send, Globe, Wallet, MessageCircle, Activity, ExternalLink,
  ArrowLeft, Wifi, WifiOff, Copy, Check, Clock, Eye, Zap,
  Shield, Target, RefreshCw, ChevronRight, Hash, Pencil, User
} from "lucide-react"
import Link from "next/link"

// On-chain addresses
const DEPIN_PROGRAM = "91SqqYLMi5zNsfMab6rnvipwJhDpN4FEMSLgu8F3bbGq"
const JTX_MINT = "9XpJiKEYzq5yDo5pJzRfjSRMPL2yPfDQXgiN7uYtBhUj"
const OPTX_MINT = "4r9WoPsRjJzrYEuj6VdwowVrFZaXpu16Qt6xogcmdUXC"
const CSTB_MINT = "4waAAfTjqf5LNpj2TC5zoeiAgegVwKWoy4WiJgjdBkVL"

const JOE_WS_URL = "wss://joe-ws.jettoptics.ai/ws/joe"

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

  const [activeTab, setActiveTab] = useState<Tab>(initialTab)
  const [wsStatus, setWsStatus] = useState<"connecting" | "connected" | "disconnected">("disconnected")
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState<string>("")
  const [isEditingName, setIsEditingName] = useState(false)
  const [nameInput, setNameInput] = useState("")
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
        { id: `sys_${Date.now()}`, role: "system", content: "Connected to JOE agent on Jetson Orin Nano via Tailscale Funnel", timestamp: Date.now() },
      ])
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
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
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <p className="text-orange-400 text-xl font-mono animate-pulse">Loading Connections...</p>
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
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-orange-500/20 bg-black/40 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link href="/dojo" className="text-orange-400 hover:text-orange-300 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
            <Zap className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <h1 className="font-mono text-sm text-orange-400 tracking-widest">CONNECTIONS</h1>
            <p className="font-mono text-[9px] text-zinc-500">EMO tensor branch</p>
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
      <div className="flex border-b border-orange-500/15 px-4 bg-black/20">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 font-mono text-xs transition-all border-b-2 ${
                activeTab === tab.key
                  ? "text-orange-400 border-orange-500 bg-orange-500/5"
                  : "text-zinc-500 border-transparent hover:text-orange-400/70 hover:bg-orange-500/5"
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
              <Card className="border-orange-500/20 bg-black/40 flex-1">
                <CardContent className="p-2.5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-mono text-xs text-orange-300">JOE Agent Chat</p>
                    <p className="font-mono text-[9px] text-zinc-500">$OPTX Signature Testing via hedgehog-spacetime MCP</p>
                  </div>
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-[9px]">CSTB Protocol</Badge>
                </CardContent>
              </Card>
            </div>

            {/* Display Name Editor */}
            <Card className="border-orange-500/15 bg-black/30">
              <CardContent className="p-2 flex items-center gap-3">
                <User className="w-3.5 h-3.5 text-orange-400/60" />
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
                      className="flex-1 px-2 py-1 bg-black/40 border border-orange-500/30 rounded text-orange-200 text-xs font-mono placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-orange-500/40"
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
                    <span className="font-mono text-xs text-orange-300">{displayName}</span>
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
            <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent backdrop-blur flex-1 flex flex-col min-h-0">
              <CardContent className="flex-1 flex flex-col min-h-0 p-0">
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
                  {chatMessages.length === 0 && (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-4">
                        <Globe className="w-10 h-10 text-orange-500/30" />
                      </div>
                      <p className="text-orange-400/60 font-mono text-sm mb-1">JOE Agent</p>
                      <p className="text-zinc-500 font-mono text-xs max-w-md mx-auto">
                        Real-time AI chat via Tailscale Funnel. Ask about CSTB attestation, $OPTX rewards, gaze analysis, or anything.
                      </p>
                      {wsStatus === "disconnected" && (
                        <Button onClick={connectWs} size="sm" className="mt-6 bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30 font-mono">
                          <Wifi className="w-3 h-3 mr-2" /> Connect to Jetson
                        </Button>
                      )}
                    </div>
                  )}
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : msg.role === "system" ? "justify-center" : "justify-start"}`}>
                      <div className={`max-w-[80%] ${
                        msg.role === "user"
                          ? "bg-orange-500/15 border border-orange-500/25 rounded-2xl rounded-br-md"
                          : msg.role === "joe"
                            ? "bg-zinc-800/60 border border-zinc-700/40 rounded-2xl rounded-bl-md"
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
                            <p className="font-mono text-xs leading-relaxed text-orange-100/80">{msg.content}</p>
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
                    placeholder={wsStatus === "connected" ? "Message JOE..." : "Connecting to Jetson..."}
                    disabled={wsStatus !== "connected"}
                    className="flex-1 px-4 py-2.5 bg-black/40 border border-orange-500/20 rounded-xl text-orange-200 text-xs font-mono placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-orange-500/40 disabled:opacity-40 transition-all"
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
                        <p className="font-mono text-lg text-white font-bold">{stat.value}</p>
                        <p className="font-mono text-[9px] text-zinc-500">{stat.label}</p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Start Training CTA */}
            <Card className="border-green-500/20 bg-gradient-to-r from-green-500/10 to-emerald-500/5">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Target className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="font-mono text-sm text-green-300 font-semibold">Start New Training Session</p>
                    <p className="font-mono text-[10px] text-zinc-500">Calibrate gaze biometrics for on-chain CSTB attestation</p>
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
              <h3 className="font-mono text-xs text-zinc-500 uppercase tracking-wider mb-3">Session History</h3>
              <div className="space-y-3">
                {sessions.map((session) => (
                  <Card key={session.id} className="border-orange-500/15 bg-gradient-to-br from-orange-500/5 to-transparent hover:border-orange-500/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center">
                            <Eye className="w-4 h-4 text-orange-400" />
                          </div>
                          <div>
                            <span className="font-mono text-xs text-orange-300 font-semibold">{session.id}</span>
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
                          <span className="font-mono text-xs text-white">{session.duration}</span>
                        </div>
                        <div>
                          <span className="font-mono text-[9px] text-zinc-500 block mb-1">Frames</span>
                          <span className="font-mono text-xs text-white">{session.frames.toLocaleString()}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="font-mono text-[9px] text-zinc-500 block mb-1">AGT Distribution</span>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 flex h-2 rounded-full overflow-hidden bg-black/30">
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
            {/* Wallet Connection Card */}
            <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-yellow-500/5 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <CardHeader className="p-4 border-b border-orange-500/15">
                <CardTitle className="text-sm text-orange-300 font-semibold flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  Solana Wallet
                  <Badge className="ml-auto bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[9px]">DEVNET</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-black/30 border border-orange-500/10">
                    <p className="font-mono text-[9px] text-zinc-500 mb-1">$OPTX Balance</p>
                    <p className="font-mono text-lg text-orange-400 font-bold">19.30</p>
                    <p className="font-mono text-[9px] text-zinc-600">Token-2022 SPL</p>
                  </div>
                  <div className="p-3 rounded-lg bg-black/30 border border-orange-500/10">
                    <p className="font-mono text-[9px] text-zinc-500 mb-1">$JTX Balance</p>
                    <p className="font-mono text-lg text-yellow-400 font-bold">0.00</p>
                    <p className="font-mono text-[9px] text-zinc-600">Mainnet</p>
                  </div>
                  <div className="p-3 rounded-lg bg-black/30 border border-orange-500/10">
                    <p className="font-mono text-[9px] text-zinc-500 mb-1">SOL Balance</p>
                    <p className="font-mono text-lg text-blue-400 font-bold">0.00</p>
                    <p className="font-mono text-[9px] text-zinc-600">Devnet</p>
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 border-0 font-mono text-sm h-10">
                  <Wallet className="w-4 h-4 mr-2" /> Connect Phantom / OKX
                </Button>
              </CardContent>
            </Card>

            {/* CSTB Profile */}
            <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
              <CardHeader className="p-4 border-b border-purple-500/15">
                <CardTitle className="text-sm text-purple-300 font-semibold flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  CSTB Identity Profile
                  <Badge className="ml-auto bg-purple-500/20 text-purple-400 border-purple-500/30 text-[9px]">CompuStable</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <p className="font-mono text-[10px] text-zinc-400 leading-relaxed">
                  JOE Agent Wallet includes CSTB profile URI in <code className="text-purple-400 bg-purple-500/10 px-1 rounded">agentMetadata()</code>.
                  Computational identity verified via proof hash + gaze attestation on Solana devnet.
                </p>

                {/* Attestation Status */}
                <div className="p-3 rounded-lg bg-black/30 border border-purple-500/15">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs text-purple-300">Attestation Progress</span>
                    <span className="font-mono text-[10px] text-purple-400">2 / 5 required</span>
                  </div>
                  <Progress value={40} className="h-2 bg-black/30" />
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <p className="font-mono text-[9px] text-zinc-500">Min Gaze</p>
                      <p className="font-mono text-[10px] text-green-400">222cs</p>
                    </div>
                    <div className="text-center">
                      <p className="font-mono text-[9px] text-zinc-500">Entropy</p>
                      <p className="font-mono text-[10px] text-yellow-400">750</p>
                    </div>
                    <div className="text-center">
                      <p className="font-mono text-[9px] text-zinc-500">Difficulty</p>
                      <p className="font-mono text-[10px] text-orange-400">1000</p>
                    </div>
                  </div>
                </div>

                {/* On-Chain Addresses */}
                <div>
                  <h4 className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider mb-2">On-Chain Addresses</h4>
                  <div className="space-y-1.5">
                    {[
                      { label: "DePIN Program", addr: DEPIN_PROGRAM, net: "devnet", icon: Zap },
                      { label: "$OPTX Mint", addr: OPTX_MINT, net: "devnet", icon: Target },
                      { label: "$JTX Mint", addr: JTX_MINT, net: "mainnet", icon: Shield },
                      { label: "$CSTB Mint", addr: CSTB_MINT, net: "devnet", icon: Hash },
                    ].map((item) => {
                      const Icon = item.icon
                      return (
                        <div key={item.label} className="flex items-center justify-between p-2.5 rounded-lg bg-black/20 border border-purple-500/10 hover:border-purple-500/25 transition-colors">
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-3.5 h-3.5 text-purple-400/60" />
                            <span className="font-mono text-[10px] text-zinc-300">{item.label}</span>
                            <Badge className={`text-[8px] h-4 ${
                              item.net === "mainnet"
                                ? "bg-green-500/15 text-green-400 border-green-500/25"
                                : "bg-yellow-500/15 text-yellow-400 border-yellow-500/25"
                            }`}>
                              {item.net}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <code className="font-mono text-[9px] text-purple-300/80 bg-purple-500/5 px-1.5 py-0.5 rounded">
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
