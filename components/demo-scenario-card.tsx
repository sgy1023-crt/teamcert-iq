"use client"

interface DemoScenarioCardProps {
  selectedCandidate: "alex" | "maya" | "jordan"
}

const candidateDetails = {
  alex: {
    name: "Alex Chen",
    role: "Cloud Engineer",
    cert: "AZ-204",
    constraint: "High meeting load (30h/week), low practice score (42%)",
  },
  maya: {
    name: "Maya Patel",
    role: "DevOps Engineer",
    cert: "AZ-400",
    constraint: "Medium meeting load (20h/week), moderate practice score (71%)",
  },
  jordan: {
    name: "Jordan Lee",
    role: "Data Engineer",
    cert: "DP-203",
    constraint: "Low meeting load (12h/week), high practice score (86%)",
  },
}

export function DemoScenarioCard({ selectedCandidate }: DemoScenarioCardProps) {
  const candidate = candidateDetails[selectedCandidate]

  return (
    <div
      className="mt-6 mx-auto max-w-2xl p-6 rounded-xl border text-left"
      style={{
        background: "oklch(97% 0.008 250)",
        borderColor: "oklch(85% 0.02 250)",
      }}
    >
      <p className="font-bold mb-3" style={{ fontSize: "1rem", color: "oklch(28% 0.015 250)" }}>
        📋 What This Demo Simulates
      </p>
      <p style={{ fontSize: "0.9375rem", color: "oklch(45% 0.025 250)", lineHeight: 1.7, marginBottom: "1rem" }}>
        This demo simulates an <strong style={{ color: "oklch(30% 0.015 250)" }}>enterprise certification readiness review</strong>.
        {candidate.name} is a {candidate.role.toLowerCase()} preparing for {candidate.cert}, with {candidate.constraint.toLowerCase()}.
      </p>
      <p style={{ fontSize: "0.9375rem", color: "oklch(45% 0.025 250)", lineHeight: 1.7, marginBottom: "1.25rem" }}>
        Click the button to run a 7-agent workflow that determines whether they are ready, what they are weak at,
        what they should study next, and what their manager should do.
      </p>

      <div
        className="pt-4"
        style={{ borderTop: "1px solid oklch(90% 0.006 250)" }}
      >
        <p className="font-semibold mb-2" style={{ fontSize: "0.875rem", color: "oklch(35% 0.02 250)" }}>
          Selected Candidate Profile:
        </p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2" style={{ fontSize: "0.875rem" }}>
          <div>
            <span style={{ color: "oklch(55% 0.025 250)" }}>Name:</span>{" "}
            <span className="font-semibold" style={{ color: "oklch(30% 0.015 250)" }}>{candidate.name}</span>
          </div>
          <div>
            <span style={{ color: "oklch(55% 0.025 250)" }}>Role:</span>{" "}
            <span className="font-semibold" style={{ color: "oklch(30% 0.015 250)" }}>{candidate.role}</span>
          </div>
          <div>
            <span style={{ color: "oklch(55% 0.025 250)" }}>Target:</span>{" "}
            <span className="font-semibold" style={{ color: "oklch(30% 0.015 250)" }}>{candidate.cert} Certification</span>
          </div>
          <div>
            <span style={{ color: "oklch(55% 0.025 250)" }}>Constraint:</span>{" "}
            <span className="font-semibold" style={{ color: "oklch(45% 0.15 20)" }}>{candidate.constraint}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
