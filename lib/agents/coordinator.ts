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
    const { readinessScore, readinessLevel, recommendation, scoreBreakdown } = this.calculateReadiness(
      profile,
      learningPath,
      studyPlan,
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
      scoreBreakdown,
    }

    return finalOutput
  }

  private calculateReadiness(
    profile: any,
    learningPath: any,
    studyPlan: any,
    verifierReport: any
  ): {
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
    }
  } {
    // Start from practice score as base
    let practiceScoreContribution = profile.practiceScore

    // Time availability adjustment (0 to +15 points)
    let timeAvailabilityAdjustment = 0
    if (profile.availableHoursPerWeek >= 10) {
      timeAvailabilityAdjustment = 15
    } else if (profile.availableHoursPerWeek >= 6) {
      timeAvailabilityAdjustment = 8
    } else if (profile.availableHoursPerWeek >= 3) {
      timeAvailabilityAdjustment = 3
    }

    // Meeting load penalty (0 to -20 points)
    let meetingLoadPenalty = 0
    if (profile.meetingHoursPerWeek > 25) {
      meetingLoadPenalty = -20
    } else if (profile.meetingHoursPerWeek > 20) {
      meetingLoadPenalty = -12
    } else if (profile.meetingHoursPerWeek > 15) {
      meetingLoadPenalty = -6
    }

    // Weak domain penalty (0 to -15 points)
    const highPrioritySkills = learningPath.recommendedSkills.filter((s: any) => s.priority === "High")
    let weakDomainPenalty = Math.min(highPrioritySkills.length * -5, -15)

    // Evidence/verifier bonus (0 to +10 points)
    let evidenceBonus = Math.round(verifierReport.citationCoverage * 10)

    // Calculate final score
    let finalScore = practiceScoreContribution + timeAvailabilityAdjustment + meetingLoadPenalty + weakDomainPenalty + evidenceBonus

    // Clamp to 0-100
    finalScore = Math.max(0, Math.min(100, finalScore))

    // Determine readiness level
    let readinessLevel: "Low" | "Moderate" | "High" = "Moderate"
    if (finalScore >= 75) {
      readinessLevel = "High"
    } else if (finalScore < 50) {
      readinessLevel = "Low"
    }

    // Generate recommendation
    let recommendation = ""
    if (readinessLevel === "High") {
      recommendation = `You are well-positioned for ${profile.certification}. Focus on high-priority gaps and schedule your exam within 4-6 weeks.`
    } else if (readinessLevel === "Moderate") {
      recommendation = `You are moderately ready for ${profile.certification}. A ${studyPlan.durationDays}-day intensive study plan is recommended, focusing on ${highPrioritySkills.map((s: any) => s.skill).join(", ")}.`
    } else {
      recommendation = `Extend your preparation timeline for ${profile.certification}. Address foundational gaps before attempting the exam. Consider baseline skill building for 8-12 weeks.`
    }

    return {
      readinessScore: Math.round(finalScore),
      readinessLevel,
      recommendation,
      scoreBreakdown: {
        practiceScoreContribution,
        timeAvailabilityAdjustment,
        meetingLoadPenalty,
        weakDomainPenalty,
        evidenceBonus,
        finalScore: Math.round(finalScore),
      },
    }
  }
}
