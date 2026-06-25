# Clutch — Build Progress

Track progress of our vertical-slice build here. Mark items as completed as we proceed stage-by-stage.

## Stage 0 — Foundations & "hello, deployed" (Day 1 morning) 🟢 Doing

- [x] Create/confirm GCP project, link billing (credits)
- [x] Scaffold monorepo: `/web` (React+Vite+TS+Tailwind v4) and `/server` (Node 22 + TypeScript)
- [x] Create local Git repo, configure author as `Shevilll`
- [ ] Implement Express server with `/api/health` and `/api/ping-llm` endpoints using `@google/genai`
- [ ] Connect Firebase project & Firebase Auth (Google Sign-In) in the SPA
- [ ] Dockerfile setup for containerized build
- [ ] Deploy to Cloud Run & confirm public HTTPS URL works

---

## Stage 1 — Capture → structured tasks (Day 1 afternoon) ⚪ Todo

- [ ] Define Firestore schemas (`tasks`, `users`, `agentRuns`) and security rules
- [ ] Implement capture UI: Messy textarea capture + image upload
- [ ] Build server-side `POST /api/capture` with multimodal extraction (structured output schema)
- [ ] Build task board UI (grouped by day, clean status visualization)
- [ ] Create "Load demo scenario" seeder button for instant synthetic data
- [ ] Implement No-login Demo Sandbox route (mock fallback path for judges)

---

## Stage 2 — Risk Engine + prioritized board (Day 2 morning) ⚪ Todo

- [ ] Implement deterministic Risk Engine core + Gemini risk-modifier pass
- [ ] Integrate risk badges (low/med/high/critical) and sort board by risk
- [ ] Implement task detail drawer with subtasks checklist, progress, and source view

---

## Stage 3 — The agent loop + visible trace (Day 2 afternoon → Day 3 morning) ⚪ Todo ⭐

- [ ] Set up plain `@google/genai` function-calling agent loop (Planner→Executor→Critic)
- [ ] Implement core tools: `score_risk`, `decompose_task`, `propose_schedule`, `draft_artifact`, `escalate`
- [ ] Persist and stream agent traces in realtime to Firestore `agentRuns`
- [ ] Build cinematic Agent Trace timeline UI
- [ ] Build in-app Artifact Viewer (Accept/Discard markdown viewer)

---

## Stage 4 — Real Google Calendar + Gmail (Day 3 afternoon) ⚪ Todo

- [ ] Wire per-user incremental OAuth 2.0 consent for Calendar & Gmail
- [ ] Implement `GoogleCalendarProvider` (focus blocks, conflict detection)
- [ ] Implement `GmailProvider` (create drafts of written emails)
- [ ] Build provider toggle switch (real vs mock safety net)

---

## Stage 5 — Autonomy + daily briefing (Day 3 evening) ⚪ Todo

- [ ] Set up autonomous daily `POST /guardian` re-plan cron (Cloud Scheduler)
- [ ] Build Daily Briefing UI (agent summary: "one thing that matters most + what I did")

---

## Stage 6 — Polish, design, resilience (Day 4 morning) ⚪ Todo

- [ ] Polish design system and components with full six-state coverage and micro-interactions
- [ ] Verify responsive layouts on mobile Safari (physical iPhone feel)
- [ ] Design custom brand SVG mark and empty state illustrations
- [ ] Build "Under the hood" Google-tech map page

---

## Stage 7 — Submission package (Day 4 afternoon) ⚪ Todo

- [ ] Final deployment of Cloud Run URL and confirm open unauthenticated access
- [ ] Push clean GitHub repository
- [ ] Prepare Google Doc Project Description using templates
- [ ] Write recording-ready `DEMO-SCRIPT.md`
- [ ] Final submit on BlockseBlock
