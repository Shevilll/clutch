import React, { useEffect, useState, useRef } from "react";
import { 
  X, 
  Trash2, 
  Sparkles, 
  Clock, 
  Calendar, 
  FileText, 
  Send, 
  ExternalLink,
  Check,
  Zap,
  CheckCircle2,
  Lock,
  ArrowRight,
  Shield,
  BookOpen,
  Sliders
} from "lucide-react";
import { motion } from "motion/react";

interface Subtask {
  title: string;
  done: boolean;
  effortMins: number;
}

interface FocusBlock {
  rationale: string;
  googleCalendarStatus: string;
  googleEventLink?: string;
}

interface Task {
  id: string;
  title: string;
  riskBand: "critical" | "high" | "medium" | "low" | string;
  riskScore: number;
  deadline: any;
  estimatedEffortMins: number;
  description?: string;
  focusBlock?: FocusBlock;
  subtasks?: Subtask[];
  progress: number;
  type: string;
  draftArtifactId?: string;
  draftArtifactKind?: string;
  draftPreview?: string;
  googleDocLink?: string;
  googleDocStatus?: string;
  gmailStatus?: string;
}

interface TaskDrawerProps {
  task: Task | null;
  onClose: () => void;
  onToggleSubtask: (task: Task, index: number) => Promise<void>;
  onDeleteTask: (taskId: string) => void;
  onRunRescue: () => void;
  runningAgent: boolean;
  getDeadlineDate: (task: any) => Date;
  getRiskStyles: (band: string) => string;
}

export default function TaskDrawer({
  task,
  onClose,
  onToggleSubtask,
  onDeleteTask,
  onRunRescue,
  runningAgent,
  getDeadlineDate,
  getRiskStyles
}: TaskDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localTask, setLocalTask] = useState<Task | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [streakCount, setStreakCount] = useState<number | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [slackBuffer, setSlackBuffer] = useState<number>(30);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Sync opening animation and local task copy
  useEffect(() => {
    if (task) {
      setLocalTask(task);
      // Trigger slide-in next frame
      requestAnimationFrame(() => {
        setIsOpen(true);
      });
      // Lock page scroll
      document.body.style.overflow = "hidden";
    } else {
      setIsOpen(false);
      const timer = setTimeout(() => {
        setLocalTask(null);
      }, 400); // match slide-out transition
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [task]);

  // Initialize slack buffer dynamically on task change
  useEffect(() => {
    if (localTask) {
      let defaultBuffer = 30;
      if (localTask.riskBand === "critical") defaultBuffer = 45;
      else if (localTask.riskBand === "high") defaultBuffer = 30;
      else if (localTask.riskBand === "medium") defaultBuffer = 20;
      else defaultBuffer = 15;
      setSlackBuffer(defaultBuffer);
    }
  }, [localTask?.id]);

  // Escape key handler to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      onClose();
    }, 350); // delay before firing parent close to let animation finish
  };

  if (!localTask) return null;

  // Custom click-away handler
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
      handleClose();
    }
  };

  const handleSubtaskClick = async (idx: number) => {
    if (!localTask.subtasks) return;
    
    const wasDone = localTask.subtasks[idx].done;
    
    // Smooth checkmark animations + instant progress update
    const updatedSubtasks = localTask.subtasks.map((st, i) => {
      if (i === idx) {
        return { ...st, done: !st.done };
      }
      return st;
    });

    const completedCount = updatedSubtasks.filter(st => st.done).length;
    const nextProgress = updatedSubtasks.length > 0 ? completedCount / updatedSubtasks.length : 0;

    // Instantly update local progress for snappy feels
    setLocalTask({
      ...localTask,
      subtasks: updatedSubtasks,
      progress: nextProgress
    });

    // Run toggle on parent
    await onToggleSubtask(localTask, idx);

    // If we completed a subtask and it wasn't done before
    if (!wasDone) {
      // Satisfying streak animation
      setShowConfetti(true);
      const savedStreak = localStorage.getItem("clutch_streak");
      const currentStreak = savedStreak ? parseInt(savedStreak, 10) : 5;
      setStreakCount(currentStreak);
      setToastMsg(`+1 Progress! Streak at ${currentStreak} - multiplier active`);
      
      setTimeout(() => {
        setShowConfetti(false);
      }, 2000);

      setTimeout(() => {
        setToastMsg(null);
      }, 3000);
    }
  };

  const deadline = getDeadlineDate(localTask);
  const progressPercent = Math.round(localTask.progress * 100);

  // Parse inline Markdown styles strictly without external libs
  const parseInlineStyles = (text: string) => {
    const regex = /(\*\*.*?\*\*|`.*?`)/g;
    const splitParts = text.split(regex);
    
    return splitParts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={idx} className="font-extrabold text-slate-950">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={idx} className="font-mono text-[10px] bg-slate-100 text-indigo-600 border border-slate-200/60 px-1.5 py-0.5 rounded font-semibold">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  // Markdown rendering helper for draft previews
  const renderArtifactMarkdown = (content: string) => {
    if (!content) return null;
    
    const lines = content.split("\n");
    return lines.map((line, index) => {
      const trimmed = line.trim();
      
      // Header 1
      if (trimmed.startsWith("# ")) {
        return (
          <h1 key={index} className="text-xl font-extrabold text-slate-900 mt-4 mb-2 tracking-tight">
            {parseInlineStyles(trimmed.slice(2))}
          </h1>
        );
      }
      // Header 2
      if (trimmed.startsWith("## ")) {
        return (
          <h2 key={index} className="text-lg font-bold text-slate-900 mt-3 mb-1.5 tracking-tight">
            {parseInlineStyles(trimmed.slice(3))}
          </h2>
        );
      }
      // Header 3
      if (trimmed.startsWith("### ")) {
        return (
          <h3 key={index} className="text-base font-semibold text-slate-800 mt-2.5 mb-1">
            {parseInlineStyles(trimmed.slice(4))}
          </h3>
        );
      }
      // Bullet list item
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        return (
          <li key={index} className="text-slate-600 text-xs ml-4 list-disc mb-1 leading-relaxed">
            {parseInlineStyles(trimmed.slice(2))}
          </li>
        );
      }
      // Quote blocks / email body parts
      if (trimmed.startsWith("> ")) {
        return (
          <blockquote key={index} className="border-l-3 border-indigo-500 pl-3.5 italic text-slate-600 my-3 text-xs bg-indigo-50/20 py-2 rounded-r-xl">
            {parseInlineStyles(trimmed.slice(2))}
          </blockquote>
        );
      }
      // Empty line
      if (trimmed === "") {
        return <div key={index} className="h-2" />;
      }
      // Standard Paragraph
      return (
        <p key={index} className="text-slate-600 text-xs leading-relaxed mb-2">
          {parseInlineStyles(trimmed)}
        </p>
      );
    });
  };

  // Time calculations for active Slack Buffer
  const now = new Date();
  const remainingMins = Math.max(0, Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60)));
  const totalAllocatedMins = localTask.estimatedEffortMins + slackBuffer;
  const isOverallocated = totalAllocatedMins > remainingMins;

  // Calculate status of the budget
  let budgetStatus: "optimal" | "tight" | "risk" = "optimal";
  if (isOverallocated) {
    budgetStatus = "risk";
  } else if (totalAllocatedMins > remainingMins * 0.7) {
    budgetStatus = "tight";
  }

  const maxBarVal = Math.max(totalAllocatedMins, remainingMins, 1);
  const effortPercent = (localTask.estimatedEffortMins / maxBarVal) * 100;
  const slackPercent = (slackBuffer / maxBarVal) * 100;
  const remainingPercent = Math.max(0, 100 - effortPercent - slackPercent);

  const formatRemainingTime = (mins: number) => {
    if (mins === 0) return "Deadline passed";
    const days = Math.floor(mins / (24 * 60));
    const hours = Math.floor((mins % (24 * 60)) / 60);
    const minutes = mins % 60;
    
    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);
    
    return parts.join(" ") + " left";
  };

  const completedSubtasksCount = localTask.subtasks?.filter(st => st.done).length || 0;
  const totalSubtasksCount = localTask.subtasks?.length || 0;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: isOpen ? 1 : 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed inset-0 z-50 flex justify-end bg-slate-950/20 backdrop-blur-[4px] ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      {/* Toast Alert overlay (Light Theme Only, No Emojis) */}
      {toastMsg && (
        <motion.div 
          initial={{ y: -50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 26 }}
          className="absolute top-6 left-6 z-50 flex items-center space-x-2.5 bg-bg-panel border border-border-primary text-slate-800 text-xs font-bold px-4 py-3 rounded-xl shadow-lg"
        >
          <Zap className="w-4 h-4 text-indigo-500 fill-indigo-500 animate-pulse" />
          <span>{toastMsg}</span>
        </motion.div>
      )}

      {/* Slide-out Sheet Panel (Gorgeous iOS-like spring, deep fine shadow) */}
      <motion.div 
        ref={drawerRef}
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? "0%" : "100%" }}
        transition={{
          type: "spring",
          stiffness: 320,
          damping: 35,
          mass: 0.9,
          restDelta: 0.001
        }}
        className="w-full max-w-lg bg-bg-panel h-full shadow-lg flex flex-col justify-between overflow-hidden relative border-l border-border-primary"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Flame Burst Streak Animation Layer */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-20 flex items-center justify-center bg-white/10 backdrop-blur-[1px] transition-all duration-300">
            {/* Burst particle animations */}
            <div className="absolute w-2 h-2 bg-indigo-500 rounded-full animate-ping scale-[8] opacity-20" />
            <div className="absolute w-32 h-32 flex items-center justify-center">
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute w-1.5 h-1.5 bg-indigo-500 rounded-full"
                  style={{
                    transform: `rotate(${i * 30}deg) translateY(-40px)`,
                    animation: "burst 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards"
                  }}
                />
              ))}
            </div>
            {/* Elegant Floating Streak badge */}
            <div className="absolute bg-bg-popover/95 backdrop-blur border border-accent/20 text-indigo-600 font-extrabold px-5 py-3 rounded-full text-xs shadow-lg flex items-center space-x-2.5 animate-scale-up select-none">
              <Zap className="w-4.5 h-4.5 text-indigo-500 fill-indigo-500" />
              <span className="tracking-wider">STREAK MULTIPLIER ACTIVE</span>
            </div>
          </div>
        )}

        {/* CSS for custom particles and scrolls */}
        <style>{`
          @keyframes burst {
            0% { transform: rotate(var(--rotation, 0deg)) translateY(0px) scale(1); opacity: 1; }
            100% { transform: rotate(var(--rotation, 0deg)) translateY(-80px) scale(0); opacity: 0; }
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 9999px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #6366f1;
          }
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 9999px;
            background: #4f46e5;
            border: 2px solid #ffffff;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 0 0 0px rgba(79, 70, 229, 0.2);
            cursor: grab;
            transition: transform 0.1s ease, box-shadow 0.15s ease, background-color 0.1s ease;
          }
          input[type="range"]::-webkit-slider-thumb:hover {
            background: #4338ca;
            transform: scale(1.1);
          }
          input[type="range"]::-webkit-slider-thumb:active {
            cursor: grabbing;
            background: #3730a3;
            transform: scale(1.2);
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15), 0 0 0 6px rgba(79, 70, 229, 0.15);
          }
        `}</style>

        {/* HEADER SECTION */}
        <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <span className={`text-[10px] px-2.5 py-1 rounded-full border font-bold font-mono uppercase tracking-wider ${getRiskStyles(localTask.riskBand)}`}>
              {localTask.riskBand} Risk
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-semibold capitalize tracking-wide font-mono">
              {localTask.type}
            </span>
          </div>
          <motion.button 
            onClick={handleClose}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-8 h-8 rounded-full bg-bg-panel hover:bg-bg-hover border border-border-primary text-slate-500 hover:text-slate-800 transition flex items-center justify-center cursor-pointer focus:outline-none focus:ring-1.5 focus:ring-indigo-500 active:scale-[0.95]"
            aria-label="Close drawer"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>

        {/* BODY (Scrollable content) */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar bg-slate-50/10">
          {/* Task Title */}
          <div>
            <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {localTask.title}
            </h3>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-4 bg-bg-base p-4 rounded-2xl text-xs text-slate-600 border border-border-subtle shadow-inner">
            <div className="flex items-start space-x-2.5">
              <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <span className="block text-slate-400 font-mono uppercase text-[9px] font-bold tracking-wider mb-0.5">Deadline</span>
                <span className="text-slate-800 font-bold font-mono">
                  {deadline.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
            <div className="flex items-start space-x-2.5">
              <Clock className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <span className="block text-slate-400 font-mono uppercase text-[9px] font-bold tracking-wider mb-0.5">Estimated Effort</span>
                <span className="text-slate-800 font-bold">{localTask.estimatedEffortMins} minutes</span>
              </div>
            </div>
          </div>

          {/* Slack Budget Indicator & Slider Controls */}
          <div className="p-5 rounded-2xl bg-bg-panel border border-border-subtle shadow-sm space-y-4">
            <span className="block text-slate-400 font-mono uppercase text-[9px] font-bold tracking-wider">Time Budget & Slack Analyst</span>
            
            {/* Segmentation track bar */}
            <div className="space-y-2">
              <div className="w-full bg-slate-100 rounded-lg h-3 overflow-hidden relative flex shadow-inner">
                {/* Effort */}
                <div 
                  className="bg-indigo-600 h-full transition-all duration-300"
                  style={{ width: `${effortPercent}%` }}
                />
                {/* Slack Buffer */}
                <div 
                  className="bg-amber-400 h-full transition-all duration-300"
                  style={{ 
                    width: `${slackPercent}%`,
                    backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.15) 4px, rgba(255,255,255,0.15) 8px)" 
                  }}
                />
                {/* Remaining unallocated time */}
                {remainingPercent > 0 && (
                  <div 
                    className="bg-slate-200 h-full transition-all duration-300"
                    style={{ width: `${remainingPercent}%` }}
                  />
                )}
              </div>
              
              {/* Legend under track bar */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />
                  <span>Effort ({localTask.estimatedEffortMins}m)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                  <span>Buffer ({slackBuffer}m)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-slate-200 inline-block" />
                  <span>Slack ({Math.max(0, remainingMins - totalAllocatedMins)}m)</span>
                </div>
              </div>
            </div>

            {/* Tactile Slider control */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-500">
                <span>ALLOCATE DURATION SLACK</span>
                <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md font-semibold">{slackBuffer} minutes</span>
              </div>
              <div className="relative flex items-center group">
                <input 
                  type="range"
                  min={0}
                  max={180}
                  step={5}
                  value={slackBuffer}
                  onChange={(e) => setSlackBuffer(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-1.5 focus:ring-indigo-500/50 active:scale-[0.99] transition-all"
                />
              </div>
            </div>

            {/* Alert / Budget state summary */}
            <div className={`p-3 rounded-xl text-[11px] leading-relaxed border font-medium ${
              budgetStatus === "risk" 
                ? "bg-red-50/50 border-red-100 text-red-700" 
                : budgetStatus === "tight" 
                  ? "bg-amber-50/40 border-amber-100 text-amber-800" 
                  : "bg-slate-50 border-slate-100 text-slate-600"
            }`}>
              {budgetStatus === "risk" && (
                <div className="flex items-start space-x-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 animate-ping shrink-0" />
                  <span><strong>Compressed State:</strong> Allocated effort and slack exceed time remaining. Reduce buffer or expedite subtasks to avoid focus conflicts.</span>
                </div>
              )}
              {budgetStatus === "tight" && (
                <div className="flex items-start space-x-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span><strong>High Velocity:</strong> Tight deadline margins. Your schedule has minimal flexible space. Deep-work block is highly recommended.</span>
                </div>
              )}
              {budgetStatus === "optimal" && (
                <div className="flex items-start space-x-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span><strong>Optimal Balance:</strong> Safe focus margin. Standard buffer allocates plenty of unhurried focus slots for quality assurance.</span>
                </div>
              )}
            </div>
          </div>

          {/* Task Description Layout */}
          <div className="space-y-2">
            <span className="block text-slate-400 font-mono uppercase text-[9px] font-bold tracking-wider">Instructions & Context</span>
            <div className="p-4 rounded-2xl bg-bg-base border border-border-subtle text-xs text-slate-600 leading-relaxed font-sans shadow-inner">
              {localTask.description || "No specific instructions extracted. Tap Decompose to draft subtasks."}
            </div>
          </div>

          {/* Guardian Focus Block */}
          {localTask.focusBlock && (
            <div className="space-y-2">
              <span className="block text-slate-400 font-mono uppercase text-[9px] font-bold tracking-wider">Guardian Focus Block</span>
              <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-indigo-50/40 via-bg-panel to-violet-50/20 border border-indigo-100/85 hover:border-indigo-200/80 shadow-md transition-all duration-300 space-y-4 text-xs before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1.5 before:bg-gradient-to-b before:from-indigo-500 before:to-violet-500">
                <div className="flex items-center justify-between text-[10px] text-indigo-600 font-mono font-bold">
                  <span className="flex items-center space-x-1.5">
                    <Shield className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="tracking-wide">CALENDAR BLOCK SCHEDULED</span>
                  </span>
                  <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-mono text-[9px]">2h Deep Work</span>
                </div>
                <div className="text-slate-600 leading-relaxed font-medium pl-1.5">
                  {localTask.focusBlock.rationale}
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-indigo-50/60 pt-3 pl-1.5">
                  <span className="text-[10px] text-slate-500 font-mono flex items-center space-x-2">
                    {localTask.focusBlock.googleCalendarStatus === "synced" ? (
                      <>
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-slate-700 font-semibold">Synced to Google Calendar</span>
                      </>
                    ) : (
                      <>
                        <span className="inline-block w-2 h-2 rounded-full bg-slate-300"></span>
                        <span>Local Mock Schedule</span>
                      </>
                    )}
                  </span>
                  {localTask.focusBlock.googleEventLink && localTask.focusBlock.googleCalendarStatus === "synced" && (
                    <motion.a 
                      id={`drawer-open-google-calendar-link-${localTask.id}`}
                      href={localTask.focusBlock.googleEventLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold shadow-md shadow-indigo-100 hover:shadow-lg hover:shadow-indigo-200/50 transition-all duration-150 flex items-center space-x-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <span>Open Google Calendar</span>
                      <ExternalLink className="w-3 h-3" />
                    </motion.a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Interactive Timeline Traces */}
          <div className="p-5 rounded-2xl bg-bg-panel border border-border-subtle shadow-sm space-y-4">
            <span className="block text-slate-400 font-mono uppercase text-[9px] font-bold tracking-wider">Execution Timeline Trace</span>
            <div className="relative pl-6 border-l-2 border-slate-100 space-y-5 py-1 ml-2">
              {/* Genesis */}
              <div className="relative">
                <div className="absolute -left-[30px] top-0.5 w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-100/50">
                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3.5} />
                </div>
                <div className="space-y-0.5">
                  <span className="block text-slate-800 font-bold text-xs">Task Genesis</span>
                  <span className="block text-slate-500 text-[10px]">Deliverable commitment synced & deconstructed by agent</span>
                </div>
              </div>

              {/* Focus Block */}
              <div className="relative">
                <div className={`absolute -left-[30px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center shadow-sm border ${
                  localTask.focusBlock ? "bg-indigo-50 border-indigo-600 text-indigo-600" : "bg-slate-50 border-slate-200 text-slate-400"
                }`}>
                  <Shield className="w-2.5 h-2.5" />
                </div>
                <div className="space-y-0.5">
                  <span className="block text-slate-800 font-bold text-xs flex items-center gap-1.5">
                    Focus Protection
                    {localTask.focusBlock && (
                      <span className="text-[8px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-1.5 py-0.2 rounded font-mono font-bold uppercase">
                        {localTask.focusBlock.googleCalendarStatus}
                      </span>
                    )}
                  </span>
                  <span className="block text-slate-500 text-[10px] leading-relaxed">
                    {localTask.focusBlock 
                      ? "Protected block reserved on active schedule" 
                      : "No Google Calendar protective focus block allocated"}
                  </span>
                </div>
              </div>

              {/* Subtasks Milestone */}
              <div className="relative">
                <div className={`absolute -left-[30px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center shadow-sm border transition-all duration-300 ${
                  completedSubtasksCount === totalSubtasksCount && totalSubtasksCount > 0
                    ? "bg-emerald-50 border-emerald-500 text-emerald-500"
                    : "bg-indigo-50 border-indigo-600 text-indigo-600"
                }`}>
                  <Clock className="w-2.5 h-2.5" />
                </div>
                <div className="space-y-1">
                  <span className="block text-slate-800 font-bold text-xs">Milestone Action Progress</span>
                  <span className="block text-slate-500 text-[10px]">
                    {totalSubtasksCount > 0 
                      ? `${completedSubtasksCount} of ${totalSubtasksCount} focus subtasks resolved` 
                      : "Task decomposition pending."}
                  </span>
                  {totalSubtasksCount > 0 && (
                    <div className="flex gap-1 pt-1">
                      {localTask.subtasks?.map((st, sidx) => (
                        <div 
                          key={sidx}
                          className={`h-1 rounded-full transition-all duration-[400ms] ${
                            st.done ? "bg-indigo-600 w-5" : "bg-slate-100 w-2"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Slack Buffer */}
              <div className="relative">
                <div className="absolute -left-[30px] top-0.5 w-4 h-4 rounded-full bg-indigo-50 border border-indigo-600 text-indigo-600 flex items-center justify-center shadow-sm">
                  <Sliders className="w-2.5 h-2.5" />
                </div>
                <div className="space-y-0.5">
                  <span className="block text-slate-800 font-bold text-xs">Slack Margin Allocation</span>
                  <span className="block text-slate-500 text-[10px]">
                    {slackBuffer === 0 
                      ? "No buffer slack allocated. High urgency." 
                      : `Reserved ${slackBuffer}m of elastic slack buffer`}
                  </span>
                </div>
              </div>

              {/* Deadline */}
              <div className="relative">
                <div className={`absolute -left-[30px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center shadow-md transition-all duration-300 border ${
                  isOverallocated ? "bg-amber-50 border-amber-400 text-amber-600" : "bg-indigo-600 border-indigo-600 text-white"
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${isOverallocated ? "bg-amber-500" : "bg-white"}`} />
                </div>
                <div className="space-y-1">
                  <span className="block text-slate-800 font-bold text-xs">Target Submission Deadline</span>
                  <span className="block text-slate-500 text-[10px]">
                    Due {deadline.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} at {deadline.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <div className="pt-0.5">
                    <span className={`inline-block font-mono text-[9px] font-bold px-2 py-0.5 rounded border ${
                      isOverallocated 
                        ? "bg-red-50 border-red-100/50 text-red-700" 
                        : "bg-slate-100 border-slate-200/50 text-slate-600"
                    }`}>
                      {formatRemainingTime(remainingMins)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subtasks Checklist */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="block text-slate-400 font-mono uppercase text-[9px] font-bold tracking-wider">Subtask Checklist</span>
              <span className="text-[10px] text-indigo-600 font-mono font-bold bg-indigo-50 px-2 py-0.5 rounded-md">{progressPercent}% Complete</span>
            </div>

            {/* Seamless custom progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden relative shadow-inner">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-[600ms] ease-out shadow-inner"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="space-y-2.5 pt-1">
              {localTask.subtasks && localTask.subtasks.map((subtask, idx) => (
                <motion.div 
                  key={idx}
                  id={`drawer-subtask-item-${localTask.id}-${idx}`}
                  role="checkbox"
                  aria-checked={subtask.done}
                  tabIndex={0}
                  onClick={() => handleSubtaskClick(idx)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSubtaskClick(idx);
                    }
                  }}
                  whileHover={{ scale: 1.01, x: 2, transition: { duration: 0.15 } }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center space-x-3.5 p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 focus:outline-none focus:ring-1.5 focus:ring-indigo-500/50 group select-none active:scale-[0.98] ${
                    subtask.done 
                      ? "bg-slate-50/80 border-slate-200/50 shadow-inner" 
                      : "bg-bg-panel border-border-subtle shadow-sm hover:border-border-primary hover:shadow-md"
                  }`}
                >
                  {/* Custom animated checkbox */}
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-300 shrink-0 relative ${
                    subtask.done 
                      ? "bg-indigo-600 border-indigo-600 text-white scale-100 shadow-md shadow-indigo-100" 
                      : "border-border-primary bg-bg-panel text-transparent group-hover:border-indigo-400 group-hover:scale-105"
                  }`}>
                    {/* Checkmark SVG that draws on smoothly */}
                    <Check 
                      className={`w-3.5 h-3.5 transition-all duration-300 ${
                        subtask.done ? "scale-100 rotate-0" : "scale-0 rotate-12"
                      }`} 
                      strokeWidth={3.5} 
                    />
                  </div>

                  <span className={`text-xs font-semibold transition-all duration-300 flex-1 ${
                    subtask.done ? "line-through text-slate-400 font-medium" : "text-slate-800"
                  }`}>
                    {subtask.title}
                  </span>
                  
                  <span className="text-[10px] text-slate-400 font-mono shrink-0 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/50">
                    {subtask.effortMins}m
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Expert Artifact View (Drafts with clean styling and action buttons) */}
          {/* Pre-drafted Essay scenario */}
          {localTask.title.toLowerCase().includes("algo") && !localTask.draftArtifactId && (
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <span className="block text-slate-400 font-mono uppercase text-[9px] font-bold tracking-wider font-semibold">
                Agent Prepared Artifact (Pre-drafted)
              </span>
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/20 to-violet-50/10 border border-indigo-100/50 hover:border-indigo-200/50 shadow-sm transition-all duration-300 space-y-4">
                <div className="flex items-center justify-between text-[10px] text-indigo-600 font-mono font-bold">
                  <span className="flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>DOC DRAFT READY</span>
                  </span>
                  <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono">420 words</span>
                </div>
                
                <div className="bg-bg-panel p-5 rounded-xl border border-border-subtle shadow-sm font-sans text-xs space-y-3 text-slate-700 leading-relaxed">
                  <h4 className="font-extrabold text-sm text-slate-900 leading-tight">Greedy vs. Dynamic Programming: When to Trade Optimality for Speed</h4>
                  <p>
                    Every algorithm that makes a choice faces the same gamble: take the best option in front of it now, or weigh that choice against every future consequence. Greedy algorithms take the gamble; dynamic programming refuses to. The 0/1 knapsack problem makes the stakes concrete — a greedy grab of the highest value-per-weight item can leave real value on the table, while a dynamic-programming table guarantees the optimum at the cost of…
                  </p>
                </div>

                {/* Spotlight User Input Reminder */}
                <div className="p-4 bg-gradient-to-r from-amber-50/40 to-amber-50/10 border border-amber-200/40 rounded-xl leading-relaxed">
                  <div className="font-bold text-amber-800 flex items-center space-x-1.5 mb-1 text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                    <span>The part only you can write:</span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Your lecturer's specific framing from Week 6 regarding greedy subproblem dominance — drop it into section 3.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Pre-drafted Recruiter Follow-up scenario */}
          {localTask.title.toLowerCase().includes("intern") && !localTask.draftArtifactId && (
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <span className="block text-slate-400 font-mono uppercase text-[9px] font-bold tracking-wider font-semibold">
                Agent Prepared Email (Draft)
              </span>
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/20 to-violet-50/10 border border-indigo-100/50 hover:border-indigo-200/50 shadow-sm transition-all duration-300 space-y-4">
                <div className="flex items-center justify-between text-[10px] text-indigo-600 font-mono font-bold">
                  <span className="flex items-center space-x-1.5">
                    <Send className="w-3.5 h-3.5" />
                    <span>GMAIL DRAFT PROPOSAL</span>
                  </span>
                </div>
                
                <div className="bg-bg-panel p-5 rounded-xl border border-border-subtle shadow-sm space-y-3.5 text-xs text-slate-700">
                  <div className="flex items-baseline border-b border-slate-100 pb-2">
                    <span className="text-slate-400 font-mono text-[10px] uppercase font-bold tracking-wider w-16 shrink-0">Subject:</span> 
                    <span className="text-slate-900 font-bold">Following up — SDE Intern application (Aarav Sharma)</span>
                  </div>
                  <div className="text-slate-600 leading-relaxed bg-slate-50/50 p-3.5 rounded-lg border border-slate-100 font-mono text-[11px]">
                    Hi [Recruiter], thanks again for the conversation last week about the summer SDE internship. I wanted to reaffirm my interest and share that I just shipped [project] — happy to walk through it whenever useful. Best, Aarav
                  </div>
                </div>

                {/* Spotlight User Input Reminder */}
                <div className="p-4 bg-gradient-to-r from-amber-50/40 to-amber-50/10 border border-amber-200/40 rounded-xl leading-relaxed">
                  <div className="font-bold text-amber-800 flex items-center space-x-1.5 mb-1 text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                    <span>The part only you can write:</span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Replace <code className="font-mono text-[10px] bg-white px-1.5 py-0.5 border border-slate-200 rounded text-slate-800 font-semibold">[project]</code> with the exact URL or details of the custom agent pipeline we built.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Artifact Viewer with Markdown support and branding links */}
          {localTask.draftArtifactId && (
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <span className="block text-slate-400 font-mono uppercase text-[9px] font-bold tracking-wider font-semibold">
                Agent Prepared Artifact ({localTask.draftArtifactKind?.toUpperCase().replace("_", " ")})
              </span>
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/20 to-violet-50/10 border border-indigo-100/50 hover:border-indigo-200/50 shadow-sm transition-all duration-300 space-y-4">
                <div className="flex items-center justify-between text-[10px] text-indigo-600 font-mono font-bold">
                  <span>DRAFT ARTIFACT READY</span>
                  <span>Grounded via Gemini</span>
                </div>

                <div className="bg-bg-panel p-5 rounded-xl border border-border-subtle shadow-sm space-y-3 max-h-72 overflow-y-auto custom-scrollbar">
                  {localTask.draftPreview && renderArtifactMarkdown(localTask.draftPreview)}
                </div>

                {/* Spotlight User Input Reminder */}
                <div className="p-4 bg-gradient-to-r from-amber-50/40 to-amber-50/10 border border-amber-200/40 rounded-xl leading-relaxed">
                  <div className="font-bold text-amber-800 flex items-center space-x-1.5 mb-1 text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                    <span>The part only you can write:</span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Review the drafted details above. Cross-reference with your local materials to finalize before sending/submitting.
                  </p>
                </div>

                {/* Google Doc Export & Sync Status */}
                {localTask.googleDocLink && localTask.googleDocStatus === "synced" && (
                  <div className="pt-3.5 flex items-center justify-between gap-2 border-t border-slate-150/50 mt-2">
                    <span className="text-[10px] text-slate-500 font-mono flex items-center space-x-1.5">
                      <span className="inline-block w-2.5 h-2.5 bg-blue-500 rounded-sm"></span>
                      <span>Synced as Google Doc</span>
                    </span>
                    <motion.a 
                      id={`drawer-open-google-document-link-${localTask.id}`}
                      href={localTask.googleDocLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold border border-blue-100/50 transition-all duration-150 flex items-center space-x-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-[0.97]"
                    >
                      <span>Open Google Document</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </motion.a>
                  </div>
                )}

                {/* Gmail Draft Sync Status */}
                {localTask.gmailStatus === "synced" && (
                  <div className="pt-3.5 flex items-center justify-between gap-2 border-t border-slate-150/50 mt-2">
                    <span className="text-[10px] text-slate-500 font-mono flex items-center space-x-1.5">
                      <span className="inline-block w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                      <span>Prepared Gmail Draft</span>
                    </span>
                    <motion.a 
                      href="https://mail.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold border border-red-100/50 transition-all duration-150 flex items-center space-x-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 active:scale-[0.97]"
                    >
                      <span>Open in Gmail Drafts</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </motion.a>
                  </div>
                )}

                {/* Fallbacks & Failure Notices */}
                {localTask.googleDocStatus && localTask.googleDocStatus.startsWith("failed:") && (
                  <div className="text-[10px] text-red-600 bg-red-50/50 border border-red-100/50 p-3 rounded-xl font-mono">
                    Google Doc Sync failed: {localTask.googleDocStatus.replace("failed:", "")}
                  </div>
                )}
                {localTask.gmailStatus && localTask.gmailStatus.startsWith("failed:") && (
                  <div className="text-[10px] text-red-600 bg-red-50/50 border border-red-100/50 p-3 rounded-xl font-mono">
                    Gmail Sync failed: {localTask.gmailStatus.replace("failed:", "")}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ACTIONS FOOTER SECTION */}
        <div className="p-6 md:p-8 border-t border-slate-150/80 bg-slate-50/50 flex items-center justify-between gap-4">
          <motion.button
            id={`drawer-delete-task-button-${localTask.id}`}
            onClick={() => onDeleteTask(localTask.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-100/50 text-xs font-semibold transition-all duration-150 flex items-center space-x-1.5 cursor-pointer focus:outline-none focus:ring-1.5 focus:ring-red-500 active:scale-[0.97]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete task</span>
          </motion.button>

          <motion.button
            id={`drawer-run-rescue-button-${localTask.id}`}
            onClick={onRunRescue}
            disabled={runningAgent}
            whileHover={{ scale: runningAgent ? 1 : 1.02 }}
            whileTap={{ scale: runningAgent ? 1 : 0.97 }}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition-all duration-150 shadow-lg shadow-indigo-100/40 hover:shadow-indigo-200/50 flex items-center space-x-1.5 cursor-pointer focus:outline-none focus:ring-1.5 focus:ring-indigo-500 active:scale-[0.97]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{runningAgent ? "Rescuing..." : "Run Rescue"}</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
