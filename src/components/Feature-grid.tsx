import React from 'react'
import { Card } from '@/components/ui/card'
import { Waves, Brain, Zap } from 'lucide-react'


const FeatureGrid = () => {
  return (
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
  )
}

export default FeatureGrid