"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Vapi from "@vapi-ai/web"
import { Phone, PhoneOff, Mic, MicOff } from "lucide-react"

interface VapiWidgetProps {
  config?: Record<string, unknown>
}

const VapiWidget: React.FC<VapiWidgetProps> = ({ config = {} }) => {
  const [vapi, setVapi] = useState<Vapi | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState<Array<{ role: string; text: string }>>([])

  const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!
  const apiKey = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN!

  useEffect(() => {
    const vapiInstance = new Vapi(apiKey)
    setVapi(vapiInstance)

    // Event listeners
    vapiInstance.on("call-start", () => {
      console.log("Call started")
      setIsConnected(true)
    })

    vapiInstance.on("call-end", () => {
      console.log("Call ended")
      setIsConnected(false)
      setIsSpeaking(false)
    })

    vapiInstance.on("speech-start", () => {
      console.log("Assistant started speaking")
      setIsSpeaking(true)
    })

    vapiInstance.on("speech-end", () => {
      console.log("Assistant stopped speaking")
      setIsSpeaking(false)
    })

    vapiInstance.on("message", (message) => {
      if (message.type === "transcript") {
        setTranscript((prev) => [
          ...prev,
          {
            role: message.role,
            text: message.transcript,
          },
        ])
      }
    })

    vapiInstance.on("error", (error) => {
      console.error("Vapi error:", error)
    })

    return () => {
      vapiInstance?.stop()
    }
  }, [apiKey])

  const startCall = () => {
    if (vapi) {
      vapi.start(assistantId)
    }
  }

  const endCall = () => {
    if (vapi) {
      vapi.stop()
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {!isConnected ? (
        <button
          onClick={startCall}
          className="group flex items-center gap-3 bg-teal-600 hover:bg-teal-700 text-white border-none rounded-full px-6 py-4 text-base font-semibold cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <Phone className="w-5 h-5 group-hover:animate-pulse" />
          <span>Talk to Assistant</span>
        </button>
      ) : (
        <div
          className="w-full md:w-40vw h-75vw bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-gray-700"
          // style={{ width: "40vw", height: "75vh" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div
                  className={`w-3 h-3 rounded-full ${isSpeaking ? "bg-red-500 animate-pulse" : "bg-teal-500"}`}
                ></div>
                {isSpeaking && <div className="absolute inset-0 w-3 h-3 rounded-full bg-red-500 animate-ping"></div>}
              </div>
              <div className="flex items-center gap-2">
                {isSpeaking ? <MicOff className="w-4 h-4 text-red-500" /> : <Mic className="w-4 h-4 text-teal-500" />}
                <span className="font-semibold text-gray-900 dark:text-white text-sm">
                  {isSpeaking ? "Assistant Speaking..." : "Listening..."}
                </span>
              </div>
            </div>
            <button
              onClick={endCall}
              className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white border-none rounded-lg px-3 py-2 text-xs font-medium cursor-pointer transition-colors duration-200"
            >
              <PhoneOff className="w-3 h-3" />
              End Call
            </button>
          </div>

          <div
            className="flex-1 overflow-y-auto mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 scrollbar-hide"
            style={{ height: "calc(75vh - 120px)" }}
          >
            {transcript.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                Conversation will appear here...
              </p>
            ) : (
              <div className="space-y-3">
                {transcript.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                        msg.role === "user"
                          ? "bg-teal-600 text-white rounded-br-md"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default VapiWidget
