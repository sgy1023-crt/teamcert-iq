// Status endpoint — tells the frontend which LLM provider is configured,
// so the homepage can show it before any assessment runs.
// Does NOT leak the key itself.
import { NextResponse } from "next/server"
import { getProviderInfo, isLLMConfigured } from "@/lib/llm/llm-adapter"

export async function GET() {
  const info = getProviderInfo()
  return NextResponse.json({
    llmConfigured: isLLMConfigured(),
    managerMode: isLLMConfigured() ? "llm" : "local",
    provider: info?.name ?? null,
    defaultModel: info?.defaultModel ?? null,
    isAzure: info?.isAzure ?? false,
  })
}
