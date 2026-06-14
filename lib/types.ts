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
  }>
  sources: string[]
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
}
