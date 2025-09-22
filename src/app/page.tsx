
"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ThemeToggle } from "@/components/global/theme-toggle"
import { X } from "lucide-react"
import type { VapiMessage, VapiAssistant } from "@vapi-ai/web"
import { N8nAppointmentChatbot } from "@/components/n8n-appointment-chatbot"
import HomeView from "@/components/home-view"
import FeatureGrid from "@/components/Feature-grid"

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
  // const [messages, setMessages] = useState<Message[]>([])
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState("https://n8n.srv1007779.hstgr.cloud/webhook-test/02982a74-e6c7-4a65-ad41-3905037eb41a")
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
                // handleUserMessage(message.transcript)
                setCurrentTranscript("")
              } else {
                setCurrentTranscript(message.transcript)
              }
            } else if (message.role === "assistant") {
              console.log("[v0] Processing AI message:", message.transcript)
              if (message.isFinal) {
                console.log("[v0] Adding final AI message to transcript:", message.transcript)
                // handleAIMessage(message.transcript)
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
        <HomeView 
          isListening={isListening} 
          isSpeaking={isSpeaking} 
          currentTranscript={currentTranscript} 
          isConnected={isConnected} 
          publicKey={publicKey} 
          assistantId={assistantId} 
          setShowSettings={setShowSettings} 
          toggleConnection={toggleConnection}
        />

        <div className="max-w-4xl mx-auto mb-16">
          <N8nAppointmentChatbot webhookUrl={n8nWebhookUrl} onWebhookUrlChange={setN8nWebhookUrl} />
        </div>

        <FeatureGrid />
      </div>
    </div>
  )
}
