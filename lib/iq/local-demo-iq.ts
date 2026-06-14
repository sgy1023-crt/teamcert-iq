// Local Demo IQ - Synthetic knowledge retrieval
import type { RetrievedChunk } from "../types"

// Synthetic knowledge base
const knowledgeBase: Record<string, string[]> = {
  "AZ-204": [
    "Azure Functions are serverless compute services that allow you to run event-driven code without managing infrastructure. Key concepts: triggers, bindings, consumption plan (5min timeout default, 10min max), premium plan (unlimited timeout).",
    "Azure Service Bus is a fully managed enterprise message broker with message queues and publish-subscribe topics. Supports FIFO ordering, sessions, dead-letter queues, and duplicate detection.",
    "Azure API Management acts as a facade for backend services, providing API gateway capabilities including rate limiting, authentication, caching, and versioning via revision and version sets.",
    "Azure Cosmos DB is a globally distributed, multi-model database. Offers 99.999% SLA with multi-region writes. Supports SQL, MongoDB, Cassandra, Gremlin, and Table APIs.",
    "For Cloud Engineers targeting AZ-204: focus on Azure Functions (70% of exam), Service Bus messaging patterns (15%), API Management (10%), and Cosmos DB basics (5%).",
  ],
  "AZ-400": [
    "Azure DevOps provides CI/CD pipelines, repos, boards, test plans, and artifacts. Key for DevOps Engineers.",
    "Infrastructure as Code with ARM templates, Bicep, and Terraform. Version control strategies: GitFlow, trunk-based development.",
  ],
  "DP-203": [
    "Azure Synapse Analytics combines big data and data warehousing. Data Engineers need to master SQL pools, Spark pools, and data integration pipelines.",
    "Azure Data Lake Storage Gen2 provides hierarchical namespace and is optimized for analytics workloads.",
  ],
  "AI-102": [
    "Azure AI Services include Computer Vision, Language Understanding (LUIS), and Azure OpenAI Service.",
    "AI Engineers should understand prompt engineering, fine-tuning, and responsible AI principles.",
  ],
  "Cloud-Engineer": [
    "Cloud Engineers typically work with compute, storage, networking, and identity services. Strong candidates for AZ-104, AZ-204, AZ-305 certifications.",
  ],
  "DevOps-Engineer": [
    "DevOps Engineers focus on CI/CD automation, infrastructure as code, monitoring, and release management. AZ-400 is the primary certification path.",
  ],
  "workload": [
    "High meeting load (>20h/week) correlates with 40% lower certification success rate. Protect focus hours during study periods.",
    "Learners with <10 focus hours/week should target 14-day intensive study blocks rather than extended timelines.",
    "Practice scores below 70% indicate high readiness risk. Recommend checkpoint assessment before scheduling exam.",
  ],
}

export class LocalDemoIQ {
  search(query: string, topK: number = 5): RetrievedChunk[] {
    const results: RetrievedChunk[] = []
    const queryLower = query.toLowerCase()

    // Simple keyword matching across all knowledge base entries
    for (const [sourceId, chunks] of Object.entries(knowledgeBase)) {
      for (let i = 0; i < chunks.length; i++) {
        const text = chunks[i]
        const textLower = text.toLowerCase()

        // Calculate basic relevance score
        let score = 0
        const queryTerms = queryLower.split(/\s+/)
        for (const term of queryTerms) {
          if (term.length < 3) continue
          if (textLower.includes(term)) {
            score += 1
          }
        }

        if (score > 0) {
          results.push({
            sourceId: `${sourceId}#chunk${i}`,
            title: sourceId,
            text,
            score: score / queryTerms.length,
          })
        }
      }
    }

    // Sort by score descending and return top K
    results.sort((a, b) => b.score - a.score)
    return results.slice(0, topK)
  }
}
