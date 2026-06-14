"use client"

interface AgentStepCardProps {
  name: string
  status: "waiting" | "running" | "completed"
  summary?: string
}

export function AgentStepCard({ name, status, summary }: AgentStepCardProps) {
  const statusColors = {
    waiting: { bg: "oklch(95% 0.008 250)", border: "oklch(85% 0.015 250)", text: "oklch(60% 0.025 250)" },
    running: { bg: "oklch(96% 0.015 260)", border: "oklch(70% 0.10 260)", text: "oklch(40% 0.12 260)" },
    completed: { bg: "oklch(96% 0.025 160)", border: "oklch(70% 0.10 160)", text: "oklch(38% 0.12 160)" },
  }

  const statusIcons = {
    waiting: "⏸",
    running: "▶",
    completed: "✓",
  }

  const colors = statusColors[status]

  return (
    <div
      className="flex items-start gap-3 p-4 rounded-xl border transition-all duration-300"
      style={{
        background: colors.bg,
        borderColor: colors.border,
      }}
    >
      <span
        className="shrink-0 size-7 rounded-full flex items-center justify-center font-bold text-sm"
        style={{
          background: colors.border,
          color: "white",
        }}
      >
        {statusIcons[status]}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold" style={{ fontSize: "0.9375rem", color: "oklch(28% 0.015 250)" }}>
          {name}
        </p>
        {summary && status === "completed" && (
          <p className="mt-1 text-sm" style={{ color: colors.text }}>
            {summary}
          </p>
        )}
        {status === "running" && (
          <p className="mt-1 text-sm animate-pulse" style={{ color: colors.text }}>
            Processing...
          </p>
        )}
      </div>
    </div>
  )
}
