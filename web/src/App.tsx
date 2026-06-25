import { useState, useEffect } from "react";
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
  limit
} from "firebase/firestore";
import { 
  Sparkles, 
  Terminal, 
  Activity, 
  ChevronRight, 
  Plus, 
  Image as ImageIcon, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Lock, 
  LogOut, 
  ListTodo, 
  Send, 
  RefreshCw, 
  AlertCircle, 
  Calendar, 
  ShieldAlert,
  FileText,
  User as UserIcon,
  Sliders,
  Play
} from "lucide-react";
import { auth, googleProvider, db } from "./firebase";

// Helper to determine the backend API base URL
const getApiUrl = (path: string) => {
  const base = window.location.hostname === "localhost" ? "http://localhost:5001" : "";
  return `${base}${path}`;
};

export default function App() {
  const [user, setUser] = useState<User | any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  
  // Agent loop states (Stage 3)
  const [latestAgentRun, setLatestAgentRun] = useState<any>(null);
  const [runningAgent, setRunningAgent] = useState<boolean>(false);
  
  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<string>("today");

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

  // Track Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && !isDemoMode) {
        setUser(currentUser);
      }
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
      const fetchedTasks: any[] = [];
      snapshot.forEach((doc) => {
        fetchedTasks.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort tasks by deadline date and then risk score
      fetchedTasks.sort((a, b) => {
        const dateA = getDeadlineDate(a).getTime();
        const dateB = getDeadlineDate(b).getTime();
        if (dateA !== dateB) return dateA - dateB;
        return b.riskScore - a.riskScore;
      });

      setTasks(fetchedTasks);
      setLoadingTasks(false);

      // Keep the selected task details fresh in the drawer
      if (selectedTask) {
        const updated = fetchedTasks.find(t => t.id === selectedTask.id);
        if (updated) setSelectedTask(updated);
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

  // Google popup sign-in
  const handleSignIn = async () => {
    try {
      setIsDemoMode(false);
      await signInWithPopup(auth, googleProvider);
      showToast("Signed in successfully with Google.");
    } catch (err: any) {
      console.error("Sign-in error:", err);
      showToast(`Sign in failed: ${err.message}`);
    }
  };

  // Connect Google services & request scopes for Calendar + Gmail compose (Stage 4)
  const handleConnectGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope("https://www.googleapis.com/auth/calendar");
      provider.addScope("https://www.googleapis.com/auth/gmail.compose");
      provider.setCustomParameters({
        prompt: "consent",
      });

      showToast("Connecting Google Calendar & Gmail. Please grant permissions in the popup...");
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;

      if (token) {
        setGoogleToken(token);
        showToast("✓ Connected to Google Workspace! Your agent can now sync real focus blocks and compose Gmail drafts.");
      } else {
        showToast("Connected but did not receive a Google access token. Falling back to mock sync.");
      }
    } catch (err: any) {
      console.error("Error connecting Google services:", err);
      showToast(`Google link failed: ${err.message}`);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      if (isDemoMode) {
        setIsDemoMode(false);
        setUser(null);
        showToast("Exited demo sandbox.");
      } else {
        await signOut(auth);
        setUser(null);
        showToast("Signed out successfully.");
      }
    } catch (err: any) {
      console.error("Sign-out error:", err);
    }
  };

  // Launch No-login Demo Sandbox
  const handleStartDemo = () => {
    setIsDemoMode(true);
    const mockUser = {
      uid: "demo-user",
      displayName: "Aarav Sharma (Demo)",
      email: "demo@clutch.guardian",
      photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face"
    };
    setUser(mockUser);
    showToast("Entered Live Demo Sandbox. Restoring seeded scenario...");
    // Auto trigger seed scenario
    triggerSeeder(mockUser.uid);
  };

  // Seed commitments
  const triggerSeeder = async (targetUid?: string) => {
    const activeUid = targetUid || user?.uid;
    if (!activeUid) return;

    try {
      const token = isDemoMode ? "demo-token" : await auth.currentUser?.getIdToken();
      const res = await fetch(getApiUrl("/api/seed"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Seeded ${data.seededCount} sample commitments for Aarav.`);
      } else {
        showToast(`Seeding failed: ${data.error}`);
      }
    } catch (err: any) {
      console.error("Seeding error:", err);
      showToast("Connection to seed API failed.");
    }
  };

  // Handle Drag/Upload Image and convert to base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setCaptureError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
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

  // Submit capture input (multimodal)
  const handleCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !imageBase64) {
      setCaptureError("Please type a message or upload an image to analyze.");
      return;
    }

    setCapturing(true);
    setCaptureError(null);

    try {
      const token = isDemoMode ? "demo-token" : await auth.currentUser?.getIdToken();
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

  // Subtask checkbox toggle (Stage 2 - Secure Server Recalculation)
  const toggleSubtask = async (task: any, subtaskIndex: number) => {
    const updatedSubtasks = [...task.subtasks];
    updatedSubtasks[subtaskIndex].done = !updatedSubtasks[subtaskIndex].done;

    try {
      const token = isDemoMode ? "demo-token" : await auth.currentUser?.getIdToken();
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

  // Trigger Agent Loop (Stage 3)
  const triggerAgentLoop = async () => {
    if (runningAgent) return;
    setRunningAgent(true);
    setActiveTab("agent");
    showToast("Launching Clutch Agent! Observe its reasoning pipeline live.");

    try {
      const token = isDemoMode ? "demo-token" : await auth.currentUser?.getIdToken();
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

  // Delete Task
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

  // Get date helper from Timestamp
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

  // Group label helper
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

  // Task type icon mapper
  const getTaskIcon = (type: string) => {
    switch (type) {
      case "assignment": return <FileText className="w-4 h-4 text-accent" />;
      case "email": return <Send className="w-4 h-4 text-risk-calm" />;
      case "meeting": return <Calendar className="w-4 h-4 text-risk-watch" />;
      case "bill": return <ShieldAlert className="w-4 h-4 text-risk-urgent" />;
      case "interview": return <Sliders className="w-4 h-4 text-accent-hover" />;
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

  // Group tasks by day
  const groupedTasks: { [key: string]: any[] } = {};
  tasks.forEach((task: any) => {
    const date = getDeadlineDate(task);
    const label = getDayLabel(date);
    if (!groupedTasks[label]) {
      groupedTasks[label] = [];
    }
    groupedTasks[label].push(task);
  });

  // Calculate high risk tasks counts
  const highRiskTasks = tasks.filter((t: any) => t.riskBand === "critical" || t.riskBand === "high");

  // RENDER: Landing / Authentication Wall
  if (!user) {
    return (
      <div className="min-h-screen bg-bg-base text-text-primary flex flex-col justify-between p-6 md:p-12 relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-accent opacity-5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-risk-calm opacity-5 blur-[120px] pointer-events-none" />

        {/* Header */}
        <header className="flex items-center justify-between max-w-7xl mx-auto w-full z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20 border border-white/5">
              <Sparkles className="w-5 h-5 text-text-primary" />
            </div>
            <div>
              <span className="font-semibold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-text-primary to-text-secondary">
                Clutch
              </span>
              <span className="ml-1.5 text-xs px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/25 font-mono font-medium">
                beta
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs text-text-muted bg-bg-panel px-3 py-1.5 rounded-lg border border-white/5">
            <Activity className="w-3.5 h-3.5 text-risk-calm animate-pulse" />
            <span>Deployed v0.1</span>
          </div>
        </header>

        {/* Hero Section */}
        <main className="max-w-4xl mx-auto w-full my-auto text-center py-12 md:py-24 z-10 flex flex-col items-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-6 animate-fade-in font-mono">
            <span>Problem Statement #1 — The Last-Minute Life Saver</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-2xl text-text-primary leading-tight">
            Stop getting reminded.<br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent to-accent-hover">
              Start getting saved.
            </span>
          </h1>

          <p className="text-text-secondary text-base md:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
            Clutch is an autonomous deadline guardian. It analyzes your messy syllabus or photos, finds what's about to hurt, and actually drafts the essays and emails to save your week.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
            <button
              onClick={handleStartDemo}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-accent text-text-primary font-medium hover:bg-accent-hover transition-all shadow-lg shadow-accent/20 flex items-center justify-center space-x-2 border border-white/10 group cursor-pointer"
            >
              <span>Try the rescue — no login</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={handleSignIn}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-bg-panel text-text-primary font-medium hover:bg-bg-dialog transition border border-white/10 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Lock className="w-4 h-4 text-text-muted" />
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Feature highlights grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mt-20 text-left">
            <div className="bg-bg-panel border border-white/[0.04] p-5 rounded-2xl">
              <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center mb-3">
                <ImageIcon className="w-4 h-4 text-accent" />
              </div>
              <h3 className="text-sm font-semibold text-text-primary mb-1">Multimodal Ingestion</h3>
              <p className="text-xs text-text-secondary">Snap a photo of assignments or paste an email syllabus. Gemini extracts exact tasks.</p>
            </div>
            <div className="bg-bg-panel border border-white/[0.04] p-5 rounded-2xl">
              <div className="w-8 h-8 rounded-lg bg-risk-urgent/15 flex items-center justify-center mb-3">
                <ShieldAlert className="w-4 h-4 text-risk-urgent" />
              </div>
              <h3 className="text-sm font-semibold text-text-primary mb-1">Predictive Risk Engine</h3>
              <p className="text-xs text-text-secondary">Scores commitments dynamically based on remaining time, size, and your current progress.</p>
            </div>
            <div className="bg-bg-panel border border-white/[0.04] p-5 rounded-2xl">
              <div className="w-8 h-8 rounded-lg bg-risk-calm/15 flex items-center justify-center mb-3">
                <Terminal className="w-4 h-4 text-risk-calm" />
              </div>
              <h3 className="text-sm font-semibold text-text-primary mb-1">Autonomous Agent</h3>
              <p className="text-xs text-text-secondary">Decomposes tasks, drafts outlines, and saves them to Google Docs so you can skip the hard start.</p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center text-xs text-text-muted z-10 border-t border-white/[0.04] pt-6 max-w-7xl mx-auto w-full">
          <p>© 2026 Clutch. Developed in pure TypeScript for Google Vibe2Ship Hackathon.</p>
        </footer>
      </div>
    );
  }

  // RENDER: Full App Shell (After Login or Demo Mode activation)
  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col md:flex-row relative">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-bg-dialog border border-accent/20 px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 text-sm text-text-primary animate-slide-up">
          <Activity className="w-4 h-4 text-accent animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-bg-panel border-b md:border-b-0 md:border-r border-white/[0.06] p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          {/* Brand Logo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center shadow-lg shadow-accent/20 border border-white/5">
                <Sparkles className="w-4 h-4 text-text-primary" />
              </div>
              <div>
                <span className="font-semibold tracking-tight block text-text-primary leading-none">Clutch</span>
                <span className="text-[10px] text-accent font-mono font-medium">guardian v0.1</span>
              </div>
            </div>
            {isDemoMode && (
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-risk-watch/15 text-risk-watch border border-risk-watch/30 font-mono font-semibold uppercase">
                Sandbox
              </span>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("today")}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center space-x-3 transition duration-150 cursor-pointer ${
                activeTab === "today" 
                  ? "bg-accent/10 text-accent border border-accent/15" 
                  : "text-text-secondary hover:bg-bg-base hover:text-text-primary border border-transparent"
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Today</span>
            </button>

            <button
              onClick={() => setActiveTab("tasks")}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center space-x-3 transition duration-150 cursor-pointer ${
                activeTab === "tasks" 
                  ? "bg-accent/10 text-accent border border-accent/15" 
                  : "text-text-secondary hover:bg-bg-base hover:text-text-primary border border-transparent"
              }`}
            >
              <ListTodo className="w-4 h-4" />
              <span>Tasks Board</span>
              {tasks.length > 0 && (
                <span className="ml-auto text-xs px-1.5 py-0.5 rounded-md bg-white/5 text-text-secondary">
                  {tasks.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("agent")}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center space-x-3 transition duration-150 cursor-pointer ${
                activeTab === "agent" 
                  ? "bg-accent/10 text-accent border border-accent/15" 
                  : "text-text-secondary hover:bg-bg-base hover:text-text-primary border border-transparent"
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Agent loop</span>
              <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-accent/20 text-accent uppercase tracking-wider font-mono">
                Stage 3
              </span>
            </button>

            <button
              onClick={() => setActiveTab("hood")}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center space-x-3 transition duration-150 cursor-pointer ${
                activeTab === "hood" 
                  ? "bg-accent/10 text-accent border border-accent/15" 
                  : "text-text-secondary hover:bg-bg-base hover:text-text-primary border border-transparent"
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Under the hood</span>
              <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-risk-calm/20 text-risk-calm uppercase tracking-wider font-mono font-semibold">
                Tech
              </span>
            </button>
          </nav>

          {/* Google Services Integration Card (Stage 4) */}
          <div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-3">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${googleToken ? "bg-risk-calm animate-pulse" : "bg-text-muted"}`} />
              <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider font-semibold">Google Workspace Sync</span>
            </div>
            {googleToken ? (
              <div className="space-y-1">
                <p className="text-[11px] text-text-primary font-semibold flex items-center space-x-1">
                  <span>🟢 Real-world Sync Active</span>
                </p>
                <p className="text-[10px] text-text-muted">Calendar and Gmail drafts fully active.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[10px] text-text-secondary leading-relaxed">Agent is currently running with local mock fallbacks.</p>
                <button
                  onClick={handleConnectGoogle}
                  className="w-full py-1.5 rounded-lg bg-accent/10 hover:bg-accent/20 border border-accent/20 text-[10px] font-semibold text-accent transition flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3 animate-spin-slow" />
                  <span>Link Google Calendar & Gmail</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* User profile footer */}
        <div className="pt-6 border-t border-white/[0.04] space-y-4">
          <div className="flex items-center space-x-3">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-10 h-10 rounded-full border border-white/10" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center border border-accent/20 text-accent">
                <UserIcon className="w-4 h-4" />
              </div>
            )}
            <div className="overflow-hidden">
              <span className="text-sm font-semibold text-text-primary block truncate leading-tight">
                {user.displayName || "Clutch User"}
              </span>
              <span className="text-xs text-text-muted block truncate">
                {user.email}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => triggerSeeder()}
              className="px-2.5 py-2 rounded-lg bg-bg-base border border-white/5 text-[11px] font-semibold text-text-secondary hover:text-text-primary hover:border-white/10 transition flex items-center justify-center space-x-1 cursor-pointer"
              title="Reset tasks and load standard demo dataset"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Seed scenario</span>
            </button>

            <button
              onClick={handleSignOut}
              className="px-2.5 py-2 rounded-lg bg-risk-rescue/10 border border-risk-rescue/15 text-[11px] font-semibold text-risk-rescue hover:bg-risk-rescue/15 transition flex items-center justify-center space-x-1 cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Exit app</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container Content */}
      <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full overflow-y-auto space-y-8">
        
        {/* HEADER BRAND BAR */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.04] pb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-text-primary capitalize">
              {activeTab === "today" 
                ? "Guardian Command Center" 
                : activeTab === "tasks" 
                ? "Active commitments" 
                : activeTab === "hood"
                ? "Under the Hood"
                : "Autonomous agent Loop"}
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              {activeTab === "today" 
                ? "Your morning briefing and critical rescues at a glance." 
                : activeTab === "tasks" 
                ? "Capture commitments from syllabus text/photos and view your deadline risk." 
                : activeTab === "hood"
                ? "Autonomous reasoning graph, Google Tech Map, and trust settings."
                : "Real-time thinking and action traces of your Deadline Guardian Agent."}
            </p>
          </div>

          <div className="flex items-center space-x-3 self-start sm:self-auto">
            <button
              onClick={triggerAgentLoop}
              disabled={runningAgent}
              className="px-4 py-2.5 rounded-xl bg-accent text-text-primary text-xs font-semibold hover:bg-accent-hover transition shadow-lg shadow-accent/10 border border-white/10 flex items-center space-x-2 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {runningAgent ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
              <span>{runningAgent ? "Guarding..." : "Run Clutch"}</span>
            </button>
          </div>
        </header>

        {/* TAB 1: TODAY (Home Dashboard) */}
        {activeTab === "today" && (
          <div className="space-y-8 animate-fade-in">
            {/* Morning Briefing Hero Card */}
            <div className="bg-gradient-to-r from-bg-panel via-bg-panel to-accent/5 border border-white/[0.06] rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-accent opacity-[0.03] blur-[60px] pointer-events-none" />
              
              <div className="flex items-center space-x-2 text-xs font-semibold text-accent uppercase tracking-wider font-mono mb-4">
                <Sparkles className="w-4 h-4" />
                <span>Morning Briefing • Today, {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
              </div>

              <div className="space-y-4 max-w-3xl">
                <h3 className="text-lg md:text-xl font-medium text-text-primary leading-relaxed">
                  {latestAgentRun?.summary ? (
                    <span>
                      {latestAgentRun.summary}
                    </span>
                  ) : (
                    <span>
                      Good morning, <strong className="text-accent">{user?.displayName?.split(" ")[0] || "Aarav"}</strong>. The one thing that matters: click <strong className="text-accent">"Run Clutch"</strong> at the top right to start your autonomous guardian sweep. I will inspect your deadlines, compute risk ratings, secure calendar blocks, and draft essential follow-ups.
                    </span>
                  )}
                </h3>
                <p className="text-sm text-text-secondary">
                  {latestAgentRun?.summary ? (
                    <span>
                      I've updated your dashboard in real-time. Check the <strong className="text-text-primary font-semibold">Tasks Board</strong> to see newly computed risk levels, or open the <strong className="text-text-primary">Agent Loop</strong> to inspect my reasoning path.
                    </span>
                  ) : (
                    <span>
                      You have {tasks.length} active commitments loaded. Two other tasks need you this week: the <span className="text-text-primary font-semibold">Internship follow-up email</span> and Friday's <span className="text-text-primary font-semibold">stats quiz study prep</span>.
                    </span>
                  )}
                </p>
                <div className="pt-2 flex items-center space-x-4">
                  <button 
                    onClick={() => {
                      if (highRiskTasks.length > 0) {
                        setSelectedTask(highRiskTasks[0]);
                      } else if (tasks.length > 0) {
                        setSelectedTask(tasks[0]);
                      } else {
                        showToast("Please seed or capture tasks to view details.");
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-text-primary hover:bg-white/10 transition cursor-pointer"
                  >
                    {highRiskTasks.length > 0 ? "Review Critical Task →" : "Review All Tasks →"}
                  </button>
                  <span className="text-xs text-text-muted">Overnight Autopilot: <span className="text-risk-calm font-semibold">Active</span></span>
                </div>
              </div>
            </div>

            {/* At-Risk Deadlines Strip */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider font-mono">
                Rescue Mode • Highest Risk Commitments
              </h3>

              {highRiskTasks.length === 0 ? (
                <div className="bg-bg-panel border border-white/[0.04] rounded-2xl p-10 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-risk-calm mx-auto" />
                  <p className="text-sm font-semibold text-text-primary">Nothing is on fire! low risk.</p>
                  <p className="text-xs text-text-secondary max-w-sm mx-auto">
                    All your commitments are currently on track. Paste messy tasks or load the demo week to test rescue escalation.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {highRiskTasks.slice(0, 3).map((task: any) => (
                    <div 
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className="bg-bg-panel border border-white/[0.06] rounded-2xl p-5 hover:border-white/10 transition cursor-pointer flex flex-col justify-between group relative h-48"
                    >
                      {/* Top section */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold font-mono uppercase ${getRiskStyles(task.riskBand)}`}>
                            {task.riskBand}
                          </span>
                          <span className="text-xs text-text-muted flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5 text-text-muted" />
                            <span>{getDeadlineCountdown(getDeadlineDate(task))}</span>
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-text-primary group-hover:text-accent transition line-clamp-2">
                          {task.title}
                        </h4>
                      </div>

                      {/* Bottom section */}
                      <div className="space-y-2 pt-4">
                        <div className="flex items-center justify-between text-xs text-text-secondary">
                          <span className="flex items-center space-x-1">
                            {getTaskIcon(task.type)}
                            <span className="capitalize">{task.type}</span>
                          </span>
                          <span>{task.estimatedEffortMins}m effort</span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-bg-base rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-accent h-full transition-all duration-300" 
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

        {/* TAB 2: TASKS BOARD */}
        {activeTab === "tasks" && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Capture box & multimodality Ingestion */}
            <div className="bg-bg-panel border border-white/[0.06] rounded-2xl p-6 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider font-mono flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span>Multimodal Chaos Capture</span>
                </h3>
                <span className="text-xs text-text-muted">Gemini Ingestion Engine</span>
              </div>

              <form onSubmit={handleCapture} className="space-y-4">
                <div className="relative">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste anything, snap a photo, or drop a syllabus — e.g., 'hey we have the algo essay due tomorrow 9am 1500 words on greedy vs dp, and ER diagram fri...'"
                    className="w-full bg-bg-base border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition duration-150 text-text-primary min-h-[90px] placeholder:text-text-muted"
                    disabled={capturing}
                  />
                </div>

                {captureError && (
                  <div className="p-3 bg-risk-rescue/10 border border-risk-rescue/20 text-xs text-risk-rescue rounded-xl flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{captureError}</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4">
                  {/* File Upload / Image Trigger */}
                  <div className="flex items-center space-x-2">
                    <label className="px-3.5 py-2 rounded-lg bg-bg-base border border-white/5 hover:border-white/15 text-xs text-text-secondary hover:text-text-primary font-medium transition cursor-pointer flex items-center space-x-1.5 disabled:opacity-50">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        className="hidden" 
                        disabled={capturing || uploadingImage} 
                      />
                      <ImageIcon className="w-3.5 h-3.5 text-text-muted" />
                      <span>{imageUrl ? "Image Attached" : "Upload Photo"}</span>
                    </label>

                    {imageUrl && (
                      <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/10 shrink-0">
                        <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => { setImageUrl(null); setImageBase64(null); }}
                          className="absolute inset-0 bg-black/60 flex items-center justify-center text-risk-rescue text-[8px] font-bold uppercase opacity-0 hover:opacity-100 transition"
                        >
                          Clear
                        </button>
                      </div>
                    )}

                    {uploadingImage && (
                      <span className="text-xs text-text-muted animate-pulse">Reading file...</span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={capturing || uploadingImage}
                    className="px-5 py-2 rounded-xl bg-accent hover:bg-accent-hover text-text-primary text-xs font-semibold transition flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {capturing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Running Ingest...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Capture Commitments</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* List Grouped by Day */}
            <div className="space-y-6">
              {loadingTasks ? (
                <div className="py-20 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-accent animate-spin mx-auto" />
                  <p className="text-xs text-text-muted font-mono uppercase">Retrieving commitments...</p>
                </div>
              ) : tasks.length === 0 ? (
                <div className="bg-bg-panel border border-white/[0.04] rounded-2xl p-16 text-center space-y-4 max-w-xl mx-auto">
                  <CheckCircle2 className="w-12 h-12 text-risk-calm mx-auto" />
                  <h4 className="text-lg font-bold text-text-primary">Nothing is on fire. Yet.</h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Paste a syllabus snippet, forward an email, or snap a photo of an assignment board. Or click below to instantly load Aarav's overcommitted student scenario.
                  </p>
                  <button
                    onClick={() => triggerSeeder()}
                    className="px-4 py-2 rounded-lg bg-accent text-text-primary text-xs font-semibold hover:bg-accent-hover transition border border-white/10 mx-auto block cursor-pointer"
                  >
                    Load Demo Scenario
                  </button>
                </div>
              ) : (
                Object.keys(groupedTasks).map((dayLabel) => (
                  <div key={dayLabel} className="space-y-3">
                    <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider font-mono border-b border-white/[0.04] pb-2">
                      {dayLabel}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {groupedTasks[dayLabel].map((task) => (
                        <div
                          key={task.id}
                          onClick={() => setSelectedTask(task)}
                          className="bg-bg-panel border border-white/[0.06] hover:border-white/12 p-5 rounded-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between group h-44 relative"
                        >
                          {/* Top part */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className={`text-[9px] px-2 py-0.5 rounded-full border font-semibold font-mono uppercase ${getRiskStyles(task.riskBand)}`}>
                                {task.riskBand}
                              </span>
                              <span className="text-[10px] text-text-muted flex items-center space-x-1 font-mono">
                                <Clock className="w-3 h-3 text-text-muted" />
                                <span>{getDeadlineCountdown(getDeadlineDate(task))}</span>
                              </span>
                            </div>

                            <h5 className="text-sm font-semibold text-text-primary group-hover:text-accent transition duration-150 line-clamp-2">
                              {task.title}
                            </h5>
                          </div>

                          {/* Bottom part */}
                          <div className="space-y-2 pt-3">
                            <div className="flex items-center justify-between text-[11px] text-text-secondary font-medium">
                              <span className="flex items-center space-x-1">
                                {getTaskIcon(task.type)}
                                <span className="capitalize">{task.type}</span>
                              </span>
                              <span>{task.estimatedEffortMins}m effort</span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-bg-base rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-accent h-full transition-all duration-300"
                                style={{ width: `${task.progress * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* TAB 3: AGENT LOOP (Stage 3 Tracer Shell) */}
        {activeTab === "agent" && (
          <div className="space-y-8 animate-fade-in">
            {/* Trace Hero Card */}
            <div className="bg-bg-panel border border-white/[0.06] rounded-2xl p-6 shadow-lg space-y-6">
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center border border-accent/20">
                    <Terminal className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">Cinematic Agent Trace</h3>
                    <p className="text-[11px] text-text-secondary mt-0.5">Real-time perceive-reason-act loop streaming</p>
                  </div>
                </div>
                <span className="text-[10px] text-accent font-mono font-semibold uppercase bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                  Ready to deploy in Stage 3
                </span>
              </div>

              {/* Dynamic trace display */}
              <div className="space-y-5 font-mono text-xs leading-relaxed max-w-4xl">
                {latestAgentRun && latestAgentRun.steps && latestAgentRun.steps.length > 0 ? (
                  latestAgentRun.steps.map((step: any, idx: number) => {
                    const elapsedMs = new Date(step.ts).getTime() - new Date(latestAgentRun.startedAt.seconds ? latestAgentRun.startedAt.seconds * 1000 : latestAgentRun.startedAt).getTime();
                    const elapsedSecs = Math.max(0, Math.floor(elapsedMs / 1000));
                    const formatTime = `[00:${elapsedSecs.toString().padStart(2, "0")}]`;

                    let typeBg = "bg-white/5 text-text-primary";
                    if (step.type === "reason") typeBg = "bg-accent/15 text-accent border border-accent/20";
                    else if (step.type === "tool_call") typeBg = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
                    else if (step.type === "tool_result") typeBg = "bg-blue-500/10 text-blue-400 border border-blue-500/20";
                    else if (step.type === "act") typeBg = "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-semibold";
                    else if (step.type === "reflect") typeBg = "bg-purple-500/10 text-purple-400 border border-purple-500/20";

                    return (
                      <div key={idx} className="flex items-start space-x-4 text-text-muted animate-fade-in border-l border-white/[0.04] pl-4 relative">
                        <div className="absolute left-[-4px] top-1.5 w-2 h-2 rounded-full bg-white/20 border border-bg-panel" />
                        <span className="text-accent-hover min-w-[50px] shrink-0 font-semibold">{formatTime}</span>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold tracking-wider ${typeBg}`}>{step.type}</span>
                            <span className="text-text-secondary">{step.message}</span>
                          </div>
                          {step.plannerRationale && (
                            <p className="text-[11px] italic pl-2 text-text-muted border-l border-white/10 mt-1 leading-relaxed">
                              Planner: {step.plannerRationale}
                            </p>
                          )}
                          {step.subtasks && (
                            <div className="pl-2 border-l border-white/10 mt-1 space-y-1">
                              {step.subtasks.map((st: any, sIdx: number) => (
                                <div key={sIdx} className="text-[11px] text-text-muted flex items-center space-x-1.5">
                                  <span>•</span>
                                  <span className="text-text-secondary">{st.title}</span>
                                  <span className="text-[10px] font-mono text-text-muted">({st.effortMins}m)</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {step.block && (
                            <p className="text-[11px] text-text-secondary font-mono pl-2 border-l border-white/10 mt-1">
                              👉 Focus block: {new Date(step.block.start.seconds ? step.block.start.seconds * 1000 : step.block.start).toLocaleString()} to {new Date(step.block.end.seconds ? step.block.end.seconds * 1000 : step.block.end).toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center space-y-3">
                    <Activity className="w-10 h-10 text-text-muted mx-auto animate-pulse" />
                    <p className="text-sm font-semibold text-text-secondary">No Active Traces Found</p>
                    <p className="text-xs text-text-muted max-w-md mx-auto">
                      Click <strong className="text-accent">"Run Clutch"</strong> at the top right to unleash the Deadline Guardian Agent loop! You can watch its plan, tool calls, and reflections in real time.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: UNDER THE HOOD (Technical Architecture, Google Tech Map & Autopilot Settings) */}
        {activeTab === "hood" && (
          <div className="space-y-8 animate-fade-in">
            {/* Tech Stack Matrix & Integration Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Google APIs Sync Card */}
              <div className="bg-bg-panel border border-white/[0.06] rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-accent uppercase tracking-wider font-semibold">Integrations</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold font-mono ${googleToken ? "bg-risk-calm/10 text-risk-calm border border-risk-calm/20" : "bg-white/5 text-text-muted border border-white/5"}`}>
                      {googleToken ? "ACTIVE" : "FALLBACK"}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-text-primary">Google Calendar & Gmail</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    When linked, Clutch uses secure client-side incremental OAuth to bypass heavy server-managed credential handshakes, passing the token dynamically to synchronize calendar focus blocks and write real-time draft emails.
                  </p>
                </div>
                <div>
                  {googleToken ? (
                    <div className="p-3 rounded-xl bg-risk-calm/5 border border-risk-calm/15 text-xs text-risk-calm font-medium flex items-center justify-between">
                      <span>✓ Connected as real user</span>
                      <button 
                        onClick={() => setGoogleToken(null)}
                        className="text-[10px] text-text-muted hover:text-text-primary font-semibold font-mono"
                      >
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleConnectGoogle}
                      className="w-full py-2.5 rounded-xl bg-accent text-text-primary text-xs font-semibold hover:bg-accent-hover transition flex items-center justify-center space-x-2 shadow-lg shadow-accent/10 border border-white/10 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Link Google Scopes</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Vertex AI Ready Card */}
              <div className="bg-bg-panel border border-white/[0.06] rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-accent uppercase tracking-wider font-semibold">LLM Engine</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-risk-calm/10 text-risk-calm border border-risk-calm/20 font-semibold font-mono">
                      READY
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-text-primary">Vertex AI (Gemini 2.5)</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Powered by the new Gemini 2.5 Flash model on Vertex AI. Used for structured multimodal capture (Stage 1 Ingestion), risk engine modifiers (Stage 2), and autonomous planner actions (Stage 3 function-calling loop).
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[11px] text-text-muted font-mono flex items-center justify-between">
                  <span>Engine: gemini-2.5-flash</span>
                  <span className="text-accent">Vertex Cloud API</span>
                </div>
              </div>

              {/* Firebase Cloud Firestore Card */}
              <div className="bg-bg-panel border border-white/[0.06] rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-accent uppercase tracking-wider font-semibold">Database</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-risk-calm/10 text-risk-calm border border-risk-calm/20 font-semibold font-mono">
                      ONLINE
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-text-primary">Cloud Firestore</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    A secure Firestore database houses all tasks, plan focus blocks, generated draft artifacts, and live-streaming agent trace steps. Sync is immediate, feeding the React state model in real-time.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[11px] text-text-muted font-mono flex items-center justify-between">
                  <span>Latency: &lt;15ms (live-sync)</span>
                  <span className="text-accent">Firestore Native</span>
                </div>
              </div>
            </div>

            {/* Cinematic Agent Loop Graph Diagram */}
            <div className="bg-bg-panel border border-white/[0.06] rounded-2xl p-6 md:p-8 shadow-lg space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider font-mono">
                  Autonomous reasoning graph
                </h3>
                <p className="text-xs text-text-muted mt-1">
                  Clutch's autonomous Planner → Executor → Critic runtime diagram, executing standard tool pipelines.
                </p>
              </div>

              {/* Visual Graph Layout */}
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8 pt-4">
                {/* Step 1: Perceive */}
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 w-full lg:w-64 space-y-2 text-center relative group hover:border-accent/40 transition">
                  <div className="w-10 h-10 rounded-full bg-accent/15 border border-accent/20 flex items-center justify-center text-accent mx-auto font-mono text-sm font-bold">1</div>
                  <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider font-mono">PERCEIVE</h4>
                  <p className="text-[10px] text-text-secondary leading-relaxed">
                    Loads all active user commitments, calculates basic deadlines, and reads Firestore task metrics.
                  </p>
                  <div className="hidden lg:block absolute right-[-24px] top-1/2 transform -translate-y-1/2 text-text-muted select-none group-hover:text-accent transition font-bold font-mono">→</div>
                </div>

                {/* Step 2: Reason */}
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 w-full lg:w-64 space-y-2 text-center relative group hover:border-accent/40 transition">
                  <div className="w-10 h-10 rounded-full bg-accent/15 border border-accent/20 flex items-center justify-center text-accent mx-auto font-mono text-sm font-bold">2</div>
                  <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider font-mono">REASON (PLANNER)</h4>
                  <p className="text-[10px] text-text-secondary leading-relaxed">
                    Gemini evaluates commitments, maps highest risk tasks, and formulates precise rescue operations.
                  </p>
                  <div className="hidden lg:block absolute right-[-24px] top-1/2 transform -translate-y-1/2 text-text-muted select-none group-hover:text-accent transition font-bold font-mono">→</div>
                </div>

                {/* Step 3: Act */}
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 w-full lg:w-64 space-y-2 text-center relative group hover:border-accent/40 transition">
                  <div className="w-10 h-10 rounded-full bg-accent/15 border border-accent/20 flex items-center justify-center text-accent mx-auto font-mono text-sm font-bold">3</div>
                  <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider font-mono">ACT (EXECUTOR)</h4>
                  <p className="text-[10px] text-text-secondary leading-relaxed">
                    Dispatches chosen tools: `decompose_task`, `propose_schedule`, `draft_artifact`, or `escalate`.
                  </p>
                  <div className="hidden lg:block absolute right-[-24px] top-1/2 transform -translate-y-1/2 text-text-muted select-none group-hover:text-accent transition font-bold font-mono">→</div>
                </div>

                {/* Step 4: Reflect */}
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 w-full lg:w-64 space-y-2 text-center relative group hover:border-accent/40 transition">
                  <div className="w-10 h-10 rounded-full bg-accent/15 border border-accent/20 flex items-center justify-center text-accent mx-auto font-mono text-sm font-bold">4</div>
                  <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider font-mono">REFLECT (CRITIC)</h4>
                  <p className="text-[10px] text-text-secondary leading-relaxed">
                    Validates modified state, ensures no duplicate blocks are scheduled, and generates the Morning Briefing.
                  </p>
                </div>
              </div>
            </div>

            {/* Autopilot and Trust Center Config */}
            <div className="bg-bg-panel border border-white/[0.06] rounded-2xl p-6 md:p-8 shadow-lg space-y-6">
              <div>
                <h3 className="text-base font-semibold text-text-primary">Autopilot & Trust Center</h3>
                <p className="text-xs text-text-secondary mt-1">Configure your Deadline Guardian background parameters and verify security settings.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                {/* Configuration form columns */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-text-muted font-bold mb-1.5">Work Hour Guard Rails</label>
                    <select className="w-full bg-bg-base border border-white/5 rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent/50">
                      <option>09:00 to 18:00 (Standard Business)</option>
                      <option>08:00 to 22:00 (Extensive Student)</option>
                      <option>24 Hours (Continuous Autopilot)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-text-muted font-bold mb-1.5">Guardian Nudge Frequency</label>
                    <select className="w-full bg-bg-base border border-white/5 rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent/50">
                      <option>Action-first (Silent, drafts and schedules first)</option>
                      <option>Collaborative (HITL tool confirmation)</option>
                      <option>Direct (Alerts only on critical thresholds)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-2">
                    <span className="text-[9px] font-mono text-risk-watch font-bold uppercase tracking-wider">Security and Scopes Assurance</span>
                    <p className="text-[11px] text-text-secondary leading-relaxed">
                      Clutch requests limited client-side Google API scopes. We strictly only ask for <strong className="text-text-primary">gmail.compose</strong> (allowing us to write drafts but NEVER read your personal emails) and <strong className="text-text-primary">calendar</strong> (to block focus slots). No data is ever transmitted to external servers except Gemini via Vertex AI.
                    </p>
                  </div>

                  {/* Manual Guardian sweep trigger */}
                  <div className="flex items-center justify-between bg-accent/5 border border-accent/15 rounded-xl p-4">
                    <div>
                      <h4 className="text-xs font-semibold text-text-primary">Manual Guardian Sweep</h4>
                      <p className="text-[10px] text-text-secondary mt-0.5">Force-trigger the proactive scheduled sweeping logic.</p>
                    </div>
                    <button
                      onClick={async () => {
                        showToast("Manually launching scheduled guardian sweep...");
                        try {
                          const token = isDemoMode ? "demo-token" : await auth.currentUser?.getIdToken();
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
                      className="px-3 py-1.5 rounded-lg bg-accent text-text-primary text-[10px] font-semibold hover:bg-accent-hover transition flex items-center space-x-1 border border-white/10 cursor-pointer"
                    >
                      <Play className="w-3 h-3" />
                      <span>Trigger guardian</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* COMPONENT: TASK DRAWER / DETAIL SLIDE-OUT PANEL */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/60 flex justify-end z-40 animate-fade-in" onClick={() => setSelectedTask(null)}>
          <div 
            className="w-full max-w-lg bg-bg-dialog border-l border-white/[0.08] h-full p-6 md:p-8 flex flex-col justify-between overflow-y-auto space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Meta */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold font-mono uppercase ${getRiskStyles(selectedTask.riskBand)}`}>
                  {selectedTask.riskBand} Risk
                </span>
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="text-text-muted hover:text-text-primary text-xs font-medium cursor-pointer"
                >
                  Close Drawer ✕
                </button>
              </div>

              <h3 className="text-lg font-bold text-text-primary">
                {selectedTask.title}
              </h3>

              <div className="grid grid-cols-2 gap-4 bg-bg-panel p-4 rounded-xl text-xs text-text-secondary border border-white/[0.04]">
                <div>
                  <span className="block text-text-muted font-mono uppercase text-[9px] tracking-wider">Deadline</span>
                  <span className="text-text-primary font-semibold font-mono">
                    {getDeadlineDate(selectedTask).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div>
                  <span className="block text-text-muted font-mono uppercase text-[9px] tracking-wider">Estimated Effort</span>
                  <span className="text-text-primary font-semibold">{selectedTask.estimatedEffortMins} minutes</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <span className="block text-text-muted font-mono uppercase text-[9px] tracking-wider">Instructions & Context</span>
                <div className="p-4 rounded-xl bg-bg-panel border border-white/[0.04] text-xs text-text-secondary leading-relaxed">
                  {selectedTask.description || "No specific instructions extracted. Tap Decompose to draft subtasks."}
                </div>
              </div>

              {/* Subtasks Checklist */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="block text-text-muted font-mono uppercase text-[9px] tracking-wider">Subtask Checklist</span>
                  <span className="text-[10px] text-accent font-mono">{Math.round(selectedTask.progress * 100)}% Complete</span>
                </div>

                <div className="space-y-2">
                  {selectedTask.subtasks && selectedTask.subtasks.map((subtask: any, idx: number) => (
                    <div 
                      key={idx}
                      onClick={() => toggleSubtask(selectedTask, idx)}
                      className="flex items-center space-x-3 p-3 rounded-xl bg-bg-panel hover:bg-bg-popover border border-white/[0.04] cursor-pointer transition"
                    >
                      {subtask.done ? (
                        <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-text-muted shrink-0" />
                      )}
                      <span className={`text-xs ${subtask.done ? "line-through text-text-muted" : "text-text-secondary"}`}>
                        {subtask.title}
                      </span>
                      <span className="ml-auto text-[10px] text-text-muted font-mono shrink-0">{subtask.effortMins}m</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gold-standard Generated Artifact Preview (Aarav's exact scenario) */}
              {selectedTask.title.toLowerCase().includes("algo") && !selectedTask.draftArtifactId && (
                <div className="space-y-2 pt-4">
                  <span className="block text-text-muted font-mono uppercase text-[9px] tracking-wider">
                    Agent Prepared Artifact (Pre-drafted)
                  </span>
                  <div className="p-4 rounded-xl bg-accent/5 border border-accent/15 space-y-3">
                    <div className="flex items-center justify-between text-[10px] text-accent font-mono font-medium">
                      <span>DOC DRAFT READY</span>
                      <span>420 words</span>
                    </div>
                    <div className="font-serif text-[11px] leading-relaxed text-text-secondary space-y-2">
                      <h4 className="font-bold text-text-primary">Greedy vs. Dynamic Programming: When to Trade Optimality for Speed</h4>
                      <p>
                        "Every algorithm that makes a choice faces the same gamble: take the best option in front of it now, or weigh that choice against every future consequence. Greedy algorithms take the gamble; dynamic programming refuses to. The 0/1 knapsack problem makes the stakes concrete — a greedy grab of the highest value-per-weight item can leave real value on the table, while a dynamic-programming table guarantees the optimum at the cost of…"
                      </p>
                    </div>
                    <div className="text-[10px] text-risk-watch font-semibold font-mono bg-risk-watch/10 p-2 rounded">
                      ✎ The one part only you can write: your lecturer's specific framing from Week 6 — drop it into section 3.
                    </div>
                  </div>
                </div>
              )}

              {/* Recruiter Follow-up Draft Preview */}
              {selectedTask.title.toLowerCase().includes("intern") && !selectedTask.draftArtifactId && (
                <div className="space-y-2 pt-4">
                  <span className="block text-text-muted font-mono uppercase text-[9px] tracking-wider">
                    Agent Prepared Email (Draft)
                  </span>
                  <div className="p-4 rounded-xl bg-accent/5 border border-accent/15 space-y-2 text-xs">
                    <div className="text-[10px] text-accent font-mono font-medium">GMAIL DRAFT PROPOSAL</div>
                    <div><span className="text-text-muted">Subject:</span> <span className="text-text-primary font-semibold">Following up — SDE Intern application (Aarav Sharma)</span></div>
                    <div className="text-text-secondary leading-relaxed bg-bg-panel/50 p-2 rounded border border-white/5">
                      Hi [Recruiter], thanks again for the conversation last week about the summer SDE internship. I wanted to reaffirm my interest and share that I just shipped [project] — happy to walk through it whenever useful. Best, Aarav
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Agent Prepared Artifact Preview */}
              {selectedTask.draftArtifactId && (
                <div className="space-y-2 pt-4">
                  <span className="block text-text-muted font-mono uppercase text-[9px] tracking-wider font-semibold">
                    Agent Prepared Artifact ({selectedTask.draftArtifactKind?.toUpperCase().replace("_", " ")})
                  </span>
                  <div className="p-4 rounded-xl bg-accent/5 border border-accent/15 space-y-3">
                    <div className="flex items-center justify-between text-[10px] text-accent font-mono font-medium">
                      <span>DRAFT ARTIFACT READY</span>
                      <span>Grounded via Gemini</span>
                    </div>
                    <div className="font-sans text-[11px] leading-relaxed text-text-secondary space-y-2 max-h-60 overflow-y-auto custom-scrollbar whitespace-pre-wrap">
                      {selectedTask.draftPreview}
                    </div>
                    <div className="text-[10px] text-risk-watch font-semibold font-mono bg-risk-watch/10 p-2 rounded">
                      ✓ Saved directly to your artifacts view.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="pt-6 border-t border-white/[0.06] flex items-center justify-between gap-4">
              <button
                onClick={() => handleDeleteTask(selectedTask.id)}
                className="px-4 py-2.5 rounded-xl bg-risk-rescue/10 hover:bg-risk-rescue/20 text-risk-rescue text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete task</span>
              </button>

              <button
                onClick={async () => {
                  setSelectedTask(null);
                  await triggerAgentLoop();
                }}
                disabled={runningAgent}
                className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-text-primary text-xs font-semibold transition shadow-md shadow-accent/10 flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{runningAgent ? "Rescuing..." : "Run Rescue"}</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
