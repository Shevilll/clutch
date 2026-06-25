import { useState, useEffect, useRef } from "react";
import { 
  motion, 
  AnimatePresence 
} from "motion/react";
import { 
  Cpu, 
  Database, 
  ShieldCheck, 
  ShieldAlert,
  Terminal,
  Calendar, 
  Mail, 
  Clock, 
  Layers, 
  Server, 
  ChevronRight,
  CheckCircle2,
  GitBranch,
  Info,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Activity,
  DollarSign,
  Lock,
  Play,
  Check,
  AlertCircle,
  RefreshCw,
  Flame
} from "lucide-react";

interface TechNode {
  id: string;
  name: string;
  category: "compute" | "database" | "identity" | "tools" | "orchestration";
  description: string;
  detailedRole: string;
  pipelineRole: "Planner" | "Executor" | "Critic" | "Shared State" | "Security";
  status: "ACTIVE" | "CONNECTED" | "SECURE" | "STANDBY";
  icon: React.ComponentType<any>;
  flowDirection: string;
  techTag: string;
  service: string;
  latency: string;
  throughput: string;
  cost: string;
  uptime: string;
  security: {
    iamRole: string;
    encryption: string;
    authScope?: string;
  };
  cliCommand: string;
}

// Category theme mapping for cohesive, premium aesthetics
const categoryThemes = {
  compute: {
    color: "indigo",
    hex: "#6366f1",
    bg: "bg-indigo-500/5 dark:bg-indigo-500/10",
    border: "border-indigo-500/40 dark:border-indigo-500/60",
    text: "text-indigo-600 dark:text-indigo-400",
    glow: "shadow-[0_0_25px_rgba(99,102,241,0.22)] ring-1 ring-indigo-500/30",
    accentBg: "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30",
    iconBgActive: "bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400",
    cornerBorder: "border-indigo-500",
    particleGlow: "rgba(99,102,241,0.6)"
  },
  database: {
    color: "emerald",
    hex: "#10b981",
    bg: "bg-emerald-500/5 dark:bg-emerald-500/10",
    border: "border-emerald-500/40 dark:border-emerald-500/60",
    text: "text-emerald-600 dark:text-emerald-400",
    glow: "shadow-[0_0_25px_rgba(16,185,129,0.22)] ring-1 ring-emerald-500/30",
    accentBg: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30",
    iconBgActive: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
    cornerBorder: "border-emerald-500",
    particleGlow: "rgba(16,185,129,0.6)"
  },
  identity: {
    color: "sky",
    hex: "#0ea5e9",
    bg: "bg-sky-500/5 dark:bg-sky-500/10",
    border: "border-sky-500/40 dark:border-sky-500/60",
    text: "text-sky-600 dark:text-sky-400",
    glow: "shadow-[0_0_25px_rgba(14,165,233,0.22)] ring-1 ring-sky-500/30",
    accentBg: "bg-sky-50 dark:bg-sky-950/20 border-sky-100 dark:border-sky-900/30",
    iconBgActive: "bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400",
    cornerBorder: "border-sky-500",
    particleGlow: "rgba(14,165,233,0.6)"
  },
  tools: {
    color: "rose",
    hex: "#f43f5e",
    bg: "bg-rose-500/5 dark:bg-rose-500/10",
    border: "border-rose-500/40 dark:border-rose-500/60",
    text: "text-rose-600 dark:text-rose-400",
    glow: "shadow-[0_0_25px_rgba(244,63,94,0.22)] ring-1 ring-rose-500/30",
    accentBg: "bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30",
    iconBgActive: "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400",
    cornerBorder: "border-rose-500",
    particleGlow: "rgba(244,63,94,0.6)"
  },
  orchestration: {
    color: "amber",
    hex: "#f59e0b",
    bg: "bg-amber-500/5 dark:bg-amber-500/10",
    border: "border-amber-500/40 dark:border-amber-500/60",
    text: "text-amber-600 dark:text-amber-400",
    glow: "shadow-[0_0_25px_rgba(245,158,11,0.22)] ring-1 ring-amber-500/30",
    accentBg: "bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30",
    iconBgActive: "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400",
    cornerBorder: "border-amber-500",
    particleGlow: "rgba(245,158,11,0.6)"
  }
};

interface PortProps {
  position: "left" | "right" | "top" | "bottom";
  isActive: boolean;
  category: "compute" | "database" | "identity" | "tools" | "orchestration";
}

// Beautiful integrated recessed circular sockets with glowing LEDs
const CardPort = ({ position, isActive, category }: PortProps) => {
  const theme = categoryThemes[category];
  
  let positionClass = "";
  switch (position) {
    case "left":
      positionClass = "left-0 top-1/2 -translate-y-1/2 -translate-x-1/2";
      break;
    case "right":
      positionClass = "right-0 top-1/2 -translate-y-1/2 translate-x-1/2";
      break;
    case "top":
      positionClass = "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2";
      break;
    case "bottom":
      positionClass = "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2";
      break;
  }

  return (
    <div 
      className={`absolute ${positionClass} w-3.5 h-3.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center z-20`}
    >
      <div 
        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
          isActive ? "" : "bg-slate-300 dark:bg-slate-700"
        }`}
        style={isActive ? {
          backgroundColor: theme.hex,
          boxShadow: `0 0 10px ${theme.hex}, 0 0 4px ${theme.hex}`
        } : undefined}
      />
    </div>
  );
};

export default function TechMapTab() {
  const [selectedNode, setSelectedNode] = useState<string>("vertex-ai");
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"blueprint" | "topology">("blueprint");
  
  // Interactive Canvas zoom & pan state
  const [zoom, setZoom] = useState<number>(1.0);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showTraffic, setShowTraffic] = useState<boolean>(true);

  // Inspector active tab
  const [inspectorTab, setInspectorTab] = useState<"telemetry" | "security" | "console">("telemetry");

  // Dynamic Live Console Log State
  const [liveLogs, setLiveLogs] = useState<Record<string, string[]>>({});
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Diagnostics test state
  const [diagnosticsState, setDiagnosticsState] = useState<"idle" | "running" | "success" | "failed">("idle");
  const [diagnosticsLogs, setDiagnosticsLogs] = useState<string[]>([]);
  const [diagnosticsProgress, setDiagnosticsProgress] = useState<number>(0);

  const nodes: TechNode[] = [
    {
      id: "vertex-ai",
      name: "Vertex AI (Gemini 2.5)",
      category: "compute",
      description: "Autonomous reasoning engine powering risk synthesis & agent tool dispatch.",
      detailedRole: "Forms the core of the Planner and Critic. Receives raw commitments, reasons over deadline slack budgets, decomposes bulk tasks, and reflects on tool actions to guarantee zero focus conflicts.",
      pipelineRole: "Planner",
      status: "ACTIVE",
      icon: Cpu,
      flowDirection: "Dispatches tools to Cloud Run executors",
      techTag: "PLAN_AI_2.5",
      service: "Vertex AI platform (Gemini 2.5 Pro)",
      latency: "320ms",
      throughput: "15k tokens/min",
      cost: "$0.0015 / 1K tokens",
      uptime: "99.98%",
      security: {
        iamRole: "roles/ai.user",
        encryption: "TLS 1.3 / AES-256",
        authScope: "Vertex AI Access"
      },
      cliCommand: "gcloud ai models list --project=clutch-guardian-gcp"
    },
    {
      id: "cloud-run",
      name: "Cloud Run",
      category: "compute",
      description: "Serverless container hosting the Node.js Clutch API and task orchestrator.",
      detailedRole: "Hosts the Executor runtime. Receives triggered sweeps from Cloud Scheduler, invokes Vertex AI models, manages client-side Google OAuth flows, and acts as the secure intermediary.",
      pipelineRole: "Executor",
      status: "ACTIVE",
      icon: Server,
      flowDirection: "Queries and writes live states to Firestore",
      techTag: "RUN_EXEC_NODE",
      service: "Cloud Run (Fully Managed Serverless Container)",
      latency: "45ms",
      throughput: "99.99% success rate",
      cost: "$0.0000240 / vCPU-second",
      uptime: "99.99%",
      security: {
        iamRole: "roles/run.invoker",
        encryption: "HTTPS / TLS 1.3",
        authScope: "Cloud Run Service Invoke"
      },
      cliCommand: "gcloud run services describe clutch-api --region=us-central1"
    },
    {
      id: "cloud-firestore",
      name: "Cloud Firestore",
      category: "database",
      description: "NoSQL document store with live-snapshot sync for immediate UI feedback.",
      detailedRole: "Acts as the Shared State. Keeps documents for tasks, active academic commitments, generated draft actions, and real-time agent execution traces. Syncs directly to the React application.",
      pipelineRole: "Shared State",
      status: "CONNECTED",
      icon: Database,
      flowDirection: "Supplies current telemetry to Planner",
      techTag: "STATE_DB_NOSQL",
      service: "Cloud Firestore NoSQL Document DB",
      latency: "12ms",
      throughput: "10k writes/sec",
      cost: "$0.18 / GiB stored",
      uptime: "99.999%",
      security: {
        iamRole: "roles/datastore.user",
        encryption: "AES-256 At Rest",
        authScope: "Cloud Firestore User"
      },
      cliCommand: "gcloud firestore indexes composite list"
    },
    {
      id: "firebase-auth",
      name: "Firebase Auth & OAuth",
      category: "identity",
      description: "Secure user validation and dynamic Google OAuth token delegation.",
      detailedRole: "Secures authentication state and intercepts Google Scopes. It passes down dynamic user identity tokens securely without storing long-lived server-side client secrets.",
      pipelineRole: "Security",
      status: "SECURE",
      icon: ShieldCheck,
      flowDirection: "Delegates verified credentials to Google Calendar/Gmail APIs",
      techTag: "SEC_IAM_OAUTH",
      service: "Firebase Auth & OAuth Delegation",
      latency: "85ms",
      throughput: "Unlimited auth sessions",
      cost: "Free (Spark Tier)",
      uptime: "99.99%",
      security: {
        iamRole: "roles/firebase.admin",
        encryption: "JSON Web Tokens (JWT)",
        authScope: "Firebase Auth admin"
      },
      cliCommand: "gcloud firebase auth tenants list"
    },
    {
      id: "google-calendar",
      name: "Google Calendar API",
      category: "tools",
      description: "Active time allocation system protecting user focus slots.",
      detailedRole: "Tool for the Executor. Writes immediate 2-3 hour 'Clutch Focus' sessions in the user's primary calendar to reserve space for highly vulnerable deliverables.",
      pipelineRole: "Executor",
      status: "CONNECTED",
      icon: Calendar,
      flowDirection: "Secures actual hours in student's day",
      techTag: "TOOL_CAL_API",
      service: "Google Calendar OAuth 2.0 API",
      latency: "180ms",
      throughput: "60 requests/min limit",
      cost: "Free (API Quota basis)",
      uptime: "100.0%",
      security: {
        iamRole: "roles/oauth.delegated",
        encryption: "OAuth 2.0 SSL/TLS",
        authScope: "https://www.googleapis.com/auth/calendar"
      },
      cliCommand: "gcloud services list --enabled | grep calendar"
    },
    {
      id: "gmail-api",
      name: "Gmail API",
      category: "tools",
      description: "Proactive communication drafts creating a physical deadline safety net.",
      detailedRole: "Tool for the Executor. Under negative slack budgets, writes polite, context-aware draft emails requesting extension buffers or showing early progress to instructors.",
      pipelineRole: "Executor",
      status: "CONNECTED",
      icon: Mail,
      flowDirection: "Stages draft correspondence in user inbox",
      techTag: "TOOL_MAIL_API",
      service: "Google Mail REST API Delegation",
      latency: "210ms",
      throughput: "100 requests/min limit",
      cost: "Free (API Quota basis)",
      uptime: "99.99%",
      security: {
        iamRole: "roles/oauth.delegated",
        encryption: "OAuth 2.0 SSL/TLS",
        authScope: "https://www.googleapis.com/auth/gmail.compose"
      },
      cliCommand: "gcloud services list --enabled | grep gmail"
    },
    {
      id: "cloud-scheduler",
      name: "Cloud Scheduler",
      category: "orchestration",
      description: "Managed pub/sub cron dispatcher triggering automated guardian sweeps.",
      detailedRole: "Triggers the entire Planner-Executor-Critic loop. Executes automated cron sweeps (e.g., every 60 minutes) to recalculate slack budgets and proactively defend deadlines.",
      pipelineRole: "Critic",
      status: "STANDBY",
      icon: Clock,
      flowDirection: "Pings Cloud Run at scheduled interval offsets",
      techTag: "CRON_SCHED_01",
      service: "Cloud Scheduler Pub/Sub Cron Trigger",
      latency: "< 1ms trigger offset",
      throughput: "100% execution accuracy",
      cost: "$0.10 / job per month",
      uptime: "99.9%",
      security: {
        iamRole: "roles/cloudscheduler.serviceAgent",
        encryption: "OIDC Auth Token",
        authScope: "Cloud Scheduler Runner"
      },
      cliCommand: "gcloud scheduler jobs list"
    }
  ];

  const categoryLabels = {
    compute: "AI & Serverless Compute",
    database: "NoSQL Database",
    identity: "Security & Credentials",
    tools: "External Workspace API Tools",
    orchestration: "Managed Cron Automation"
  };

  // Pools of rotating logs for each node to simulate active streaming
  const mockLogPools: Record<string, string[]> = {
    "vertex-ai": [
      "Initializing Vertex AI reasoning loop...",
      "Model: gemini-2.5-pro loaded. Temperature set to 0.15.",
      "Analyzing active task sheets context from Google Workspace...",
      "Evaluating academic commitments against slack budget matrix.",
      "Task 'Physics Lab Report' has negative slack. Formulating strategy.",
      "Decomposing task 'Lab Report' -> 3 subtasks generated.",
      "Validating output against safety guidelines... COMPLIANT.",
      "Calculated completion cost: $0.0034. Prompt response streamed."
    ],
    "cloud-run": [
      "Warm startup completed. Listening on PORT 8080.",
      "Incoming web-trigger received from Cloud Scheduler (CRON_SCHED_01).",
      "Authenticating incoming request header bearer token... VALID.",
      "Dispatched core scheduling run to Vertex AI engine.",
      "Client OAuth session validated. Token refreshes in 12 min.",
      "Writing live telemetry states to Cloud Firestore DB.",
      "Command response returned: 200 OK (execution took 1.42 seconds)."
    ],
    "cloud-firestore": [
      "NoSQL driver connected to Cloud Firestore (default).",
      "Real-time snapshot listener attached to '/tasks'.",
      "Write operation: updating execution trace 'sweep_trace_982'...",
      "Snapshot written in 12ms. Size: 3.42 KB.",
      "Executing composite index query for active user priorities.",
      "Read operation: loaded 12 task sheets. Cache status: HIT.",
      "Snapshot synced to React client state."
    ],
    "firebase-auth": [
      "Validating incoming auth session headers...",
      "OIDC public key signature checked. Authenticated user successfully.",
      "Delegated OAuth credentials fetched for user 'student@vibe2ship.edu'.",
      "Dynamic token bundle generated. Encrypted with AES-256.",
      "Auth session state: ACTIVE. Expiry: in 48 minutes.",
      "Google API Scopes verified: [calendar.events, gmail.compose]."
    ],
    "google-calendar": [
      "Establishing link with Google Calendar REST endpoint...",
      "Verifying focus slot availability in user primary calendar.",
      "Conflict check: No existing event overlap found for 14:00-16:00.",
      "Scheduling event: 'Clutch Focus - Study Block'...",
      "Focus calendar block written successfully. ID: cal_ev_991823.",
      "Cal Sync completed. Recalculated daily focus percentage: 35.5%."
    ],
    "gmail-api": [
      "Connecting to Gmail REST API client...",
      "Warning: Deadline deficit detected (-1.5 hrs slack). Needs backup draft.",
      "Composing polite extension request email template for 'CS-440'...",
      "Context loaded: Student completed 70% of prep work. Tone: Professional.",
      "Writing draft draft correspondence to 'prof.smith@vibe2ship.edu'...",
      "Draft staged successfully in user's drafts. Draft ID: gmail_dr_2218."
    ],
    "cloud-scheduler": [
      "Evaluating cron config '*/60 * * * *'...",
      "Scheduler active. Next trigger scheduled: today at xx:00.",
      "Cron trigger fired. Off-schedule buffer: 0.2ms.",
      "Dispatching HTTPS POST to Cloud Run endpoint...",
      "Pub/Sub message broadcast to target: run.clutch.internal.",
      "Ping response acknowledged: 200 OK (14ms response delay)."
    ]
  };

  // Simulating active console logs typing stream
  useEffect(() => {
    // Seed initial logs for all services
    const initialLogs: Record<string, string[]> = {};
    nodes.forEach(node => {
      initialLogs[node.id] = mockLogPools[node.id].slice(0, 4);
    });
    setLiveLogs(initialLogs);

    // Periodically append a new random log to each service
    const interval = setInterval(() => {
      setLiveLogs(prev => {
        const nextLogs = { ...prev };
        nodes.forEach(node => {
          const pool = mockLogPools[node.id];
          const currentLogs = prev[node.id] || [];
          const randomLine = pool[Math.floor(Math.random() * pool.length)];
          
          // Keep log size around 15 lines max to avoid memory bloating
          const updated = [...currentLogs, `[${new Date().toLocaleTimeString()}] ${randomLine}`];
          if (updated.length > 15) updated.shift();
          
          nextLogs[node.id] = updated;
        });
        return nextLogs;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll console terminal to bottom on change
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [liveLogs, selectedNode, inspectorTab]);

  const selectedNodeData = nodes.find(n => n.id === selectedNode) || nodes[0];

  // Map absolute positions based on view mode (morphic layout transitions)
  const getCardLeft = (id: string) => {
    if (viewMode === "blueprint") {
      switch (id) {
        case "cloud-scheduler":
        case "firebase-auth":
          return "4%";
        case "vertex-ai":
        case "cloud-run":
          return "37%";
        case "cloud-firestore":
        case "google-calendar":
        case "gmail-api":
          return "70%";
        default:
          return "0%";
      }
    } else {
      // Radial Circle layout around Cloud Run
      switch (id) {
        case "cloud-run": return "37%"; // Center
        case "vertex-ai": return "37%"; // Top orbit
        case "cloud-firestore": return "68%"; // Top-right
        case "google-calendar": return "68%"; // Bottom-right
        case "gmail-api": return "37%"; // Bottom orbit
        case "firebase-auth": return "6%"; // Bottom-left
        case "cloud-scheduler": return "6%"; // Top-left
        default: return "0%";
      }
    }
  };

  const getCardTop = (id: string) => {
    if (viewMode === "blueprint") {
      switch (id) {
        case "vertex-ai": return "8%";
        case "cloud-scheduler": return "18%";
        case "cloud-run": return "38%";
        case "firebase-auth": return "58%";
        case "cloud-firestore": return "12%";
        case "google-calendar": return "45%";
        case "gmail-api": return "72%";
        default: return "0%";
      }
    } else {
      // Radial Circle layout around Cloud Run
      switch (id) {
        case "cloud-run": return "38%"; // Center
        case "vertex-ai": return "8%"; // Top orbit
        case "cloud-firestore": return "15%"; // Top-right
        case "google-calendar": return "56%"; // Bottom-right
        case "gmail-api": return "68%"; // Bottom orbit
        case "firebase-auth": return "56%"; // Bottom-left
        case "cloud-scheduler": return "15%"; // Top-left
        default: return "0%";
      }
    }
  };

  const getCardHeight = (id: string) => {
    if (viewMode === "blueprint" && id === "cloud-run") return "20%";
    return "18%";
  };

  const isPathActive = (nodeIds: string[]) => {
    return nodeIds.includes(selectedNode) || (hoveredNode !== null && nodeIds.includes(hoveredNode));
  };

  const getStatusLedClass = (status: string) => {
    switch (status) {
      case "ACTIVE":
      case "CONNECTED":
      case "SECURE":
        return "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] dark:shadow-[0_0_12px_rgba(16,185,129,0.9)] animate-pulse-glow";
      case "STANDBY":
        return "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]";
      default:
        return "bg-slate-400";
    }
  };

  // Run diagnostics sequence
  const startDiagnostics = () => {
    setDiagnosticsState("running");
    setDiagnosticsProgress(0);
    setDiagnosticsLogs([
      "gcloud diagnosis run --service=" + selectedNodeData.techTag,
      "[SYSTEM] Loading credentials check on dynamic service agent bindings...",
      "[IAM_PROBE] Querying IAM policy bindings..."
    ]);

    const runLogs = [
      "[IAM_PROBE] IAM Binding Match: OK (" + selectedNodeData.security.iamRole + ")",
      "[NETWORK] Initiating secure ping to target GCP cluster IP...",
      "[NETWORK] Latency return: " + selectedNodeData.latency + " (RTT inside US-CENTRAL1 region)",
      "[TLS_PROBE] Handshake initiated with " + selectedNodeData.service + " host server...",
      "[TLS_PROBE] Handshake: TLS 1.3 | Curve25519 | Server validation complete.",
      "[CRED_PROBE] Validating dynamic user OAuth key authority scopes...",
      "[CRED_PROBE] Scopes active: " + (selectedNodeData.security.authScope || "No scopes needed"),
      "[SYSTEM] Gathering node health logs from Cloud Logging...",
      "[SYSTEM] Service response rate: " + selectedNodeData.throughput + " | Uptime: " + selectedNodeData.uptime,
      "[DIAGNOSTICS] COMPLETE. Analyzing overall service integrity score..."
    ];

    let count = 0;
    const logInterval = setInterval(() => {
      if (count < runLogs.length) {
        setDiagnosticsLogs(prev => [...prev, runLogs[count]]);
        setDiagnosticsProgress(Math.floor(((count + 1) / runLogs.length) * 100));
        count++;
      } else {
        clearInterval(logInterval);
        setDiagnosticsState("success");
      }
    }, 400);
  };

  const resetCanvas = () => {
    setZoom(1.0);
    setPanOffset({ x: 0, y: 0 });
  };

  // Zoom Math limits
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.8));

  // Canvas Mouse Drag logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left-click drag
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="bg-slate-50/75 dark:bg-slate-950/70 min-h-screen text-slate-800 dark:text-slate-100 font-sans p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-2xl max-w-6xl mx-auto backdrop-blur-3xl relative overflow-hidden">
      
      {/* Dynamic breathing custom animations */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; filter: drop-shadow(0 0 4px currentColor); }
          50% { opacity: 1; filter: drop-shadow(0 0 10px currentColor); }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .custom-terminal-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
        }
        .custom-terminal-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .custom-terminal-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 9999px;
        }
        .custom-blueprint-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(99, 102, 241, 0.2) transparent;
        }
        .custom-blueprint-scroll::-webkit-scrollbar {
          height: 5px;
        }
        .custom-blueprint-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-blueprint-scroll::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.15);
          border-radius: 9999px;
        }
        .custom-blueprint-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.3);
        }
      `}</style>

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4 sm:p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center space-x-4 z-10">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/30 shadow-inner">
            <Layers className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">Google Technology Map</h1>
              <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                V3.5 Live
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium flex flex-wrap items-center gap-1.5">
              <span>High-fidelity schema tracing the integration of GCP APIs in the</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">Planner</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">Executor</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">Critic</span>
              <span>runtime.</span>
            </div>
          </div>
        </div>
        
        {/* Toggle Controls for Layout modes */}
        <div className="flex items-center gap-3 z-10">
          <div className="bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 flex">
            <button
              onClick={() => setViewMode("blueprint")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center space-x-1 ${
                viewMode === "blueprint"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Blueprint Layout</span>
            </button>
            <button
              onClick={() => setViewMode("topology")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center space-x-1 ${
                viewMode === "topology"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Hub Topology</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 px-3.5 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-900/30 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 animate-pulse-glow" />
            <span>STAGE 3 COMPLIANT ARCHITECTURE</span>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="space-y-8 mt-8">
        
        {/* Interactive SVG Map Panel - Full Width on Top */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-4 sm:p-6 md:p-8 shadow-lg flex flex-col justify-between relative overflow-hidden group">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 z-10">
            <div className="space-y-1">
              <h2 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 font-mono uppercase tracking-widest flex items-center space-x-1.5">
                <span>Active Core Infrastructure Canvas</span>
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">Click on nodes to inspect live telemetries, logs, and run diagnostics.</p>
            </div>
            
            <div className="flex items-center space-x-2 self-start sm:self-auto">
              <button
                onClick={() => setShowTraffic(prev => !prev)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border flex items-center space-x-1 transition-all ${
                  showTraffic 
                    ? "bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700"
                }`}
              >
                <Flame className="w-3 h-3" />
                <span>{showTraffic ? "Traffic: ON" : "Traffic: OFF"}</span>
              </button>

              <div className="flex items-center space-x-1.5 text-[9px] font-mono text-slate-400 dark:text-slate-500 font-bold bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 px-2.5 py-1 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-glow" />
                <span>BUS ACTIVE</span>
              </div>
            </div>
          </div>
          
          {/* Mobile swipe indicator banner */}
          <div className="block lg:hidden mb-3">
            <div className="flex items-center space-x-2 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 rounded-xl p-2.5 text-[10px] sm:text-xs text-indigo-700 dark:text-indigo-400">
              <Info className="w-3.5 h-3.5 shrink-0 animate-pulse" />
              <span>Swipe or pan horizontally on the canvas below to explore the architecture map.</span>
            </div>
          </div>
          
          {/* 2-Column internal layout on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Column 1: Canvas scrollport (Takes 8 of 12 columns inside the wide card) */}
            <div className="lg:col-span-8 relative">
              {/* Interactive Canvas Container with Mobile Scroll Wrapper */}
              <div className="relative w-full overflow-x-auto custom-blueprint-scroll rounded-2xl border border-slate-200/40 dark:border-slate-800/40 bg-slate-50/20 dark:bg-slate-950/20">
            <div 
              className={`relative min-w-[780px] lg:min-w-0 lg:w-full aspect-[16/11] overflow-hidden cursor-${isDragging ? "grabbing" : "grab"}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
            {/* Soft grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_at_center,white_30%,transparent_90%)] pointer-events-none" />
            
            {/* Technical corner alignment markers */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-slate-300/40 dark:border-slate-700/40 pointer-events-none" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-slate-300/40 dark:border-slate-700/40 pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-slate-300/40 dark:border-slate-700/40 pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-slate-300/40 dark:border-slate-700/40 pointer-events-none" />
            
            {/* Coordinate annotations */}
            <div className="absolute top-1.5 left-4 text-[7px] font-mono text-slate-400 dark:text-slate-600 tracking-wider select-none uppercase pointer-events-none">
              LATENCY_BUS: US-CENTRAL1 // CLUTCH_CANVAS_V3.5
            </div>
            <div className="absolute top-1.5 right-4 text-[7px] font-mono text-slate-400 dark:text-slate-600 tracking-wider select-none uppercase pointer-events-none">
              SYSTEM_STATE: nominal
            </div>
            <div className="absolute bottom-1.5 left-4 text-[7px] font-mono text-slate-400 dark:text-slate-600 tracking-wider select-none uppercase pointer-events-none">
              SCALE: {zoom.toFixed(1)}x // OFFSET: [{panOffset.x}, {panOffset.y}]
            </div>
            <div className="absolute bottom-1.5 right-4 text-[7px] font-mono text-indigo-500/80 dark:text-indigo-400/80 tracking-wider select-none uppercase font-bold pointer-events-none">
              STITCH_PIPELINE_OK
            </div>

            {/* Scale/Pan transformation element wrapper */}
            <div 
              className="absolute inset-0 transition-transform duration-200 ease-out select-none"
              style={{
                transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
                transformOrigin: "center center"
              }}
            >
              {/* Dynamic SVG Connection Tracks overlay */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                {/* Connection lines rendering based on viewMode */}
                {viewMode === "blueprint" ? (
                  // Blueprint view flow connections
                  <>
                    {/* Track 1: Cloud Scheduler -> Cloud Run */}
                    <path 
                      d="M 17% 27% H 33.5% V 48% H 37%" 
                      stroke={isPathActive(["cloud-scheduler"]) ? "#f59e0b" : "rgba(148,163,184,0.12)"} 
                      strokeWidth={isPathActive(["cloud-scheduler"]) ? "2" : "1.5"} 
                      strokeDasharray={isPathActive(["cloud-scheduler"]) ? "none" : "3,3"}
                      fill="none"
                      className="transition-all duration-300"
                    />
                    {/* Track 2: Firebase Auth -> Cloud Run */}
                    <path 
                      d="M 17% 67% H 33.5% V 48% H 37%" 
                      stroke={isPathActive(["firebase-auth"]) ? "#0ea5e9" : "rgba(148,163,184,0.12)"} 
                      strokeWidth={isPathActive(["firebase-auth"]) ? "2" : "1.5"} 
                      strokeDasharray={isPathActive(["firebase-auth"]) ? "none" : "3,3"}
                      fill="none"
                      className="transition-all duration-300"
                    />
                    {/* Track 3: Cloud Run -> Vertex AI */}
                    <path 
                      d="M 50% 38% V 26%" 
                      stroke={isPathActive(["vertex-ai", "cloud-run"]) ? "#6366f1" : "rgba(148,163,184,0.12)"} 
                      strokeWidth={isPathActive(["vertex-ai", "cloud-run"]) ? "2" : "1.5"} 
                      fill="none"
                      className="transition-all duration-300"
                    />
                    {/* Track 4: Cloud Run -> Cloud Firestore */}
                    <path 
                      d="M 63% 48% H 66.5% V 21% H 70%" 
                      stroke={isPathActive(["cloud-firestore"]) ? "#10b981" : "rgba(148,163,184,0.12)"} 
                      strokeWidth={isPathActive(["cloud-firestore"]) ? "2" : "1.5"} 
                      strokeDasharray={isPathActive(["cloud-firestore"]) ? "none" : "3,3"}
                      fill="none"
                      className="transition-all duration-300"
                    />
                    {/* Track 5: Cloud Run -> Google Calendar */}
                    <path 
                      d="M 63% 48% H 66.5% V 54% H 70%" 
                      stroke={isPathActive(["google-calendar"]) ? "#f43f5e" : "rgba(148,163,184,0.12)"} 
                      strokeWidth={isPathActive(["google-calendar"]) ? "2" : "1.5"} 
                      strokeDasharray={isPathActive(["google-calendar"]) ? "none" : "3,3"}
                      fill="none"
                      className="transition-all duration-300"
                    />
                    {/* Track 6: Cloud Run -> Gmail API */}
                    <path 
                      d="M 63% 48% H 66.5% V 81% H 70%" 
                      stroke={isPathActive(["gmail-api"]) ? "#f43f5e" : "rgba(148,163,184,0.12)"} 
                      strokeWidth={isPathActive(["gmail-api"]) ? "2" : "1.5"} 
                      strokeDasharray={isPathActive(["gmail-api"]) ? "none" : "3,3"}
                      fill="none"
                      className="transition-all duration-300"
                    />
                  </>
                ) : (
                  // Topology radial view flow connections (all connected directly to center Cloud Run)
                  <>
                    <line x1="50%" y1="47%" x2="50%" y2="26%" stroke={isPathActive(["vertex-ai"]) ? "#6366f1" : "rgba(148,163,184,0.12)"} strokeWidth="1.5" />
                    <line x1="50%" y1="47%" x2="68%" y2="23%" stroke={isPathActive(["cloud-firestore"]) ? "#10b981" : "rgba(148,163,184,0.12)"} strokeWidth="1.5" />
                    <line x1="50%" y1="47%" x2="68%" y2="63%" stroke={isPathActive(["google-calendar"]) ? "#f43f5e" : "rgba(148,163,184,0.12)"} strokeWidth="1.5" />
                    <line x1="50%" y1="47%" x2="50%" y2="68%" stroke={isPathActive(["gmail-api"]) ? "#f43f5e" : "rgba(148,163,184,0.12)"} strokeWidth="1.5" />
                    <line x1="50%" y1="47%" x2="32%" y2="63%" stroke={isPathActive(["firebase-auth"]) ? "#0ea5e9" : "rgba(148,163,184,0.12)"} strokeWidth="1.5" />
                    <line x1="50%" y1="47%" x2="32%" y2="23%" stroke={isPathActive(["cloud-scheduler"]) ? "#f59e0b" : "rgba(148,163,184,0.12)"} strokeWidth="1.5" />
                  </>
                )}

                {/* Flow packets (energy streams) traversing connection lines */}
                {showTraffic && (
                  <>
                    {viewMode === "blueprint" ? (
                      <>
                        {/* Scheduler packet */}
                        <motion.circle r="3" fill="#f59e0b" animate={{ cx: ["17%", "33.5%", "33.5%", "37%"], cy: ["27%", "27%", "48%", "48%"] }} transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }} style={{ filter: "drop-shadow(0 0 3px #f59e0b)" }} />
                        {/* Auth packet */}
                        <motion.circle r="3" fill="#0ea5e9" animate={{ cx: ["17%", "33.5%", "33.5%", "37%"], cy: ["67%", "67%", "48%", "48%"] }} transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }} style={{ filter: "drop-shadow(0 0 3px #0ea5e9)" }} />
                        {/* Model response packet */}
                        <motion.circle r="3" fill="#6366f1" animate={{ cx: ["50%", "50%"], cy: ["38%", "26%"] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} style={{ filter: "drop-shadow(0 0 3px #6366f1)" }} />
                        {/* Database packet */}
                        <motion.circle r="3" fill="#10b981" animate={{ cx: ["63%", "66.5%", "66.5%", "70%"], cy: ["48%", "48%", "21%", "21%"] }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }} style={{ filter: "drop-shadow(0 0 3px #10b981)" }} />
                        {/* Calendar packet */}
                        <motion.circle r="3" fill="#f43f5e" animate={{ cx: ["63%", "66.5%", "66.5%", "70%"], cy: ["48%", "48%", "54%", "54%"] }} transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }} style={{ filter: "drop-shadow(0 0 3px #f43f5e)" }} />
                        {/* Gmail packet */}
                        <motion.circle r="3" fill="#f43f5e" animate={{ cx: ["63%", "66.5%", "66.5%", "70%"], cy: ["48%", "48%", "81%", "81%"] }} transition={{ duration: 2.6, repeat: Infinity, ease: "linear" }} style={{ filter: "drop-shadow(0 0 3px #f43f5e)" }} />
                      </>
                    ) : (
                      <>
                        {/* Radial topology packets */}
                        <motion.circle r="3.5" fill="#f59e0b" animate={{ cx: ["50%", "32%"], cy: ["47%", "23%"] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} style={{ filter: "drop-shadow(0 0 3px #f59e0b)" }} />
                        <motion.circle r="3.5" fill="#6366f1" animate={{ cx: ["50%", "50%"], cy: ["38%", "26%"] }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }} style={{ filter: "drop-shadow(0 0 3px #6366f1)" }} />
                        <motion.circle r="3.5" fill="#10b981" animate={{ cx: ["50%", "68%"], cy: ["47%", "23%"] }} transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }} style={{ filter: "drop-shadow(0 0 3px #10b981)" }} />
                        <motion.circle r="3.5" fill="#f43f5e" animate={{ cx: ["50%", "68%"], cy: ["47%", "63%"] }} transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }} style={{ filter: "drop-shadow(0 0 3px #f43f5e)" }} />
                        <motion.circle r="3.5" fill="#f43f5e" animate={{ cx: ["50%", "50%"], cy: ["56%", "68%"] }} transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }} style={{ filter: "drop-shadow(0 0 3px #f43f5e)" }} />
                        <motion.circle r="3.5" fill="#0ea5e9" animate={{ cx: ["50%", "32%"], cy: ["47%", "63%"] }} transition={{ duration: 1.7, repeat: Infinity, ease: "linear" }} style={{ filter: "drop-shadow(0 0 3px #0ea5e9)" }} />
                      </>
                    )}
                  </>
                )}

                {/* Node bus connection junctions */}
                <g className="opacity-80">
                  <circle cx="33.5%" cy="48%" r="4" className="fill-slate-100 dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-700 stroke-[1px]" />
                  <circle cx="33.5%" cy="48%" r="1.5" className="fill-slate-400 dark:fill-slate-500" />
                </g>
                <g className="opacity-80">
                  <circle cx="66.5%" cy="48%" r="4" className="fill-slate-100 dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-700 stroke-[1px]" />
                  <circle cx="66.5%" cy="48%" r="1.5" className="fill-slate-400 dark:fill-slate-500" />
                </g>
              </svg>

              {/* Node Cards on Canvas (Animate dynamically via Framer Motion layouts) */}
              {nodes.map((node) => {
                const isSelected = selectedNode === node.id;
                const isHovered = hoveredNode === node.id;
                const showBorderGlow = isSelected || isHovered;
                const theme = categoryThemes[node.category];
                const IconComponent = node.icon;
                
                return (
                  <motion.button
                    key={node.id}
                    onClick={() => setSelectedNode(node.id)}
                    onHoverStart={() => setHoveredNode(node.id)}
                    onHoverEnd={() => setHoveredNode(null)}
                    layoutId={`node-card-${node.id}`}
                    animate={{
                      left: getCardLeft(node.id),
                      top: getCardTop(node.id),
                      width: "26%",
                      height: getCardHeight(node.id)
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 90,
                      damping: 18,
                      mass: 0.8
                    }}
                    className={`absolute flex flex-col justify-between px-3 md:px-4 py-3 rounded-xl border text-left transition-all duration-300 cursor-pointer whitespace-normal z-10 ${
                      isSelected
                        ? `${theme.bg} ${theme.border} ${theme.glow} backdrop-blur-md`
                        : "bg-white/80 dark:bg-slate-900/80 border-slate-200/60 dark:border-slate-800/80 hover:border-slate-300/90 dark:hover:border-slate-700/90 hover:bg-white dark:hover:bg-slate-900 shadow-sm backdrop-blur-sm"
                    }`}
                  >
                    {/* Precise technical corner alignment brackets on active/selected card */}
                    {showBorderGlow && (
                      <>
                        <div className={`absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 ${theme.cornerBorder} rounded-tl-[3px]`} />
                        <div className={`absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 ${theme.cornerBorder} rounded-tr-[3px]`} />
                        <div className={`absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 ${theme.cornerBorder} rounded-bl-[3px]`} />
                        <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 ${theme.cornerBorder} rounded-br-[3px]`} />
                      </>
                    )}

                    {/* Recessed Connection Ports with glowing LEDs */}
                    {viewMode === "blueprint" && (
                      <>
                        {node.id === "cloud-scheduler" && <CardPort position="right" isActive={isPathActive(["cloud-scheduler"])} category={node.category} />}
                        {node.id === "firebase-auth" && <CardPort position="right" isActive={isPathActive(["firebase-auth"])} category={node.category} />}
                        {node.id === "vertex-ai" && <CardPort position="bottom" isActive={isPathActive(["vertex-ai", "cloud-run"])} category={node.category} />}
                        {node.id === "cloud-run" && (
                          <>
                            <CardPort position="left" isActive={isPathActive(["cloud-scheduler"]) || isPathActive(["firebase-auth"])} category={node.category} />
                            <CardPort position="top" isActive={isPathActive(["vertex-ai", "cloud-run"])} category={node.category} />
                            <CardPort position="right" isActive={isPathActive(["cloud-firestore"]) || isPathActive(["google-calendar"]) || isPathActive(["gmail-api"])} category={node.category} />
                          </>
                        )}
                        {node.id === "cloud-firestore" && <CardPort position="left" isActive={isPathActive(["cloud-firestore"])} category={node.category} />}
                        {node.id === "google-calendar" && <CardPort position="left" isActive={isPathActive(["google-calendar"])} category={node.category} />}
                        {node.id === "gmail-api" && <CardPort position="left" isActive={isPathActive(["gmail-api"])} category={node.category} />}
                      </>
                    )}

                    {/* Card Header metadata */}
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-[7.5px] sm:text-[8px] md:text-[8.5px] font-mono font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                        {node.techTag}
                      </span>
                      <div className="flex items-center space-x-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusLedClass(node.status)}`} />
                        <span className="text-[7px] sm:text-[7.5px] md:text-[8px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase select-none">
                          {node.status}
                        </span>
                      </div>
                    </div>

                    {/* Icon and refined typography */}
                    <div className="flex items-center space-x-2 sm:space-x-3 mt-auto w-full">
                      <div className={`p-1.5 sm:p-2 rounded-lg border transition-colors duration-200 shrink-0 ${
                        isSelected || isHovered
                          ? theme.iconBgActive
                          : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500"
                      }`}>
                        <IconComponent className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] sm:text-[11px] md:text-[12px] font-bold text-slate-900 dark:text-slate-50 leading-snug tracking-tight truncate">
                          {node.name}
                        </div>
                        <div className={`text-[7px] sm:text-[7.5px] md:text-[8px] font-mono font-extrabold tracking-wider leading-none mt-1 uppercase truncate ${theme.text}`}>
                          {node.pipelineRole}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Float Canvas Controllers Overlay (Placed outside the scrolling canvas but inside the scrollable wrapper) */}
          <div className="absolute bottom-3 right-3 bg-white/95 dark:bg-slate-900/95 border border-slate-200/60 dark:border-slate-800/80 rounded-xl p-1 shadow-md flex space-x-1 z-20 backdrop-blur-md">
            <button 
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button 
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button 
              onClick={resetCanvas}
              title="Reset Workspace"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

              </div> {/* Closes scroll wrapper */}
            </div> {/* Closes Column 1 */}

            {/* Column 2: Architecture Legend & Secure SSL Indicators (Takes 4 of 12 columns inside wide card) */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
              
              {/* Interactive Legend block */}
              <div className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-800/60 rounded-2xl p-4 flex-1 flex flex-col justify-center">
                <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 block">Architecture Legend</span>
                <div className="space-y-2.5 text-[10px] font-mono text-slate-400 dark:text-slate-500">
                  <div className="flex items-center space-x-2 bg-white dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800/80">
                    <span className="w-2.5 h-2.5 rounded shrink-0 bg-indigo-500 dark:bg-indigo-400" />
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Compute / Reasoning</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800/80">
                    <span className="w-2.5 h-2.5 rounded shrink-0 bg-emerald-500 dark:bg-emerald-400" />
                    <span className="font-semibold text-slate-600 dark:text-slate-400">NoSQL Firestore</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800/80">
                    <span className="w-2.5 h-2.5 rounded shrink-0 bg-sky-500 dark:bg-sky-400" />
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Security & Credentials</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800/80">
                    <span className="w-2.5 h-2.5 rounded shrink-0 bg-rose-500 dark:bg-rose-400" />
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Workspace API Tools</span>
                  </div>
                </div>
                <div className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-4 text-center border-t border-slate-200/30 dark:border-slate-800/40 pt-2">
                  Hold Left-Click to pan canvas
                </div>
              </div>

              {/* SSL Assurance banner */}
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-800 p-4 rounded-2xl flex flex-col justify-between space-y-2">
                <div className="flex items-start space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="leading-snug">All requests protected via Vercel Edge Firewall & Cloud IAM OAuth 2.0</span>
                </div>
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/30 dark:border-slate-800/40 text-[8px] font-bold text-slate-400 dark:text-slate-500">
                  <span className="uppercase tracking-wider">Security Layer</span>
                  <span className="font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 px-2.5 py-0.5 rounded font-bold uppercase">SSL 256-BIT</span>
                </div>
              </div>

            </div>

          </div> {/* Closes internal grid */}
        </div> {/* Closes SVG Canvas Card */}

        {/* Row 2: Remaining two cards arranged in 2 equal columns on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Deep-Dive GCP Information & Flow Integration Details (Takes 6 of 12 columns) */}
          <div className="lg:col-span-6 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedNodeData.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
              className="bg-white dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-4 sm:p-6 md:p-8 shadow-lg space-y-5"
            >
              {/* Header inside Detail Drawer */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3.5">
                  <div className={`w-11 h-10 rounded-xl flex items-center justify-center border shadow-inner transition-colors duration-200 ${categoryThemes[selectedNodeData.category].iconBgActive}`}>
                    <selectedNodeData.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-950 dark:text-slate-50 tracking-tight leading-tight">{selectedNodeData.name}</h2>
                    <span className="text-[8px] font-mono font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded border border-slate-200/50 dark:border-slate-700/50 uppercase tracking-widest mt-1.5 inline-block">
                      {categoryLabels[selectedNodeData.category]}
                    </span>
                  </div>
                </div>

                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border select-none ${
                  selectedNodeData.status === "ACTIVE" || selectedNodeData.status === "CONNECTED" || selectedNodeData.status === "SECURE"
                    ? "bg-emerald-50/50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                    : "bg-amber-50/50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                }`}>
                  {selectedNodeData.status}
                </span>
              </div>

              {/* Diagnostics Overlay or Normal Inspector content */}
              {diagnosticsState !== "idle" ? (
                // Diagnostics Run Mode Panel
                <div className="bg-slate-950 text-slate-300 font-mono rounded-2xl p-4 space-y-4 border border-slate-800 shadow-inner">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-[10px] text-indigo-400 font-bold flex items-center space-x-1.5">
                      <RefreshCw className={`w-3.5 h-3.5 ${diagnosticsState === "running" ? "animate-spin" : ""}`} />
                      <span>Diagnostics: {selectedNodeData.techTag}</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold">{diagnosticsProgress}%</span>
                  </div>

                  <div className="h-44 overflow-y-auto space-y-1.5 text-[10px] text-slate-400 custom-terminal-scroll leading-relaxed pr-1">
                    {diagnosticsLogs.map((log, index) => (
                      <div 
                        key={index} 
                        className={
                          log.startsWith("gcloud") 
                            ? "text-slate-500 font-bold" 
                            : log.includes("integrity") || log.includes("COMPLETE")
                            ? "text-indigo-400 font-bold"
                            : log.includes("OK") || log.includes("successful")
                            ? "text-emerald-500 font-bold"
                            : "text-slate-400"
                        }
                      >
                        {log}
                      </div>
                    ))}
                    <div ref={consoleEndRef} />
                  </div>

                  {/* Progress / Result controls */}
                  <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      {diagnosticsState === "running" ? (
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <motion.div 
                            className="bg-indigo-500 h-full rounded-full"
                            animate={{ width: `${diagnosticsProgress}%` }}
                            transition={{ duration: 0.2 }}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1.5 text-[10px] text-emerald-400 font-bold uppercase">
                          <Check className="w-4 h-4 bg-emerald-500/10 p-0.5 rounded-full" />
                          <span>ALL HEALTH TESTS PASSED (100% OK)</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setDiagnosticsState("idle")}
                      className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-[10px] cursor-pointer"
                    >
                      Close Check
                    </button>
                  </div>
                </div>
              ) : (
                // Traditional Inspector Content with premium sub-tabs
                <>
                  {/* Tab Selector Inside Inspector */}
                  <div className="border-b border-slate-100 dark:border-slate-800 flex space-x-3 sm:space-x-4 text-xs font-bold text-slate-400 dark:text-slate-500">
                    <button
                      onClick={() => setInspectorTab("telemetry")}
                      className={`pb-2 transition-all relative cursor-pointer flex items-center space-x-1.5 ${
                        inspectorTab === "telemetry" 
                          ? "text-indigo-600 dark:text-indigo-400" 
                          : "hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                    >
                      <Activity className="w-3.5 h-3.5 shrink-0" />
                      <span>Telemetry</span>
                      {inspectorTab === "telemetry" && (
                        <motion.div layoutId="inspector-active-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
                      )}
                    </button>
                    <button
                      onClick={() => setInspectorTab("security")}
                      className={`pb-2 transition-all relative cursor-pointer flex items-center space-x-1.5 ${
                        inspectorTab === "security" 
                          ? "text-indigo-600 dark:text-indigo-400" 
                          : "hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5 shrink-0" />
                      <span className="hidden sm:inline">Security & IAM</span>
                      <span className="sm:hidden">Security</span>
                      {inspectorTab === "security" && (
                        <motion.div layoutId="inspector-active-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
                      )}
                    </button>
                    <button
                      onClick={() => setInspectorTab("console")}
                      className={`pb-2 transition-all relative cursor-pointer flex items-center space-x-1.5 ${
                        inspectorTab === "console" 
                          ? "text-indigo-600 dark:text-indigo-400" 
                          : "hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                    >
                      <Terminal className="w-3.5 h-3.5 shrink-0" />
                      <span className="hidden sm:inline">Active Console Logs</span>
                      <span className="sm:hidden">Logs</span>
                      {inspectorTab === "console" && (
                        <motion.div layoutId="inspector-active-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
                      )}
                    </button>
                  </div>

                  {/* Sub-tab Rendering */}
                  {inspectorTab === "telemetry" && (
                    <div className="space-y-4 animate-fade-in">
                      {/* Description Panel */}
                      <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-4">
                        <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 font-mono uppercase tracking-widest block">GCP Service Descriptor</span>
                        <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-50 mt-1 block">{selectedNodeData.service}</span>
                        <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium mt-1.5">
                          {selectedNodeData.description}
                        </p>
                      </div>

                      {/* Quotas & Costs metrics */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/80 rounded-xl p-3 flex flex-col justify-between">
                          <span className="text-[8px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active Cost Tier</span>
                          <div className="flex items-center space-x-1 mt-1">
                            <DollarSign className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-50 font-mono break-all">{selectedNodeData.cost}</span>
                          </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/80 rounded-xl p-3 flex flex-col justify-between">
                          <span className="text-[8px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Target Uptime</span>
                          <div className="flex items-center space-x-1 mt-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-50 font-mono break-all">{selectedNodeData.uptime}</span>
                          </div>
                        </div>
                      </div>

                      {/* Telemetry and sparklines */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 font-mono uppercase tracking-widest block">Network Telemetry Metrics</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/80 rounded-xl p-3 flex flex-col justify-between relative min-h-[64px]">
                            <span className="text-[8px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Latency</span>
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-50 mt-1 font-mono break-all pr-12">{selectedNodeData.latency}</span>
                            {/* Simple beautiful SVG sparkline */}
                            <svg className="absolute bottom-1 right-2 w-12 h-6 text-indigo-500/30 dark:text-indigo-400/20" viewBox="0 0 40 20">
                              <path d="M0,15 L10,12 L20,18 L30,5 L40,8" fill="none" stroke="currentColor" strokeWidth="1.5" />
                            </svg>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/80 rounded-xl p-3 flex flex-col justify-between relative min-h-[64px]">
                            <span className="text-[8px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Throughput</span>
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-50 mt-1 font-mono break-all pr-12">{selectedNodeData.throughput}</span>
                            <svg className="absolute bottom-1 right-2 w-12 h-6 text-emerald-500/30 dark:text-emerald-400/20" viewBox="0 0 40 20">
                              <path d="M0,8 L10,14 L20,5 L30,12 L40,3" fill="none" stroke="currentColor" strokeWidth="1.5" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {inspectorTab === "security" && (
                    <div className="space-y-4 animate-fade-in">
                      {/* Security detailed Matrix */}
                      <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden">
                        <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] font-medium font-mono">
                          <span className="text-slate-500 dark:text-slate-400">IAM Authority Role</span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200 uppercase text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded self-start sm:self-auto break-all">{selectedNodeData.security.iamRole}</span>
                        </div>
                        <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] font-medium font-mono">
                          <span className="text-slate-500 dark:text-slate-400">Encryption Layer</span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200 uppercase text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded self-start sm:self-auto break-all">{selectedNodeData.security.encryption}</span>
                        </div>
                        <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] font-medium font-mono">
                          <span className="text-slate-500 dark:text-slate-400">Authority Scope</span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200 uppercase text-[9px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded self-start sm:self-auto break-all max-w-full sm:max-w-[200px] truncate" title={selectedNodeData.security.authScope}>
                            {selectedNodeData.security.authScope || "No scopes needed"}
                          </span>
                        </div>
                      </div>

                      {/* Dynamic OAuth disclaimer alert */}
                      <div className="p-3 rounded-xl border border-sky-100 dark:border-sky-900/30 bg-sky-50/50 dark:bg-sky-950/10 text-sky-700 dark:text-sky-400 flex items-start space-x-2 text-[10.5px]">
                        <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span className="leading-relaxed font-medium">
                          Token authority is governed dynamically via Firebase OAuth secure delegation keys. User passwords and personal calendar scopes are fully isolated and never stored inside databases.
                        </span>
                      </div>
                    </div>
                  )}

                  {inspectorTab === "console" && (
                    <div className="space-y-4 animate-fade-in">
                      {/* Active Live Logs Terminal Simulator */}
                      <div className="bg-slate-950 text-slate-300 font-mono rounded-2xl p-4 border border-slate-900 shadow-inner">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                          <span className="text-[10px] text-emerald-400 font-bold flex items-center space-x-1.5">
                            <Terminal className="w-3.5 h-3.5" />
                            <span>Active log stream: {selectedNodeData.techTag}</span>
                          </span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-glow" />
                        </div>

                        <div className="h-44 overflow-y-auto space-y-1.5 text-[10px] text-slate-400 custom-terminal-scroll leading-relaxed">
                          {(liveLogs[selectedNodeData.id] || []).map((log, index) => (
                            <div key={index} className="truncate">
                              {log}
                            </div>
                          ))}
                          <div ref={consoleEndRef} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* GCP gcloud CLI helper snippet block */}
                  <div className="space-y-1.5">
                    <span className="text-[8px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">GCP CLI Diagnostics Check Shortcut</span>
                    <div className="bg-slate-900 dark:bg-slate-950 text-slate-400 font-mono p-3 rounded-xl border border-slate-850 dark:border-slate-900 flex items-center justify-between text-[10px]">
                      <span className="truncate mr-3 text-slate-300 select-all">{selectedNodeData.cliCommand}</span>
                      <Terminal className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    </div>
                  </div>

                  {/* Pipeline diagnostics test launcher button */}
                  <button
                    onClick={startDiagnostics}
                    className="w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center space-x-2 border cursor-pointer border-slate-200 hover:border-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Initiate diagnostics<span className="hidden sm:inline"> on {selectedNodeData.techTag}</span></span>
                  </button>
                </>
              )}

            </motion.div>
          </AnimatePresence>

        </div>

        {/* Right Column: Pipeline Steps Breakdown Card (Takes 6 of 12 columns) */}
        <div className="lg:col-span-6">
          {/* Pipeline Steps Breakdown Card */}
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-4 sm:p-6 md:p-8 shadow-lg space-y-4">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-50 uppercase tracking-wider font-mono">
                Pipeline Integration breakdown
              </h3>
            </div>

            <div className="space-y-3">
              {/* Section 1: Planner */}
              <button
                onClick={() => setSelectedNode("vertex-ai")}
                className={`w-full text-left p-3 rounded-xl border transition-all duration-300 cursor-pointer block ${
                  selectedNodeData.pipelineRole === "Planner"
                    ? "bg-indigo-50/40 dark:bg-indigo-950/10 border-indigo-500/20 dark:border-indigo-500/40 shadow-sm"
                    : "bg-transparent border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center font-mono text-[9px] font-extrabold shrink-0 border transition-colors duration-200 ${
                    selectedNodeData.pipelineRole === "Planner"
                      ? "bg-indigo-500/10 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-500/30"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200/60 dark:border-slate-800"
                  }`}>1</div>
                  <div className="w-full">
                    <div className="flex items-center justify-between w-full">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase font-mono text-[10px]">PLANNER (Vertex AI Gemini 2.5)</h4>
                      {selectedNodeData.pipelineRole === "Planner" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse-glow" />
                      )}
                    </div>
                    <p className="text-[10.5px] text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed font-medium">
                      Evaluates commitments, reasons over high-risk slack deficits, and decomposes task milestones into precise subtasks.
                    </p>
                  </div>
                </div>
              </button>

              {/* Section 2: Executor */}
              <button
                onClick={() => setSelectedNode("cloud-run")}
                className={`w-full text-left p-3 rounded-xl border transition-all duration-300 cursor-pointer block ${
                  selectedNodeData.pipelineRole === "Executor"
                    ? "bg-indigo-50/40 dark:bg-indigo-950/10 border-indigo-500/20 dark:border-indigo-500/40 shadow-sm"
                    : "bg-transparent border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center font-mono text-[9px] font-extrabold shrink-0 border transition-colors duration-200 ${
                    selectedNodeData.pipelineRole === "Executor"
                      ? "bg-indigo-500/10 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-500/30"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200/60 dark:border-slate-800"
                  }`}>2</div>
                  <div className="w-full">
                    <div className="flex items-center justify-between w-full">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase font-mono text-[10px]">EXECUTOR (Cloud Run & Google API Tools)</h4>
                      {selectedNodeData.pipelineRole === "Executor" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse-glow" />
                      )}
                    </div>
                    <p className="text-[10.5px] text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed font-medium">
                      Executes task decompositions, proposal integrations, locks calendar focus blocks, and stages Gmail follow-up drafts.
                    </p>
                  </div>
                </div>
              </button>

              {/* Section 3: Critic / Security / Shared State */}
              <button
                onClick={() => setSelectedNode("cloud-scheduler")}
                className={`w-full text-left p-3 rounded-xl border transition-all duration-300 cursor-pointer block ${
                  selectedNodeData.pipelineRole === "Critic" || selectedNodeData.pipelineRole === "Shared State" || selectedNodeData.pipelineRole === "Security"
                    ? "bg-indigo-50/40 dark:bg-indigo-950/10 border-indigo-500/20 dark:border-indigo-500/40 shadow-sm"
                    : "bg-transparent border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center font-mono text-[9px] font-extrabold shrink-0 border transition-colors duration-200 ${
                    selectedNodeData.pipelineRole === "Critic" || selectedNodeData.pipelineRole === "Shared State" || selectedNodeData.pipelineRole === "Security"
                      ? "bg-indigo-500/10 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-500/30"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200/60 dark:border-slate-800"
                  }`}>3</div>
                  <div className="w-full">
                    <div className="flex items-center justify-between w-full">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase font-mono text-[10px]">CRITIC (State Validation)</h4>
                      {(selectedNodeData.pipelineRole === "Critic" || selectedNodeData.pipelineRole === "Shared State" || selectedNodeData.pipelineRole === "Security") && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse-glow" />
                      )}
                    </div>
                    <p className="text-[10.5px] text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed font-medium">
                      Checks focus blocks for duplicate event clashes, validates email context, and writes out the Morning Briefing summary.
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
    </div>
  );
}
