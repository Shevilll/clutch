import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Download, 
  ChevronRight, 
  CheckCircle2, 
  Activity, 
  FileText, 
  Sliders, 
  Terminal, 
  ExternalLink,
  ArrowLeft,
  Monitor,
  Sparkles,
  ShieldCheck,
  Clock
} from "lucide-react";

interface PresentationTabProps {
  isPublic?: boolean;
  onBackToHome?: () => void;
}

interface SlideItem {
  index: number;
  time: number;
  duration: number;
  title: string;
  subtitle: string;
  caption: string;
  category: "Overview" | "Intake" | "Math" | "Agent" | "Security" | "Summary";
  details: string[];
}

export default function PresentationTab({ isPublic = false, onBackToHome }: PresentationTabProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Video playback states
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(90);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.8);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(1);

  // Slides data synchronised with create_slideshow.py
  const slides: SlideItem[] = [
    {
      index: 1,
      time: 0,
      duration: 5,
      title: "The Productivity Paradigm Shift",
      subtitle: "Passive Alerts vs Autonomous Doing",
      category: "Overview",
      caption: "Every day, millions of students and developers miss critical deadlines because traditional calendars and todo lists are passive.",
      details: [
        "Traditional schedules expect humans to manage their own deadlines and plan manually.",
        "They alert you when it is already too late, generating anxiety and stress.",
        "Clutch introduces a paradigm shift from passive observation to autonomous assistance."
      ]
    },
    {
      index: 2,
      time: 5,
      duration: 5,
      title: "Alerts vs Autonomous Rescue",
      subtitle: "The Stress-Generator Alternative",
      category: "Overview",
      caption: "They wait for you to fail, and then they alert you when it's already too late. That's a stress-generator.",
      details: [
        "Traditional notification triggers treat 10-minute and 10-hour tasks identically.",
        "Manual planning fails during high-pressure cycles (exams, launches, or reviews).",
        "Clutch monitors constraints in the background, acting before deadline panic peaks."
      ]
    },
    {
      index: 3,
      time: 10,
      duration: 7,
      title: "Unstructured Syllabi Ingestion",
      subtitle: "Chaos-to-Structure Extract",
      category: "Intake",
      caption: "Clutch changes everything. It moves from passive alert to autonomous execution. Simply paste a messy syllabus paragraph...",
      details: [
        "Eliminates friction of manual todo data entry.",
        "Understands complex conversational descriptions containing conditional dates and files.",
        "Powered by Vertex AI Gemini multimodal ingestion formats."
      ]
    },
    {
      index: 4,
      time: 17,
      duration: 8,
      title: "Multimodal Assignment Ingestion",
      subtitle: "Vertex AI Multimodal Processing",
      category: "Intake",
      caption: "Or snap a photo of an assignment flyer. Instantly, Gemini 2.5 Flash digests this chaos, converting it into structured tasks.",
      details: [
        "Allows direct clipboard pasting, document uploads, or whiteboard camera captures.",
        "Gemini 2.5 Flash extracts precise deadline dates, estimated effort, and nested deliverables.",
        "Saves extracted tasks directly to real-time Cloud Firestore database synced to client."
      ]
    },
    {
      index: 5,
      time: 25,
      duration: 7,
      title: "Deterministic Risk Formula",
      subtitle: "Explainable Mathematical Prioritization",
      category: "Math",
      caption: "To sort your world, Clutch runs a deterministic Risk Engine. By comparing remaining work hours against calendar hours left...",
      details: [
        "Runs on an explainable, deterministic equation: Urgency Ratio = Remaining Work / Calendar Hours.",
        "Remaining Work is dynamically computed as: Total Effort × (1.0 - Progress).",
        "Computes exact slack hours left before deadline collisions happen."
      ]
    },
    {
      index: 6,
      time: 32,
      duration: 8,
      title: "Explainable Risk Prioritization",
      subtitle: "Dynamic Scoring and Thresholds",
      category: "Math",
      caption: "...Clutch calculates a real-time Risk Score. The board dynamically resorts itself so what will hurt first rises to the top.",
      details: [
        "Applies semantic risk modifiers via Gemini (e.g. weight of exam, percentage of final grade).",
        "Detects calendar collisions (overlapping classes or appointments) adding +20 risk penalty.",
        "Groups tasks into clear bands: CALM (<30), WATCH (30-60), URGENT (60-85), and CRITICAL RESCUE (>85)."
      ]
    },
    {
      index: 7,
      time: 40,
      duration: 10,
      title: "Planner-Executor-Critic Loop",
      subtitle: "The Stateful Agent Loop Flow",
      category: "Agent",
      caption: "But Clutch doesn't stop at planning. Clicking 'Run Guardian' triggers a stateful Planner-Executor-Critic loop.",
      details: [
        "Multi-agent loop orchestrates high-end sequential goal-solving.",
        "Planner Node designs structured rescue steps matching the risk criteria.",
        "Critic-Reflect Node performs self-audits to guarantee formatting and execution safety."
      ]
    },
    {
      index: 8,
      time: 50,
      duration: 10,
      title: "Live Agent Trace Stream",
      subtitle: "Real-Time Observability Logs",
      category: "Agent",
      caption: "Watch the Agent Trace stream live as Gemini formulates a rescue plan, blocking off study time on your Google Calendar...",
      details: [
        "Renders a real-time trace stream directly inside the web client for complete trust.",
        "Displays precise tools called, input arguments parsed, and model reflection states.",
        "Ensures developer-grade explainability for judges and users alike."
      ]
    },
    {
      index: 9,
      time: 60,
      duration: 10,
      title: "Workspace Native Integrations",
      subtitle: "Google Calendar & Gmail API Tools",
      category: "Agent",
      caption: "...drafting a tailored extension request inside Gmail, and compiling a study outline directly into Google Docs.",
      details: [
        "Invokes Calendar API to automatically block out dedicated study slots inside free gaps.",
        "Invokes Gmail API to write a highly polite extension request directly inside Drafts.",
        "Creates formatted Google Docs outlines containing starting research bibliographies."
      ]
    },
    {
      index: 10,
      time: 70,
      duration: 7,
      title: "Ambient Autonomy & Cron Sweeps",
      subtitle: "Cloud Scheduler Proactive Protection",
      category: "Security",
      caption: "And Clutch is proactive. Driven by Cloud Scheduler, it performs sweeps overnight, presenting a Morning Briefing before you wake up.",
      details: [
        "Cloud Scheduler pings the Cloud Run container at regular hourly intervals.",
        "Generates a condensed Morning Briefing summarizing overnight rescues, booked blocks, and staged drafts.",
        "Maintains a state of ambient protection without requiring manual user execution sweeps."
      ]
    },
    {
      index: 11,
      time: 77,
      duration: 8,
      title: "Security & Double-Token Consent",
      subtitle: "Incremental Permissions & Sandboxing",
      category: "Security",
      caption: "Our 'Under the Hood' trust center ensures full security with incremental Google permissions and safe mock fallbacks for judges.",
      details: [
        "Implements a strict Double-Token security design ensuring zero credentials leakage.",
        "Requests minimal OAuth scopes: calendar write-access and gmail.compose only.",
        "Exposes a 'Live Sandbox' mode allowing guest judges to test with pre-configured mocks safely."
      ]
    },
    {
      index: 12,
      time: 85,
      duration: 5,
      title: "Outro: Deployed Live on GCP",
      subtitle: "Clutch - Deployed on Google Cloud",
      category: "Summary",
      caption: "A calendar tells you that you are late. Clutch makes sure you are not. Go Clutch and never miss a beat.",
      details: [
        "Fully deployed live on Google Cloud Platform (Cloud Run, Cloud Firestore, Vertex AI).",
        "Accessible at clutch.theahmadfaraz.com.",
        "Bridges the gap between data-driven calendars and active executive function."
      ]
    }
  ];

  // Track video progress and determine active slide based on current video timestamp
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const time = video.currentTime;
      setCurrentTime(time);

      // Find which slide parameters we are on
      const matchingSlide = slides.find(s => time >= s.time && time < (s.time + s.duration));
      if (matchingSlide && matchingSlide.index !== activeSlideIndex) {
        setActiveSlideIndex(matchingSlide.index);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration || 90);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, [activeSlideIndex, slides]);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(err => console.error("Error playing video:", err));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const time = parseFloat(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const vol = parseFloat(e.target.value);
    setVolume(vol);
    video.volume = vol;
    setIsMuted(vol === 0);
    video.muted = vol === 0;
  };

  const handleToggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    const newMuted = !isMuted;
    setIsMuted(newMuted);
    video.muted = newMuted;
    if (!newMuted && volume === 0) {
      setVolume(0.5);
      video.volume = 0.5;
    }
  };

  const handleJumpToSlide = (slide: SlideItem) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = slide.time;
    setCurrentTime(slide.time);
    setActiveSlideIndex(slide.index);
    if (!isPlaying) {
      video.play().catch(err => console.error("Error playing video:", err));
    }
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if ((video as any).webkitRequestFullscreen) {
      (video as any).webkitRequestFullscreen();
    } else if ((video as any).msRequestFullscreen) {
      (video as any).msRequestFullscreen();
    }
  };

  const formatTime = (timeInSeconds: number) => {
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const activeSlide = slides.find(s => s.index === activeSlideIndex) || slides[0];

  const categoryColorMap = {
    Overview: "bg-indigo-50 text-indigo-700 border-indigo-100",
    Intake: "bg-cyan-50 text-cyan-700 border-cyan-100",
    Math: "bg-violet-50 text-violet-700 border-violet-100",
    Agent: "bg-rose-50 text-rose-700 border-rose-100",
    Security: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Summary: "bg-amber-50 text-amber-700 border-amber-100"
  };

  const renderContent = () => (
    <div className="space-y-8">
      {/* Cinematic Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Widescreen Video Player Column */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative rounded-2xl md:rounded-3xl border border-slate-200/80 bg-slate-950 shadow-xl overflow-hidden aspect-video group">
            
            {/* Core HTML5 Video Element */}
            <video
              ref={videoRef}
              src="/clutch_presentation.mp4"
              className="w-full h-full object-contain cursor-pointer"
              playsInline
              onClick={handlePlayPause}
            />

            {/* Custom Overlay Play Button (Invisible when playing unless hovered) */}
            <AnimatePresence>
              {!isPlaying && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={handlePlayPause}
                  className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] flex items-center justify-center cursor-pointer z-10"
                >
                  <div className="w-16 h-16 rounded-full bg-white/95 text-accent shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform duration-200">
                    <Play className="w-7 h-7 text-indigo-600 fill-indigo-600 translate-x-0.5" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Custom Interactive Player Controller Bar */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-4 flex flex-col space-y-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
              
              {/* Progress Slider Bar */}
              <div className="flex items-center space-x-3 w-full">
                <input
                  type="range"
                  min="0"
                  max={duration}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:h-1.5 transition-all outline-none"
                />
              </div>

              {/* Playback Controls & Timestamps */}
              <div className="flex items-center justify-between text-white text-xs font-mono font-medium">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handlePlayPause}
                    className="hover:text-indigo-400 transition-colors cursor-pointer"
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause className="w-4.5 h-4.5" /> : <Play className="w-4.5 h-4.5 fill-current" />}
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleToggleMute}
                      className="hover:text-indigo-400 transition-colors cursor-pointer"
                      aria-label={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? <VolumeX className="w-4.5 h-4.5" /> : <Volume2 className="w-4.5 h-4.5" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                  </div>

                  <span>
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/15 border border-white/10 uppercase tracking-widest text-indigo-300 font-bold scale-90">
                    Slide {activeSlideIndex}/12
                  </span>
                  <button
                    onClick={handleFullscreen}
                    className="hover:text-indigo-400 transition-colors cursor-pointer"
                    aria-label="Fullscreen"
                  >
                    <Maximize className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Burned-in Subtitle Preview Box */}
          <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-center min-h-[70px]">
            <div className="absolute top-2 left-3 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[8px] font-mono font-bold text-indigo-400 uppercase tracking-widest">Burned Caption Subtitles</span>
            </div>
            <p className="text-sm font-medium text-slate-100 text-center leading-relaxed italic select-none pt-2">
              "{activeSlide.caption}"
            </p>
          </div>
        </div>

        {/* Slide Selector Deck Column (Right Column) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/60 rounded-3xl p-5 shadow-md flex flex-col justify-between h-[450px] lg:h-[500px]">
          <div className="space-y-4 overflow-hidden flex flex-col h-full">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-950">Interactive Slide Deck</h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 border border-slate-200/40 px-2 py-0.5 rounded-md uppercase">
                12 frames
              </span>
            </div>

            {/* Scrollable list of slides */}
            <div className="overflow-y-auto pr-1 space-y-1.5 flex-1 custom-blueprint-scroll">
              {slides.map((slide) => {
                const isActive = slide.index === activeSlideIndex;
                return (
                  <button
                    key={slide.index}
                    onClick={() => handleJumpToSlide(slide)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all duration-150 cursor-pointer ${
                      isActive
                        ? "bg-indigo-50/70 border-indigo-100 text-indigo-700 shadow-sm relative"
                        : "bg-white hover:bg-slate-50 border-transparent text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      {isActive && (
                        <div className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-500 rounded-full" />
                      )}
                      <span className={`font-mono text-[10px] w-5 shrink-0 ${isActive ? "text-indigo-600 font-bold" : "text-slate-400"}`}>
                        {slide.index < 10 ? `0${slide.index}` : slide.index}
                      </span>
                      <span className="truncate leading-none">{slide.title}</span>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className={`text-[9px] font-mono ${isActive ? "text-indigo-500" : "text-slate-400"}`}>
                        {formatTime(slide.time)}
                      </span>
                      <ChevronRight className={`w-3.5 h-3.5 opacity-50 ${isActive ? "text-indigo-500 translate-x-0.5" : "text-slate-400"}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Deep-dive Technical Summary Card */}
      <div className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className={`text-[9px] font-bold font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${categoryColorMap[activeSlide.category]}`}>
                {activeSlide.category}
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-bold flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>Timestamp: {formatTime(activeSlide.time)} (Duration: {activeSlide.duration}s)</span>
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-950 mt-1">{activeSlide.title}</h3>
            <p className="text-xs text-indigo-600 font-bold tracking-tight uppercase font-mono">{activeSlide.subtitle}</p>
          </div>

          <a
            href="/clutch_presentation.mp4"
            download="clutch_presentation.mp4"
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center justify-center space-x-2 shadow-sm self-start sm:self-auto cursor-pointer btn-interactive shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Presentation Video</span>
          </a>
        </div>

        {/* Bullet details grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-8 space-y-4">
            <h4 className="text-[11px] font-mono uppercase text-slate-400 font-bold tracking-wider">Slide Deep Dive Core Bulletpoints</h4>
            <div className="space-y-3">
              {activeSlide.details.map((detail, idx) => (
                <div key={idx} className="flex items-start space-x-3 text-xs leading-relaxed text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="font-normal">{detail}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-4 space-y-4">
            <h4 className="text-[11px] font-mono uppercase text-slate-400 font-bold tracking-wider">GCP Architecture Mapping</h4>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              {activeSlide.category === "Overview" && (
                <>
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-900">Paradigm Solution</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal font-normal">
                    This frame contrasts passive notification models with our autonomous sweep logic hosted serverless on Google Cloud Platform.
                  </p>
                </>
              )}
              {activeSlide.category === "Intake" && (
                <>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-cyan-600" />
                    <span className="text-xs font-bold text-slate-900">Vertex AI Flash Ingest</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal font-normal">
                    Gemini 2.5 Flash processes unstructured context, extracting deliverables, timing constraints, and syncing states live to Cloud Firestore NoSQL.
                  </p>
                </>
              )}
              {activeSlide.category === "Math" && (
                <>
                  <div className="flex items-center space-x-2">
                    <Sliders className="w-4 h-4 text-violet-600" />
                    <span className="text-xs font-bold text-slate-900">Explainable Mathematical Core</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal font-normal">
                    Calculations run deterministically inside Node.js, compiling clear risk indices that prioritize tasks immediately.
                  </p>
                </>
              )}
              {activeSlide.category === "Agent" && (
                <>
                  <div className="flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-rose-600" />
                    <span className="text-xs font-bold text-slate-900">Stateful Execution Loops</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal font-normal">
                    Planner, Executor, and Critic sequential agent nodes trigger tools safely using double-token Firebase credentials.
                  </p>
                </>
              )}
              {activeSlide.category === "Security" && (
                <>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900">Consent and Scheduling</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal font-normal">
                    Cloud Scheduler triggers sweeps, while Firebase Auth manages secure OAuth consent without storing persistent secrets.
                  </p>
                </>
              )}
              {activeSlide.category === "Summary" && (
                <>
                  <div className="flex items-center space-x-2">
                    <Monitor className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-slate-900">Submission Live URL</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal font-normal">
                    Clutch is fully live on GCP with auto-scaling triggers. Visit the platform at clutch.theahmadfaraz.com.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // If public route, render with standalone premium wrapper
  if (isPublic) {
    return (
      <div className="space-y-8 max-w-6xl mx-auto w-full">
        {/* Standalone Elegant Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/50 pb-6 gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBackToHome}
              className="w-10 h-10 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 transition cursor-pointer btn-interactive shrink-0"
              aria-label="Back to home"
            >
              <ArrowLeft className="w-4.5 h-4.5" />
            </button>
            <div>
              <div className="flex items-center space-x-2 text-[10px] font-bold text-indigo-600 uppercase tracking-wider font-mono">
                <span>CLUTCH PROJECT PRESENTATION</span>
                <span>•</span>
                <span className="text-slate-400">STANDALONE DECK VIEW</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-950 mt-1">Presentation Slideshow & Audio Suite</h2>
              <p className="text-xs text-slate-500 leading-normal">
                Observe the complete Clutch concept deck synchronized with vocal narratives and burned captions.
              </p>
            </div>
          </div>

          <button
            onClick={onBackToHome}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold hover:shadow-indigo-500/10 transition-all duration-200 shadow-md border border-white/10 flex items-center space-x-2 cursor-pointer btn-interactive self-start sm:self-auto shrink-0"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Enter App Dashboard</span>
          </button>
        </div>

        {renderContent()}
      </div>
    );
  }

  // Inside the main private tabs layout
  return renderContent();
}
