// Learning Path Curator Agent - Retrieves learning content from IQ layer
import type { LearnerProfile, LearningPathResult, AgentTrace } from "../types"
import { LocalDemoIQ } from "../iq/local-demo-iq"

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

    // Extract skills from retrieved content
    const skills = this.extractSkills(profile.certification, chunks.map((c) => c.text))
    const sources = Array.from(new Set(chunks.map((c) => c.sourceId)))

    const result: LearningPathResult = {
      recommendedSkills: skills,
      sources,
    }

    const trace: AgentTrace = {
      agentName: "Learning Path Curator Agent",
      status: "done",
      detail: `Retrieved ${chunks.length} grounded documents from synthetic ${profile.certification} knowledge base. Sources: ${sources.slice(0, 2).join(", ")}`,
      timestamp: Date.now() - startTime,
    }

    return { result, trace }
  }

  private extractSkills(certification: string, texts: string[]): LearningPathResult["recommendedSkills"] {
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
