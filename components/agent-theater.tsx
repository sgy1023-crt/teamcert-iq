"use client"

import { useEffect, useRef, useState } from "react"
import type { AgentTrace } from "@/lib/types"

// Persona metadata for each agent — avatar emoji + accent color + role line
const AGENT_PERSONAS: Record<string, { emoji: string; color: string; role: string }> = {
  "Learner Profile Agent": { emoji: "🧑‍💼", color: "oklch(55% 0.16 260)", role: "Parses the learner's context" },
  "Learning Path Curator Agent": { emoji: "🎯", color: "oklch(55% 0.16 200)", role: "Retrieves & ranks skills" },
  "Study Plan Generator Agent": { emoji: "📅", color: "oklch(58% 0.15 160)", role: "Builds the daily schedule" },
  "Assessment Agent": { emoji: "📝", color: "oklch(60% 0.15 120)", role: "Writes practice questions" },
  "Verifier & Safety Agent": { emoji: "🛡️", color: "oklch(58% 0.16 80)", role: "Audits citations & PII" },
  "Manager Insights Agent": { emoji: "👔", color: "oklch(58% 0.16 30)", role: "Coaches the manager" },
  "Composer Agent": { emoji: "🧩", color: "oklch(55% 0.16 320)", role: "Assembles the final report" },
}

const fallbackPersona = { emoji: "🤖", color: "oklch(55% 0.02 250)", role: "Agent" }

function AgentMessage({
  trace,
  active,
  onDone,
}: {
  trace: AgentTrace
  active: boolean
  onDone: () => void
}) {
  const persona = AGENT_PERSONAS[trace.agentName] || fallbackPersona
  const [thinking, setThinking] = useState(false)
  const [displayText, setDisplayText] = useState("")
  const finishedRef = useRef(false)

  // Thinking animation
  useEffect(() => {
    if (!active || finishedRef.current) return

    setThinking(true)
    const t = setTimeout(() => {
      setThinking(false)
    }, 600)
    return () => {
      clearTimeout(t)
      // Don't reset thinking here - let it complete
    }
  }, [active])

  // Typewriter effect
  useEffect(() => {
    if (!active || thinking || finishedRef.current) return

    let i = 0
    const id = setInterval(() => {
      i++
      setDisplayText(trace.detail.slice(0, i))
      if (i >= trace.detail.length) {
        clearInterval(id)
        finishedRef.current = true
        setTimeout(onDone, 350)
      }
    }, 12)
    return () => clearInterval(id)
  }, [active, thinking, trace.detail, onDone])

  // For skip: show full text immediately for non-active already-seen messages
  useEffect(() => {
    if (!active && displayText === "" && !finishedRef.current) {
      setDisplayText(trace.detail)
      finishedRef.current = true
    }
  }, [active, displayText, trace.detail])

  return (
    <div className="flex gap-3 items-start animate-fadeIn">
      {/* Avatar */}
      <div
        className="shrink-0 size-10 rounded-full flex items-center justify-center text-lg"
        style={{ background: persona.color.replace(")", " / 0.15)"), border: `2px solid ${persona.color}` }}
      >
        {persona.emoji}
      </div>
      {/* Bubble */}
      <div className="flex-1">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-semibold" style={{ fontSize: "0.875rem", color: persona.color }}>
            {trace.agentName}
          </span>
          <span style={{ fontSize: "0.7rem", color: "oklch(60% 0.025 250)" }}>{persona.role}</span>
          {trace.timestamp > 0 && (
            <span style={{ fontSize: "0.7rem", color: "oklch(65% 0.02 250)" }}>· {trace.timestamp}ms</span>
          )}
        </div>
        <div
          className="p-3 rounded-xl rounded-tl-sm"
          style={{ background: "oklch(98% 0.004 250)", border: "1px solid oklch(92% 0.006 250)" }}
        >
          {thinking ? (
            <span className="inline-flex gap-1 py-1" aria-label="thinking">
              <span className="size-2 rounded-full animate-bounce" style={{ background: persona.color, animationDelay: "0ms" }} />
              <span className="size-2 rounded-full animate-bounce" style={{ background: persona.color, animationDelay: "150ms" }} />
              <span className="size-2 rounded-full animate-bounce" style={{ background: persona.color, animationDelay: "300ms" }} />
            </span>
          ) : (
            <p style={{ fontSize: "0.875rem", color: "oklch(35% 0.015 250)", lineHeight: 1.6 }}>
              {displayText}
              {!finishedRef.current && displayText.length < trace.detail.length && (
                <span className="inline-block w-1.5 h-4 ml-0.5 align-middle animate-pulse" style={{ background: persona.color }} />
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export function AgentTheater({ trace }: { trace: AgentTrace[] }) {
  const [visibleCount, setVisibleCount] = useState(1)
  const [playing, setPlaying] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  const advance = () => {
    setVisibleCount((c) => Math.min(c + 1, trace.length))
    // Don't set playing=false here, let the last agent finish first
  }

  const finishPlaying = () => {
    setPlaying(false)
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [visibleCount])

  const replay = () => {
    setVisibleCount(1)
    setPlaying(true)
  }

  const skip = () => {
    setVisibleCount(trace.length)
    setPlaying(false)
  }

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2.5">
            {playing && (
              <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping" style={{ background: "oklch(60% 0.16 160)" }} />
            )}
            <span className="relative inline-flex rounded-full size-2.5" style={{ background: playing ? "oklch(60% 0.16 160)" : "oklch(70% 0.02 250)" }} />
          </span>
          <span style={{ fontSize: "0.8125rem", color: "oklch(50% 0.025 250)" }}>
            {playing ? "Agents collaborating…" : "Pipeline complete"} ({Math.min(visibleCount, trace.length)}/{trace.length})
          </span>
        </div>
        <div className="flex gap-2">
          {playing ? (
            <button
              onClick={skip}
              className="text-xs px-3 py-1.5 rounded-lg font-medium"
              style={{ background: "oklch(95% 0.006 250)", color: "oklch(45% 0.025 250)" }}
            >
              Skip ⏭
            </button>
          ) : (
            <button
              onClick={replay}
              className="text-xs px-3 py-1.5 rounded-lg font-medium"
              style={{ background: "oklch(94% 0.04 260)", color: "oklch(40% 0.12 260)" }}
            >
              Replay ↻
            </button>
          )}
        </div>
      </div>

      {/* Message stream */}
      <div ref={scrollRef} className="space-y-4 max-h-[480px] overflow-y-auto pr-2">
        {trace.slice(0, visibleCount).map((t, idx) => {
          const isLastAgent = idx === trace.length - 1
          const isActive = idx === visibleCount - 1 && playing

          return (
            <AgentMessage
              key={idx}
              trace={t}
              active={isActive}
              onDone={isLastAgent ? finishPlaying : advance}
            />
          )
        })}
      </div>
    </div>
  )
}
