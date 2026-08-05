"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { projectInfoSchema, ProjectInfoFormData } from "@/lib/schema";
import { JAVA_VERSIONS } from "@/lib/constants";
import { WizardState } from "@/lib/types";
import { ArrowRight, FolderGit2, Terminal, RefreshCw, Sparkles } from "lucide-react";

interface SpringVersionItem {
  version: string;
  label: string;
  isDefault?: boolean;
}

interface ProjectInfoStepProps {
  data: WizardState;
  onNext: (data: Partial<WizardState>) => void;
  onChange?: (data: Partial<WizardState>) => void;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-xs text-red-400 mt-1.5 font-medium flex items-center gap-1">
      <span>•</span> {message}
    </p>
  );
}

export function ProjectInfoStep({ data, onNext, onChange }: ProjectInfoStepProps) {
  const [springVersions, setSpringVersions] = useState<SpringVersionItem[]>([
    { version: "3.5.3", label: "3.5.3 (Latest Stable)", isDefault: true },
    { version: "3.4.3", label: "3.4.3 (GA)" },
    { version: "3.3.9", label: "3.3.9 (GA)" },
  ]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [versionSource, setVersionSource] = useState<string>("default");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProjectInfoFormData>({
    resolver: zodResolver(projectInfoSchema),
    defaultValues: {
      projectName: data.projectName || "inventory-service",
      groupId: data.groupId || "com.java",
      artifactId: data.artifactId || "inventory-service",
      javaVersion: data.javaVersion || "21",
      springBootVersion: data.springBootVersion || "3.5.3",
    },
  });

  // Fetch official Spring Boot releases dynamically
  useEffect(() => {
    async function fetchVersions() {
      setIsLoadingVersions(true);
      try {
        const res = await fetch("/api/spring-versions");
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.versions) && json.versions.length > 0) {
            setSpringVersions(json.versions);
            setVersionSource(json.source || "spring-initializr-api");
            // Set default version if not set
            const defaultVer = json.versions.find((v: SpringVersionItem) => v.isDefault);
            if (defaultVer && !data.springBootVersion) {
              setValue("springBootVersion", defaultVer.version);
            }
          }
        }
      } catch (err) {
        console.warn("Could not load dynamic Spring versions", err);
      } finally {
        setIsLoadingVersions(false);
      }
    }
    fetchVersions();
  }, [setValue, data.springBootVersion]);

  // Live real-time sync with parent wizardState as the user types
  useEffect(() => {
    const subscription = watch((value) => {
      if (onChange) {
        onChange({
          projectName: value.projectName || "",
          groupId: value.groupId || "",
          artifactId: value.artifactId || "",
          javaVersion: value.javaVersion || "21",
          springBootVersion: value.springBootVersion || "3.5.3",
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, onChange]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const sanitizedArtifact = val.toLowerCase().replace(/[^a-z0-9\-]/g, "-");
    setValue("artifactId", sanitizedArtifact, { shouldValidate: true });
  };

  const onSubmit = (values: ProjectInfoFormData) => {
    onNext(values);
  };
  const inputStyle =
    "w-full px-4 py-3 rounded-xl bg-slate-100/80 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-slate-100 text-sm font-mono placeholder:text-slate-400 dark:placeholder:text-muted-foreground/40 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all";

  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 mb-1">
            <FolderGit2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Project Information</h2>
          </div>
          {versionSource === "spring-initializr-api" && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-medium">
              <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              Live Releases API
            </span>
          )}
        </div>
        <p className="text-slate-600 dark:text-muted-foreground text-sm">
          Define core metadata, Java SDK runtime, and official Spring Boot release.
        </p>
      </div>

      <div className="grid gap-5">
        {/* Project Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-muted-foreground uppercase tracking-wider mb-2">
            Project Name <span className="text-blue-600 dark:text-blue-400">*</span>
          </label>
          <input
            {...register("projectName")}
            onChange={(e) => {
              register("projectName").onChange(e);
              handleNameChange(e);
            }}
            placeholder="e.g. inventory-service"
            className={inputStyle}
          />
          <FieldError message={errors.projectName?.message} />
        </div>

        {/* Group ID & Artifact ID */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-muted-foreground uppercase tracking-wider mb-2">
              Group ID <span className="text-blue-600 dark:text-blue-400">*</span>
            </label>
            <input
              {...register("groupId")}
              placeholder="com.example"
              className={inputStyle}
            />
            <FieldError message={errors.groupId?.message} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-muted-foreground uppercase tracking-wider mb-2">
              Artifact ID <span className="text-blue-600 dark:text-blue-400">*</span>
            </label>
            <input
              {...register("artifactId")}
              placeholder="inventory-service"
              className={inputStyle}
            />
            <FieldError message={errors.artifactId?.message} />
          </div>
        </div>

        {/* Java Version Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-muted-foreground uppercase tracking-wider mb-2">
            Java Version SDK <span className="text-blue-600 dark:text-blue-400">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {JAVA_VERSIONS.map((ver) => (
              <label
                key={ver}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border cursor-pointer font-mono text-sm font-semibold transition-all ${
                  watch("javaVersion") === ver
                    ? "bg-blue-50 dark:bg-blue-600/20 border-blue-500 text-blue-700 dark:text-blue-400 shadow-sm dark:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                    : "bg-slate-100/60 dark:bg-black/30 border-slate-300 dark:border-white/10 text-slate-700 dark:text-muted-foreground hover:border-slate-400 dark:hover:border-white/20"
                }`}
              >
                <input
                  type="radio"
                  {...register("javaVersion")}
                  value={ver}
                  className="sr-only"
                />
                <span>☕ Java {ver}</span>
              </label>
            ))}
          </div>
          <FieldError message={errors.javaVersion?.message} />
        </div>

        {/* Spring Boot Version (Fetched Live from Spring Initializr API) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-muted-foreground uppercase tracking-wider">
              Spring Boot Release <span className="text-blue-600 dark:text-blue-400">*</span>
            </label>
            {isLoadingVersions && (
              <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Fetching official releases...
              </span>
            )}
          </div>
          <select {...register("springBootVersion")} className={inputStyle}>
            {springVersions.map((v) => (
              <option key={v.version} value={v.version} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                {v.label} {v.isDefault ? "(Recommended)" : ""}
              </option>
            ))}
          </select>
          <FieldError message={errors.springBootVersion?.message} />
        </div>

        {/* Dynamic Package Hint */}
        <div className="p-4 rounded-xl glass-panel border border-blue-500/30 flex items-start gap-3 bg-blue-50/50 dark:bg-blue-500/5">
          <Terminal className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 dark:text-slate-300">
            <span className="font-semibold text-blue-700 dark:text-blue-300">Base Java Package: </span>
            <code className="font-mono text-blue-700 dark:text-cyan-300 bg-blue-100/80 dark:bg-black/40 px-2 py-0.5 rounded border border-blue-200 dark:border-transparent">
              {(watch("groupId") || "com.example")}.{(watch("artifactId") || "my-service").replace(/-/g, "")}
            </code>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-white/10">
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm hover:brightness-110 transition-all shadow-lg glow-primary"
        >
          <span>Continue to Architecture</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.form>
  );
}
