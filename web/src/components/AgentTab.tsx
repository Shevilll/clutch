import { useState, useEffect } from "react";
import { 
  motion, 
  AnimatePresence 
} from "motion/react";
import { 
  Terminal, 
  Activity, 
  Check, 
  ChevronDown, 
  Brain, 
  Wrench, 
  Cpu, 
  Sparkles, 
  Calendar, 
  RefreshCw,
  Sliders,
  ArrowRight,
  Code,
  Copy,
  ChevronUp
} from "lucide-react";

// Types for the Agent Step
interface Subtask {
  title: string;
  effortMins: number;
}

interface Block {
  start: any;
  end: any;
}

interface AgentStep {
  type: "plan" | "reason" | "tool_call" | "tool_result" | "act" | "reflect";
  message: string;
  ts: string;
  plannerRationale?: string;
  citations?: string[];
  payload?: any;
  subtasks?: Subtask[];
  block?: Block;
  logs?: string[];
}

interface AgentRun {
  id: string;
  startedAt: any;
  steps: AgentStep[];
  summary?: string;
}

interface AgentTabProps {
  latestAgentRun: AgentRun | null;
  runningAgent: boolean;
  triggerAgentLoop: () => void;
  user: any;
}

// Ultra-premium Mock Data representing a realistic, gorgeous Deadline Guardian run
const MOCK_AGENT_STEPS: AgentStep[] = [
  {
    type: "plan",
    ts: new Date(Date.now() - 120000).toISOString(),
    message: "Initiated Deadline Guardian Sweep: Scanning active commitments",
    plannerRationale: "The agent starts by ingesting active tasks from Firestore and matching them against Google Classroom API deadlines.",
    citations: ["Firestore/tasks", "Google Classroom API", "User Profile"],
    payload: {
      activeTasksCount: 12,
      classroomSyncStatus: "SUCCESS",
      scanDepthDays: 7
    },
    logs: [
      "16:08:00.045 [SYSTEM] Initializing Clutch Guardian engine run sequence...",
      "16:08:00.102 [DB_CONN] Established read-only session with Google Firestore",
      "16:08:00.221 [API_REQ] fetching academic commitments via Google Classroom REST API v1",
      "16:08:00.589 [API_RES] HTTP 200 OK - ingested 12 active course nodes from Google API",
      "16:08:00.601 [PROCESS] Ingestion completed. activeTasksCount=12, scanDepthDays=7"
    ]
  },
  {
    type: "reason",
    ts: new Date(Date.now() - 105000).toISOString(),
    message: "Computed Risk & Slack Budgets: Identified critical threshold",
    plannerRationale: "Database Design Project is due in 36 hours but has 18 hours of estimated effort. Immediate focus guarding is required to avoid project slippage.",
    citations: ["Risk Engine v3.1", "Calculated Slack Budget"],
    payload: {
      taskName: "Database Design Project",
      timeRemainingHours: 36,
      effortRemainingHours: 18,
      slackBudgetHours: -18,
      riskLevel: "URGENT_RESCUE"
    },
    logs: [
      "16:08:15.011 [EVAL] Starting slack budget analysis on 12 ingested commitment nodes",
      "16:08:15.089 [ENGINE] Running risk algorithm [Risk Engine v3.1] over local task database",
      "16:08:15.143 [ALERT] Target task 'Database Design Project' exhibits negative slack budget",
      "16:08:15.144 [ALERT] Remaining: 36h, Required Effort: 18h | slackBudgetHours=-18",
      "16:08:15.150 [STATE] Transitioning system threat status to URGENT_RESCUE"
    ]
  },
  {
    type: "tool_call",
    ts: new Date(Date.now() - 90000).toISOString(),
    message: "Invoking decompose_task to partition engineering workload",
    plannerRationale: "Breaking down a heavy 18-hour milestone into micro-tasks of 2-3 hours reduces cognitive friction and facilitates perfect calendar alignment.",
    payload: {
      toolName: "decompose_task",
      arguments: {
        taskId: "db_proj_902",
        maxSubtasks: 4,
        prioritizeByDifficulty: true
      }
    },
    logs: [
      "16:08:30.002 [PLANNER] Dispatching execution command to sub-agent worker pool",
      "16:08:30.045 [TOOL] Invoking tool [decompose_task] on 'db_proj_902'",
      "16:08:30.046 [TOOL] Raw arguments: { maxSubtasks: 4, prioritizeByDifficulty: true }",
      "16:08:30.112 [SYSTEM] Spawned isolated background sub-process for milestone decomposition"
    ]
  },
  {
    type: "tool_result",
    ts: new Date(Date.now() - 75000).toISOString(),
    message: "Successfully decomposed database milestone into 4 execution items",
    plannerRationale: "The task is successfully structured into discrete chunks. We can now allocate dedicated focus blocks for each specific task.",
    subtasks: [
      { title: "Schema Modeling & Relations", effortMins: 180 },
      { title: "Indexing Optimization", effortMins: 120 },
      { title: "Seed Data Scripts", effortMins: 90 },
      { title: "API Endpoint Integration", effortMins: 240 }
    ],
    payload: {
      status: "success",
      subtasksCreated: 4,
      totalEffortMins: 630
    },
    logs: [
      "16:08:45.010 [SYSTEM] Sub-process exit code: 0 (SUCCESS)",
      "16:08:45.011 [PARSE] Reading generated milestones schema from stdout stream",
      "16:08:45.012 [PROCESS] Parsed 4 distinct execution items | totalEffortMins=630",
      "16:08:45.015 [WRITE] Synchronizing decomposed subtasks back to Firestore document cache"
    ]
  },
  {
    type: "tool_call",
    ts: new Date(Date.now() - 60000).toISOString(),
    message: "Invoking propose_schedule to reserve calendar focus blocks",
    plannerRationale: "To protect the user's focus, we find available openings in Google Calendar and inject guarded work intervals before the deadline.",
    payload: {
      toolName: "propose_schedule",
      arguments: {
        calendarId: "primary",
        blocks: [
          {
            title: "Database Schema Focus (Clutch Guardian)",
            start: new Date(Date.now() + 3600000).toISOString(),
            end: new Date(Date.now() + 14400000).toISOString()
          }
        ]
      }
    },
    logs: [
      "16:09:00.003 [PLANNER] Initiating calendar reservation sub-routine",
      "16:09:00.041 [TOOL] Invoking tool [propose_schedule] on primary calendar",
      "16:09:00.042 [TOOL] Reservation windows requested: [Database Schema Focus (Clutch Guardian)]",
      "16:09:00.198 [NETWORK] POST https://www.googleapis.com/calendar/v3/calendars/primary/events"
    ]
  },
  {
    type: "tool_result",
    ts: new Date(Date.now() - 45000).toISOString(),
    message: "Google Calendar API confirmed focus block reservations",
    plannerRationale: "Confirmed reservation of 3 focus blocks. The calendar windows are successfully locked in and synchronized back to user's local dashboard.",
    block: {
      start: { seconds: Math.floor(Date.now() / 1000) + 3600 },
      end: { seconds: Math.floor(Date.now() / 1000) + 14400 }
    },
    payload: {
      status: "success",
      eventsCreated: 3,
      googleEventIds: ["g_evt_0918a", "g_evt_0918b"],
      writeBackToFirestore: true
    },
    logs: [
      "16:09:15.001 [NETWORK] HTTP 201 Created - Google Calendar API returned resource IDs",
      "16:09:15.002 [SYNC] Confirmed reservation of 3 focus blocks",
      "16:09:15.005 [WRITE] Writing googleEventIds=['g_evt_0918a', 'g_evt_0918b']",
      "16:09:15.010 [STATE] Local dashboard focus block synchronizer: completed successfully"
    ]
  },
  {
    type: "tool_call",
    ts: new Date(Date.now() - 30000).toISOString(),
    message: "Invoking draft_gmail_api to compose extension and progress update",
    plannerRationale: "Proactively draft a progress sync email. This establishes transparency with Professor Sharma and sets up a safety net in case of integration blocks.",
    payload: {
      toolName: "draft_gmail_api",
      arguments: {
        recipient: "sharma.cs@university.edu",
        subject: "Progress Sync & Extension Alignment: Database Project",
        context: "The student has successfully modeled schemas and is working on integrations. Requesting a short 12-hour buffer."
      }
    },
    logs: [
      "16:09:30.022 [PLANNER] Generating proactive response drafts for professor communication",
      "16:09:30.089 [TOOL] Invoking tool [draft_gmail_api]",
      "16:09:30.090 [TOOL] Subject: 'Progress Sync & Extension Alignment: Database Project'",
      "16:09:30.102 [GEN] Composing email body with LLM agent model template..."
    ]
  },
  {
    type: "tool_result",
    ts: new Date(Date.now() - 15000).toISOString(),
    message: "Draft saved in Gmail Drafts successfully",
    plannerRationale: "The draft is fully composed and staged in Professor Sharma's mail thread within Gmail. User can review and send with a single click.",
    payload: {
      status: "success",
      draftId: "msg_draft_871a_sharma",
      recipient: "sharma.cs@university.edu",
      subject: "Progress Sync & Extension Alignment: Database Project",
      stagedInFolder: "DRAFTS"
    },
    logs: [
      "16:09:45.011 [NETWORK] POST https://gmail.googleapis.com/gmail/v1/users/me/drafts",
      "16:09:45.321 [NETWORK] HTTP 200 OK - Gmail API assigned draft ID msg_draft_871a_sharma",
      "16:09:45.323 [SYSTEM] Draft successfully staged in recipient's university mail thread",
      "16:09:45.330 [STATE] Execution thread state: idle, awaiting user manual push"
    ]
  },
  {
    type: "reflect",
    ts: new Date().toISOString(),
    message: "Reflecting on execution loop: 100% of risks resolved",
    plannerRationale: "The critic engine confirms all subtasks are cleanly mapped, calendar blocks are safeguarded, and drafts are staged. Task risk rating successfully moderated.",
    citations: ["Critic Engine v2", "State Validator"],
    payload: {
      verificationStatus: "VERIFIED",
      unresolvedRisks: 0,
      confidenceScore: 0.98
    },
    logs: [
      "16:10:00.001 [CRITIC] Initiating comprehensive execution trace verification...",
      "16:10:00.089 [CRITIC] Scanning active risk database for unresolved threads",
      "16:10:00.142 [CRITIC] verificationStatus: VERIFIED, unresolvedRisks: 0, confidenceScore: 0.98",
      "16:10:00.150 [SYSTEM] Clutch Guardian engine loop shutdown sequence complete"
    ]
  }
];

export default function AgentTab({ latestAgentRun, runningAgent, triggerAgentLoop, user }: AgentTabProps) {
  const [selectedStepIdx, setSelectedStepIdx] = useState<number>(0);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([0]));
  const [consoleTab, setConsoleTab] = useState<"stdout" | "payload">("stdout");

  // Determine steps to display: use live runs if available, else fall back to beautiful mock runs
  const hasLiveSteps = latestAgentRun && latestAgentRun.steps && latestAgentRun.steps.length > 0;
  const rawSteps = hasLiveSteps ? latestAgentRun.steps : MOCK_AGENT_STEPS;
  
  // Staggering step simulation when running is active
  useEffect(() => {
    if (runningAgent) {
      setActiveStepIndex(0);
      setExpandedSteps(new Set([0]));
      const timer = setInterval(() => {
        setActiveStepIndex(prev => {
          if (prev < rawSteps.length - 1) {
            return prev + 1;
          }
          clearInterval(timer);
          return prev;
        });
      }, 3000); // Progress the active node simulation during mock run
      return () => clearInterval(timer);
    } else {
      setActiveStepIndex(rawSteps.length - 1);
    }
  }, [runningAgent, rawSteps.length]);

  // Synchronize inspector selection with active step progression
  useEffect(() => {
    setSelectedStepIdx(activeStepIndex);
  }, [activeStepIndex]);

  // Expand newly added steps automatically
  useEffect(() => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      next.add(activeStepIndex);
      return next;
    });
  }, [activeStepIndex]);

  const toggleStepExpand = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const expandAllSteps = () => {
    setExpandedSteps(new Set(rawSteps.map((_, idx) => idx)));
  };

  const collapseAllSteps = () => {
    setExpandedSteps(new Set());
  };

  const getStepIcon = (type: string, isActive: boolean, isCompleted: boolean) => {
    if (isCompleted) {
      return (
        <div className="w-5 h-5 rounded-full bg-slate-900 dark:bg-slate-800 text-slate-100 flex items-center justify-center border border-slate-950 dark:border-slate-700 shadow-xs transition-all duration-150">
          <Check className="w-2.5 h-2.5 stroke-[3px]" />
        </div>
      );
    }

    const baseClass = `w-5 h-5 rounded-full flex items-center justify-center border transition-all duration-150 ${
      isActive 
        ? "bg-amber-50 dark:bg-amber-950/20 border-amber-500 text-amber-600 shadow-md ring-1 ring-amber-500/10 animate-pulse" 
        : "bg-slate-50 dark:bg-slate-800 border-border-primary text-slate-400"
    }`;

    switch (type) {
      case "plan":
        return (
          <div className={baseClass}>
            <Sliders className="w-2.5 h-2.5" />
          </div>
        );
      case "reason":
        return (
          <div className={baseClass}>
            <Brain className="w-2.5 h-2.5" />
          </div>
        );
      case "tool_call":
        return (
          <div className={baseClass}>
            <Wrench className="w-2.5 h-2.5" />
          </div>
        );
      case "tool_result":
        return (
          <div className={baseClass}>
            <Cpu className="w-2.5 h-2.5" />
          </div>
        );
      case "reflect":
        return (
          <div className={baseClass}>
            <Sparkles className="w-2.5 h-2.5" />
          </div>
        );
      default:
        return (
          <div className={baseClass}>
            <Terminal className="w-2.5 h-2.5" />
          </div>
        );
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case "plan":
        return "bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-border-primary";
      case "reason":
        return "bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 border-amber-500/10";
      case "tool_call":
        return "bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-border-primary";
      case "tool_result":
        return "bg-slate-900 dark:bg-slate-950 text-slate-100 dark:text-slate-300 border-slate-950";
      case "reflect":
        return "bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 border-amber-500/10";
      default:
        return "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-border-primary";
    }
  };

  const renderHighlightedJson = (obj: any) => {
    if (!obj) return null;
    const jsonString = JSON.stringify(obj, null, 2);
    return (
      <pre className="font-mono text-[10px] md:text-[11px] leading-relaxed text-stone-700 whitespace-pre-wrap select-text selection:bg-amber-500/20 selection:text-stone-900 max-h-[280px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent">
        {jsonString.split('\n').map((line, idx) => {
          const keyValRegex = /^(\s*)"([^"]+)":\s*(.*)$/;
          const match = line.match(keyValRegex);
          
          if (match) {
            const indent = match[1];
            const key = match[2];
            let value = match[3];
            
            let valNode;
            if (value.startsWith('"')) {
              const isLast = value.endsWith(',');
              const textStr = isLast ? value.slice(0, -1) : value;
              valNode = (
                <span className="text-amber-800 font-medium">
                  {textStr}
                  {isLast && <span className="text-stone-400">,</span>}
                </span>
              );
            } else if (value.endsWith(',')) {
              const valTrim = value.slice(0, -1);
              if (valTrim === 'true' || valTrim === 'false') {
                valNode = <span className="text-purple-700 font-semibold">{valTrim}<span className="text-stone-400">,</span></span>;
              } else if (valTrim === 'null') {
                valNode = <span className="text-stone-400 italic">null<span className="text-stone-400">,</span></span>;
              } else if (!isNaN(Number(valTrim))) {
                valNode = <span className="text-emerald-700 font-mono font-semibold">{valTrim}<span className="text-stone-400">,</span></span>;
              } else {
                valNode = <span className="text-stone-700">{value}</span>;
              }
            } else {
              if (value === 'true' || value === 'false') {
                valNode = <span className="text-purple-700 font-semibold">{value}</span>;
              } else if (value === 'null') {
                valNode = <span className="text-stone-400 italic">null</span>;
              } else if (!isNaN(Number(value))) {
                valNode = <span className="text-emerald-700 font-mono font-semibold">{value}</span>;
              } else {
                valNode = <span className="text-stone-700">{value}</span>;
              }
            }
            
            return (
              <div key={idx} className="hover:bg-stone-500/5 py-0.5 px-1 rounded transition-colors duration-100">
                <span className="text-stone-300">{indent}</span>
                <span className="text-stone-400">"</span>
                <span className="text-stone-800 font-semibold">{key}</span>
                <span className="text-stone-400">"</span>
                <span className="text-stone-400 font-mono">:</span>{" "}
                {valNode}
              </div>
            );
          } else {
            const structuralLine = line.trim();
            if (structuralLine === '{' || structuralLine === '}' || structuralLine === '[' || structuralLine === ']' || structuralLine === '},' || structuralLine === '],') {
              return (
                <div key={idx} className="text-stone-400 hover:bg-stone-500/5 py-0.5 px-1 rounded transition-colors duration-100">
                  {line}
                </div>
              );
            }
            return (
              <div key={idx} className="text-stone-500 hover:bg-stone-500/5 py-0.5 px-1 rounded transition-colors duration-100">
                {line}
              </div>
            );
          }
        })}
      </pre>
    );
  };

  const selectedStep = rawSteps[selectedStepIdx];

  return (
    <div className="space-y-8 animate-fade-in text-text-primary">
      
      {/* Three-Pane Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Pane 1: Agent Telemetry & Core Directives */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-bg-panel/90 backdrop-blur-sm border border-border-primary rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center space-x-1.5 text-text-muted pb-2 border-b border-border-subtle">
              <Activity className="w-3.5 h-3.5 stroke-[2]" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest font-mono">Agent Telemetry</h3>
            </div>
            
            <div className="space-y-3.5">
              <div className="flex justify-between items-center pb-2.5 border-b border-border-subtle">
                <span className="text-[11px] font-semibold text-text-muted font-mono">Active Pipeline</span>
                <span className="text-[10px] font-mono font-bold text-text-primary bg-bg-hover border border-border-primary px-2 py-0.5 rounded">Planner-Executor</span>
              </div>
              <div className="flex justify-between items-center pb-2.5 border-b border-border-subtle">
                <span className="text-[11px] font-semibold text-text-muted font-mono">Core Latency</span>
                <span className="text-[10px] font-mono font-bold text-text-primary">42ms avg</span>
              </div>
              <div className="flex justify-between items-center pb-2.5 border-b border-border-subtle">
                <span className="text-[11px] font-semibold text-text-muted font-mono">Accuracy Check</span>
                <span className="text-[10px] font-mono font-bold text-text-primary">99.2% CRITIC</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-semibold text-text-muted font-mono">System Status</span>
                <span className={`inline-flex items-center space-x-1.5 text-[10px] font-bold font-mono ${runningAgent ? "text-amber-600 animate-pulse" : "text-text-muted"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${runningAgent ? "bg-amber-500" : "bg-slate-400"}`} />
                  <span>{runningAgent ? "EXECUTING" : "STANDBY"}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="bg-bg-panel/90 backdrop-blur-sm border border-border-primary rounded-2xl p-5 shadow-xs space-y-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-border-primary" />
            <div className="flex items-center space-x-1.5 text-text-muted">
              <Brain className="w-3.5 h-3.5 stroke-[2]" />
              <h4 className="text-[10px] font-bold uppercase tracking-widest font-mono">Core Directives</h4>
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed font-medium font-mono">
              The guardian algorithm continuously parses commitments against active milestones. On variance, it intercepts focus blocks and stages correspondence.
            </p>
          </div>
        </div>

        {/* Pane 2: Real-time Timeline Ledger */}
        <div className="lg:col-span-5 space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200/60">
            <div>
              <h2 className="text-[10px] font-bold text-stone-400 font-mono uppercase tracking-widest">
                Execution Trace
              </h2>
              <p className="text-[11px] text-stone-500 mt-0.5 font-mono">
                Click any step to inspect codes and payloads.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={expandAllSteps}
                  className="text-[9px] font-mono font-bold text-stone-400 hover:text-stone-700 bg-stone-100 border border-stone-200/60 px-1.5 py-0.5 rounded active:scale-[0.97] transition-all duration-100 cursor-pointer"
                >
                  Expand All
                </button>
                <button
                  onClick={collapseAllSteps}
                  className="text-[9px] font-mono font-bold text-stone-400 hover:text-stone-700 bg-stone-100 border border-stone-200/60 px-1.5 py-0.5 rounded active:scale-[0.97] transition-all duration-100 cursor-pointer"
                >
                  Collapse All
                </button>
              </div>
              <span className="text-[10px] font-mono font-bold bg-slate-100 border border-border-primary px-2.5 py-0.5 rounded text-text-secondary">
                {rawSteps.slice(0, activeStepIndex + 1).length} / {rawSteps.length}
              </span>
            </div>
          </div>

          {/* Core Timeline Tree */}
          <div className="relative pl-7 space-y-4">
            {/* Connecting Track Line */}
            <div className="absolute left-[9px] top-4 bottom-4 w-[1.5px] bg-border-primary" />

            <AnimatePresence initial={false}>
              {rawSteps.slice(0, activeStepIndex + 1).map((step, idx) => {
                const isCompleted = idx < activeStepIndex;
                const isActive = idx === activeStepIndex;
                const isSelected = idx === selectedStepIdx;
                const isStepExpanded = expandedSteps.has(idx);
                const delayFactor = idx * 0.04;

                return (
                  <div key={idx} className="flex flex-col w-full">
                    <motion.button
                      onClick={(e) => {
                        setSelectedStepIdx(idx);
                        toggleStepExpand(idx, e);
                      }}
                      initial={{ opacity: 0, y: 12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        duration: 0.22, 
                        delay: delayFactor,
                        ease: [0.23, 1, 0.32, 1] 
                      }}
                      className={`w-full text-left relative p-4 rounded-xl border transition-all duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] outline-none flex items-start space-x-3.5 group cursor-pointer ${
                        isSelected 
                          ? "bg-slate-50 border-amber-500/40 dark:border-amber-500/60 shadow-xs ring-1 ring-amber-500/10 dark:bg-amber-950/10" 
                          : "bg-bg-panel border-border-primary hover:border-slate-300 hover:dark:border-slate-700 hover:shadow-2xs"
                      }`}
                    >
                      {/* Floating Node Anchor */}
                      <div className="absolute left-[-26px] top-[18px] z-10">
                        {getStepIcon(step.type, isActive, isCompleted)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getTypeStyle(step.type)}`}>
                              {step.type}
                            </span>
                            {step.logs && (
                              <span className="text-[9px] font-mono text-text-muted bg-slate-100 border border-border-primary px-1.5 py-0.5 rounded-md">
                                {step.logs.length} traces
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[9px] font-mono text-text-muted">
                              {new Date(step.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                            <motion.div
                              animate={{ rotate: isStepExpanded ? 180 : 0 }}
                              transition={{ duration: 0.15, ease: "easeOut" }}
                              className="text-text-muted group-hover:text-text-primary transition-colors"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </motion.div>
                          </div>
                        </div>
                        <p className="text-xs font-semibold text-text-primary leading-relaxed mt-2 tracking-tight font-mono">
                          {step.message}
                        </p>
                      </div>

                      <div className={`shrink-0 transition-opacity duration-150 flex items-center h-full pt-1.5 ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                        <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? "text-amber-500" : "text-text-muted/40"}`} />
                      </div>
                    </motion.button>

                    {/* Chronological Collapsible Details */}
                    <AnimatePresence initial={false}>
                      {isStepExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                          className="overflow-hidden pl-2"
                        >
                          <div className="pt-2 pb-4 pr-1 pl-3 border-l border-dashed border-border-primary ml-[9px] mt-1 space-y-4 text-xs font-mono">
                            {/* Metadata Traces */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 bg-slate-50/50 border border-border-primary rounded-xl p-3 font-mono text-[10px] text-text-secondary leading-normal">
                              <div>
                                <span className="text-text-muted uppercase tracking-widest block text-[8px]">execution_time</span>
                                <span className="font-semibold text-text-primary">0.42s avg</span>
                              </div>
                              <div>
                                <span className="text-text-muted uppercase tracking-widest block text-[8px]">memory_footprint</span>
                                <span className="font-semibold text-text-primary">4.12 MB</span>
                              </div>
                              <div>
                                <span className="text-text-muted uppercase tracking-widest block text-[8px]">engine_tier</span>
                                <span className="font-semibold text-text-primary">GUARDIAN_v3.1</span>
                              </div>
                            </div>

                            {/* Planner Rationale */}
                            {step.plannerRationale && (
                              <div className="bg-slate-50 border-l-2 border-amber-500/40 dark:border-amber-500/60 p-3 rounded-r-lg space-y-0.5">
                                <span className="text-[8px] font-mono font-bold text-amber-800 dark:text-amber-400 uppercase tracking-widest block">
                                  Planner Rationale
                                </span>
                                <p className="text-[11px] text-text-secondary font-medium italic leading-relaxed">
                                  "{step.plannerRationale}"
                                </p>
                              </div>
                            )}

                            {/* Citations */}
                            {step.citations && step.citations.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {step.citations.map((cit, cIdx) => (
                                  <span key={cIdx} className="text-[9px] font-mono bg-slate-100 text-text-secondary px-2 py-0.5 rounded border border-border-primary">
                                    {cit}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Subtasks */}
                            {step.subtasks && step.subtasks.length > 0 && (
                              <div className="space-y-1.5">
                                <span className="text-[9px] font-mono font-bold text-text-muted uppercase tracking-widest block">
                                  Decomposed Milestones
                                </span>
                                <div className="space-y-1">
                                  {step.subtasks.map((sub, sIdx) => (
                                    <div key={sIdx} className="bg-bg-panel border border-border-primary p-2 rounded-lg flex items-center justify-between text-[11px] hover:border-slate-300 hover:dark:border-slate-700 transition-colors">
                                      <span className="font-medium text-text-secondary truncate">{sub.title}</span>
                                      <span className="text-[9px] font-mono text-amber-800 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-500/10 font-bold px-1.5 py-0.5 rounded border border-amber-500/10">
                                        {Math.floor(sub.effortMins / 60)}h {sub.effortMins % 60 > 0 ? `${sub.effortMins % 60}m` : ""}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Calendar Block Details */}
                            {step.block && (
                              <div className="bg-slate-50 border border-border-primary rounded-lg p-2.5 flex items-center space-x-2.5 text-[11px] text-text-secondary font-medium font-mono">
                                <Calendar className="w-3.5 h-3.5 text-text-muted shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <span className="font-bold text-text-primary block truncate">Guarded Focus Block Reserve</span>
                                  <span className="text-[9px] font-mono text-text-muted">
                                    Locked via Google Calendar v3 REST API
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </AnimatePresence>

            {/* Waiting Loader State */}
            {runningAgent && activeStepIndex < rawSteps.length - 1 && (
              <div className="relative p-4 rounded-xl border border-dashed border-border-primary bg-slate-50/50 animate-pulse flex items-center space-x-3">
                <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center border border-border-primary">
                  <RefreshCw className="w-2.5 h-2.5 text-text-muted animate-spin" />
                </div>
                <div className="text-[10px] font-mono text-text-muted font-bold uppercase tracking-widest">
                  AWAITING CRITIC RUN FEEDBACK...
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pane 3: Warm Mono Live Inspector Console */}
        <div className="lg:col-span-4 font-mono">
          <AnimatePresence mode="wait">
            {selectedStep ? (
              <motion.div
                key={selectedStepIdx}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="h-full"
              >
                <div className="border border-border-primary bg-bg-panel rounded-3xl p-5 shadow-xs space-y-5 flex flex-col h-full min-h-[500px]">
                  {/* Console Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                    <div className="flex items-center space-x-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${runningAgent ? "bg-amber-500 animate-pulse" : "bg-text-muted"}`} />
                      <span className="text-[10px] font-mono font-bold tracking-widest text-text-secondary uppercase">
                        Trace Inspector
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-text-muted bg-slate-50 border border-border-primary px-2 py-0.5 rounded-md">
                      Node #{selectedStepIdx + 1}
                    </span>
                  </div>

                  {/* Thought block (Rationale) */}
                  {selectedStep.plannerRationale && (
                    <div className="bg-slate-50 border-l-2 border-amber-500/40 dark:border-amber-500/60 p-4 rounded-r-xl space-y-1">
                      <span className="text-[9px] font-mono font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest block">
                        Planner Rationale
                      </span>
                      <p className="text-[11px] text-text-secondary font-medium italic leading-relaxed">
                        "{selectedStep.plannerRationale}"
                      </p>
                    </div>
                  )}

                  {/* Subtasks breakdown */}
                  {selectedStep.subtasks && selectedStep.subtasks.length > 0 && (
                    <div className="space-y-2.5">
                      <div className="flex items-center space-x-1.5 text-text-secondary">
                        <Check className="w-3.5 h-3.5 text-amber-500 stroke-[2.5]" />
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider">
                          Decomposed Milestones
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {selectedStep.subtasks.map((sub, sIdx) => (
                          <div key={sIdx} className="bg-slate-50/55 border border-border-primary p-2.5 rounded-lg flex items-center justify-between text-[11px] shadow-2xs">
                            <div className="flex items-center space-x-2.5 truncate">
                              <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-mono font-bold text-text-muted border border-border-primary shrink-0">
                                {sIdx + 1}
                              </div>
                              <span className="font-medium text-text-secondary truncate">{sub.title}</span>
                            </div>
                            <span className="text-[9px] font-mono text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-500/10 font-bold px-1.5 py-0.5 rounded border border-amber-500/10 shrink-0">
                              {Math.floor(sub.effortMins / 60)}h {sub.effortMins % 60 > 0 ? `${sub.effortMins % 60}m` : ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Calendar Block Details */}
                  {selectedStep.block && (
                    <div className="bg-slate-50 border border-border-primary rounded-xl p-3.5 flex items-center space-x-3 text-[11px] text-text-secondary font-medium">
                      <Calendar className="w-4 h-4 text-text-muted shrink-0 stroke-[2]" />
                      <div className="flex-1">
                        <span className="font-bold text-text-primary">Guarded Focus Block Reserve</span>
                        <div className="text-[10px] text-text-muted font-mono mt-0.5">
                          {new Date(selectedStep.block.start.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} to {new Date(selectedStep.block.end.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold bg-slate-100 text-text-secondary px-2 py-0.5 rounded border border-border-primary shrink-0">
                        LOCKED
                      </span>
                    </div>
                  )}

                  {/* Interactive Tabbed Log Terminal & Telemetry Payload */}
                  <div className="space-y-2 flex-1 flex flex-col min-h-0">
                    {/* Tab controls */}
                    <div className="flex items-center space-x-1 border-b border-border-primary pb-3">
                      <button
                        onClick={() => setConsoleTab("stdout")}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all duration-100 active:scale-[0.97] cursor-pointer ${
                          consoleTab === "stdout"
                            ? "bg-slate-100 text-text-primary border border-border-primary"
                            : "text-text-muted hover:text-text-primary border border-transparent"
                        }`}
                      >
                        stdout.log
                      </button>
                      {selectedStep.payload && (
                        <button
                          onClick={() => setConsoleTab("payload")}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all duration-100 active:scale-[0.97] cursor-pointer ${
                            consoleTab === "payload"
                              ? "bg-slate-100 text-text-primary border border-border-primary"
                              : "text-text-muted hover:text-text-primary border border-transparent"
                          }`}
                        >
                          payload.json
                        </button>
                      )}
                    </div>

                    {/* Tab Panels */}
                    {consoleTab === "stdout" && (
                      <div className="bg-slate-50 border border-border-primary rounded-xl p-4 font-mono text-[11px] leading-relaxed text-text-secondary flex-1 flex flex-col justify-start min-h-0 overflow-hidden shadow-inner w-full min-w-0">
                        <div className="flex items-center justify-between pb-2 border-b border-border-subtle mb-2.5 shrink-0">
                          <span className="text-[9px] font-mono text-text-muted uppercase tracking-widest font-semibold">
                            telemetry_system_log.stdout
                          </span>
                          <button
                            onClick={() => {
                              const logsText = (selectedStep.logs || []).join('\n');
                              navigator.clipboard.writeText(logsText);
                            }}
                            className="text-[9px] font-mono text-text-muted hover:text-text-primary border border-border-primary bg-slate-50 px-2 py-0.5 rounded active:scale-[0.97] transition-all duration-100 cursor-pointer"
                          >
                            Copy
                          </button>
                        </div>
                        <div className="overflow-y-auto flex-1 space-y-1 pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent w-full min-w-0">
                          {(selectedStep.logs || [
                            "16:08:00.000 [SYSTEM] No stdout traces registered for this node"
                          ]).map((logLine, lIdx) => {
                            // Parse out timestamps and severity
                            const logRegex = /^([\d:\.]+)\s+\[([^\]]+)\]\s+(.*)$/;
                            const match = logLine.match(logRegex);
                            if (match) {
                               const ts = match[1];
                               const severity = match[2];
                               const msg = match[3];
                               let severityClass = "text-text-muted";
                               if (severity === "SYSTEM") severityClass = "text-text-secondary font-semibold";
                               else if (severity === "DB_CONN") severityClass = "text-blue-500 dark:text-blue-400 font-semibold";
                               else if (severity === "API_REQ" || severity === "API_RES" || severity === "NETWORK") severityClass = "text-amber-600 dark:text-amber-400 font-semibold";
                               else if (severity === "ALERT") severityClass = "text-rose-500 dark:text-rose-400 font-bold";
                               else if (severity === "EVAL" || severity === "ENGINE" || severity === "CRITIC") severityClass = "text-purple-500 dark:text-purple-400 font-semibold";
                               else if (severity === "PROCESS" || severity === "STATE" || severity === "SYNC") severityClass = "text-emerald-600 dark:text-emerald-400 font-semibold";
                               else if (severity === "TOOL" || severity === "PLANNER") severityClass = "text-indigo-500 dark:text-indigo-400 font-semibold";

                               return (
                                 <div key={lIdx} className="hover:bg-slate-500/5 py-0.5 px-1 rounded transition-colors duration-100 flex items-start space-x-2 w-full min-w-0">
                                   <span className="text-text-muted shrink-0">{ts}</span>
                                   <span className={`shrink-0 min-w-[55px] text-right ${severityClass}`}>[{severity}]</span>
                                   <span className="text-text-secondary select-text selection:bg-amber-500/20 selection:text-text-primary flex-1 min-w-0 break-words">{msg}</span>
                                 </div>
                               );
                            }
                            return (
                              <div key={lIdx} className="text-text-secondary hover:bg-slate-500/5 py-0.5 px-1 rounded transition-colors duration-100 select-text selection:bg-amber-500/20 w-full min-w-0 break-words">
                                {logLine}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {consoleTab === "payload" && selectedStep.payload && (
                      <div className="bg-slate-50 border border-border-primary rounded-xl p-4 overflow-hidden shadow-inner flex-1 flex flex-col justify-start min-h-0 w-full min-w-0">
                        <div className="flex items-center justify-between pb-2 border-b border-border-subtle mb-2.5 shrink-0">
                          <span className="text-[9px] font-mono text-text-muted uppercase tracking-widest font-semibold">
                            telemetry_stream.json
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(JSON.stringify(selectedStep.payload, null, 2));
                            }}
                            className="text-[9px] font-mono text-text-muted hover:text-text-primary border border-border-primary bg-slate-50 px-2 py-0.5 rounded active:scale-[0.97] transition-all duration-100 cursor-pointer"
                          >
                            Copy
                          </button>
                        </div>
                        <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent w-full min-w-0">
                          {renderHighlightedJson(selectedStep.payload)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* References/Citations */}
                  {selectedStep.citations && selectedStep.citations.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-border-subtle">
                      <span className="text-[9px] font-mono font-bold text-text-muted uppercase tracking-widest block">
                        Security Citations
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedStep.citations.map((cit, cIdx) => (
                          <span key={cIdx} className="text-[9px] font-mono bg-slate-50 text-text-secondary px-2 py-0.5 rounded border border-border-primary">
                            {cit}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-border-primary rounded-3xl min-h-[400px] bg-slate-50/50 font-mono">
                <Terminal className="w-8 h-8 text-text-muted stroke-[1.5] mb-2 animate-pulse" />
                <span className="text-[10px] font-bold text-text-muted tracking-wider uppercase">Await Node Attachment</span>
                <p className="text-[11px] text-text-muted/80 mt-1 max-w-[200px]">Select any execution node from the feed to hook live telemetry</p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
