// Status endpoint — tells the frontend whether a real LLM backend is
// configured, so the homepage can show the Manager Insight mode upfront
// before any assessment runs. Does NOT leak the key itself.
import { NextResponse } from "next/server"
import { isLLMConfigured } from "@/lib/llm/llm-adapter"

export async function GET() {
  return NextResponse.json({
    llmConfigured: isLLMConfigured(),
    managerMode: isLLMConfigured() ? "llm" : "local",
  })
}
