"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { DemoScenarioCard } from "./demo-scenario-card"
import type { LearnerInput } from "@/lib/types"

// SliderField — keeps the drag in LOCAL state so dragging never triggers a
// parent re-render (which is what makes controlled range inputs freeze and
// only move one direction). The parent only learns the value on pointer-up
// / blur, which is all we need since the value is read when Run is clicked.
function SliderField({
  label,
  value,
  min,
  max,
  suffix = "",
  onCommit,
  disabled,
}: {
  label: string
  value: number
  min: number
  max: number
  suffix?: string
  onCommit: (v: number) => void
  disabled?: boolean
}) {
  const [local, setLocal] = useState(value)

  // Sync from parent when the preset changes (e.g. switching candidate).
  // Does not fire mid-drag because the parent value is static while dragging.
  useEffect(() => {
    setLocal(value)
  }, [value])

  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: "oklch(35% 0.02 250)" }}>
        {label}: <span className="font-bold" style={{ color: "oklch(50% 0.18 260)" }}>{local}{suffix}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={local}
        onChange={(e) => setLocal(parseInt(e.target.value))}
        onPointerUp={(e) => onCommit(parseInt(e.currentTarget.value))}
        onBlur={(e) => onCommit(parseInt(e.currentTarget.value))}
        disabled={disabled}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        style={{ accentColor: "oklch(50% 0.18 260)" }}
      />
    </div>
  )
}

interface HeroSectionProps {
  onRunDemo: () => void
  isLoading?: boolean
  selectedCandidate: "alex" | "maya" | "jordan"
  onCandidateChange: (candidate: "alex" | "maya" | "jordan") => void
  inputValues: LearnerInput
  onInputChange: (values: Partial<LearnerInput>) => void
  llmConfigured: boolean | null
  llmProvider?: string | null
  llmDefaultModel?: string | null
}

const badges = [
  { icon: "🤖", label: "Reasoning Agents Track" },
  { icon: "📚", label: "Foundry IQ Grounded" },
  { icon: "🔒", label: "Synthetic Data Only" },
  { icon: "🔄", label: "7-Agent Workflow" },
]

const candidateInfo = {
  alex: { name: "Alex Chen", role: "Cloud Engineer", cert: "AZ-204", score: 42, readiness: "45-55" },
  maya: { name: "Maya Patel", role: "DevOps Engineer", cert: "AZ-400", score: 71, readiness: "68-78" },
  jordan: { name: "Jordan Lee", role: "Data Engineer", cert: "DP-203", score: 86, readiness: "82-92" },
}

export function HeroSection({ onRunDemo, isLoading, selectedCandidate, onCandidateChange, inputValues, onInputChange, llmConfigured, llmProvider, llmDefaultModel }: HeroSectionProps) {
  return (
    <section className="w-full py-16 md:py-24 px-6 md:px-12 lg:px-16 text-center">
      {/* Title */}
      <div className="max-w-6xl mx-auto">
        <h1
          className="text-balance font-extrabold leading-tight tracking-tight"
          style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", color: "oklch(22% 0.015 250)" }}
        >
          TeamCert IQ{" "}
          <span
            className="inline-block"
            style={{ fontSize: "clamp(2rem, 5vw, 3.8rem)" }}
            aria-label="graduation cap"
          >
            🎓
          </span>
        </h1>

        <p
          className="mt-5 text-balance leading-relaxed"
          style={{
            fontSize: "clamp(1rem, 2vw, 1.25rem)",
            color: "oklch(52% 0.025 250)",
            maxWidth: "680px",
            margin: "1.25rem auto 0",
          }}
        >
          Grounded multi-agent certification readiness for role-based enterprise upskilling
        </p>

        {/* Badges */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {badges.map((b, idx) => (
            <span
              key={b.label}
              className={cn(
                "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-300 cursor-default group hover:scale-105",
              )}
              style={{
                background: "oklch(94% 0.015 260)",
                borderColor: "oklch(80% 0.04 260)",
                color: "oklch(38% 0.12 260)",
                fontSize: "0.8125rem",
                animationDelay: `${idx * 100}ms`,
                animation: "fadeInUp 600ms ease-out backwards",
              }}
            >
              <span className="transition-transform duration-200 group-hover:scale-110">{b.icon}</span>
              {b.label}
            </span>
          ))}
        </div>

        {/* Candidate Selector */}
        <div className="mt-8 max-w-5xl mx-auto">
          <p className="font-semibold mb-3" style={{ fontSize: "0.9375rem", color: "oklch(30% 0.015 250)" }}>
            Select Demo Candidate:
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {(["alex", "maya", "jordan"] as const).map((key) => {
              const info = candidateInfo[key]
              const isSelected = selectedCandidate === key
              return (
                <button
                  key={key}
                  onClick={() => onCandidateChange(key)}
                  disabled={isLoading}
                  className="flex-1 min-w-[200px] p-4 rounded-xl border-2 text-left transition-all duration-200"
                  style={{
                    background: isSelected ? "oklch(96% 0.015 260)" : "oklch(100% 0 0)",
                    borderColor: isSelected ? "oklch(50% 0.18 260)" : "oklch(88% 0.008 250)",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    opacity: isLoading ? 0.6 : 1,
                  }}
                >
                  <p className="font-bold" style={{ fontSize: "0.9375rem", color: "oklch(28% 0.015 250)" }}>
                    {info.name}
                  </p>
                  <p style={{ fontSize: "0.8125rem", color: "oklch(52% 0.025 250)", marginTop: "0.25rem" }}>
                    {info.role} · {info.cert}
                  </p>
                  <p style={{ fontSize: "0.8125rem", color: "oklch(48% 0.025 250)", marginTop: "0.25rem" }}>
                    Practice: {info.score}% · Expected: {info.readiness}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Demo Scenario Card */}
        <DemoScenarioCard selectedCandidate={selectedCandidate} />

        {/* Editable Parameters */}
        <div className="mt-6 mx-auto max-w-5xl">
          <p className="font-semibold mb-3 text-left" style={{ fontSize: "0.9375rem", color: "oklch(30% 0.015 250)" }}>
            ⚙️ Adjust Parameters (Optional):
          </p>
          <div
            className="p-6 rounded-xl border text-left space-y-4"
            style={{
              background: "oklch(100% 0 0)",
              borderColor: "oklch(88% 0.008 250)",
            }}
          >
            <SliderField
              label="Practice Score"
              value={inputValues.practiceScore}
              min={0}
              max={100}
              suffix="%"
              onCommit={(v) => onInputChange({ practiceScore: v })}
              disabled={isLoading}
            />

            <SliderField
              label="Available Study Hours/Week"
              value={inputValues.availableStudyHoursPerWeek}
              min={0}
              max={20}
              suffix="h"
              onCommit={(v) => onInputChange({ availableStudyHoursPerWeek: v })}
              disabled={isLoading}
            />

            <SliderField
              label="Meeting Hours/Week"
              value={inputValues.meetingHoursPerWeek}
              min={0}
              max={40}
              suffix="h"
              onCommit={(v) => onInputChange({ meetingHoursPerWeek: v })}
              disabled={isLoading}
            />

            <p className="text-xs" style={{ color: "oklch(55% 0.025 250)", fontStyle: "italic" }}>
              Tip: Select a preset candidate above, then adjust these parameters to see how scores change dynamically.
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-8 max-w-lg mx-auto">
          <Button
            onClick={onRunDemo}
            disabled={isLoading}
            className={cn(
              "w-full font-semibold transition-all duration-300 group relative overflow-hidden",
              !isLoading && "hover:-translate-y-1 hover:shadow-2xl",
            )}
            style={{
              background: isLoading
                ? "oklch(65% 0.14 260)"
                : "linear-gradient(135deg, oklch(50% 0.18 260) 0%, oklch(55% 0.16 240) 100%)",
              color: "oklch(100% 0 0)",
              borderRadius: "0.75rem",
              padding: "0.9rem 2.5rem",
              fontSize: "1.125rem",
              boxShadow: isLoading
                ? "0 4px 16px oklch(50% 0.18 260 / 0.25)"
                : "0 4px 16px oklch(50% 0.18 260 / 0.35)",
              border: "none",
            }}
          >
            {/* Glow effect on hover */}
            {!isLoading && (
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: "radial-gradient(circle at 50% 0%, oklch(70% 0.2 260 / 0.4) 0%, transparent 70%)",
                }}
              />
            )}
            <span className="relative z-10">
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin size-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Running 7-Agent Assessment...
                </span>
              ) : (
                "Run 7-Agent Readiness Assessment"
              )}
            </span>
          </Button>

          {/* What happens when you click */}
          <div
            className="mt-4 p-4 rounded-xl text-left"
            style={{
              background: "oklch(97% 0.008 260)",
              border: "1px solid oklch(88% 0.02 260)",
            }}
          >
            <p className="font-semibold mb-2" style={{ fontSize: "0.875rem", color: "oklch(30% 0.015 250)" }}>
              What happens when you click:
            </p>
            <ol className="space-y-1.5" style={{ fontSize: "0.8125rem", color: "oklch(48% 0.025 250)", paddingLeft: "1.25rem" }}>
              <li>Retrieve grounded certification knowledge from synthetic learning materials</li>
              <li>Analyze Alex's learner profile and constraints</li>
              <li>Generate a readiness score, weak-domain diagnosis, and personalized study plan</li>
              <li>Produce manager-facing insights with verifier and citation checks</li>
            </ol>
          </div>
        </div>

        {/* Active Mode Banner */}
        <div
          className="mt-8 mx-auto max-w-5xl flex items-start gap-3 px-5 py-4 rounded-xl border text-left"
          style={{
            background: "oklch(97% 0.008 230)",
            borderColor: "oklch(82% 0.03 230)",
          }}
          role="status"
          aria-live="polite"
        >
          <span
            className="mt-0.5 shrink-0 size-5 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: "oklch(60% 0.14 200)", color: "white" }}
            aria-hidden="true"
          >
            i
          </span>
          <p style={{ fontSize: "0.875rem", color: "oklch(40% 0.04 240)" }}>
            <span className="font-semibold" style={{ color: "oklch(30% 0.03 250)" }}>
              Active Mode:
            </span>{" "}
            <span
              className="font-mono px-1.5 py-0.5 rounded text-xs"
              style={{
                background: "oklch(92% 0.02 260)",
                color: "oklch(38% 0.12 260)",
              }}
            >
              LOCAL_DEMO_IQ
            </span>{" "}
            — Retrieval from synthetic knowledge base with citation support
          </p>
        </div>

        {/* Manager Insight mode — surfaced on the homepage so judges see
            the hybrid architecture before running anything. */}
        <div
          className="mt-3 mx-auto max-w-5xl flex items-start gap-3 px-5 py-4 rounded-xl border text-left"
          style={
            llmConfigured
              ? { background: "oklch(96% 0.03 160)", borderColor: "oklch(80% 0.10 160)" }
              : { background: "oklch(97% 0.01 260)", borderColor: "oklch(85% 0.02 260)" }
          }
          role="status"
        >
          <span
            className="mt-0.5 shrink-0 size-5 rounded-full flex items-center justify-center text-xs"
            style={
              llmConfigured
                ? { background: "oklch(55% 0.16 160)", color: "white" }
                : { background: "oklch(70% 0.02 260)", color: "white" }
            }
            aria-hidden="true"
          >
            {llmConfigured ? "✓" : "i"}
          </span>
          <p style={{ fontSize: "0.875rem", color: llmConfigured ? "oklch(33% 0.10 160)" : "oklch(40% 0.04 250)" }}>
            <span className="font-semibold">
              Manager Insight Agent:
            </span>{" "}
            {llmConfigured === null ? (
              "checking LLM backend…"
            ) : llmConfigured ? (
              <>
                <strong>LLM-assisted</strong> via{" "}
                <code className="px-1 py-0.5 rounded" style={{ background: "oklch(90% 0.02 160)", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
                  {llmProvider || "custom"}
                </code>
                {llmDefaultModel && (
                  <>
                    {" / "}
                    <code className="px-1 py-0.5 rounded" style={{ background: "oklch(90% 0.02 160)", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
                      {llmDefaultModel}
                    </code>
                  </>
                )}
                . Real model generates manager coaching narrative. Scoring & verifier stay deterministic.
              </>
            ) : (
              <>
                <strong>Local fallback</strong> — deterministic template. Set{" "}
                <code className="px-1 py-0.5 rounded" style={{ background: "oklch(94% 0.01 260)", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
                  LLM_API_KEY
                </code>{" / "}
                <code className="px-1 py-0.5 rounded" style={{ background: "oklch(94% 0.01 260)", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
                  OPENAI_API_KEY
                </code>{" / "}
                <code className="px-1 py-0.5 rounded" style={{ background: "oklch(94% 0.01 260)", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
                  DEEPSEEK_API_KEY
                </code>
                {" or any "}
                <a
                  href="https://github.com/yourusername/teamcert-iq#enabling-the-llm-optional"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                  style={{ color: "oklch(50% 0.18 260)" }}
                >
                  OpenAI-compatible provider
                </a>
                .
              </>
            )}
          </p>
        </div>
      </div>
    </section>
  )
}
