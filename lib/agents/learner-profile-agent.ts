// Learner Profile Agent - Parses user input and generates learner profile
import type { LearnerInput, LearnerProfile, AgentTrace } from "../types"

export class LearnerProfileAgent {
  async execute(input: LearnerInput): Promise<{ profile: LearnerProfile; trace: AgentTrace }> {
    const startTime = Date.now()

    // Calculate baseline risk
    let baselineRisk: "Low" | "Medium" | "High" = "Low"
    if (input.meetingHoursPerWeek > 20 || input.practiceScore < 50) {
      baselineRisk = "High"
    } else if (input.meetingHoursPerWeek > 15 || input.practiceScore < 70) {
      baselineRisk = "Medium"
    }

    const profile: LearnerProfile = {
      learnerId: `L-${Date.now()}`,
      role: input.role,
      certification: input.certification,
      availableHoursPerWeek: input.availableStudyHoursPerWeek,
      meetingHoursPerWeek: input.meetingHoursPerWeek,
      focusHoursPerWeek: input.focusHoursPerWeek,
      practiceScore: input.practiceScore,
      baselineRisk,
    }

    const trace: AgentTrace = {
      agentName: "Learner Profile Agent",
      status: "done",
      detail: `Parsed role=${input.role}, cert=${input.certification}, meeting_hours=${input.meetingHoursPerWeek}, practice_score=${input.practiceScore}%. Baseline risk: ${baselineRisk}`,
      timestamp: Date.now() - startTime,
    }

    return { profile, trace }
  }
}
