"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Settings, Key, ExternalLink } from "lucide-react"

interface VapiSettingsProps {
  publicKey: string
  onPublicKeyChange: (key: string) => void
  assistantId: string
  onAssistantIdChange: (id: string) => void
  isConnected: boolean
}

export function VapiSettings({ publicKey, onPublicKeyChange, assistantId, onAssistantIdChange, isConnected }: VapiSettingsProps) {
  const [tempKey, setTempKey] = useState(publicKey || process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN!)
  const [tempAssistantId, setTempAssistantId] = useState(assistantId || process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!)

  const handleSave = () => {
    onPublicKeyChange(tempKey)
    onAssistantIdChange(tempAssistantId)
  }

  return (
    <Card className="p-6 glass-strong shadow-xl border-border/50 max-w-md mx-auto">
      <div className="flex items-center mb-6">
        <Settings className="w-5 h-5 text-primary mr-3" />
        <h3 className="text-lg font-heading font-semibold text-foreground">Vapi Configuration</h3>
        {isConnected && (
          <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20 ml-auto">
            Connected
          </Badge>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="publicKey" className="text-sm font-medium text-foreground mb-2 block">
            Public Key
          </Label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="publicKey"
              type="password"
              placeholder="Enter your Vapi Public Key"
              // defaultValue={process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN}
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              className="pl-10 bg-background/50 border-border/50 focus:border-primary/50"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="assistantId" className="text-sm font-medium text-foreground mb-2 block">
            Assistant ID (Optional)
          </Label>
          <div className="relative">
            <Settings className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="assistantId"
              type="text"
              placeholder="Enter Assistant ID (optional)"
              // defaultValue={process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID}
              value={tempAssistantId}
              onChange={(e) => setTempAssistantId(e.target.value)}
              className="pl-10 bg-background/50 border-border/50 focus:border-primary/50"
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={!tempKey.trim() || tempKey === publicKey}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Save Configuration
        </Button>

        <div className="pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-2">Don't have a Vapi account yet?</p>
          <Button
            variant="outline"
            size="sm"
            className="w-full glass hover:bg-accent/10 border-accent/50 bg-transparent"
            onClick={() => window.open("https://vapi.ai", "_blank")}
          >
            <ExternalLink className="w-3 h-3 mr-2" />
            Get Your API Key
          </Button>
        </div>
      </div>
    </Card>
  )
}
