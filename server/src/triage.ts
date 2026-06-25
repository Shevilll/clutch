import { GoogleGenAI } from "@google/genai";

export interface TriageTask {
  id: string;
  title: string;
  type: string;
  deadline: string;
  estimatedEffortMins: number;
  progress: number;
  riskBand: string;
}

export async function analyzeOverload(ai: GoogleGenAI, tasks: TriageTask[]) {
  const prompt = `Analyze these student/developer commitments and determine if they are overcommitted.
  If total effort exceeds available hours to deadline, output "CRITICAL" or "SEVERE" overload.
  Provide a realistic, direct advice paragraph and map each task to a specific action:
  - "start_now": High risk, high impact.
  - "renegotiate": Draft an extension email.
  - "smart_snooze": Move to a later day.
  
  Tasks: ${JSON.stringify(tasks, null, 2)}
  
  Consistency Rules for Scoring:
  - "overloadScore" MUST be between 0 and 35 if "overloadLevel" is "BALANCED".
  - "overloadScore" MUST be between 36 and 75 if "overloadLevel" is "SEVERE".
  - "overloadScore" MUST be between 76 and 100 if "overloadLevel" is "CRITICAL".
  
  Respond in JSON strictly following this schema:
  {
    "overloadLevel": "BALANCED" | "SEVERE" | "CRITICAL",
    "overloadScore": 0-100,
    "assessment": "Detailed 2-3 sentence analysis of their calendar pressure...",
    "advice": "Actionable feedback on how to handle the crisis...",
    "allocations": [
      { "taskId": "string", "action": "start_now" | "renegotiate" | "smart_snooze", "reason": "Why this action..." }
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
          overloadLevel: { type: "STRING", enum: ["BALANCED", "SEVERE", "CRITICAL"] },
          overloadScore: { type: "INTEGER" },
          assessment: { type: "STRING" },
          advice: { type: "STRING" },
          allocations: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                taskId: { type: "STRING" },
                action: { type: "STRING", enum: ["start_now", "renegotiate", "smart_snooze"] },
                reason: { type: "STRING" }
              },
              required: ["taskId", "action", "reason"]
            }
          }
        },
        required: ["overloadLevel", "overloadScore", "assessment", "advice", "allocations"]
      }
    }
  });
  
  try {
    const data = JSON.parse(response.text || "{}");
    return {
      overloadLevel: data.overloadLevel || "BALANCED",
      overloadScore: typeof data.overloadScore === "number" ? data.overloadScore : 0,
      assessment: data.assessment || "No assessment details provided.",
      advice: data.advice || "No specific advice provided.",
      allocations: Array.isArray(data.allocations) ? data.allocations : []
    };
  } catch (err) {
    console.error("Failed to parse triage JSON response:", response.text, err);
    return {
      overloadLevel: "BALANCED",
      overloadScore: 0,
      assessment: "Unable to parse triage analysis.",
      advice: "Please try again later.",
      allocations: []
    };
  }
}
