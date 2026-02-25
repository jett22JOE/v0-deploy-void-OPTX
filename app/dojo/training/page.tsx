"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { useUser } from "@clerk/nextjs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Send, Video, ArrowLeft, Eye, Shield, Pencil, User } from "lucide-react"
import Link from "next/link"
import { AGTLineCharts } from "@/components/AGTLineCharts"
import { JETTUX } from "@/components/JETTUX"
import { useMediaPipeGaze } from "@/hooks/useMediaPipeGaze"
import type { GazeEvent } from "@/lib/gaze/computeGaze"

interface GazeTensor {
  tensor: "COG" | "ENV" | "EMO"
  confidence: number
  weight: number
  symbol: string
}

const TENSOR_EMOTICONS: Record<string, string> = {
  COG: "\u{1F9E0}",
  ENV: "\u{1F30D}",
  EMO: "\u{2764}\u{FE0F}",
}

const TENSOR_COLORS: Record<string, string> = {
  COG: "oklch(0.82 0.18 95)",
  ENV: "oklch(0.60 0.20 250)",
  EMO: "oklch(0.65 0.25 25)",
}

export default function TrainingPage() {
  const { user, isLoaded } = useUser()
  const chatEndRef = useRef<HTMLDivElement>(null)

  const [cameraActive, setCameraActive] = useState(false)
  const [joeAgentActive, setJoeAgentActive] = useState(false)
  const [isTraining, setIsTraining] = useState(false)
  const [classification, setClassification] = useState<GazeTensor | null>(null)
  const [frameCount, setFrameCount] = useState(0)
  const [agtWeights, setAgtWeights] = useState({ COG: 0, ENV: 0, EMO: 0 })
  const [fps, setFps] = useState(0)
  const [chatMessage, setChatMessage] = useState("")
  const [chatMessages, setChatMessages] = useState<Array<{id: string, user: string, content: string, tensor?: string}>>([])
  const [wsStatus, setWsStatus] = useState<"connecting" | "connected" | "disconnected">("disconnected")
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [displayName, setDisplayName] = useState<string>("")
  const [isEditingName, setIsEditingName] = useState(false)
  const [nameInput, setNameInput] = useState("")
  const nameInputRef = useRef<HTMLInputElement>(null)

  const [cursorPosition, setCursorPosition] = useState({ x: 50, y: 50 })
  const [isSpacePressed, setIsSpacePressed] = useState(false)
  const [currentSector, setCurrentSector] = useState<"COG" | "EMO" | "ENV" | "CENTER">("CENTER")

  // MediaPipe gaze hook (replaces Math.random mock)
  const { videoRef, canvasRef, start: startMediaPipe, stop: stopMediaPipe, isLive: mediaPipeLive, fps: mediaPipeFps } = useMediaPipeGaze({
    onGaze: (event: GazeEvent) => {
      if (!isTraining) return

      const tensor = event.section as "COG" | "EMO" | "ENV"
      const result: GazeTensor = {
        tensor,
        confidence: event.confidence,
        weight: 1,
        symbol: TENSOR_EMOTICONS[tensor],
      }

      setClassification(result)
      setAgtWeights((prev) => ({
        ...prev,
        [tensor]: prev[tensor] + 1,
      }))
      setFrameCount((prev) => prev + 1)
      setFps(mediaPipeFps)
    },
    drawOverlays: true,
  })

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  useEffect(() => {
    const saved = localStorage.getItem('dojo-theme') as 'dark' | 'light' | null;
    if (saved) setTheme(saved);
    const handler = (e: Event) => setTheme((e as CustomEvent).detail);
    window.addEventListener('dojo-theme-change', handler);
    return () => window.removeEventListener('dojo-theme-change', handler);
  }, []);
  const isDark = theme === 'dark';

  // AGT Line Chart History
  const [cogHistory, setCogHistory] = useState<Array<{ time: number; value: number }>>([])
  const [emoHistory, setEmoHistory] = useState<Array<{ time: number; value: number }>>([])
  const [envHistory, setEnvHistory] = useState<Array<{ time: number; value: number }>>([])
  const [startTime, setStartTime] = useState<number>(0)

  const calculateCursorPosition = (weights: { COG: number; EMO: number; ENV: number }) => {
    const total = weights.COG + weights.EMO + weights.ENV || 1
    const cogNorm = weights.COG / total
    const emoNorm = weights.EMO / total
    const envNorm = weights.ENV / total
    const x = cogNorm * 50 + emoNorm * 0 + envNorm * 100
    const y = cogNorm * 21.13 + emoNorm * 78.87 + envNorm * 78.87
    return { x, y }
  }

  const determineSector = (x: number, y: number): "COG" | "EMO" | "ENV" | "CENTER" => {
    const dx = x - 50
    const dy = y - 50
    if (Math.sqrt(dx * dx + dy * dy) < 10) return "CENTER"
    if (y > 50) {
      if (x < 50) return "EMO"
      else return "ENV"
    }
    return "COG"
  }

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

  const startCamera = async () => {
    try {
      await startMediaPipe()
      setCameraActive(true)
    } catch (err) {
      const error = err as Error
      alert("Camera access denied: " + error.message)
    }
  }

  const stopCamera = () => {
    stopMediaPipe()
    setCameraActive(false)
    setIsTraining(false)
  }

  // Initialize start time
  useEffect(() => {
    if (isTraining && startTime === 0) {
      setStartTime(Date.now())
      setCogHistory([])
      setEmoHistory([])
      setEnvHistory([])
    } else if (!isTraining && startTime !== 0) {
      setStartTime(0)
    }
  }, [isTraining, startTime])

  // Line chart tracking
  useEffect(() => {
    if (!isTraining || startTime === 0) return
    let lastWeights = { COG: 0, ENV: 0, EMO: 0 }
    const interval = setInterval(() => {
      const currentTime = Math.floor((Date.now() - startTime) / 1000)
      const cogDelta = agtWeights.COG - lastWeights.COG
      const emoDelta = agtWeights.EMO - lastWeights.EMO
      const envDelta = agtWeights.ENV - lastWeights.ENV
      lastWeights = { ...agtWeights }
      setCogHistory((prev) => [...prev, { time: currentTime, value: cogDelta }].filter((p) => currentTime - p.time <= 30))
      setEmoHistory((prev) => [...prev, { time: currentTime, value: emoDelta }].filter((p) => currentTime - p.time <= 30))
      setEnvHistory((prev) => [...prev, { time: currentTime, value: envDelta }].filter((p) => currentTime - p.time <= 30))
    }, 1000)
    return () => clearInterval(interval)
  }, [isTraining, startTime, agtWeights])

  // Old mock gaze loop removed — MediaPipe hook's onGaze callback handles all classification + canvas overlays

  // Space bar for gaze capture
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault()
        setIsSpacePressed(true)
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault()
        setIsSpacePressed(false)
        if (currentSector !== "CENTER") {
          setChatMessage((prev) => prev + TENSOR_EMOTICONS[currentSector])
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [currentSector])

  // Update cursor
  useEffect(() => {
    if (isSpacePressed && isTraining) {
      const newPos = calculateCursorPosition(agtWeights)
      setCursorPosition(newPos)
      setCurrentSector(determineSector(newPos.x, newPos.y))
    } else {
      setCursorPosition({ x: 50, y: 50 })
      setCurrentSector("CENTER")
    }
  }, [isSpacePressed, agtWeights, isTraining])

  // WebSocket connection to JOE agent
  const connectJoeWs = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return
    setWsStatus("connecting")
    const ws = new WebSocket(process.env.NEXT_PUBLIC_JOE_WS_URL || "wss://jettoptx-joe.taile11759.ts.net/ws")
    ws.onopen = () => {
      setWsStatus("connected")
      setChatMessages((prev) => [...prev, { id: `sys_${Date.now()}`, user: "SYSTEM", content: "Connected to JOE agent" }])
    }
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setChatMessages((prev) => [...prev, {
          id: `joe_${Date.now()}`,
          user: "JOE",
          content: data.content || data.response || event.data,
          tensor: data.tensor,
        }])
      } catch {
        setChatMessages((prev) => [...prev, { id: `joe_${Date.now()}`, user: "JOE", content: event.data }])
      }
    }
    ws.onclose = () => {
      setWsStatus("disconnected")
      if (joeAgentActive) {
        reconnectRef.current = setTimeout(connectJoeWs, 5000)
      }
    }
    ws.onerror = () => setWsStatus("disconnected")
    wsRef.current = ws
  }, [joeAgentActive])

  // Connect when JOE agent toggle is ON
  useEffect(() => {
    if (joeAgentActive) {
      connectJoeWs()
    } else {
      if (reconnectRef.current) clearTimeout(reconnectRef.current)
      wsRef.current?.close()
      setWsStatus("disconnected")
    }
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current)
      wsRef.current?.close()
    }
  }, [joeAgentActive, connectJoeWs])

  const handleSendMessage = () => {
    if (!chatMessage.trim() || !user) return
    const name = displayName || "anonymous"
    const msg = {
      id: Date.now().toString(),
      user: name,
      content: chatMessage,
      tensor: classification?.tensor,
    }
    setChatMessages((prev) => [...prev, msg])

    // Send to JOE via WebSocket if connected
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "chat",
        user: name,
        content: chatMessage,
        tensor: classification?.tensor,
      }))
    }
    setChatMessage("")
  }

  if (!isLoaded) {
    return (
      <div className={`fixed inset-0 ${isDark ? 'bg-black' : 'bg-white'} flex items-center justify-center`}>
        <p className={`${isDark ? 'text-orange-400' : 'text-orange-600'} text-xl font-mono`}>Loading DOJO...</p>
      </div>
    )
  }

  const totalWeight = agtWeights.COG + agtWeights.ENV + agtWeights.EMO || 1

  return (
    <div className={`h-screen flex flex-col overflow-hidden bg-gradient-to-br ${isDark ? 'from-gray-900 via-slate-900 to-black' : 'from-orange-50/50 via-white to-zinc-50'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-2 border-b ${isDark ? 'border-orange-500/20' : 'border-orange-200/30'}`}>
        <div className="flex items-center gap-3">
          <Link href="/dojo" className={`${isDark ? 'text-orange-400 hover:text-orange-300' : 'text-orange-600 hover:text-orange-500'} transition-colors`}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className={`font-mono text-lg ${isDark ? 'text-orange-400' : 'text-orange-800'} tracking-widest`}>DOJO TRAINING</h1>
          <Badge className={`${isDark ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-orange-100 text-orange-700 border-orange-200/50'} text-xs`}>
            {isTraining ? "LIVE" : "READY"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`text-xs ${isDark ? 'text-orange-300 border-orange-500/30 bg-black/20' : 'text-orange-700 border-orange-200/50 bg-white/60'}`}>
            FPS: {fps}
          </Badge>
          <Badge variant="outline" className={`text-xs ${isDark ? 'text-orange-400 border-orange-500/30 bg-black/20' : 'text-orange-700 border-orange-200/50 bg-white/60'}`}>
            {frameCount} Frames
          </Badge>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 overflow-hidden p-2">
        <div className="h-full max-w-[1400px] mx-auto">
          <div className="grid grid-cols-12 gap-2 h-full">

            {/* Camera Feed - 5 columns */}
            <div className="col-span-12 lg:col-span-5">
              <Card className={`${isDark ? 'border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-yellow-500/5 shadow-lg shadow-orange-500/5' : 'border-orange-200/30 bg-white/60 shadow-lg shadow-orange-100/20'} backdrop-blur h-full`}>
                <CardHeader className="p-1.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <CardTitle className={`text-sm ${isDark ? 'text-orange-300' : 'text-orange-700'} font-semibold flex items-center gap-2`}>
                      Camera Feed
                      <Badge variant={cameraActive ? "default" : "outline"}
                        className={`text-xs px-2 ${cameraActive ? "bg-red-500/30 text-red-400 border-red-500/40" : isDark ? "text-orange-400/70 border-orange-500/30" : "text-orange-600/70 border-orange-200/50"}`}>
                        {cameraActive ? "Live" : "Off"}
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center gap-1.5">
                      <Button size="sm" variant={joeAgentActive ? "default" : "outline"}
                        onClick={() => setJoeAgentActive(!joeAgentActive)}
                        className={`h-6 text-[9px] px-2 ${joeAgentActive ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-0" : isDark ? "border-orange-500/30 text-orange-400 hover:bg-orange-500/10" : "border-orange-200/50 text-orange-700 hover:bg-orange-100/50"}`}>
                        JOE {joeAgentActive ? "ON" : "OFF"}
                      </Button>
                      {!cameraActive ? (
                        <Button size="sm" onClick={startCamera} className="h-6 text-[9px] px-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">Cam</Button>
                      ) : (
                        <Button size="sm" variant="destructive" onClick={stopCamera} className="h-6 text-[9px] px-2 bg-gradient-to-r from-red-500 to-red-600 border-0">Stop</Button>
                      )}
                      {cameraActive && (
                        <Button size="sm" onClick={() => setIsTraining(!isTraining)}
                          className={`h-6 text-[9px] px-2 ${isTraining ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-0" : "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0"}`}>
                          {isTraining ? "Pause" : "Train"}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-2 pt-1">
                  <div className={`relative w-full aspect-[4/3] rounded-lg overflow-hidden border ${isDark ? 'border-orange-500/40 bg-black' : 'border-orange-200/40 bg-zinc-100'} shadow-inner`}>
                    <video ref={videoRef} width="640" height="480" autoPlay playsInline muted className="absolute inset-0 w-full h-full object-contain" style={{ transform: 'scaleX(-1)' }} />
                    <canvas ref={canvasRef} width="640" height="480" className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: 'scaleX(-1)' }} />
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                      <line x1="50" y1="50" x2="50" y2="100" stroke="rgba(249, 115, 22, 0.5)" strokeWidth="0.3" strokeDasharray="2,2" />
                      <line x1="50" y1="50" x2="0" y2="21.13" stroke="rgba(249, 115, 22, 0.5)" strokeWidth="0.3" strokeDasharray="2,2" />
                      <line x1="50" y1="50" x2="100" y2="21.13" stroke="rgba(249, 115, 22, 0.5)" strokeWidth="0.3" strokeDasharray="2,2" />
                      <circle cx={cursorPosition.x} cy={cursorPosition.y} r={isSpacePressed ? "2" : "1.5"}
                        fill={currentSector === "COG" ? "oklch(0.82 0.18 95)" : currentSector === "EMO" ? "oklch(0.65 0.25 25)" : currentSector === "ENV" ? "oklch(0.60 0.20 250)" : "oklch(0.646 0.222 41.116)"}
                        opacity={isSpacePressed ? "1" : "0.7"} style={{ transition: "all 0.3s ease" }}>
                        <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite" />
                      </circle>
                    </svg>
                    {!cameraActive && (
                      <div className={`absolute inset-0 flex items-center justify-center ${isDark ? 'bg-gradient-to-br from-black/90 to-orange-500/10' : 'bg-gradient-to-br from-zinc-100/90 to-orange-100/30'}`}>
                        <div className="text-center">
                          <Video className={`w-16 h-16 ${isDark ? 'text-orange-500/30' : 'text-orange-400/40'} mx-auto mb-2`} />
                          <p className={`${isDark ? 'text-orange-400/70' : 'text-orange-600/70'} text-sm font-mono`}>Camera Off</p>
                          <p className={`${isDark ? 'text-orange-400/40' : 'text-orange-500/50'} text-xs font-mono mt-1`}>Click Cam to start</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analytics + JettChat - 7 columns */}
            <div className="col-span-12 lg:col-span-7 flex flex-col gap-2">
              {/* AGT Tensor Analytics */}
              <Card className={`${isDark ? 'border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-yellow-500/5 shadow-lg shadow-orange-500/5' : 'border-orange-200/30 bg-white/60 shadow-lg shadow-orange-100/20'} backdrop-blur flex-1`}>
                <CardHeader className="p-1.5">
                  <CardTitle className={`text-sm ${isDark ? 'text-orange-300' : 'text-orange-700'} font-semibold flex items-center gap-2`}>
                    AGT Tensor Analytics
                    <Badge className={`ml-auto text-xs px-2 ${isDark ? 'bg-gradient-to-r from-orange-500/30 to-yellow-500/20 text-orange-400 border-orange-500/40' : 'bg-orange-100 text-orange-700 border-orange-200/50'}`}>
                      {isTraining ? "Live" : "Idle"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 pt-2">
                  {/* Tensor Bars */}
                  <div className="space-y-2">
                    {(["COG", "EMO", "ENV"] as const).map((t) => {
                      const pct = totalWeight > 0 ? ((agtWeights[t] / totalWeight) * 100).toFixed(1) : "0.0"
                      return (
                        <div key={t} className="flex items-center gap-2">
                          <span className="text-xs font-mono w-8" style={{ color: TENSOR_COLORS[t] }}>{t}</span>
                          <span className="text-sm">{TENSOR_EMOTICONS[t]}</span>
                          <div className={`flex-1 h-3 rounded-full ${isDark ? 'bg-black/30 border border-orange-500/20' : 'bg-zinc-100 border border-orange-200/30'} overflow-hidden`}>
                            <div className="h-full rounded-full transition-all duration-300"
                              style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${TENSOR_COLORS[t]}, ${TENSOR_COLORS[t]}80)` }} />
                          </div>
                          <span className={`text-xs font-mono ${isDark ? 'text-orange-300' : 'text-zinc-600'} w-12 text-right`}>{pct}%</span>
                          <span className={`text-xs font-mono ${isDark ? 'text-orange-400/50' : 'text-zinc-400'} w-10 text-right`}>{agtWeights[t]}</span>
                        </div>
                      )
                    })}
                  </div>
                  {/* Current Detection */}
                  {classification && (
                    <div className={`mt-3 p-2 rounded ${isDark ? 'bg-black/20 border border-orange-500/20' : 'bg-orange-50/50 border border-orange-200/30'} text-center`}>
                      <span className="text-2xl">{TENSOR_EMOTICONS[classification.tensor]}</span>
                      <span className={`${isDark ? 'text-orange-300' : 'text-orange-700'} font-mono text-sm ml-2`}>{classification.tensor}</span>
                      <span className={`${isDark ? 'text-orange-400/50' : 'text-zinc-500'} font-mono text-xs ml-2`}>({(classification.confidence * 100).toFixed(0)}%)</span>
                    </div>
                  )}

                  {/* Gaze-Lock Status */}
                  <div className={`mt-2 p-1.5 rounded ${isDark ? 'bg-black/10 border border-orange-500/10' : 'bg-green-50/50 border border-green-200/30'} flex items-center gap-2`}>
                    <Shield className={`w-3 h-3 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                    <span className={`text-[10px] ${isDark ? 'text-green-400/80' : 'text-green-700'} font-mono`}>Gaze-Lock {isTraining ? "Active" : "Standby"}</span>
                  </div>

                  {/* JETTUX Radar + Donut */}
                  <div className="mt-2">
                    <JETTUX
                      agtWeights={agtWeights}
                      frameCount={frameCount}
                      showRadar={true}
                      showDonut={true}
                      activeTensor={classification?.tensor || null}
                      isActive={isTraining}
                      cursorPosition={cursorPosition}
                      currentSector={currentSector}
                      isSpacePressed={isSpacePressed}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* JettChat */}
              <Card className={`${isDark ? 'border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-yellow-500/5 shadow-lg shadow-orange-500/5' : 'border-orange-200/30 bg-white/60 shadow-lg shadow-orange-100/20'} backdrop-blur flex flex-col h-[200px]`}>
                <CardHeader className="p-1.5 flex-shrink-0">
                  <CardTitle className={`text-sm ${isDark ? 'text-orange-300' : 'text-orange-700'} font-semibold flex items-center justify-between`}>
                    <span>JettChat - $OPTX Signature Testing</span>
                    {isEditingName ? (
                      <div className="flex items-center gap-1">
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
                          placeholder="Name..."
                          className={`w-24 px-1.5 py-0.5 ${isDark ? 'bg-black/40 border-orange-500/30 text-orange-200 placeholder:text-zinc-600 focus:ring-orange-500/40' : 'bg-white/80 border-orange-200/50 text-zinc-800 placeholder:text-zinc-400 focus:ring-orange-400/40'} border rounded text-[10px] font-mono focus:outline-none focus:ring-1`}
                        />
                        <Button size="sm" onClick={saveDisplayName} className={`h-5 text-[8px] px-1.5 ${isDark ? 'bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/30' : 'bg-orange-100 text-orange-700 border-orange-200/50 hover:bg-orange-200/50'} border`}>OK</Button>
                      </div>
                    ) : (
                      <button onClick={startEditingName} className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-orange-500/10 transition-colors" title="Change display name">
                        <User className="w-3 h-3 text-zinc-500" />
                        <span className="font-mono text-[10px] text-zinc-400 font-normal">{displayName}</span>
                        <Pencil className="w-2.5 h-2.5 text-zinc-600" />
                      </button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col min-h-0 p-2 pt-1">
                  <div className="flex-1 overflow-y-auto space-y-1 mb-2 min-h-0">
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className={`p-1 rounded text-[10px] ${isDark ? 'bg-black/30 border-l-2 border-orange-500/20' : 'bg-orange-50/50 border-l-2 border-orange-300/30'}`}>
                        <div className="flex items-center gap-1">
                          <span className="text-xs">{msg.tensor ? TENSOR_EMOTICONS[msg.tensor] : "\u{1F464}"}</span>
                          <span className={`font-semibold ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>{msg.user}</span>
                        </div>
                        <p className={`${isDark ? 'text-orange-200/80' : 'text-zinc-700'} leading-tight`}>{msg.content}</p>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <input type="text" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Type message... (hold Space + gaze for emoji)"
                      className={`flex-1 px-2 py-1 ${isDark ? 'bg-black/30 border-orange-500/30 text-orange-200 placeholder:text-orange-400/40 focus:ring-orange-500/50' : 'bg-white/80 border-orange-200/50 text-zinc-800 placeholder:text-zinc-400 focus:ring-orange-400/50'} border rounded text-[10px] focus:outline-none focus:ring-1`} />
                    <Button onClick={handleSendMessage} size="sm" className="bg-gradient-to-r from-orange-500 to-orange-600 border-0 h-6">
                      <Send className="w-2.5 h-2.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tensor Trend Chart - Bottom */}
            <div className="col-span-12">
              <Card className={`${isDark ? 'border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-yellow-500/5 shadow-lg shadow-orange-500/5' : 'border-orange-200/30 bg-white/60 shadow-lg shadow-orange-100/20'} backdrop-blur`}>
                <CardHeader className="p-1.5">
                  <CardTitle className={`text-sm ${isDark ? 'text-orange-300' : 'text-orange-700'} font-semibold`}>AGT Tensor Trends (30s)</CardTitle>
                </CardHeader>
                <CardContent className="p-2 pt-1">
                  <AGTLineCharts
                    cogHistory={cogHistory}
                    emoHistory={emoHistory}
                    envHistory={envHistory}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
