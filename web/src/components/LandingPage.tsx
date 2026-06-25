import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Activity, 
  ChevronRight, 
  Lock, 
  FileText, 
  ShieldAlert, 
  CheckCircle2, 
  Mail, 
  Clock, 
  ArrowRight,
  Play,
  Pause,
  RefreshCw,
  Shield,
  Layers,
  Sparkle,
  User,
  Check,
  Star,
  ChevronDown,
  HelpCircle,
  Calendar,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Info
} from "lucide-react";

interface LandingPageProps {
  handleStartDemo: () => void;
  handleSignIn: () => void;
}

const STAGES = [
  {
    id: 0,
    shortName: "Ingest",
    title: "Multimodal Ingestion",
    subtitle: "Messy Syllabus & Files Parsing",
    icon: <FileText className="w-4 h-4 text-indigo-500" />
  },
  {
    id: 1,
    shortName: "Risk Score",
    title: "Predictive Risk Engine",
    subtitle: "Continuous Commitment Scoring",
    icon: <ShieldAlert className="w-4 h-4 text-amber-500" />
  },
  {
    id: 2,
    shortName: "Decompose",
    title: "Task Decomposition",
    subtitle: "Breaking Down the Rescue Plan",
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />
  },
  {
    id: 3,
    shortName: "Rescue",
    title: "Autonomous Rescue",
    subtitle: "Composing Outlines & Drafts",
    icon: <Mail className="w-4 h-4 text-rose-500" />
  }
];

const STAGE_LOGS = [
  [
    `[clutch-core] Initializing ingestion engine v0.1.2`,
    `[clutch-core] Target uploaded file: syllabus_bio101.jpg`,
    `[clutch-core] Invoking Gemini Multimodal Ingestion...`,
    `[gemini-vision] Detected heading: "General Biology 101 Course Policies"`,
    `[gemini-vision] Extracted milestone: "Lab Report 4 due June 26th"`,
    `[clutch-core] Ingestion complete: 1 new critical threat stored.`
  ],
  [
    `[risk-engine] Recalculating student threat board...`,
    `[risk-engine] Active task: "Biology 101 Lab Report 4"`,
    `[risk-engine] Deadline: June 26th at 11:59 PM (due in 13h 48m)`,
    `[risk-engine] Task size: Large (~1,800 words, ~6 hours effort)`,
    `[risk-engine] Student progress detected: 0% complete`,
    `[risk-engine] WARNING: Overlapping Midterm detected on June 26th`,
    `[risk-engine] RISK SCORE: 94/100 -> CRITICAL THREAT FLAG.`
  ],
  [
    `[agent-core] Triggering tactical decomposition response...`,
    `[agent-core] Pulling biology syllabus rubric & context...`,
    `[agent-core] Generating actionable checkpoints:`,
    `[agent-core]  - Action 1: Extract data from Lab Manual page 42`,
    `[agent-core]  - Action 2: Outline Abstract & Methods section`,
    `[agent-core]  - Action 3: Generate Discussion section drafts`,
    `[agent-core] Task tree successfully written to active Workspace.`
  ],
  [
    `[rescue-writer] Initiating material draft module...`,
    `[rescue-writer] Composing academic outline for Lab Report 4`,
    `[rescue-writer] Generating email to professor Vance...`,
    `[rescue-writer] Appending personalized reasoning: midterm clash`,
    `[rescue-writer] Checking tone against academic standards: RESPECTFUL`,
    `[rescue-writer] SUCCESS: Outline and extension request draft saved.`
  ]
];

const EMAIL_BODY = `Dear Professor Vance,

I hope you're having a good week. I am reaching out regarding the Biology 101 Lab Report due tomorrow. Due to a major overlapping chemistry midterm, I am working diligently to complete it but would be incredibly grateful if a short extension of 24 hours might be possible.

Thank you so much for your time and understanding.

Sincerely,
Student (Drafted by Clutch)`;

interface TaskItem {
  id: number;
  title: string;
  completed: boolean;
}

export default function LandingPage({ handleStartDemo, handleSignIn }: LandingPageProps) {
  const [activeStage, setActiveStage] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [typedEmail, setTypedEmail] = useState("");
  
  // Interactive billing toggle for pricing section
  const [billingCycle, setBillingCycle] = useState<"monthly" | "term">("term");

  // Interactive accordion FAQ state
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Interactive todo items for Stage 2
  const [tasks, setTasks] = useState<TaskItem[]>([
    { id: 1, title: "Review Bio101 Lab Manual pg. 42", completed: true },
    { id: 2, title: "Draft Methods & Materials Abstract", completed: true },
    { id: 3, title: "Formulate Thesis Arguments & Citations", completed: false }
  ]);

  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    setIsAutoplay(false); // Stop autoplay when user starts interacting
  };

  // Autoplay stage advancement
  useEffect(() => {
    if (!isAutoplay) return;

    const interval = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % STAGES.length);
    }, 6500);

    return () => clearInterval(interval);
  }, [isAutoplay]);

  // Handle email typing effect in stage 3
  useEffect(() => {
    if (activeStage !== 3) {
      setTypedEmail("");
      return;
    }

    let index = 0;
    const typingInterval = setInterval(() => {
      setTypedEmail(() => {
        const next = EMAIL_BODY.slice(0, index + 1);
        index++;
        if (index >= EMAIL_BODY.length) {
          clearInterval(typingInterval);
        }
        return next;
      });
    }, 10);

    return () => clearInterval(typingInterval);
  }, [activeStage]);

  // Logs stagger variants
  const logsContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const logItemVariants = {
    hidden: { opacity: 0, x: -6 },
    visible: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 350, damping: 18 } }
  };

  const bentoFeatures = [
    {
      icon: <FileText className="w-5 h-5 text-indigo-600" />,
      title: "Asymmetric Document OCR Parser",
      subtitle: "Turn messy images into crisp timeline vectors",
      description: "Securely drop a syllabus PDF, calendar export, or phone photo of a lecture screen. Our custom parser decodes dates, point weights, and complex rubric rules instantly into structured timelines.",
      colSpan: "lg:col-span-8",
      accent: "indigo"
    },
    {
      icon: <ShieldAlert className="w-5 h-5 text-amber-500" />,
      title: "Predictive Risk engine",
      subtitle: "Never get surprised by overload weeks",
      description: "Clutch cross-references concurrent class point weight curves, flagging overlapping midterms or heavy paper due dates up to three weeks before they strike.",
      colSpan: "lg:col-span-4",
      accent: "amber"
    },
    {
      icon: <Layers className="w-5 h-5 text-emerald-500" />,
      title: "Tactile Decomposition Tree",
      subtitle: "Turn overwhelm into immediate action",
      description: "Break immense term papers and multi-hour lab writeups down into bite-sized, chronological micro-actions that guide your focus and defeat inertia.",
      colSpan: "lg:col-span-4",
      accent: "emerald"
    },
    {
      icon: <Mail className="w-5 h-5 text-purple-600" />,
      title: "Autonomous Outreach Drafts",
      subtitle: "Handle inevitable schedule conflicts with absolute grace",
      description: "When overlapping exam policies collide, Clutch generates highly polite, context-appropriate extension request drafts. You inspect, edit, and click send directly from your personal dashboard.",
      colSpan: "lg:col-span-8",
      accent: "purple"
    }
  ];

  const testimonials = [
    {
      quote: "I uploaded my biology, chemistry, and calculus syllabi in September. Clutch flagged a high-risk overlap in November and saved my grades by auto-drafting extension requests three weeks in advance. My professor was incredibly understanding because I reached out early.",
      author: "Maya L.",
      role: "Sophomore, Pre-Med",
      institution: "Stanford University",
      initials: "ML",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-100"
    },
    {
      quote: "The task decomposition feature is stellar. It turned a 15-page research project into modular, 10-minute micro-actions. It completely bypassed the mental dread of starting, letting me build momentum piece by piece.",
      author: "David K.",
      role: "Senior, Engineering",
      institution: "Northwestern University",
      initials: "DK",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-100"
    },
    {
      quote: "Clutch isn't a calendar or a standard planner. It's a proactive defense system that sits quietly in the background, identifying bottlenecks and organizing materials before things collapse. It changed my entire relationship with deadlines.",
      author: "Sarah M.",
      role: "Junior, Political Science",
      institution: "UC Berkeley",
      initials: "SM",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-100"
    }
  ];

  const faqs = [
    {
      q: "Is Clutch safe for my university credentials?",
      a: "Yes. Clutch does not connect to or request credentials for your university portals. You retain complete sovereignty. It works strictly on documents and schedules you explicitly upload, ensuring total privacy and control."
    },
    {
      q: "How does the email drafting feature work?",
      a: "When the risk engine identifies a critical clash (such as three exams and a major laboratory report within the same 48-hour window), Clutch writes a detailed, highly respectful, and formal email explaining the overlap and proposing an alternate schedule. It is stored as a draft, allowing you to review, edit, and send it yourself."
    },
    {
      q: "What file formats does the document parser support?",
      a: "The parser accepts PDF syllabi, Docx sheets, standard calendar invite files, or simple phone photos of print syllabi, whiteboards, or digital course dashboards (Canvas, Blackboard, and Brightspace)."
    },
    {
      q: "Can I cancel my subscription anytime?",
      a: "Yes, you have full control over your billing. You can cancel with a single click inside your account profile. Our Academic Term Pass also includes an unconditional 14-day refund window from the start of your university term."
    }
  ];

  return (
    <div className="min-h-screen bg-[#fafafb] text-[#0f172a] font-sans relative overflow-x-hidden flex flex-col justify-between selection:bg-indigo-100 selection:text-indigo-700">
      
      {/* Editorial Radiance Backdrop Fields */}
      <div className="absolute top-[-5%] left-[-5%] w-[800px] h-[800px] rounded-full bg-indigo-50/50 opacity-80 blur-[150px] pointer-events-none" />
      <div className="absolute top-[25%] right-[-5%] w-[700px] h-[700px] rounded-full bg-violet-50/40 opacity-70 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[10%] w-[600px] h-[600px] rounded-full bg-pink-50/20 opacity-50 blur-[130px] pointer-events-none" />
      
      {/* Sticky Header / Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/40 bg-[#fafafb]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 h-20 flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-3 cursor-pointer"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center relative overflow-hidden group">
              <svg viewBox="0 0 32 32" className="w-5.5 h-5.5 z-10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M8 16C8 11.5817 11.5817 8 16 8C20.4183 8 24 11.5817 24 16C24 18.5 22 21 19.5 22.5C18 23.4 17 24.5 16 26" 
                  stroke="url(#clutchNavLogoGrad)" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                />
                <circle cx="16" cy="16" r="3" fill="url(#clutchNavLogoInnerGrad)" />
                <defs>
                  <linearGradient id="clutchNavLogoGrad" x1="8" y1="8" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#4f46e5" />
                    <stop offset="1" stopColor="#8b5cf6" />
                  </linearGradient>
                  <linearGradient id="clutchNavLogoInnerGrad" x1="12.5" y1="12.5" x2="19.5" y2="19.5" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#8b5cf6" />
                    <stop offset="1" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            <div>
              <span className="font-bold text-lg tracking-tight text-slate-900 font-sans">
                Clutch
              </span>
            </div>
          </motion.div>

          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-2.5 text-xs text-slate-500 bg-white border border-slate-200/50 px-3.5 py-1.5 rounded-full shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono font-medium">System Status: Active</span>
            </div>

            <motion.button
              onClick={handleSignIn}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-sm"
            >
              Sign In
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        
        {/* HERO SECTION: Asymmetric Editorial Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center pt-16 pb-20 md:pt-24 md:pb-28 lg:pt-32 lg:pb-36">
          
          {/* Left Side: Headline & Custom CTAs (col-span-5) */}
          <div className="lg:col-span-5 flex flex-col justify-center text-left">
            
            {/* Premium System Badge */}
            <motion.div 
              className="inline-flex self-start items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-50/60 border border-indigo-100 text-indigo-700 text-[10px] font-bold mb-6 font-mono tracking-wider uppercase cursor-default"
              whileHover={{ y: -0.5 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>Autonomous Academic Safeguard</span>
            </motion.div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold tracking-[-0.04em] text-slate-900 leading-[1.08] mb-6">
              Stop getting reminded.
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500">
                Start getting saved.
              </span>
            </h1>

            {/* Description (max-width 65ch for elegant readability) */}
            <p className="text-slate-500 text-base md:text-lg leading-relaxed mb-10 max-w-[54ch]">
              Clutch is an autonomous, context-aware guardian for your academic calendar. By ingest-parsing syllabus documents, evaluating commitment risks, and decomposing enormous milestones, it drafts extension requests and study guides weeks in advance.
            </p>

            {/* Two Premium, Tactile CTAs with strict click feedback */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
              
              {/* Primary Action Button */}
              <motion.button
                id="btn-try-demo"
                onClick={handleStartDemo}
                whileHover={{ 
                  y: -1.5, 
                  boxShadow: "0 12px 30px -4px rgba(79, 70, 229, 0.2)" 
                }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="w-full sm:flex-1 px-6 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-[0_4px_20px_rgba(79,70,229,0.12)] border border-indigo-500/10 group whitespace-nowrap active:scale-[0.97]"
              >
                <span>Try the rescue</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </motion.button>

              {/* Secondary Google Auth Button */}
              <motion.button
                id="btn-sign-in-google"
                onClick={handleSignIn}
                whileHover={{ 
                  y: -1.5, 
                  backgroundColor: "#ffffff", 
                  borderColor: "#cbd5e1",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.02)" 
                }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="w-full sm:flex-1 px-6 py-4 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold flex items-center justify-center space-x-2.5 cursor-pointer shadow-sm whitespace-nowrap active:scale-[0.97]"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.22-.63-.35-1.35-.35-2.09z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Continue with Google</span>
              </motion.button>

            </div>

            {/* Premium micro-copy */}
            <div className="text-slate-400 text-xs mt-5 pl-1 font-medium flex items-center space-x-2">
              <Lock className="w-3.5 h-3.5 text-slate-300" />
              <span>Secure academic authorization. Syllabus data is entirely private.</span>
            </div>

          </div>

          {/* Right Side: Interactive Agent Trace Visualizer (col-span-7) */}
          <div className="lg:col-span-7 w-full flex flex-col">
            
            <div className="bg-white border border-slate-200 shadow-[0_24px_50px_-8px_rgba(15,23,42,0.03),0_2px_12px_rgba(15,23,42,0.01)] rounded-2xl p-6 md:p-8 flex flex-col space-y-6 relative overflow-hidden active:scale-[0.99] transition-transform duration-300">
              
              {/* Visualizer Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div className="flex items-center space-x-2.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                  </span>
                  <span className="text-xs font-bold tracking-wider text-slate-400 uppercase font-mono">
                    Live Rescue Simulation
                  </span>
                </div>
                
                {/* Autoplay Controls */}
                <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200/60 p-1 rounded-xl">
                  <motion.button
                    onClick={() => setIsAutoplay(!isAutoplay)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-lg hover:bg-white text-slate-500 hover:text-slate-800 transition-all cursor-pointer active:scale-[0.97]"
                    title={isAutoplay ? "Pause Autoplay" : "Resume Autoplay"}
                  >
                    {isAutoplay ? <Pause className="w-3.5 h-3.5 text-indigo-600" /> : <Play className="w-3.5 h-3.5 text-slate-600" />}
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setActiveStage(0);
                      setIsAutoplay(false);
                      setTasks([
                        { id: 1, title: "Review Bio101 Lab Manual pg. 42", completed: true },
                        { id: 2, title: "Draft Methods & Materials Abstract", completed: true },
                        { id: 3, title: "Formulate Thesis Arguments & Citations", completed: false }
                      ]);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-lg hover:bg-white text-slate-500 hover:text-slate-800 transition-all cursor-pointer active:scale-[0.97]"
                    title="Restart Simulation"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </div>

              {/* Stepper Tabs */}
              <div className="flex items-center justify-between p-1 bg-slate-50 border border-slate-200/50 rounded-xl relative">
                {STAGES.map((stage, idx) => (
                  <button
                    key={stage.id}
                    onClick={() => {
                      setActiveStage(idx);
                      setIsAutoplay(false); // Stop autoplay when user manually inspects
                    }}
                    className="flex-1 py-2.5 text-center text-xs font-semibold rounded-lg relative z-10 transition-colors duration-200 cursor-pointer active:scale-[0.97]"
                    style={{ color: activeStage === idx ? '#4f46e5' : '#64748b' }}
                  >
                    {activeStage === idx && (
                      <motion.div
                        layoutId="active-stage-pill"
                        className="absolute inset-0 bg-white border border-slate-200 shadow-sm rounded-lg -z-10"
                        transition={{ type: "spring", stiffness: 420, damping: 26 }}
                      />
                    )}
                    <span className="flex items-center justify-center space-x-1.5">
                      <span className={`text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-mono transition-colors ${activeStage === idx ? 'bg-indigo-50 text-indigo-600 font-bold' : 'bg-slate-200/60 text-slate-500'}`}>
                        {idx + 1}
                      </span>
                      <span className="hidden md:inline font-sans">{stage.shortName}</span>
                    </span>
                  </button>
                ))}
              </div>

              {/* Interactive Dynamic Panel Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[300px]">
                
                {/* Left Column: Context Details & Console */}
                <div className="md:col-span-5 flex flex-col justify-between space-y-4">
                  
                  {/* Meta details */}
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-mono font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                      {STAGES[activeStage].icon}
                      <span>Step {activeStage + 1} of 4</span>
                    </span>
                    <h4 className="text-sm font-bold text-slate-800 leading-tight">
                      {STAGES[activeStage].title}
                    </h4>
                    <p className="text-xs text-slate-500 leading-normal">
                      {STAGES[activeStage].subtitle}
                    </p>
                  </div>

                  {/* Light Theme Terminal logs block */}
                  <div className="flex-1 bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 font-mono text-[10px] text-slate-600 flex flex-col space-y-2 overflow-y-auto max-h-[175px] shadow-sm">
                    <div className="flex items-center space-x-1.5 border-b border-slate-200/30 pb-2 mb-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      <span className="text-[9px] text-slate-400 ml-1.5">agent_execution_logs</span>
                    </div>
                    
                    <motion.div
                      key={activeStage}
                      variants={logsContainerVariants}
                      initial="hidden"
                      animate="visible"
                      className="flex flex-col space-y-1.5"
                    >
                      {STAGE_LOGS[activeStage].map((log, index) => (
                        <motion.div 
                          key={index} 
                          variants={logItemVariants}
                          className={`leading-relaxed whitespace-pre-wrap ${
                            log.includes('[CRITICAL]') || log.includes('RISK SCORE') || log.includes('WARNING')
                              ? 'text-rose-600 font-semibold' 
                              : log.includes('SUCCESS') || log.includes('complete')
                                ? 'text-emerald-600 font-semibold' 
                                : 'text-slate-500'
                          }`}
                        >
                          {log}
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>

                </div>

                {/* Right Column: Rich Graphical Representation */}
                <div className="md:col-span-7 bg-slate-50 border border-slate-200/40 rounded-xl p-5 flex items-center justify-center overflow-hidden min-h-[220px]">
                  
                  <AnimatePresence mode="wait">
                    
                    {/* STAGE 0 Ingestion Visualizer */}
                    {activeStage === 0 && (
                      <motion.div
                        key="ingest-vis"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 350, damping: 20 }}
                        className="w-full flex flex-col items-center justify-center p-2 relative h-full"
                      >
                        {/* Scanning Document Canvas */}
                        <div className="w-full max-w-[200px] bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
                          <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-3">
                            <span className="text-[9px] font-mono font-semibold text-slate-400">syllabus_chem102.pdf</span>
                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono">1.2 MB</span>
                          </div>
                          <div className="space-y-2 text-[8px] font-mono text-slate-400">
                            <p className="border-b border-slate-50 pb-1 font-semibold text-slate-800">Chemistry 102 Syllabus</p>
                            <p>Professor: Dr. Raymond</p>
                            <div className="p-1 rounded bg-indigo-50 border border-indigo-100/40 text-[7px] text-indigo-600 relative">
                              <span className="absolute right-1.5 top-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                              [OCR MATCH]: Exam 3, June 26th
                            </div>
                            <p>Grading: Assignments (30%), Midterms (40%)</p>
                          </div>

                          {/* Scanner Laser Sweep */}
                          <motion.div 
                            animate={{ y: [-10, 140, -10] }}
                            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                            className="absolute left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-400 to-transparent pointer-events-none"
                          />
                          <div className="absolute inset-0 bg-indigo-500/[0.02] pointer-events-none" />
                        </div>
                        <span className="text-[10px] font-mono font-medium text-slate-400 mt-4">Extracting schedule vectors</span>
                      </motion.div>
                    )}

                    {/* STAGE 1 Risk Engine Meter */}
                    {activeStage === 1 && (
                      <motion.div
                        key="risk-vis"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 350, damping: 20 }}
                        className="w-full flex flex-col items-center justify-center p-2 h-full"
                      >
                        {/* Risk Dashboard Dial */}
                        <div className="relative w-36 h-36 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              stroke="#e2e8f0"
                              strokeWidth="7"
                              fill="transparent"
                            />
                            <motion.circle
                              cx="50"
                              cy="50"
                              r="40"
                              stroke="#f43f5e"
                              strokeWidth="7"
                              fill="transparent"
                              strokeDasharray="251.2"
                              initial={{ strokeDashoffset: 251.2 }}
                              animate={{ strokeDashoffset: 251.2 - (251.2 * 94) / 100 }}
                              transition={{ duration: 1.2, ease: "easeOut" }}
                              strokeLinecap="round"
                            />
                          </svg>

                          <div className="absolute flex flex-col items-center justify-center">
                            <motion.span 
                              initial={{ scale: 0.85, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                              className="text-3xl font-extrabold text-rose-500 font-mono tracking-tight"
                            >
                              94%
                            </motion.span>
                            <span className="text-[9px] font-bold text-slate-400 tracking-wider font-mono mt-0.5">
                              CRITICAL RISK
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 text-center">
                          <div className="inline-flex items-center space-x-1.5 text-[10px] px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100 font-semibold font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                            <span>Deadline Overload Match</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* STAGE 2 Decomposition Checkpoints (Interactive) */}
                    {activeStage === 2 && (
                      <motion.div
                        key="decompose-vis"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 350, damping: 20 }}
                        className="w-full flex flex-col space-y-2.5 p-2 max-w-[250px] h-full justify-center"
                      >
                        <div className="text-[10px] font-mono text-slate-400 border-b border-slate-200/50 pb-1.5 mb-1.5 flex justify-between items-center">
                          <span>Interactive Checkpoints</span>
                          <span className="text-[9px] text-indigo-500 font-medium">Click to toggle</span>
                        </div>
                        
                        {tasks.map((task) => (
                          <button
                            key={task.id}
                            onClick={() => toggleTask(task.id)}
                            className={`p-2.5 rounded-xl border flex items-center justify-between text-left text-xs font-medium cursor-pointer transition-all active:scale-[0.97] ${
                              task.completed 
                                ? 'bg-white border-slate-200 text-slate-600 shadow-sm' 
                                : 'bg-indigo-50/60 border-indigo-100 text-indigo-950 shadow-none'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5 truncate pr-2">
                              <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                                task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-350 bg-white'
                              }`}>
                                {task.completed && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                              </div>
                              <span className={`truncate ${task.completed ? 'line-through text-slate-400' : ''}`}>
                                {task.title}
                              </span>
                            </div>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                              task.completed ? 'bg-slate-100 text-slate-500' : 'bg-indigo-100 text-indigo-700 animate-pulse'
                            }`}>
                              {task.completed ? "Done" : "Pending"}
                            </span>
                          </button>
                        ))}
                      </motion.div>
                    )}

                    {/* STAGE 3 Rescue Composition Draft */}
                    {activeStage === 3 && (
                      <motion.div
                        key="rescue-vis"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 350, damping: 20 }}
                        className="w-full p-2 h-full flex flex-col justify-center"
                      >
                        {/* Email Composition UI */}
                        <div className="w-full max-w-[340px] mx-auto bg-white border border-slate-200 rounded-xl shadow-sm text-left flex flex-col overflow-hidden text-[10px]">
                          
                          {/* Mail Header */}
                          <div className="bg-slate-50/80 border-b border-slate-200/50 p-3 space-y-1.5">
                            <div className="flex justify-between items-center text-slate-400">
                              <span className="font-semibold text-slate-800">Draft Rescue Email</span>
                              <div className="flex space-x-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                              </div>
                            </div>
                            <div className="flex border-b border-slate-200/30 pb-1.5">
                              <span className="text-slate-400 w-10">To:</span>
                              <span className="text-slate-700 font-medium">prof.vance@stateuni.edu</span>
                            </div>
                            <div className="flex">
                              <span className="text-slate-400 w-10">Subject:</span>
                              <span className="text-indigo-600 font-semibold truncate">Extension request: Bio 101 Lab Report #4</span>
                            </div>
                          </div>

                          {/* Mail typed body container */}
                          <div className="p-3.5 bg-white font-sans text-slate-600 leading-relaxed min-h-[135px] overflow-y-auto max-h-[145px] flex flex-col justify-between">
                            <p className="whitespace-pre-wrap font-medium">
                              {typedEmail}
                              <span className="inline-block w-1 h-3 ml-0.5 bg-indigo-500 animate-pulse align-middle" />
                            </p>
                            <div className="flex justify-between items-center border-t border-slate-100 pt-2.5 mt-2.5 text-[9px]">
                              <span className="text-slate-400 font-mono">Drafted autonomously</span>
                              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 font-bold font-mono">Ready to Send</span>
                            </div>
                          </div>

                        </div>
                      </motion.div>
                    )}

                  </AnimatePresence>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* METRICS / PROOF STRIP */}
        <section className="border-y border-slate-200/60 py-10 my-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-1">
              <p className="text-3xl font-extrabold text-indigo-600 font-mono">98.4%</p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">On-Time Submissions</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-extrabold text-slate-900 font-mono">4.9 / 5.0</p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Academic Rating</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-extrabold text-indigo-600 font-mono">1.2M+</p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tasks Decomposed & Saved</p>
            </div>
          </div>
        </section>

        {/* BENTO GRID: Features Section */}
        <section className="py-20 md:py-28 lg:py-32">
          <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-20 space-y-4">
            <h2 className="text-xs font-bold font-mono tracking-widest text-indigo-600 uppercase">
              Engineered Defenses
            </h2>
            <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Pre-empt overload before it breaks your semester
            </h3>
            <p className="text-slate-500 text-sm md:text-base max-w-[65ch] mx-auto leading-relaxed">
              Academic success isn't about working harder; it's about seeing threats early. Clutch runs quietly in the background, transforming documents into clean, structured plans of action.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {bentoFeatures.map((feat, idx) => (
              <div 
                key={idx}
                className={`${feat.colSpan} bg-white border border-slate-200 hover:border-slate-350 rounded-2xl p-6 md:p-8 flex flex-col justify-between hover:shadow-md transition-all duration-300 active:scale-[0.97] group cursor-pointer relative overflow-hidden`}
              >
                <div className="space-y-6">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                    {feat.icon}
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold font-mono text-indigo-500 uppercase tracking-wider">
                      {feat.subtitle}
                    </span>
                    <h4 className="text-lg font-bold text-slate-950 tracking-tight">
                      {feat.title}
                    </h4>
                    <p className="text-slate-500 text-xs md:text-sm leading-relaxed max-w-[65ch]">
                      {feat.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1.5 text-xs text-indigo-600 font-semibold pt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Explore module</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
                
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-slate-50/10 to-transparent rounded-bl-full pointer-events-none" />
              </div>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS SECTION */}
        <section className="py-20 md:py-28 lg:py-32 border-t border-slate-200/60">
          <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-20 space-y-4">
            <h2 className="text-xs font-bold font-mono tracking-widest text-indigo-600 uppercase">
              Proven Resilience
            </h2>
            <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
              Approved by elite students
            </h3>
            <p className="text-slate-500 text-sm md:text-base max-w-[65ch] mx-auto leading-relaxed">
              We asked students across leading universities how they survived their most high-pressure midterm weeks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((test, idx) => (
              <div 
                key={idx}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 md:p-8 flex flex-col justify-between hover:shadow-md transition-all duration-300 active:scale-[0.97] cursor-pointer"
              >
                <div className="space-y-6">
                  {/* Rating Stars */}
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-600 text-xs md:text-sm leading-relaxed italic font-medium">
                    "{test.quote}"
                  </p>
                </div>

                <div className="flex items-center space-x-3.5 pt-8 border-t border-slate-100 mt-6">
                  <div className={`w-9 h-9 rounded-full font-mono font-bold text-xs flex items-center justify-center border ${test.badgeColor}`}>
                    {test.initials}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">
                      {test.author}
                    </h4>
                    <p className="text-[10px] text-slate-400 leading-none mt-1">
                      {test.role} • <span className="font-semibold text-slate-500">{test.institution}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PRICING PLANS SECTION */}
        <section className="py-20 md:py-28 lg:py-32 border-t border-slate-200/60">
          <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-20 space-y-4">
            <h2 className="text-xs font-bold font-mono tracking-widest text-indigo-600 uppercase">
              Transparent Pricing
            </h2>
            <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
              Priced for students, valued for life
            </h3>
            <p className="text-slate-500 text-sm md:text-base max-w-[65ch] mx-auto leading-relaxed">
              No hidden contracts, no complexity. Choose the defense rate that corresponds to your schedule.
            </p>

            {/* Interactive Billing Toggle */}
            <div className="inline-flex items-center p-1 bg-slate-100 border border-slate-200/50 rounded-xl mt-6 relative active:scale-[0.98] transition-transform">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  billingCycle === "monthly" 
                    ? "bg-white text-indigo-600 shadow-sm" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Monthly Plan
              </button>
              <button
                onClick={() => setBillingCycle("term")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center space-x-1.5 ${
                  billingCycle === "term" 
                    ? "bg-white text-indigo-600 shadow-sm" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span>Academic Term Pass</span>
                <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-[9px] text-indigo-600 font-bold border border-indigo-100">
                  Save 30%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
            
            {/* Free Tier Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all duration-300 active:scale-[0.97] cursor-pointer">
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest">
                    Basic Guard
                  </span>
                  <h4 className="text-2xl font-extrabold text-slate-900 mt-1">Base Shield</h4>
                  <p className="text-slate-500 text-xs mt-2">Essential manual planning and schedule ingestion.</p>
                </div>

                <div className="pt-2">
                  <span className="text-4xl font-extrabold text-slate-900 font-mono">$0</span>
                  <span className="text-slate-400 text-xs font-medium ml-1">/ always free</span>
                </div>

                <ul className="space-y-3.5 pt-6 border-t border-slate-100 text-xs text-slate-600 font-medium">
                  <li className="flex items-center space-x-2.5">
                    <Check className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Ingest up to 1 syllabus per month</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <Check className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Basic calendar visualization grid</span>
                  </li>
                  <li className="flex items-center space-x-2.5 text-slate-400 line-through">
                    <Lock className="w-3 h-3 text-slate-300 shrink-0" />
                    <span>Continuous multi-class threat evaluation</span>
                  </li>
                  <li className="flex items-center space-x-2.5 text-slate-400 line-through">
                    <Lock className="w-3 h-3 text-slate-300 shrink-0" />
                    <span>Autonomous instructor email drafting</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <motion.button
                  onClick={handleStartDemo}
                  whileTap={{ scale: 0.95 }}
                  className="w-full py-3.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-xs text-center cursor-pointer transition-colors active:scale-[0.97]"
                >
                  Start manually
                </motion.button>
              </div>
            </div>

            {/* Premium Tier Card */}
            <div className="bg-white border-2 border-indigo-600 rounded-2xl p-6 md:p-8 flex flex-col justify-between hover:shadow-lg transition-all duration-300 active:scale-[0.97] cursor-pointer relative overflow-hidden">
              {/* Premium Badge */}
              <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[9px] font-bold font-mono px-4 py-1.5 rounded-bl-xl tracking-wider uppercase">
                Highly Recommended
              </div>

              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-bold font-mono text-indigo-600 uppercase tracking-widest">
                    Complete Sovereignty
                  </span>
                  <h4 className="text-2xl font-extrabold text-indigo-950 mt-1">Full Term Pass</h4>
                  <p className="text-slate-500 text-xs mt-2">Continuous academic threat detection and drafts.</p>
                </div>

                <div className="pt-2">
                  <span className="text-4xl font-extrabold text-indigo-600 font-mono">
                    {billingCycle === "monthly" ? "$9" : "$29"}
                  </span>
                  <span className="text-slate-400 text-xs font-medium ml-1">
                    {billingCycle === "monthly" ? "/ month" : "/ academic term"}
                  </span>
                </div>

                <ul className="space-y-3.5 pt-6 border-t border-slate-100 text-xs text-slate-700 font-semibold">
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Unlimited concurrent syllabi uploads</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Vision OCR and document layout scanner</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Predictive multi-class threat analytics</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Autonomous Outreach draft generation</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Secure Firebase encrypted dashboard access</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <motion.button
                  onClick={handleSignIn}
                  whileTap={{ scale: 0.95 }}
                  className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs text-center cursor-pointer transition-colors shadow-md shadow-indigo-100 active:scale-[0.97]"
                >
                  Unleash Term Guard
                </motion.button>
              </div>
            </div>

          </div>
        </section>

        {/* EDITORIAL FAQ SECTION */}
        <section className="py-20 md:py-28 lg:py-32 border-t border-slate-200/60">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16 lg:mb-20 space-y-4">
              <h2 className="text-xs font-bold font-mono tracking-widest text-indigo-600 uppercase">
                Frictionless Integrity
              </h2>
              <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
                Frequently Resolved
              </h3>
              <p className="text-slate-500 text-sm md:text-base max-w-[65ch] mx-auto leading-relaxed">
                Clear answers regarding security, system integrations, and academic policies.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div 
                  key={idx}
                  className="bg-white border border-slate-200 hover:border-slate-350 rounded-2xl overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full px-6 py-5 md:py-6 flex items-center justify-between text-left font-bold text-slate-900 text-sm md:text-base cursor-pointer active:scale-[0.99] transition-transform"
                  >
                    <span className="pr-4">{faq.q}</span>
                    <motion.div
                      animate={{ rotate: activeFaq === idx ? 180 : 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="text-slate-400 shrink-0"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {activeFaq === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="px-6 pb-6 md:pb-8 text-xs md:text-sm text-slate-500 leading-relaxed border-t border-slate-50 pt-4 max-w-[70ch]">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BOTTOM CTA CARD */}
        <section className="py-12 md:py-16 lg:py-20">
          <div className="relative rounded-3xl bg-gradient-to-tr from-indigo-50 to-violet-50/50 border border-indigo-100 p-8 md:p-12 lg:p-16 overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 active:scale-[0.99] transition-transform duration-300">
            <div className="space-y-4 text-left max-w-2xl relative z-10">
              <span className="text-[10px] font-bold font-mono text-indigo-600 uppercase tracking-widest">
                Immediate Protection
              </span>
              <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Ready to secure your semester?
              </h3>
              <p className="text-slate-500 text-xs md:text-sm max-w-[65ch] leading-relaxed font-medium">
                Spend ten minutes uploading your documents today. Gain hundreds of hours of foresight and stress reduction tomorrow.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto shrink-0 relative z-10">
              <motion.button
                onClick={handleStartDemo}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs text-center cursor-pointer transition-colors active:scale-[0.97] whitespace-nowrap shadow-md shadow-indigo-100"
              >
                Try the rescue
              </motion.button>
              <motion.button
                onClick={handleSignIn}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs text-center cursor-pointer transition-colors hover:border-slate-300 active:scale-[0.97] whitespace-nowrap shadow-sm"
              >
                Continue with Google
              </motion.button>
            </div>

            {/* Subtle background glow circle */}
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-200/10 opacity-60 blur-3xl pointer-events-none" />
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-slate-400 font-medium">
          <p>© 2026 Clutch. Developed in pure TypeScript conforming to Google Vibe2Ship principles.</p>
          <div className="flex items-center space-x-6">
            <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
            <span className="text-slate-200">|</span>
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Shield</a>
            <span className="text-slate-200">|</span>
            <a href="#" className="hover:text-indigo-600 transition-colors">Security Audit Report</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
