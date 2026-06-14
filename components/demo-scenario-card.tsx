"use client"

export function DemoScenarioCard() {
  return (
    <div
      className="mt-6 mx-auto max-w-2xl p-5 rounded-xl border text-left"
      style={{
        background: "oklch(97% 0.008 250)",
        borderColor: "oklch(85% 0.02 250)",
      }}
    >
      <p className="font-bold mb-3" style={{ fontSize: "0.9375rem", color: "oklch(28% 0.015 250)" }}>
        📋 Demo Scenario
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
      <p className="mt-3 pt-3" style={{ fontSize: "0.875rem", color: "oklch(45% 0.025 250)", borderTop: "1px solid oklch(90% 0.006 250)" }}>
        <span className="font-semibold" style={{ color: "oklch(30% 0.015 250)" }}>Task:</span> Assess readiness and generate a personalized study plan using grounded multi-agent reasoning.
      </p>
    </div>
  )
}
