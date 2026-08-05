"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ARCHITECTURES } from "@/lib/constants";
import { Architecture, WizardState } from "@/lib/types";
import { ArrowLeft, ArrowRight, Check, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface ArchitectureStepProps {
  data: WizardState;
  onNext: (data: Partial<WizardState>) => void;
  onBack: () => void;
  onChange?: (data: Partial<WizardState>) => void;
}

const architectureColors: Record<Architecture, { border: string; bg: string; text: string; glow: string }> = {
  layered: {
    border: "border-blue-500/50 dark:border-blue-500/50",
    bg: "bg-blue-50/80 dark:bg-blue-500/10",
    text: "text-blue-700 dark:text-blue-400",
    glow: "shadow-md dark:shadow-[0_0_25px_rgba(59,130,246,0.2)]",
  },
  hexagonal: {
    border: "border-violet-500/50 dark:border-violet-500/50",
    bg: "bg-violet-50/80 dark:bg-violet-500/10",
    text: "text-violet-700 dark:text-violet-400",
    glow: "shadow-md dark:shadow-[0_0_25px_rgba(139,92,246,0.2)]",
  },
  clean: {
    border: "border-emerald-500/50 dark:border-emerald-500/50",
    bg: "bg-emerald-50/80 dark:bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400",
    glow: "shadow-md dark:shadow-[0_0_25px_rgba(16,185,129,0.2)]",
  },
  modular: {
    border: "border-amber-500/50 dark:border-amber-500/50",
    bg: "bg-amber-50/80 dark:bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-400",
    glow: "shadow-md dark:shadow-[0_0_25px_rgba(245,158,11,0.2)]",
  },
};

// Architecture Visual Diagram Helper
function ArchitectureDiagram({ archId }: { archId: Architecture }) {
  if (archId === "layered") {
    return (
      <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-100/90 dark:bg-black/40 border border-slate-200 dark:border-white/5 font-mono text-[11px]">
        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-blue-100/80 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30 font-semibold">
          <span>Controller Layer</span>
          <span className="text-[9px] opacity-80">@RestController</span>
        </div>
        <div className="text-center text-blue-600 dark:text-blue-400/70 text-[10px] font-bold">↓ DTOs / Requests</div>
        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-indigo-100/80 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/30 font-semibold">
          <span>Service Layer</span>
          <span className="text-[9px] opacity-80">@Service</span>
        </div>
        <div className="text-center text-indigo-600 dark:text-indigo-400/70 text-[10px] font-bold">↓ Domain Models</div>
        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-200/80 dark:bg-slate-500/20 text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-500/30 font-semibold">
          <span>Repository Layer</span>
          <span className="text-[9px] opacity-80">@Repository</span>
        </div>
      </div>
    );
  }

  if (archId === "hexagonal") {
    return (
      <div className="p-3 rounded-xl bg-slate-100/90 dark:bg-black/40 border border-slate-200 dark:border-white/5 font-mono text-[11px] space-y-2">
        <div className="flex justify-between gap-2">
          <div className="flex-1 p-1.5 rounded bg-violet-100/80 dark:bg-violet-500/20 text-violet-800 dark:text-violet-300 border border-violet-300 dark:border-violet-500/30 text-center font-semibold">
            Inbound Adapter
          </div>
          <div className="flex-1 p-1.5 rounded bg-purple-100/80 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30 text-center font-semibold">
            Outbound Adapter
          </div>
        </div>
        <div className="p-2 rounded-lg bg-violet-200/60 dark:bg-violet-950/60 border border-violet-400 dark:border-violet-500/40 text-center">
          <div className="text-violet-900 dark:text-violet-300 font-bold">Domain Core (Isolated)</div>
          <div className="text-[9px] text-violet-700 dark:text-violet-400/80 mt-0.5 font-medium">Input & Output Ports</div>
        </div>
      </div>
    );
  }

  if (archId === "clean") {
    return (
      <div className="p-3 rounded-xl bg-slate-100/90 dark:bg-black/40 border border-slate-200 dark:border-white/5 font-mono text-[11px] space-y-1.5">
        <div className="p-1.5 rounded bg-emerald-100/80 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-center font-medium">
          Presentation & UI Ring
        </div>
        <div className="p-1.5 rounded bg-teal-100/80 dark:bg-teal-950/60 border border-teal-300 dark:border-teal-500/40 text-teal-800 dark:text-teal-300 text-center font-medium">
          Use Cases Ring
        </div>
        <div className="p-1.5 rounded bg-emerald-200/80 dark:bg-emerald-500/20 border border-emerald-400 dark:border-emerald-500/50 text-emerald-900 dark:text-emerald-200 text-center font-bold">
          Domain Entities Core
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-1.5 p-3 rounded-xl bg-slate-100/90 dark:bg-black/40 border border-slate-200 dark:border-white/5 font-mono text-[11px]">
      <div className="p-2 rounded bg-amber-100/80 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">
        <div className="font-bold">User Module</div>
        <div className="text-[9px] text-amber-700 dark:text-amber-400/70 font-medium">Entities / Service</div>
      </div>
      <div className="p-2 rounded bg-orange-100/80 dark:bg-orange-500/20 text-orange-900 dark:text-orange-300 border border-orange-300 dark:border-orange-500/30">
        <div className="font-bold">Auth Module</div>
        <div className="text-[9px] text-orange-700 dark:text-orange-400/70 font-medium">Security / JWT</div>
      </div>
      <div className="col-span-2 p-1.5 rounded bg-yellow-100/80 dark:bg-yellow-500/10 text-yellow-900 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-500/20 text-center font-medium">
        Shared Core Infrastructure
      </div>
    </div>
  );
}

export function ArchitectureStep({ data, onNext, onBack, onChange }: ArchitectureStepProps) {
  const [selected, setSelected] = useState<Architecture>(data.architecture);

  const handleSelect = (arch: Architecture) => {
    setSelected(arch);
    // Immediately propagate to parent so FolderPreview updates live
    onChange?.({ architecture: arch });
  };

  const handleNext = () => {
    onNext({ architecture: selected });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Choose Architecture Pattern</h2>
        </div>
        <p className="text-slate-600 dark:text-muted-foreground text-sm">
          Select how packages and layers are structured in your generated Spring Boot project.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {ARCHITECTURES.map((arch) => {
          const isSelected = selected === arch.id;
          const styles = architectureColors[arch.id as Architecture];

          return (
            <motion.div
              key={arch.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleSelect(arch.id as Architecture)}
              className={cn(
                "cursor-pointer relative p-5 rounded-2xl border glass-panel transition-all flex flex-col justify-between",
                isSelected
                  ? `${styles.border} ${styles.bg} ${styles.glow}`
                  : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white/70 dark:bg-black/30"
              )}
            >
              {/* Checkmark indicator */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{arch.icon}</span>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">{arch.label}</h3>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-muted-foreground">
                      {arch.id} pattern
                    </span>
                  </div>
                </div>

                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center border transition-all",
                    isSelected
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-black/20 text-transparent"
                  )}
                >
                  <Check className="w-3.5 h-3.5" />
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-muted-foreground leading-relaxed mb-4 font-medium">
                {arch.description}
              </p>

              {/* Diagram */}
              <ArchitectureDiagram archId={arch.id as Architecture} />
            </motion.div>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-white/10">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass-panel text-sm font-semibold text-slate-700 dark:text-foreground hover:bg-slate-200/60 dark:hover:bg-white/5 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm hover:brightness-110 transition-all shadow-lg glow-primary"
        >
          <span>Continue to Dependencies</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
