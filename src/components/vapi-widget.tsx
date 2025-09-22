'use client'

import Script from 'next/script'
import { useEffect } from 'react'

interface SimpleVapiWidgetProps {
  publicKey: string
  assistantId: string
}

// Declare the custom element for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'vapi-widget': any
    }
  }
}

export default function SimpleVapiWidget({ publicKey, assistantId }: SimpleVapiWidgetProps) {
  useEffect(() => {
    // This effect runs after the component mounts
    // The widget will be created by the script
  }, [])

  return (
    <>
      <Script
        src="https://unpkg.com/@vapi-ai/client-sdk-react/dist/embed/widget.umd.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Vapi widget script loaded')
        }}
        onError={() => {
          console.error('Failed to load Vapi widget script')
        }}
      />
      
      <vapi-widget
        public-key={publicKey}
        assistant-id={assistantId}
        mode="voice"
        theme="dark"
        base-bg-color="#000000"
        accent-color="#14B8A6"
        cta-button-color="#000000"
        cta-button-text-color="#ffffff"
        border-radius="large"
        size="compact"
        position="bottom-right"
        title="TALK WITH AI"
        start-button-text="Start"
        end-button-text="End Call"
        chat-first-message="Hey, How can I help you today?"
        chat-placeholder="Type your message..."
        voice-show-transcript="true"
        consent-required="true"
        consent-title="Terms and conditions"
        consent-content="By clicking 'Agree,' and each time I interact with this AI agent, I consent to the recording, storage, and sharing of my communications with third-party service providers."
        consent-storage-key="vapi_widget_consent"
      />
    </>
  )
}