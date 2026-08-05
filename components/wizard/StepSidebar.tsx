"use client";

import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  label: string;
  description: string;
  icon: string;
}

interface StepSidebarProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
  onStepClick?: (stepId: number) => void;
}

export function StepSidebar({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
}: StepSidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col w-72 shrink-0 glass-panel border-r border-slate-200 dark:border-white/10 p-6 relative z-20">
      {/* Brand */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-base shadow-lg">
          AF
        </div>
        <div>
          <div className="font-extrabold text-base tracking-tight gradient-text">
            ArchForge
          </div>
          <div className="text-[11px] font-mono text-slate-500 dark:text-muted-foreground">
            Architecture Generator
          </div>
        </div>
      </div>

      {/* Steps List */}
      <nav className="flex flex-col gap-6 flex-1 relative">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          const isUpcoming = !isCompleted && !isCurrent;
          const isClickable = !!onStepClick;

          return (
            <div key={step.id} className="relative">
              {/* Line Connector */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute left-4 top-10 w-0.5 h-10 rounded-full transition-all duration-300 pointer-events-none",
                    isCompleted ? "bg-blue-600 dark:bg-blue-500" : "bg-slate-200 dark:bg-white/10"
                  )}
                />
              )}

              <button
                type="button"
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={cn(
                  "w-full text-left flex items-start gap-3.5 p-3 rounded-2xl transition-all duration-200 group cursor-pointer",
                  isCurrent && "bg-blue-50 dark:bg-blue-500/10 border border-blue-400 dark:border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]",
                  !isCurrent && isClickable && "hover:bg-slate-200/50 dark:hover:bg-white/5 border border-transparent",
                  isCompleted && "opacity-95",
                  isUpcoming && "opacity-70"
                )}
              >
                {/* Step Icon Badge */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-all border",
                    isCompleted && "bg-blue-600 border-blue-500 text-white shadow-md group-hover:scale-105",
                    isCurrent && "bg-blue-100 dark:bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-400 font-extrabold",
                    isUpcoming && "border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-black/20 text-slate-500 dark:text-muted-foreground group-hover:text-slate-900 dark:group-hover:text-white"
                  )}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                </div>

                {/* Text */}
                <div className="pt-0.5">
                  <div
                    className={cn(
                      "text-sm font-bold transition-colors",
                      isCurrent && "text-blue-700 dark:text-blue-400",
                      isCompleted && "text-slate-900 dark:text-foreground group-hover:text-blue-700 dark:group-hover:text-blue-300",
                      isUpcoming && "text-slate-500 dark:text-muted-foreground group-hover:text-slate-900 dark:group-hover:text-white"
                    )}
                  >
                    {step.label}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-muted-foreground mt-0.5 leading-snug">
                    {step.description}
                  </div>
                </div>

                {isCurrent && (
                  <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 ml-auto mt-1 shrink-0" />
                )}
              </button>
            </div>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="mt-auto pt-6 border-t border-slate-200 dark:border-white/10 text-center">
        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block font-medium">
          Click any section to navigate
        </span>
      </div>
    </aside>
  );
}
