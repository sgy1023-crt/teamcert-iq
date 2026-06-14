// Coordinator - Orchestrates the 7-agent workflow
import type { LearnerInput, FinalOutput, AgentTrace } from "../types"
import { LearnerProfileAgent } from "./learner-profile-agent"
import { LearningPathCuratorAgent } from "./learning-path-curator-agent"
import { StudyPlanGeneratorAgent } from "./study-plan-generator-agent"
import { AssessmentAgent } from "./assessment-agent"
import { ManagerInsightsAgent } from "./manager-insights-agent"
import { VerifierAgent } from "./verifier-agent"

export class Coordinator {
  private learnerProfileAgent: LearnerProfileAgent
  private learningPathCuratorAgent: LearningPathCuratorAgent
  private studyPlanGeneratorAgent: StudyPlanGeneratorAgent
  private assessmentAgent: AssessmentAgent
  private managerInsightsAgent: ManagerInsightsAgent
  private verifierAgent: VerifierAgent

  constructor() {
    this.learnerProfileAgent = new LearnerProfileAgent()
    this.learningPathCuratorAgent = new LearningPathCuratorAgent()
    this.studyPlanGeneratorAgent = new StudyPlanGeneratorAgent()
    this.assessmentAgent = new AssessmentAgent()
    this.managerInsightsAgent = new ManagerInsightsAgent()
    this.verifierAgent = new VerifierAgent()
  }

  async execute(input: LearnerInput): Promise<FinalOutput> {
    const traces: AgentTrace[] = []

    // Step 1: Learner Profile Agent
    const { profile, trace: trace1 } = await this.learnerProfileAgent.execute(input)
    traces.push(trace1)

    // Step 2: Learning Path Curator Agent
    const { result: learningPath, trace: trace2 } = await this.learningPathCuratorAgent.execute(profile)
    traces.push(trace2)

    // Step 3: Study Plan Generator Agent
    const { result: studyPlan, trace: trace3 } = await this.studyPlanGeneratorAgent.execute(profile, learningPath)
    traces.push(trace3)

    // Step 4: Assessment Agent
    const { result: assessment, trace: trace4 } = await this.assessmentAgent.execute(profile, learningPath)
    traces.push(trace4)

    // Step 5: Manager Insights Agent
    const { result: managerInsights, trace: trace5 } = await this.managerInsightsAgent.execute(profile, learningPath)
    traces.push(trace5)

    // Step 6: Verifier & Safety Agent
    const { result: verifierReport, trace: trace6 } = await this.verifierAgent.execute(
      learningPath,
      studyPlan,
      assessment,
      managerInsights
    )
    traces.push(trace6)

    // Step 7: Compose final output
    const { readinessScore, readinessLevel, recommendation } = this.calculateReadiness(
      profile,
      learningPath,
      verifierReport
    )

    const finalOutput: FinalOutput = {
      learnerProfile: profile,
      learningPath,
      studyPlan,
      assessment,
      managerInsights,
      verifierReport,
      trace: traces,
      readinessScore,
      readinessLevel,
      recommendation,
    }

    return finalOutput
  }

  private calculateReadiness(
    profile: any,
    learningPath: any,
    verifierReport: any
  ): { readinessScore: number; readinessLevel: "Low" | "Moderate" | "High"; recommendation: string } {
    // Calculate readiness score based on multiple factors
    let score = 50 // Base score

    // Practice score contribution (0-30 points)
    score += (profile.practiceScore / 100) * 30

    // Risk level impact (-20 to +10 points)
    if (profile.baselineRisk === "Low") {
      score += 10
    } else if (profile.baselineRisk === "High") {
      score -= 20
    }

    // Verifier quality bonus (0-10 points)
    score += verifierReport.citationCoverage * 10

    // Cap score at 0-100
    score = Math.max(0, Math.min(100, score))

    // Determine readiness level
    let readinessLevel: "Low" | "Moderate" | "High" = "Moderate"
    if (score >= 75) {
      readinessLevel = "High"
    } else if (score < 50) {
      readinessLevel = "Low"
    }

    // Generate recommendation
    let recommendation = ""
    if (readinessLevel === "High") {
      recommendation = `You are well-positioned for ${profile.certification}. Focus on high-priority gaps and schedule your exam within 4-6 weeks.`
    } else if (readinessLevel === "Moderate") {
      recommendation = `You are moderately ready for ${profile.certification}. A ${
        studyPlan.durationDays
      }-day intensive study plan is recommended, focusing on ${learningPath.recommendedSkills
        .filter((s: any) => s.priority === "High")
        .map((s: any) => s.skill)
        .join(", ")}.`
    } else {
      recommendation = `Extend your preparation timeline for ${profile.certification}. Address foundational gaps before attempting the exam. Consider baseline skill building for 8-12 weeks.`
    }

    return {
      readinessScore: Math.round(score),
      readinessLevel,
      recommendation,
    }
  }
}
