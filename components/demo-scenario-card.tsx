"use client"

export function DemoScenarioCard() {
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
        Alex Chen is a cloud engineer preparing for AZ-204, but his recent practice score is low and his meeting load is high.
      </p>
      <p style={{ fontSize: "0.9375rem", color: "oklch(45% 0.025 250)", lineHeight: 1.7, marginBottom: "1.25rem" }}>
        Click the button to run a 7-agent workflow that determines whether Alex is ready, what he is weak at,
        what he should study next, and what his manager should do.
      </p>

      <div
        className="pt-4"
        style={{ borderTop: "1px solid oklch(90% 0.006 250)" }}
      >
        <p className="font-semibold mb-2" style={{ fontSize: "0.875rem", color: "oklch(35% 0.02 250)" }}>
          Demo Candidate Profile:
        </p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2" style={{ fontSize: "0.875rem" }}>
          <div>
            <span style={{ color: "oklch(55% 0.025 250)" }}>Candidate:</span>{" "}
            <span className="font-semibold" style={{ color: "oklch(30% 0.015 250)" }}>Alex Chen</span>
          </div>
          <div>
            <span style={{ color: "oklch(55% 0.025 250)" }}>Role:</span>{" "}
            <span className="font-semibold" style={{ color: "oklch(30% 0.015 250)" }}>Cloud Engineer</span>
          </div>
          <div>
            <span style={{ color: "oklch(55% 0.025 250)" }}>Goal:</span>{" "}
            <span className="font-semibold" style={{ color: "oklch(30% 0.015 250)" }}>AZ-204 Certification</span>
          </div>
          <div>
            <span style={{ color: "oklch(55% 0.025 250)" }}>Constraint:</span>{" "}
            <span className="font-semibold" style={{ color: "oklch(45% 0.15 20)" }}>High meeting load, low practice score</span>
          </div>
        </div>
      </div>
    </div>
  )
}
