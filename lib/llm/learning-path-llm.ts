// Learning Path LLM - Re-ranks skills and explains the personalized order

import { resolveProvider } from "./llm-adapter"

export interface LearningPathLLMInput {
  candidateName: string
  role: string
  certification: string
  practiceScore: number
  meetingHours: number
  focusHours: number
  availableStudyHours: number
  // Skills retrieved from IQ, sorted by naive priority
  retrievedSkills: Array<{ skill: string; priority: "High" | "Medium" | "Low" }>
}

export interface LearningPathLLMOutput {
  // Re-ranked skills with LLM reasoning
  rankedSkills: Array<{ skill: string; priority: "High" | "Medium" | "Low"; reason: string }>
  overallRationale: string
}

function buildLearningPathPrompt(input: LearningPathLLMInput): { system: string; user: string } {
  const system =
    "You are a Microsoft certification learning path advisor. Given a candidate's profile and " +
    "a list of retrieved skills, re-rank them in the optimal learning order for this specific person. " +
    "Consider their role, time constraints, and practice score. Return STRICT JSON with keys: " +
    "'rankedSkills' (array of {skill, priority, reason}) and 'overallRationale' (2-3 sentences). " +
    "Priority must be 'High', 'Medium', or 'Low'. No markdown, no extra keys."

  const user = JSON.stringify(
    {
      instruction:
        "Re-rank these skills into the optimal learning order for this candidate. Prioritize skills that address their weak areas and fit their time constraints.",
      candidate: {
        name: input.candidateName,
        role: input.role,
        targetCertification: input.certification,
        practiceScore: input.practiceScore,
        meetingHoursPerWeek: input.meetingHours,
        focusHoursPerWeek: input.focusHours,
        availableStudyHoursPerWeek: input.availableStudyHours,
      },
      retrievedSkills: input.retrievedSkills,
      requirements: [
        "Keep all skills from the input list (do not add or remove)",
        "Re-order them based on candidate's role, time, and readiness",
        "Assign priority (High/Medium/Low) based on urgency and impact",
        "Provide a brief reason for each skill's priority",
        "Write an overall rationale explaining the learning path strategy",
      ],
    },
    null,
    2
  )
  return { system, user }
}

function parseLearningPathOutput(raw: string): LearningPathLLMOutput | null {
  try {
    const parsed = JSON.parse(raw)
    const rankedSkills = parsed?.rankedSkills
    const overallRationale = parsed?.overallRationale

    if (!Array.isArray(rankedSkills) || typeof overallRationale !== "string") return null

    const validated: LearningPathLLMOutput["rankedSkills"] = []
    for (const s of rankedSkills) {
      if (
        typeof s.skill !== "string" ||
        !["High", "Medium", "Low"].includes(s.priority) ||
        typeof s.reason !== "string"
      ) {
        return null
      }
      validated.push({
        skill: s.skill.trim(),
        priority: s.priority,
        reason: s.reason.trim(),
      })
    }
    return { rankedSkills: validated, overallRationale: overallRationale.trim() }
  } catch {
    return null
  }
}

// Returns null on any failure so the caller falls back to naive ranking.
export async function reRankLearningPath(
  input: LearningPathLLMInput
): Promise<{ output: LearningPathLLMOutput; provider: string; model: string } | null> {
  const p = resolveProvider()
  if (!p) return null

  const model = p.defaultModel
  if (!model) return null

  const { system, user } = buildLearningPathPrompt(input)

  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (p.authScheme === "bearer") headers.Authorization = `Bearer ${p.apiKey}`
  else headers["api-key"] = p.apiKey

  const body: any = {
    temperature: 0.5,
    stream: false,
    max_tokens: 800,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  }

  // Only add response_format for providers that support it (not Grok)
  if (!p.name.includes("grok")) {
    body.response_format = { type: "json_object" }
  }

  const url = p.isAzure
    ? `${p.baseUrl}${p.chatPath}?api-version=${p.azureApiVersion}`
    : `${p.baseUrl}${p.chatPath}`

  if (!p.isAzure) body.model = model

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15000)
  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    if (!res.ok) return null
    const data = await res.json()
    const content = data?.choices?.[0]?.message?.content
    if (typeof content !== "string") return null
    const output = parseLearningPathOutput(content)
    if (!output) return null
    return { output, provider: p.name, model }
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}
