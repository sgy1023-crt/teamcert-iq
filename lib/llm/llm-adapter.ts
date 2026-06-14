// LLM Adapter — server-side only
//
// Minimal, dependency-free OpenAI-compatible client. Used ONLY by the
// Manager Insight Agent to generate narrative coaching text. The readiness
// score, verifier audit, and all other agents stay deterministic.
//
// Env vars (read in this order; first match wins):
//   OpenAI-compatible:
//     OPENAI_API_KEY        (required)
//     OPENAI_BASE_URL       (optional, e.g. proxy or vLLM endpoint)
//     OPENAI_MODEL          (optional, default "gpt-4o-mini")
//   Azure OpenAI (alternative):
//     AZURE_OPENAI_API_KEY  (required)
//     AZURE_OPENAI_ENDPOINT (required, e.g. https://<resource>.openai.azure.com)
//     AZURE_OPENAI_DEPLOYMENT (required, deployment name)
//     AZURE_OPENAI_API_VERSION (optional, default "2024-10-21")
//
// If neither set is configured, generate() returns null and the caller
// MUST fall back to the local template. Never throws for missing config.

export interface ManagerLLMInput {
  candidateName: string
  role: string
  certification: string
  practiceScore: number
  meetingHoursPerWeek: number
  availableStudyHoursPerWeek: number
  focusHoursPerWeek: number
  readinessScore: number
  readinessLevel: string
  riskLevel: string
  weakDomains: string[]
  studyPlanDays: number
  studyPlanSummary: string
  assessmentSummary: string
  evidenceSources: string[]
  verifierVerdict: string
  citationCoverage: number
}

export interface ManagerLLMOutput {
  managerSummary: string
  coachingRecommendation: string
  riskExplanation: string
  nextBestAction: string
}

const TIMEOUT_MS = 9000

type Backend =
  | { kind: "openai"; apiKey: string; baseUrl: string; model: string }
  | { kind: "azure"; apiKey: string; endpoint: string; deployment: string; apiVersion: string }
  | null

function resolveBackend(): Backend {
  // OpenAI-compatible first
  const openaiKey = process.env.OPENAI_API_KEY
  if (openaiKey) {
    return {
      kind: "openai",
      apiKey: openaiKey,
      baseUrl: (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, ""),
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    }
  }

  // Azure OpenAI
  const azureKey = process.env.AZURE_OPENAI_API_KEY
  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT
  const azureDeployment = process.env.AZURE_OPENAI_DEPLOYMENT
  if (azureKey && azureEndpoint && azureDeployment) {
    return {
      kind: "azure",
      apiKey: azureKey,
      endpoint: azureEndpoint.replace(/\/$/, ""),
      deployment: azureDeployment,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || "2024-10-21",
    }
  }

  return null
}

export function isLLMConfigured(): boolean {
  return resolveBackend() !== null
}

function buildPrompt(input: ManagerLLMInput): { system: string; user: string } {
  const system =
    "You are an enterprise certification readiness coach. You write concise, " +
    "specific, manager-facing coaching guidance grounded ONLY in the provided " +
    "candidate data. Do not invent scores, certifications, or facts. Be direct " +
    "and professional. Return STRICT JSON with exactly these keys: " +
    "managerSummary, coachingRecommendation, riskExplanation, nextBestAction. " +
    "Each value is a short paragraph (2-4 sentences). No markdown, no extra keys."

  const user = JSON.stringify(
    {
      instruction: "Generate manager-facing coaching guidance for this candidate. Ground every statement in the data below.",
      candidate: {
        name: input.candidateName,
        role: input.role,
        targetCertification: input.certification,
      },
      signals: {
        recentPracticeScore: input.practiceScore,
        meetingHoursPerWeek: input.meetingHoursPerWeek,
        focusHoursPerWeek: input.focusHoursPerWeek,
        availableStudyHoursPerWeek: input.availableStudyHoursPerWeek,
      },
      assessment: {
        readinessScore: input.readinessScore,
        readinessLevel: input.readinessLevel,
        riskLevel: input.riskLevel,
        weakDomains: input.weakDomains,
        studyTimelineDays: input.studyPlanDays,
        studyPlanSummary: input.studyPlanSummary,
        practiceAssessmentSummary: input.assessmentSummary,
      },
      grounding: {
        evidenceSources: input.evidenceSources,
        verifierVerdict: input.verifierVerdict,
        citationCoverage: input.citationCoverage,
      },
    },
    null,
    2
  )

  return { system, user }
}

function buildRequest(backend: Backend, system: string, user: string): { url: string; headers: Record<string, string>; body: string } {
  if (backend.kind === "openai") {
    return {
      url: `${backend.baseUrl}/chat/completions`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${backend.apiKey}`,
      },
      body: JSON.stringify({
        model: backend.model,
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    }
  }

  // Azure
  return {
    url: `${backend.endpoint}/openai/deployments/${backend.deployment}/chat/completions?api-version=${backend.apiVersion}`,
    headers: {
      "Content-Type": "application/json",
      "api-key": backend.apiKey,
    },
    body: JSON.stringify({
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  }
}

function extractContent(json: any): string | null {
  // OpenAI and Azure share the same response shape
  const content = json?.choices?.[0]?.message?.content
  return typeof content === "string" ? content : null
}

function parseManagerOutput(raw: string): ManagerLLMOutput | null {
  try {
    const parsed = JSON.parse(raw)
    const out: ManagerLLMOutput = {
      managerSummary: String(parsed.managerSummary || "").trim(),
      coachingRecommendation: String(parsed.coachingRecommendation || "").trim(),
      riskExplanation: String(parsed.riskExplanation || "").trim(),
      nextBestAction: String(parsed.nextBestAction || "").trim(),
    }
    // Require at least the summary to consider it valid
    if (!out.managerSummary) return null
    return out
  } catch {
    return null
  }
}

// Public entry point. Returns null on ANY failure (no config, network error,
// timeout, non-200, bad JSON). Caller falls back to local template.
export async function generateManagerInsight(input: ManagerLLMInput): Promise<ManagerLLMOutput | null> {
  const backend = resolveBackend()
  if (!backend) return null

  const { system, user } = buildPrompt(input)
  const { url, headers, body } = buildRequest(backend, system, user)

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body,
      signal: controller.signal,
    })

    if (!res.ok) return null

    const data = await res.json()
    const content = extractContent(data)
    if (!content) return null

    return parseManagerOutput(content)
  } catch {
    // aborted (timeout), network error, or JSON error — all fall back
    return null
  } finally {
    clearTimeout(timer)
  }
}
