# Clutch — 90-Second Demo Pitch & Screen Recording Script

This script is structured as **Timestamp · On-Screen Action · Voiceover Narration** to help you record a flawless, professional 90-second demo video for your submission.

---

### **[0:00 - 0:15] Section 1: Ingestion & Ingestion-Chaos**
*   **On-Screen Action:**
    *   Show the Clutch landing page (sleek dark mode, neon accents). Click "Try the Live Sandbox" or sign in.
    *   Navigate to the "Today" view. It has some seeded tasks.
    *   Click the **"Add commitment"** input box. Paste a messy, chaotic syllabus paragraph (e.g., *"Wait, so CS301 essay is due next Tuesday at 11:59pm, and it says we need an outline of 400 words plus a bibliography. I think that's like 6 hours of work. Oh and also send a check-in draft to Professor Miller by Friday morning."*).
    *   Click **"Add to Board"**.
*   **Voiceover:**
    *   *"This is Clutch, the autonomous deadline-guardian. Traditional calendars and todo apps only passively remind you of your failure when it’s already too late. Clutch replaces passive alerts with autonomous doing."*
    *   *"We start by pasting a chaotic, messy block of text or snapping a photo of an assignment flyer. In seconds, Gemini digests this chaos and converts it into structured tasks with precise deadlines, effort levels, and automatically estimated risks."*

---

### **[0:15 - 0:35] Section 2: Explainable Risk Board**
*   **On-Screen Action:**
    *   Point to the cards on the main board. Hover over the **"Risk Score"** badges (Low, Medium, High, Critical).
    *   Show how the board automatically sorts tasks so that the ones that will hurt first are pushed to the top.
    *   Click on a critical task card to open the **Task Detail Drawer**. Show the checklists, subtask progress, and original source text.
*   **Voiceover:**
    *   *"Clutch sorts your world by urgency using a transparent Risk Engine. Our formula integrates days-to-deadline, lack of progress, and estimated effort to give you a clear risk band. You instantly know what is on fire."*
    *   *"Opening a task reveals a comprehensive breakdown: subtasks, estimated completion time, progress bars, and the original text source that triggered it."*

---

### **[0:35 - 1:15] Section 3: The Live Agent Loop & Google Workspace Sync (The Money Moment)**
*   **On-Screen Action:**
    *   Click the prominent glowing **"Run Guardian"** or **"Run Clutch"** button.
    *   Scroll down to the **Agent Trace** section or switch to the **"Under the Hood"** tab.
    *   Watch the steps stream live: **Perceive** (loading state), **Reason** (Gemini planning strategy), **Tool Call** (`decompose_task` and `draft_artifact`), **Act** (calling APIs), and **Reflect** (reflecting on state).
    *   Once finished, click on the generated **Artifact Viewer** to show the beautifully formatted markdown essay outline and the email draft to Professor Miller.
    *   *(If scopes are connected)* Open your real **Google Calendar** and show the newly created focus slot, and open **Gmail Drafts** to show the composed email draft ready to go.
*   **Voiceover:**
    *   *"Now for the rescue. Clicking 'Run Clutch' triggers a stateful, multi-agent loop that executes a complete perceive, reason, act, and reflect sequence. Watch the Agent Trace stream live as Gemini formulates a rescue plan."*
    *   *"The agent breaks down complex essay milestones, creates high-fidelity markdown outlines and preparatory sheets, and executes real-world actions. In this case, Clutch has found empty slots on my Google Calendar and blocked off focus time, and written a tailored, professional email draft inside my Gmail to ask my professor for a check-in."*

---

### **[1:15 - 1:30] Section 4: Proactive Autonomy & Conclusion**
*   **On-Screen Action:**
    *   Switch to the **"Under the Hood"** tab. Show the **System Status badges** (Vertex AI, Firestore, Gmail/Calendar API) and the animated **Reasoning Graph** mapping the agentic loop.
    *   Show the **Daily Briefing card** at the top of the Home dashboard, summarizing what was done.
*   **Voiceover:**
    *   *"And Clutch is proactive. Backed by Cloud Scheduler, it sweeps your commitments overnight, re-plans your day, and delivers a dynamic Morning Briefing of what is done before you even wake up. Our 'Under the Hood' trust center ensures full security with incremental permissions."*
    *   *"A reminder tells you that you're late. Clutch makes sure you're not. Thank you."*

---
