"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ARCHITECTURES } from "@/lib/constants";
import { Architecture, WizardState } from "@/lib/types";
import { ArrowLeft, ArrowRight, Check, Sparkles, Layers, Box, Cpu, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";

interface ArchitectureStepProps {
  data: WizardState;
  onNext: (data: Partial<WizardState>) => void;
  onBack: () => void;
}

const architectureColors: Record<Architecture, { border: string; bg: string; text: string; glow: string }> = {
  layered: {
    border: "border-blue-500/50",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    glow: "shadow-[0_0_25px_rgba(59,130,246,0.2)]",
  },
  hexagonal: {
    border: "border-violet-500/50",
    bg: "bg-violet-500/10",
    text: "text-violet-400",
    glow: "shadow-[0_0_25px_rgba(139,92,246,0.2)]",
  },
  clean: {
    border: "border-emerald-500/50",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    glow: "shadow-[0_0_25px_rgba(16,185,129,0.2)]",
  },
  modular: {
    border: "border-amber-500/50",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    glow: "shadow-[0_0_25px_rgba(245,158,11,0.2)]",
  },
};

// Architecture Visual Diagram Helper
function ArchitectureDiagram({ archId }: { archId: Architecture }) {
  if (archId === "layered") {
    return (
      <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-[11px]">
        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30">
          <span>Controller Layer</span>
          <span className="text-[9px] opacity-70">@RestController</span>
        </div>
        <div className="text-center text-blue-400/50 text-[10px]">↓ DTOs / Requests</div>
        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          <span>Service Layer</span>
          <span className="text-[9px] opacity-70">@Service</span>
        </div>
        <div className="text-center text-indigo-400/50 text-[10px]">↓ Domain Models</div>
        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-500/20 text-slate-300 border border-slate-500/30">
          <span>Repository Layer</span>
          <span className="text-[9px] opacity-70">@Repository</span>
        </div>
      </div>
    );
  }

  if (archId === "hexagonal") {
    return (
      <div className="p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-[11px] space-y-2">
        <div className="flex justify-between gap-2">
          <div className="flex-1 p-1.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 text-center">
            Inbound Adapter (Web)
          </div>
          <div className="flex-1 p-1.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-center">
            Outbound Adapter (DB)
          </div>
        </div>
        <div className="p-2 rounded-lg bg-violet-950/60 border border-violet-500/40 text-center">
          <div className="text-violet-300 font-bold">Domain Core (Isolated)</div>
          <div className="text-[9px] text-violet-400/80 mt-0.5">Input & Output Ports</div>
        </div>
      </div>
    );
  }

  if (archId === "clean") {
    return (
      <div className="p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-[11px] space-y-1.5">
        <div className="p-1.5 rounded bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 text-center">
          Presentation & UI Outer Ring
        </div>
        <div className="p-1.5 rounded bg-teal-950/60 border border-teal-500/40 text-teal-300 text-center">
          Use Cases / Application Ring
        </div>
        <div className="p-1.5 rounded bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 text-center font-bold">
          Domain Entities Core
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-1.5 p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-[11px]">
      <div className="p-2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
        <div className="font-bold">User Module</div>
        <div className="text-[9px] text-amber-400/70">Entities / Service</div>
      </div>
      <div className="p-2 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
        <div className="font-bold">Auth Module</div>
        <div className="text-[9px] text-orange-400/70">Security / JWT</div>
      </div>
      <div className="col-span-2 p-1.5 rounded bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 text-center">
        Shared Core Infrastructure
      </div>
    </div>
  );
}

export function ArchitectureStep({ data, onNext, onBack }: ArchitectureStepProps) {
  const [selected, setSelected] = useState<Architecture>(data.architecture);

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
          <Layers className="w-5 h-5 text-blue-400" />
          <h2 className="text-2xl font-bold">Choose Architecture Pattern</h2>
        </div>
        <p className="text-muted-foreground text-sm">
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
              onClick={() => setSelected(arch.id as Architecture)}
              className={cn(
                "cursor-pointer relative p-5 rounded-2xl border glass-panel transition-all flex flex-col justify-between",
                isSelected
                  ? `${styles.border} ${styles.bg} ${styles.glow}`
                  : "border-white/10 hover:border-white/20"
              )}
            >
              {/* Checkmark indicator */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{arch.icon}</span>
                  <div>
                    <h3 className="font-bold text-base">{arch.label}</h3>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {arch.id} pattern
                    </span>
                  </div>
                </div>

                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center border transition-all",
                    isSelected
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "border-white/20 bg-black/20 text-transparent"
                  )}
                >
                  <Check className="w-3.5 h-3.5" />
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                {arch.description}
              </p>

              {/* Diagram */}
              <ArchitectureDiagram archId={arch.id as Architecture} />
            </motion.div>
          );
        })}
      </div>

      {/* Action buttons */}
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
