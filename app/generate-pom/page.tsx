"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Home, Sparkles, Download, Copy, Check, Terminal, FileCode,
  Search, X, Lock, Plus, Boxes, RefreshCw, Moon, Sun, Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generatePomXml } from "@/lib/templates/pom-generator";
import { generateBuildGradle } from "@/lib/templates/gradle-generator";
import { DEPENDENCIES } from "@/lib/constants";
import { FALLBACK_SPRING_VERSIONS, FALLBACK_JAVA_VERSIONS } from "@/lib/springInitializr";
import { WizardState, DependencyDef } from "@/lib/types";

const CATEGORY_META: Record<string, { label: string; badge: string }> = {
  all: { label: "All Dependencies", badge: "border-slate-500/30 text-slate-700 dark:text-slate-300 bg-slate-500/10" },
  archforge: { label: "✨ Production Code Modules", badge: "border-amber-500/40 text-amber-700 dark:text-amber-300 bg-amber-500/10 font-bold" },
  core: { label: "Core Web & Data", badge: "border-blue-500/30 text-blue-700 dark:text-blue-400 bg-blue-500/10" },
  security: { label: "Security & Auth", badge: "border-violet-500/30 text-violet-700 dark:text-violet-400 bg-violet-500/10" },
  database: { label: "SQL NoSQL & Caching", badge: "border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10" },
  messaging: { label: "Messaging & Events", badge: "border-purple-500/30 text-purple-700 dark:text-purple-400 bg-purple-500/10" },
  devtools: { label: "DevOps & Tooling", badge: "border-cyan-500/30 text-cyan-700 dark:text-cyan-400 bg-cyan-500/10" },
};

const ALWAYS_INCLUDED = ["web", "lombok"];

export default function PomGeneratorPage() {
  const [config, setConfig] = useState<WizardState>({
    projectName: "demo-service",
    groupId: "com.example",
    artifactId: "demo-service",
    buildTool: "maven",
    javaVersion: "21",
    springBootVersion: "3.5.3",
    architecture: "layered",
    dependencies: ["web", "lombok"],
  });

  const [springVersions, setSpringVersions] = useState<any[]>(FALLBACK_SPRING_VERSIONS);
  const [javaVersions, setJavaVersions] = useState<any[]>(FALLBACK_JAVA_VERSIONS);
  const [allDependencies, setAllDependencies] = useState<DependencyDef[]>(DEPENDENCIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [customDepInput, setCustomDepInput] = useState("");
  const [showCustomAdd, setShowCustomAdd] = useState(false);
  const [mavenSearchResults, setMavenSearchResults] = useState<any[]>([]);
  const [isSearchingMaven, setIsSearchingMaven] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch live Spring metadata from API
  useEffect(() => {
    async function loadMetadata() {
      try {
        const res = await fetch("/api/metadata");
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.versions) && json.versions.length > 0) {
            setSpringVersions(json.versions);
          }
          if (Array.isArray(json.javaVersions) && json.javaVersions.length > 0) {
            setJavaVersions(json.javaVersions);
          }
          if (Array.isArray(json.dependencies) && json.dependencies.length > 0) {
            setAllDependencies(json.dependencies);
          }
        }
      } catch (err) {
        console.warn("Using fallback metadata", err);
      }
    }
    loadMetadata();
  }, []);

  // Live Maven search on custom dependency input
  useEffect(() => {
    const q = customDepInput.trim();
    if (!q || q.length < 2) {
      setMavenSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingMaven(true);
      try {
        const res = await fetch(`/api/search-maven?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const json = await res.json();
          setMavenSearchResults(json.results || []);
        }
      } catch (err) {
        console.warn("Maven Central Search error", err);
      } finally {
        setIsSearchingMaven(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [customDepInput]);

  const selectedSet = useMemo(
    () => new Set([...ALWAYS_INCLUDED, ...(config.dependencies || [])]),
    [config.dependencies]
  );

  const toggleDependency = (id: string) => {
    if (ALWAYS_INCLUDED.includes(id)) return;
    const next = new Set(selectedSet);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setConfig((prev) => ({ ...prev, dependencies: Array.from(next) }));
  };

  const handleAddCustomDependency = (explicitId?: string) => {
    const raw = explicitId || customDepInput.trim();
    if (!raw) return;
    const cleanId = raw.includes(":") ? raw : raw.toLowerCase().replace(/\s+/g, "-");
    const next = new Set(selectedSet);
    next.add(cleanId);
    setConfig((prev) => ({ ...prev, dependencies: Array.from(next) }));
    setCustomDepInput("");
    setMavenSearchResults([]);
    setShowCustomAdd(false);
  };

  // Generate code string dynamically
  const generatedCode = useMemo(() => {
    if (config.buildTool === "gradle") {
      return generateBuildGradle(config);
    }
    return generatePomXml(config);
  }, [config]);

  const fileName = config.buildTool === "gradle" ? "build.gradle" : "pom.xml";
  const mimeType = config.buildTool === "gradle" ? "text/plain" : "application/xml";

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    setIsGenerating(true);
    try {
      const blob = new Blob([generatedCode], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setTimeout(() => setIsGenerating(false), 600);
    }
  };

  const handleCopyCurl = useCallback(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const deps = (config.dependencies || []).join(",");
    const cmd = `curl "${origin}/api/generate-pom?type=${config.buildTool}&bootVersion=${config.springBootVersion}&groupId=${config.groupId}&artifactId=${config.artifactId}&name=${config.projectName}&javaVersion=${config.javaVersion}&dependencies=${deps}" -o ${fileName}`;
    navigator.clipboard.writeText(cmd);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2500);
  }, [config, fileName]);

  const filteredDependencies = useMemo(() => {
    return allDependencies.filter((dep) => {
      const matchesCategory = selectedCategory === "all" || dep.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        dep.label.toLowerCase().includes(q) ||
        dep.description.toLowerCase().includes(q) ||
        dep.id.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [allDependencies, selectedCategory, searchQuery]);

  return (
    <div className="h-screen h-[100dvh] max-h-screen bg-mesh text-foreground flex flex-col relative overflow-hidden">
      {/* Navigation Header */}
      <header className="h-16 glass-panel border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-6 shrink-0 z-30">
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
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-black shadow">
              <FileCode className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-sm tracking-tight gradient-text">
              pom.xml Generator
            </span>
          </div>

          <Link
            href="/generate"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-colors bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10"
            title="Switch to full project ZIP generator"
          >
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            <span>Full Project Scaffolder</span>
          </Link>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyCurl}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-panel text-xs font-mono font-semibold text-slate-700 dark:text-foreground hover:bg-slate-200/60 dark:hover:bg-white/5 transition-all border border-slate-300 dark:border-white/10"
            title="Copy cURL command for terminal download"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline font-bold">
              {copiedCurl ? "cURL Copied!" : "cURL"}
            </span>
          </button>

          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-xl glass-panel text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground transition-colors border border-slate-300 dark:border-white/10"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace (2-Column split: Form/Selector left, Live Preview right) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Form & Dependencies */}
        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col space-y-6">
          {/* Metadata Bar */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold flex items-center gap-2">
                <FileCode className="w-4 h-4 text-blue-500" />
                <span>Project & Build Config</span>
              </h2>

              {/* Build Tool Switcher */}
              <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-black/40 p-1 rounded-xl border border-slate-300 dark:border-white/10">
                <button
                  onClick={() => setConfig((prev) => ({ ...prev, buildTool: "maven" }))}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all",
                    config.buildTool === "maven"
                      ? "bg-white dark:bg-blue-600 text-blue-700 dark:text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-white"
                  )}
                >
                  Maven (pom.xml)
                </button>
                <button
                  onClick={() => setConfig((prev) => ({ ...prev, buildTool: "gradle" }))}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all",
                    config.buildTool === "gradle"
                      ? "bg-white dark:bg-blue-600 text-blue-700 dark:text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-white"
                  )}
                >
                  Gradle (build.gradle)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Group ID</label>
                <input
                  type="text"
                  value={config.groupId}
                  onChange={(e) => setConfig((prev) => ({ ...prev, groupId: e.target.value }))}
                  className="w-full bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Artifact ID</label>
                <input
                  type="text"
                  value={config.artifactId}
                  onChange={(e) => setConfig((prev) => ({ ...prev, artifactId: e.target.value, projectName: e.target.value }))}
                  className="w-full bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Spring Boot Version</label>
                <select
                  value={config.springBootVersion}
                  onChange={(e) => setConfig((prev) => ({ ...prev, springBootVersion: e.target.value }))}
                  className="w-full bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono outline-none focus:border-blue-500"
                >
                  {springVersions.map((v: any) => (
                    <option key={v.version} value={v.version} className="bg-slate-900 text-white">
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Java Version</label>
                <select
                  value={config.javaVersion}
                  onChange={(e) => setConfig((prev) => ({ ...prev, javaVersion: e.target.value }))}
                  className="w-full bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono outline-none focus:border-blue-500"
                >
                  {javaVersions.map((j: any) => (
                    <option key={j.version} value={j.version} className="bg-slate-900 text-white">
                      Java {j.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Dependency Selector */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-white/10 flex-1 flex flex-col space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-violet-400" />
                  <span>Select Dependencies</span>
                  <span className="text-xs font-mono font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/30">
                    {selectedSet.size} selected
                  </span>
                </h3>
              </div>

              {/* Search & Custom Dependency */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-60">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search starters..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl text-xs outline-none focus:border-blue-500"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setShowCustomAdd(!showCustomAdd)}
                  className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 text-xs font-bold font-mono border border-blue-500/30 flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Custom Maven</span>
                </button>
              </div>
            </div>

            {/* Custom Dependency Search Drawer */}
            <AnimatePresence>
              {showCustomAdd && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 bg-slate-100 dark:bg-black/50 border border-blue-500/40 rounded-xl space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="e.g. org.modelmapper:modelmapper:3.2.0"
                      value={customDepInput}
                      onChange={(e) => setCustomDepInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddCustomDependency()}
                      className="flex-1 bg-white dark:bg-black/40 border border-slate-300 dark:border-white/20 rounded-lg px-3 py-1.5 text-xs font-mono outline-none"
                    />
                    <button
                      onClick={() => handleAddCustomDependency()}
                      className="px-3 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-500"
                    >
                      Add
                    </button>
                  </div>

                  {isSearchingMaven && (
                    <div className="text-[11px] text-blue-400 font-mono flex items-center gap-1.5">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Searching Maven Central...
                    </div>
                  )}

                  {mavenSearchResults.length > 0 && (
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {mavenSearchResults.map((res, i) => (
                        <div
                          key={i}
                          onClick={() => handleAddCustomDependency(`${res.groupId}:${res.artifactId}:${res.version}`)}
                          className="p-1.5 rounded hover:bg-blue-500/20 cursor-pointer flex items-center justify-between text-[11px] font-mono"
                        >
                          <span className="text-blue-400 font-semibold">{res.groupId}:{res.artifactId}</span>
                          <span className="text-slate-400">{res.version}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
              {Object.entries(CATEGORY_META).map(([catKey, meta]) => (
                <button
                  key={catKey}
                  onClick={() => setSelectedCategory(catKey)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border",
                    selectedCategory === catKey
                      ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                      : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  {meta.label}
                </button>
              ))}
            </div>

            {/* Dependency Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[380px] overflow-y-auto custom-scrollbar p-1">
              {filteredDependencies.map((dep) => {
                const isChecked = selectedSet.has(dep.id);
                return (
                  <div
                    key={dep.id}
                    onClick={() => toggleDependency(dep.id)}
                    className={cn(
                      "p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2",
                      isChecked
                        ? "bg-blue-500/10 border-blue-500/50 shadow-sm"
                        : "bg-white/50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20"
                    )}
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      <span className="text-base shrink-0">{dep.icon}</span>
                      <div className="min-w-0">
                        <div className="font-bold text-xs truncate text-slate-900 dark:text-white">{dep.label}</div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{dep.description}</p>
                      </div>
                    </div>

                    <div className="shrink-0 mt-0.5">
                      {dep.alwaysIncluded ? (
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <div
                          className={cn(
                            "w-4 h-4 rounded border flex items-center justify-center transition-all",
                            isChecked ? "bg-blue-600 border-blue-500 text-white" : "border-slate-300 dark:border-white/20"
                          )}
                        >
                          {isChecked && <Check className="w-2.5 h-2.5" />}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* Right Column: Code Preview Panel */}
        <aside className="w-[450px] xl:w-[520px] shrink-0 p-6 border-l border-slate-200 dark:border-white/10 bg-slate-900/50 flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-blue-400 flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-emerald-400" />
              Live Generated {fileName}
            </span>

            {/* Icon-Only Download & Copy Toolbar Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleDownloadFile}
                className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer"
                title={`Download ${fileName}`}
                aria-label={`Download ${fileName}`}
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={handleCopyCode}
                className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-all cursor-pointer"
                title={copied ? "Copied!" : "Copy code"}
                aria-label="Copy code"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Main Code View Container */}
          <div className="glass-panel rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex-1 flex flex-col shadow-2xl bg-[#0a0f1d]">
            {/* Window Bar */}
            <div className="flex items-center justify-between px-3.5 py-2 border-b border-white/10 bg-black/40">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              </div>
              <span className="text-[11px] font-mono font-bold text-cyan-300">{fileName}</span>
            </div>

            {/* Code Content View */}
            <div className="flex-1 p-4 overflow-auto custom-scrollbar font-mono text-xs text-slate-200 leading-relaxed bg-[#060913]">
              <pre className="whitespace-pre">
                <code>{generatedCode}</code>
              </pre>
            </div>

            {/* Action Download Footer */}
            <div className="p-3 border-t border-white/10 bg-black/40 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">
                Ready to compile
              </span>

              <button
                onClick={handleDownloadFile}
                disabled={isGenerating}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs hover:brightness-110 transition-all shadow-lg glow-primary cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download {fileName}</span>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
