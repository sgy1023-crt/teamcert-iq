// LLM Adapter — multi-provider, OpenAI-compatible.
//
// Supports ANY OpenAI-compatible endpoint (OpenAI, DeepSeek, Moonshot,
// OpenRouter, SiliconFlow, Together, local Ollama/vLLM, etc.) plus Azure
// OpenAI. Used ONLY by the Manager Insight Agent for narrative coaching.
// The readiness score, verifier audit, and all other agents stay
// deterministic.
//
// Provider resolution priority (first match wins):
//   1. Custom:  LLM_API_KEY + LLM_BASE_URL (+ optional LLM_MODEL)
//   2. Named:   OPENAI_API_KEY / DEEPSEEK_API_KEY / MOONSHOT_API_KEY /
//               OPENROUTER_API_KEY / SILICONFLOW_API_KEY / TOGETHER_API_KEY /
//               ZHIPU_API_KEY / QWEN_API_KEY  (baseUrl + default model auto-filled)
//   3. Azure:   AZURE_OPENAI_API_KEY + AZURE_OPENAI_ENDPOINT + AZURE_OPENAI_DEPLOYMENT
//   4. none     -> resolveProvider() returns null, caller falls back to local
//
// Smart auto-fill: given a baseUrl the adapter normalizes the trailing slash,
// appends /v1 if missing, and builds /chat/completions + /models paths.
// Auth scheme is Bearer for OpenAI-compatible, api-key for Azure.

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

export interface Provider {
  name: string
  baseUrl: string // normalized, no trailing slash, has /v1 (unless Azure)
  apiKey: string
  authScheme: "bearer" | "api-key"
  defaultModel: string | null
  chatPath: string // appended to baseUrl
  modelsPath: string
  isAzure: boolean
  azureDeployment?: string
  azureApiVersion?: string
}

const CHAT_TIMEOUT_MS = 12000
const MODELS_TIMEOUT_MS = 6000

// Named providers: env key -> preset baseUrl + sensible default model.
// All are OpenAI-compatible (Bearer auth, /v1/chat/completions, /v1/models).
const NAMED_PROVIDERS: Array<{
  key: string
  envKey: string
  baseUrl: string
  defaultModel: string
}> = [
  { key: "openai", envKey: "OPENAI_API_KEY", baseUrl: "https://api.openai.com/v1", defaultModel: "gpt-4o-mini" },
  { key: "deepseek", envKey: "DEEPSEEK_API_KEY", baseUrl: "https://api.deepseek.com/v1", defaultModel: "deepseek-chat" },
  { key: "moonshot", envKey: "MOONSHOT_API_KEY", baseUrl: "https://api.moonshot.cn/v1", defaultModel: "moonshot-v1-8k" },
  { key: "openrouter", envKey: "OPENROUTER_API_KEY", baseUrl: "https://openrouter.ai/api/v1", defaultModel: "openai/gpt-4o-mini" },
  { key: "siliconflow", envKey: "SILICONFLOW_API_KEY", baseUrl: "https://api.siliconflow.cn/v1", defaultModel: "Qwen/Qwen2.5-7B-Instruct" },
  { key: "together", envKey: "TOGETHER_API_KEY", baseUrl: "https://api.together.xyz/v1", defaultModel: "meta-llama/Llama-3-8b-chat-hf" },
  { key: "zhipu", envKey: "ZHIPU_API_KEY", baseUrl: "https://open.bigmodel.cn/api/paas/v4", defaultModel: "glm-4-flash" },
  { key: "qwen", envKey: "QWEN_API_KEY", baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1", defaultModel: "qwen-turbo" },
]

// Normalize a baseUrl: strip trailing slash, append /v1 if it looks like a
// bare host or root path without a version segment. Respects an explicit /v1
// or /vN already present, and Azure (handled separately).
function normalizeBaseUrl(raw: string): string {
  let url = raw.trim().replace(/\/+$/, "")
  // Has some version-like segment already? Leave it.
  if (/\/v\d+(\b|\/)/.test(url)) return url
  // Providers whose path is already fully specified (no /v1 to add).
  if (/\/(compatible-mode|api\/paas|api\/)/.test(url) && !url.endsWith("/v1")) {
    return url
  }
  return `${url}/v1`
}

export function resolveProvider(): Provider | null {
  // 1. Custom OpenAI-compatible endpoint
  const customKey = process.env.LLM_API_KEY
  const customBase = process.env.LLM_BASE_URL
  if (customKey && customBase) {
    const base = normalizeBaseUrl(customBase)
    return {
      name: process.env.LLM_PROVIDER_NAME || "custom",
      baseUrl: base,
      apiKey: customKey,
      authScheme: "bearer",
      defaultModel: process.env.LLM_MODEL || null,
      chatPath: "/chat/completions",
      modelsPath: "/models",
      isAzure: false,
    }
  }

  // 2. Named providers
  for (const p of NAMED_PROVIDERS) {
    const key = process.env[p.envKey]
    if (key) {
      return {
        name: p.key,
        baseUrl: p.baseUrl,
        apiKey: key,
        authScheme: "bearer",
        defaultModel: p.defaultModel,
        chatPath: "/chat/completions",
        modelsPath: "/models",
        isAzure: false,
      }
    }
  }

  // 3. Azure OpenAI
  const azureKey = process.env.AZURE_OPENAI_API_KEY
  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT
  const azureDeployment = process.env.AZURE_OPENAI_DEPLOYMENT
  if (azureKey && azureEndpoint && azureDeployment) {
    const endpoint = azureEndpoint.replace(/\/+$/, "")
    return {
      name: "azure",
      baseUrl: endpoint,
      apiKey: azureKey,
      authScheme: "api-key",
      defaultModel: azureDeployment, // Azure uses deployment name as model
      chatPath: `/openai/deployments/${azureDeployment}/chat/completions`,
      modelsPath: `/openai/deployments/${azureDeployment}/chat/completions`, // Azure has no list-models per deployment
      isAzure: true,
      azureDeployment,
      azureApiVersion: process.env.AZURE_OPENAI_API_VERSION || "2024-10-21",
    }
  }

  return null
}

export function isLLMConfigured(): boolean {
  return resolveProvider() !== null
}

export function getProviderInfo(): { name: string; defaultModel: string | null; isAzure: boolean } | null {
  const p = resolveProvider()
  if (!p) return null
  return { name: p.name, defaultModel: p.defaultModel, isAzure: p.isAzure }
}

// Fetch the list of available models from the provider's /models endpoint.
// Returns null on any failure (Azure has no equivalent per-deployment list).
export async function listModels(): Promise<string[] | null> {
  const p = resolveProvider()
  if (!p || p.isAzure) return p ? [p.azureDeployment || "azure-deployment"] : null

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), MODELS_TIMEOUT_MS)
  try {
    const res = await fetch(`${p.baseUrl}${p.modelsPath}`, {
      headers: p.authScheme === "bearer" ? { Authorization: `Bearer ${p.apiKey}` } : { "api-key": p.apiKey },
      signal: controller.signal,
    })
    if (!res.ok) return null
    const data = await res.json()
    const ids: string[] = Array.isArray(data?.data)
      ? data.data.map((m: any) => m?.id).filter(Boolean)
      : Array.isArray(data?.models)
        ? data.models.map((m: any) => m?.id || m).filter(Boolean)
        : []
    return ids.length > 0 ? ids : null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
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
      candidate: { name: input.candidateName, role: input.role, targetCertification: input.certification },
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

function buildChatRequest(p: Provider, model: string, system: string, user: string): { url: string; headers: Record<string, string>; body: string } {
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (p.authScheme === "bearer") headers.Authorization = `Bearer ${p.apiKey}`
  else headers["api-key"] = p.apiKey

  const body: any = {
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  }

  if (p.isAzure) {
    const url = `${p.baseUrl}${p.chatPath}?api-version=${p.azureApiVersion}`
    // Azure ignores the "model" field (uses deployment in URL)
    return { url, headers, body: JSON.stringify(body) }
  }

  body.model = model
  return { url: `${p.baseUrl}${p.chatPath}`, headers, body: JSON.stringify(body) }
}

function extractContent(json: any): string | null {
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
    if (!out.managerSummary) return null
    return out
  } catch {
    return null
  }
}

// Pick the best model: explicit default > first available from /models > null.
async function resolveModel(p: Provider): Promise<string | null> {
  if (p.defaultModel) return p.defaultModel
  const available = await listModels()
  return available && available.length > 0 ? available[0] : null
}

// Public entry. Returns null on ANY failure so the caller falls back.
export async function generateManagerInsight(input: ManagerLLMInput): Promise<{ output: ManagerLLMOutput; provider: string; model: string } | null> {
  const p = resolveProvider()
  if (!p) return null

  const model = await resolveModel(p)
  if (!model) return null

  const { system, user } = buildPrompt(input)
  const { url, headers, body } = buildChatRequest(p, model, system, user)

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), CHAT_TIMEOUT_MS)
  try {
    const res = await fetch(url, { method: "POST", headers, body, signal: controller.signal })
    if (!res.ok) return null
    const data = await res.json()
    const content = extractContent(data)
    if (!content) return null
    const output = parseManagerOutput(content)
    if (!output) return null
    return { output, provider: p.name, model }
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}
