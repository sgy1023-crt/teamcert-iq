"use client"

import type { ManagerInsights } from "@/lib/types"

interface CoachMessage {
  role: "coach" | "label"
  emoji: string
  label: string
  text: string
  highlight?: boolean
}

function buildMessages(insights: ManagerInsights): CoachMessage[] {
  const msgs: CoachMessage[] = [
    {
      role: "label",
      emoji: "👋",
      label: "",
      text: insights.generationMode === "llm"
        ? `Your AI Coach is powered by ${insights.llmProvider || "LLM"}${insights.llmModel ? ` / ${insights.llmModel}` : ""}`
        : "Your AI Coach is using local analysis",
    },
  ]

  if (insights.managerSummary) {
    msgs.push({ role: "coach", emoji: "📊", label: "Assessment", text: insights.managerSummary })
  }
  if (insights.riskExplanation) {
    msgs.push({ role: "coach", emoji: "⚠️", label: "Risk Analysis", text: insights.riskExplanation })
  }
  if (insights.coachingRecommendation) {
    msgs.push({ role: "coach", emoji: "🎯", label: "Coaching Plan", text: insights.coachingRecommendation })
  }
  if (insights.nextBestAction) {
    msgs.push({ role: "coach", emoji: "🚀", label: "Next Step", text: insights.nextBestAction, highlight: true })
  }

  return msgs
}

export function AICoach({ insights }: { insights: ManagerInsights }) {
  const messages = buildMessages(insights)
  const isLLM = insights.generationMode === "llm"

  return (
    <div className="space-y-4">
      {/* Coach header */}
      <div className="flex items-center gap-3 mb-2">
        <div
          className="size-12 rounded-full flex items-center justify-center text-2xl"
          style={{
            background: "linear-gradient(135deg, oklch(65% 0.12 260), oklch(60% 0.14 200))",
            boxShadow: "0 4px 12px oklch(60% 0.12 260 / 0.3)",
          }}
        >
          🤖
        </div>
        <div>
          <p className="font-bold" style={{ fontSize: "1rem", color: "oklch(25% 0.015 250)" }}>
            AI Certification Coach
          </p>
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{
                background: isLLM ? "oklch(94% 0.04 160)" : "oklch(96% 0.012 260)",
                color: isLLM ? "oklch(38% 0.14 160)" : "oklch(45% 0.10 260)",
              }}
            >
              {isLLM ? "✨ LLM-Powered" : "⚙️ Rule-Based"}
            </span>
          </div>
        </div>
      </div>

      {/* Chat bubbles */}
      <div className="space-y-3">
        {messages.map((msg, idx) => {
          if (msg.role === "label") {
            return (
              <div key={idx} className="text-center">
                <span
                  className="inline-block text-xs px-3 py-1 rounded-full"
                  style={{ background: "oklch(96% 0.006 250)", color: "oklch(60% 0.025 250)" }}
                >
                  {msg.text}
                </span>
              </div>
            )
          }
          return (
            <div key={idx} className="flex gap-3 items-start animate-fadeIn" style={{ animationDelay: `${idx * 150}ms` }}>
              {/* Mini avatar */}
              <div
                className="shrink-0 size-8 rounded-full flex items-center justify-center text-sm mt-0.5"
                style={{
                  background: msg.highlight
                    ? "oklch(94% 0.04 160)"
                    : "oklch(96% 0.012 260)",
                  border: `1.5px solid ${msg.highlight ? "oklch(70% 0.12 160)" : "oklch(88% 0.008 250)"}`,
                }}
              >
                {msg.emoji}
              </div>
              {/* Bubble */}
              <div
                className="flex-1 p-4 rounded-2xl rounded-tl-sm"
                style={{
                  background: msg.highlight
                    ? "oklch(96% 0.025 160)"
                    : "oklch(99% 0.003 250)",
                  border: `1px solid ${msg.highlight ? "oklch(82% 0.08 160)" : "oklch(92% 0.006 250)"}`,
                }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded"
                    style={{
                      background: msg.highlight ? "oklch(92% 0.06 160)" : "oklch(94% 0.015 260)",
                      color: msg.highlight ? "oklch(38% 0.14 160)" : "oklch(40% 0.12 260)",
                    }}
                  >
                    {msg.label}
                  </span>
                </div>
                <p style={{ fontSize: "0.9375rem", color: "oklch(30% 0.015 250)", lineHeight: 1.7 }}>
                  {msg.text}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Deterministic section (always shown) */}
      <div className="mt-5 pt-4" style={{ borderTop: "1px solid oklch(92% 0.006 250)" }}>
        <p className="font-semibold mb-2" style={{ fontSize: "0.8125rem", color: "oklch(50% 0.025 250)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Additional Data
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div
            className="flex items-center justify-between p-3 rounded-xl border"
            style={{ background: "oklch(100% 0 0)", borderColor: "oklch(90% 0.006 250)" }}
          >
            <span style={{ fontSize: "0.875rem", color: "oklch(50% 0.02 250)" }}>Risk Level</span>
            <span
              className="px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{
                background: insights.riskLevel === "High" ? "oklch(97% 0.04 20)" : insights.riskLevel === "Medium" ? "oklch(97% 0.06 80)" : "oklch(95% 0.05 160)",
                color: insights.riskLevel === "High" ? "oklch(45% 0.15 20)" : insights.riskLevel === "Medium" ? "oklch(45% 0.12 65)" : "oklch(38% 0.12 160)",
              }}
            >
              {insights.riskLevel}
            </span>
          </div>
          <div
            className="p-3 rounded-xl border"
            style={{ background: "oklch(100% 0 0)", borderColor: "oklch(90% 0.006 250)" }}
          >
            <p style={{ fontSize: "0.8125rem", color: "oklch(50% 0.02 250)" }}>{insights.riskSummary}</p>
          </div>
        </div>
        {insights.teamRecommendations.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {insights.teamRecommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-2 p-2 rounded-lg" style={{ background: "oklch(98% 0.004 250)" }}>
                <span style={{ color: "oklch(50% 0.18 260)", fontSize: "0.75rem" }}>•</span>
                <span style={{ fontSize: "0.8125rem", color: "oklch(38% 0.02 250)" }}>{rec}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
