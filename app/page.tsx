"use client"

import { useState, useRef, useEffect } from "react"
import { HeroSection } from "@/components/hero-section"
import { SystemOverview } from "@/components/system-overview"
import { AdvancedConfig } from "@/components/advanced-config"
import { AgentProgress } from "@/components/agent-progress"
import { AssessmentSummary } from "@/components/assessment-summary"
import { ResultsTabs } from "@/components/results-tabs"
import type { FinalOutput, LearnerInput, AgentTrace } from "@/lib/types"

// Demo candidate presets
const demoCandidates = {
  alex: {
    name: "Alex Chen",
    role: "Cloud Engineer",
    certification: "AZ-204",
    meetingHoursPerWeek: 30,
    focusHoursPerWeek: 3,
    availableStudyHoursPerWeek: 4,
    practiceScore: 42,
    preferredLearningSlot: "Morning" as const,
    expectedReadiness: "45-55",
  },
  maya: {
    name: "Maya Patel",
    role: "DevOps Engineer",
    certification: "AZ-400",
    meetingHoursPerWeek: 20,
    focusHoursPerWeek: 8,
    availableStudyHoursPerWeek: 7,
    practiceScore: 71,
    preferredLearningSlot: "Afternoon" as const,
    expectedReadiness: "68-78",
  },
  jordan: {
    name: "Jordan Lee",
    role: "Data Engineer",
    certification: "DP-203",
    meetingHoursPerWeek: 12,
    focusHoursPerWeek: 15,
    availableStudyHoursPerWeek: 10,
    practiceScore: 86,
    preferredLearningSlot: "Evening" as const,
    expectedReadiness: "82-92",
  },
}

export default function Home() {
  const [showResults, setShowResults] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [assessmentResult, setAssessmentResult] = useState<FinalOutput | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [agentTraces, setAgentTraces] = useState<AgentTrace[]>([])
  const [selectedCandidate, setSelectedCandidate] = useState<"alex" | "maya" | "jordan">("alex")
  const [llmConfigured, setLlmConfigured] = useState<boolean | null>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // On mount, ask the backend whether a real LLM is configured so the
  // homepage can show the Manager Insight mode before any run.
  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then((d) => setLlmConfigured(Boolean(d.llmConfigured)))
      .catch(() => setLlmConfigured(false))
  }, [])

  // Current input values (editable by user)
  const [inputValues, setInputValues] = useState<LearnerInput>({
    role: demoCandidates.alex.role,
    certification: demoCandidates.alex.certification,
    meetingHoursPerWeek: demoCandidates.alex.meetingHoursPerWeek,
    focusHoursPerWeek: demoCandidates.alex.focusHoursPerWeek,
    availableStudyHoursPerWeek: demoCandidates.alex.availableStudyHoursPerWeek,
    practiceScore: demoCandidates.alex.practiceScore,
    preferredLearningSlot: demoCandidates.alex.preferredLearningSlot,
    viewMode: "Summary",
    candidateName: demoCandidates.alex.name,
  })

  // When candidate changes, update input values
  const handleCandidateChange = (candidateKey: "alex" | "maya" | "jordan") => {
    setSelectedCandidate(candidateKey)
    const candidate = demoCandidates[candidateKey]
    setInputValues({
      role: candidate.role,
      certification: candidate.certification,
      meetingHoursPerWeek: candidate.meetingHoursPerWeek,
      focusHoursPerWeek: candidate.focusHoursPerWeek,
      availableStudyHoursPerWeek: candidate.availableStudyHoursPerWeek,
      practiceScore: candidate.practiceScore,
      preferredLearningSlot: candidate.preferredLearningSlot,
      viewMode: "Summary",
      candidateName: candidate.name,
    })
  }

  // 模拟 agent 进度（实际应该通过 WebSocket 或轮询获取）
  useEffect(() => {
    if (isLoading && assessmentResult) {
      setAgentTraces(assessmentResult.trace)
    }
  }, [isLoading, assessmentResult])

  const handleRunDemo = async () => {
    // Allow re-running: clear previous results so the run visibly restarts
    setShowResults(false)
    setAssessmentResult(null)
    setError(null)
    setAgentTraces([])
    // Scroll back to top so the user sees the loading flow from the start
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }

    setIsLoading(true)

    try {
      // Use current input values (may be modified by user)
      const response = await fetch("/api/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputValues),
      })

      if (!response.ok) {
        throw new Error(`Assessment failed: ${response.statusText}`)
      }

      const result: FinalOutput = await response.json()
      setAssessmentResult(result)
      setAgentTraces(result.trace)
      setShowResults(true)

      // 自动滚动到结果区域
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 300)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      console.error("Assessment error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateCustom = async (customConfig: any) => {
    setIsLoading(true)
    setError(null)

    try {
      // Convert config format to LearnerInput
      const input: LearnerInput = {
        role: customConfig.role,
        certification: customConfig.certification.split(":")[0].trim(), // Extract "AZ-204" from "AZ-204: Azure Developer Associate"
        meetingHoursPerWeek: customConfig.meetingHours * 5, // Convert daily to weekly
        focusHoursPerWeek: customConfig.focusHours * 5,
        availableStudyHoursPerWeek: customConfig.studyHours,
        practiceScore: customConfig.practiceScore,
        preferredLearningSlot: customConfig.learningSlot as "Morning" | "Afternoon" | "Evening" | "Weekend",
        viewMode: customConfig.viewMode as "Summary" | "Detailed" | "Executive",
      }

      const response = await fetch("/api/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        throw new Error(`Assessment failed: ${response.statusText}`)
      }

      const result: FinalOutput = await response.json()
      setAssessmentResult(result)
      setShowResults(true)
      document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      console.error("Assessment error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: "oklch(98% 0.004 250)" }}
    >
      {/* Top nav strip */}
      <header
        className="w-full border-b px-6 md:px-12 lg:px-16 py-4 flex items-center justify-between"
        style={{
          background: "oklch(100% 0 0)",
          borderColor: "oklch(88% 0.008 250)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">🎓</span>
          <span
            className="font-bold tracking-tight"
            style={{ color: "oklch(22% 0.015 250)", fontSize: "1.125rem" }}
          >
            TeamCert IQ
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="hidden sm:inline-block px-3 py-1 rounded-full text-xs font-semibold border"
            style={{
              background: "oklch(94% 0.015 260)",
              borderColor: "oklch(80% 0.04 260)",
              color: "oklch(38% 0.12 260)",
            }}
          >
            Microsoft Agents League Hackathon 2026
          </span>
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: "oklch(95% 0.05 160)", color: "oklch(38% 0.12 160)" }}
          >
            v1.0 Demo
          </span>
        </div>
      </header>

      <main>
        {/* Hero */}
        <HeroSection
          onRunDemo={handleRunDemo}
          isLoading={isLoading}
          selectedCandidate={selectedCandidate}
          onCandidateChange={handleCandidateChange}
          inputValues={inputValues}
          onInputChange={(updates) => setInputValues({ ...inputValues, ...updates })}
          llmConfigured={llmConfigured}
        />

        {/* Divider */}
        <div
          className="mx-6 md:mx-12 lg:mx-16 max-w-5xl xl:mx-auto"
          style={{ borderTop: "1px solid oklch(90% 0.006 250)" }}
          role="separator"
          aria-hidden="true"
        />

        {/* System Overview + Metrics */}
        <SystemOverview />

        {/* Divider */}
        <div
          className="mx-6 md:mx-12 lg:mx-16 max-w-5xl xl:mx-auto"
          style={{ borderTop: "1px solid oklch(90% 0.006 250)" }}
          role="separator"
          aria-hidden="true"
        />

        {/* Advanced Configuration */}
        <AdvancedConfig onGenerateCustom={handleGenerateCustom} isLoading={isLoading} />

        {/* Agent Progress - Show when loading */}
        {isLoading && <AgentProgress traces={agentTraces} />}

        {/* Error message */}
        {error && (
          <div className="px-6 md:px-12 lg:px-16 pb-8 max-w-5xl mx-auto">
            <div
              className="flex items-start gap-3 p-5 rounded-xl border"
              style={{
                background: "oklch(98% 0.02 20)",
                borderColor: "oklch(88% 0.06 20)",
              }}
              role="alert"
            >
              <span className="text-2xl" aria-hidden="true">⚠️</span>
              <div>
                <p className="font-semibold" style={{ color: "oklch(45% 0.15 20)", fontSize: "0.9375rem" }}>
                  Demo failed to run. Please check /api/assess response.
                </p>
                <p style={{ fontSize: "0.875rem", color: "oklch(52% 0.025 250)", marginTop: "0.25rem" }}>
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {showResults && assessmentResult && (
          <div ref={resultsRef}>
            <div
              className="mx-6 md:mx-12 lg:mx-16 max-w-5xl xl:mx-auto mb-8"
              style={{ borderTop: "1px solid oklch(90% 0.006 250)" }}
              role="separator"
              aria-hidden="true"
            />

            {/* Assessment Summary */}
            <AssessmentSummary result={assessmentResult} />

            {/* Detailed Results Tabs */}
            <section id="results-section" className="mt-8">
              <div className="px-6 md:px-12 lg:px-16 max-w-5xl mx-auto mb-4">
                <h3
                  className="font-bold"
                  style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.5rem)", color: "oklch(22% 0.015 250)" }}
                >
                  Detailed Analysis
                </h3>
                <p style={{ fontSize: "0.875rem", color: "oklch(52% 0.025 250)", marginTop: "0.5rem" }}>
                  Explore the full multi-agent assessment breakdown below
                </p>
              </div>
              <ResultsTabs result={assessmentResult} />
            </section>
          </div>
        )}

        {/* Empty state when results not shown */}
        {!showResults && (
          <div className="px-6 md:px-12 lg:px-16 pb-24 max-w-5xl mx-auto">
            <div
              className="flex flex-col items-center justify-center py-16 rounded-2xl border"
              style={{
                borderColor: "oklch(88% 0.008 250)",
                borderStyle: "dashed",
                background: "oklch(99% 0.003 250)",
              }}
              role="status"
            >
              <span className="text-4xl mb-4" aria-hidden="true">⏳</span>
              <p
                className="font-semibold"
                style={{ color: "oklch(45% 0.02 250)", fontSize: "1rem" }}
              >
                Click &quot;Run 7-Agent Readiness Assessment&quot; to see the 7-agent assessment in action
              </p>
              <p style={{ fontSize: "0.875rem", color: "oklch(60% 0.015 250)", marginTop: "0.5rem" }}>
                Results will appear here with 8 detailed tabs
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className="border-t py-8 px-6 md:px-12 lg:px-16"
        style={{
          background: "oklch(100% 0 0)",
          borderColor: "oklch(88% 0.008 250)",
        }}
      >
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
            <span className="text-base" aria-hidden="true">🎓</span>
            <span
              className="font-semibold"
              style={{ color: "oklch(35% 0.015 250)", fontSize: "0.9375rem" }}
            >
              TeamCert IQ
            </span>
            <span style={{ color: "oklch(70% 0.01 250)", fontSize: "0.875rem" }}>
              — Grounded Multi-Agent Certification Readiness
            </span>
          </div>
          <div
            className="flex items-center gap-4"
            style={{ fontSize: "0.8125rem", color: "oklch(60% 0.015 250)" }}
          >
            <span>Microsoft Agents League Hackathon 2026</span>
            <span
              className="px-2 py-0.5 rounded text-xs font-mono"
              style={{ background: "oklch(95% 0.006 250)", color: "oklch(50% 0.025 250)" }}
            >
              Reasoning Agents Track
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
