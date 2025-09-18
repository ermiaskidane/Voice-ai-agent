declare module "@vapi-ai/web" {
  export interface VapiEventMap {
    "call-start": () => void
    "call-end": () => void
    "speech-start": () => void
    "speech-end": () => void
    message: (message: VapiMessage) => void
    error: (error: any) => void
  }

  export interface VapiMessage {
    type: "transcript" | "function-call" | "hang" | "speech-update"
    transcript?: string
    role?: "user" | "assistant"
    isFinal?: boolean
    functionCall?: any
  }

  export interface VapiAssistant {
    model: {
      provider: string
      model: string
      messages: Array<{
        role: string
        content: string
      }>
    }
    voice: {
      provider: string
      voiceId: string
    }
    firstMessage?: string
  }

  export default class Vapi {
    constructor(publicKey: string)
    start(assistant: VapiAssistant | string): Promise<void>
    stop(): void
    setMuted(muted: boolean): void
    isMuted(): boolean
    on<K extends keyof VapiEventMap>(event: K, listener: VapiEventMap[K]): void
    off<K extends keyof VapiEventMap>(event: K, listener: VapiEventMap[K]): void
  }
}
