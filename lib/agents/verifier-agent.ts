// Verifier & Safety Agent — DETERMINISTIC audit.
//
// This agent does REAL checks, it does not rubber-stamp:
//   1. Every citation claimed by the Learning Path is looked up in the
//      synthetic knowledge base. Missing citations are flagged as unsupported.
//   2. Every Assessment question must carry a source citation.
//   3. Citation coverage = cited claims / total factual claims.
//   4. PII / secret patterns are scanned across all grounded text.
//
// It does NOT depend on the Manager Agent's narrative (that text is LLM-
// generated and is not a "citation"), which also breaks what would
// otherwise be a circular dependency (Manager wants the Verifier result,
// Verifier used to want the Manager output).
import type {
  LearningPathResult,
  StudyPlanResult,
  AssessmentResult,
  VerifierReport,
  AgentTrace,
} from "../types"
import { LocalDemoIQ } from "../iq/local-demo-iq"

// Very small, intentional PII / secret pattern set. Synthetic demo data
// should match NONE of these — if any fire, something leaked real data.
const PII_PATTERNS: RegExp[] = [
  /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/, // emails
  /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/, // phone-ish
  /\b(sk-[A-Za-z0-9]{16,}|AKIA[0-9A-Z]{16}|BEGIN PRIVATE KEY)\b/, // secrets
]

export class VerifierAgent {
  private iq: LocalDemoIQ

  constructor() {
    this.iq = new LocalDemoIQ()
  }

  async execute(
    learningPath: LearningPathResult,
    studyPlan: StudyPlanResult,
    assessment: AssessmentResult
  ): Promise<{ result: VerifierReport; trace: AgentTrace }> {
    const startTime = Date.now()

    // ---- Real citation existence check against the knowledge base ----
    const validSourceIds = new Set(this.iq.getAllSourceIds())
    const validDocs = new Set(this.iq.getAllDocumentTitles())

    const unsupportedClaims: string[] = []

    // Each claimed source must resolve to a real knowledge chunk (or doc).
    for (const claimed of learningPath.sources) {
      const exists = validSourceIds.has(claimed) || this.claimMatchesAnyDoc(claimed, validDocs)
      if (!exists) {
        unsupportedClaims.push(`Learning path cites unknown source: "${claimed}"`)
      }
    }
    if (learningPath.sources.length === 0) {
      unsupportedClaims.push("Learning path has no source citations")
    }

    // Each assessment question must carry a grounded citation
    const uncitedQuestions = assessment.questions.filter((q) => !q.sourceCitation || q.sourceCitation.trim().length === 0)
    if (uncitedQuestions.length > 0) {
      unsupportedClaims.push(`${uncitedQuestions.length} assessment question(s) lack source citations`)
    }

    // ---- Citation coverage = grounded claims / total factual claims ----
    const totalClaims = this.countFactualClaims(learningPath, assessment)
    const citedClaims = this.countCitedClaims(learningPath, assessment)
    const citationCoverage = totalClaims > 0 ? citedClaims / totalClaims : 1

    // ---- PII / secret scan across all grounded text ----
    const groundedText = [
      ...learningPath.recommendedSkills.map((s) => s.skill),
      ...learningPath.sources,
      ...assessment.questions.map((q) => `${q.question} ${q.explanation} ${q.sourceCitation}`),
      studyPlan.reasoning,
    ].join(" \n ")
    const piiHits = PII_PATTERNS.filter((p) => p.test(groundedText))
    const piiDetected = piiHits.length > 0

    const syntheticDataOnly = !piiDetected

    // ---- Risk level ----
    let riskLevel: "Low" | "Medium" | "High" = "Low"
    if (piiDetected || citationCoverage < 0.7 || unsupportedClaims.length > 2) {
      riskLevel = "High"
    } else if (citationCoverage < 0.85 || unsupportedClaims.length > 0) {
      riskLevel = "Medium"
    }

    let verdict: "Pass" | "Pass with warnings" | "Fail" = "Pass"
    if (riskLevel === "High") verdict = "Fail"
    else if (riskLevel === "Medium") verdict = "Pass with warnings"

    const result: VerifierReport = {
      citationCoverage: Math.round(citationCoverage * 100) / 100,
      unsupportedClaims,
      piiDetected,
      syntheticDataOnly,
      riskLevel,
      verdict,
    }

    const trace: AgentTrace = {
      agentName: "Verifier & Safety Agent",
      status: "done",
      detail:
        `Audited ${learningPath.sources.length} cited sources against ${validSourceIds.size} knowledge chunks; ` +
        `${unsupportedClaims.length} unsupported claim(s), citation coverage ${(citationCoverage * 100).toFixed(0)}%, ` +
        `PII scan ${piiDetected ? "FLAGGED" : "clean"}. Verdict: ${verdict}.`,
      timestamp: Date.now() - startTime,
    }

    return { result, trace }
  }

  // A claimed source may be a chunk id ("AZ-204#chunk0") or a doc title
  // prefix ("AZ-204 > ..."). Accept either if it resolves to a known doc.
  private claimMatchesAnyDoc(claimed: string, validDocs: Set<string>): boolean {
    const head = claimed.split(/[>#]/)[0].trim()
    return validDocs.has(head)
  }

  private countFactualClaims(learningPath: LearningPathResult, assessment: AssessmentResult): number {
    let count = 0
    count += learningPath.recommendedSkills.length // each skill recommendation
    count += assessment.questions.length // each question
    count += 2 // study plan reasoning claims
    return count
  }

  private countCitedClaims(learningPath: LearningPathResult, assessment: AssessmentResult): number {
    let count = 0
    if (learningPath.sources.length > 0) {
      count += learningPath.recommendedSkills.length
    }
    count += assessment.questions.filter((q) => q.sourceCitation && q.sourceCitation.trim().length > 0).length
    return count
  }
}
