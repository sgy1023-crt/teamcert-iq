"use client"

import { AgentStepCard } from "./agent-step-card"
import type { AgentTrace } from "@/lib/types"

interface AgentProgressProps {
  traces: AgentTrace[]
}

const agentSteps = [
  { key: "Learner Profile Agent", name: "Learner Profile Agent" },
  { key: "Learning Path Curator Agent", name: "Learning Path Curator Agent" },
  { key: "Study Plan Generator Agent", name: "Study Plan Generator Agent" },
  { key: "Assessment Agent", name: "Assessment Agent" },
  { key: "Manager Insights Agent", name: "Manager Insights Agent" },
  { key: "Verifier & Safety Agent", name: "Verifier & Safety Agent" },
  { key: "Composer Agent", name: "Composer (Orchestrator)" },
]

export function AgentProgress({ traces }: AgentProgressProps) {
  const getStepStatus = (agentName: string): "waiting" | "running" | "completed" => {
    const trace = traces.find((t) => t.agentName === agentName)
    if (!trace) return "waiting"
    return trace.status === "done" ? "completed" : "running"
  }

  const getStepSummary = (agentName: string): string | undefined => {
    const trace = traces.find((t) => t.agentName === agentName)
    return trace?.detail
  }

  return (
    <section className="w-full px-6 md:px-12 lg:px-16 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2
            className="font-bold mb-2"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "oklch(22% 0.015 250)" }}
          >
            Running 7-Agent Workflow...
          </h2>
          <p style={{ fontSize: "0.9375rem", color: "oklch(52% 0.025 250)", lineHeight: 1.6, maxWidth: "42rem", margin: "0 auto" }}>
            Analyzing certification readiness with grounded knowledge retrieval, assessment generation, gap diagnosis, verifier, and manager insights.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {agentSteps.map((step) => (
            <AgentStepCard
              key={step.key}
              name={step.name}
              status={getStepStatus(step.key)}
              summary={getStepSummary(step.key)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
