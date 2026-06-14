"use client"

import type { FinalOutput } from "@/lib/types"

interface AssessmentSummaryProps {
  result: FinalOutput
}

export function AssessmentSummary({ result }: AssessmentSummaryProps) {
  const riskColors = {
    Low: { bg: "oklch(96% 0.025 160)", border: "oklch(70% 0.10 160)", text: "oklch(38% 0.12 160)" },
    Medium: { bg: "oklch(97% 0.06 65)", border: "oklch(75% 0.14 65)", text: "oklch(45% 0.16 65)" },
    High: { bg: "oklch(98% 0.02 20)", border: "oklch(75% 0.15 20)", text: "oklch(45% 0.15 20)" },
  }

  const riskColor = riskColors[result.learnerProfile.baselineRisk]

  return (
    <section className="w-full px-6 md:px-12 lg:px-16 py-8" id="assessment-complete">
      <div className="max-w-4xl mx-auto">
        <div
          className="p-8 rounded-2xl border-2"
          style={{
            background: "oklch(98% 0.008 260)",
            borderColor: "oklch(70% 0.10 260)",
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl" aria-hidden="true">✅</span>
            <h2 className="font-bold" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "oklch(22% 0.015 250)" }}>
              Assessment Complete
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div
              className="p-4 rounded-xl border text-center"
              style={{ background: "oklch(100% 0 0)", borderColor: "oklch(88% 0.008 250)" }}
            >
              <p className="text-sm font-semibold mb-1" style={{ color: "oklch(55% 0.025 250)" }}>
                Readiness Score
              </p>
              <p
                className="font-bold"
                style={{
                  fontSize: "2rem",
                  background: "linear-gradient(135deg, oklch(50% 0.18 260), oklch(55% 0.16 240))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {result.readinessScore}/100
              </p>
            </div>

            <div
              className="p-4 rounded-xl border text-center"
              style={{ background: riskColor.bg, borderColor: riskColor.border }}
            >
              <p className="text-sm font-semibold mb-1" style={{ color: "oklch(55% 0.025 250)" }}>
                Risk Level
              </p>
              <p className="font-bold text-xl" style={{ color: riskColor.text }}>
                {result.learnerProfile.baselineRisk}
              </p>
            </div>

            <div
              className="p-4 rounded-xl border text-center"
              style={{ background: "oklch(100% 0 0)", borderColor: "oklch(88% 0.008 250)" }}
            >
              <p className="text-sm font-semibold mb-1" style={{ color: "oklch(55% 0.025 250)" }}>
                Study Timeline
              </p>
              <p className="font-bold text-xl" style={{ color: "oklch(40% 0.12 260)" }}>
                {result.studyPlan.durationDays} Days
              </p>
            </div>

            <div
              className="p-4 rounded-xl border col-span-2 md:col-span-3"
              style={{ background: "oklch(100% 0 0)", borderColor: "oklch(88% 0.008 250)" }}
            >
              <p className="text-sm font-semibold mb-2" style={{ color: "oklch(55% 0.025 250)" }}>
                Top Weakness
              </p>
              <p className="font-medium" style={{ fontSize: "0.9375rem", color: "oklch(30% 0.015 250)" }}>
                {result.learningPath.recommendedSkills
                  .filter((s) => s.priority === "High")
                  .map((s) => s.skill)
                  .join(", ")}
              </p>
            </div>

            <div
              className="p-4 rounded-xl border"
              style={{ background: "oklch(100% 0 0)", borderColor: "oklch(88% 0.008 250)" }}
            >
              <p className="text-sm font-semibold mb-1" style={{ color: "oklch(55% 0.025 250)" }}>
                Verifier Status
              </p>
              <p className="font-bold text-lg" style={{ color: "oklch(38% 0.12 160)" }}>
                {result.verifierReport.verdict}
              </p>
            </div>

            <div
              className="p-4 rounded-xl border col-span-1 md:col-span-2"
              style={{ background: "oklch(100% 0 0)", borderColor: "oklch(88% 0.008 250)" }}
            >
              <p className="text-sm font-semibold mb-1" style={{ color: "oklch(55% 0.025 250)" }}>
                Evidence Sources
              </p>
              <p className="font-bold text-lg" style={{ color: "oklch(40% 0.12 260)" }}>
                {result.learningPath.sources.length} synthetic knowledge sources used
              </p>
            </div>
          </div>

          <div
            className="mt-6 p-4 rounded-xl"
            style={{ background: "oklch(96% 0.012 260)" }}
          >
            <p className="text-sm font-semibold mb-2" style={{ color: "oklch(35% 0.02 250)" }}>
              Recommended Action
            </p>
            <p style={{ fontSize: "0.9375rem", color: "oklch(45% 0.025 250)", lineHeight: 1.6 }}>
              {result.recommendation}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
