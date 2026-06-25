import React, { useState, useEffect } from "react";
import InsightsChart from "./InsightsChart";
import { 
  Sparkles, 
  Flame, 
  Shield, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Zap, 
  ChevronRight,
  Maximize2,
  Minimize2,
  AlertTriangle,
  Trophy,
  Activity,
  RotateCw,
  Calendar,
  BookOpen,
  Brain,
  Target,
  Check,
  TrendingUp
} from "lucide-react";

interface TodayTabProps {
  user: any;
  tasks: any[];
  latestAgentRun: any;
  setSelectedTask: (task: any) => void;
  runCrisisTriage: () => void;
  streak: number;
  setStreak: React.Dispatch<React.SetStateAction<number>>;
  streakShield: boolean;
  setStreakShield: (shield: boolean) => void;
  showToast: (msg: string) => void;
  getDeadlineDate: (task: any) => Date;
  getDeadlineCountdown: (date: Date) => string;
  getTaskIcon: (type: string) => React.ReactNode;
  getRiskStyles: (band: string) => string;
  highRiskTasks: any[];
}

export default function TodayTab({
  user,
  tasks,
  latestAgentRun,
  setSelectedTask,
  runCrisisTriage,
  streak,
  setStreak,
  streakShield,
  setStreakShield,
  showToast,
  getDeadlineDate,
  getDeadlineCountdown,
  getTaskIcon,
  getRiskStyles,
  highRiskTasks
}: TodayTabProps) {
  const [focusMode, setFocusMode] = useState<boolean>(false);
  const [pulseBadge, setPulseBadge] = useState<boolean>(false);

  // Focus mode task is the single most urgent (sorted first in lists)
  const urgentTask = highRiskTasks.length > 0 ? highRiskTasks[0] : tasks[0];

  // Trigger risk badge pulse once when task list changes or on load
  useEffect(() => {
    setPulseBadge(true);
    const timer = setTimeout(() => setPulseBadge(false), 2000);
    return () => clearTimeout(timer);
  }, [tasks]);

  // Mock static schedule blocks for focus session demonstration
  const dailySchedule = [
    {
      time: "08:30 AM",
      title: "Morning Routine & Planning",
      subtitle: "Autopilot scanning sync",
      status: "completed",
      icon: <Calendar className="w-4 h-4" />
    },
    {
      time: "10:00 AM",
      title: "Deep Focus Session",
      subtitle: "Critical exam prep sprint",
      status: "current",
      icon: <Brain className="w-4 h-4" />
    },
    {
      time: "01:30 PM",
      title: "Task Review Interval",
      subtitle: "Internship draft follow-up",
      status: "upcoming",
      icon: <BookOpen className="w-4 h-4" />
    },
    {
      time: "04:00 PM",
      title: "Guardian Sweep & Shield Sync",
      subtitle: "Daily risk vector analysis",
      status: "upcoming",
      icon: <Shield className="w-4 h-4" />
    }
  ];

  return (
    <div className="space-y-10 animate-fade-in bg-slate-50/40 min-h-screen p-6 md:p-10 text-slate-800 rounded-[32px] border border-slate-100/70 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),_0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Top Banner with focus toggle and status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100/80 pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 font-mono">DEADLINE GUARDIAN</span>
          <h2 className="text-2xl font-black text-slate-950 tracking-tight mt-0.5">Today's Focus Control</h2>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto flex-wrap gap-y-2">
          {/* Focus Mode Trigger - Tactile & Premium */}
          <button
            onClick={() => {
              setFocusMode(!focusMode);
              showToast(!focusMode ? "Focus Mode Activated. Simplify and conquer." : "Dashboard restored.");
            }}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm border transition-all duration-200 active:scale-[0.97] cursor-pointer ${
              focusMode 
                ? "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100/30" 
                : "bg-bg-panel text-slate-700 border-border-primary hover:bg-bg-hover hover:border-border-primary"
            }`}
          >
            {focusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{focusMode ? "Exit Focus Mode" : "Focus Mode"}</span>
          </button>
        </div>
      </div>

      {focusMode ? (
        /* FOCUS MODE - Minimalist Single Urgent Task Display */
        <div className="animate-scale-up py-16 flex flex-col items-center justify-center max-w-2xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-mono font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              <span>SINGLE CRITICAL FOCUS ACTIVE</span>
            </div>
            <p className="text-sm text-slate-500 mt-2">Zero distractions. Just complete this one commitment.</p>
          </div>

          {urgentTask ? (
            <div className="w-full bg-bg-panel border border-border-subtle rounded-[32px] p-10 shadow-lg relative overflow-hidden transition-all duration-300 hover:border-border-primary">
              <div className="absolute top-0 right-0 w-36 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-8">
                <span className={`text-[10px] px-3.5 py-1 rounded-full border font-bold font-mono uppercase tracking-wider ${getRiskStyles(urgentTask.riskBand)}`}>
                  {urgentTask.riskBand} Risk
                </span>
                <span className="text-xs text-slate-400 flex items-center space-x-2 font-mono">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span>{getDeadlineCountdown(getDeadlineDate(urgentTask))}</span>
                </span>
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 leading-snug tracking-tight">
                  {urgentTask.title}
                </h3>
                
                {urgentTask.description && (
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {urgentTask.description}
                  </p>
                )}

                <div className="flex items-center space-x-4 pt-2 text-xs text-slate-500">
                  <div className="flex items-center space-x-1.5 bg-slate-50/50 border border-border-subtle px-3 py-1 rounded-lg">
                    {getTaskIcon(urgentTask.type)}
                    <span className="capitalize font-semibold">{urgentTask.type}</span>
                  </div>
                  <div className="w-1 h-1 bg-slate-300 rounded-full" />
                  <div className="font-mono bg-slate-50/50 border border-border-subtle px-3 py-1 rounded-lg">{urgentTask.estimatedEffortMins}m estimated effort</div>
                </div>

                {/* Progress bar in Focus Mode */}
                <div className="space-y-3 pt-4">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Task Progress</span>
                    <span>{Math.round(urgentTask.progress * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${urgentTask.progress * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  onClick={() => setSelectedTask(urgentTask)}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold shadow-md shadow-slate-950/10 transition-all duration-200 active:scale-[0.97] flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Open Deep Work Panel</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setFocusMode(false)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-bold transition duration-200 cursor-pointer active:scale-[0.97]"
                >
                  Return to Dashboard View
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-bg-panel border border-border-subtle rounded-[28px] p-12 text-center shadow-md">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-base font-bold text-slate-900">All caught up!</h3>
              <p className="text-xs text-slate-500 mt-1">There are no tasks currently loaded to focus on.</p>
            </div>
          )}
        </div>
      ) : (
        /* NORMAL DASHBOARD HOME SCREEN - CUSTOM BENTO GRID LAYOUT (3 columns, 3 rows, exactly 6 cells) */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch animate-fade-in">
          
          {/* Bento Cell 1: Editorial Morning Briefing (Spans 2 columns on lg) */}
          <div className="lg:col-span-2 bg-bg-panel border border-border-subtle rounded-[28px] p-8 md:p-10 shadow-md flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:border-border-primary hover:shadow-lg">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-indigo-500/5 opacity-50 blur-[60px] pointer-events-none" />
            
            <div>
              <div className="flex items-center space-x-2 text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono mb-6">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>Editorial Briefing • Today, {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "long" })}</span>
              </div>

              <div className="space-y-4 max-w-4xl">
                <h3 className="text-xl md:text-2xl font-black text-slate-950 leading-snug tracking-tight">
                  {latestAgentRun?.summary ? (
                    <span>{latestAgentRun.summary}</span>
                  ) : (
                    <span>
                      Good morning, <strong className="text-indigo-600 font-black">{user?.displayName?.split(" ")[0] || "Aarav"}</strong>. The single core priority today: run a <strong className="text-indigo-600">"Guardian sweep"</strong>. Clutch is monitoring {tasks.length} active commitments with precision.
                    </span>
                  )}
                </h3>
                
                <p className="text-sm text-slate-500 leading-relaxed max-w-3xl">
                  {latestAgentRun?.summary ? (
                    <span>
                      The Deadline Guardian has processed your active risk scores. Open the <strong className="text-indigo-600 font-semibold">Tasks Board</strong> to act, or drill into the <strong className="text-indigo-600 font-semibold">Agent Loop</strong> to see critical risk paths.
                    </span>
                  ) : (
                    <span>
                      You have <strong className="text-slate-900 font-semibold">{tasks.length} active deadlines</strong> loaded. We've detected two key deliverables that need study intervals this week: Friday's <span className="text-indigo-600 font-semibold">stats quiz study prep</span> and the pending <span className="text-indigo-600 font-semibold">Internship follow-up draft</span>.
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="pt-8 border-t border-border-subtle flex flex-wrap items-center justify-between gap-4 mt-8">
              <button 
                id="today-review-tasks-button"
                onClick={() => {
                  if (highRiskTasks.length > 0) {
                    setSelectedTask(highRiskTasks[0]);
                  } else if (tasks.length > 0) {
                    setSelectedTask(tasks[0]);
                  } else {
                    showToast("Please seed or capture commitments to inspect.");
                  }
                }}
                className="px-6 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer active:scale-[0.97]"
              >
                {highRiskTasks.length > 0 ? "Review Critical Task" : "Review All Commitments"}
              </button>
              <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Autopilot Guardian: <strong className="text-slate-800 font-semibold">Online</strong></span>
              </div>
            </div>
          </div>

          {/* Bento Cell 2: System Stats & Tactile Streak Control (Spans 1 column on lg) */}
          <div className="lg:col-span-1 bg-bg-panel border border-border-subtle rounded-[28px] p-8 shadow-md flex flex-col justify-between transition-all duration-300 hover:border-border-primary hover:shadow-lg">
            <div>
              <div className="flex items-center space-x-2 text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono mb-4">
                <Trophy className="w-4 h-4 text-indigo-500" />
                <span>Streak & Shield Control</span>
              </div>
              <p className="text-xs text-slate-400 mb-6">Actively safeguard and scale your daily focus rhythm.</p>
            </div>

            <div className="space-y-4">
              {/* Gamified Streak Counter with animated fire SVG */}
              <div 
                onClick={() => {
                  setStreak(prev => prev + 1);
                  showToast("Streak amplified! Keep the momentum!");
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { setStreak(prev => prev + 1); } }}
                className="group flex items-center justify-between p-4 rounded-2xl bg-amber-50/60 text-orange-800 border border-amber-100/50 font-semibold transition-all duration-200 hover:shadow-sm hover:border-orange-200/50 active:scale-[0.97] cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-amber-100 text-orange-600 shrink-0">
                    <Flame className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] uppercase font-bold text-orange-500 tracking-wider">RESCUE STREAK</span>
                    <span className="text-sm font-black text-slate-900">{streak} Days Strong</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-orange-400 group-hover:translate-x-0.5 transition-transform duration-200" />
              </div>

              {/* Gamified Streak Shield */}
              <button
                id="streak-shield-toggle-button"
                type="button"
                aria-pressed={streakShield}
                onClick={() => {
                  const newVal = !streakShield;
                  setStreakShield(newVal);
                  showToast(newVal ? "Streak Shield Activated!" : "Streak Shield Deactivated");
                }}
                className={`group flex items-center justify-between w-full p-4 rounded-2xl border text-left font-semibold transition-all duration-200 active:scale-[0.97] cursor-pointer ${
                  streakShield 
                    ? "bg-blue-50/50 text-blue-800 border-blue-100/60 hover:border-blue-200/80" 
                    : "bg-slate-50/80 text-slate-500 border-slate-100 hover:bg-slate-100/50 hover:border-slate-200"
                }`}
                title="Click to toggle streak shield manually"
              >
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 transition-colors duration-200 ${
                    streakShield ? "bg-blue-100/80 text-blue-600" : "bg-slate-200/50 text-slate-400"
                  }`}>
                    <Shield className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${
                      streakShield ? "text-blue-600" : "text-slate-400"
                    }`} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">STREAK SHIELD</span>
                    <span className={`text-sm font-bold ${streakShield ? "text-slate-900" : "text-slate-500"}`}>
                      {streakShield ? "Active Guardian" : "System Standby"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    streakShield ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-500"
                  }`}>
                    {streakShield ? "ACTIVE" : "STANDBY"}
                  </span>
                </div>
              </button>
            </div>

            {/* Metrics Checklist Panel - Integrated Performance Indicators */}
            <div className="mt-6 pt-6 border-t border-slate-100/80 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold font-mono">
                <span>FOCUS METRICS</span>
                <span className="text-indigo-600 flex items-center space-x-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>88% SCORE</span>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50/60 border border-slate-100 rounded-xl flex flex-col justify-between hover:border-slate-200/60 transition-colors duration-150">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">TODAY STATUS</span>
                  <span className="text-xs font-black text-slate-800 mt-1">2 / 5 Tasks</span>
                </div>
                <div className="p-3 bg-slate-50/60 border border-border-subtle rounded-xl flex flex-col justify-between hover:border-border-primary transition-colors duration-150">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">TOTAL FOCUS</span>
                  <span className="text-xs font-black text-slate-800 mt-1">120m Session</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Cell 3: Weekly Workload Trends (Insights Chart) (Spans 2 columns on lg) */}
          <div className="lg:col-span-2 bg-bg-panel border border-border-subtle rounded-[28px] p-8 shadow-md flex flex-col justify-between transition-all duration-300 hover:border-border-primary hover:shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center space-x-2 text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono">
                  <Activity className="w-4 h-4 text-indigo-500" />
                  <span>Workload Risk vs Rescue Capacity</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Continuous prediction based on active commitments and agent rescue actions</p>
              </div>
              <div className="flex items-center space-x-4 text-[10px] font-mono font-bold">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-slate-400">WORKLOAD RISK</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  <span className="text-slate-400">RESCUE CAPACITY</span>
                </span>
              </div>
            </div>
            <div className="h-68 w-full mt-2">
              <InsightsChart />
            </div>
          </div>

          {/* Bento Cell 4: Daily Schedule Timeline (Spans 1 column on lg) */}
          <div className="lg:col-span-1 bg-bg-panel border border-border-subtle rounded-[28px] p-8 shadow-md flex flex-col justify-between transition-all duration-300 hover:border-border-primary hover:shadow-lg">
            <div>
              <div className="flex items-center space-x-2 text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono mb-4">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span>Today's Focus Routine</span>
              </div>
              <p className="text-xs text-slate-400 mb-6">Chronological work intervals catalogued to block schedule collisions.</p>
            </div>

            <div className="relative pl-6 space-y-6 flex-1 flex flex-col justify-center">
              {/* Timeline line */}
              <div className="absolute left-2.5 top-2 bottom-2 w-[1px] bg-border-subtle" />

              {dailySchedule.map((item, index) => {
                const isCompleted = item.status === "completed";
                const isCurrent = item.status === "current";
                
                return (
                  <div 
                    key={index}
                    onClick={() => showToast(`Synchronizing ${item.title}`)}
                    className="relative flex items-start space-x-3 cursor-pointer group active:scale-[0.97] transition-all duration-150 rounded-xl"
                  >
                    {/* Bullet */}
                    <div className="absolute -left-[23.5px] top-1 flex items-center justify-center">
                      {isCompleted ? (
                        <div className="w-[11px] h-[11px] rounded-full bg-emerald-500 border-2 border-white ring-4 ring-emerald-50" />
                      ) : isCurrent ? (
                        <div className="relative flex items-center justify-center">
                          <div className="absolute w-[11px] h-[11px] rounded-full bg-indigo-600 animate-ping opacity-75" />
                          <div className="w-[11px] h-[11px] rounded-full bg-indigo-600 border-2 border-white ring-4 ring-indigo-50 relative z-10" />
                        </div>
                      ) : (
                        <div className="w-[11px] h-[11px] rounded-full bg-slate-200 border-2 border-white ring-4 ring-slate-50" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 bg-slate-50/40 hover:bg-slate-50 border border-transparent hover:border-slate-100/50 p-2.5 rounded-xl transition-all duration-150">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold font-mono text-slate-400 tracking-wider">
                          {item.time}
                        </span>
                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded font-mono ${
                          isCompleted 
                            ? "bg-emerald-50 text-emerald-700" 
                            : isCurrent 
                              ? "bg-indigo-50 text-indigo-700 animate-pulse" 
                              : "bg-slate-100 text-slate-500"
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 mt-1 truncate">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 leading-normal mt-0.5 truncate">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bento Cell 5: Crisis Control Center (Spans 1 column on lg) */}
          <div className="lg:col-span-1 bg-bg-panel border border-border-subtle rounded-[28px] p-8 shadow-md flex flex-col justify-between transition-all duration-300 hover:border-border-primary hover:shadow-lg">
            <div>
              <div className="flex items-center space-x-2 text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono mb-4">
                <Zap className="w-4 h-4 text-indigo-500" />
                <span>Crisis Control Center</span>
              </div>
              <p className="text-xs text-slate-400 mb-6">Autonomous systems ready to mitigate schedule collisions and overload.</p>
            </div>

            {highRiskTasks.length >= 2 ? (
              /* Severe Overload State */
              <div className="bg-rose-50/50 border border-rose-100/60 rounded-2xl p-5 flex flex-col justify-between h-56 space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-9 h-10 rounded-xl bg-rose-100/80 flex items-center justify-center border border-rose-200/55 text-rose-600 shrink-0 shadow-sm">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black font-mono text-rose-700 uppercase tracking-widest bg-rose-100/60 px-2.5 py-0.5 rounded">
                      RISK OVERLOAD
                    </span>
                    <h4 className="text-xs font-black text-slate-900 mt-1.5">Calendar Collision Detected</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
                      You have {highRiskTasks.length} critical deadlines. Cognitive load is high. Let Clutch run triage to auto-renegotiate.
                    </p>
                  </div>
                </div>

                <button
                  id="today-run-crisis-triage-button"
                  onClick={runCrisisTriage}
                  className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all duration-200 shrink-0 shadow-sm flex items-center justify-center space-x-2 cursor-pointer active:scale-[0.97]"
                >
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  <span>Execute Crisis Triage</span>
                </button>
              </div>
            ) : (
              /* Stable All-Clear State with premium simulator */
              <div className="bg-slate-50/50 border border-border-subtle rounded-2xl p-5 flex flex-col justify-between h-56 space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-9 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 shrink-0 flex items-center justify-center shadow-sm">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black font-mono text-emerald-700 uppercase tracking-widest bg-emerald-100/60 px-2.5 py-0.5 rounded">
                      SYSTEM CLEAR
                    </span>
                    <h4 className="text-xs font-black text-slate-900 mt-1.5">Guardian Scanning Stable</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                      Commitments are stable. Seed a student schedule or capture high risk tasks to simulate real-time danger paths.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    showToast("No critical risks detected. Guardian shield standing by.");
                  }}
                  className="w-full py-3 rounded-xl bg-slate-950 hover:bg-slate-850 text-white text-xs font-semibold transition-all duration-200 shrink-0 shadow-sm flex items-center justify-center space-x-2 cursor-pointer active:scale-[0.97]"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Refresh Guardian Scan</span>
                </button>
              </div>
            )}
          </div>

          {/* Bento Cell 6: At-Risk Deadlines Board (Spans 2 columns on lg) */}
          <div className="lg:col-span-2 bg-bg-panel border border-border-subtle rounded-[28px] p-8 shadow-md transition-all duration-300 hover:border-border-primary hover:shadow-lg">
            <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-6">
              <div className="flex items-center space-x-2 text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono">
                <AlertTriangle className="w-4 h-4 text-indigo-500" />
                <span>Rescue Board • At-Risk Commitments</span>
              </div>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3.5 py-1 rounded-full border border-indigo-100 font-mono">
                {highRiskTasks.length} CRITICAL TARGETS
              </span>
            </div>

            {highRiskTasks.length === 0 ? (
              <div className="py-14 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-500 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">No active risk vectors detected</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed mt-1">
                    All systems operating nominally. Your active deadlines are catalogued as calm or low risk.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {highRiskTasks.slice(0, 4).map((task: any) => (
                  <div 
                    id={`today-highest-risk-card-${task.id}`}
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedTask(task); } }}
                    className={`bg-bg-panel border border-border-primary rounded-2xl p-5 cursor-pointer flex flex-col justify-between group relative h-48 hover:shadow-md transition-all duration-200 hover:border-border-primary active:scale-[0.97] ${
                      task.riskBand === "critical" 
                        ? "shadow-sm shadow-rose-100/10" 
                        : "shadow-sm shadow-indigo-50/10"
                    }`}
                  >
                    {/* Glowing highlight indicator */}
                    <div className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl ${
                      task.riskBand === "critical" 
                        ? "bg-rose-500" 
                        : "bg-amber-500"
                    }`} />

                    {/* Top section */}
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] px-2.5 py-0.5 rounded-full border font-bold font-mono uppercase tracking-wider ${
                          task.riskBand === "critical" 
                            ? "bg-rose-50 text-rose-700 border-rose-200" 
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        } ${pulseBadge && task.riskBand === "critical" ? "animate-pulse" : ""}`}>
                          {task.riskBand}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold font-mono flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{getDeadlineCountdown(getDeadlineDate(task))}</span>
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition duration-150 line-clamp-2 leading-snug">
                        {task.title}
                      </h4>
                    </div>

                    {/* Bottom section */}
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                        <span className="flex items-center space-x-1">
                          {getTaskIcon(task.type)}
                          <span className="capitalize">{task.type}</span>
                        </span>
                        <span>{task.estimatedEffortMins}m effort</span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-full rounded-full transition-all duration-300" 
                          style={{ width: `${task.progress * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
