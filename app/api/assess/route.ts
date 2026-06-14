// API route for running the 7-agent assessment
import { NextRequest, NextResponse } from "next/server"
import type { LearnerInput } from "@/lib/types"
import { Coordinator } from "@/lib/agents/coordinator"

export async function POST(request: NextRequest) {
  try {
    const input: LearnerInput = await request.json()

    // Validate input
    if (!input.role || !input.certification) {
      return NextResponse.json(
        { error: "Missing required fields: role and certification" },
        { status: 400 }
      )
    }

    // Run the 7-agent workflow
    const coordinator = new Coordinator()
    const result = await coordinator.execute(input)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Assessment error:", error)
    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
