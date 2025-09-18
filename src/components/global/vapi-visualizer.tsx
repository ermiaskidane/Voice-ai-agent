"use client"

import { useEffect, useState } from "react"

interface VoiceVisualizerProps {
  isActive: boolean
  type: "listening" | "speaking"
}

export function VoiceVisualizer({ isActive, type }: VoiceVisualizerProps) {
  const [bars, setBars] = useState<number[]>(Array(12).fill(0))

  useEffect(() => {
    if (!isActive) {
      setBars(Array(12).fill(0))
      return
    }

    const interval = setInterval(
      () => {
        setBars((prev) => prev.map(() => Math.random() * 100))
      },
      type === "listening" ? 150 : 100,
    )

    return () => clearInterval(interval)
  }, [isActive, type])

  return (
    <div className="flex items-center justify-center gap-1 h-16">
      {bars.map((height, index) => (
        <div
          key={index}
          className={`w-1 rounded-full transition-all duration-150 ${
            type === "listening" ? "bg-gradient-to-t from-primary to-accent" : "bg-gradient-to-t from-accent to-primary"
          }`}
          style={{
            height: isActive ? `${Math.max(height * 0.6, 8)}px` : "8px",
            opacity: isActive ? 0.8 : 0.3,
          }}
        />
      ))}
    </div>
  )
}
