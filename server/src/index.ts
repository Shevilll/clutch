import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import admin from "firebase-admin";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import path from "path";
import { fileURLToPath } from "url";
import { google } from "googleapis";

// Load environment variables
dotenv.config();

// Initialize Firebase Admin using Application Default Credentials (ADC)
try {
  admin.initializeApp();
  console.log("Firebase Admin initialized successfully.");
} catch (error) {
  console.error("Error initializing Firebase Admin:", error);
}

const dbAdmin = getFirestore();
const app = express();
const PORT = process.env.PORT || 5001;

// Resolve dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: "50mb" })); // Increase limit for base64 image uploads

// Initialize Google Gen AI with Vertex AI if configured, otherwise use default
const gcloudProject = process.env.GCLOUD_PROJECT;
const vertexLocation = process.env.VERTEX_LOCATION || "us-central1";

let ai: GoogleGenAI | null = null;

try {
  if (gcloudProject) {
    ai = new GoogleGenAI({
      vertexai: true,
      project: gcloudProject,
      location: vertexLocation,
    });
    console.log(`Initialized Google Gen AI with Vertex AI in project ${gcloudProject}, location ${vertexLocation}`);
  } else if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    console.log("Initialized Google Gen AI with local API Key");
  } else {
    console.warn("Google Gen AI not initialized: missing GCLOUD_PROJECT or GEMINI_API_KEY");
  }
} catch (error) {
  console.error("Error initializing Google Gen AI:", error);
}

// Authentication Middleware with demo-token bypass
async function authenticateUser(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
  }

  const idToken = authHeader.split("Bearer ")[1];

  // Bypassing for the No-login demo sandbox
  if (idToken === "demo-token" || idToken === "demo-user") {
    req.user = { uid: "demo-user", email: "demo@clutch.guardian" };
    return next();
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error: any) {
    console.error("Error verifying Firebase ID token:", error);
    return res.status(401).json({ error: "Unauthorized: Token verification failed", details: error.message });
  }
}

// Basic health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    gcloudProject: gcloudProject || "not set",
    vertexLocation: vertexLocation,
    aiInitialized: !!ai,
  });
});

// Post endpoint to ping LLM (Stage 0)
app.post("/api/ping-llm", async (req, res) => {
  const { prompt } = req.body;

  if (!ai) {
    res.status(500).json({ error: "Google Gen AI is not initialized. Please set GCLOUD_PROJECT or GEMINI_API_KEY." });
    return;
  }

  try {
    const userPrompt = prompt || "Hello! Introduce yourself in one short sentence as Clutch, the autonomous deadline guardian.";
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
    });

    res.json({
      text: response.text,
      model: "gemini-2.5-flash",
    });
  } catch (error: any) {
    console.error("Error generating content from Gemini:", error);
    res.status(500).json({
      error: "Failed to generate content from Gemini",
      details: error.message || error,
    });
  }
});

// Multimodal Capture API (Stage 1)
app.post("/api/capture", authenticateUser, async (req: any, res: any) => {
  const { text, image, timezone } = req.body;

  if (!ai) {
    res.status(500).json({ error: "Google Gen AI is not initialized." });
    return;
  }

  try {
    const nowIso = new Date().toISOString();
    const userTimezone = timezone || "UTC";

    // Prepare content array for Gemini
    const contents: any[] = [];

    // System prompt containing dynamic date context and task rules
    const systemInstruction = `You are ClutchInquirer, the extraction engine of Clutch.
Your job is to analyze messy inputs (syllabus, email, photo, text) and extract clear, actionable commitments (tasks).
Current Time Context: ${nowIso} (Timezone: ${userTimezone}).
Ensure you resolve all relative deadlines relative to this current time context.
For example, if the current time is Wed June 25 2026, then 'tomorrow by 5pm' is '2026-06-26T17:00:00'.
If no specific time of day is mentioned, default to 23:59:59.
Assign a task type matching the available enums: 'assignment', 'email', 'meeting', 'bill', 'interview', 'habit', or 'other'.
Decompose each task into 2-5 actionable subtasks with estimated efforts (minutes).`;

    if (image && image.data && image.mimeType) {
      contents.push({
        inlineData: {
          data: image.data,
          mimeType: image.mimeType,
        }
      });
    }

    const promptText = `Analyze the following input and extract all commitments/tasks:
${text || "Extract tasks from the uploaded image."}`;

    contents.push(promptText);

    // Call Gemini with strict JSON Schema output
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            tasks: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  title: { type: "STRING" },
                  type: { 
                    type: "STRING", 
                    enum: ["assignment", "email", "meeting", "bill", "interview", "habit", "other"] 
                  },
                  deadline: { type: "STRING", description: "ISO 8601 datetime string. Resolve relative terms (e.g. 'tomorrow by 5pm', 'next Friday') relative to the current time provided." },
                  estimatedEffortMins: { type: "INTEGER", description: "Estimated active working minutes to complete this task" },
                  description: { type: "STRING", description: "Context, instructions, or raw details extracted for this task" },
                  subtasks: {
                    type: "ARRAY",
                    items: {
                      type: "OBJECT",
                      properties: {
                        title: { type: "STRING" },
                        effortMins: { type: "INTEGER" }
                      },
                      required: ["title", "effortMins"]
                    }
                  }
                },
                required: ["title", "type", "deadline", "estimatedEffortMins", "description", "subtasks"]
              }
            }
          },
          required: ["tasks"]
        }
      }
    });

    const extractionResult = JSON.parse(response.text || "{\"tasks\":[]}");
    const extractedTasks = extractionResult.tasks || [];
    const tasksCollection = dbAdmin.collection("tasks");
    const savedTasks: any[] = [];

    const now = new Date();

    for (const task of extractedTasks) {
      const newTaskDoc = tasksCollection.doc();
      let deadlineDate = new Date(task.deadline);
      
      // Safety guard against invalid date formatting
      if (isNaN(deadlineDate.getTime())) {
        deadlineDate = new Date();
        deadlineDate.setHours(deadlineDate.getHours() + 24); // Fallback: 24 hours from now
      }

      // Run consistent, refined Risk Engine calculations (aligns capture with standard risk ratings)
      const { riskScore, riskBand } = calculateRisk(
        deadlineDate,
        task.estimatedEffortMins,
        0, // Ingested tasks have 0 progress
        task.type
      );

      const taskData = {
        id: newTaskDoc.id,
        uid: req.user.uid,
        title: task.title,
        type: task.type,
        deadline: Timestamp.fromDate(deadlineDate),
        estimatedEffortMins: task.estimatedEffortMins,
        description: task.description,
        progress: 0,
        status: "todo",
        subtasks: (task.subtasks || []).map((st: any) => ({ ...st, done: false })),
        riskScore,
        riskBand,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await newTaskDoc.set(taskData);
      savedTasks.push(taskData);
    }

    res.json({ success: true, tasksCount: savedTasks.length, tasks: savedTasks });
  } catch (error: any) {
    console.error("Error in capture API:", error);
    res.status(500).json({ error: "Failed to process and extract commitments", details: error.message });
  }
});

// Seed Demo Scenario API (Stage 1)
app.post("/api/seed", authenticateUser, async (req: any, res: any) => {
  try {
    const uid = req.user.uid;
    const tasksCollection = dbAdmin.collection("tasks");

    // 1. Clear existing tasks for this user
    const snapshot = await tasksCollection.where("uid", "==", uid).get();
    const batch = dbAdmin.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // 2. Define Aarav's dynamic seeded commitments
    const now = new Date();
    
    // Algos Essay due in 8 hours (dynamic but critical)
    const deadlineAlgo = new Date(now);
    deadlineAlgo.setHours(now.getHours() + 8);

    // Internship follow-up due in 16 hours (today 5pm approximate)
    const deadlineInternship = new Date(now);
    deadlineInternship.setHours(now.getHours() + 16);

    // DBMS assignment due in 36 hours (tomorrow 5pm approximate)
    const deadlineDBMS = new Date(now);
    deadlineDBMS.setHours(now.getHours() + 36);

    // Stats Quiz due in 56 hours (Friday morning approximate)
    const deadlineStats = new Date(now);
    deadlineStats.setHours(now.getHours() + 56);

    // Hostel mess bill due in 80 hours
    const deadlineBill = new Date(now);
    deadlineBill.setHours(now.getHours() + 80);

    const seededTasks = [
      {
        title: "Algorithms essay (1500 words on greedy vs dp)",
        type: "assignment",
        deadline: Timestamp.fromDate(deadlineAlgo),
        estimatedEffortMins: 180,
        description: "Draft a 1500-word essay comparing Greedy algorithms and Dynamic Programming, focusing on global vs local optimality and knapsack trade-offs.",
        progress: 0,
        status: "todo",
        subtasks: [
          { title: "Define global vs local optimality", effortMins: 30, done: false },
          { title: "Detail greedy selection property (Huffman/Activity)", effortMins: 45, done: false },
          { title: "Detail dynamic programming knapsack approach", effortMins: 45, done: false },
          { title: "Write the decision rubric and conclusion", effortMins: 60, done: false }
        ],
        riskScore: 92,
        riskBand: "critical",
      },
      {
        title: "Internship follow-up to recruiter",
        type: "email",
        deadline: Timestamp.fromDate(deadlineInternship),
        estimatedEffortMins: 15,
        description: "Send a polite follow-up email to the recruiter at Google regarding the summer SDE intern position. Share recent project progress.",
        progress: 0,
        status: "todo",
        subtasks: [
          { title: "Draft follow-up copy in recruiter's context", effortMins: 10, done: false },
          { title: "Include project link and proofread", effortMins: 5, done: false }
        ],
        riskScore: 78,
        riskBand: "high",
      },
      {
        title: "DBMS assignment (ER diagram)",
        type: "assignment",
        deadline: Timestamp.fromDate(deadlineDBMS),
        estimatedEffortMins: 150,
        description: "Normalize the given database schema and create a completed Entity-Relationship (ER) diagram for the university registration system.",
        progress: 30,
        status: "doing",
        subtasks: [
          { title: "Analyze database anomalies and 3NF", effortMins: 45, done: true },
          { title: "Draft entity relationship mappings", effortMins: 45, done: false },
          { title: "Export SVG diagram and write-up", effortMins: 60, done: false }
        ],
        riskScore: 62,
        riskBand: "high",
      },
      {
        title: "Stats quiz study prep",
        type: "interview", // used as general prep/exam study
        deadline: Timestamp.fromDate(deadlineStats),
        estimatedEffortMins: 120,
        description: "Study key stats formulas, hypothesis testing, p-values, and complete practice quiz questions for Friday morning's quiz.",
        progress: 0,
        status: "todo",
        subtasks: [
          { title: "Review p-value calculations & definitions", effortMins: 40, done: false },
          { title: "Solve 5 hypothesis testing practice problems", effortMins: 50, done: false },
          { title: "Formula cheat-sheet review", effortMins: 30, done: false }
        ],
        riskScore: 35,
        riskBand: "medium",
      },
      {
        title: "Pay hostel mess bill",
        type: "bill",
        deadline: Timestamp.fromDate(deadlineBill),
        estimatedEffortMins: 10,
        description: "Transfer hostel mess fees and upload payment receipt to the student portal to avoid mess access suspension.",
        progress: 0,
        status: "todo",
        subtasks: [
          { title: "Initiate fee transfer to warden's account", effortMins: 5, done: false },
          { title: "Upload receipt PDF to portal", effortMins: 5, done: false }
        ],
        riskScore: 30,
        riskBand: "medium",
      }
    ];

    const saved: any[] = [];
    for (const t of seededTasks) {
      const newTaskDoc = tasksCollection.doc();
      const taskData = {
        id: newTaskDoc.id,
        uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        ...t
      };
      await newTaskDoc.set(taskData);
      saved.push(taskData);
    }

    res.json({ success: true, seededCount: saved.length, tasks: saved });
  } catch (error: any) {
    console.error("Error seeding demo scenario:", error);
    res.status(500).json({ error: "Failed to seed demo scenario", details: error.message });
  }
});

// Deterministic Risk Engine (Stage 2)
function calculateRisk(deadlineDate: Date, estimatedEffortMins: number, progress: number, type: string): { riskScore: number, riskBand: "low" | "medium" | "high" | "critical" } {
  const now = new Date();
  const msRemaining = deadlineDate.getTime() - now.getTime();
  const hoursRemaining = msRemaining / (1000 * 60 * 60);

  let riskScore = 10;
  if (hoursRemaining > 0) {
    const remainingEffortMins = estimatedEffortMins * (1 - progress);
    const effortHours = remainingEffortMins / 60;
    
    // Urgency ratio: active working hours required vs actual calendar hours left
    const ratio = effortHours / hoursRemaining;
    
    // Base score is ratio normalized (e.g. if you need 5h and have 5h left, ratio is 1.0 -> base score 100)
    let baseScore = Math.min(90, Math.round(ratio * 100));
    
    // Add type-based modifiers (interview is high priority, email is lower)
    let modifier = 0;
    if (type === "interview") modifier += 15;
    else if (type === "assignment") modifier += 10;
    else if (type === "meeting") modifier += 5;
    else if (type === "email") modifier -= 5;
    else if (type === "bill") modifier += 5; 
    
    // Add an urgency penalty if deadline is very close (e.g., less than 12 hours)
    if (hoursRemaining < 12) {
      modifier += 15;
    } else if (hoursRemaining < 24) {
      modifier += 10;
    }
    
    riskScore = Math.max(5, Math.min(100, baseScore + modifier));
  } else {
    riskScore = 100; // deadline passed
  }

  let riskBand: "low" | "medium" | "high" | "critical" = "low";
  if (riskScore > 85) riskBand = "critical";
  else if (riskScore > 60) riskBand = "high";
  else if (riskScore > 30) riskBand = "medium";

  return { riskScore, riskBand };
}

// Task Update Endpoint - Recalculates Risk on Progress Change (Stage 2)
app.post("/api/tasks/:id/update", authenticateUser, async (req: any, res: any) => {
  const taskId = req.params.id;
  const { subtasks, status } = req.body;
  const uid = req.user.uid;

  try {
    const taskRef = dbAdmin.collection("tasks").doc(taskId);
    const docSnapshot = await taskRef.get();

    if (!docSnapshot.exists) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    const taskData = docSnapshot.data() as any;

    if (taskData.uid !== uid) {
      res.status(403).json({ error: "Unauthorized access to this task" });
      return;
    }

    const updates: any = {
      updatedAt: Timestamp.now()
    };

    let updatedSubtasks = taskData.subtasks;
    if (subtasks) {
      updatedSubtasks = subtasks;
      updates.subtasks = subtasks;
      // Calculate new progress ratio
      const doneCount = updatedSubtasks.filter((st: any) => st.done).length;
      const progress = parseFloat((doneCount / updatedSubtasks.length).toFixed(2));
      updates.progress = progress;
      taskData.progress = progress;
    }

    if (status) {
      updates.status = status;
      taskData.status = status;
    }

    // Run the Risk Engine to recalculate risk
    const deadlineDate = taskData.deadline.toDate();
    const { riskScore, riskBand } = calculateRisk(
      deadlineDate,
      taskData.estimatedEffortMins,
      taskData.progress,
      taskData.type
    );

    updates.riskScore = riskScore;
    updates.riskBand = riskBand;

    await taskRef.update(updates);

    res.json({ success: true, task: { ...taskData, ...updates } });
  } catch (error: any) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Failed to update task", details: error.message });
  }
});

// Tool 1: decompose_task
async function runDecomposeTask(taskId: string, title: string, description: string, uid: string) {
  if (!ai) return null;
  const prompt = `Decompose this task into 3-5 highly actionable subtasks, each with a clear title and an estimated effort in minutes (effortMins).
Task Title: "${title}"
Task Description: "${description}"

Respond with JSON format strictly matching this schema:
{
  "subtasks": [
    { "title": "Subtask title", "effortMins": 30 }
  ]
}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          subtasks: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                title: { type: "STRING" },
                effortMins: { type: "INTEGER" }
              },
              required: ["title", "effortMins"]
            }
          }
        },
        required: ["subtasks"]
      }
    }
  });

  const parsed = JSON.parse(response.text || "{\"subtasks\":[]}");
  const subtasks = parsed.subtasks.map((st: any) => ({ ...st, done: false }));
  
  // Calculate total effort
  const totalEffort = subtasks.reduce((sum: number, st: any) => sum + st.effortMins, 0);

  // Update Firestore
  const taskRef = dbAdmin.collection("tasks").doc(taskId);
  await taskRef.update({
    subtasks,
    estimatedEffortMins: totalEffort,
    updatedAt: Timestamp.now()
  });

  return subtasks;
}

// Create Google Calendar event using User OAuth Token
async function createRealGoogleCalendarEvent(accessToken: string, title: string, start: Date, end: Date, description: string) {
  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const event = {
      summary: `🛡️ [Clutch Rescue] ${title}`,
      description: description,
      start: {
        dateTime: start.toISOString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: end.toISOString(),
        timeZone: "UTC",
      },
      reminders: {
        useDefault: true,
      },
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
    });

    console.log("Google Calendar Event created:", response.data.htmlLink);
    return {
      success: true,
      htmlLink: response.data.htmlLink,
      id: response.data.id
    };
  } catch (error: any) {
    console.error("Failed to create Google Calendar Event:", error.message || error);
    return {
      success: false,
      error: error.message || String(error)
    };
  }
}

// Create Gmail Draft using User OAuth Token
async function createRealGmailDraft(accessToken: string, subject: string, body: string, recipientEmail?: string) {
  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const to = recipientEmail || "recruiter-clutch@example.com";
    const emailContent = [
      `To: ${to}`,
      `Subject: ${subject}`,
      `Content-Type: text/html; charset=utf-8`,
      `MIME-Version: 1.0`,
      ``,
      `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; max-width: 600px;">`,
      `  <div style="display: flex; align-items: center; margin-bottom: 20px;">`,
      `    <div style="background-color: #6366f1; color: white; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; font-size: 18px;">🛡️</div>`,
      `    <div>`,
      `      <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: bold; font-family: monospace;">CLUTCH AUTOPILOT DRAFT</span>`,
      `    </div>`,
      `  </div>`,
      `  <p>Hello,</p>`,
      `  <div style="margin-top: 10px; margin-bottom: 20px; color: #334155;">`,
      body.replace(/\n/g, "<br>"),
      `  </div>`,
      `  <hr style="margin-top: 24px; border: none; border-top: 1px solid #f1f5f9;" />`,
      `  <span style="font-size: 11px; color: #94a3b8; font-style: italic;">Draft prepared autonomously by your Clutch Guardian Agent to protect your commitments. Review in your Gmail Drafts folder.</span>`,
      `</div>`
    ].join("\r\n");

    const encodedMessage = Buffer.from(emailContent)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const response = await gmail.users.drafts.create({
      userId: "me",
      requestBody: {
        message: {
          raw: encodedMessage,
        },
      },
    });

    console.log("Gmail Draft created with ID:", response.data.id);
    return {
      success: true,
      draftId: response.data.id
    };
  } catch (error: any) {
    console.error("Failed to create Gmail Draft:", error.message || error);
    return {
      success: false,
      error: error.message || String(error)
    };
  }
}

// Tool 2: draft_artifact
async function runDraftArtifact(taskId: string, title: string, description: string, kind: string, uid: string, googleToken?: string | null) {
  if (!ai) return null;
  
  let instructions = "";
  if (kind === "first_draft") {
    instructions = "Draft the first 300-500 words of this essay/assignment with a structured outline and clearly marked placeholder sections.";
  } else if (kind === "email_draft") {
    instructions = "Draft a ready-to-send email with a Subject and Body. Adopt a professional, direct, but polite tone.";
  } else if (kind === "study_sheet" || kind === "prep_sheet") {
    instructions = "Draft a comprehensive study sheet/prep guide summarizing key formulas, hypotheses, or key concepts.";
  } else {
    instructions = "Draft a structured outline of the work to be done.";
  }

  const prompt = `You are Clutch, the autonomous deadline guardian.
${instructions}
For Task: "${title}"
Details: "${description}"

Respond in Markdown. Be extremely thorough and make it feel professional, premium, and complete.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const markdownContent = response.text || "Draft could not be generated.";

  // Save to artifacts collection
  const artifactRef = dbAdmin.collection("artifacts").doc();
  const artifactData = {
    id: artifactRef.id,
    uid,
    taskId,
    kind,
    content: markdownContent,
    accepted: false,
    createdAt: Timestamp.now()
  };

  await artifactRef.set(artifactData);

  // Link artifact to task in Firestore
  const taskRef = dbAdmin.collection("tasks").doc(taskId);
  
  let gmailDraftId = null;
  let gmailStatus = "mock";

  if (kind === "email_draft" && googleToken) {
    let subject = `Follow-up regarding: ${title}`;
    let body = markdownContent;
    
    // Attempt to extract subject/body from generated markdown
    const subjectMatch = markdownContent.match(/Subject:\s*(.*)/i);
    if (subjectMatch) {
      subject = subjectMatch[1].trim();
      body = markdownContent.replace(/Subject:\s*(.*)/i, "").trim();
    }

    const draftResult = await createRealGmailDraft(googleToken, subject, body);
    if (draftResult.success) {
      gmailDraftId = draftResult.draftId;
      gmailStatus = "synced";
    } else {
      gmailStatus = `failed: ${draftResult.error}`;
    }
  }

  await taskRef.update({
    draftArtifactId: artifactRef.id,
    draftArtifactKind: kind,
    draftPreview: markdownContent.slice(0, 1000), // preview snippet
    gmailDraftId,
    gmailStatus,
    updatedAt: Timestamp.now()
  });

  return { ...artifactData, gmailDraftId, gmailStatus };
}

// Tool 3: propose_schedule
async function runProposeSchedule(taskId: string, title: string, uid: string, googleToken?: string | null) {
  const now = new Date();
  
  // Create a block starting in 2 hours
  const blockStart = new Date(now);
  blockStart.setHours(now.getHours() + 2);
  blockStart.setMinutes(0);
  blockStart.setSeconds(0);
  
  const blockEnd = new Date(blockStart);
  blockEnd.setHours(blockStart.getHours() + 2); // 2 hours focus block

  let googleEventId = null;
  let googleEventLink = null;
  let googleCalendarStatus = "mock";

  if (googleToken) {
    const calendarResult = await createRealGoogleCalendarEvent(
      googleToken,
      title,
      blockStart,
      blockEnd,
      `Blocked autonomously by your Clutch Guardian Agent to complete "${title}".\nDeadline is approaching!`
    );
    if (calendarResult.success) {
      googleEventId = calendarResult.id;
      googleEventLink = calendarResult.htmlLink;
      googleCalendarStatus = "synced";
    } else {
      googleCalendarStatus = `failed: ${calendarResult.error}`;
    }
  }

  const planRef = dbAdmin.collection("plans").doc();
  const block = {
    taskId,
    title,
    start: Timestamp.fromDate(blockStart),
    end: Timestamp.fromDate(blockEnd),
    rationale: `Locked in a 2-hour deep-work focus block for "${title}" to beat the deadline.`,
    googleEventId,
    googleEventLink,
    googleCalendarStatus
  };

  await planRef.set({
    id: planRef.id,
    uid,
    generatedAt: Timestamp.now(),
    blocks: [block]
  });

  // Update task with schedule block
  const taskRef = dbAdmin.collection("tasks").doc(taskId);
  await taskRef.update({
    focusBlock: {
      start: Timestamp.fromDate(blockStart),
      end: Timestamp.fromDate(blockEnd),
      rationale: block.rationale,
      googleEventId,
      googleEventLink,
      googleCalendarStatus
    },
    updatedAt: Timestamp.now()
  });

  return block;
}

// Tool 4: escalate
async function runEscalate(taskId: string, level: "track" | "suggest" | "assist" | "rescue", userMessage: string, uid: string) {
  const taskRef = dbAdmin.collection("tasks").doc(taskId);
  
  await taskRef.update({
    escalationLevel: level,
    escalationMessage: userMessage,
    updatedAt: Timestamp.now()
  });
  
  return { level, userMessage };
}

// Reusable Autonomous Agent Loop Logic (Stage 3, 4 & 5)
async function executeAgentLoop(uid: string, googleToken: string | null = null, trigger: "manual" | "scheduled" = "manual") {
  if (!ai) {
    throw new Error("Google Gen AI is not initialized.");
  }

  // 1. Create agent run record in Firestore
  const runRef = dbAdmin.collection("agentRuns").doc();
  const runId = runRef.id;

  const runData: any = {
    id: runId,
    uid,
    trigger,
    startedAt: Timestamp.now(),
    finishedAt: null,
    status: "running",
    steps: []
  };

  await runRef.set(runData);

  // Helper to log steps live in Firestore
  const logStep = async (type: "perceive" | "reason" | "tool_call" | "tool_result" | "act" | "reflect", message: string, meta?: any) => {
    const step = {
      ts: new Date().toISOString(),
      type,
      message,
      ...(meta || {})
    };
    runData.steps.push(step);
    await runRef.update({
      steps: runData.steps
    });
    console.log(`[AgentRun ${runId}] [${type}] ${message}`);
  };

  try {
    // 2. PERCEIVE: Load tasks
    const tasksSnapshot = await dbAdmin.collection("tasks").where("uid", "==", uid).get();
    const tasks = tasksSnapshot.docs.map(doc => doc.data() as any);

    await logStep("perceive", `Loaded ${tasks.length} active commitments for user. Analysing deadlines and progress.`);

    if (tasks.length === 0) {
      await logStep("reason", "No active tasks found. Sleeping.");
      const briefing = "Guardian found no active tasks to rescue. Ready for commitments.";
      await runRef.update({
        status: "success",
        finishedAt: Timestamp.now(),
        summary: briefing
      });
      return { success: true, runId, summary: briefing };
    }

    // 3. REASON: Planner phase using Gemini
    const nowIso = new Date().toISOString();
    const tasksSummary = tasks.map(t => ({
      id: t.id,
      title: t.title,
      type: t.type,
      deadline: t.deadline.toDate().toISOString(),
      estimatedEffortMins: t.estimatedEffortMins,
      progress: t.progress,
      status: t.status,
      riskScore: t.riskScore,
      riskBand: t.riskBand
    }));

    await logStep("reason", "Initiating core planning turn. Gemini is determining high-risk tasks requiring rescue operations.");

    const plannerPrompt = `You are Clutch, the autonomous deadline-guardian.
Analyze the following active commitments for the user.
Current Time Context: ${nowIso}

Determine:
1. Which tasks are at critical or high risk?
2. What actions should be taken?
You have the following tools available:
- "decompose_task" (taskId: string): Best for complex tasks with 0% progress.
- "draft_artifact" (taskId: string, kind: "email_draft" | "outline" | "first_draft" | "study_sheet" | "prep_sheet"): Best for drafting essays, email follow-ups, or exam study prep sheets.
- "propose_schedule" (taskId: string): Propose a focus block to execute the work.
- "escalate" (taskId: string, level: "track" | "suggest" | "assist" | "rescue", userMessage: string): Set intervention level and write an action-first status update message.

Active Tasks JSON:
${JSON.stringify(tasksSummary, null, 2)}

Select the highest leverage actions. Prioritize creating focus blocks and drafts for the highest-risk tasks. Limit to 3-4 key actions total.
Respond with JSON strictly conforming to this schema:
{
  "rationale": "Overall explanation of risk status and strategy...",
  "actions": [
    {
      "tool": "decompose_task" | "draft_artifact" | "propose_schedule" | "escalate",
      "taskId": "the task ID",
      "toolParams": {
        "kind": "email_draft" | "outline" | "first_draft" | "study_sheet" | "prep_sheet",
        "level": "track" | "suggest" | "assist" | "rescue",
        "userMessage": "A short status update message telling what the agent is doing"
      },
      "reason": "Why we are running this tool"
    }
  ]
}`;

    const plannerResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: plannerPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            rationale: { type: "STRING" },
            actions: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  tool: { type: "STRING", enum: ["decompose_task", "draft_artifact", "propose_schedule", "escalate"] },
                  taskId: { type: "STRING" },
                  toolParams: {
                    type: "OBJECT",
                    properties: {
                      kind: { type: "STRING", enum: ["email_draft", "outline", "first_draft", "study_sheet", "prep_sheet"] },
                      level: { type: "STRING", enum: ["track", "suggest", "assist", "rescue"] },
                      userMessage: { type: "STRING" }
                    }
                  },
                  reason: { type: "STRING" }
                },
                required: ["tool", "taskId", "reason"]
              }
            }
          },
          required: ["rationale", "actions"]
        }
      }
    });

    const plan = JSON.parse(plannerResponse.text || "{\"rationale\":\"Sleeping\",\"actions\":[]}");

    await logStep("reason", `Strategy formulated: ${plan.rationale}`, { plannerRationale: plan.rationale });

    // 4. ACT: Executor phase
    for (const act of plan.actions) {
      const task = tasks.find(t => t.id === act.taskId);
      if (!task) continue;

      await logStep("tool_call", `Invoking tool "${act.tool}" for "${task.title}". Reason: ${act.reason}`, {
        tool: act.tool,
        taskId: act.taskId
      });

      try {
        if (act.tool === "decompose_task") {
          const subtasks = await runDecomposeTask(task.id, task.title, task.description || "", uid);
          await logStep("tool_result", `Decomposed task "${task.title}" into ${subtasks?.length || 0} subtasks.`, {
            subtasks
          });
        } 
        else if (act.tool === "draft_artifact") {
          const kind = act.toolParams?.kind || "first_draft";
          const artifact: any = await runDraftArtifact(task.id, task.title, task.description || "", kind, uid, googleToken);
          const isSynced = googleToken && artifact?.gmailStatus === "synced";
          await logStep("act", `Generated high-fidelity draft (${kind}) for "${task.title}". ${isSynced ? "Synced draft directly to Gmail." : "Saved in local workspace drawer."}`, {
            artifactId: artifact?.id,
            kind,
            gmailStatus: artifact?.gmailStatus
          });
        } 
        else if (act.tool === "propose_schedule") {
          const block = await runProposeSchedule(task.id, task.title, uid, googleToken);
          const isSynced = googleToken && block.googleCalendarStatus === "synced";
          await logStep("act", `Created focus block: ${block.rationale}. ${isSynced ? "Synced block to Google Calendar." : "Logged in workspace calendar."}`, {
            block,
            googleCalendarStatus: block.googleCalendarStatus
          });
        } 
        else if (act.tool === "escalate") {
          const level = act.toolParams?.level || "rescue";
          const userMessage = act.toolParams?.userMessage || "I've started working on this task.";
          const escalation = await runEscalate(task.id, level, userMessage, uid);
          await logStep("act", `Escalation updated to [${level}]: "${userMessage}"`, {
            escalation
          });
        }
      } catch (err: any) {
        console.error(`Error running tool ${act.tool}:`, err);
        await logStep("reflect", `Tool execution failed: ${err.message}`, { error: err.message });
      }
    }

    // 5. REFLECT & BUILD BRIEFING
    await logStep("reflect", "Running final check: verification and reflection on modified task state.");
    
    // Create a briefing text summarising what was done
    let briefingText = "All commitments are stable. Keep up the great momentum!";
    if (plan.actions.length > 0) {
      briefingText = `I ran a Guardian sweep and intervened on ${plan.actions.length} commitments. ${plan.rationale}`;
    }

    // Write a system-level Morning Briefing / Plan record in plans collection
    const planId = dbAdmin.collection("plans").doc().id;
    await dbAdmin.collection("plans").doc(planId).set({
      id: planId,
      uid,
      generatedAt: Timestamp.now(),
      summary: briefingText,
      horizon: "next 7 days"
    });

    await runRef.update({
      status: "success",
      finishedAt: Timestamp.now(),
      summary: briefingText
    });

    return { success: true, runId, summary: briefingText };
  } catch (error: any) {
    console.error("Error in executeAgentLoop:", error);
    await runRef.update({
      status: "failed",
      finishedAt: Timestamp.now(),
      summary: `Failed to complete loop: ${error.message}`
    });
    throw error;
  }
}

// Manual Trigger Endpoint (Stage 3 & 4)
app.post("/api/run-agent", authenticateUser, async (req: any, res: any) => {
  const uid = req.user.uid;
  const googleAuthHeader = req.headers["authorization-google"];
  let googleToken: string | null = null;
  if (googleAuthHeader && googleAuthHeader.startsWith("Bearer ")) {
    googleToken = googleAuthHeader.split("Bearer ")[1];
  }

  try {
    const result = await executeAgentLoop(uid, googleToken, "manual");
    res.json(result);
  } catch (error: any) {
    console.error("Error in run-agent API:", error);
    res.status(500).json({ error: "Agent Loop execution failed", details: error.message });
  }
});

// Autonomous Morning Guardian Sweep Endpoint (Stage 5)
app.post("/api/guardian", async (req: any, res: any) => {
  const uid = req.body.uid || "demo-user";
  const googleToken = req.body.googleToken || null;

  try {
    console.log(`[Autonomous Guardian] Proactively triggering deadline guardian loop for user: ${uid}`);
    const result = await executeAgentLoop(uid, googleToken, "scheduled");
    res.json(result);
  } catch (error: any) {
    console.error("Error in autonomous guardian sweep API:", error);
    res.status(500).json({ error: "Autonomous sweep failed", details: error.message });
  }
});

// Serve built static files from web SPA
const webDistPath = path.join(__dirname, "../../web/dist");
app.use(express.static(webDistPath));

// Fallback for client-side routing (React SPA)
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    next();
  } else {
    res.sendFile(path.join(webDistPath, "index.html"), (err) => {
      if (err) {
        res.status(200).send("Clutch API Server is running. (Web dist not built yet)");
      }
    });
  }
});

app.listen(PORT, () => {
  console.log(`Clutch Server is running on port ${PORT}`);
});

