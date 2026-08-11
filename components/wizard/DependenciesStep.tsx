"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DEPENDENCIES } from "@/lib/constants";
import { WizardState, DependencyDef } from "@/lib/types";
import { ArrowLeft, Check, Lock, Boxes, Sparkles, Search, X, Plus, RefreshCw, Code2, FileCode, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface DependenciesStepProps {
  data: WizardState;
  onSubmit: (deps: string[]) => void;
  onGeneratePom?: (deps: string[]) => void;
  onBack: () => void;
  isGenerating: boolean;
  onChange?: (data: Partial<WizardState>) => void;
}

const ALWAYS_INCLUDED: string[] = ["web", "lombok"];

const CATEGORY_META: Record<string, { label: string; badge: string }> = {
  all: { label: "All Dependencies", badge: "border-slate-500/30 text-slate-700 dark:text-slate-300 bg-slate-500/10" },
  archforge: { label: "✨ Production Code Modules", badge: "border-amber-500/40 text-amber-700 dark:text-amber-300 bg-amber-500/10 font-bold" },
  core: { label: "Core Web & Data", badge: "border-blue-500/30 text-blue-700 dark:text-blue-400 bg-blue-500/10" },
  security: { label: "Security & Auth", badge: "border-violet-500/30 text-violet-700 dark:text-violet-400 bg-violet-500/10" },
  database: { label: "SQL NoSQL & Caching", badge: "border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10" },
  messaging: { label: "Messaging & Events", badge: "border-purple-500/30 text-purple-700 dark:text-purple-400 bg-purple-500/10" },
  devtools: { label: "DevOps & Tooling", badge: "border-cyan-500/30 text-cyan-700 dark:text-cyan-400 bg-cyan-500/10" },
};

// ── Reusable dependency card ────────────────────────────────────────────────
function DepCard({
  dep,
  selected,
  toggle,
}: {
  dep: DependencyDef;
  selected: Set<string>;
  toggle: (id: string, alwaysIncluded?: boolean) => void;
}) {
  const isChecked = selected.has(dep.id);
  const isCodeFeature = (dep as any).isCodeFeature || dep.category === "archforge";

  return (
    <motion.div
      whileHover={{ scale: dep.alwaysIncluded ? 1 : 1.01 }}
      whileTap={{ scale: dep.alwaysIncluded ? 1 : 0.99 }}
      onClick={() => toggle(dep.id, dep.alwaysIncluded)}
      className={cn(
        "p-3.5 rounded-2xl border glass-panel transition-all flex items-start justify-between gap-3 relative overflow-hidden select-none",
        dep.alwaysIncluded
          ? "cursor-default bg-slate-100/80 dark:bg-black/30 border-slate-200 dark:border-white/10 opacity-90"
          : "cursor-pointer",
        isChecked && !dep.alwaysIncluded
          ? isCodeFeature
            ? "bg-amber-500/10 border-amber-500 text-slate-900 dark:text-white shadow-sm dark:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
            : "bg-blue-50/80 dark:bg-blue-500/10 border-blue-500 text-slate-900 dark:text-white shadow-sm dark:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
          : !dep.alwaysIncluded && "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white/70 dark:bg-black/30"
      )}
    >
      <div className="flex items-start gap-2.5">
        <span className="text-xl mt-0.5">{dep.icon}</span>
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-xs text-slate-900 dark:text-white">{dep.label}</span>
            {dep.alwaysIncluded && (
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400 font-semibold">
                Required
              </span>
            )}
            {isCodeFeature && (
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 font-bold flex items-center gap-0.5">
                <Code2 className="w-2.5 h-2.5" />
                Generates Code
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-600 dark:text-muted-foreground mt-0.5 leading-snug font-medium line-clamp-2">
            {dep.description}
          </p>
          {dep.groupId && dep.artifactId && (
            <div className="text-[9px] font-mono text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <span className="bg-slate-200/80 dark:bg-white/10 text-blue-700 dark:text-cyan-300 px-1.5 py-0.2 rounded border border-slate-300 dark:border-white/10 font-semibold truncate max-w-[280px]">
                {dep.groupId}:{dep.artifactId}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Checkbox indicator */}
      <div className="shrink-0 mt-0.5">
        {dep.alwaysIncluded ? (
          <div className="w-5 h-5 rounded-md bg-blue-500/20 border border-blue-400 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Lock className="w-3 h-3" />
          </div>
        ) : (
          <div
            className={cn(
              "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
              isChecked
                ? isCodeFeature
                  ? "bg-amber-500 border-amber-400 text-black shadow-sm font-bold"
                  : "bg-blue-600 border-blue-500 text-white shadow-sm"
                : "border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-black/20 text-transparent"
            )}
          >
            <Check className="w-3 h-3" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function DependenciesStep({

  data,
  onSubmit,
  onGeneratePom,
  onBack,
  isGenerating,
  onChange,
}: DependenciesStepProps) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set([...ALWAYS_INCLUDED, ...(data.dependencies || [])])
  );
  const [allDependencies, setAllDependencies] = useState<DependencyDef[]>(DEPENDENCIES);
  const [isFetchingInitializr, setIsFetchingInitializr] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [customDepInput, setCustomDepInput] = useState("");
  const [showCustomAdd, setShowCustomAdd] = useState(false);
  const [mavenSearchResults, setMavenSearchResults] = useState<any[]>([]);
  const [isSearchingMaven, setIsSearchingMaven] = useState(false);

  // Live search Maven Central API on custom dependency input
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

  // Fetch official Spring Initializr dependencies dynamically on mount
  useEffect(() => {
    async function loadDynamicDependencies() {
      setIsFetchingInitializr(true);
      try {
        const res = await fetch("/api/spring-versions");
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.dependencies) && json.dependencies.length > 0) {
            setAllDependencies(json.dependencies);
          }
        }
      } catch (err) {
        console.warn("Using fallback dependencies list", err);
      } finally {
        setIsFetchingInitializr(false);
      }
    }
    loadDynamicDependencies();
  }, []);

  const toggle = (id: string, alwaysIncluded?: boolean) => {
    if (alwaysIncluded) return;
    const next = new Set(selected);
    if (id === "jwt") {
      if (!next.has(id)) {
        next.add(id);
        next.add("security");
      } else {
        next.delete(id);
      }
    } else if (["postgresql", "mysql", "mongodb"].includes(id)) {
      if (!next.has(id)) {
        next.delete("postgresql");
        next.delete("mysql");
        next.delete("mongodb");
        next.add(id);
      } else {
        next.delete(id);
      }
    } else {
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
    }
    const arr = Array.from(next);
    setSelected(next);
    onChange?.({ dependencies: arr });
  };

  const handleAddCustomDependency = (explicitId?: string) => {
    const raw = explicitId || customDepInput.trim();
    if (!raw) return;
    const cleanId = raw.includes(":") ? raw : raw.toLowerCase().replace(/\s+/g, "-");
    const next = new Set(selected);
    next.add(cleanId);
    const arr = Array.from(next);
    setSelected(next);
    onChange?.({ dependencies: arr });
    setCustomDepInput("");
    setMavenSearchResults([]);
    setShowCustomAdd(false);
  };

  // Filter dependencies based on search and category, then sort selected to top
  const { selectedDeps, availableDeps } = useMemo(() => {
    const filtered = allDependencies.filter((dep) => {
      const matchesCategory = selectedCategory === "all" || dep.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        dep.label.toLowerCase().includes(q) ||
        dep.description.toLowerCase().includes(q) ||
        dep.id.toLowerCase().includes(q) ||
        dep.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });

    const sel: typeof filtered = [];
    const avail: typeof filtered = [];
    for (const dep of filtered) {
      if (selected.has(dep.id)) sel.push(dep);
      else avail.push(dep);
    }
    return { selectedDeps: sel, availableDeps: avail };
  }, [allDependencies, searchQuery, selectedCategory, selected]);

  const categories = ["all", "archforge", "core", "security", "database", "messaging", "devtools"];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Title & Counter */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Add Dependencies</h2>
          </div>
          <div className="flex items-center gap-2">
            {isFetchingInitializr && (
              <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Syncing Initializr Starters...
              </span>
            )}
            <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs font-mono font-bold">
              {selected.size} Selected
            </div>
          </div>
        </div>
        <p className="text-slate-600 dark:text-muted-foreground text-sm mt-1">
          Pick production-ready code modules or search 200+ official Spring Initializr starters.
        </p>
      </div>

      {/* Search Bar & Category Filter Controls */}
      <div className="space-y-3">
        {/* Live Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${allDependencies.length} Spring Boot starters & code modules (e.g. JWT, OpenAPI, Redis, Kafka, WebFlux)...`}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-100/90 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 dark:placeholder:text-muted-foreground/50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills & Custom Dependency Button */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => {
              const meta = CATEGORY_META[cat];
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all border",
                    isSelected
                      ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                      : "bg-slate-100/70 dark:bg-black/30 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20"
                  )}
                >
                  {cat === "all" ? `All (${allDependencies.length})` : cat === "archforge" ? "🚀 Starter Boilerplate" : meta.label.split(" ")[0]}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setShowCustomAdd(!showCustomAdd)}
            className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Custom Starter</span>
          </button>
        </div>

        {/* Inline Custom Dependency Input Box */}
        <AnimatePresence>
          {showCustomAdd && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden space-y-2"
            >
              <div className="p-3 rounded-xl bg-slate-100/90 dark:bg-black/40 border border-emerald-500/40 flex items-center gap-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="Search Maven Central e.g. mapstruct, mybatis, modelmapper, or groupId:artifactId"
                  value={customDepInput}
                  onChange={(e) => setCustomDepInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCustomDependency())}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-black/60 border border-slate-300 dark:border-white/20 text-xs font-mono text-slate-900 dark:text-white outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddCustomDependency()}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-all shrink-0"
                >
                  Add
                </button>
              </div>

              {/* Maven Central Suggestions List */}
              {isSearchingMaven && (
                <div className="text-[11px] font-mono text-blue-600 dark:text-cyan-400 flex items-center gap-1.5 px-3 py-1">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Searching Maven Central for live genuine coordinates...</span>
                </div>
              )}

              {mavenSearchResults.length > 0 && (
                <div className="p-2 rounded-xl glass-panel border border-blue-500/30 bg-slate-900/90 max-h-48 overflow-y-auto space-y-1 z-20">
                  <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider px-2 py-0.5">
                    Official Maven Central Results:
                  </div>
                  {mavenSearchResults.map((res) => (
                    <button
                      key={res.id}
                      type="button"
                      onClick={() => handleAddCustomDependency(res.id)}
                      className="w-full text-left p-2 rounded-lg hover:bg-blue-600/20 hover:border-blue-500/40 border border-transparent transition-all flex items-center justify-between group"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-bold text-white group-hover:text-blue-300 truncate">
                          {res.label}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 truncate">
                          {res.description}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 shrink-0">
                        + Add Verified
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dependency Grid */}
      <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
        {selectedDeps.length === 0 && availableDeps.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-muted-foreground glass-panel rounded-2xl p-6 border border-slate-200 dark:border-white/10">
            <Boxes className="w-8 h-8 mx-auto mb-2 opacity-50 text-blue-500" />
            <p className="font-bold text-sm">No dependencies found matching "{searchQuery}"</p>
            <p className="text-xs mt-1">Try searching for a different keyword or add a custom starter above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* ── Selected section ── */}
            {selectedDeps.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                    ✅ Selected ({selectedDeps.length})
                  </span>
                  <div className="flex-1 h-px bg-emerald-500/30" />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {selectedDeps.map((dep) => <DepCard key={dep.id} dep={dep} selected={selected} toggle={toggle} />)}
                </div>
              </div>
            )}

            {/* ── Available section ── */}
            {availableDeps.length > 0 && (
              <div className="space-y-2">
                {selectedDeps.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Available ({availableDeps.length})
                    </span>
                    <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
                  </div>
                )}
                <div className="grid sm:grid-cols-2 gap-3">
                  {availableDeps.map((dep) => <DepCard key={dep.id} dep={dep} selected={selected} toggle={toggle} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between gap-3 pt-4 pb-8 mb-4 border-t border-slate-200 dark:border-white/10">
        <button
          type="button"
          onClick={onBack}
          disabled={isGenerating}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass-panel text-sm font-semibold text-slate-700 dark:text-foreground hover:bg-slate-200/60 dark:hover:bg-white/5 transition-all disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <button
          type="button"
          onClick={() => onSubmit(Array.from(selected))}
          disabled={isGenerating}
          className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white font-extrabold text-sm hover:brightness-110 transition-all shadow-xl glow-primary disabled:opacity-50 cursor-pointer"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Generating Spring Boot Starter...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate & Download ZIP</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
