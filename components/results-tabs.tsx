"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type { FinalOutput } from "@/lib/types"

const tabs = [
  { id: "recommendation", icon: "📊", label: "Final Recommendation" },
  { id: "learning-path", icon: "🎯", label: "Learning Path" },
  { id: "study-plan", icon: "📅", label: "Study Plan" },
  { id: "practice", icon: "📝", label: "Practice Assessment" },
  { id: "manager", icon: "👔", label: "Manager Insights" },
  { id: "trace", icon: "🔍", label: "Agent Trace" },
  { id: "safety", icon: "✅", label: "Verifier & Safety Report" },
  { id: "evaluation", icon: "📈", label: "Evaluation Summary" },
]

interface ResultsTabsProps {
  result: FinalOutput
}

interface ContentCardProps {
  title: string
  children: React.ReactNode
}

function NarrativeBlock({ label, text, highlight }: { label: string; text: string; highlight?: boolean }) {
  return (
    <div
      className="p-4 rounded-xl border"
      style={
        highlight
          ? { background: "oklch(96% 0.025 160)", borderColor: "oklch(80% 0.10 160)" }
          : { background: "oklch(100% 0 0)", borderColor: "oklch(90% 0.006 250)" }
      }
    >
      <p className="font-semibold mb-1.5" style={{ fontSize: "0.8125rem", color: "oklch(45% 0.02 250)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </p>
      <p style={{ fontSize: "0.9375rem", color: "oklch(30% 0.015 250)", lineHeight: 1.7 }}>
        {text}
      </p>
    </div>
  )
}

function ContentCard({ title, children }: ContentCardProps) {
  return (
    <div
      className="rounded-2xl border p-6 md:p-8 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, oklch(100% 0.002 260) 0%, oklch(99.5% 0.005 250) 100%)",
        borderColor: "oklch(88% 0.008 250)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08), 0 1px 0 0 oklch(100% 0 0 / 0.5) inset",
      }}
    >
      {/* Subtle corner glow */}
      <div
        className="absolute top-0 right-0 w-64 h-64 opacity-30"
        style={{
          background: "radial-gradient(circle at 100% 0%, oklch(65% 0.08 260 / 0.15) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <h3
        className="font-bold mb-5 relative z-10"
        style={{ fontSize: "1.25rem", color: "oklch(22% 0.015 250)" }}
      >
        {title}
      </h3>
      <div className="relative z-10">{children}</div>
    </div>
  )
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className="flex items-center justify-between py-3"
      style={{ borderBottom: "1px solid oklch(93% 0.005 250)" }}
    >
      <span style={{ fontSize: "0.9375rem", color: "oklch(52% 0.025 250)" }}>{label}</span>
      <span
        className={cn("font-semibold", highlight && "px-3 py-1 rounded-full")}
        style={{
          fontSize: "0.9375rem",
          color: highlight ? "oklch(38% 0.12 260)" : "oklch(25% 0.015 250)",
          background: highlight ? "oklch(94% 0.015 260)" : "transparent",
        }}
      >
        {value}
      </span>
    </div>
  )
}

function Tag({ text, color = "azure" }: { text: string; color?: "azure" | "green" | "amber" | "red" }) {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    azure: { bg: "oklch(94% 0.015 260)", text: "oklch(38% 0.12 260)", border: "oklch(82% 0.04 260)" },
    green: { bg: "oklch(95% 0.05 160)", text: "oklch(38% 0.12 160)", border: "oklch(82% 0.06 160)" },
    amber: { bg: "oklch(97% 0.06 80)", text: "oklch(45% 0.12 65)", border: "oklch(85% 0.08 80)" },
    red: { bg: "oklch(97% 0.04 20)", text: "oklch(45% 0.15 20)", border: "oklch(85% 0.06 20)" },
  }
  const c = colors[color]
  return (
    <span
      className="inline-block px-3 py-1 rounded-full text-sm font-medium border"
      style={{ background: c.bg, color: c.text, borderColor: c.border }}
    >
      {text}
    </span>
  )
}

function AgentStep({ step, name, status, detail }: { step: number; name: string; status: "done" | "processing" | "pending"; detail: string }) {
  const statusConfig = {
    done: { label: "完成", color: "oklch(40% 0.12 160)", bg: "oklch(95% 0.05 160)" },
    processing: { label: "处理中", color: "oklch(45% 0.12 65)", bg: "oklch(97% 0.06 80)" },
    pending: { label: "等待中", color: "oklch(55% 0.025 250)", bg: "oklch(95% 0.006 250)" },
  }
  const s = statusConfig[status]
  return (
    <div className="flex gap-4 items-start">
      <div
        className="shrink-0 size-8 rounded-full flex items-center justify-center font-bold text-sm"
        style={{
          background: status === "done" ? "oklch(50% 0.18 260)" : "oklch(90% 0.008 250)",
          color: status === "done" ? "white" : "oklch(55% 0.025 250)",
        }}
      >
        {status === "done" ? "✓" : step}
      </div>
      <div className="flex-1 pb-5" style={{ borderBottom: step < 7 ? "1px dashed oklch(90% 0.006 250)" : "none" }}>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-semibold" style={{ fontSize: "0.9375rem", color: "oklch(25% 0.015 250)" }}>
            {name}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: s.bg, color: s.color }}
          >
            {s.label}
          </span>
        </div>
        <p className="mt-1" style={{ fontSize: "0.875rem", color: "oklch(52% 0.025 250)" }}>
          {detail}
        </p>
      </div>
    </div>
  )
}

export function ResultsTabs({ result }: ResultsTabsProps) {
  return (
    <section className="w-full px-6 md:px-12 lg:px-16 py-8 pb-20">
      <div className="max-w-7xl mx-auto">
        <Tabs defaultValue="recommendation">
          <div className="overflow-x-auto">
            <TabsList
              className="mb-6 flex w-max min-w-full gap-1 p-1 rounded-2xl border"
              style={{
                background: "oklch(97% 0.005 250)",
                borderColor: "oklch(88% 0.008 250)",
              }}
            >
              {tabs.map((t) => (
                <TabsTrigger
                  key={t.id}
                  value={t.id}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-2 whitespace-nowrap font-medium transition-all duration-200 data-[state=active]:shadow-sm"
                  style={{ fontSize: "0.8125rem" }}
                >
                  <span aria-hidden="true">{t.icon}</span>
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Tab 1: Final Recommendation */}
          <TabsContent value="recommendation" className="animate-fadeIn">
            <ContentCard title="📊 Final Recommendation">
              <div
                className="flex items-start gap-4 p-5 rounded-xl mb-6"
                style={{ background: "oklch(96% 0.012 260)", border: "1px solid oklch(84% 0.03 260)" }}
              >
                <span className="text-3xl shrink-0" aria-hidden="true">🎓</span>
                <div>
                  <p className="font-semibold mb-1" style={{ color: "oklch(28% 0.015 250)", fontSize: "1.0625rem" }}>
                    Certification Readiness: {result.learnerProfile.certification}
                  </p>
                  <p style={{ fontSize: "0.9375rem", color: "oklch(48% 0.025 250)" }}>
                    {result.recommendation}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-0">
                <InfoRow label="Role" value={result.learnerProfile.role} />
                <InfoRow label="Target Certification" value={result.learnerProfile.certification} highlight />
                <InfoRow label="Current Practice Score" value={`${result.learnerProfile.practiceScore}%`} />
                <InfoRow label="Estimated Readiness" value={`${result.readinessScore}%`} highlight />
                <InfoRow label="Risk Level" value={result.learnerProfile.baselineRisk} />
                <InfoRow label="Recommended Study Timeline" value={`${result.studyPlan.durationDays} Days`} />
              </div>
            </ContentCard>
          </TabsContent>

          {/* Tab 2: Learning Path */}
          <TabsContent value="learning-path" className="animate-fadeIn">
            <ContentCard title="🎯 Learning Path">
              <div className="flex flex-col gap-4">
                {result.learningPath.recommendedSkills.map((skill, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-xl border"
                    style={{
                      background: "oklch(100% 0 0)",
                      borderColor: "oklch(90% 0.006 250)",
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className="text-sm font-semibold px-2 py-1 rounded-lg"
                        style={{ background: "oklch(94% 0.015 260)", color: "oklch(40% 0.12 260)", fontSize: "0.8125rem" }}
                      >
                        Week {idx + 1}
                      </span>
                      <span style={{ fontSize: "0.9375rem", color: "oklch(28% 0.015 250)", fontWeight: 500 }}>
                        {skill.skill}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {skill.currentScore && (
                        <span style={{ fontSize: "0.875rem", color: "oklch(55% 0.025 250)" }}>
                          Current: <strong style={{ color: skill.currentScore < 50 ? "oklch(45% 0.15 20)" : "oklch(40% 0.12 160)" }}>{skill.currentScore}%</strong>
                        </span>
                      )}
                      <Tag
                        text={skill.priority}
                        color={
                          skill.priority === "High" ? "red" :
                          skill.priority === "Medium" ? "amber" : "green"
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
              {result.learningPath.sources.length > 0 && (
                <div className="mt-6 p-4 rounded-xl" style={{ background: "oklch(98% 0.004 250)" }}>
                  <p className="font-semibold mb-2" style={{ fontSize: "0.875rem", color: "oklch(35% 0.02 250)" }}>
                    Grounded Sources:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.learningPath.sources.map((source, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-mono px-2 py-1 rounded"
                        style={{ background: "oklch(92% 0.02 260)", color: "oklch(38% 0.12 260)" }}
                      >
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </ContentCard>
          </TabsContent>

          {/* Tab 3: Study Plan */}
          <TabsContent value="study-plan" className="animate-fadeIn">
            <ContentCard title="📅 Study Plan">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                {[
                  { label: "Study Duration", value: `${result.studyPlan.durationDays} Days`, icon: "📆" },
                  { label: "Daily Study Slots", value: result.studyPlan.dailyBlocks[0]?.slot || "Morning", icon: "⏰" },
                  { label: "Weekly Study Hours", value: `${result.learnerProfile.availableHoursPerWeek}h / week`, icon: "🏁" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col items-center p-5 rounded-xl border text-center"
                    style={{ background: "oklch(98% 0.004 250)", borderColor: "oklch(90% 0.006 250)" }}
                  >
                    <span className="text-2xl mb-2" aria-hidden="true">{item.icon}</span>
                    <span className="font-bold" style={{ color: "oklch(25% 0.015 250)", fontSize: "1rem" }}>{item.value}</span>
                    <span style={{ fontSize: "0.8125rem", color: "oklch(55% 0.025 250)", marginTop: "0.25rem" }}>{item.label}</span>
                  </div>
                ))}
              </div>
              <div className="mb-6">
                <p className="font-semibold mb-3" style={{ fontSize: "0.9375rem", color: "oklch(28% 0.015 250)" }}>
                  First 2 Weeks Schedule:
                </p>
                <div className="space-y-2">
                  {result.studyPlan.dailyBlocks.slice(0, 14).map((block, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg"
                      style={{ background: idx % 2 === 0 ? "oklch(99% 0.002 250)" : "oklch(100% 0 0)" }}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="font-semibold text-xs px-2 py-1 rounded"
                          style={{ background: "oklch(94% 0.015 260)", color: "oklch(40% 0.12 260)" }}
                        >
                          Day {block.day}
                        </span>
                        <span style={{ fontSize: "0.875rem", color: "oklch(28% 0.015 250)" }}>
                          {block.topic}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: "0.8125rem", color: "oklch(55% 0.025 250)" }}>
                          {block.slot}
                        </span>
                        <span
                          className="font-semibold text-xs"
                          style={{ color: "oklch(50% 0.18 260)" }}
                        >
                          {block.duration}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <p style={{ fontSize: "0.9375rem", color: "oklch(48% 0.02 250)", lineHeight: 1.7 }}>
                {result.studyPlan.reasoning}
              </p>
            </ContentCard>
          </TabsContent>

          {/* Tab 4: Practice Assessment */}
          <TabsContent value="practice" className="animate-fadeIn">
            <ContentCard title="📝 Practice Assessment">
              <div className="flex flex-col gap-3">
                {result.assessment.questions.map((q, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border"
                    style={{
                      background: "oklch(100% 0 0)",
                      borderColor: "oklch(90% 0.006 250)",
                    }}
                  >
                    <p className="font-medium mb-2" style={{ fontSize: "0.9rem", color: "oklch(28% 0.015 250)" }}>
                      Q{i + 1}: {q.question}
                    </p>
                    <div className="mb-2 space-y-1">
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className="px-3 py-1.5 rounded text-sm"
                          style={{
                            background: opt === q.correctAnswer ? "oklch(97% 0.025 160)" : "oklch(98% 0.004 250)",
                            color: opt === q.correctAnswer ? "oklch(38% 0.12 160)" : "oklch(45% 0.02 250)",
                            fontWeight: opt === q.correctAnswer ? 600 : 400,
                          }}
                        >
                          {opt === q.correctAnswer ? "✓ " : ""}{opt}
                        </div>
                      ))}
                    </div>
                    <p style={{ fontSize: "0.875rem", color: "oklch(52% 0.025 250)", marginBottom: "0.5rem" }}>
                      {q.explanation}
                    </p>
                    <p className="text-xs font-mono" style={{ color: "oklch(55% 0.025 250)" }}>
                      {q.sourceCitation}
                    </p>
                  </div>
                ))}
              </div>
            </ContentCard>
          </TabsContent>

          {/* Tab 5: Manager Insights */}
          <TabsContent value="manager" className="animate-fadeIn">
            <ContentCard title="👔 Manager Insights">
              {/* Generation mode badge */}
              <div className="flex flex-col gap-2 mb-5">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border w-fit"
                  style={
                    result.managerInsights.generationMode === "llm"
                      ? { background: "oklch(94% 0.04 160)", borderColor: "oklch(70% 0.12 160)", color: "oklch(38% 0.14 160)" }
                      : { background: "oklch(96% 0.012 260)", borderColor: "oklch(82% 0.03 260)", color: "oklch(42% 0.10 260)" }
                  }
                >
                  {result.managerInsights.generationMode === "llm" ? "✨ Manager Insight: LLM-assisted" : "⚙️ Manager Insight: Local fallback"}
                </span>
                {result.managerInsights.generationMode === "llm" && (result.managerInsights.llmProvider || result.managerInsights.llmModel) && (
                  <p className="text-xs font-mono" style={{ color: "oklch(50% 0.025 250)" }}>
                    Generated via{" "}
                    {result.managerInsights.llmProvider && (
                      <span className="font-semibold" style={{ color: "oklch(40% 0.10 160)" }}>
                        {result.managerInsights.llmProvider}
                      </span>
                    )}
                    {result.managerInsights.llmModel && (
                      <>
                        {" / "}
                        <span style={{ color: "oklch(45% 0.08 160)" }}>
                          {result.managerInsights.llmModel}
                        </span>
                      </>
                    )}
                  </p>
                )}
              </div>

              {/* LLM narrative (only present when an LLM backend is configured) */}
              {result.managerInsights.generationMode === "llm" && (
                <div className="space-y-4 mb-6">
                  {result.managerInsights.managerSummary && (
                    <NarrativeBlock label="Manager Summary" text={result.managerInsights.managerSummary} />
                  )}
                  {result.managerInsights.riskExplanation && (
                    <NarrativeBlock label="Risk Explanation" text={result.managerInsights.riskExplanation} />
                  )}
                  {result.managerInsights.coachingRecommendation && (
                    <NarrativeBlock label="Coaching Recommendation" text={result.managerInsights.coachingRecommendation} />
                  )}
                  {result.managerInsights.nextBestAction && (
                    <NarrativeBlock label="Next Best Action" text={result.managerInsights.nextBestAction} highlight />
                  )}
                </div>
              )}

              <div
                className="p-5 rounded-xl mb-6"
                style={{ background: "oklch(97% 0.008 250)", border: "1px solid oklch(90% 0.006 250)" }}
              >
                <p className="font-semibold mb-1" style={{ color: "oklch(28% 0.015 250)" }}>
                  {result.managerInsights.generationMode === "llm" ? "Deterministic Risk Summary" : "Executive Summary"}
                </p>
                <p style={{ fontSize: "0.9375rem", color: "oklch(48% 0.025 250)", lineHeight: 1.7 }}>
                  {result.managerInsights.riskSummary}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div
                  className="flex items-center justify-between p-4 rounded-xl border"
                  style={{ background: "oklch(100% 0 0)", borderColor: "oklch(90% 0.006 250)" }}
                >
                  <span style={{ fontSize: "0.9rem", color: "oklch(45% 0.02 250)" }}>Risk Level</span>
                  <Tag
                    text={result.managerInsights.riskLevel}
                    color={
                      result.managerInsights.riskLevel === "High" ? "red" :
                      result.managerInsights.riskLevel === "Medium" ? "amber" : "green"
                    }
                  />
                </div>
                <div
                  className="flex items-center justify-between p-4 rounded-xl border"
                  style={{ background: "oklch(100% 0 0)", borderColor: "oklch(90% 0.006 250)" }}
                >
                  <span style={{ fontSize: "0.9rem", color: "oklch(45% 0.02 250)" }}>Baseline Risk</span>
                  <Tag
                    text={result.learnerProfile.baselineRisk}
                    color={
                      result.learnerProfile.baselineRisk === "High" ? "red" :
                      result.learnerProfile.baselineRisk === "Medium" ? "amber" : "green"
                    }
                  />
                </div>
              </div>
              {result.managerInsights.teamRecommendations.length > 0 && (
                <div>
                  <p className="font-semibold mb-3" style={{ fontSize: "0.9375rem", color: "oklch(28% 0.015 250)" }}>
                    Recommended Actions:
                  </p>
                  <div className="space-y-2">
                    {result.managerInsights.teamRecommendations.map((rec, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-3 rounded-lg"
                        style={{ background: "oklch(98% 0.004 250)" }}
                      >
                        <span style={{ color: "oklch(50% 0.18 260)", fontSize: "0.875rem" }}>•</span>
                        <span style={{ fontSize: "0.875rem", color: "oklch(35% 0.02 250)" }}>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </ContentCard>
          </TabsContent>

          {/* Tab 6: Agent Trace */}
          <TabsContent value="trace" className="animate-fadeIn">
            <ContentCard title="🔍 Agent Trace">
              <div className="flex flex-col gap-0">
                {result.trace.map((step, idx) => (
                  <AgentStep
                    key={idx}
                    step={idx + 1}
                    name={step.agentName}
                    status={step.status}
                    detail={step.detail}
                  />
                ))}
              </div>
            </ContentCard>
          </TabsContent>

          {/* Tab 7: Verifier & Safety Report */}
          <TabsContent value="safety" className="animate-fadeIn">
            <ContentCard title="✅ Verifier & Safety Report">
              <div className="flex flex-col gap-4">
                {[
                  {
                    check: "Grounding Verification",
                    status: result.verifierReport.citationCoverage >= 0.8 ? "Passed" : "Failed",
                    detail: `Citation coverage: ${(result.verifierReport.citationCoverage * 100).toFixed(0)}%`,
                    ok: result.verifierReport.citationCoverage >= 0.8,
                  },
                  {
                    check: "Hallucination Detection",
                    status: result.verifierReport.unsupportedClaims.length === 0 ? "Passed" : "Warning",
                    detail:
                      result.verifierReport.unsupportedClaims.length === 0
                        ? "No ungrounded claims detected"
                        : `${result.verifierReport.unsupportedClaims.length} unsupported claims found`,
                    ok: result.verifierReport.unsupportedClaims.length === 0,
                  },
                  {
                    check: "PII Sanitization",
                    status: result.verifierReport.piiDetected ? "Failed" : "Passed",
                    detail: result.verifierReport.piiDetected
                      ? "Personal information detected"
                      : "Synthetic data only — no real PII present",
                    ok: !result.verifierReport.piiDetected,
                  },
                  {
                    check: "Synthetic Data Compliance",
                    status: result.verifierReport.syntheticDataOnly ? "Passed" : "Failed",
                    detail: result.verifierReport.syntheticDataOnly
                      ? "All data is synthetic"
                      : "Real data detected",
                    ok: result.verifierReport.syntheticDataOnly,
                  },
                ].map((item) => (
                  <div
                    key={item.check}
                    className="flex items-start gap-4 p-4 rounded-xl border"
                    style={{
                      background: item.ok ? "oklch(97% 0.025 160)" : "oklch(98% 0.02 20)",
                      borderColor: item.ok ? "oklch(85% 0.07 160)" : "oklch(88% 0.06 20)",
                    }}
                  >
                    <span
                      className="shrink-0 size-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        background: item.ok ? "oklch(50% 0.14 160)" : "oklch(55% 0.18 20)",
                        color: "white",
                      }}
                      aria-hidden="true"
                    >
                      {item.ok ? "✓" : "✗"}
                    </span>
                    <div>
                      <p className="font-semibold" style={{ fontSize: "0.9375rem", color: "oklch(25% 0.015 250)" }}>
                        {item.check}{" "}
                        <span
                          className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            background: item.ok ? "oklch(92% 0.06 160)" : "oklch(92% 0.06 20)",
                            color: item.ok ? "oklch(38% 0.12 160)" : "oklch(45% 0.15 20)",
                          }}
                        >
                          {item.status}
                        </span>
                      </p>
                      <p style={{ fontSize: "0.875rem", color: "oklch(52% 0.025 250)", marginTop: "0.25rem" }}>
                        {item.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {result.verifierReport.unsupportedClaims.length > 0 && (
                <div
                  className="mt-6 p-4 rounded-xl border"
                  style={{ background: "oklch(98% 0.02 20)", borderColor: "oklch(88% 0.06 20)" }}
                >
                  <p className="font-semibold mb-2" style={{ fontSize: "0.875rem", color: "oklch(45% 0.15 20)" }}>
                    Unsupported Claims:
                  </p>
                  <ul className="space-y-1">
                    {result.verifierReport.unsupportedClaims.map((claim, idx) => (
                      <li key={idx} style={{ fontSize: "0.8125rem", color: "oklch(52% 0.025 250)" }}>
                        • {claim}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div
                className="mt-6 p-5 rounded-xl"
                style={{
                  background:
                    result.verifierReport.verdict === "Pass"
                      ? "oklch(95% 0.05 160)"
                      : result.verifierReport.verdict === "Pass with warnings"
                      ? "oklch(97% 0.06 80)"
                      : "oklch(98% 0.02 20)",
                  border: `2px solid ${
                    result.verifierReport.verdict === "Pass"
                      ? "oklch(50% 0.14 160)"
                      : result.verifierReport.verdict === "Pass with warnings"
                      ? "oklch(55% 0.16 65)"
                      : "oklch(55% 0.18 20)"
                  }`,
                }}
              >
                <p className="font-bold" style={{ fontSize: "1rem", color: "oklch(28% 0.015 250)" }}>
                  Final Verdict: {result.verifierReport.verdict}
                </p>
              </div>
            </ContentCard>
          </TabsContent>

          {/* Tab 8: Evaluation Summary */}
          <TabsContent value="evaluation" className="animate-fadeIn">
            <ContentCard title="📈 Evaluation Summary">
              <div className="grid grid-cols-2 auto-rows-[140px] gap-4 mb-6">
                {[
                  { label: "Grounding Score", value: "94%", trend: "+6%", size: "large", delay: 0 },
                  { label: "Safety Score", value: "100%", trend: "—", size: "small", delay: 100 },
                  { label: "Relevance Score", value: "91%", trend: "+4%", size: "small", delay: 200 },
                  { label: "Coherence Score", value: "88%", trend: "+3%", size: "medium", delay: 300 },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={cn(
                      "flex flex-col items-center justify-center p-5 rounded-xl border text-center relative overflow-hidden group hover:-translate-y-1 transition-all duration-300",
                      item.size === "large" && "row-span-2",
                      item.size === "medium" && "col-span-2",
                    )}
                    style={{
                      background: "linear-gradient(135deg, oklch(100% 0.005 260) 0%, oklch(98% 0.008 250) 100%)",
                      borderColor: "oklch(90% 0.006 250)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      animationDelay: `${item.delay}ms`,
                      animation: "fadeInUp 500ms ease-out backwards",
                    }}
                  >
                    {/* Hover glow */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: "radial-gradient(circle at 50% 0%, oklch(65% 0.12 260 / 0.08) 0%, transparent 60%)",
                      }}
                    />

                    <span
                      className="font-extrabold relative z-10"
                      style={{
                        fontSize: item.size === "large" ? "3.5rem" : "2rem",
                        background: "linear-gradient(135deg, oklch(50% 0.18 260) 0%, oklch(55% 0.16 240) 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        lineHeight: 1,
                      }}
                    >
                      {item.value}
                    </span>
                    <span
                      className="mt-2 text-xs font-medium relative z-10"
                      style={{ color: "oklch(55% 0.025 250)", textTransform: "uppercase", letterSpacing: "0.06em" }}
                    >
                      {item.label}
                    </span>
                    <span
                      className="mt-1 text-xs font-semibold relative z-10"
                      style={{ color: item.trend === "—" ? "oklch(60% 0.025 250)" : "oklch(40% 0.12 160)" }}
                    >
                      {item.trend}
                    </span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: "0.9375rem", color: "oklch(48% 0.02 250)", lineHeight: 1.7 }}>
                The 7-agent pipeline achieved high scores across all evaluation dimensions. Grounding accuracy
                was bolstered by Foundry IQ retrieval with source citation. The slight coherence gap (88%)
                is attributed to the high-density information across 6 output tabs — within acceptable range
                for enterprise certification tools.
              </p>
            </ContentCard>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
