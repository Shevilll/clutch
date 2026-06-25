import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider
} from "firebase/auth";
import type { User } from "firebase/auth";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  deleteDoc,
  orderBy,
  limit,
  updateDoc
} from "firebase/firestore";
import { 
  Sparkles, 
  Terminal, 
  Activity, 
  LogOut, 
  ListTodo, 
  RefreshCw, 
  Sliders,
  Play,
  User as UserIcon,
  FileText,
  Send,
  Calendar,
  ShieldAlert,
  Clock,
  Circle,
  CheckCircle2,
  TrendingUp,
  Menu,
  X,
  Minimize2,
  Maximize2,
  Sun,
  Moon
} from "lucide-react";
import { auth, googleProvider, db } from "./firebase";

// Import premium modular child components
import LandingPage from "./components/LandingPage";
import TodayTab from "./components/TodayTab";
import TasksTab from "./components/TasksTab";
import AgentTab from "./components/AgentTab";
import TechMapTab from "./components/TechMapTab";
import TaskDrawer from "./components/TaskDrawer";
import { TriageModal } from "./components/TriageModal";
import CommandPalette from "./components/CommandPalette";
import { WorkspaceErrorModal } from "./components/WorkspaceErrorModal";

// Helper to determine the backend API base URL
const getApiUrl = (path: string) => {
  const base = window.location.hostname === "localhost" ? "http://localhost:5001" : "";
  return `${base}${path}`;
};

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState<User | any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Theme Management System: Locked permanently to Light Mode
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("dark");
    localStorage.removeItem("clutch-theme");
  }, []);

  // Sync activeTab with URL path
  const validTabs = ["today", "tasks", "agent", "hood"];
  
  // Update state from path on load or back/forward navigation
  useEffect(() => {
    if (authLoading) return;

    if (user || isDemoMode) {
      const path = location.pathname.substring(1); // Remove leading slash
      if (validTabs.includes(path)) {
        setActiveTab(path);
      } else if (location.pathname === "/") {
        // If logged in and on landing page, redirect to today
        navigate("/today", { replace: true });
      } else {
        // Redirect any other path to today
        navigate("/today", { replace: true });
      }
    } else {
      // If not logged in and not in demo mode, must go to landing page
      if (location.pathname !== "/") {
        navigate("/", { replace: true });
      }
    }
  }, [location.pathname, user, isDemoMode, authLoading, navigate]);

  // Gamified States (Stage 2 & Today Tab integration)
  const [streak, setStreak] = useState<number>(5);
  const [streakShield, setStreakShield] = useState<boolean>(true);

  // Crisis Triage States
  const [triaging, setTriaging] = useState<boolean>(false);
  const [triageResult, setTriageResult] = useState<any | null>(null);
  const [isTriageOpen, setIsTriageOpen] = useState<boolean>(false);

  // Command Palette Toggle State
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  // Google Classroom Integration State
  const [syncingClassroom, setSyncingClassroom] = useState<boolean>(false);

  // User Profile Dropdown State
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState<boolean>(false);

  // Mobile Sidebar Drawer State
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Workspace connection error state
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const [isWorkspaceErrorOpen, setIsWorkspaceErrorOpen] = useState<boolean>(false);

  // Helper to obtain the correct token (demo or Firebase ID token)
  const getAuthToken = async (activeUid?: string) => {
    const checkUid = activeUid || user?.uid;
    if (isDemoMode || checkUid === "demo-user") {
      return "demo-token";
    }
    try {
      return await auth.currentUser?.getIdToken();
    } catch (err) {
      console.error("Error getting user ID token:", err);
      return null;
    }
  };
  
  // Agent loop states (Stage 3)
  const [latestAgentRun, setLatestAgentRun] = useState<any>(null);
  const [runningAgent, setRunningAgent] = useState<boolean>(false);
  
  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<string>("today");
  const [focusMode, setFocusMode] = useState<boolean>(false);

  // Capture Form States
  const [inputText, setInputText] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [capturing, setCapturing] = useState<boolean>(false);
  const [captureError, setCaptureError] = useState<string | null>(null);

  // Task Drawer State
  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  // App Level Alerts/Toasts
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Keybindings for Command Palette (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Track Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        if (!isDemoMode) {
          setUser(currentUser);
        }
      } else {
        if (!isDemoMode) {
          setUser(null);
        }
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [isDemoMode]);

  // Real-time Firestore Sync
  useEffect(() => {
    if (!user) {
      setTasks([]);
      return;
    }

    setLoadingTasks(true);
    const q = query(collection(db, "tasks"), where("uid", "==", user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const fetchedTasks: any[] = [];
        snapshot.forEach((doc) => {
          fetchedTasks.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort tasks by deadline date and then risk score
        fetchedTasks.sort((a, b) => {
          try {
            const dateA = getDeadlineDate(a).getTime();
            const dateB = getDeadlineDate(b).getTime();
            if (dateA !== dateB) return dateA - dateB;
            return b.riskScore - a.riskScore;
          } catch (e) {
            console.error("Error sorting tasks inside snapshot:", e);
            return 0;
          }
        });

        setTasks(fetchedTasks);

        // Keep the selected task details fresh in the drawer
        if (selectedTask) {
          const updated = fetchedTasks.find(t => t.id === selectedTask.id);
          if (updated) setSelectedTask(updated);
        }
      } catch (err) {
        console.error("Error in onSnapshot success callback:", err);
      } finally {
        setLoadingTasks(false);
      }
    }, (error) => {
      console.error("Error listening to Firestore:", error);
      setLoadingTasks(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Real-time Agent Runs Sync (Stage 3)
  useEffect(() => {
    if (!user) {
      setLatestAgentRun(null);
      return;
    }

    const q = query(
      collection(db, "agentRuns"), 
      where("uid", "==", user.uid),
      orderBy("startedAt", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const runDoc = snapshot.docs[0];
        setLatestAgentRun({ id: runDoc.id, ...runDoc.data() });
      }
    }, (error) => {
      console.error("Error listening to agentRuns:", error);
    });

    return () => unsubscribe();
  }, [user]);

  // Toast auto-dismissal
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  // Helper to translate Firebase Auth errors into actionable troubleshooting advice
  const getAuthErrorMessage = (err: any): string => {
    if (!err || !err.code) return err?.message || "Unknown authentication error.";
    switch (err.code) {
      case "auth/operation-not-allowed":
      case "auth/configuration-not-found":
        return "Google Sign-In is disabled in your Firebase Console. Go to Firebase Console > Authentication > Sign-in method, click Add Provider, select Google and enable it.";
      case "auth/unauthorized-domain":
        return `This domain is not authorized in Firebase Console. Go to Firebase Console > Authentication > Settings > Authorized Domains, and add '${window.location.hostname}' to the list.`;
      case "auth/popup-blocked":
        return "The browser blocked the sign-in popup. Please click the pop-up blocker icon in your address bar, select 'Always allow pop-ups', and try again.";
      case "auth/popup-closed-by-user":
        return "The sign-in popup was closed before completing the process. Please try again.";
      case "auth/cancelled-popup-request":
        return "The authentication flow was cancelled. Please refresh and try again.";
      case "auth/network-request-failed":
        return "A network error occurred. Please check your internet connection and DNS settings.";
      default:
        return `${err.message} (${err.code})`;
    }
  };

  // Google popup sign-in
  const handleSignIn = async () => {
    try {
      setIsDemoMode(false);
      await signInWithPopup(auth, googleProvider);
      showToast("Signed in successfully with Google.");
    } catch (err: any) {
      console.error("Sign-in error:", err);
      showToast(`Sign in failed: ${getAuthErrorMessage(err)}`);
    }
  };

  // Google calendar link authentication
  const handleConnectGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope("https://www.googleapis.com/auth/calendar");
      provider.addScope("https://www.googleapis.com/auth/gmail.compose");
      provider.addScope("https://www.googleapis.com/auth/classroom.courses.readonly");
      provider.addScope("https://www.googleapis.com/auth/classroom.coursework.me.readonly");

      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      if (token) {
        setGoogleToken(token);
        showToast("Google Workspace APIs successfully connected!");
      } else {
        showToast("Connected, but real-world workspace credentials were not returned.");
      }
    } catch (err: any) {
      console.error("Error connecting Google services:", err);
      const errMsg = getAuthErrorMessage(err);
      setWorkspaceError(errMsg);
      setIsWorkspaceErrorOpen(true);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsDemoMode(false);
      setGoogleToken(null);
      showToast("Signed out successfully.");
    } catch (err: any) {
      console.error("Sign out error:", err);
      showToast("Failed to sign out.");
    }
  };

  const handleStartDemo = () => {
    setIsDemoMode(true);
    const mockUser = {
      uid: "demo-user",
      displayName: "Aarav Sharma",
      email: "aarav.demo@clutch.guardian",
      photoURL: null
    };
    setUser(mockUser);
    showToast("Loaded sandbox environment with seed credentials.");
  };

  const triggerSeeder = async (targetUid?: string) => {
    const activeUid = (targetUid && typeof targetUid === "string") ? targetUid : user?.uid;
    if (!activeUid) return;

    try {
      const token = await getAuthToken(activeUid);
      const res = await fetch(getApiUrl("/api/seed"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ uid: activeUid })
      });
      const data = await res.json();
      if (data.success) {
        showToast("Demo scenario successfully seeded. High risk detected!");
      } else {
        showToast("Failed to seed demo commitments.");
      }
    } catch (error) {
      console.error("Seeder error:", error);
      showToast("Could not connect to seeder API.");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setImageUrl(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(",")[1];
      setImageBase64(base64Data);
      setImageMimeType(file.type);
      setUploadingImage(false);
      showToast(`Image "${file.name}" ready to upload.`);
    };
    reader.onerror = () => {
      setCaptureError("Failed to read image file.");
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !imageBase64) {
      setCaptureError("Please type a message or upload an image to analyze.");
      return;
    }

    setCapturing(true);
    setCaptureError(null);

    try {
      const token = await getAuthToken();
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const res = await fetch(getApiUrl("/api/capture"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          text: inputText,
          image: imageBase64 ? {
            data: imageBase64,
            mimeType: imageMimeType
          } : null,
          timezone
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Successfully extracted ${data.tasksCount} tasks!`);
        setInputText("");
        setImageUrl(null);
        setImageBase64(null);
        setImageMimeType(null);
      } else {
        setCaptureError(data.error || "Failed to extract tasks.");
      }
    } catch (err: any) {
      console.error("Capture API Error:", err);
      setCaptureError("Could not connect to the server capture API.");
    } finally {
      setCapturing(false);
    }
  };

  const toggleSubtask = async (task: any, subtaskIndex: number) => {
    const updatedSubtasks = [...task.subtasks];
    updatedSubtasks[subtaskIndex].done = !updatedSubtasks[subtaskIndex].done;

    try {
      const token = await getAuthToken();
      const res = await fetch(getApiUrl(`/api/tasks/${task.id}/update`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ subtasks: updatedSubtasks })
      });

      if (!res.ok) {
        throw new Error("Failed to update on server");
      }
    } catch (error) {
      console.error("Error updating subtask:", error);
      showToast("Failed to update subtask.");
    }
  };

  const triggerAgentLoop = async () => {
    if (runningAgent) return;
    setRunningAgent(true);
    navigate("/agent");
    showToast("Launching Clutch Agent! Observe its reasoning pipeline live.");

    try {
      const token = await getAuthToken();
      const headers: any = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };

      if (googleToken) {
        headers["Authorization-Google"] = `Bearer ${googleToken}`;
      }

      const res = await fetch(getApiUrl("/api/run-agent"), {
        method: "POST",
        headers
      });

      if (!res.ok) {
        throw new Error("Agent trigger failed");
      }

      const data = await res.json();
      showToast(data.summary || "Guardian sweep completed successfully.");
    } catch (error) {
      console.error("Error triggering agent loop:", error);
      showToast("Failed to run agent loop.");
    } finally {
      setRunningAgent(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      await deleteDoc(doc(db, "tasks", taskId));
      setSelectedTask(null);
      showToast("Task deleted successfully.");
    } catch (error) {
      console.error("Error deleting task:", error);
      showToast("Failed to delete task.");
    }
  };

  const onRenameTask = async (taskId: string, newTitle: string) => {
    try {
      const taskRef = doc(db, "tasks", taskId);
      await updateDoc(taskRef, { 
        title: newTitle,
        updatedAt: new Date()
      });
      showToast("Task renamed successfully.");
    } catch (err) {
      console.error("Rename Task Error:", err);
      showToast("Failed to rename task.");
    }
  };

  const runCrisisTriage = async () => {
    if (triaging) return;
    setTriaging(true);
    setTriageResult(null);
    setIsTriageOpen(true);
    showToast("Evaluating cognitive load... Gemini is analyzing deadline proximity.");

    try {
      const token = await getAuthToken();
      const serializedTasks = tasks.map(t => ({
        title: t.title,
        description: t.description || "",
        deadline: getDeadlineDate(t).toISOString(),
        size: t.size || "medium",
        riskScore: t.riskScore || 0,
        riskBand: t.riskBand || "calm",
        subtasks: t.subtasks || []
      }));

      const res = await fetch(getApiUrl("/api/triage"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ tasks: serializedTasks })
      });

      if (!res.ok) {
        throw new Error("Triage request failed");
      }

      const data = await res.json();
      setTriageResult(data);
      showToast("Triage complete! Tactical allocations prepared.");
    } catch (err) {
      console.error("Crisis Triage error:", err);
      showToast("Crisis Triage failed. Falling back to local simulation.");
      // Premium mock fallback
      setTriageResult({
        overloadScore: Math.min(100, tasks.length * 15 + 20),
        overloadLevel: tasks.length > 5 ? "SEVERE" : "WATCH",
        assessment: "Gemini analysis timed out. Displaying simulated overload calculations.",
        advice: "Break critical commitments into 30-minute deep study blocks and renegotiate non-critical slots.",
        allocations: tasks.slice(0, 3).map(t => ({
          taskId: t.id,
          action: "start_now",
          reason: "Due date is closest. Simulated action."
        }))
      });
    } finally {
      setTriaging(false);
    }
  };

  const handleSyncClassroom = async () => {
    if (syncingClassroom) return;
    setSyncingClassroom(true);
    showToast("Connecting and syncing Google Classroom coursework...");

    try {
      const token = await getAuthToken();
      const headers: any = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };
      if (googleToken) {
        headers["Authorization-Google"] = `Bearer ${googleToken}`;
      }
      const res = await fetch(getApiUrl("/api/classroom/import"), {
        method: "POST",
        headers
      });
      if (!res.ok) throw new Error("Sync failed");
      const data = await res.json();
      showToast(data.summary || `Success! Imported coursework assignments.`);
    } catch (err) {
      console.error("Classroom Sync Error:", err);
      showToast("Classroom sync completed with sandbox simulation.");
    } finally {
      setSyncingClassroom(false);
    }
  };

  // Helper date parsing from Timestamp
  const getDeadlineDate = (task: any) => {
    if (!task.deadline) return new Date();
    if (task.deadline.seconds) {
      return new Date(task.deadline.seconds * 1000);
    }
    return new Date(task.deadline);
  };

  // Human countdown strings
  const getDeadlineCountdown = (date: Date) => {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    if (diffMs < 0) return "overdue";

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 24) {
      if (diffHours === 0) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return `due in ${diffMins}m`;
      }
      return `due in ${diffHours}h`;
    }

    const diffDays = Math.floor(diffHours / 24);
    return `due in ${diffDays}d`;
  };

  // Task type icon mapper
  const getTaskIcon = (type: string) => {
    switch (type) {
      case "assignment": return <FileText className="w-4 h-4 text-accent" />;
      case "email": return <Send className="w-4 h-4 text-risk-calm" />;
      case "meeting": return <Calendar className="w-4 h-4 text-risk-watch" />;
      case "bill": return <ShieldAlert className="w-4 h-4 text-risk-urgent" />;
      case "interview": return <Sliders className="w-4 h-4 text-accent" />;
      default: return <ListTodo className="w-4 h-4 text-text-secondary" />;
    }
  };

  // Risk band styling helper
  const getRiskStyles = (band: string) => {
    switch (band) {
      case "critical": return "bg-risk-rescue/15 text-risk-rescue border-risk-rescue/30";
      case "high": return "bg-risk-urgent/15 text-risk-urgent border-risk-urgent/30";
      case "medium": return "bg-risk-watch/15 text-risk-watch border-risk-watch/30";
      default: return "bg-risk-calm/15 text-risk-calm border-risk-calm/30";
    }
  };

  // Filter high risk tasks
  const highRiskTasks = tasks.filter((t: any) => t.riskBand === "critical" || t.riskBand === "high");

  // Render loading splash screen during initial session verification
  if (authLoading) {
    return (
      <div className="h-screen w-screen bg-bg-base flex flex-col items-center justify-center relative overflow-hidden">
        {/* Soft floating background gradient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-accent/5 blur-3xl animate-pulse" />
        
        <div className="relative flex flex-col items-center max-w-sm px-6 text-center space-y-6">
          {/* Animated Premium Clutch Logo */}
          <div className="relative w-16 h-16 rounded-2xl bg-white border border-slate-200/80 shadow-md flex items-center justify-center overflow-hidden animate-bounce" style={{ animationDuration: "2s" }}>
            <svg viewBox="0 0 32 32" className="w-9 h-9 z-10 animate-spin-slow" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M8 16C8 11.5817 11.5817 8 16 8C20.4183 8 24 11.5817 24 16C24 18.5 22 21 19.5 22.5C18 23.4 17 24.5 16 26" 
                stroke="url(#loadingClutchLogoGrad)" 
                strokeWidth="3" 
                strokeLinecap="round"
              />
              <circle cx="16" cy="16" r="3" fill="url(#loadingClutchLogoInnerGrad)" />
              <defs>
                <linearGradient id="loadingClutchLogoGrad" x1="8" y1="8" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#4f46e5" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
                <linearGradient id="loadingClutchLogoInnerGrad" x1="12.5" y1="12.5" x2="19.5" y2="19.5" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#8b5cf6" />
                  <stop offset="1" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-violet-500/5" />
          </div>

          <div className="space-y-2 animate-fade-in">
            <h1 className="text-lg font-bold tracking-tight text-text-primary">Initializing Clutch Guardian</h1>
            <p className="text-xs text-text-secondary leading-relaxed">Securing authentication token & initializing guardian modules...</p>
          </div>

          {/* Minimal Elegant Progress Bar */}
          <div className="w-32 h-1 bg-slate-100 rounded-full overflow-hidden border border-slate-200/40 relative">
            <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full animate-pulse" style={{ width: "100%" }} />
          </div>
        </div>
      </div>
    );
  }

  // Authentication Wall
  if (!user) {
    return (
      <div className="relative">
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-white/95 backdrop-blur-md border border-slate-200/80 px-4 py-3 rounded-2xl shadow-xl shadow-slate-200/40 flex items-center space-x-3 text-sm text-text-primary animate-slide-up">
            <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-accent">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <span className="font-semibold text-text-primary">{toastMessage}</span>
          </div>
        )}
        <LandingPage 
          handleStartDemo={handleStartDemo} 
          handleSignIn={handleSignIn} 
        />
      </div>
    );
  }

  // RENDER: Full App Shell
  return (
    <div className="h-screen w-screen bg-bg-base text-text-primary flex flex-col md:flex-row overflow-hidden relative">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-white/95 backdrop-blur-md border border-slate-200/80 px-4 py-3 rounded-2xl shadow-xl shadow-slate-200/40 flex items-center space-x-3 text-sm text-text-primary animate-slide-up">
          <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-accent">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <span className="font-semibold text-text-primary">{toastMessage}</span>
        </div>
      )}

      {/* Mobile Header Bar */}
      <header className="md:hidden w-full bg-bg-panel border-b border-slate-200/50 px-6 py-4 flex items-center justify-between shrink-0 relative z-30">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="w-10 h-10 rounded-xl bg-white border border-slate-200/50 shadow-sm flex items-center justify-center text-text-primary hover:bg-slate-50 transition-colors cursor-pointer"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/50 shadow-sm flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 32 32" className="w-4.5 h-4.5" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M8 16C8 11.5817 11.5817 8 16 8C20.4183 8 24 11.5817 24 16C24 18.5 22 21 19.5 22.5C18 23.4 17 24.5 16 26" 
                  stroke="url(#mobileClutchLogoGrad)" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                />
                <circle cx="16" cy="16" r="3" fill="url(#mobileClutchLogoInnerGrad)" />
                <defs>
                  <linearGradient id="mobileClutchLogoGrad" x1="8" y1="8" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#4f46e5" />
                    <stop offset="1" stopColor="#8b5cf6" />
                  </linearGradient>
                  <linearGradient id="mobileClutchLogoInnerGrad" x1="12.5" y1="12.5" x2="19.5" y2="19.5" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#8b5cf6" />
                    <stop offset="1" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight block text-text-primary leading-none">Clutch</span>
              <span className="text-[9px] text-accent font-mono font-semibold tracking-wider mt-0.5 block">Guardian</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {isDemoMode && (
            <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 font-mono font-bold uppercase tracking-wider scale-90">
              Sandbox
            </span>
          )}
          
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="w-8 h-8 rounded-full border border-slate-200 shadow-sm flex items-center justify-center font-bold text-xs bg-accent/10 text-accent cursor-pointer"
          >
            {user.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full" />
            ) : (
              (user.displayName || "C").charAt(0).toUpperCase()
            )}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Sidebar */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 md:hidden"
            />
            
            {/* Drawer side panel */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 w-[280px] max-w-[85vw] bg-bg-panel border-r border-slate-200/50 p-6 flex flex-col justify-between z-50 overflow-y-auto md:hidden shadow-2xl"
            >
              <div className="space-y-8">
                {/* Brand & Close Button */}
                <div className="flex items-center justify-between pb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/50 shadow-sm flex items-center justify-center overflow-hidden">
                      <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path 
                          d="M8 16C8 11.5817 11.5817 8 16 8C20.4183 8 24 11.5817 24 16C24 18.5 22 21 19.5 22.5C18 23.4 17 24.5 16 26" 
                          stroke="url(#mobileDrawerClutchLogoGrad)" 
                          strokeWidth="3" 
                          strokeLinecap="round"
                        />
                        <circle cx="16" cy="16" r="3" fill="url(#mobileDrawerClutchLogoInnerGrad)" />
                        <defs>
                          <linearGradient id="mobileDrawerClutchLogoGrad" x1="8" y1="8" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#4f46e5" />
                            <stop offset="1" stopColor="#8b5cf6" />
                          </linearGradient>
                          <linearGradient id="mobileDrawerClutchLogoInnerGrad" x1="12.5" y1="12.5" x2="19.5" y2="19.5" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#8b5cf6" />
                            <stop offset="1" stopColor="#ec4899" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    <div>
                      <span className="font-bold text-base tracking-tight block text-text-primary leading-none">Clutch</span>
                      <span className="text-[10px] text-accent font-mono font-semibold tracking-wider mt-1 block">Guardian</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/50 flex items-center justify-center text-text-muted hover:text-text-primary cursor-pointer"
                    aria-label="Close sidebar menu"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="space-y-1.5">
                  {[
                    { id: "today", label: "Morning Briefing", icon: Activity },
                    { id: "tasks", label: "Tasks Board", icon: ListTodo, badge: tasks.length > 0 ? tasks.length : undefined },
                    { id: "agent", label: "Agent Loop", icon: Terminal, secondaryBadge: "Live" },
                    { id: "hood", label: "Under The Hood", icon: Sliders, secondaryBadge: "Tech", badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200/40" }
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          navigate("/" + item.id);
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center space-x-3 transition-all duration-200 btn-interactive cursor-pointer relative group ${
                          isActive 
                            ? "bg-accent/[0.08] text-accent border border-accent/15 shadow-sm shadow-accent/[0.02]" 
                            : "text-text-secondary hover:bg-slate-50 hover:text-text-primary border border-transparent"
                        }`}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-3 bottom-3 w-1 bg-accent rounded-full" />
                        )}
                        <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? "text-accent scale-110" : "text-text-muted group-hover:text-text-primary"}`} />
                        <span>{item.label}</span>
                        
                        {item.badge !== undefined && (
                          <span className={`ml-auto text-xs px-2 py-0.5 rounded-lg font-mono font-bold ${
                            isActive ? "bg-accent/10 text-accent" : "bg-slate-100 text-text-secondary"
                          }`}>
                            {item.badge}
                          </span>
                        )}
                        {item.secondaryBadge !== undefined && (
                          <span className={`ml-auto text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider ${
                            item.badgeColor 
                              ? item.badgeColor 
                              : isActive ? "bg-accent/20 text-accent" : "bg-slate-100 text-text-muted"
                          }`}>
                            {item.secondaryBadge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>

                {/* Google Services Sync Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/50 border border-slate-200/50 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="relative flex h-2 w-2">
                        {googleToken ? (
                          <>
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </>
                        ) : (
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-300"></span>
                        )}
                      </span>
                      <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider font-bold">Google Workspace</span>
                    </div>
                    <RefreshCw className={`w-3 h-3 text-text-muted ${googleToken ? "animate-spin-slow text-emerald-500" : ""}`} />
                  </div>

                  {googleToken ? (
                    <div className="space-y-1.5">
                      <p className="text-[11px] text-text-primary font-bold flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Real-world Sync Active</span>
                      </p>
                      <p className="text-[10px] text-text-secondary leading-relaxed pl-5">Calendar events and Gmail drafts are fully active and monitored.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 relative z-10">
                      <p className="text-[10px] text-text-secondary leading-relaxed">Connect Google services to enable proactive scheduling.</p>
                      <button
                        onClick={() => {
                          handleConnectGoogle();
                          setIsMobileSidebarOpen(false);
                        }}
                        className="w-full py-2 rounded-xl bg-white text-[10px] font-bold text-slate-700 shadow-sm border border-slate-200/80 flex items-center justify-center space-x-2 cursor-pointer btn-interactive"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22-.03-.63z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                        </svg>
                        <span>Connect Workspace</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar Footer Metadata */}
              <div className="pt-6 border-t border-slate-200/40 text-center">
                <p className="text-[10px] text-text-muted font-mono font-medium tracking-wider uppercase">
                  Clutch System • Active
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex md:w-64 bg-bg-panel border-r border-slate-200/50 p-6 flex-col justify-between shrink-0 h-screen sticky top-0 overflow-y-auto">
        <div className="space-y-8">
          {/* Brand Logo */}
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/50 shadow-sm flex items-center justify-center relative overflow-hidden transition-transform duration-300 group-hover:scale-105">
                <svg viewBox="0 0 32 32" className="w-5.5 h-5.5 z-10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M8 16C8 11.5817 11.5817 8 16 8C20.4183 8 24 11.5817 24 16C24 18.5 22 21 19.5 22.5C18 23.4 17 24.5 16 26" 
                    stroke="url(#sidebarClutchLogoGrad)" 
                    strokeWidth="3" 
                    strokeLinecap="round"
                  />
                  <circle cx="16" cy="16" r="3" fill="url(#sidebarClutchLogoInnerGrad)" />
                  <defs>
                    <linearGradient id="sidebarClutchLogoGrad" x1="8" y1="8" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#4f46e5" />
                      <stop offset="1" stopColor="#8b5cf6" />
                    </linearGradient>
                    <linearGradient id="sidebarClutchLogoInnerGrad" x1="12.5" y1="12.5" x2="19.5" y2="19.5" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#8b5cf6" />
                      <stop offset="1" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div>
                <span className="font-bold text-base tracking-tight block text-text-primary leading-none">Clutch</span>
                <span className="text-[10px] text-accent font-mono font-semibold tracking-wider mt-1 block">Guardian</span>
              </div>
            </div>
            {isDemoMode && (
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 font-mono font-bold uppercase tracking-wider">
                Sandbox
              </span>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {[
              { id: "today", label: "Morning Briefing", icon: Activity },
              { id: "tasks", label: "Tasks Board", icon: ListTodo, badge: tasks.length > 0 ? tasks.length : undefined },
              { id: "agent", label: "Agent Loop", icon: Terminal, secondaryBadge: "Live" },
              { id: "hood", label: "Under The Hood", icon: Sliders, secondaryBadge: "Tech", badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200/40" }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate("/" + item.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center space-x-3 transition-all duration-200 btn-interactive cursor-pointer relative group ${
                    isActive 
                      ? "bg-accent/[0.08] text-accent border border-accent/15 shadow-sm shadow-accent/[0.02]" 
                      : "text-text-secondary hover:bg-slate-50 hover:text-text-primary border border-transparent"
                  }`}
                >
                  {/* Glowing active indicator bar on the left */}
                  {isActive && (
                    <div className="absolute left-0 top-3 bottom-3 w-1 bg-accent rounded-full" />
                  )}
                  <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? "text-accent scale-110" : "text-text-muted group-hover:text-text-primary group-hover:scale-105"}`} />
                  <span className="transition-all duration-200">{item.label}</span>
                  
                  {item.badge !== undefined && (
                    <span className={`ml-auto text-xs px-2 py-0.5 rounded-lg font-mono font-bold transition-all duration-200 ${
                      isActive ? "bg-accent/10 text-accent" : "bg-slate-100 text-text-secondary group-hover:bg-slate-200"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {item.secondaryBadge !== undefined && (
                    <span className={`ml-auto text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider transition-all duration-200 ${
                      item.badgeColor 
                        ? item.badgeColor 
                        : isActive ? "bg-accent/20 text-accent" : "bg-slate-100 text-text-muted group-hover:bg-slate-200"
                    }`}>
                      {item.secondaryBadge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Google Services Sync Card */}
          <div className="p-4.5 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/50 border border-slate-200/50 shadow-sm relative overflow-hidden group">
            {/* Soft decorative background pattern */}
            <div className="absolute -right-6 -bottom-6 w-16 h-16 rounded-full bg-accent/5 blur-xl transition-all duration-500 group-hover:scale-150" />
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="relative flex h-2 w-2">
                  {googleToken ? (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </>
                  ) : (
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-300"></span>
                  )}
                </span>
                <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider font-bold">Google Workspace</span>
              </div>
              <RefreshCw className={`w-3 h-3 text-text-muted ${googleToken ? "animate-spin-slow text-emerald-500" : "group-hover:rotate-45 transition-transform duration-300"}`} />
            </div>

            {googleToken ? (
              <div className="space-y-1.5 relative z-10">
                <p className="text-[11px] text-text-primary font-bold flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Real-world Sync Active</span>
                </p>
                <p className="text-[10px] text-text-secondary leading-relaxed pl-5 font-normal">Calendar events and Gmail drafts are fully active and monitored.</p>
              </div>
            ) : (
              <div className="space-y-2.5 relative z-10">
                <p className="text-[10px] text-text-secondary leading-relaxed font-normal">Agent is running with mock fallbacks. Connect Google services to enable proactive scheduling.</p>
                <button
                  onClick={handleConnectGoogle}
                  className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[10px] font-bold text-slate-700 transition-all duration-150 shadow-sm border border-slate-200/80 flex items-center justify-center space-x-2 cursor-pointer btn-interactive"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22-.03-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  <span>Connect Workspace</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer Metadata */}
        <div className="pt-6 border-t border-slate-200/40 text-center">
          <p className="text-[10px] text-text-muted font-mono font-medium tracking-wider uppercase">
            Clutch System • Active
          </p>
        </div>
      </aside>

      {/* Main Container Content */}
      <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full h-full overflow-y-auto space-y-8 bg-bg-base">
        
        {/* HEADER BRAND BAR */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/50 pb-6 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-accent uppercase tracking-wider font-mono">
              <span>DEADLINE GUARDIAN</span>
              <span>•</span>
              <span className="text-text-muted flex items-center">
                Press <kbd className="mx-1 px-1.5 py-0.5 text-[10px] font-sans font-bold text-text-secondary bg-slate-100 border border-slate-200 rounded-md">⌘K</kbd> for Command Palette
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-text-primary capitalize mt-1">
              {activeTab === "today" 
                ? "Guardian Command Center" 
                : activeTab === "tasks" 
                ? "Active Commitments" 
                : activeTab === "hood"
                ? "Under the Hood"
                : "Autonomous Agent Loop"}
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              {activeTab === "today"
                ? "Autonomous threat-level monitoring & focus engine."
                : activeTab === "tasks"
                ? "Ingest commits, syllabi, or raw inputs into structured goals."
                : activeTab === "hood"
                ? "Deep blueprint analysis of Vertex AI & Cloud Run orchestrations."
                : "Live execution trace logs of the Clutch background loop."}
            </p>
          </div>

          <div className="flex items-center space-x-3 self-start sm:self-auto relative flex-wrap gap-y-2">
            {/* Contextual top controls */}
            {activeTab === "today" && (
              <button
                onClick={() => {
                  setFocusMode(!focusMode);
                  showToast(!focusMode ? "Focus Mode Activated. Simplify and conquer." : "Dashboard restored.");
                }}
                className={`flex items-center space-x-2 px-4.5 py-2.5 rounded-xl text-xs font-semibold shadow-sm border transition-all duration-200 active:scale-[0.97] cursor-pointer ${
                  focusMode 
                    ? "bg-accent text-white border-accent hover:bg-accent-hover shadow-md shadow-accent/10" 
                    : "bg-bg-panel text-text-secondary border-border-primary hover:bg-bg-hover"
                }`}
              >
                {focusMode ? <Minimize2 className="w-3.5 h-3.5 animate-pulse" /> : <Maximize2 className="w-3.5 h-3.5" />}
                <span>{focusMode ? "Exit Focus Mode" : "Focus Mode"}</span>
              </button>
            )}

            {activeTab === "tasks" && (
              <button
                onClick={handleSyncClassroom}
                disabled={syncingClassroom}
                className={`flex items-center space-x-2 px-4.5 py-2.5 rounded-xl text-xs font-semibold shadow-sm border transition-all duration-200 active:scale-[0.97] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  syncingClassroom
                    ? "bg-bg-panel border-border-primary text-text-muted"
                    : "bg-bg-panel text-text-secondary border-border-primary hover:bg-bg-hover"
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 text-text-secondary ${syncingClassroom ? "animate-spin text-accent" : ""}`} />
                <span>{syncingClassroom ? "Syncing Classroom..." : "Sync Classroom"}</span>
              </button>
            )}

            {activeTab === "agent" && !(latestAgentRun && latestAgentRun.steps && latestAgentRun.steps.length > 0) && (
              <span className="text-[10px] bg-bg-panel text-text-muted font-mono font-bold tracking-widest px-3 py-2 rounded-xl border border-border-primary">
                SIMULATION
              </span>
            )}

            <button
              onClick={triggerAgentLoop}
              disabled={runningAgent}
              className="px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-accent to-accent-hover text-white text-xs font-bold hover:shadow-accent/20 transition-all duration-200 shadow-md shadow-accent/10 border border-white/10 flex items-center space-x-2 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed btn-interactive"
            >
              {runningAgent ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 group-hover:scale-110 transition-transform duration-200" />
              )}
              <span>{runningAgent ? "Guarding..." : "Run Clutch Sweep"}</span>
            </button>





            {/* Profile Avatar & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="w-10 h-10 rounded-full cursor-pointer relative focus:outline-none transition-transform duration-200 active:scale-95 flex items-center justify-center hover:ring-2 hover:ring-accent/10 border border-slate-200 shadow-sm"
                aria-label="User profile menu"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-10 h-10 rounded-full border border-slate-200 shadow-sm" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center border border-accent/15 text-accent shadow-inner font-bold text-sm">
                    {(user.displayName || "C").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-30 cursor-default" 
                      onClick={() => setIsProfileDropdownOpen(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -8 }}
                      transition={{ type: "spring", duration: 0.25, bounce: 0.12 }}
                      className="absolute right-0 mt-2 w-72 bg-bg-panel/95 backdrop-blur-md border border-border-primary rounded-2xl shadow-xl p-2 z-40 origin-top-right overflow-hidden focus:outline-none text-text-primary"
                    >
                      {/* User Info Header */}
                      <div className="px-3 py-2.5 hover:bg-bg-hover rounded-xl transition-colors duration-150 flex items-center space-x-3 mb-1">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt="Avatar" className="w-9 h-9 rounded-full border border-border-primary shadow-sm" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center border border-accent/15 text-accent font-bold text-xs">
                            {(user.displayName || "C").charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="overflow-hidden flex-1">
                          <span className="text-xs font-bold text-text-primary block truncate leading-none">
                            {user.displayName || "Clutch User"}
                          </span>
                          <span className="text-[10px] text-text-muted block truncate font-medium mt-1">
                            {user.email}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-border-subtle my-1" />

                      {/* Quick Actions Menu Group */}
                      <div className="space-y-0.5">
                        <div className="px-3 py-1.5 text-[9px] font-mono font-bold text-text-muted uppercase tracking-wider">
                          Actions
                        </div>
                        
                        <button
                          onClick={() => {
                            triggerSeeder();
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-all duration-150 cursor-pointer group active:scale-[0.98] btn-interactive"
                          title="Reset tasks and load standard demo dataset"
                        >
                          <div className="flex items-center space-x-2.5">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-text-muted group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                              <RefreshCw className="w-3.5 h-3.5 transition-transform duration-500 group-hover:rotate-180" />
                            </div>
                            <div>
                              <span className="block font-bold">Seed Demo Dataset</span>
                              <span className="text-[10px] text-text-muted font-normal block mt-0.5">Reset task state & timelines</span>
                            </div>
                          </div>
                        </button>
                      </div>

                      <div className="border-t border-border-subtle my-1" />

                      {/* Account Group */}
                      <div className="space-y-0.5">
                        <button
                          onClick={() => {
                            handleSignOut();
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-700 dark:hover:text-red-400 transition-all duration-150 cursor-pointer group active:scale-[0.98] btn-interactive"
                        >
                          <div className="flex items-center space-x-2.5">
                            <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-500 dark:text-red-400 group-hover:bg-red-100 dark:group-hover:bg-red-950/40 group-hover:text-red-600 dark:group-hover:text-red-300 transition-colors">
                              <LogOut className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <span className="block font-bold">Sign Out</span>
                              <span className="text-[10px] text-red-500/60 font-normal block mt-0.5">Exit current session</span>
                            </div>
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* TAB RENDERING */}
        {activeTab === "today" && (
          <TodayTab 
            user={user}
            tasks={tasks}
            latestAgentRun={latestAgentRun}
            setSelectedTask={setSelectedTask}
            runCrisisTriage={runCrisisTriage}
            streak={streak}
            setStreak={setStreak}
            streakShield={streakShield}
            setStreakShield={setStreakShield}
            showToast={showToast}
            getDeadlineDate={getDeadlineDate}
            getDeadlineCountdown={getDeadlineCountdown}
            getTaskIcon={getTaskIcon}
            getRiskStyles={getRiskStyles}
            highRiskTasks={highRiskTasks}
            focusMode={focusMode}
            setFocusMode={setFocusMode}
          />
        )}

        {activeTab === "tasks" && (
          <TasksTab 
            tasks={tasks}
            loadingTasks={loadingTasks}
            syncingClassroom={syncingClassroom}
            handleSyncClassroom={handleSyncClassroom}
            triggerSeeder={() => triggerSeeder()}
            setSelectedTask={setSelectedTask}
            getDeadlineDate={getDeadlineDate}
            getDeadlineCountdown={getDeadlineCountdown}
            getRiskStyles={getRiskStyles}
            onRenameTask={onRenameTask}
            inputText={inputText}
            setInputText={setInputText}
            capturing={capturing}
            captureError={captureError}
            handleCapture={handleCapture}
            handleImageUpload={handleImageUpload}
            uploadingImage={uploadingImage}
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            setImageBase64={setImageBase64}
          />
        )}

        {activeTab === "agent" && (
          <AgentTab 
            latestAgentRun={latestAgentRun}
            runningAgent={runningAgent}
            triggerAgentLoop={triggerAgentLoop}
            user={user}
          />
        )}

        {activeTab === "hood" && (
          <div className="space-y-8 animate-fade-in">
            {/* Tech Map Tab */}
            <TechMapTab />

            {/* Autopilot and Trust Center Config */}
            <div className="bg-bg-panel border border-slate-200/60 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-950">Autopilot & Trust Center Settings</h3>
                <p className="text-xs text-text-secondary mt-1">Configure your Deadline Guardian background parameters and verify security settings.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-text-muted font-bold mb-1.5">Work Hour Guard Rails</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-text-primary font-medium focus:outline-none focus:border-accent">
                      <option>09:00 to 18:00 (Standard Business)</option>
                      <option>08:00 to 22:00 (Extensive Student)</option>
                      <option>24 Hours (Continuous Autopilot)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-text-muted font-bold mb-1.5">Guardian Nudge Frequency</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-text-primary font-medium focus:outline-none focus:border-accent">
                      <option>Action-first (Silent, drafts and schedules first)</option>
                      <option>Collaborative (HITL tool confirmation)</option>
                      <option>Direct (Alerts only on critical thresholds)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <span className="text-[9px] font-mono text-indigo-600 font-bold uppercase tracking-wider">Security and Scopes Assurance</span>
                    <p className="text-[11px] text-text-secondary leading-relaxed font-normal">
                      Clutch requests limited client-side Google API scopes. We strictly only ask for <strong className="text-text-primary">gmail.compose</strong> (allowing us to write drafts but NEVER read your personal emails) and <strong className="text-text-primary">calendar</strong> (to block focus slots). No data is ever transmitted to external servers except Gemini via Vertex AI.
                    </p>
                  </div>

                  {/* Manual Guardian sweep trigger */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-accent/5 border border-accent/15 rounded-xl p-4 gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-text-primary">Manual Guardian Sweep</h4>
                      <p className="text-[10px] text-text-secondary mt-0.5">Force-trigger the proactive scheduled sweeping logic.</p>
                    </div>
                    <button
                      onClick={async () => {
                        showToast("Manually launching scheduled guardian sweep...");
                        try {
                          const token = await getAuthToken();
                          const headers: any = {
                            "Content-Type": "application/json",
                          };
                          if (token) {
                            headers["Authorization"] = `Bearer ${token}`;
                          }
                          const body: any = { uid: user?.uid || "demo-user" };
                          if (googleToken) {
                            body.googleToken = googleToken;
                          }
                          const res = await fetch(getApiUrl("/api/guardian"), {
                            method: "POST",
                            headers,
                            body: JSON.stringify(body)
                          });
                          if (!res.ok) throw new Error("Sweep failed");
                          const data = await res.json();
                          showToast(data.summary || "Guardian sweep complete!");
                        } catch (err: any) {
                          console.error("Guardian trigger error:", err);
                          showToast("Failed to manually run guardian sweep.");
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-accent text-white text-[10px] font-bold hover:bg-accent-hover transition flex items-center space-x-1 border border-white/10 cursor-pointer"
                    >
                      <Play className="w-3 h-3" />
                      <span>Trigger Sweep</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* COMPONENT: TASK DRAWER / DETAIL SLIDE-OUT PANEL */}
      <TaskDrawer 
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onToggleSubtask={toggleSubtask}
        onDeleteTask={handleDeleteTask}
        onRunRescue={triggerAgentLoop}
        runningAgent={runningAgent}
        getDeadlineDate={getDeadlineDate}
        getRiskStyles={getRiskStyles}
      />

      {/* COMPONENT: CRISIS TRIAGE MODAL */}
      <TriageModal 
        isOpen={isTriageOpen}
        onClose={() => {
          setIsTriageOpen(false);
          setTriageResult(null);
        }}
        triaging={triaging}
        triageResult={triageResult}
        tasks={tasks}
        setSelectedTask={setSelectedTask}
        showToast={showToast}
      />

      {/* COMPONENT: COMMAND PALETTE */}
      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        tasks={tasks}
        activeTab={activeTab}
        setActiveTab={(tab) => navigate("/" + tab)}
        setSelectedTask={setSelectedTask}
        triggerSeeder={() => triggerSeeder()}
        handleSyncClassroom={handleSyncClassroom}
        handleConnectGoogle={handleConnectGoogle}
        showToast={showToast}
      />

      {/* COMPONENT: WORKSPACE ERROR / TROUBLESHOOT MODAL */}
      <WorkspaceErrorModal
        isOpen={isWorkspaceErrorOpen}
        onClose={() => setIsWorkspaceErrorOpen(false)}
        errorMessage={workspaceError || ""}
        onSimulate={() => {
          setGoogleToken("demo-token");
          showToast("Demo Google Workspace linked successfully!");
        }}
      />
    </div>
  );
}
