"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Bot, User, Send, Settings, Calendar, CheckCircle, AlertCircle } from "lucide-react"

interface ChatMessage {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
  type?: "appointment" | "confirmation" | "error"
}


interface N8nAppointmentChatbotProps {
  webhookUrl: string
  onWebhookUrlChange: (url: string) => void
}

export function N8nAppointmentChatbot({ webhookUrl, onWebhookUrlChange }: N8nAppointmentChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [conversationStep, setConversationStep] = useState<string>("greeting")

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: ChatMessage = {
      id: "welcome",
      text: "Hi! I'm your appointment booking assistant at medicClinic. I can help you schedule appointments through our automated system. What would you like to book today?",
      sender: "bot",
      timestamp: new Date(),
    }
    setMessages([welcomeMessage])
  }, [])

  const sendToN8n = async (inputMessage: any) => {
    if (!webhookUrl) {
      throw new Error("N8N webhook URL not configured")
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: inputMessage }),
    })

    if (!response.ok) {
      throw new Error(`N8N webhook failed: ${response.statusText}`)
    }

    return await response.json().then(res => res.results[0].result)
  }


  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const botResponse = await sendToN8n(inputMessage)
      console.log("botResponse", botResponse)
    
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: "bot",
        timestamp: new Date(),
        type: conversationStep === "confirmation" ? "confirmation" : conversationStep === "error" ? "error" : undefined,
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I encountered an error. Please try again or check the webhook configuration.",
        sender: "bot",
        timestamp: new Date(),
        type: "error",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-heading font-bold text-foreground mb-4">AI Appointment Assistant</h2>
        <p className="text-lg text-muted-foreground">
          Chat with our AI to book appointments seamlessly through n8n automation
        </p>
      </div>

      {showSettings && (
        <Card className="p-6 mb-6 glass border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">N8N Configuration</h3>
            <Button onClick={() => setShowSettings(false)} variant="ghost" size="sm">
              ✕
            </Button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">N8N Webhook URL</label>
              <Input
                type="url"
                placeholder="https://your-n8n-instance.com/webhook/appointment"
                value={webhookUrl}
                onChange={(e) => onWebhookUrlChange(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Configure your N8N webhook URL to receive appointment data
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card className="glass-strong shadow-2xl border-border/50 overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mr-3">
                <Calendar className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Appointment Bot</h3>
                <p className="text-sm text-muted-foreground">Ready to help you book</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {webhookUrl && (
                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  N8N Connected
                </Badge>
              )}
              <Button onClick={() => setShowSettings(!showSettings)} variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col h-[500px]">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background/50 to-background/30">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}
              >
                <div
                  className={`flex items-end space-x-2 max-w-[85%] ${message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-gradient-to-r from-accent to-primary text-primary-foreground"
                    }`}
                  >
                    {message.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className={`flex flex-col ${message.sender === "user" ? "items-end" : "items-start"}`}>
                    <div
                      className={`px-4 py-3 rounded-2xl shadow-sm ${
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : message.type === "confirmation"
                            ? "bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 rounded-bl-md border border-green-200 dark:border-green-800"
                            : message.type === "error"
                              ? "bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100 rounded-bl-md border border-red-200 dark:border-red-800"
                              : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md border border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <div className="text-sm leading-relaxed whitespace-pre-line">{message.text}</div>
                      {message.type === "confirmation" && (
                        <div className="flex items-center mt-2 pt-2 border-t border-green-200 dark:border-green-800">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          <span className="text-xs font-medium text-green-700 dark:text-green-300">
                            Appointment Booked
                          </span>
                        </div>
                      )}
                      {message.type === "error" && (
                        <div className="flex items-center mt-2 pt-2 border-t border-red-200 dark:border-red-800">
                          <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                          <span className="text-xs font-medium text-red-700 dark:text-red-300">Booking Error</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 px-2">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-200">
                <div className="flex items-end space-x-2 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-accent to-primary flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary-foreground animate-pulse" />
                  </div>
                  <div className="flex flex-col items-start">
                    <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 px-2">thinking...</p>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-background/80 border-t border-border/50 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                size="sm"
                className="px-4"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            {!webhookUrl && (
              <p className="text-xs text-orange-600 mt-2 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                Configure N8N webhook URL in settings to enable appointment booking
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
