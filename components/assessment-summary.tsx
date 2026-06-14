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

  const weakDomains = result.learningPath.recommendedSkills
    .filter((s) => s.priority === "High")
    .map((s) => s.skill)
    .slice(0, 2)
    .join(", ")

  return (
    <section className="w-full px-6 md:px-12 lg:px-16 py-8" id="assessment-complete">
      <div className="max-w-6xl mx-auto">
        {/* What this result means */}
        <div
          className="mb-6 p-6 rounded-xl border-l-4"
          style={{
            background: "oklch(98% 0.008 260)",
            borderLeftColor: "oklch(50% 0.18 260)",
          }}
        >
          <p className="font-bold mb-2" style={{ fontSize: "1rem", color: "oklch(28% 0.015 250)" }}>
            💡 What This Result Means
          </p>
          <p style={{ fontSize: "0.9375rem", color: "oklch(45% 0.025 250)", lineHeight: 1.7 }}>
            This candidate is <strong style={{ color: riskColor.text }}>not yet fully ready</strong> for {result.learnerProfile.certification}. TeamCert IQ identified{" "}
            <strong style={{ color: riskColor.text }}>{result.learnerProfile.baselineRisk.toLowerCase()} readiness risk</strong> because
            their practice score is {result.learnerProfile.practiceScore < 70 ? "low" : result.learnerProfile.practiceScore < 80 ? "moderate" : "high"} ({result.learnerProfile.practiceScore}%) and their weakest domains involve{" "}
            <strong style={{ color: "oklch(30% 0.015 250)" }}>{weakDomains || "core certification skills"}</strong>.
          </p>
          <p style={{ fontSize: "0.9375rem", color: "oklch(45% 0.025 250)", lineHeight: 1.7, marginTop: "0.75rem" }}>
            The system recommends a <strong style={{ color: "oklch(30% 0.015 250)" }}>{result.studyPlan.durationDays}-day focused study plan</strong> before
            final certification review. For managers, this candidate should be treated as <strong style={{ color: riskColor.text }}>"needs targeted support,"</strong> not
            "ready for exam scheduling."
          </p>
        </div>

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

        {/* Why this is more than a chatbot */}
        <div
          className="mt-6 p-6 rounded-xl border"
          style={{
            background: "oklch(97% 0.008 250)",
            borderColor: "oklch(85% 0.02 250)",
          }}
        >
          <p className="font-bold mb-3" style={{ fontSize: "1rem", color: "oklch(28% 0.015 250)" }}>
            🤖 Why This Is More Than a Chatbot
          </p>
          <ul className="space-y-2" style={{ fontSize: "0.875rem", color: "oklch(48% 0.025 250)", paddingLeft: "0" }}>
            <li className="flex items-start gap-2">
              <span style={{ color: "oklch(50% 0.18 260)", fontWeight: "bold" }}>•</span>
              <span>It uses <strong style={{ color: "oklch(30% 0.015 250)" }}>multiple specialized agents</strong>, not a single generic response</span>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: "oklch(50% 0.18 260)", fontWeight: "bold" }}>•</span>
              <span>It retrieves <strong style={{ color: "oklch(30% 0.015 250)" }}>grounded knowledge</strong> from synthetic certification materials</span>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: "oklch(50% 0.18 260)", fontWeight: "bold" }}>•</span>
              <span>It produces <strong style={{ color: "oklch(30% 0.015 250)" }}>learner-facing and manager-facing</strong> outputs</span>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: "oklch(50% 0.18 260)", fontWeight: "bold" }}>•</span>
              <span>It includes <strong style={{ color: "oklch(30% 0.015 250)" }}>verifier/safety checks</strong> and traceable evidence</span>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: "oklch(50% 0.18 260)", fontWeight: "bold" }}>•</span>
              <span>It turns certification preparation into a <strong style={{ color: "oklch(30% 0.015 250)" }}>repeatable enterprise workflow</strong></span>
            </li>
          </ul>
        </div>

        {/* How the score was calculated */}
        <div
          className="mt-6 p-6 rounded-xl border"
          style={{
            background: "oklch(97% 0.008 230)",
            borderColor: "oklch(85% 0.02 230)",
          }}
        >
          <p className="font-bold mb-3" style={{ fontSize: "1rem", color: "oklch(28% 0.015 250)" }}>
            🔢 How the Score Was Calculated
          </p>
          <div className="space-y-2" style={{ fontSize: "0.875rem" }}>
            <div className="flex justify-between items-center">
              <span style={{ color: "oklch(48% 0.025 250)" }}>
                Practice Score ({result.scoreBreakdown.weights.practice}% weight):
              </span>
              <span className="font-semibold" style={{ color: "oklch(30% 0.015 250)" }}>
                {result.scoreBreakdown.rawScores.practice} × 0.{result.scoreBreakdown.weights.practice} = {result.scoreBreakdown.practiceScoreContribution}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span style={{ color: "oklch(48% 0.025 250)" }}>
                Time Availability ({result.scoreBreakdown.weights.timeFit}% weight):
              </span>
              <span className="font-semibold" style={{ color: "oklch(38% 0.12 160)" }}>
                {result.scoreBreakdown.rawScores.timeFit} × 0.{result.scoreBreakdown.weights.timeFit} = {result.scoreBreakdown.timeAvailabilityAdjustment}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span style={{ color: "oklch(48% 0.025 250)" }}>
                Workload Score ({result.scoreBreakdown.weights.workload}% weight):
              </span>
              <span className="font-semibold" style={{ color: "oklch(38% 0.12 160)" }}>
                {result.scoreBreakdown.rawScores.workload} × 0.{result.scoreBreakdown.weights.workload.toString().padStart(2, '0')} = {result.scoreBreakdown.meetingLoadPenalty}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span style={{ color: "oklch(48% 0.025 250)" }}>
                Weak Domain Score ({result.scoreBreakdown.weights.weakDomain}% weight):
              </span>
              <span className="font-semibold" style={{ color: "oklch(38% 0.12 160)" }}>
                {result.scoreBreakdown.rawScores.weakDomain} × 0.{result.scoreBreakdown.weights.weakDomain} = {result.scoreBreakdown.weakDomainPenalty}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span style={{ color: "oklch(48% 0.025 250)" }}>
                Evidence/Verifier ({result.scoreBreakdown.weights.evidence}% weight):
              </span>
              <span className="font-semibold" style={{ color: "oklch(38% 0.12 160)" }}>
                {result.scoreBreakdown.rawScores.evidence} × 0.{result.scoreBreakdown.weights.evidence.toString().padStart(2, '0')} = {result.scoreBreakdown.evidenceBonus}
              </span>
            </div>
            <div
              className="flex justify-between items-center pt-3 mt-3"
              style={{ borderTop: "1px solid oklch(90% 0.006 250)" }}
            >
              <span className="font-bold" style={{ color: "oklch(28% 0.015 250)" }}>Final Readiness Score:</span>
              <span
                className="font-bold text-xl"
                style={{
                  color: "oklch(50% 0.18 260)",
                }}
              >
                {result.scoreBreakdown.finalScore}/100
              </span>
            </div>
          </div>
          <p className="mt-3 text-xs" style={{ color: "oklch(55% 0.025 250)", fontStyle: "italic" }}>
            This demo uses a transparent input-driven scoring engine with synthetic grounded knowledge retrieval.
            The architecture is Foundry-ready for model-backed evaluation.
          </p>
        </div>
      </div>
    </section>
  )
}
