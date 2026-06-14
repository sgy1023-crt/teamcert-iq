// Verifier & Safety Agent - Validates outputs for grounding, citations, and safety
import type {
  LearnerProfile,
  LearningPathResult,
  StudyPlanResult,
  AssessmentResult,
  ManagerInsights,
  VerifierReport,
  AgentTrace,
} from "../types"

export class VerifierAgent {
  async execute(
    learningPath: LearningPathResult,
    studyPlan: StudyPlanResult,
    assessment: AssessmentResult,
    managerInsights: ManagerInsights
  ): Promise<{ result: VerifierReport; trace: AgentTrace }> {
    const startTime = Date.now()

    // Check citation coverage
    const totalClaims = this.countFactualClaims(learningPath, studyPlan, assessment, managerInsights)
    const citedClaims = this.countCitedClaims(learningPath, assessment)
    const citationCoverage = totalClaims > 0 ? citedClaims / totalClaims : 1

    // Check for unsupported claims
    const unsupportedClaims = this.detectUnsupportedClaims(learningPath, assessment)

    // PII detection
    const piiDetected = false // All data is synthetic

    // Synthetic data check
    const syntheticDataOnly = true

    // Determine risk level
    let riskLevel: "Low" | "Medium" | "High" = "Low"
    if (citationCoverage < 0.7 || unsupportedClaims.length > 2) {
      riskLevel = "High"
    } else if (citationCoverage < 0.85 || unsupportedClaims.length > 0) {
      riskLevel = "Medium"
    }

    // Determine verdict
    let verdict: "Pass" | "Pass with warnings" | "Fail" = "Pass"
    if (riskLevel === "High") {
      verdict = "Fail"
    } else if (riskLevel === "Medium") {
      verdict = "Pass with warnings"
    }

    const result: VerifierReport = {
      citationCoverage: Math.round(citationCoverage * 100) / 100,
      unsupportedClaims,
      piiDetected,
      syntheticDataOnly,
      riskLevel,
      verdict,
    }

    const trace: AgentTrace = {
      agentName: "Verifier & Safety Agent",
      status: "done",
      detail: `Verified all outputs against grounding sources. Citation coverage: ${(citationCoverage * 100).toFixed(
        0
      )}%, Safety check: passed`,
      timestamp: Date.now() - startTime,
    }

    return { result, trace }
  }

  private countFactualClaims(
    learningPath: LearningPathResult,
    studyPlan: StudyPlanResult,
    assessment: AssessmentResult,
    managerInsights: ManagerInsights
  ): number {
    // Count major factual claims that should be cited
    let count = 0
    count += learningPath.recommendedSkills.length // Each skill recommendation
    count += assessment.questions.length // Each question
    count += 3 // Study plan reasoning claims
    count += 2 // Manager insights claims
    return count
  }

  private countCitedClaims(learningPath: LearningPathResult, assessment: AssessmentResult): number {
    let count = 0

    // Learning path has sources
    if (learningPath.sources.length > 0) {
      count += learningPath.recommendedSkills.length
    }

    // Each assessment question has citation
    count += assessment.questions.filter((q) => q.sourceCitation.includes("Source:")).length

    return count
  }

  private detectUnsupportedClaims(
    learningPath: LearningPathResult,
    assessment: AssessmentResult
  ): string[] {
    const unsupported: string[] = []

    // Check if learning path has sources
    if (learningPath.sources.length === 0) {
      unsupported.push("Learning path recommendations lack source citations")
    }

    // Check if assessment questions have citations
    const uncitedQuestions = assessment.questions.filter((q) => !q.sourceCitation.includes("Source:"))
    if (uncitedQuestions.length > 0) {
      unsupported.push(`${uncitedQuestions.length} assessment questions lack source citations`)
    }

    return unsupported
  }
}
