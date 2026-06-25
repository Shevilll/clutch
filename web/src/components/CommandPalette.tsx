import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Search, 
  Flame, 
  Shield, 
  Terminal, 
  Activity, 
  TrendingUp, 
  Sliders, 
  Database, 
  RefreshCw, 
  BookOpen, 
  X, 
  Sparkles,
  Command,
  FileText
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: any[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setSelectedTask: (task: any) => void;
  triggerSeeder: () => void;
  handleSyncClassroom?: () => void;
  handleConnectGoogle?: () => void;
  showToast: (msg: string) => void;
}

// Unified Command Item Interface to ensure strict Type Safety
interface CommandItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  icon: React.ReactNode;
  action: () => void;
  riskBand?: string;
}

// Highly tactile, bespoke Keyboard Shortcut Keycap Component
function Kbd({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd className={`inline-flex items-center justify-center px-1.5 py-0.5 min-w-[20px] font-sans text-[10px] font-bold text-slate-500 bg-gradient-to-b from-white to-slate-50/80 border border-slate-200 border-b-[2px] border-b-slate-300/80 rounded-[5px] shadow-[0_1px_1px_rgba(0,0,0,0.04),_0_1px_0_rgba(0,0,0,0.02),_inset_0_1px_0_rgba(255,255,255,0.8)] tracking-wide select-none transition-all ${className}`}>
      {children}
    </kbd>
  );
}

export default function CommandPalette({
  isOpen,
  onClose,
  tasks,
  activeTab,
  setActiveTab,
  setSelectedTask,
  triggerSeeder,
  handleSyncClassroom,
  handleConnectGoogle,
  showToast
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemsContainerRef = useRef<HTMLDivElement>(null);

  // Transition mount & animation states for premium floating entrance/exit
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [animateIn, setAnimateIn] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setQuery("");
      setSelectedIndex(0);
      document.body.style.overflow = "hidden";
      const timer = setTimeout(() => {
        setAnimateIn(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setAnimateIn(false);
      document.body.style.overflow = "";
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 200); // matches the transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Helper to highlight matching characters dynamically
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={i} className="text-indigo-600 font-semibold bg-indigo-50/85 px-0.5 rounded-[3px]">
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  // Static Navigation Commands (Descriptions added, Emojis eradicated)
  const navigationCommands = useMemo<CommandItem[]>(() => [
    { 
      id: "nav-today", 
      title: "Go to Morning Briefing Today Tab", 
      description: "Access your personalized agenda, habits, and daily overview",
      category: "Navigation", 
      icon: <Activity className="w-4.5 h-4.5 text-indigo-500" strokeWidth={1.5} />, 
      action: () => setActiveTab("today") 
    },
    { 
      id: "nav-tasks", 
      title: "Go to Tasks Board", 
      description: "Organize, schedule, and prioritize your active academic workload",
      category: "Navigation", 
      icon: <FileText className="w-4.5 h-4.5 text-emerald-500" strokeWidth={1.5} />, 
      action: () => setActiveTab("tasks") 
    },
    { 
      id: "nav-agent", 
      title: "Go to Autonomous Agent Loop", 
      description: "Review current automated strategy and self-healing agent routines",
      category: "Navigation", 
      icon: <Terminal className="w-4.5 h-4.5 text-purple-500" strokeWidth={1.5} />, 
      action: () => setActiveTab("agent") 
    },
    { 
      id: "nav-insights", 
      title: "Go to Impact & Insights Charts", 
      description: "Analyze academic load metrics, risk indicators, and trends",
      category: "Navigation", 
      icon: <TrendingUp className="w-4.5 h-4.5 text-blue-500" strokeWidth={1.5} />, 
      action: () => setActiveTab("insights") 
    },
    { 
      id: "nav-hood", 
      title: "Go to Under the Hood Settings", 
      description: "Configure developer variables, resets, and integrations",
      category: "Navigation", 
      icon: <Sliders className="w-4.5 h-4.5 text-slate-500" strokeWidth={1.5} />, 
      action: () => setActiveTab("hood") 
    }
  ], [setActiveTab]);

  // Administrative Commands (Descriptions added, Emojis eradicated)
  const administrativeCommands = useMemo<CommandItem[]>(() => [
    { 
      id: "action-seed", 
      title: "Trigger Seeder (Load Aarav's Demo Commitments)", 
      description: "Seed high-fidelity classroom and workload simulation data",
      category: "System Actions", 
      icon: <Database className="w-4.5 h-4.5 text-indigo-500" strokeWidth={1.5} />, 
      action: () => {
        triggerSeeder();
        showToast("Seeding fresh demo commitments...");
      } 
    },
    { 
      id: "action-classroom", 
      title: "Sync Google Classroom Coursework", 
      description: "Fetch real-time student homework lists and assignments",
      category: "System Actions", 
      icon: <BookOpen className="w-4.5 h-4.5 text-emerald-500" strokeWidth={1.5} />, 
      action: () => {
        if (handleSyncClassroom) {
          handleSyncClassroom();
        } else {
          showToast("Google Classroom sync triggered successfully.");
        }
      } 
    },
    { 
      id: "action-google", 
      title: "Connect Google Services (Calendar / Docs / Gmail)", 
      description: "Authorize workspace integrations for seamless sync operations",
      category: "System Actions", 
      icon: <RefreshCw className="w-4.5 h-4.5 text-indigo-500" strokeWidth={1.5} />, 
      action: () => {
        if (handleConnectGoogle) {
          handleConnectGoogle();
        } else {
          showToast("Authenticating and connecting Google workspace...");
        }
      } 
    },
    { 
      id: "action-celebrate", 
      title: "Trigger Streak Rescue Celebration", 
      description: "Boost the defensive habit tracker and run animation",
      category: "System Actions", 
      icon: <Flame className="w-4.5 h-4.5 text-orange-500" strokeWidth={1.5} />, 
      action: () => {
        showToast("Congratulations! Keep guarding your streak!");
        const originalStreak = localStorage.getItem("clutch_streak");
        const currentNum = originalStreak ? parseInt(originalStreak, 10) : 5;
        localStorage.setItem("clutch_streak", (currentNum + 1).toString());
        window.dispatchEvent(new Event("storage"));
      } 
    }
  ], [triggerSeeder, handleSyncClassroom, handleConnectGoogle, showToast]);

  // Map Tasks into Beautiful Commands with Dynamic Risk Indicators
  const taskCommands = useMemo<CommandItem[]>(() => {
    return tasks.map(t => {
      const risk = (t.riskBand || "calm").toLowerCase();
      let dotColor = "bg-emerald-500 ring-emerald-100";
      if (risk === "watch") dotColor = "bg-amber-500 ring-amber-100";
      if (risk === "urgent") dotColor = "bg-orange-500 ring-orange-100";
      if (risk === "rescue") dotColor = "bg-rose-500 ring-rose-100";

      return {
        id: `task-${t.id}`,
        title: `Review Task: ${t.title}`,
        description: `Inspect detailed schedule and risk levels for: ${t.title}`,
        category: "Active Commitments",
        riskBand: risk,
        icon: (
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor.split(" ")[0]}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor.split(" ")[0]}`}></span>
          </span>
        ),
        action: () => {
          setSelectedTask(t);
          setActiveTab("tasks"); // Open tasks board details
          showToast(`Inspecting task details for: ${t.title}`);
        }
      };
    });
  }, [tasks, setSelectedTask, setActiveTab, showToast]);

  // Combine and Filter Commands with Sub-string Matching support for Description & Category
  const filteredItems = useMemo<CommandItem[]>(() => {
    const allItems = [...navigationCommands, ...administrativeCommands, ...taskCommands];
    if (!query) return allItems;
    
    const searchTerms = query.toLowerCase();
    return allItems.filter(item => 
      item.title.toLowerCase().includes(searchTerms) || 
      item.category.toLowerCase().includes(searchTerms) ||
      (item.description && item.description.toLowerCase().includes(searchTerms))
    );
  }, [query, navigationCommands, administrativeCommands, taskCommands]);

  // Keyboard navigation logic
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (filteredItems.length > 0 ? (prev + 1) % filteredItems.length : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (filteredItems.length > 0 ? (prev - 1 + filteredItems.length) % filteredItems.length : 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
          onClose();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  // Instant scroll active item into view with zero transition lag
  useEffect(() => {
    if (!animateIn) return;
    
    const rafId = requestAnimationFrame(() => {
      const activeEl = itemsContainerRef.current?.querySelector("[data-active='true']");
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    });
    
    return () => cancelAnimationFrame(rafId);
  }, [selectedIndex, animateIn]);

  if (!shouldRender) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 transition-all duration-300 ${animateIn ? "visible" : "invisible pointer-events-none"}`}>
      {/* High-End Glassmorphism Backdrop Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/10 backdrop-blur-[12px] transition-opacity duration-300 ease-out ${
          animateIn ? "opacity-100" : "opacity-0"
        }`} 
        onClick={onClose}
      />

      {/* Premium Double-Bezel Command Palette Panel */}
      <div 
        ref={containerRef}
        className={`w-full max-w-xl bg-slate-100/40 dark:bg-slate-900/40 p-1.5 rounded-3xl border border-border-primary/40 shadow-xl backdrop-blur-xl relative z-10 flex flex-col overflow-hidden max-h-[55vh] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform ${
          animateIn ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-[0.97] -translate-y-4"
        }`}
      >
        {/* Inner Core with Subtle Inset Specular Highlight */}
        <div className="bg-bg-panel rounded-[18px] flex flex-col overflow-hidden max-h-full border border-border-subtle flex-1 shadow-sm">
          
          {/* Search Input Area */}
          <div className="flex items-center space-x-3.5 px-4 py-3.5 border-b border-border-primary shrink-0">
            <Search className="w-4.5 h-4.5 text-slate-400 shrink-0" strokeWidth={1.75} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a command or search active commitments..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              className="w-full bg-transparent text-text-primary placeholder-text-muted text-[13.5px] focus:outline-none font-medium border-none tracking-normal"
            />
            <button 
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-bg-hover text-slate-400 hover:text-slate-600 transition-all duration-75 active:scale-[0.95] transform cursor-pointer"
              aria-label="Close command palette"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>

          {/* Categories and List Items */}
          <div 
            ref={itemsContainerRef}
            className="flex-1 overflow-y-auto py-2 divide-y divide-border-subtle custom-scrollbar"
          >
            {filteredItems.length > 0 ? (
              <div className="space-y-3">
                {/* Group items by category */}
                {Array.from(new Set(filteredItems.map(i => i.category))).map(category => (
                  <div key={category} className="px-2 space-y-0.5">
                    <span className="text-[9px] font-bold text-slate-400 font-mono uppercase tracking-widest block px-3.5 pt-2 pb-1">
                      {category}
                    </span>
                    
                    {filteredItems
                      .map((item, idx) => ({ item, index: idx }))
                      .filter(({ item }) => item.category === category)
                      .map(({ item, index }) => (
                        <div
                           key={item.id}
                           data-active={index === selectedIndex}
                           onClick={() => {
                             item.action();
                             onClose();
                           }}
                           // High-Performance Parity Hover State selection
                           onMouseMove={() => {
                             if (selectedIndex !== index) {
                               setSelectedIndex(index);
                             }
                           }}
                           className={`flex items-center justify-between px-3.5 py-2 rounded-xl cursor-pointer select-none transition-all duration-150 ease-out active:scale-[0.98] transform-gpu border ${
                             index === selectedIndex 
                               ? "bg-bg-hover border-border-primary text-text-primary" 
                               : "bg-transparent border-transparent text-text-secondary hover:bg-bg-hover/30"
                           }`}
                        >
                          <div className="flex items-center space-x-3 text-left">
                            {/* Icon container with tactile bounce animation on active item */}
                            <span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-150 ${
                              index === selectedIndex
                                ? "bg-bg-panel border-border-primary shadow-xs scale-[1.04]"
                                : "bg-slate-50/60 dark:bg-slate-800/40 border-border-subtle text-slate-400"
                            }`}>
                              {item.icon}
                            </span>
                            <div className="flex flex-col">
                              <span className={`font-sans text-[13px] font-medium tracking-tight leading-snug transition-colors duration-150 ${
                                index === selectedIndex ? "text-text-primary font-semibold" : "text-text-secondary"
                              }`}>
                                {highlightMatch(item.title, query)}
                              </span>
                              {item.description && (
                                <span className={`font-sans text-[11px] font-normal tracking-normal transition-colors duration-150 mt-0.5 ${
                                  index === selectedIndex ? "text-indigo-500 dark:text-indigo-400" : "text-text-muted"
                                }`}>
                                  {highlightMatch(item.description, query)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action Badges: Shortcut key when active, risk badge when task is unselected */}
                          <div className="shrink-0 flex items-center space-x-2 pl-2">
                            {index === selectedIndex ? (
                              <Kbd className="bg-gradient-to-b from-indigo-50/50 dark:from-indigo-950/20 to-indigo-100/50 dark:to-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-border-primary shadow-xs uppercase tracking-wider text-[9px] px-2">
                                Enter
                              </Kbd>
                            ) : (
                               (item as any).riskBand && (
                                 <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-[4px] uppercase tracking-wider border transition-colors ${
                                   (item as any).riskBand === "rescue" ? "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30" :
                                   (item as any).riskBand === "urgent" ? "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-900/30" :
                                   (item as any).riskBand === "watch" ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30" :
                                   "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30"
                                 }`}>
                                   {(item as any).riskBand}
                                 </span>
                               )
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            ) : (
              /* High-End Empty Search State */
              <div className="py-12 px-6 text-center max-w-sm mx-auto flex flex-col items-center justify-center space-y-3.5">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-300 animate-pulse">
                  <Command className="w-5 h-5 text-slate-400" strokeWidth={1.5} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-800 tracking-tight">No results found for "{query}"</p>
                  <p className="text-xs text-slate-400 leading-normal">
                    Try searching for navigation tabs, system actions, or active commitments.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Status / Tactile Keyboard Hint Bar */}
          <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-[10px] font-medium text-slate-400 font-mono shrink-0">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1.5 cursor-default">
                <div className="flex items-center space-x-1">
                  <Kbd>↑</Kbd>
                  <Kbd>↓</Kbd>
                </div>
                <span className="tracking-wide">Navigate</span>
              </span>
              <span className="flex items-center space-x-1.5 cursor-default">
                <Kbd>Enter</Kbd>
                <span className="tracking-wide">Execute</span>
              </span>
            </div>
            <span className="flex items-center space-x-1.5 cursor-default">
              <Kbd>Esc</Kbd>
              <span className="tracking-wide">Close</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
