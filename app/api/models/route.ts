// Models endpoint — lists available models from the configured provider.
// Returns null if no provider is configured or the provider doesn't support
// model listing (e.g. Azure per-deployment has no list endpoint).
import { NextResponse } from "next/server"
import { listModels } from "@/lib/llm/llm-adapter"

export async function GET() {
  const models = await listModels()
  return NextResponse.json({
    models: models ?? [],
    available: models !== null,
  })
}
