import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  Mail, 
  Calendar, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Shield, 
  Zap, 
  Sliders, 
  ChevronRight, 
  Info, 
  Filter, 
  RotateCcw,
  Check,
  Coffee,
  BellOff
} from "lucide-react";

interface Allocation {
  taskId: string;
  action: "renegotiate" | "start_now" | "snooze" | "shield_calendar" | string;
  reason: string;
}

interface TriageResult {
  overloadScore: number;
  overloadLevel: "CRITICAL" | "SEVERE" | "WATCH" | "CALM" | string;
  assessment: string;
  advice: string;
  allocations: Allocation[];
}

interface TriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  triaging: boolean;
  triageResult: TriageResult | null;
  tasks: any[];
  setSelectedTask: (task: any) => void;
  showToast: (message: string) => void;
}

export const TriageModal: React.FC<TriageModalProps> = ({
  isOpen,
  onClose,
  triaging,
  triageResult,
  tasks,
  setSelectedTask,
  showToast,
}) => {
  // Mitigation interactive toggles to simulate dynamic overload score reduction
  const [shieldActive, setShieldActive] = useState(false);
  const [renegotiateActive, setRenegotiateActive] = useState(false);
  const [snoozeActive, setSnoozeActive] = useState(false);
  
  // Tab filtering for recommended allocations inside Step 3
  const [activeTab, setActiveTab] = useState<"all" | "renegotiate" | "shield" | "snooze">("all");
  
  // Local state for animated score to make the dial fluidly count up on open
  const [displayedScore, setAnimatedScore] = useState(0);

  // Mounted transition state for premium spring entrance animation
  const [isMounted, setIsMounted] = useState(false);

  // Wizard Flow Step State: Step 1 (Diagnostics), Step 2 (Calibrator), Step 3 (Execution)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Reset steps and mitigations when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setShieldActive(false);
      setRenegotiateActive(false);
      setSnoozeActive(false);
      setActiveTab("all");
    } else {
      setIsMounted(false);
    }
  }, [isOpen]);

  // Extract base score and level
  const baseScore = triageResult?.overloadScore ?? 0;
  const baseLevel = triageResult?.overloadLevel ?? "CALM";

  // Calculate dynamic score based on simulated mitigations
  const computedScore = (() => {
    let score = baseScore;
    if (shieldActive) score -= 15;
    if (renegotiateActive) score -= 25;
    if (snoozeActive) score -= 10;
    return Math.max(12, score); // clamp to a minimum readable safe score
  })();

  const computedLevel = (() => {
    if (computedScore >= 75) return "CRITICAL";
    if (computedScore >= 50) return "SEVERE";
    if (computedScore >= 30) return "WATCH";
    return "CALM";
  })();

  // Trigger entering transitions
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setIsMounted(true);
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Animate the score gauge when computedScore changes
  useEffect(() => {
    if (!isOpen || triaging) {
      setAnimatedScore(0);
      return;
    }
    const duration = 800; // Premium fluid duration
    const startTime = performance.now();
    const startValue = displayedScore;
    const endValue = computedScore;

    let animationFrameId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Beautiful easeOutCubic curve for precise dialing feedback
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const nextValue = Math.round(startValue + (endValue - startValue) * easeOutCubic);
      
      setAnimatedScore(nextValue);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [computedScore, isOpen, triaging]);

  // Return null if not open
  if (!isOpen) return null;

  // Premium, curated light theme colors mapping for executive-grade dashboard UI
  const getRiskColors = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return {
          bg: "bg-rose-50/50 border-rose-100",
          text: "text-rose-600",
          badge: "bg-rose-100/80 text-rose-700 border-rose-200",
          stroke: "#ef4444",
          shadow: "shadow-[0_12px_30px_rgba(244,63,94,0.06)]",
          glowBorder: "border-rose-200/50",
          label: "CRITICAL SATURATION"
        };
      case "SEVERE":
        return {
          bg: "bg-amber-50/50 border-amber-100",
          text: "text-amber-700",
          badge: "bg-amber-100/80 text-amber-800 border-amber-200",
          stroke: "#f59e0b",
          shadow: "shadow-[0_12px_30px_rgba(245,158,11,0.06)]",
          glowBorder: "border-amber-200/50",
          label: "HIGH EXPOSURE"
        };
      case "WATCH":
        return {
          bg: "bg-yellow-50/50 border-yellow-100",
          text: "text-yellow-800",
          badge: "bg-yellow-100/80 text-yellow-800 border-yellow-200",
          stroke: "#eab308",
          shadow: "shadow-[0_12px_30px_rgba(234,179,8,0.04)]",
          glowBorder: "border-yellow-200/50",
          label: "ELEVATED VIGILANCE"
        };
      case "CALM":
      default:
        return {
          bg: "bg-emerald-50/50 border-emerald-100",
          text: "text-emerald-700",
          badge: "bg-emerald-100/80 text-emerald-700 border-emerald-200",
          stroke: "#10b981",
          shadow: "shadow-[0_12px_30px_rgba(16,185,129,0.04)]",
          glowBorder: "border-emerald-200/50",
          label: "OPTIMAL EQUILIBRIUM"
        };
    }
  };

  const risk = getRiskColors(computedLevel);

  // SVG Dial Math
  const radius = 46;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * displayedScore) / 100;

  // Filter allocations based on selected tab
  const filteredAllocations = triageResult?.allocations.filter(alloc => {
    if (activeTab === "all") return true;
    if (activeTab === "renegotiate") return alloc.action === "renegotiate";
    if (activeTab === "shield") return alloc.action === "start_now" || alloc.action === "shield_calendar";
    if (activeTab === "snooze") return alloc.action === "snooze";
    return true;
  }) ?? [];

  return (
    <div 
      className={`fixed inset-0 z-50 p-4 md:p-6 flex items-center justify-center transition-all duration-500 ease-out ${
        isMounted ? "bg-slate-950/25 backdrop-blur-xl" : "bg-slate-950/0 backdrop-blur-none"
      }`}
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-2xl bg-bg-dialog border border-border-primary rounded-3xl flex flex-col max-h-[92vh] shadow-[0_24px_60px_rgba(0,0,0,0.12)] overflow-hidden relative transition-all duration-500 ${
          isMounted 
            ? "opacity-100 translate-y-0 scale-100" 
            : "opacity-0 translate-y-4 scale-95"
        }`}
        style={{
          transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" // Custom tactile spring animation
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative corner glow */}
        <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-indigo-50/40 to-transparent rounded-full blur-2xl pointer-events-none" />
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-primary relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 shadow-sm">
              <ShieldAlert className="w-5.5 h-5.5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">AI Overload and Capacity Triage</h3>
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider font-semibold">Autonomous Capacity Strategy • Light Theme</p>
            </div>
          </div>
          <button 
            id="triage-modal-close-button"
            onClick={onClose}
            className="btn-interactive text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 p-2.5 rounded-xl border border-slate-200/50 transition duration-150 active:scale-[0.97] cursor-pointer"
            aria-label="Close modal"
          >
            <span className="text-sm font-semibold px-0.5">✕</span>
          </button>
        </div>

        {/* Top Progress Timeline */}
        {triageResult && !triaging && (
          <div className="px-6 py-4 bg-slate-50/60 border-b border-slate-100 relative z-10 select-none">
            <div className="max-w-md mx-auto flex items-center justify-between">
              {/* Step 1 */}
              <button 
                onClick={() => setCurrentStep(1)}
                className="flex items-center space-x-2.5 focus:outline-none group text-left cursor-pointer"
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-300 ${
                  currentStep === 1 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10 ring-2 ring-indigo-600 ring-offset-2 ring-offset-white" 
                    : currentStep > 1 
                      ? "bg-emerald-500 text-white" 
                      : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                }`}>
                  {currentStep > 1 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : "1"}
                </div>
                <div className="hidden sm:block">
                  <p className={`text-[9px] font-black uppercase tracking-wider leading-none ${
                    currentStep === 1 ? "text-indigo-600" : "text-slate-500"
                  }`}>Diagnostics</p>
                  <p className="text-[8px] text-slate-400 font-mono mt-0.5 font-semibold">Overload Audit</p>
                </div>
              </button>

              {/* Line 1-2 */}
              <div className={`flex-1 h-0.5 mx-4 rounded-full transition-all duration-500 ${
                currentStep > 1 ? "bg-emerald-500" : "bg-slate-200/80"
              }`} />

              {/* Step 2 */}
              <button 
                onClick={() => setCurrentStep(2)}
                className="flex items-center space-x-2.5 focus:outline-none group text-left cursor-pointer"
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-300 ${
                  currentStep === 2 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10 ring-2 ring-indigo-600 ring-offset-2 ring-offset-white" 
                    : currentStep > 2 
                      ? "bg-emerald-500 text-white" 
                      : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                }`}>
                  {currentStep > 2 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : "2"}
                </div>
                <div className="hidden sm:block">
                  <p className={`text-[9px] font-black uppercase tracking-wider leading-none ${
                    currentStep === 2 ? "text-indigo-600" : "text-slate-500"
                  }`}>Simulator</p>
                  <p className="text-[8px] text-slate-400 font-mono mt-0.5 font-semibold">Calibrate Score</p>
                </div>
              </button>

              {/* Line 2-3 */}
              <div className={`flex-1 h-0.5 mx-4 rounded-full transition-all duration-500 ${
                currentStep > 2 ? "bg-emerald-500" : "bg-slate-200/80"
              }`} />

              {/* Step 3 */}
              <button 
                onClick={() => setCurrentStep(3)}
                className="flex items-center space-x-2.5 focus:outline-none group text-left cursor-pointer"
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-300 ${
                  currentStep === 3 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10 ring-2 ring-indigo-600 ring-offset-2 ring-offset-white" 
                    : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                }`}>
                  3
                </div>
                <div className="hidden sm:block">
                  <p className={`text-[9px] font-black uppercase tracking-wider leading-none ${
                    currentStep === 3 ? "text-indigo-600" : "text-slate-500"
                  }`}>Execution</p>
                  <p className="text-[8px] text-slate-400 font-mono mt-0.5 font-semibold">Action Plan</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 relative z-10 custom-scrollbar">
          {triaging ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-5">
              <div className="relative">
                <div className="w-14 h-14 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin" />
                <Sparkles className="w-6 h-6 text-indigo-500 absolute top-4 left-4" />
              </div>
              <div className="text-center space-y-1.5 max-w-sm">
                <p className="text-sm font-bold text-slate-900">Recalculating focus dynamics...</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Inspecting workload density, grading calendar collision points, and formulating tactical actions.
                </p>
              </div>
            </div>
          ) : triageResult ? (
            <div className="space-y-6">
              
              {/* STEP 1: Diagnostics */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fade-in">
                  {/* Score & Evaluation Hero Grid */}
                  <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/40 border ${risk.glowBorder} p-6 rounded-2xl relative overflow-hidden transition-all duration-300 ${risk.shadow}`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/20 rounded-full blur-2xl pointer-events-none" />
                    
                    {/* Custom Instrument Dial Column */}
                    <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100/80 pb-5 md:pb-0 md:pr-6">
                      <div className="relative w-28 h-28 flex items-center justify-center">
                        {/* Ring Outer Shadow Glow */}
                        <div className="absolute inset-2 rounded-full bg-bg-panel shadow-sm border border-border-subtle" />
                        <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 112 112">
                          <circle 
                            cx="56" 
                            cy="56" 
                            r={radius} 
                            stroke="rgba(241, 245, 249, 0.8)" 
                            strokeWidth={strokeWidth} 
                            fill="transparent" 
                          />
                          {/* Radial ticks / instrument dividers */}
                          <circle 
                            cx="56" 
                            cy="56" 
                            r={radius - 5} 
                            stroke="rgba(226, 232, 240, 0.6)" 
                            strokeWidth="1" 
                            strokeDasharray="2 4"
                            fill="transparent" 
                          />
                          {/* Under-glow path for progress */}
                          <circle 
                            cx="56" 
                            cy="56" 
                            r={radius} 
                            stroke={risk.stroke} 
                            strokeWidth={strokeWidth + 2} 
                            strokeOpacity="0.12"
                            fill="transparent" 
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className="transition-all duration-700 ease-out blur-[1px]"
                          />
                          {/* Active progress arc */}
                          <circle 
                            cx="56" 
                            cy="56" 
                            r={radius} 
                            stroke={risk.stroke} 
                            strokeWidth={strokeWidth} 
                            fill="transparent" 
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className="transition-all duration-700 ease-out"
                          />
                        </svg>
                        <div className="text-center z-10 space-y-0.5 select-none">
                          <span className="text-3xl font-black font-mono tracking-tight text-slate-900 transition-all duration-300">
                            {displayedScore}
                          </span>
                          <span className="block text-[8px] text-slate-400 font-extrabold uppercase tracking-widest">Index</span>
                        </div>
                      </div>
                      
                      {/* Category Badge */}
                      <span className={`text-[9px] px-3 py-1 rounded-full border font-black font-mono uppercase mt-4 tracking-wider transition-all duration-300 shadow-xs ${risk.badge}`}>
                        {risk.label}
                      </span>
                    </div>

                    {/* Text Assessment Column */}
                    <div className="md:col-span-2 space-y-4 flex flex-col justify-center text-left">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                          <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest font-mono">Cognitive Capacity Audit</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                          {triageResult.assessment}
                        </p>
                      </div>
                      <div className="border-t border-slate-100/80 pt-3 space-y-1">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest font-mono">Adaptive Mitigation Strategy</span>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {triageResult.advice}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Cognitive Workload Mini Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-bg-panel border border-border-primary p-3.5 rounded-2xl flex items-center space-x-3 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 text-left">
                      <div className="w-8.5 h-8.5 rounded-xl bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-100 dark:border-orange-900/40 shrink-0">
                        <Sliders className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-[11px] font-bold text-slate-900 leading-tight">Context-Switch Penalty</h5>
                        <p className="text-[9px] text-slate-400 font-medium">8.4h estimated multitasking tax</p>
                      </div>
                    </div>
                    <div className="bg-bg-panel border border-border-primary p-3.5 rounded-2xl flex items-center space-x-3 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 text-left">
                      <div className="w-8.5 h-8.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-100 dark:border-rose-900/40 shrink-0">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-[11px] font-bold text-slate-900 leading-tight">Critical Path Overlap</h5>
                        <p className="text-[9px] text-slate-400 font-medium">3 delivery milestones intersecting</p>
                      </div>
                    </div>
                    <div className="bg-bg-panel border border-border-primary p-3.5 rounded-2xl flex items-center space-x-3 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 text-left">
                      <div className="w-8.5 h-8.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/40 shrink-0">
                        <Coffee className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-[11px] font-bold text-slate-900 leading-tight">Attention Runway</h5>
                        <p className="text-[9px] text-slate-400 font-medium">Sustained runway: &lt; 12 hours</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Simulator & Choice Calibration */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  {/* Dynamic Capacity Progress Timeline Panel */}
                  <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 text-left">
                        <div className="flex items-center space-x-2">
                          <Sliders className="w-4 h-4 text-indigo-600" />
                          <span className="text-xs font-extrabold text-slate-900 font-mono uppercase tracking-widest">Score Calibration Path</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Toggle mitigations on the interactive cards below to formulate your safety score.
                        </p>
                      </div>
                      
                      <div className="flex items-baseline space-x-1 font-mono text-slate-400 select-none">
                        <span className="text-sm line-through font-semibold">{baseScore}</span>
                        <ChevronRight className="w-3.5 h-3.5 shrink-0 self-center text-slate-300" />
                        <span className={`text-2xl font-black transition-colors duration-300 ${risk.text}`}>{computedScore}</span>
                        <span className="text-[9px] font-extrabold uppercase tracking-wide">Index</span>
                      </div>
                    </div>
                    
                    {/* Progress Track */}
                    <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                      {/* Base score line (faded) */}
                      <div 
                        className="absolute top-0 bottom-0 left-0 bg-slate-200 rounded-full"
                        style={{ width: `${baseScore}%` }}
                      />
                      {/* Calibrated score line */}
                      <div 
                        className={`absolute top-0 bottom-0 left-0 rounded-full transition-all duration-500 ${
                          computedLevel === "CRITICAL" ? "bg-rose-500" :
                          computedLevel === "SEVERE" ? "bg-amber-500" :
                          computedLevel === "WATCH" ? "bg-yellow-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${computedScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Choice Selectors: Interactive Mitigation Cards */}
                  <div className="grid grid-cols-1 gap-4">
                    {/* Option 1: Focus Shield */}
                    <button
                      onClick={() => {
                        setShieldActive(!shieldActive);
                        showToast(shieldActive ? "Deactivated focus shields." : "Simulated 2h daily focus blocks (+15 capacity score)!");
                      }}
                      className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 relative group flex items-start justify-between gap-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 ${
                        shieldActive 
                          ? "bg-indigo-500/10 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 shadow-md" 
                          : "bg-bg-panel hover:bg-bg-hover border-border-primary hover:border-slate-300 dark:hover:border-slate-700 shadow-xs"
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 ${
                          shieldActive 
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20" 
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-border-primary group-hover:bg-bg-panel"
                        }`}>
                          <Shield className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Focus Shield Protocol</h4>
                            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border transition-all duration-300 ${
                              shieldActive 
                                ? "bg-indigo-100 text-indigo-700 border-indigo-200/40" 
                                : "bg-slate-100 text-slate-500 border-slate-200/40"
                            }`}>-15 Overload Index</span>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed max-w-md">
                            Integrate 2 hours of daily uninterrupted focus blocks. Automatically declines calendar collisions and preserves critical study windows.
                          </p>
                        </div>
                      </div>
                      
                      {/* Premium Toggle Button */}
                      <div className={`w-9 h-5.5 rounded-full p-0.5 transition-colors duration-300 shrink-0 ${
                        shieldActive ? "bg-indigo-600" : "bg-slate-200"
                      }`}>
                        <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-sm transform transition-transform duration-300 ${
                          shieldActive ? "translate-x-3.5" : "translate-x-0"
                        }`} />
                      </div>
                    </button>

                    {/* Option 2: Negotiate */}
                    <button
                      onClick={() => {
                        setRenegotiateActive(!renegotiateActive);
                        showToast(renegotiateActive ? "Reset deadline negotiations." : "Simulated renegotiation of 2 low-leverage items (+25 capacity score)!");
                      }}
                      className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 relative group flex items-start justify-between gap-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 ${
                        renegotiateActive 
                          ? "bg-indigo-500/10 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 shadow-md" 
                          : "bg-bg-panel hover:bg-bg-hover border-border-primary hover:border-slate-300 dark:hover:border-slate-700 shadow-xs"
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 ${
                          renegotiateActive 
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20" 
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-border-primary group-hover:bg-bg-panel"
                        }`}>
                          <Mail className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Contract Negotiation</h4>
                            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border transition-all duration-300 ${
                              renegotiateActive 
                                ? "bg-indigo-100 text-indigo-700 border-indigo-200/40" 
                                : "bg-slate-100 text-slate-500 border-slate-200/40"
                            }`}>-25 Overload Index</span>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed max-w-md">
                            Initiate automated communication drafts to renegotiate the delivery date for 2 low-leverage items, creating immediate breathing room.
                          </p>
                        </div>
                      </div>
                      
                      {/* Premium Toggle Button */}
                      <div className={`w-9 h-5.5 rounded-full p-0.5 transition-colors duration-300 shrink-0 ${
                        renegotiateActive ? "bg-indigo-600" : "bg-slate-200"
                      }`}>
                        <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-sm transform transition-transform duration-300 ${
                          renegotiateActive ? "translate-x-3.5" : "translate-x-0"
                        }`} />
                      </div>
                    </button>

                    {/* Option 3: Smart Snooze */}
                    <button
                      onClick={() => {
                        setSnoozeActive(!snoozeActive);
                        showToast(snoozeActive ? "Un-snoozed non-essential work." : "Simulated smart-snooze of nice-to-haves (+10 capacity score)!");
                      }}
                      className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 relative group flex items-start justify-between gap-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 ${
                        snoozeActive 
                          ? "bg-indigo-500/10 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 shadow-md" 
                          : "bg-bg-panel hover:bg-bg-hover border-border-primary hover:border-slate-300 dark:hover:border-slate-700 shadow-xs"
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 ${
                          snoozeActive 
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20" 
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-border-primary group-hover:bg-bg-panel"
                        }`}>
                          <Clock className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Smart Snooze Protocols</h4>
                            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border transition-all duration-300 ${
                              snoozeActive 
                                ? "bg-indigo-100 text-indigo-700 border-indigo-200/40" 
                                : "bg-slate-100 text-slate-500 border-slate-200/40"
                            }`}>-10 Overload Index</span>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed max-w-md">
                            Smart-mute non-essential alarms, system alerts, and notification channels. Postpones nice-to-have secondary checklist items.
                          </p>
                        </div>
                      </div>
                      
                      {/* Premium Toggle Button */}
                      <div className={`w-9 h-5.5 rounded-full p-0.5 transition-colors duration-300 shrink-0 ${
                        snoozeActive ? "bg-indigo-600" : "bg-slate-200"
                      }`}>
                        <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-sm transform transition-transform duration-300 ${
                          snoozeActive ? "translate-x-3.5" : "translate-x-0"
                        }`} />
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Action Execution Plan */}
              {currentStep === 3 && (
                <div className="space-y-4 pt-2 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest font-mono">Recommended Interventions</h4>
                    
                    {/* Filters / Tags */}
                    <div className="flex items-center space-x-1 bg-slate-100/80 dark:bg-slate-950/40 p-1 rounded-xl border border-border-subtle shrink-0">
                      <button
                        onClick={() => setActiveTab("all")}
                        className={`px-3 py-1 rounded-lg text-[9px] font-bold font-mono uppercase tracking-wider transition-all duration-150 active:scale-[0.97] cursor-pointer ${
                          activeTab === "all" 
                            ? "bg-bg-panel text-slate-900 shadow-sm border border-border-primary" 
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        All ({triageResult.allocations.length})
                      </button>
                      <button
                        onClick={() => setActiveTab("renegotiate")}
                        className={`px-3 py-1 rounded-lg text-[9px] font-bold font-mono uppercase tracking-wider transition-all duration-150 active:scale-[0.97] cursor-pointer ${
                          activeTab === "renegotiate" 
                            ? "bg-bg-panel text-slate-900 shadow-sm border border-border-primary" 
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Renegotiate
                      </button>
                      <button
                        onClick={() => setActiveTab("shield")}
                        className={`px-3 py-1 rounded-lg text-[9px] font-bold font-mono uppercase tracking-wider transition-all duration-150 active:scale-[0.97] cursor-pointer ${
                          activeTab === "shield" 
                            ? "bg-bg-panel text-slate-900 shadow-sm border border-border-primary" 
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Shield
                      </button>
                      <button
                        onClick={() => setActiveTab("snooze")}
                        className={`px-3 py-1 rounded-lg text-[9px] font-bold font-mono uppercase tracking-wider transition-all duration-150 active:scale-[0.97] cursor-pointer ${
                          activeTab === "snooze" 
                            ? "bg-bg-panel text-slate-900 shadow-sm border border-border-primary" 
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Snooze
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                    {filteredAllocations.length > 0 ? (
                      filteredAllocations.map((allocation, index) => {
                        const associatedTask = tasks.find((t) => t.id === allocation.taskId);
                        const taskTitle = associatedTask?.title || (allocation.taskId && typeof allocation.taskId === "string" ? `Task #${allocation.taskId.slice(0, 4)}` : "Unnamed Task");
                        const safeAction = typeof allocation.action === "string" ? allocation.action : "view_task";
                        
                        return (
                          <div 
                            key={index} 
                            className="bg-bg-panel border border-border-primary p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover-card-glow hover:border-slate-300 dark:hover:border-slate-700 shadow-xs transition-all duration-200 text-left group"
                          >
                            <div className="flex items-start space-x-3.5">
                              {/* Vertical accent priority bar */}
                              <div className={`w-1 self-stretch rounded-full shrink-0 ${
                                safeAction === "start_now" || safeAction === "shield_calendar"
                                  ? "bg-rose-500"
                                  : safeAction === "renegotiate"
                                    ? "bg-amber-500"
                                    : "bg-blue-500"
                              }`} />
                              
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                  <span className={`text-[8px] px-2 py-0.5 rounded-md font-black font-mono uppercase tracking-wider border shrink-0 ${
                                    safeAction === "start_now" || safeAction === "shield_calendar"
                                      ? "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30"
                                      : safeAction === "renegotiate"
                                        ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30"
                                        : "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30"
                                  }`}>
                                    {safeAction.replace("_", " ")}
                                  </span>
                                  <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition line-clamp-1">{taskTitle}</span>
                                </div>
                                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{allocation.reason}</p>
                              </div>
                            </div>

                            <div className="shrink-0 flex items-center">
                              {safeAction === "renegotiate" && associatedTask ? (
                                <button
                                  id={`triage-action-renegotiate-button-${allocation.taskId || index}`}
                                  onClick={() => {
                                    onClose();
                                    setSelectedTask(associatedTask);
                                    showToast(`Selected: ${associatedTask.title}. Open details to view draft artifacts.`);
                                  }}
                                  className="btn-interactive w-full sm:w-auto px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-400 text-[10px] font-black font-mono uppercase tracking-wider border border-amber-100 dark:border-amber-900/30 transition duration-150 active:scale-[0.97] flex items-center justify-center space-x-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
                                >
                                  <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                                  <span>Get Draft Email</span>
                                </button>
                              ) : (safeAction === "start_now" || safeAction === "shield_calendar") && associatedTask ? (
                                <button
                                  id={`triage-action-shield-calendar-button-${allocation.taskId || index}`}
                                  onClick={async () => {
                                    onClose();
                                    setSelectedTask(associatedTask);
                                    showToast("Booking focus blocks on Google Calendar...");
                                  }}
                                  className="btn-interactive w-full sm:w-auto px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-400 text-[10px] font-black font-mono uppercase tracking-wider border border-rose-100 dark:border-rose-900/30 transition duration-150 active:scale-[0.97] flex items-center justify-center space-x-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
                                >
                                  <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                                  <span>Shield Calendar</span>
                                </button>
                              ) : (
                                <button
                                  id={`triage-action-view-task-button-${allocation.taskId || index}`}
                                  onClick={() => {
                                    onClose();
                                    if (associatedTask) setSelectedTask(associatedTask);
                                  }}
                                  className="btn-interactive w-full sm:w-auto px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 text-[10px] font-black font-mono uppercase tracking-wider border border-blue-100 dark:border-blue-900/30 transition duration-150 active:scale-[0.97] flex items-center justify-center space-x-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                >
                                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                                  <span>View task</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-10 bg-bg-panel border border-border-subtle rounded-2xl text-slate-400 text-xs font-medium">
                        No recommended allocations match this category.
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="text-center py-16 bg-bg-panel border border-border-subtle rounded-2xl text-slate-400 text-xs font-medium space-y-2">
              <Sparkles className="w-8 h-8 text-slate-300 mx-auto animate-pulse" />
              <p>No active overload triage report generated yet.</p>
            </div>
          )}
        </div>

        {/* Step Navigation Control Panel */}
        {triageResult && !triaging && (
          <div className="px-6 py-4 bg-bg-panel border-t border-border-primary flex items-center justify-between z-10 relative select-none">
            <div>
              {currentStep > 1 ? (
                <button
                  onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
                  className="btn-interactive px-4 py-2 rounded-xl border border-border-primary bg-bg-panel hover:bg-bg-hover text-slate-600 font-mono text-[10px] font-black uppercase tracking-wider transition-all duration-150 active:scale-[0.97] cursor-pointer flex items-center space-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                >
                  <span>Back</span>
                </button>
              ) : (
                <div className="w-1" /> // Spacer to preserve alignment
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-[10px] font-mono text-slate-400 font-extrabold uppercase tracking-wider">
                Step {currentStep} of 3
              </span>
              {currentStep < 3 ? (
                <button
                  onClick={() => setCurrentStep((prev) => (prev + 1) as any)}
                  className="btn-interactive px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-[10px] font-black uppercase tracking-wider transition-all duration-150 active:scale-[0.97] cursor-pointer flex items-center space-x-1 shadow-md shadow-indigo-600/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="btn-interactive px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-[10px] font-black uppercase tracking-wider transition-all duration-150 active:scale-[0.97] cursor-pointer flex items-center space-x-1 shadow-md shadow-indigo-600/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                >
                  <span>Apply & Exit</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Footer info bar */}
        <div className="px-6 py-4.5 bg-bg-dialog/50 border-t border-border-primary flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span className="flex items-center space-x-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Interactive Simulator leverages real capacity weightings</span>
          </span>
          <span className="hidden sm:inline">Powered by Gemini 1.5 Pro</span>
        </div>
      </div>
    </div>
  );
};
