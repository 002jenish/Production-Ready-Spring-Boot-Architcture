"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DEPENDENCIES } from "@/lib/constants";
import { DependencyId, WizardState } from "@/lib/types";
import { ArrowLeft, Check, Lock, Boxes, Sparkles, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DependenciesStepProps {
  data: WizardState;
  onSubmit: (deps: string[]) => void;
  onBack: () => void;
  isGenerating: boolean;
}

const ALWAYS_INCLUDED: DependencyId[] = ["web", "lombok"];

const CATEGORY_META: Record<string, { label: string; badge: string }> = {
  core: { label: "Core Web & Data", badge: "border-blue-500/30 text-blue-400 bg-blue-500/10" },
  security: { label: "Security & Auth", badge: "border-violet-500/30 text-violet-400 bg-violet-500/10" },
  database: { label: "SQL & NoSQL Databases", badge: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" },
  devtools: { label: "DevOps & Tooling", badge: "border-amber-500/30 text-amber-400 bg-amber-500/10" },
};

export function DependenciesStep({
  data,
  onSubmit,
  onBack,
  isGenerating,
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
            <Boxes className="w-5 h-5 text-blue-400" />
            <h2 className="text-2xl font-bold">Select Dependencies</h2>
          </div>
          <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-mono font-semibold">
            {selected.size} Selected
          </div>
        </div>
        <p className="text-muted-foreground text-sm mt-1">
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
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${meta.badge}`}>
                  {meta.label}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {deps.map((dep) => {
                  const isAlways = ALWAYS_INCLUDED.includes(dep.id as DependencyId);
                  const isSelected = selected.has(dep.id);

                  return (
                    <motion.button
                      key={dep.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => toggle(dep.id as DependencyId, isAlways)}
                      className={cn(
                        "text-left p-3.5 rounded-xl border glass-panel transition-all flex items-start justify-between gap-3",
                        isAlways && "opacity-90 cursor-default border-emerald-500/30 bg-emerald-500/5",
                        isSelected && !isAlways && "border-blue-500/50 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.15)]",
                        !isSelected && !isAlways && "border-white/10 hover:border-white/20"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl shrink-0 mt-0.5">{dep.icon}</span>
                        <div>
                          <div className="font-semibold text-sm flex items-center gap-1.5">
                            <span>{dep.label}</span>
                            {isAlways && (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                                Required
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                            {dep.description}
                          </p>
                        </div>
                      </div>

                      <div
                        className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 transition-all border",
                          isSelected
                            ? "bg-blue-600 border-blue-500 text-white"
                            : "border-white/20 bg-black/20 text-transparent"
                        )}
                      >
                        {isAlways ? (
                          <Lock className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info notice if JWT selected */}
      {selected.has("jwt") && (
        <div className="p-4 rounded-xl glass-panel border border-violet-500/30 bg-violet-500/10 flex items-start gap-3 text-xs text-violet-200">
          <Sparkles className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">JWT Authentication Enabled: </span>
            ArchForge will automatically generate <code className="font-mono text-white bg-black/40 px-1.5 py-0.5 rounded">SecurityConfig.java</code>, <code className="font-mono text-white bg-black/40 px-1.5 py-0.5 rounded">JwtService.java</code>, <code className="font-mono text-white bg-black/40 px-1.5 py-0.5 rounded">JwtFilter.java</code>, and <code className="font-mono text-white bg-black/40 px-1.5 py-0.5 rounded">AuthController.java</code>.
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex justify-between items-center pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass-panel text-sm font-semibold hover:bg-white/5 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <button
          type="button"
          onClick={() => onSubmit(Array.from(selected))}
          disabled={isGenerating}
          className={cn(
            "flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-white font-bold text-sm transition-all shadow-xl",
            isGenerating
              ? "bg-blue-600/50 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:scale-105 active:scale-95 glow-primary"
          )}
        >
          {isGenerating ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Generating Spring Boot ZIP...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-yellow-300 fill-current" />
              <span>Generate & Download ZIP</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
