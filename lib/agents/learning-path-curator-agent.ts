// Learning Path Curator Agent - Retrieves learning content from IQ layer
import type { LearnerProfile, LearningPathResult, AgentTrace } from "../types"
import { LocalDemoIQ } from "../iq/local-demo-iq"
import { reRankLearningPath } from "../llm/learning-path-llm"

export class LearningPathCuratorAgent {
  private iq: LocalDemoIQ

  constructor() {
    this.iq = new LocalDemoIQ()
  }

  async execute(profile: LearnerProfile): Promise<{ result: LearningPathResult; trace: AgentTrace }> {
    const startTime = Date.now()

    // Query knowledge base
    const query = `${profile.certification} ${profile.role} skills learning path`
    const chunks = this.iq.search(query, 5)

    // Extract naive skills from retrieved content
    const naiveSkills = this.extractSkills(profile.certification, chunks.map((c) => c.text))
    const sources = Array.from(new Set(chunks.map((c) => c.sourceId)))

    // Try LLM re-ranking (personalized to candidate's constraints)
    const llmResult = await reRankLearningPath({
      candidateName: profile.candidateName || "Candidate",
      role: profile.role,
      certification: profile.certification,
      practiceScore: profile.practiceScoreAvg,
      meetingHours: profile.meetingHoursPerWeek,
      focusHours: profile.focusHoursPerWeek,
      availableStudyHours: profile.availableStudyHoursPerWeek,
      retrievedSkills: naiveSkills.map((s) => ({ skill: s.skill, priority: s.priority })),
    })

    let finalSkills: LearningPathResult["recommendedSkills"]
    let generationMode: "llm" | "naive"
    let llmProvider: string | undefined
    let llmModel: string | undefined
    let llmRationale: string | undefined

    if (llmResult) {
      // Use LLM-ranked skills with reasons
      finalSkills = llmResult.output.rankedSkills.map((s) => {
        // Merge with naive skill to get currentScore/targetScore
        const naive = naiveSkills.find((n) => n.skill === s.skill) || { currentScore: 50, targetScore: 75 }
        return {
          skill: s.skill,
          priority: s.priority,
          currentScore: naive.currentScore,
          targetScore: naive.targetScore,
          llmReason: s.reason,
        }
      })
      generationMode = "llm"
      llmProvider = llmResult.provider
      llmModel = llmResult.model
      llmRationale = llmResult.output.overallRationale
    } else {
      // Fallback to naive ranking
      finalSkills = naiveSkills
      generationMode = "naive"
    }

    const result: LearningPathResult = {
      recommendedSkills: finalSkills,
      sources,
      retrievedChunks: chunks,
      generationMode,
      llmProvider,
      llmModel,
      llmRationale,
    }

    const trace: AgentTrace = {
      agentName: "Learning Path Curator Agent",
      status: "done",
      detail:
        generationMode === "llm"
          ? `Retrieved ${chunks.length} grounded docs, re-ranked ${finalSkills.length} skills via ${llmProvider}/${llmModel} based on candidate's role and constraints`
          : `Retrieved ${chunks.length} grounded documents from synthetic ${profile.certification} knowledge base. Sources: ${sources.slice(0, 2).join(", ")}`,
      timestamp: Date.now() - startTime,
    }

    return { result, trace }
  }

  private extractSkills(certification: string, texts: string[]): Array<{ skill: string; priority: "High" | "Medium" | "Low"; currentScore?: number; targetScore: number }> {
    // Simple skill extraction based on certification
    const skillMap: Record<string, Array<{ skill: string; priority: "High" | "Medium" | "Low"; currentScore?: number; targetScore: number }>> = {
      "AZ-204": [
        { skill: "Azure Functions & Serverless", priority: "High", currentScore: 35, targetScore: 80 },
        { skill: "Azure Service Bus & Event Grid", priority: "Medium", currentScore: 48, targetScore: 75 },
        { skill: "Azure API Management", priority: "Medium", currentScore: 52, targetScore: 75 },
        { skill: "Azure Cosmos DB & Storage", priority: "Low", currentScore: 61, targetScore: 70 },
      ],
      "AZ-400": [
        { skill: "CI/CD Pipelines", priority: "High", currentScore: 40, targetScore: 85 },
        { skill: "Infrastructure as Code", priority: "High", currentScore: 45, targetScore: 80 },
        { skill: "Release Management", priority: "Medium", currentScore: 55, targetScore: 75 },
      ],
      "DP-203": [
        { skill: "Azure Synapse Analytics", priority: "High", currentScore: 42, targetScore: 80 },
        { skill: "Data Lake Storage", priority: "Medium", currentScore: 50, targetScore: 75 },
      ],
      "AI-102": [
        { skill: "Azure OpenAI Service", priority: "High", currentScore: 38, targetScore: 85 },
        { skill: "Computer Vision", priority: "Medium", currentScore: 52, targetScore: 75 },
      ],
    }

    return skillMap[certification] || [
      { skill: "Core Concepts", priority: "High", currentScore: 50, targetScore: 80 },
      { skill: "Best Practices", priority: "Medium", currentScore: 60, targetScore: 75 },
    ]
  }
}
