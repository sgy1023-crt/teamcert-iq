"use client"

import { useEffect, useRef, useState } from "react"

// ─────────────────────────────────────────────────────────────
// SkillRadar — spider chart of current vs target scores per skill
// ─────────────────────────────────────────────────────────────
interface RadarSkill {
  skill: string
  currentScore?: number
  targetScore: number
}

export function SkillRadar({ skills }: { skills: RadarSkill[] }) {
  const [hover, setHover] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(t)
  }, [])

  const size = 320
  const center = size / 2
  const maxR = 120
  const n = Math.max(skills.length, 3)

  // Angle for each axis (start at top, go clockwise)
  const angleFor = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2
  const pointFor = (i: number, value: number) => {
    const r = (value / 100) * maxR
    const a = angleFor(i)
    return { x: center + r * Math.cos(a), y: center + r * Math.sin(a) }
  }

  const polygon = (key: "currentScore" | "targetScore") =>
    skills
      .map((s, i) => {
        const v = key === "currentScore" ? s.currentScore ?? 0 : s.targetScore
        const p = pointFor(i, mounted ? v : 0)
        return `${p.x},${p.y}`
      })
      .join(" ")

  // Grid rings at 25/50/75/100
  const rings = [25, 50, 75, 100]

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} role="img" aria-label="Skill proficiency radar chart">
        {/* Grid rings */}
        {rings.map((ring) => (
          <polygon
            key={ring}
            points={skills
              .map((_, i) => {
                const p = pointFor(i, ring)
                return `${p.x},${p.y}`
              })
              .join(" ")}
            fill="none"
            stroke="oklch(90% 0.006 250)"
            strokeWidth={1}
          />
        ))}
        {/* Axis lines */}
        {skills.map((_, i) => {
          const p = pointFor(i, 100)
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={p.x}
              y2={p.y}
              stroke="oklch(90% 0.006 250)"
              strokeWidth={1}
            />
          )
        })}
        {/* Target polygon */}
        <polygon
          points={polygon("targetScore")}
          fill="oklch(55% 0.16 160 / 0.12)"
          stroke="oklch(50% 0.14 160)"
          strokeWidth={2}
          strokeDasharray="4 3"
          style={{ transition: "all 700ms cubic-bezier(0.22,1,0.36,1)" }}
        />
        {/* Current polygon */}
        <polygon
          points={polygon("currentScore")}
          fill="oklch(50% 0.18 260 / 0.18)"
          stroke="oklch(50% 0.18 260)"
          strokeWidth={2.5}
          style={{ transition: "all 700ms cubic-bezier(0.22,1,0.36,1)" }}
        />
        {/* Data points (current) */}
        {skills.map((s, i) => {
          const p = pointFor(i, mounted ? s.currentScore ?? 0 : 0)
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={hover === i ? 6 : 4}
              fill="oklch(50% 0.18 260)"
              stroke="white"
              strokeWidth={2}
              style={{ transition: "all 300ms ease", cursor: "pointer" }}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
          )
        })}
        {/* Axis labels */}
        {skills.map((s, i) => {
          const p = pointFor(i, 118)
          const a = angleFor(i)
          const anchor = Math.abs(Math.cos(a)) < 0.3 ? "middle" : Math.cos(a) > 0 ? "start" : "end"
          // shorten long skill names
          const label = s.skill.length > 18 ? s.skill.split(" ").slice(0, 2).join(" ") : s.skill
          return (
            <text
              key={i}
              x={p.x}
              y={p.y}
              textAnchor={anchor}
              dominantBaseline="middle"
              style={{
                fontSize: "10px",
                fill: hover === i ? "oklch(40% 0.12 260)" : "oklch(50% 0.025 250)",
                fontWeight: hover === i ? 700 : 500,
                transition: "all 200ms",
              }}
            >
              {label}
            </text>
          )
        })}
      </svg>
      {/* Hover tooltip */}
      <div className="h-6 mt-1 text-center">
        {hover !== null && skills[hover] && (
          <span style={{ fontSize: "0.8125rem", color: "oklch(40% 0.02 250)" }}>
            <strong>{skills[hover].skill}</strong>: {skills[hover].currentScore ?? 0}% →{" "}
            <span style={{ color: "oklch(45% 0.14 160)" }}>{skills[hover].targetScore}%</span>
          </span>
        )}
      </div>
      {/* Legend */}
      <div className="flex gap-5 mt-1">
        <span className="flex items-center gap-1.5" style={{ fontSize: "0.75rem", color: "oklch(50% 0.025 250)" }}>
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "oklch(50% 0.18 260)" }} />
          Current
        </span>
        <span className="flex items-center gap-1.5" style={{ fontSize: "0.75rem", color: "oklch(50% 0.025 250)" }}>
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "oklch(50% 0.14 160)", opacity: 0.5 }} />
          Target
        </span>
      </div>
    </div>
  )
}
// ─────────────────────────────────────────────────────────────
// ReadinessRing — animated circular progress for the readiness score
// ─────────────────────────────────────────────────────────────
export function ReadinessRing({
  score,
  level,
}: {
  score: number
  level: "Low" | "Moderate" | "High"
}) {
  const [animScore, setAnimScore] = useState(0)
  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const duration = 1200
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3)
      setAnimScore(Math.round(eased * score))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [score])

  const size = 180
  const stroke = 14
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (animScore / 100) * circumference

  const palette = {
    Low: { from: "oklch(60% 0.20 20)", to: "oklch(65% 0.18 35)", text: "oklch(48% 0.18 20)" },
    Moderate: { from: "oklch(70% 0.16 75)", to: "oklch(72% 0.15 90)", text: "oklch(48% 0.14 70)" },
    High: { from: "oklch(60% 0.16 160)", to: "oklch(65% 0.15 150)", text: "oklch(42% 0.14 160)" },
  }[level]

  const gradId = `ring-grad-${level}`

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={palette.from} />
              <stop offset="100%" stopColor={palette.to} />
            </linearGradient>
          </defs>
          {/* Track */}
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="oklch(93% 0.006 250)" strokeWidth={stroke} />
          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 80ms linear" }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-extrabold leading-none" style={{ fontSize: "2.75rem", color: palette.text }}>
            {animScore}
          </span>
          <span style={{ fontSize: "0.75rem", color: "oklch(55% 0.025 250)", letterSpacing: "0.08em" }}>
            / 100
          </span>
        </div>
      </div>
      <span
        className="mt-3 px-4 py-1.5 rounded-full font-semibold text-sm"
        style={{ background: `${palette.from.replace(")", " / 0.12)")}`, color: palette.text }}
      >
        {level} Readiness
      </span>
    </div>
  )
}
// ─────────────────────────────────────────────────────────────
// LearningTimeline — horizontal week-by-week path with hover detail
// ─────────────────────────────────────────────────────────────
interface TimelineWeek {
  skill: string
  priority: "High" | "Medium" | "Low"
  llmReason?: string
}

export function LearningTimeline({ weeks }: { weeks: TimelineWeek[] }) {
  const [active, setActive] = useState(0)
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(t)
  }, [])

  const priorityColor = (p: string) =>
    p === "High" ? "oklch(58% 0.18 20)" : p === "Medium" ? "oklch(68% 0.15 75)" : "oklch(58% 0.14 160)"

  return (
    <div>
      {/* Track */}
      <div className="relative px-4 py-6">
        {/* Connecting line */}
        <div
          className="absolute top-1/2 left-4 right-4 h-1 rounded-full -translate-y-1/2"
          style={{ background: "oklch(92% 0.006 250)" }}
        />
        <div
          className="absolute top-1/2 left-4 h-1 rounded-full -translate-y-1/2"
          style={{
            background: "linear-gradient(90deg, oklch(50% 0.18 260), oklch(55% 0.14 200))",
            width: mounted ? `calc((100% - 2rem) * ${(active + 1) / weeks.length})` : "0%",
            transition: "width 600ms cubic-bezier(0.22,1,0.36,1)",
          }}
        />
        {/* Nodes */}
        <div className="relative flex justify-between">
          {weeks.map((w, i) => (
            <button
              key={i}
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(i)}
              className="flex flex-col items-center gap-2 group"
              style={{ flex: 1 }}
            >
              <div
                className="size-9 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300"
                style={{
                  background: i <= active ? priorityColor(w.priority) : "oklch(98% 0.004 250)",
                  borderColor: i <= active ? priorityColor(w.priority) : "oklch(88% 0.008 250)",
                  color: i <= active ? "white" : "oklch(60% 0.025 250)",
                  transform: active === i ? "scale(1.2)" : "scale(1)",
                  boxShadow: active === i ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
                }}
              >
                {i + 1}
              </div>
              <span
                className="text-xs font-medium"
                style={{ color: active === i ? "oklch(35% 0.02 250)" : "oklch(60% 0.025 250)" }}
              >
                Week {i + 1}
              </span>
            </button>
          ))}
        </div>
      </div>
      {/* Active week detail */}
      {weeks[active] && (
        <div
          className="mt-2 p-4 rounded-xl border animate-fadeIn"
          style={{ background: "oklch(99% 0.003 250)", borderColor: "oklch(90% 0.006 250)" }}
        >
          <div className="flex items-center gap-3 mb-2">
            <span
              className="px-2.5 py-1 rounded-lg text-xs font-bold text-white"
              style={{ background: priorityColor(weeks[active].priority) }}
            >
              {weeks[active].priority} Priority
            </span>
            <span className="font-semibold" style={{ fontSize: "1rem", color: "oklch(25% 0.015 250)" }}>
              {weeks[active].skill}
            </span>
          </div>
          {weeks[active].llmReason && (
            <p style={{ fontSize: "0.875rem", color: "oklch(48% 0.02 250)", lineHeight: 1.6 }}>
              {weeks[active].llmReason}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
// ─────────────────────────────────────────────────────────────
// TeamComparison — benchmark this learner against synthetic team data
// ─────────────────────────────────────────────────────────────
export function TeamComparison({
  score,
  studyDays,
  role,
}: {
  score: number
  studyDays: number
  role: string
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 150)
    return () => clearTimeout(t)
  }, [])

  // Synthetic team benchmark (clearly labeled as demo data)
  const teamAvg = 68
  const topPerformer = 89
  const peerAvgDays = 35

  const bars = [
    { label: "You", value: score, color: "oklch(50% 0.18 260)", highlight: true },
    { label: "Team Average", value: teamAvg, color: "oklch(60% 0.08 250)", highlight: false },
    { label: "Top Performer", value: topPerformer, color: "oklch(58% 0.14 160)", highlight: false },
  ]
  const maxVal = 100

  // Rank: how many of the 3 reference points you beat + yourself
  const rankPercentile = score >= topPerformer ? 95 : score >= teamAvg ? 60 + Math.round((score - teamAvg) / (topPerformer - teamAvg) * 30) : Math.round((score / teamAvg) * 50)

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded"
          style={{ background: "oklch(95% 0.012 260)", color: "oklch(50% 0.08 260)" }}
        >
          DEMO BENCHMARK
        </span>
        <span style={{ fontSize: "0.8125rem", color: "oklch(55% 0.025 250)" }}>
          Synthetic team data for illustration
        </span>
      </div>

      {/* Bar comparison */}
      <div className="space-y-3">
        {bars.map((b) => (
          <div key={b.label}>
            <div className="flex justify-between mb-1">
              <span
                className="font-medium"
                style={{ fontSize: "0.875rem", color: b.highlight ? "oklch(35% 0.12 260)" : "oklch(50% 0.025 250)", fontWeight: b.highlight ? 700 : 500 }}
              >
                {b.label}
              </span>
              <span className="font-semibold" style={{ fontSize: "0.875rem", color: b.color }}>
                {b.value}
              </span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: "oklch(95% 0.006 250)" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: mounted ? `${(b.value / maxVal) * 100}%` : "0%",
                  background: b.highlight
                    ? "linear-gradient(90deg, oklch(50% 0.18 260), oklch(55% 0.16 240))"
                    : b.color,
                  transition: "width 800ms cubic-bezier(0.22,1,0.36,1)",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Stat callouts */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-xl text-center" style={{ background: "oklch(96% 0.012 260)" }}>
          <div className="font-extrabold" style={{ fontSize: "1.75rem", color: "oklch(40% 0.14 260)" }}>
            Top {100 - rankPercentile}%
          </div>
          <div style={{ fontSize: "0.75rem", color: "oklch(50% 0.025 250)" }}>
            Estimated rank in {role} cohort
          </div>
        </div>
        <div className="p-4 rounded-xl text-center" style={{ background: "oklch(97% 0.025 160)" }}>
          <div className="font-extrabold" style={{ fontSize: "1.75rem", color: "oklch(40% 0.14 160)" }}>
            {studyDays < peerAvgDays ? `${peerAvgDays - studyDays}d faster` : `${studyDays - peerAvgDays}d slower`}
          </div>
          <div style={{ fontSize: "0.75rem", color: "oklch(50% 0.025 250)" }}>
            vs peer avg ({peerAvgDays}d plan)
          </div>
        </div>
      </div>
    </div>
  )
}
// ─────────────────────────────────────────────────────────────
// SourceExplorer — clickable citations that reveal grounding evidence
// ─────────────────────────────────────────────────────────────
interface SourceChunk {
  sourceId: string
  title: string
  text: string
  score: number
}

export function SourceExplorer({
  sources,
  chunks,
}: {
  sources: string[]
  chunks?: SourceChunk[]
}) {
  const [open, setOpen] = useState<SourceChunk | null>(null)

  const chunkFor = (sourceId: string) => chunks?.find((c) => c.sourceId === sourceId)

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {sources.map((source, idx) => {
          const chunk = chunkFor(source)
          return (
            <button
              key={idx}
              onClick={() => chunk && setOpen(chunk)}
              disabled={!chunk}
              className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1.5 rounded-lg transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: chunk ? "oklch(92% 0.02 260)" : "oklch(95% 0.006 250)",
                color: "oklch(38% 0.12 260)",
                cursor: chunk ? "pointer" : "default",
                boxShadow: chunk ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}
            >
              <span>{source}</span>
              {chunk && <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>🔍</span>}
            </button>
          )
        })}
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
          style={{ background: "oklch(20% 0.02 250 / 0.5)", backdropFilter: "blur(4px)" }}
          onClick={() => setOpen(null)}
        >
          <div
            className="max-w-lg w-full rounded-2xl border p-6 relative"
            style={{ background: "oklch(100% 0 0)", borderColor: "oklch(88% 0.008 250)", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(null)}
              className="absolute top-4 right-4 size-7 rounded-full flex items-center justify-center"
              style={{ background: "oklch(95% 0.006 250)", color: "oklch(50% 0.025 250)" }}
              aria-label="Close"
            >
              ✕
            </button>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg" aria-hidden="true">📄</span>
              <span className="font-mono text-sm font-semibold" style={{ color: "oklch(38% 0.12 260)" }}>
                {open.sourceId}
              </span>
            </div>
            {/* Relevance score bar */}
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span style={{ fontSize: "0.75rem", color: "oklch(55% 0.025 250)" }}>Retrieval relevance</span>
                <span className="font-semibold" style={{ fontSize: "0.75rem", color: "oklch(40% 0.14 160)" }}>
                  {(open.score * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "oklch(95% 0.006 250)" }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.min(open.score * 100, 100)}%`, background: "oklch(55% 0.14 160)" }}
                />
              </div>
            </div>
            {/* Document title */}
            <div className="mb-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ background: "oklch(95% 0.012 260)", color: "oklch(45% 0.10 260)" }}>
                {open.title}
              </span>
            </div>
            {/* Chunk text */}
            <p
              className="p-4 rounded-xl"
              style={{ background: "oklch(98% 0.004 250)", fontSize: "0.875rem", color: "oklch(35% 0.015 250)", lineHeight: 1.7 }}
            >
              {open.text}
            </p>
            <p className="mt-3 text-center" style={{ fontSize: "0.75rem", color: "oklch(60% 0.025 250)" }}>
              Retrieved from synthetic knowledge base via keyword matching
            </p>
          </div>
        </div>
      )}
    </>
  )
}

