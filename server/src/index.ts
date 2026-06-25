import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Resolve dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// Initialize Google Gen AI with Vertex AI if configured, otherwise use default
const gcloudProject = process.env.GCLOUD_PROJECT;
const vertexLocation = process.env.VERTEX_LOCATION || "us-central1";

let ai: GoogleGenAI | null = null;

try {
  // If we have GCP project details, initialize via Vertex AI (using ADC)
  if (gcloudProject) {
    ai = new GoogleGenAI({
      vertexai: true,
      project: gcloudProject,
      location: vertexLocation,
    });
    console.log(`Initialized Google Gen AI with Vertex AI in project ${gcloudProject}, location ${vertexLocation}`);
  } else if (process.env.GEMINI_API_KEY) {
    // Fallback for local development if GCP project isn't linked yet
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    console.log("Initialized Google Gen AI with local API Key");
  } else {
    console.warn("Google Gen AI not initialized: missing GCLOUD_PROJECT or GEMINI_API_KEY");
  }
} catch (error) {
  console.error("Error initializing Google Gen AI:", error);
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
    
    // According to 13-TECH-STACK-FINAL.md, we use gemini-2.5-flash as executor/extraction baseline
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
        // Dist folder doesn't exist yet (e.g. local development)
        res.status(200).send("Clutch API Server is running. (Web dist not built yet)");
      }
    });
  }
});

app.listen(PORT, () => {
  console.log(`Clutch Server is running on port ${PORT}`);
});
