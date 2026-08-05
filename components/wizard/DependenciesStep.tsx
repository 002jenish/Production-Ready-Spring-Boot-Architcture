"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DEPENDENCIES } from "@/lib/constants";
import { DependencyId, WizardState } from "@/lib/types";
import { ArrowLeft, Check, Lock, Boxes, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface DependenciesStepProps {
  data: WizardState;
  onSubmit: (deps: string[]) => void;
  onBack: () => void;
  isGenerating: boolean;
  onChange?: (data: Partial<WizardState>) => void;
}

const ALWAYS_INCLUDED: DependencyId[] = ["web", "lombok"];

const CATEGORY_META: Record<string, { label: string; badge: string }> = {
  core: { label: "Core Web & Data", badge: "border-blue-500/30 text-blue-700 dark:text-blue-400 bg-blue-500/10" },
  security: { label: "Security & Auth", badge: "border-violet-500/30 text-violet-700 dark:text-violet-400 bg-violet-500/10" },
  database: { label: "SQL & NoSQL Databases", badge: "border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10" },
  devtools: { label: "DevOps & Tooling", badge: "border-amber-500/30 text-amber-700 dark:text-amber-400 bg-amber-500/10" },
};

export function DependenciesStep({
  data,
  onSubmit,
  onBack,
  isGenerating,
  onChange,
}: DependenciesStepProps) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set([...ALWAYS_INCLUDED, ...(data.dependencies || [])])
  );

  const toggle = (id: DependencyId, alwaysIncluded?: boolean) => {
    if (alwaysIncluded) return;
    setSelected((prev) => {
      const next = new Set(prev);
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
      // Immediately propagate to parent so FolderPreview updates live
      onChange?.({ dependencies: Array.from(next) });
      return next;
    });
  };

  const categories = ["core", "security", "database", "devtools"] as const;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Select Dependencies</h2>
          </div>
          <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs font-mono font-bold">
            {selected.size} Selected
          </div>
        </div>
        <p className="text-slate-600 dark:text-muted-foreground text-sm mt-1">
          Pick features to include in your starter project. Core dependencies are included by default.
        </p>
      </div>

      {/* Category Sections */}
      <div className="space-y-6">
        {categories.map((cat) => {
          const deps = DEPENDENCIES.filter((d) => d.category === cat);
          const meta = CATEGORY_META[cat];

          return (
            <div key={cat} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className={cn("text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border", meta.badge)}>
                  {meta.label}
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {deps.map((dep) => {
                  const isChecked = selected.has(dep.id);

                  return (
                    <motion.div
                      key={dep.id}
                      whileHover={{ scale: dep.alwaysIncluded ? 1 : 1.01 }}
                      whileTap={{ scale: dep.alwaysIncluded ? 1 : 0.99 }}
                      onClick={() => toggle(dep.id, dep.alwaysIncluded)}
                      className={cn(
                        "p-4 rounded-2xl border glass-panel transition-all flex items-start justify-between gap-3 relative overflow-hidden select-none",
                        dep.alwaysIncluded ? "cursor-default bg-slate-100/80 dark:bg-black/30 border-slate-200 dark:border-white/10 opacity-90" : "cursor-pointer",
                        isChecked && !dep.alwaysIncluded
                          ? "bg-blue-50/80 dark:bg-blue-500/10 border-blue-500 text-slate-900 dark:text-white shadow-sm dark:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                          : !dep.alwaysIncluded && "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white/70 dark:bg-black/30"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl mt-0.5">{dep.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">{dep.label}</span>
                            {dep.alwaysIncluded && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400 font-semibold">
                                Required
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-muted-foreground mt-0.5 leading-snug font-medium">
                            {dep.description}
                          </p>
                        </div>
                      </div>

                      {/* Checkbox badge */}
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
                                ? "bg-blue-600 border-blue-500 text-white shadow-sm"
                                : "border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-black/20 text-transparent"
                            )}
                          >
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-white/10">
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
