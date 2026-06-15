// Core data types for TeamCert IQ

export interface LearnerInput {
  role: string
  certification: string
  meetingHoursPerWeek: number
  focusHoursPerWeek: number
  availableStudyHoursPerWeek: number
  practiceScore: number
  preferredLearningSlot: "Morning" | "Afternoon" | "Evening" | "Weekend"
  viewMode: "Summary" | "Detailed" | "Executive"
  // Optional display name for narrative generation (e.g. "Alex Chen").
  // Falls back to role if absent.
  candidateName?: string
}

export interface LearnerProfile {
  learnerId: string
  role: string
  certification: string
  availableHoursPerWeek: number
  meetingHoursPerWeek: number
  focusHoursPerWeek: number
  practiceScore: number
  baselineRisk: "Low" | "Medium" | "High"
}

export interface RetrievedChunk {
  sourceId: string
  title: string
  text: string
  score: number
}

export interface LearningPathResult {
  recommendedSkills: Array<{
    skill: string
    priority: "High" | "Medium" | "Low"
    currentScore?: number
    targetScore: number
    llmReason?: string
  }>
  sources: string[]
  // Full retrieved chunks (sourceId, title, text, score) so the UI can show
  // the grounding evidence behind each recommendation in a citation explorer.
  retrievedChunks?: RetrievedChunk[]
  generationMode?: "llm" | "naive"
  llmProvider?: string
  llmModel?: string
  llmRationale?: string
}

export interface StudyPlanResult {
  durationDays: number
  dailyBlocks: Array<{
    day: number
    topic: string
    duration: string
    slot: string
  }>
  reasoning: string
}

export interface AssessmentQuestion {
  question: string
  options: string[]
  correctAnswer: string
  explanation: string
  sourceCitation: string
  skillArea: string
}

export interface AssessmentResult {
  questions: AssessmentQuestion[]
}

export interface ManagerInsights {
  riskSummary: string
  teamRecommendations: string[]
  riskLevel: "Low" | "Medium" | "High"
  interventions: string[]
  // LLM-enhanced narrative fields (populated when LLM is configured, else fallback)
  managerSummary?: string
  coachingRecommendation?: string
  riskExplanation?: string
  nextBestAction?: string
  // "llm" = real LLM generated the narrative; "local" = deterministic template
  generationMode: "llm" | "local"
  // Which provider/model produced the narrative (only when generationMode === "llm")
  llmProvider?: string
  llmModel?: string
}

export interface VerifierReport {
  citationCoverage: number
  unsupportedClaims: string[]
  piiDetected: boolean
  syntheticDataOnly: boolean
  riskLevel: "Low" | "Medium" | "High"
  verdict: "Pass" | "Pass with warnings" | "Fail"
}

export interface AgentTrace {
  agentName: string
  status: "done" | "processing" | "pending"
  detail: string
  timestamp: number
}

export interface FinalOutput {
  learnerProfile: LearnerProfile
  learningPath: LearningPathResult
  studyPlan: StudyPlanResult
  assessment: AssessmentResult
  managerInsights: ManagerInsights
  verifierReport: VerifierReport
  trace: AgentTrace[]
  readinessScore: number
  readinessLevel: "Low" | "Moderate" | "High"
  recommendation: string
  scoreBreakdown: {
    practiceScoreContribution: number
    timeAvailabilityAdjustment: number
    meetingLoadPenalty: number
    weakDomainPenalty: number
    evidenceBonus: number
    finalScore: number
    weights: {
      practice: number
      timeFit: number
      workload: number
      weakDomain: number
      evidence: number
    }
    rawScores: {
      practice: number
      timeFit: number
      workload: number
      weakDomain: number
      evidence: number
    }
  }
}
