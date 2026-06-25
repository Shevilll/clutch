import React, { useState, useMemo, useRef } from "react";
import { 
  Sparkles, 
  BookOpen, 
  RefreshCw, 
  Plus, 
  Clock, 
  Edit2, 
  Check, 
  CheckCircle,
  FileText,
  Send,
  Calendar,
  Sliders,
  ListTodo,
  AlertCircle,
  CheckCircle2,
  UploadCloud,
  ChevronRight,
  ShieldAlert,
  Zap,
  Search,
  AlertTriangle,
  AlertOctagon,
  Info,
  SlidersHorizontal,
  Bookmark
} from "lucide-react";

interface Subtask {
  title: string;
  done: boolean;
  effortMins: number;
}

interface Task {
  id: string;
  title: string;
  riskBand: "critical" | "high" | "medium" | "low" | string;
  riskScore: number;
  deadline: any;
  estimatedEffortMins: number;
  description?: string;
  subtasks?: Subtask[];
  progress: number;
  type: string;
}

interface TasksTabProps {
  tasks: Task[];
  loadingTasks: boolean;
  syncingClassroom: boolean;
  handleSyncClassroom: () => Promise<void>;
  triggerSeeder: () => Promise<void>;
  setSelectedTask: (task: Task) => void;
  getDeadlineDate: (task: any) => Date;
  getDeadlineCountdown: (date: Date) => string;
  getRiskStyles: (band: string) => string;
  onRenameTask: (taskId: string, newTitle: string) => Promise<void>;
  
  // Ingest/Capture states & handlers
  inputText: string;
  setInputText: (text: string) => void;
  capturing: boolean;
  captureError: string | null;
  handleCapture: (e: React.FormEvent) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadingImage: boolean;
  imageUrl: string | null;
  setImageUrl: (url: string | null) => void;
  setImageBase64: (base64: string | null) => void;
}

export default function TasksTab({
  tasks,
  loadingTasks,
  syncingClassroom,
  handleSyncClassroom,
  triggerSeeder,
  setSelectedTask,
  getDeadlineDate,
  getDeadlineCountdown,
  getRiskStyles,
  onRenameTask,
  
  inputText,
  setInputText,
  capturing,
  captureError,
  handleCapture,
  handleImageUpload,
  uploadingImage,
  imageUrl,
  setImageUrl,
  setImageBase64
}: TasksTabProps) {
  // Drag & drop file capture state
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inline Title Editing States
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitleText, setEditingTitleText] = useState("");
  const [savingTitle, setSavingTitle] = useState(false);

  // Interactive filtering states
  const [activeFilter, setActiveFilter] = useState<"all" | "critical" | "high" | "medium" | "low" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Group tasks by day label
  const getDayLabel = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
    }
  };

  // Filter tasks dynamically using filter and search states
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // 1. Filter by active tab
      if (activeFilter === "critical" && task.riskBand !== "critical") return false;
      if (activeFilter === "high" && task.riskBand !== "high") return false;
      if (activeFilter === "medium" && task.riskBand !== "medium") return false;
      if (activeFilter === "low" && task.riskBand !== "low") return false;
      if (activeFilter === "completed" && task.progress !== 1) return false;
      
      // 2. Filter by search query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const titleMatch = task.title.toLowerCase().includes(query);
        const descMatch = task.description?.toLowerCase().includes(query) || false;
        const typeMatch = task.type.toLowerCase().includes(query);
        const riskMatch = task.riskBand.toLowerCase().includes(query);
        if (!titleMatch && !descMatch && !typeMatch && !riskMatch) return false;
      }
      return true;
    });
  }, [tasks, activeFilter, searchQuery]);

  // Compute stats for filter tabs
  const filterCounts = useMemo(() => {
    return {
      all: tasks.length,
      critical: tasks.filter((t) => t.riskBand === "critical").length,
      high: tasks.filter((t) => t.riskBand === "high").length,
      medium: tasks.filter((t) => t.riskBand === "medium").length,
      low: tasks.filter((t) => t.riskBand === "low").length,
      completed: tasks.filter((t) => t.progress === 1).length,
    };
  }, [tasks]);

  const groupedTasks = useMemo(() => {
    const grouped: { [key: string]: Task[] } = {};
    
    // Sort tasks: high riskScore/riskBand first
    const sortedTasks = [...filteredTasks].sort((a, b) => {
      const bandWeights: { [key: string]: number } = { critical: 4, high: 3, medium: 2, low: 1 };
      const weightA = bandWeights[a.riskBand] || 0;
      const weightB = bandWeights[b.riskBand] || 0;
      if (weightB !== weightA) return weightB - weightA;
      return b.riskScore - a.riskScore;
    });

    sortedTasks.forEach((task) => {
      const date = getDeadlineDate(task);
      const label = getDayLabel(date);
      if (!grouped[label]) {
        grouped[label] = [];
      }
      grouped[label].push(task);
    });
    
    return grouped;
  }, [filteredTasks, getDeadlineDate]);

  // Consistent stroke width Lucide Icons
  const getTaskIcon = (type: string) => {
    const commonProps = { className: "w-4 h-4 text-indigo-500", strokeWidth: 1.5 };
    switch (type) {
      case "assignment": return <FileText {...commonProps} />;
      case "email": return <Send {...commonProps} className="w-4 h-4 text-emerald-500" />;
      case "meeting": return <Calendar {...commonProps} className="w-4 h-4 text-amber-500" />;
      case "bill": return <ShieldAlert {...commonProps} className="w-4 h-4 text-rose-500" />;
      case "interview": return <Sliders {...commonProps} className="w-4 h-4 text-violet-500" />;
      default: return <ListTodo {...commonProps} className="w-4 h-4 text-slate-500" />;
    }
  };

  // Border and shadow styling reflecting the risk band on the task card dynamically
  const getCardRiskStyles = (band: string) => {
    switch (band) {
      case "critical":
        return "border-rose-100 hover:border-rose-300 hover:shadow-[0_12px_32px_rgba(244,63,94,0.06)] bg-gradient-to-br from-white to-rose-50/10";
      case "high":
        return "border-orange-100 hover:border-orange-300 hover:shadow-[0_12px_32px_rgba(249,115,22,0.06)] bg-gradient-to-br from-white to-orange-50/10";
      case "medium":
        return "border-amber-100 hover:border-amber-300 hover:shadow-[0_12px_32px_rgba(245,158,11,0.06)] bg-gradient-to-br from-white to-amber-50/10";
      case "low":
        return "border-emerald-100 hover:border-emerald-300 hover:shadow-[0_12px_32px_rgba(16,185,129,0.06)] bg-gradient-to-br from-white to-emerald-50/10";
      default:
        return "border-slate-100 hover:border-indigo-200 hover:shadow-[0_12px_32px_rgba(99,102,241,0.06)] bg-gradient-to-br from-white to-slate-50/10";
    }
  };

  // Bespoke high-contrast badges with specific icons instead of raw un-iconed badges
  const getRiskBadge = (band: string) => {
    const commonClasses = "text-[9px] px-2.5 py-1 rounded-full font-bold font-mono uppercase tracking-wider flex items-center shrink-0 shadow-sm transition-all duration-150";
    switch (band) {
      case "critical": 
        return (
          <span className={`${commonClasses} bg-rose-50 text-rose-700`}>
            <AlertOctagon className="w-3 h-3 mr-1 text-rose-500" />
            Critical
          </span>
        );
      case "high": 
        return (
          <span className={`${commonClasses} bg-orange-50 text-orange-700`}>
            <AlertTriangle className="w-3 h-3 mr-1 text-orange-500" />
            High
          </span>
        );
      case "medium": 
        return (
          <span className={`${commonClasses} bg-amber-50 text-amber-700`}>
            <Info className="w-3 h-3 mr-1 text-amber-500" />
            Medium
          </span>
        );
      case "low": 
        return (
          <span className={`${commonClasses} bg-emerald-50 text-emerald-700`}>
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
            Low
          </span>
        );
      default: 
        return (
          <span className={`${commonClasses} bg-slate-50 text-slate-700`}>
            <BookOpen className="w-3 h-3 mr-1 text-slate-500" />
            {band}
          </span>
        );
    }
  };

  // Drag and drop event handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        const fakeEvent = {
          target: {
            files: e.dataTransfer.files
          }
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        handleImageUpload(fakeEvent);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Start inline title editing
  const startEditing = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation(); // prevent opening drawer when initiating rename
    setEditingTaskId(task.id);
    setEditingTitleText(task.title);
  };

  // Save renamed title
  const handleSaveTitle = async (taskId: string) => {
    if (editingTitleText.trim() === "") {
      setEditingTaskId(null);
      return;
    }
    setSavingTitle(true);
    try {
      await onRenameTask(taskId, editingTitleText.trim());
    } catch (err) {
      console.error("Failed to rename task title:", err);
    } finally {
      setSavingTitle(false);
      setEditingTaskId(null);
    }
  };

  const filterTabs = [
    { key: "all", label: "All", count: filterCounts.all, activeStyles: "bg-indigo-50/80 text-indigo-700 shadow-[0_2px_8px_rgba(99,102,241,0.08)] border-transparent", inactiveStyles: "bg-slate-50/50 hover:bg-slate-100/80 text-slate-600 border-transparent shadow-[0_1px_2px_rgba(0,0,0,0.02)]" },
    { key: "critical", label: "Critical", count: filterCounts.critical, activeStyles: "bg-rose-50/80 text-rose-700 shadow-[0_2px_8px_rgba(244,63,94,0.08)] border-transparent", inactiveStyles: "bg-slate-50/50 hover:bg-rose-50/40 text-slate-600 hover:text-rose-700 border-transparent shadow-[0_1px_2px_rgba(0,0,0,0.02)]" },
    { key: "high", label: "High", count: filterCounts.high, activeStyles: "bg-orange-50/80 text-orange-700 shadow-[0_2px_8px_rgba(249,115,22,0.08)] border-transparent", inactiveStyles: "bg-slate-50/50 hover:bg-orange-50/40 text-slate-600 hover:text-orange-700 border-transparent shadow-[0_1px_2px_rgba(0,0,0,0.02)]" },
    { key: "medium", label: "Medium", count: filterCounts.medium, activeStyles: "bg-amber-50/80 text-amber-700 shadow-[0_2px_8px_rgba(245,158,11,0.08)] border-transparent", inactiveStyles: "bg-slate-50/50 hover:bg-amber-50/40 text-slate-600 hover:text-amber-700 border-transparent shadow-[0_1px_2px_rgba(0,0,0,0.02)]" },
    { key: "low", label: "Low", count: filterCounts.low, activeStyles: "bg-emerald-50/80 text-emerald-700 shadow-[0_2px_8px_rgba(16,185,129,0.08)] border-transparent", inactiveStyles: "bg-slate-50/50 hover:bg-emerald-50/40 text-slate-600 hover:text-emerald-700 border-transparent shadow-[0_1px_2px_rgba(0,0,0,0.02)]" },
    { key: "completed", label: "Completed", count: filterCounts.completed, activeStyles: "bg-sky-50/80 text-sky-700 shadow-[0_2px_8px_rgba(14,165,233,0.08)] border-transparent", inactiveStyles: "bg-slate-50/50 hover:bg-sky-50/40 text-slate-600 hover:text-sky-700 border-transparent shadow-[0_1px_2px_rgba(0,0,0,0.02)]" }
  ] as const;

  return (
    <div className="space-y-8 animate-fade-in bg-gradient-to-b from-slate-50/40 via-white/80 to-slate-50/30 min-h-screen p-6 md:p-8 text-slate-800 rounded-3xl border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.01)]">
      
      {/* HEADER SECTION WITH CLASSRoom SYNC */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 font-mono flex items-center space-x-1.5">
            <Bookmark className="w-3.5 h-3.5" />
            <span>Commitment Dashboard</span>
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Task Ingest & Structure
          </h2>
        </div>

        <button
          onClick={handleSyncClassroom}
          disabled={syncingClassroom}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-bg-panel text-slate-700 hover:text-slate-900 border border-border-primary transition-all duration-200 active:scale-[0.97] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-indigo-50/30"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${syncingClassroom ? "animate-spin text-indigo-600" : ""}`} />
          <span>{syncingClassroom ? "Syncing Classroom..." : "Sync Google Classroom"}</span>
        </button>
      </div>

      {/* MULTIMODAL CHAOS CAPTURE BOX */}
      <div className="bg-bg-panel border border-border-subtle rounded-3xl p-6 md:p-8 shadow-md space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-50/50 border border-indigo-100/50 text-indigo-600 rounded-xl shadow-sm">
              <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                Multimodal Chaos Capture
              </h3>
              <p className="text-[11px] text-slate-400 font-semibold font-sans mt-0.5">Gemini Ingestion Engine</p>
            </div>
          </div>
          <span className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-100/40 px-3 py-1 rounded-full font-mono font-bold flex items-center space-x-1.5">
            <Zap className="w-3 h-3 text-indigo-500 fill-indigo-500/10 animate-pulse" />
            <span>v2 Ingest</span>
          </span>
        </div>

        <form onSubmit={handleCapture} className="space-y-5">
          <div className="flex flex-col space-y-4">
            {/* Input Text Area with soft shadow & focus glow */}
            <textarea
              id="chaos-capture-textarea"
              aria-label="Paste raw task text, notes or syllabus details"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste anything, snap a photo, or drop a syllabus: e.g., 'hey we have the algo essay due tomorrow 9am 1500 words on greedy vs dp, and ER diagram fri...'"
              className="w-full bg-slate-50/60 border-0 rounded-2xl px-5 py-4 text-xs text-slate-800 placeholder:text-slate-400 font-sans shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.03)] transition-all duration-300 ease-out focus:bg-bg-panel focus:outline-none focus:shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.01),0_0_0_3px_rgba(99,102,241,0.08)] min-h-[120px] disabled:opacity-60"
              disabled={capturing}
            />

            {/* File drag-and-drop zone */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`group rounded-2xl p-6 transition-all duration-300 ease-out flex flex-col md:flex-row items-center justify-between gap-4 border border-dashed ${
                isDragActive 
                  ? "bg-indigo-50/50 border-indigo-300 shadow-[0_0_0_2px_rgba(99,102,241,0.1)]" 
                  : "bg-slate-50/40 border-border-subtle hover:bg-bg-hover hover:border-indigo-200 shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]"
              }`}
            >
              {/* Drag & Drop Visual Indicator & Photo Attach button */}
              <div className="flex items-center space-x-3 w-full md:w-auto">
                <input 
                  ref={fileInputRef}
                  id="chaos-capture-file-input"
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="hidden" 
                  disabled={capturing || uploadingImage} 
                />
                <button
                  type="button"
                  onClick={triggerFileInput}
                  disabled={capturing || uploadingImage}
                  className="px-4 py-2.5 rounded-xl bg-bg-panel border border-border-primary text-xs text-slate-700 hover:text-indigo-600 font-bold transition-all duration-200 cursor-pointer flex items-center space-x-2 active:scale-[0.97] focus:outline-none"
                >
                  <UploadCloud className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                  <span>{imageUrl ? "Image Attached" : "Upload Syllabus Photo"}</span>
                </button>

                {imageUrl && (
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden border-0 shrink-0 shadow-md animate-scale-up group">
                    <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                    <button 
                      id="chaos-capture-clear-image-button"
                      type="button" 
                      onClick={() => { setImageUrl(null); setImageBase64(null); }}
                      className="absolute inset-0 bg-slate-950/80 flex items-center justify-center text-red-400 text-[9px] font-extrabold uppercase opacity-0 hover:opacity-100 transition-opacity duration-200 focus:outline-none active:scale-[0.97]"
                    >
                      Clear
                    </button>
                  </div>
                )}

                {uploadingImage && (
                  <span className="text-xs text-indigo-600 animate-pulse font-semibold">Ingesting photo details...</span>
                )}
              </div>

              <div className="text-[11px] text-slate-400 font-semibold font-sans text-center md:text-right hidden md:block">
                Drag syllabus PDF or images directly here
              </div>
            </div>
          </div>

          {captureError && (
            <div className="p-4 bg-red-50/80 border border-transparent text-xs text-red-600 rounded-xl flex items-center space-x-2.5 animate-shake shadow-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-semibold">{captureError}</span>
            </div>
          )}

          <div className="flex items-center justify-end">
            <button
              id="chaos-capture-submit-button"
              type="submit"
              disabled={capturing || uploadingImage}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all duration-200 shadow-[0_4px_16px_rgba(99,102,241,0.2)] hover:shadow-[0_6px_24px_rgba(99,102,241,0.35)] flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.95] focus:outline-none focus:ring-4 focus:ring-indigo-100"
            >
              {capturing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Running Ingest...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Capture Commitments</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* SEARCH AND INTERACTIVE TAB FILTERS CONTAINER */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          
          {/* Search bar with subtle borderless shadow design */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search commitments by title or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50/50 border-0 rounded-2xl pl-11 pr-4 py-3 text-xs text-slate-800 placeholder:text-slate-400 font-sans shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-300 ease-out focus:bg-bg-panel focus:outline-none focus:shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.01),0_0_0_3px_rgba(99,102,241,0.08)]"
            />
          </div>

          {/* Inline Indicator of matches */}
          {searchQuery && (
            <div className="text-xs text-slate-400 font-medium font-sans flex items-center self-center">
              <span>Found {filteredTasks.length} matched commitments</span>
            </div>
          )}
        </div>

        {/* Tab Filters with elegant micro-interactive pills */}
        <div className="flex flex-wrap gap-2.5 pb-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-[0.97] cursor-pointer border flex items-center space-x-1.5 ${
                activeFilter === tab.key ? tab.activeStyles : tab.inactiveStyles
              }`}
            >
              <span className="capitalize">{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold font-mono ${
                activeFilter === tab.key 
                  ? "bg-black/10 text-current" 
                  : "bg-slate-100 text-slate-500"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* TASKS LIST GROUPED BY DAY */}
      <div className="space-y-6">
        {loadingTasks ? (
          <div className="py-20 text-center space-y-4 bg-bg-panel rounded-3xl border border-border-subtle">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-mono uppercase tracking-widest font-bold">Retrieving commitments...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-bg-panel rounded-3xl p-16 text-center space-y-5 max-w-xl mx-auto border border-border-subtle">
            <div className="w-14 h-14 bg-emerald-50/50 rounded-full flex items-center justify-center mx-auto shadow-[inset_0_1px_2px_rgba(16,185,129,0.05)]">
              <CheckCircle className="w-7 h-7 text-emerald-500" strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-slate-900 tracking-tight">
                {searchQuery || activeFilter !== "all" ? "No matches found" : "Nothing is on fire. Yet."}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                {searchQuery || activeFilter !== "all" 
                  ? "Try clearing your search query or switching filters to see more tasks." 
                  : "Paste a syllabus snippet, forward an email, or snap a photo of an assignment board. Or click below to instantly load Aarav's overcommitted student scenario."}
              </p>
            </div>
            {(!searchQuery && activeFilter === "all") ? (
              <button
                id="tasks-board-load-demo-button"
                onClick={() => triggerSeeder()}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all duration-200 shadow-[0_4px_16px_rgba(99,102,241,0.2)] hover:shadow-[0_6px_24px_rgba(99,102,241,0.35)] mx-auto block cursor-pointer active:scale-[0.97] focus:outline-none focus:ring-4 focus:ring-indigo-50"
              >
                Load Demo Scenario
              </button>
            ) : (
              <button
                onClick={() => { setSearchQuery(""); setActiveFilter("all"); }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all duration-200 mx-auto block cursor-pointer active:scale-[0.97]"
              >
                Reset Search Filters
              </button>
            )}
          </div>
        ) : (
          Object.keys(groupedTasks).map((dayLabel) => {
            if (groupedTasks[dayLabel].length === 0) return null;
            return (
              <div key={dayLabel} className="space-y-4">
                {/* Day Section Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest font-mono">
                    {dayLabel}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono bg-bg-panel px-2.5 py-0.5 border border-border-subtle rounded-lg font-bold shadow-sm">
                    {groupedTasks[dayLabel].length} {groupedTasks[dayLabel].length === 1 ? "task" : "tasks"}
                  </span>
                </div>

                {/* Grid of Task Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedTasks[dayLabel].map((task) => (
                    <div
                      id={`tasks-board-task-card-${task.id}`}
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { 
                        if (e.key === "Enter" || e.key === " ") { 
                          e.preventDefault(); 
                          setSelectedTask(task); 
                        } 
                      }}
                      className={`bg-bg-panel border border-border-subtle p-5 rounded-3xl cursor-pointer flex flex-col justify-between group h-52 relative hover:scale-[1.015] hover:-translate-y-1 transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100 select-none overflow-hidden active:scale-[0.97] ${getCardRiskStyles(task.riskBand)}`}
                    >
                      {/* Top Section */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          {getRiskBadge(task.riskBand)}
                          
                          <span className="text-[10px] text-slate-500 flex items-center space-x-1.5 font-mono font-bold bg-slate-50/80 px-2.5 py-1 border border-slate-100 rounded-full shadow-sm">
                            <Clock className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
                            <span>{getDeadlineCountdown(getDeadlineDate(task))}</span>
                          </span>
                        </div>

                        {/* Inline Title Editing Container */}
                        {editingTaskId === task.id ? (
                          <div className="relative z-10" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={editingTitleText}
                              onChange={(e) => setEditingTitleText(e.target.value)}
                              onBlur={() => handleSaveTitle(task.id)}
                              onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSaveTitle(task.id);
                                  if (e.key === "Escape") setEditingTaskId(null);
                              }}
                              autoFocus
                              disabled={savingTitle}
                              className="w-full text-xs font-bold text-slate-800 bg-slate-55 border border-indigo-200/80 rounded-xl px-3 py-2 focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition duration-150 active:scale-[0.97]"
                            />
                            {savingTitle && (
                              <div className="absolute right-2.5 top-2.5">
                                <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="group/title flex items-start justify-between gap-1.5">
                            <h5 className="text-xs md:text-[13px] font-bold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors duration-150 line-clamp-2 pr-4 font-sans">
                              {task.title}
                            </h5>
                            {/* Tactile Pencil Trigger for Inline edit */}
                            <button
                              onClick={(e) => startEditing(e, task)}
                              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-200/85 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all duration-200 shrink-0 cursor-pointer focus:opacity-100 active:scale-[0.97]"
                              title="Rename task title inline"
                              aria-label={`Rename ${task.title}`}
                            >
                              <Edit2 className="w-3 h-3" strokeWidth={2.5} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Bottom Section */}
                      <div className="space-y-3 pt-3 border-t border-slate-100">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
                          <span className="flex items-center space-x-1.5">
                            {getTaskIcon(task.type)}
                            <span className="capitalize">{task.type}</span>
                          </span>
                          <span className="bg-slate-50/80 border border-slate-100 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold text-slate-600 shadow-sm">
                            {task.estimatedEffortMins}m effort
                          </span>
                        </div>

                        {/* Gorgeous Shimmering Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 font-mono">
                            <span>Progress</span>
                            <span className="text-indigo-600 font-bold">{Math.round(task.progress * 100)}%</span>
                          </div>
                          <div className="w-full bg-slate-100/70 rounded-full h-1 overflow-hidden relative">
                            <div
                              className={`h-full rounded-full transition-all duration-[500ms] ease-out ${
                                task.progress === 1 
                                  ? "bg-gradient-to-r from-emerald-400 to-teal-500" 
                                  : "bg-gradient-to-r from-indigo-500 to-violet-600"
                              }`}
                              style={{ width: `${task.progress * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
