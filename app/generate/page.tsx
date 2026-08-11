"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StepSidebar } from "@/components/wizard/StepSidebar";
import { ProjectInfoStep } from "@/components/wizard/ProjectInfoStep";
import { ArchitectureStep } from "@/components/wizard/ArchitectureStep";
import { DependenciesStep } from "@/components/wizard/DependenciesStep";
import { FolderPreview } from "@/components/preview/FolderPreview";
import { WizardState, CustomTreeAction } from "@/lib/types";
import { useTheme } from "next-themes";
import { Moon, Sun, Home, CheckCircle2, XCircle, Eye, X, Terminal, Check, FileCode } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Project Metadata", description: "Package & Java 21 info", icon: "📋" },
  { id: 2, label: "Architecture", description: "Structural pattern", icon: "🏗️" },
  { id: 3, label: "Dependencies", description: "Security, DB & DevOps", icon: "📦" },
];

const DEFAULT_STATE: WizardState = {
  projectName: "inventory-service",
  groupId: "com.java",
  artifactId: "inventory-service",
  buildTool: "maven",
  javaVersion: "21",
  springBootVersion: "3.5.3",
  architecture: "layered",
  dependencies: ["web", "lombok"],
  customTreeActions: [],
};

type Status = "idle" | "generating" | "success" | "error";

export default function GeneratePage() {
  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [wizardState, setWizardState] = useState<WizardState>(DEFAULT_STATE);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [mounted, setMounted] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopyCurl = useCallback(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const deps = (wizardState.dependencies || []).join(",");
    const cmd = `curl "${origin}/api/starter.zip?type=${wizardState.buildTool}&bootVersion=${wizardState.springBootVersion}&groupId=${wizardState.groupId}&artifactId=${wizardState.artifactId}&name=${wizardState.projectName}&javaVersion=${wizardState.javaVersion}&architecture=${wizardState.architecture}&dependencies=${deps}" -o ${wizardState.artifactId}.zip`;
    navigator.clipboard.writeText(cmd);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2500);
  }, [wizardState]);

  const markComplete = (s: number) => {
    setCompletedSteps((prev) => (prev.includes(s) ? prev : [...prev, s]));
  };

  const handleStep1Next = useCallback((data: Partial<WizardState>) => {
    setWizardState((prev) => ({ ...prev, ...data }));
    markComplete(1);
    setStep(2);
  }, []);

  const handleStep2Next = useCallback((data: Partial<WizardState>) => {
    setWizardState((prev) => ({ ...prev, ...data }));
    markComplete(2);
    setStep(3);
  }, []);

  const handleCustomActionsChange = useCallback((actions: CustomTreeAction[]) => {
    setWizardState((prev) => ({ ...prev, customTreeActions: actions }));
  }, []);

  const handleGenerate = useCallback(async (deps: string[]) => {
    const finalState = { ...wizardState, dependencies: deps };
    setWizardState(finalState);
    setStatus("generating");
    setErrorMsg("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalState),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || `Server error: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${finalState.artifactId}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      markComplete(3);
      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Generation failed. Please try again.");
    }
  }, [wizardState]);

  const handleGeneratePom = useCallback(async (deps: string[]) => {
    const finalState = { ...wizardState, dependencies: deps };
    setWizardState(finalState);
    setStatus("generating");
    setErrorMsg("");

    try {
      const response = await fetch("/api/generate-pom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalState),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || `Server error: ${response.status}`);
      }

      const isGradle = finalState.buildTool === "gradle";
      const filename = isGradle ? "build.gradle" : "pom.xml";
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      markComplete(3);
      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "pom.xml generation failed. Please try again.");
    }
  }, [wizardState]);

  const progress = Math.round((completedSteps.length / 3) * 100);

  return (
    <div className="h-screen h-[100dvh] max-h-screen bg-slate-50 dark:bg-mesh text-foreground flex flex-col relative overflow-hidden">
      {/* Background ambient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-blue-500/10 dark:bg-blue-600/15 blur-[120px]" />
        <div className="absolute top-1/3 -right-32 w-[550px] h-[550px] rounded-full bg-indigo-500/10 dark:bg-violet-600/15 blur-[140px]" />
      </div>

      {/* Top Navigation Bar */}
      <header className="h-16 glass-panel bg-white/85 dark:bg-slate-900/80 border-b border-slate-200/90 dark:border-white/10 flex items-center justify-between px-6 shrink-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground transition-colors"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Home</span>
          </Link>

          <div className="h-4 w-px bg-slate-300 dark:bg-white/10 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-black shadow">
              AF
            </div>
            <span className="font-extrabold text-sm tracking-tight gradient-text">
              Project Generator
            </span>
          </div>

          <Link
            href="/generate-pom"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-colors bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10"
            title="Switch to standalone pom.xml generator"
          >
            <FileCode className="w-3.5 h-3.5 text-blue-500" />
            <span>pom.xml Generator</span>
          </Link>
        </div>

        {/* Center Progress Bar */}
        <div className="hidden md:flex items-center gap-3 w-64">
          <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-black/40 border border-slate-300 dark:border-white/10 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">{progress}%</span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Copy CLI / cURL Command Button */}
          <button
            onClick={handleCopyCurl}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-panel text-xs font-mono font-semibold text-slate-700 dark:text-foreground hover:bg-slate-200/60 dark:hover:bg-white/5 transition-all border border-slate-300 dark:border-white/10"
            title="Copy cURL command for terminal download"
          >
            {copiedCurl ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500 font-bold">Copied cURL!</span>
              </>
            ) : (
              <>
                <Terminal className="w-3.5 h-3.5 text-blue-500 dark:text-cyan-400" />
                <span>cURL</span>
              </>
            )}
          </button>

          {/* Mobile Preview Toggle */}
          <button
            onClick={() => setShowMobilePreview(true)}
            className="xl:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-panel text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-white transition-colors border border-blue-500/30"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Tree Preview</span>
          </button>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-xl glass-panel hover:bg-slate-200/60 dark:hover:bg-white/5 transition-colors text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground"
            aria-label="Toggle theme"
          >
            {!mounted ? (
              <div className="w-4 h-4" />
            ) : theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-blue-600" />
            )}
          </button>
        </div>
      </header>

      {/* Main 3-Column Layout */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Column 1: Step Sidebar (Left Edge) */}
        <StepSidebar
          steps={STEPS}
          currentStep={step}
          completedSteps={completedSteps}
          onStepClick={(stepId) => setStep(stepId)}
        />

        {/* Column 2: Wizard Main Content (Center - max-w-2xl) */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:py-8 pb-12 md:pb-16 flex justify-center">
          <div className="w-full max-w-2xl pb-8">
            {/* Status Banners */}
            <AnimatePresence>
              {status === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-3 p-4 mb-6 rounded-2xl glass-panel border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                >
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                  <div>
                    <div className="font-bold text-sm">Spring Boot Project Generated!</div>
                    <div className="text-xs text-emerald-200/80">
                      Your ZIP file is downloading. Unzip and run <code className="font-mono bg-black/40 px-1.5 py-0.5 rounded">./mvnw spring-boot:run</code>
                    </div>
                  </div>
                  <button
                    onClick={() => setStatus("idle")}
                    className="ml-auto text-xs text-emerald-400 hover:text-white"
                  >
                    Dismiss
                  </button>
                </motion.div>
              )}

              {status === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-3 p-4 mb-6 rounded-2xl glass-panel border border-red-500/30 bg-red-500/10 text-red-300"
                >
                  <XCircle className="w-5 h-5 shrink-0 text-red-400" />
                  <div>
                    <div className="font-bold text-sm">Generation Failed</div>
                    <div className="text-xs text-red-200/80">{errorMsg}</div>
                  </div>
                  <button
                    onClick={() => setStatus("idle")}
                    className="ml-auto text-xs text-red-400 hover:text-white"
                  >
                    Dismiss
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Steps Container with AnimatePresence */}
            <AnimatePresence mode="wait">
              {step === 1 && (
                <ProjectInfoStep
                  key="step1"
                  data={wizardState}
                  onNext={handleStep1Next}
                  onChange={(partial) => setWizardState((prev) => ({ ...prev, ...partial }))}
                />
              )}
              {step === 2 && (
                <ArchitectureStep
                  key="step2"
                  data={wizardState}
                  onNext={handleStep2Next}
                  onBack={() => setStep(1)}
                  onChange={(partial) => setWizardState((prev) => ({ ...prev, ...partial }))}
                />
              )}
              {step === 3 && (
                <DependenciesStep
                  key="step3"
                  data={wizardState}
                  onSubmit={handleGenerate}
                  onGeneratePom={handleGeneratePom}
                  onBack={() => setStep(2)}
                  isGenerating={status === "generating"}
                  onChange={(partial) => setWizardState((prev) => ({ ...prev, ...partial }))}
                />
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Column 3: Right Live Preview Panel */}
        <aside className="hidden xl:flex xl:w-[380px] 2xl:w-[440px] shrink-0 p-6 border-l border-slate-200/90 dark:border-white/10 bg-slate-100/70 dark:bg-slate-950/50 flex-col h-full overflow-hidden">
          <FolderPreview
            state={wizardState}
            currentStep={step}
            onCustomActionsChange={handleCustomActionsChange}
          />
        </aside>
      </div>

      {/* Mobile Slide-Over Tree Drawer */}
      <AnimatePresence>
        {showMobilePreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end xl:hidden"
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-md h-full bg-[#060913] border-l border-white/10 p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-sm text-blue-400">Live Folder Preview</span>
                <button
                  onClick={() => setShowMobilePreview(false)}
                  className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-hidden">
                <FolderPreview
                  state={wizardState}
                  currentStep={step}
                  onCustomActionsChange={handleCustomActionsChange}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
