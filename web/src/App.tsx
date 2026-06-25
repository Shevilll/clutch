import { useState } from "react";
import { Sparkles, Terminal, Activity, ChevronRight } from "lucide-react";

export default function App() {
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>("");

  const pingGemini = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("http://localhost:5001/api/ping-llm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (data.text) {
        setResponse(data.text);
      } else if (data.error) {
        setResponse(`Error: ${data.error}`);
      } else {
        setResponse("Received empty response from server.");
      }
    } catch (err: any) {
      setResponse(`Connection failed: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col justify-between p-6 md:p-12 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-accent opacity-5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-risk-calm opacity-5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20 border border-white/5">
            <Sparkles className="w-5 h-5 text-text-primary" />
          </div>
          <div>
            <span className="font-semibold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-text-primary to-text-secondary">
              Clutch
            </span>
            <span className="ml-1.5 text-xs px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/25 font-mono font-medium">
              v0.1
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs text-text-muted bg-bg-panel px-3.5 py-1.5 rounded-lg border border-white/5">
            <Activity className="w-3.5 h-3.5 text-risk-calm animate-pulse" />
            <span>Server: local (5001)</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto w-full my-auto py-12 z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-text-primary">
            Autonomous Deadline Guardian
          </h1>
          <p className="text-text-secondary text-base md:text-lg max-w-lg mx-auto">
            Testing pipeline: click below to ping the Express server and invoke Gemini via Google Vertex AI.
          </p>
        </div>

        <div className="bg-bg-panel border border-white/[0.06] rounded-2xl p-6 shadow-xl shadow-black/40">
          <form onSubmit={pingGemini} className="space-y-4">
            <div>
              <label htmlFor="prompt" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 font-mono">
                Test Prompt
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Introduce yourself as Clutch, the autonomous deadline guardian..."
                  className="w-full bg-bg-base border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition duration-150 pr-12 text-text-primary"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-2 top-2 h-8 px-3 rounded-lg bg-accent text-text-primary text-xs font-medium hover:bg-accent-hover transition flex items-center space-x-1 disabled:opacity-50"
                >
                  <span>Send</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </form>

          {/* Response area */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 font-mono">
              <span>Gemini Output</span>
              <span className="flex items-center space-x-1 text-accent">
                <Terminal className="w-3 h-3" />
                <span>gemini-2.5-flash</span>
              </span>
            </div>

            <div className="bg-bg-base border border-white/[0.06] rounded-xl p-4 min-h-[120px] max-h-[250px] overflow-y-auto font-mono text-sm leading-relaxed text-text-secondary relative">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-bg-base/80 rounded-xl">
                  <div className="flex items-center space-x-2 text-text-secondary">
                    <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              ) : null}
              {response ? (
                <p className="whitespace-pre-wrap">{response}</p>
              ) : (
                <p className="text-text-muted italic">Click send above to run a live test of the Gemini Vertex AI integration.</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-text-muted z-10 border-t border-white/[0.04] pt-6">
        <p>© 2026 Clutch. Under active development for Vibe2Ship Hackathon.</p>
      </footer>
    </div>
  );
}
