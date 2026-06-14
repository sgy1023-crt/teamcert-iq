// Unified scoring engine for TeamCert IQ
// All readiness scores are calculated from input parameters, never hardcoded by name

export interface ScoringInput {
  practiceScore: number // 0-100
  availableStudyHoursPerWeek: number
  meetingHoursPerWeek: number
  weakDomainsCount: number // from learning path agent
  evidenceSourcesCount: number // from verifier
  verifierStatus: "Pass" | "Pass with warnings" | "Fail"
}

export interface ScoringBreakdown {
  practiceScore: number // weighted
  timeFitScore: number // weighted
  workloadScore: number // weighted
  weakDomainScore: number // weighted
  evidenceScore: number // weighted
  finalScore: number
  rawScores: {
    practice: number
    timeFit: number
    workload: number
    weakDomain: number
    evidence: number
  }
}

const WEIGHTS = {
  practice: 0.45,
  timeFit: 0.15,
  workload: 0.1,
  weakDomain: 0.2,
  evidence: 0.1,
}

export function calculateReadinessScore(input: ScoringInput): ScoringBreakdown {
  // 1. Practice Score (0-100, direct use)
  const rawPractice = input.practiceScore

  // 2. Time Fit Score (0-100)
  let rawTimeFit = 30
  if (input.availableStudyHoursPerWeek > 10) {
    rawTimeFit = 95
  } else if (input.availableStudyHoursPerWeek >= 8) {
    rawTimeFit = 85
  } else if (input.availableStudyHoursPerWeek >= 5) {
    rawTimeFit = 60
  }

  // 3. Workload Score (0-100)
  let rawWorkload = 35
  if (input.meetingHoursPerWeek <= 15) {
    rawWorkload = 90
  } else if (input.meetingHoursPerWeek <= 22) {
    rawWorkload = 65
  }

  // 4. Weak Domain Score (0-100)
  let rawWeakDomain = 85
  if (input.weakDomainsCount >= 3) {
    rawWeakDomain = 50
  } else if (input.weakDomainsCount === 2) {
    rawWeakDomain = 70
  }

  // 5. Evidence Score (0-100)
  let rawEvidence = 50
  if (input.verifierStatus === "Pass" && input.evidenceSourcesCount >= 4) {
    rawEvidence = 85
  } else if (input.verifierStatus === "Pass with warnings" || input.evidenceSourcesCount >= 2) {
    rawEvidence = 70
  }

  // Calculate weighted scores
  const practiceWeighted = rawPractice * WEIGHTS.practice
  const timeFitWeighted = rawTimeFit * WEIGHTS.timeFit
  const workloadWeighted = rawWorkload * WEIGHTS.workload
  const weakDomainWeighted = rawWeakDomain * WEIGHTS.weakDomain
  const evidenceWeighted = rawEvidence * WEIGHTS.evidence

  // Final score (sum of weighted components)
  const finalScore = Math.round(
    practiceWeighted + timeFitWeighted + workloadWeighted + weakDomainWeighted + evidenceWeighted
  )

  return {
    practiceScore: Math.round(practiceWeighted),
    timeFitScore: Math.round(timeFitWeighted),
    workloadScore: Math.round(workloadWeighted),
    weakDomainScore: Math.round(weakDomainWeighted),
    evidenceScore: Math.round(evidenceWeighted),
    finalScore: Math.max(0, Math.min(100, finalScore)),
    rawScores: {
      practice: rawPractice,
      timeFit: rawTimeFit,
      workload: rawWorkload,
      weakDomain: rawWeakDomain,
      evidence: rawEvidence,
    },
  }
}
