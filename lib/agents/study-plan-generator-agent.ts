// Study Plan Generator Agent - Generates capacity-aware study plan
import type { LearnerProfile, LearningPathResult, StudyPlanResult, AgentTrace } from "../types"

export class StudyPlanGeneratorAgent {
  async execute(
    profile: LearnerProfile,
    learningPath: LearningPathResult
  ): Promise<{ result: StudyPlanResult; trace: AgentTrace }> {
    const startTime = Date.now()

    // Determine plan duration based on available hours and risk
    let durationDays = 42 // 6 weeks default
    if (profile.availableHoursPerWeek < 3) {
      durationDays = 56 // 8 weeks for low availability
    } else if (profile.availableHoursPerWeek > 10) {
      durationDays = 28 // 4 weeks for high availability
    }

    // Generate daily blocks based on skills
    const dailyBlocks: StudyPlanResult["dailyBlocks"] = []
    const skills = learningPath.recommendedSkills

    // Allocate time based on priority
    let dayCounter = 1
    for (const skill of skills) {
      const daysForSkill = skill.priority === "High" ? 14 : skill.priority === "Medium" ? 7 : 7
      const hoursPerDay = Math.min(profile.availableHoursPerWeek / 7, 2)

      for (let i = 0; i < Math.min(daysForSkill, 7); i++) {
        dailyBlocks.push({
          day: dayCounter++,
          topic: skill.skill,
          duration: `${hoursPerDay.toFixed(1)}h`,
          slot: this.determineSlot(profile.meetingHoursPerWeek, profile.focusHoursPerWeek),
        })
      }
    }

    // Add review week
    for (let i = 0; i < 7; i++) {
      dailyBlocks.push({
        day: dayCounter++,
        topic: "Mock Exams & Review",
        duration: "3h",
        slot: "Morning",
      })
    }

    const reasoning = `Given ${profile.meetingHoursPerWeek}h meeting load and ${profile.focusHoursPerWeek}h focus hours, ${this.getSlotRationale(
      profile.meetingHoursPerWeek,
      profile.focusHoursPerWeek
    )}. Allocated ${durationDays} days with ${profile.availableHoursPerWeek}h/week study capacity.`

    const result: StudyPlanResult = {
      durationDays,
      dailyBlocks: dailyBlocks.slice(0, 14), // Show first 2 weeks
      reasoning,
    }

    const trace: AgentTrace = {
      agentName: "Study Plan Generator Agent",
      status: "done",
      detail: `Generated ${durationDays}-day plan with daily blocks. Adjusted for ${profile.meetingHoursPerWeek}h meeting load.`,
      timestamp: Date.now() - startTime,
    }

    return { result, trace }
  }

  private determineSlot(meetingHours: number, focusHours: number): string {
    if (meetingHours > 20) {
      return "Morning" // Before meetings start
    } else if (focusHours > 15) {
      return "Afternoon" // During high focus period
    }
    return "Evening"
  }

  private getSlotRationale(meetingHours: number, focusHours: number): string {
    if (meetingHours > 20) {
      return "morning slots are optimal to avoid meeting conflicts"
    } else if (focusHours > 15) {
      return "afternoon study during peak focus hours is recommended"
    }
    return "evening study blocks fit best with current schedule"
  }
}
