# Clutch — Project Description (Hackathon Submission)

**Live App (Cloud Run):** [https://clutch-server-405021235372.us-central1.run.app](https://clutch-server-405021235372.us-central1.run.app) *(or current deployed Cloud Run URL)*  
**GitHub Repository:** [https://github.com/Shevilll/clutch](https://github.com/Shevilll/clutch)  

---

## 1. Problem Statement Selected
**#1 — The Last-Minute Life Saver.**  
Students, developers, and creators frequently miss critical deadlines because standard calendar and todo applications only *passively remind* them. They say "Assignment due in 2 hours," which is too late, easy to dismiss, and offers no actual help with doing the work. Clutch changes this by moving from passive reminding to **autonomous doing**. It is a proactive deadline-guardian that identifies overcommitment, plans focus sessions, drafts starter materials, and sets up communication channels *before* the deadline causes panic.

---

## 2. Solution Overview
Clutch is an autonomous **deadline-guardian agent** built on **Gemini 2.5/3** using Vertex AI. The backend operates a multi-agent **Planner → Executor → Critic** reasoning sequence that continuously evaluates user commitments. 

- **Chaos-to-Structure Intake:** Clutch parses messy, unstructured inputs (such as syllabus text snippets or pictures of a hand-written assignment) and converts them into structured tasks with accurate dates and estimated effort levels.
- **Explainable Risk Scoring:** Every commitment is processed through a risk engine that ranks tasks by deadline proximity, remaining work, and lack of progress, visually sorting the world by what will hurt first.
- **Autonomous Rescue Loop:** When a task reaches a critical risk threshold, the user can trigger or let Clutch automatically "rescue" it. The agent breaks down the complex task into structured subtasks, drafts real-world helper documents (such as email templates, outlines, study sheets, or essays), searches for conflicts, and schedules high-priority focus blocks on your **Google Calendar** and crafts drafts in **Gmail**.
- **Proactive Autonomy:** Runs unattended on a scheduled basis (triggered via simulated or real Cloud Scheduler cron sweeps) to deliver a personalized **Daily Briefing**: *"The one thing that matters today, and what I've already done to rescue you."*
- **Absolute Trust & Visibility:** Features a live, cinematic **Agent Trace** rendering every single thought, tool call, and critique in real-time, backed by an **Autopilot Trust & Safety Control** dashboard where users can manage incremental Google permissions and control autonomous activity.

---

## 3. Key Features
- **Multimodal Capture:** Paste a chaotic text dump or upload a photo of a whiteboard/flyer. Using Vertex AI Gemini multimodal parsing, Clutch instantly extracts structured tasks, resolves relative dates, and estimates effort.
- **Dynamic Risk Engine:** Sorts and colors your board by risk urgency (`Low`, `Medium`, `High`, `Critical`) using a custom formula that combines estimated effort, days left, and current task progress.
- **Real Google Workspace Sync:** Integrates with **Google Calendar** (for free-busy slot detection and booking custom Focus Blocks) and **Gmail** (for creating ready-to-send draft responses and extensions requesting emails).
- **Cinematic Agent Trace:** Watch the agent's brain stream its thoughts live. View JSON payloads of tool calls, reflection steps, and self-critiques as the agent executes playbooks.
- **In-App Artifact Viewer:** View and accept/discard beautifully rendered markdown assets (such as first drafts, essay structures, study sheets, or calendar block confirmations) created by the agent.
- **Interactive Tech & Trust Hub ("Under the Hood"):** A gorgeous visual dashboard offering live-sync badges for Google APIs, a dynamic SVG Reasoning Graph illustrating the perceive-act loop, and safety-policy configurations.

---

## 4. Technologies Used
- **Frontend SPA:** React 19, TypeScript 6.0, Vite 8.1, Tailwind CSS v4, Lucide React, Motion (Framer), Recharts (for risk & commitment dashboards).
- **Backend Server:** Node.js 22, Express, TypeScript, `@google/genai` (SDK for Vertex AI Gemini integration), `firebase-admin` SDK.
- **Data & Auth:** Cloud Firestore (for real-time sync of tasks, agent runs, artifacts, and plans), Firebase Authentication (with incremental Google OAuth scope permissions).
- **Deployment:** Cloud Run (containerized using multi-stage Docker build for serving both SPA and Express API), Cloud Build.

---

## 5. Google Technologies Utilized
- **Vertex AI — Gemini 2.5 Flash:** Powering both the unstructured multimodal ingestion, the task decomposer, draft composer, calendar planner, and the core Planner/Critic agent loop.
- **Firebase Auth (Google Sign-In + Incremental Scopes):** Lets judges login instantly. Clicking "Link Google Scopes" requests incremental permissions client-side (`calendar`, `gmail.compose`), passing the token securely to Vertex tools.
- **Cloud Firestore:** Serves as the realtime state store, streaming agent loop steps (`agentRuns`) and task progress live to the React UI.
- **Google Calendar API:** Checks user availability, discovers empty slots, and books focus sessions directly on the user's real calendar.
- **Gmail API:** Composes email drafts (e.g., asking a professor for an extension or seeking feedback on an outline) directly inside the user's Drafts folder.

---

## 6. Mapping to Evaluation Criteria

### A. Agentic Depth (30%)
Clutch does not simply call an API in a single turn. It executes a complete, stateful **Perceive → Plan → Execute → Reflect** loop. It reads the current task states (Perceive), determines which ones are on fire, selects which tools to call (Plan), executes actions such as subtask breakdown or Google API integration (Execute), and then reflects on whether the state has successfully shifted (Reflect). All of this is logged as a serialized trace that streams live to the client.

### B. Originality & Innovation (25%)
Instead of passive text alerts, Clutch creates the actual calendar focus block and drafts the email or essay outline for you. It moves the needle from "alerting you to a problem" to "solving the problem before you get there."

### C. Technical Implementation (25%)
The implementation is robust. It uses a **double-token security pattern** to let a visiting judge use a unauthenticated "Live Sandbox Mode" (falling back to mocks) while letting authenticated users experience real Calendar and Gmail sync. Strict TypeScript and production-ready multi-stage Docker builds ensure zero downtime and white screens.

### D. UX & Polish (20%)
Features curated HSL colors, sleek dark modes, glassmorphism, dynamic animations, hover micro-interactions, responsive mobile views, and visual system diagnostics.

---
