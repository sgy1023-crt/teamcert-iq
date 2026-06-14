// Assessment Agent - Generates practice questions with citations
import type { LearnerProfile, LearningPathResult, AssessmentResult, AgentTrace } from "../types"
import { LocalDemoIQ } from "../iq/local-demo-iq"

export class AssessmentAgent {
  private iq: LocalDemoIQ

  constructor() {
    this.iq = new LocalDemoIQ()
  }

  async execute(
    profile: LearnerProfile,
    learningPath: LearningPathResult
  ): Promise<{ result: AssessmentResult; trace: AgentTrace }> {
    const startTime = Date.now()

    // Generate questions based on certification
    const questions = this.generateQuestions(profile.certification)

    const result: AssessmentResult = {
      questions,
    }

    const trace: AgentTrace = {
      agentName: "Assessment Agent",
      status: "done",
      detail: `Created ${questions.length} practice questions with citation-backed answers`,
      timestamp: Date.now() - startTime,
    }

    return { result, trace }
  }

  private generateQuestions(certification: string): AssessmentResult["questions"] {
    const questionBank: Record<string, AssessmentResult["questions"]> = {
      "AZ-204": [
        {
          question: "Which Azure service is best for event-driven microservices communication?",
          options: ["Azure Service Bus", "Azure Event Grid", "Azure Queue Storage", "Azure Redis Cache"],
          correctAnswer: "Azure Service Bus",
          explanation: "Azure Service Bus provides reliable message queuing with FIFO ordering, sessions, and duplicate detection - ideal for microservices communication.",
          sourceCitation: "[Source: AZ-204#chunk1 - Azure Service Bus documentation]",
          skillArea: "Azure Service Bus & Event Grid",
        },
        {
          question: "What is the maximum timeout for an Azure Function on a Consumption plan?",
          options: ["5 minutes", "10 minutes", "30 minutes", "Unlimited"],
          correctAnswer: "10 minutes",
          explanation: "Consumption plan allows up to 10 minutes maximum timeout, with 5 minutes as the default.",
          sourceCitation: "[Source: AZ-204#chunk0 - Azure Functions documentation]",
          skillArea: "Azure Functions & Serverless",
        },
        {
          question: "Which tier of Azure Cosmos DB provides 99.999% SLA?",
          options: ["Single region", "Multi-region reads", "Multi-region writes", "Standard tier"],
          correctAnswer: "Multi-region writes",
          explanation: "Azure Cosmos DB with multi-region writes enabled provides 99.999% availability SLA.",
          sourceCitation: "[Source: AZ-204#chunk3 - Azure Cosmos DB SLA documentation]",
          skillArea: "Azure Cosmos DB & Storage",
        },
        {
          question: "How does Azure API Management handle versioning?",
          options: [
            "Via API revision and version sets",
            "Only through URL path versioning",
            "Through custom headers only",
            "Versioning is not supported",
          ],
          correctAnswer: "Via API revision and version sets",
          explanation: "Azure API Management supports both revisions (non-breaking changes) and versions (breaking changes) through version sets.",
          sourceCitation: "[Source: AZ-204#chunk2 - API Management versioning guide]",
          skillArea: "Azure API Management",
        },
      ],
      "AZ-400": [
        {
          question: "What is the recommended branching strategy for continuous delivery?",
          options: ["GitFlow", "Trunk-based development", "Feature branches only", "Release branches only"],
          correctAnswer: "Trunk-based development",
          explanation: "Trunk-based development enables faster integration and is recommended for CD practices.",
          sourceCitation: "[Source: AZ-400#chunk1 - DevOps branching strategies]",
          skillArea: "CI/CD Pipelines",
        },
      ],
    }

    return questionBank[certification] || questionBank["AZ-204"]
  }
}
