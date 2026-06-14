// Manager Insights Agent
//
// HYBRID: tries a real LLM to generate manager-facing coaching narrative.
// If no API key is configured, the network fails, the model times out
// (9s), or JSON parsing fails, it falls back to a deterministic local
// template. The readiness score, risk level, and recommendations below
// are ALWAYS computed locally — the LLM only writes the narrative
// (managerSummary, coachingRecommendation, riskExplanation, nextBestAction).
import type {
  LearnerProfile,
  LearningPathResult,
  StudyPlanResult,
  AssessmentResult,
  VerifierReport,
  ManagerInsights,
  AgentTrace,
} from "../types"
import { generateManagerInsight, type ManagerLLMInput } from "../llm/llm-adapter"

export interface ManagerAgentContext {
  profile: LearnerProfile
  learningPath: LearningPathResult
  studyPlan: StudyPlanResult
  assessment: AssessmentResult
  readinessScore: number
  readinessLevel: string
  verifier: VerifierReport
  candidateName?: string
}

export class ManagerInsightsAgent {
  async execute(ctx: ManagerAgentContext): Promise<{ result: ManagerInsights; trace: AgentTrace }> {
    const startTime = Date.now()
    const { profile, learningPath } = ctx

    // ---- Deterministic analysis (always computed locally) ----
    const bottlenecks: string[] = []
    if (profile.meetingHoursPerWeek > 20) {
      bottlenecks.push("high meeting load limiting study time")
    }
    if (profile.focusHoursPerWeek < 10) {
      bottlenecks.push("low focus hours reducing deep learning capacity")
    }
    if (profile.practiceScore < 50) {
      bottlenecks.push("low baseline assessment score")
    }

    let riskLevel: "Low" | "Medium" | "High" = "Low"
    if (bottlenecks.length >= 2) riskLevel = "High"
    else if (bottlenecks.length === 1) riskLevel = "Medium"

    const recommendations: string[] = []
    if (profile.meetingHoursPerWeek > 20) {
      recommendations.push("Protect 2 focus hours daily during study period")
      recommendations.push("Consider offering a study sabbatical week before exam")
    }
    if (profile.practiceScore < 70) {
      recommendations.push("Schedule checkpoint assessment before exam booking")
      recommendations.push("Pair with mentor who recently passed certification")
    }
    if (profile.availableHoursPerWeek < 5) {
      recommendations.push("Extend study timeline to reduce weekly pressure")
    }

    const riskSummary = `Your team member is pursuing ${profile.certification} certification. ${
      bottlenecks.length > 0
        ? `Primary bottleneck${bottlenecks.length > 1 ? "s" : ""}: ${bottlenecks.join(", ")}.`
        : "Current capacity supports certification timeline."
    } Certification ROI: High - fills ${this.getRoleGap(profile.role)} skill gap.`

    const interventions = this.getInterventions(profile, riskLevel)

    const weakDomains = learningPath.recommendedSkills
      .filter((s) => s.priority === "High")
      .map((s) => s.skill)

    // ---- Try LLM for narrative ----
    const llmInput: ManagerLLMInput = {
      candidateName: ctx.candidateName || profile.role,
      role: profile.role,
      certification: profile.certification,
      practiceScore: profile.practiceScore,
      meetingHoursPerWeek: profile.meetingHoursPerWeek,
      availableStudyHoursPerWeek: profile.availableHoursPerWeek,
      focusHoursPerWeek: profile.focusHoursPerWeek,
      readinessScore: ctx.readinessScore,
      readinessLevel: ctx.readinessLevel,
      riskLevel,
      weakDomains,
      studyPlanDays: ctx.studyPlan.durationDays,
      studyPlanSummary: ctx.studyPlan.reasoning,
      assessmentSummary: `${ctx.assessment.questions.length} grounded practice questions covering ${weakDomains.join(", ") || "core skills"}`,
      evidenceSources: learningPath.sources,
      verifierVerdict: ctx.verifier.verdict,
      citationCoverage: ctx.verifier.citationCoverage,
    }

    const llmOutput = await generateManagerInsight(llmInput)

    const result: ManagerInsights = {
      riskSummary,
      teamRecommendations: recommendations,
      riskLevel,
      interventions,
      managerSummary: llmOutput?.managerSummary,
      coachingRecommendation: llmOutput?.coachingRecommendation,
      riskExplanation: llmOutput?.riskExplanation,
      nextBestAction: llmOutput?.nextBestAction,
      generationMode: llmOutput ? "llm" : "local",
    }

    const trace: AgentTrace = {
      agentName: "Manager Insights Agent",
      status: "done",
      detail:
        llmOutput
          ? `Generated manager coaching narrative via LLM (${ctx.readinessScore}/100 ${ctx.readinessLevel}, ${riskLevel} risk). Mode: LLM-assisted.`
          : `Synthesized executive summary locally (${riskLevel} risk, ${recommendations.length} recommendations). Mode: local fallback.`,
      timestamp: Date.now() - startTime,
    }

    return { result, trace }
  }

  private getRoleGap(role: string): string {
    const gapMap: Record<string, string> = {
      "Cloud Engineer": "cloud architecture and serverless",
      "DevOps Engineer": "CI/CD automation and IaC",
      "Data Engineer": "big data analytics",
      "AI Engineer": "AI services and ML Ops",
      "Solutions Architect": "enterprise architecture",
      "Security Engineer": "cloud security",
    }
    return gapMap[role] || "technical"
  }

  private getInterventions(profile: LearnerProfile, riskLevel: string): string[] {
    const interventions: string[] = []
    if (riskLevel === "High") {
      interventions.push("Schedule 1:1 to discuss study plan and timeline")
      interventions.push("Review meeting schedule for optimization opportunities")
    }
    if (profile.practiceScore < 50) {
      interventions.push("Provide access to exam prep resources and labs")
    }
    if (interventions.length === 0) {
      interventions.push("Regular check-ins to track progress")
    }
    return interventions
  }
}
