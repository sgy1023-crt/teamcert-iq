# TeamCert IQ — Demo Script (1-2 minutes)

## 0:00-0:15 — Opening Hook
"Hi, I'm presenting TeamCert IQ — a grounded multi-agent certification readiness system for enterprise upskilling."

*Show homepage with 7-Agent badges*

"Instead of generic AI study advice, TeamCert IQ uses a 7-agent reasoning workflow to assess employee certification readiness with grounded, cited recommendations."

---

## 0:15-0:30 — The Problem
*Point to Demo Scenario card*

"Here's our demo candidate: Alex Chen, a Cloud Engineer preparing for AZ-204 certification. He has high meeting load and a low practice score — classic readiness risk."

"Organizations waste millions on failed certification attempts. TeamCert IQ predicts this risk before it happens."

---

## 0:30-1:00 — Live Demo: 7-Agent Workflow
*Click "Run 7-Agent Readiness Assessment"*

"Watch our 7-agent workflow in action:"

*Point to each agent step as it completes (or show completed list)*

1. Learner Profile Agent — parses workload constraints
2. Learning Path Curator — retrieves grounded learning content from synthetic knowledge base
3. Study Plan Generator — creates capacity-aware timeline
4. Assessment Agent — generates cited practice questions
5. Manager Insights Agent — surfaces team risk
6. Verifier & Safety Agent — checks citation coverage and PII
7. Composer — combines outputs into final assessment

"Every recommendation is grounded in retrieved documents, not hallucinated."

---

## 1:00-1:30 — Results Walkthrough
*Scroll to Assessment Complete*

"Here's Alex's readiness report:"

- **Readiness Score: 49/100** — Medium risk
- **Top Weakness**: Azure Functions & Serverless
- **Recommended Plan**: 42-day focused study timeline
- **Evidence**: 6 synthetic knowledge sources used
- **Verifier Status**: Pass with 92% citation coverage

*Click into Agent Trace tab*

"Every output shows its grounding source — no black box guessing."

---

## 1:30-1:45 — Manager Insight
*Show Manager Insights tab*

"Managers get actionable interventions: protect focus hours, schedule checkpoint assessment before exam booking."

"This prevents expensive exam failures — saving $2,000+ per employee in retake costs."

---

## 1:45-2:00 — Closing
"TeamCert IQ demonstrates how multi-agent reasoning with grounded retrieval solves real enterprise problems."

"Built for Microsoft Agents League Hackathon 2026 — Reasoning Agents Track."

"Thank you!"

---

## Key Talking Points to Emphasize

✅ **7 specialized agents** with clear responsibilities
✅ **Grounded retrieval** from synthetic knowledge base (Foundry IQ-style)
✅ **Verifier-first design** — citation coverage checked on every output
✅ **Capacity-aware planning** — considers workload constraints
✅ **Manager-level insights** — actionable interventions
✅ **Synthetic data only** — zero real PII
✅ **Judge-friendly demo** — runs locally, no paid dependencies

---

## Demo Contingency Plan

If live demo fails:
1. Show pre-recorded video
2. Walk through screenshots in README
3. Show code structure: `lib/agents/` directory with 7 agent files

If time runs short:
- Skip Advanced Configuration panel
- Focus on: Homepage → Click button → Show 7 agents → Show Assessment Complete → Show Agent Trace
