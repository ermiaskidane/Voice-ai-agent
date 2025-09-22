import React from 'react'
import { Sparkles, MicOff, Mic, Settings, Volume2, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { VoiceVisualizer } from "@/components/global/vapi-visualizer"

interface HomeViewProps {
  isListening: boolean
  isSpeaking: boolean
  currentTranscript: string
  isConnected: boolean
  publicKey: string
  assistantId: string
  setShowSettings: (show: boolean) => void
  toggleConnection: () => void
}

const HomeView = ({ isListening, isSpeaking, currentTranscript, isConnected, publicKey, assistantId, setShowSettings, toggleConnection }: HomeViewProps) => {
  return (
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
            <div className="flex items-center gap-4 py-4">
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
                className="cursor-pointer px-6 py-4 text-lg glass !hover:bg-accent/10 border !border-accent  bg-transparent"
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
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 !border-blue-500/20 px-4 py-2">
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
  )
}

export default HomeView