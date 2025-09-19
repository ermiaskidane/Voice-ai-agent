
"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/global/theme-toggle"
import { VoiceVisualizer } from "@/components/global/vapi-visualizer"
import { VapiSettings } from "@/components/global/vapi-settings"
import { Mic, MicOff, Volume2, MessageSquare, Sparkles, Zap, Brain, Waves, Settings, X, Bot } from "lucide-react"
import type { VapiMessage, VapiAssistant } from "@vapi-ai/web"

interface Message {
  id: string
  text: string
  speaker: "user" | "ai"
  timestamp: Date
}

export default function VoiceAIAgent() {
  const [isConnected, setIsConnected] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  // const [AIMessage, setAIMessage] = useState<Message[]>([])
  const [currentTranscript, setCurrentTranscript] = useState("")
  const [AICurrentTranscript, setAICurrentTranscript] = useState("")
  const [publicKey1, setPublicKey1] = useState("")
  const [assistantId1, setAssistantId1] = useState("")
  const [showSettings, setShowSettings] = useState(false)

  const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!
  const publicKey = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN!
  
  const vapiRef = useRef<any>(null)

  useEffect(() => {
    const initializeVapi = async () => {
      try {
        const { default: Vapi } = await import("@vapi-ai/web")

        if (!publicKey && !assistantId.trim()) {
          return
        }

        const vapi = new Vapi(publicKey)
        vapiRef.current = vapi

        vapi.on("call-start", () => {
          console.log("[v0] Vapi call started")
          setIsConnected(true)
          setIsListening(true)
        })

        vapi.on("call-end", () => {
          console.log("[v0] Vapi call ended")
          setIsConnected(false)
          setIsListening(false)
          setIsSpeaking(false)
        })

        vapi.on("speech-start", () => {
          console.log("[v0] User started speaking")
          setIsListening(true)
          setIsSpeaking(false)
        })

        vapi.on("speech-end", () => {
          console.log("[v0] User stopped speaking")
          setIsListening(false)
        })

        vapi.on("message", (message: VapiMessage) => {
          console.log("[v0] Vapi message received:", message)
          console.log("[v0] Message type:", message.type)
          console.log("[v0] Message role:", message.role)
          console.log("[v0] Message transcript:", message.transcript)
          console.log("[v0] Message isFinal:", message.isFinal)

          if (message.type === "transcript" && message.transcript) {
            if (message.role === "user") {
              console.log("[v0] Processing user message:", message.transcript)
              if (message.isFinal) {
                handleUserMessage(message.transcript)
                setCurrentTranscript("")
              } else {
                setCurrentTranscript(message.transcript)
              }
            } else if (message.role === "assistant") {
              console.log("[v0] Processing AI message:", message.transcript)
              if (message.isFinal) {
                console.log("[v0] Adding final AI message to transcript:", message.transcript)
                handleAIMessage(message.transcript)
                setCurrentTranscript("")
                setIsSpeaking(false)
              } else {
                console.log("[v0] AI is speaking (partial):", message.transcript)
                setCurrentTranscript(message.transcript)
                setIsSpeaking(true)
              }
            }
          }

          if (message.type === "function-call" && message.functionCall) {
            console.log("[v0] Function call:", message.functionCall)
          }

          if (message.type === "hang") {
            console.log("[v0] Call ended by assistant")
            setIsConnected(false)
            setIsListening(false)
            setIsSpeaking(false)
          }

          if (message.type !== "transcript" && message.type !== "function-call" && message.type !== "hang") {
            console.log("[v0] Unknown message type received:", message.type, message)
          }
        })

        vapi.on("error", (error) => {
          console.error("[v0] Vapi error:", error)
          setIsConnected(false)
          setIsListening(false)
          setIsSpeaking(false)
        })
      } catch (error) {
        console.error("[v0] Failed to initialize Vapi:", error)
      }
    }

    if (publicKey || assistantId.trim()) {
      initializeVapi()
    }

    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop()
      }
    }
  }, [publicKey, assistantId])

  useEffect(() => {
    const welcomeMessage: Message = {
      id: "1",
      text: "Hello! I'm your AI voice assistant powered by Vapi. Configure your settings and start a conversation to begin!",
      speaker: "ai",
      timestamp: new Date(),
    }
    setMessages([welcomeMessage])
  }, [])

  const handleUserMessage = (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      speaker: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
  }

  const handleAIMessage = (text: string) => {
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text,
      speaker: "ai",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, aiMessage])
  }

  const createAssistant = (): VapiAssistant => ({
    model: {
      provider: "openai",
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI voice assistant. Keep your responses conversational, engaging, and concise. Speak naturally as if you're having a friendly conversation. Avoid overly long responses and ask follow-up questions to keep the conversation flowing.",
        },
      ],
    },
    voice: {
      provider: "11labs",
      voiceId: "21m00Tcm4TlvDq8ikWAM",
    },
    firstMessage: "Hello! I'm your AI voice assistant powered by Vapi. How can I help you today?",
  })

  const toggleConnection = async () => {
    if (!vapiRef.current) return

    if (isConnected) {
      vapiRef.current.stop()
    } else {
      try {
        if (assistantId.trim()) {
          await vapiRef.current.start(assistantId)
        } else {
          const assistant = createAssistant()
          await vapiRef.current.start(assistant)
        }
      } catch (error) {
        console.error("[v0] Failed to start Vapi call:", error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <ThemeToggle />

      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative">
            <Button
              onClick={() => setShowSettings(false)}
              variant="ghost"
              size="sm"
              className="absolute -top-2 -right-2 z-10 rounded-full w-8 h-8 p-0 bg-background/80 hover:bg-background"
            >
              <X className="w-4 h-4" />
            </Button>
            {/* <VapiSettings
              publicKey={publicKey}
              onPublicKeyChange={setPublicKey1}
              assistantId={assistantId}
              onAssistantIdChange={setAssistantId1}
              isConnected={isConnected}
            /> */}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center glass-strong shadow-2xl">
                <Sparkles className="w-12 h-12 text-primary-foreground" />
              </div>
              {(isListening || isSpeaking) && (
                <>
                  <div className="absolute inset-0 rounded-full border-2 border-accent animate-ping" />
                  <div className="absolute inset-0 rounded-full border-2 border-primary animate-pulse" />
                </>
              )}
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-heading font-bold text-foreground mb-6 text-balance leading-tight">
            Vapi Voice AI
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Assistant</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-12 text-pretty max-w-3xl mx-auto leading-relaxed">
            Experience premium voice AI conversations powered by Vapi. Speak naturally with advanced AI that understands
            context and responds intelligently.
          </p>

          <div className="flex flex-col items-center gap-6 mb-8">
            <div className="flex items-center gap-4">
              <Button
                onClick={toggleConnection}
                size="lg"
                disabled={!publicKey && !assistantId.trim()}
                className={`relative px-8 py-4 text-lg font-medium transition-all duration-300 cursor-pointer ${
                  isConnected
                    ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg shadow-destructive/25"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
                } rounded-xl disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isConnected ? (
                  <>
                    <MicOff className="w-5 h-5 mr-3" />
                    End Conversation
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 mr-3" />
                    Start Conversation
                  </>
                )}
              </Button>

              <Button
                onClick={() => setShowSettings(true)}
                variant="outline"
                size="lg"
                className="cursor-pointer px-6 py-4 text-lg glass hover:bg-accent/10 border-accent/50 bg-transparent"
              >
                <Settings className="w-5 h-5 mr-2" />
                Settings
              </Button>
            </div>

            <VoiceVisualizer isActive={isListening || isSpeaking} type={isListening ? "listening" : "speaking"} />
          </div>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            {!publicKey && !assistantId.trim() && (
              <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 border-orange-500/20 px-4 py-2">
                <Settings className="w-3 h-3 mr-2" />
                API Key Required
              </Badge>
            )}
            {assistantId && (
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20 px-4 py-2">
                <Bot className="w-3 h-3 mr-2" />
                Custom Assistant
              </Badge>
            )}
            {isConnected && (
              <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20 px-4 py-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                Connected to Vapi
              </Badge>
            )}
            {isListening && (
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-4 py-2">
                <div className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse" />
                Listening to you...
              </Badge>
            )}
            {isSpeaking && (
              <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20 px-4 py-2">
                <Volume2 className="w-3 h-3 mr-2" />
                AI is speaking...
              </Badge>
            )}
          </div>
          {currentTranscript && !isSpeaking && (
            <div className="mt-8 p-6 glass rounded-2xl max-w-2xl mx-auto border border-accent/20">
              <p className="text-sm text-muted-foreground mb-2 font-medium">You're saying:</p>
              <p className="text-foreground font-medium text-lg">{currentTranscript}</p>
            </div>
          )}

          {currentTranscript && isSpeaking && (
            <div className="mt-8 p-6 glass rounded-2xsl max-w-2xl mx-auto border border-accent/20">
              <p className="text-sm text-muted-foreground mb-2 font-medium">Assistant is saying:</p>
              <p className="text-foreground font-medium text-lg">{currentTranscript}</p>
            </div>
          )}
        </div>

        {/* WhatsApp-Style Conversation */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="p-0 glass-strong shadow-2xl border-border/50 overflow-hidden">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mr-4">
                    <Bot className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">AI Assistant</h3>
                    <p className="text-sm text-muted-foreground">
                      {isConnected ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
                {isConnected && (
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2" />
                    <span className="text-sm text-green-600 font-medium">Live</span>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="h-[600px] overflow-y-auto bg-gradient-to-b from-background/50 to-background/30 p-4 space-y-3">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${message.speaker === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                      message.speaker === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-white/90 text-gray-800 rounded-bl-md shadow-sm"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.speaker === "user" ? "text-primary-foreground/70" : "text-gray-500"
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Live transcript - WhatsApp style */}
              {/* {currentTranscript && (
                <div className="flex justify-end">
                  <div className="max-w-[70%] px-4 py-2 rounded-2xl rounded-br-md bg-primary/80 text-primary-foreground">
                    <p className="text-sm leading-relaxed italic">{currentTranscript}</p>
                    <p className="text-xs mt-1 text-primary-foreground/70">
                      {new Date().toLocaleTimeString()} . speaking...
                    </p>
                  </div>
                </div>
              )} */}
            </div>

            {/* Chat Input Area (Visual Only) */}
            <div className="p-4 bg-background/50 border-t border-border/50">
              <div className="flex items-center justify-center">
                <div className="flex items-center px-4 py-2 bg-background/80 rounded-full border border-border/50 w-full max-w-md">
                  <MessageSquare className="w-4 h-4 text-muted-foreground mr-3" />
                  <span className="text-sm text-muted-foreground">
                    {isConnected ? "Voice conversation active" : "Start conversation to begin"}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="p-8 text-center glass hover:glass-strong transition-all duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Waves className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="font-heading font-semibold text-foreground mb-3 text-xl">Advanced Voice Processing</h3>
            <p className="text-muted-foreground leading-relaxed">
              Powered by Vapi's cutting-edge voice AI technology for natural speech recognition and synthesis
            </p>
          </Card>

          <Card className="p-8 text-center glass hover:glass-strong transition-all duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-r from-accent to-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Brain className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="font-heading font-semibold text-foreground mb-3 text-xl">Intelligent Conversations</h3>
            <p className="text-muted-foreground leading-relaxed">
              Context-aware AI responses that understand nuance and maintain engaging dialogue flow
            </p>
          </Card>

          <Card className="p-8 text-center glass hover:glass-strong transition-all duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="font-heading font-semibold text-foreground mb-3 text-xl">Real-time Experience</h3>
            <p className="text-muted-foreground leading-relaxed">
              Low-latency voice interactions with live transcription and instant AI responses
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
