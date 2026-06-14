// Manager Insights Agent - Generates manager-level insights and recommendations
import type { LearnerProfile, LearningPathResult, ManagerInsights, AgentTrace } from "../types"

export class ManagerInsightsAgent {
  async execute(
    profile: LearnerProfile,
    learningPath: LearningPathResult
  ): Promise<{ result: ManagerInsights; trace: AgentTrace }> {
    const startTime = Date.now()

    // Analyze bottlenecks
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

    // Determine risk level
    let riskLevel: "Low" | "Medium" | "High" = "Low"
    if (bottlenecks.length >= 2) {
      riskLevel = "High"
    } else if (bottlenecks.length === 1) {
      riskLevel = "Medium"
    }

    // Generate recommendations
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

    const result: ManagerInsights = {
      riskSummary,
      teamRecommendations: recommendations,
      riskLevel,
      interventions: this.getInterventions(profile, riskLevel),
    }

    const trace: AgentTrace = {
      agentName: "Manager Insights Agent",
      status: "done",
      detail: `Synthesized executive summary with ${riskLevel} risk level and ${recommendations.length} actionable recommendations`,
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
