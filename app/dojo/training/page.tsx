"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { useUser } from "@clerk/nextjs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Send, Video, ArrowLeft } from "lucide-react"
import Link from "next/link"

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
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
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

  const [cursorPosition, setCursorPosition] = useState({ x: 50, y: 50 })
  const [isSpacePressed, setIsSpacePressed] = useState(false)
  const [currentSector, setCurrentSector] = useState<"COG" | "EMO" | "ENV" | "CENTER">("CENTER")

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

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraActive(true)
      }
    } catch (err) {
      const error = err as Error
      alert("Camera access denied: " + error.message)
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((t) => t.stop())
      setCameraActive(false)
      setIsTraining(false)
    }
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

  // Gaze tracking loop - uses local classification for now
  useEffect(() => {
    if (!cameraActive || !isTraining) return
    let lastTime = Date.now()
    let framesSinceLastFps = 0

    const interval = setInterval(async () => {
      const now = Date.now()
      framesSinceLastFps++
      if (now - lastTime > 1000) {
        setFps(framesSinceLastFps)
        framesSinceLastFps = 0
        lastTime = now
      }

      // Simulated gaze classification (replace with MediaPipe when CV model is wired)
      const gazeX = Math.random() * 2 - 1
      const gazeY = Math.random() * 2 - 1

      let tensor: "COG" | "ENV" | "EMO" = "COG"
      if (gazeY > 0.3) tensor = "COG"
      else if (gazeX < -0.3 && gazeY < -0.3) tensor = "EMO"
      else if (gazeX > 0.3 && gazeY < -0.3) tensor = "ENV"

      const result: GazeTensor = {
        tensor,
        confidence: 0.7 + Math.random() * 0.3,
        weight: 1,
        symbol: TENSOR_EMOTICONS[tensor],
      }

      setClassification(result)
      setAgtWeights((prev) => ({
        ...prev,
        [result.tensor]: prev[result.tensor] + 1,
      }))
      setFrameCount((prev) => prev + 1)

      // Draw gaze overlay
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d")
        if (ctx) {
          const width = canvasRef.current.width
          const height = canvasRef.current.height
          ctx.clearRect(0, 0, width, height)
          const screenX = ((gazeX + 1) / 2) * width
          const screenY = ((gazeY + 1) / 2) * height
          const color = TENSOR_COLORS[result.tensor]
          ctx.strokeStyle = color
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.arc(screenX, screenY, 30, 0, Math.PI * 2)
          ctx.stroke()
          ctx.fillStyle = color
          ctx.globalAlpha = 0.3
          ctx.beginPath()
          ctx.arc(screenX, screenY, 15, 0, Math.PI * 2)
          ctx.fill()
          ctx.globalAlpha = 1.0
        }
      }
    }, 16)
    return () => clearInterval(interval)
  }, [cameraActive, isTraining])

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

  // WebSocket connection to JOE agent on Jetson
  const connectJoeWs = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return
    setWsStatus("connecting")
    const ws = new WebSocket("wss://joe-ws.jettoptics.ai/ws/joe")
    ws.onopen = () => {
      setWsStatus("connected")
      setChatMessages((prev) => [...prev, { id: `sys_${Date.now()}`, user: "SYSTEM", content: "Connected to JOE agent via Tailscale" }])
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
    ws.onclose = () => setWsStatus("disconnected")
    ws.onerror = () => setWsStatus("disconnected")
    wsRef.current = ws
  }, [])

  // Connect when JOE agent toggle is ON
  useEffect(() => {
    if (joeAgentActive) connectJoeWs()
    else { wsRef.current?.close(); setWsStatus("disconnected") }
    return () => { wsRef.current?.close() }
  }, [joeAgentActive, connectJoeWs])

  const handleSendMessage = () => {
    if (!chatMessage.trim() || !user) return
    const msg = {
      id: Date.now().toString(),
      user: user.firstName || "anon",
      content: chatMessage,
      tensor: classification?.tensor,
    }
    setChatMessages((prev) => [...prev, msg])

    // Send to JOE via WebSocket if connected
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "chat",
        user: user.firstName || "anon",
        content: chatMessage,
        tensor: classification?.tensor,
      }))
    }
    setChatMessage("")
  }

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <p className="text-orange-400 text-xl font-mono">Loading DOJO...</p>
      </div>
    )
  }

  const totalWeight = agtWeights.COG + agtWeights.ENV + agtWeights.EMO || 1

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-orange-500/20">
        <div className="flex items-center gap-3">
          <Link href="/dojo" className="text-orange-400 hover:text-orange-300 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-mono text-lg text-orange-400 tracking-widest">DOJO TRAINING</h1>
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
            {isTraining ? "LIVE" : "READY"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-orange-300 border-orange-500/30 text-xs bg-black/20">
            FPS: {fps}
          </Badge>
          <Badge variant="outline" className="text-orange-400 border-orange-500/30 text-xs bg-black/20">
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
              <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-yellow-500/5 backdrop-blur shadow-lg shadow-orange-500/5 h-full">
                <CardHeader className="p-1.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <CardTitle className="text-sm text-orange-300 font-semibold flex items-center gap-2">
                      Camera Feed
                      <Badge variant={cameraActive ? "default" : "outline"}
                        className={`text-xs px-2 ${cameraActive ? "bg-red-500/30 text-red-400 border-red-500/40" : "text-orange-400/70 border-orange-500/30"}`}>
                        {cameraActive ? "Live" : "Off"}
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center gap-1.5">
                      <Button size="sm" variant={joeAgentActive ? "default" : "outline"}
                        onClick={() => setJoeAgentActive(!joeAgentActive)}
                        className={`h-6 text-[9px] px-2 ${joeAgentActive ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-0" : "border-orange-500/30 text-orange-400 hover:bg-orange-500/10"}`}>
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
                  <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-orange-500/40 bg-black shadow-inner">
                    <video ref={videoRef} width="640" height="480" autoPlay className="absolute inset-0 w-full h-full object-contain" />
                    <canvas ref={canvasRef} width="640" height="480" className="absolute inset-0 w-full h-full pointer-events-none" />
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
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black/90 to-orange-500/10">
                        <div className="text-center">
                          <Video className="w-16 h-16 text-orange-500/30 mx-auto mb-2" />
                          <p className="text-orange-400/70 text-sm font-mono">Camera Off</p>
                          <p className="text-orange-400/40 text-xs font-mono mt-1">Click Cam to start</p>
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
              <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-yellow-500/5 backdrop-blur shadow-lg shadow-orange-500/5 flex-1">
                <CardHeader className="p-1.5">
                  <CardTitle className="text-sm text-orange-300 font-semibold flex items-center gap-2">
                    AGT Tensor Analytics
                    <Badge className="ml-auto bg-gradient-to-r from-orange-500/30 to-yellow-500/20 text-orange-400 border-orange-500/40 text-xs px-2">
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
                          <div className="flex-1 h-3 rounded-full bg-black/30 border border-orange-500/20 overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-300"
                              style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${TENSOR_COLORS[t]}, ${TENSOR_COLORS[t]}80)` }} />
                          </div>
                          <span className="text-xs font-mono text-orange-300 w-12 text-right">{pct}%</span>
                          <span className="text-xs font-mono text-orange-400/50 w-10 text-right">{agtWeights[t]}</span>
                        </div>
                      )
                    })}
                  </div>
                  {/* Current Detection */}
                  {classification && (
                    <div className="mt-3 p-2 rounded bg-black/20 border border-orange-500/20 text-center">
                      <span className="text-2xl">{TENSOR_EMOTICONS[classification.tensor]}</span>
                      <span className="text-orange-300 font-mono text-sm ml-2">{classification.tensor}</span>
                      <span className="text-orange-400/50 font-mono text-xs ml-2">({(classification.confidence * 100).toFixed(0)}%)</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* JettChat */}
              <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-yellow-500/5 backdrop-blur shadow-lg shadow-orange-500/5 flex flex-col h-[200px]">
                <CardHeader className="p-1.5 flex-shrink-0">
                  <CardTitle className="text-sm text-orange-300 font-semibold">JettChat - $OPTX Signature Testing</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col min-h-0 p-2 pt-1">
                  <div className="flex-1 overflow-y-auto space-y-1 mb-2 min-h-0">
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className="p-1 rounded text-[10px] bg-black/30 border-l-2 border-orange-500/20">
                        <div className="flex items-center gap-1">
                          <span className="text-xs">{msg.tensor ? TENSOR_EMOTICONS[msg.tensor] : "\u{1F464}"}</span>
                          <span className="font-semibold text-orange-300">{msg.user}</span>
                        </div>
                        <p className="text-orange-200/80 leading-tight">{msg.content}</p>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <input type="text" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Type message... (hold Space + gaze for emoji)"
                      className="flex-1 px-2 py-1 bg-black/30 border border-orange-500/30 rounded text-orange-200 text-[10px] placeholder:text-orange-400/40 focus:outline-none focus:ring-1 focus:ring-orange-500/50" />
                    <Button onClick={handleSendMessage} size="sm" className="bg-gradient-to-r from-orange-500 to-orange-600 border-0 h-6">
                      <Send className="w-2.5 h-2.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tensor Trend Chart - Bottom */}
            <div className="col-span-12">
              <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-yellow-500/5 backdrop-blur shadow-lg shadow-orange-500/5 h-[150px]">
                <CardHeader className="p-1.5">
                  <CardTitle className="text-sm text-orange-300 font-semibold">AGT Tensor Trends (30s)</CardTitle>
                </CardHeader>
                <CardContent className="p-2 pt-1">
                  <div className="grid grid-cols-3 gap-2 h-[90px]">
                    {(["COG", "EMO", "ENV"] as const).map((t) => {
                      const history = t === "COG" ? cogHistory : t === "EMO" ? emoHistory : envHistory
                      return (
                        <div key={t} className="rounded bg-black/20 border border-orange-500/10 p-1 flex flex-col">
                          <span className="text-[9px] font-mono" style={{ color: TENSOR_COLORS[t] }}>{t} {TENSOR_EMOTICONS[t]}</span>
                          <div className="flex-1 flex items-end gap-[1px]">
                            {history.slice(-30).map((h, i) => (
                              <div key={i} className="flex-1 rounded-t" style={{
                                height: `${Math.min(100, Math.max(5, h.value * 10))}%`,
                                backgroundColor: TENSOR_COLORS[t],
                                opacity: 0.7,
                              }} />
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
