"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { projectInfoSchema, ProjectInfoFormData } from "@/lib/schema";
import { WizardState, ConfigFormat, Packaging } from "@/lib/types";
import { ArrowRight, FolderGit2, Terminal, RefreshCw, Sparkles, Wrench, Coffee, FileText, Package } from "lucide-react";

interface SpringVersionItem {
  version: string;
  label: string;
  isDefault?: boolean;
}

interface JavaVersionItem {
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
  const [javaVersions, setJavaVersions] = useState<JavaVersionItem[]>([
    { version: "25", label: "25" },
    { version: "23", label: "23" },
    { version: "21", label: "21", isDefault: true },
    { version: "17", label: "17" },
  ]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [versionSource, setVersionSource] = useState<string>("default");
  const [configFormat, setConfigFormat] = useState<ConfigFormat>(data.configFormat ?? "yaml");
  const [packaging, setPackaging] = useState<Packaging>(data.packaging ?? "jar");

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
      buildTool: data.buildTool || "maven",
      javaVersion: data.javaVersion || "21",
      springBootVersion: data.springBootVersion || "3.5.3",
    },
  });

  // Fetch official Spring Boot releases and Java versions dynamically from Spring Initializr
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
            const defaultVer = json.versions.find((v: SpringVersionItem) => v.isDefault);
            if (defaultVer && !data.springBootVersion) {
              setValue("springBootVersion", defaultVer.version);
            }
          }
          if (Array.isArray(json.javaVersions) && json.javaVersions.length > 0) {
            setJavaVersions(json.javaVersions);
            const defaultJava = json.javaVersions.find((j: JavaVersionItem) => j.isDefault);
            if (defaultJava && !data.javaVersion) {
              setValue("javaVersion", defaultJava.version);
            }
          }
        }
      } catch (err) {
        console.warn("Could not load dynamic Spring versions & metadata", err);
      } finally {
        setIsLoadingVersions(false);
      }
    }
    fetchVersions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live real-time sync with parent wizardState as the user types or selects
  useEffect(() => {
    const subscription = watch((value) => {
      if (onChange) {
        onChange({
          projectName: value.projectName || "",
          groupId: value.groupId || "",
          artifactId: value.artifactId || "",
          buildTool: value.buildTool || "maven",
          configFormat,
          packaging,
          javaVersion: value.javaVersion || "21",
          springBootVersion: value.springBootVersion || "3.5.3",
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, onChange, configFormat, packaging]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const sanitizedArtifact = val.toLowerCase().replace(/[^a-z0-9\-]/g, "-");
    setValue("artifactId", sanitizedArtifact, { shouldValidate: true });
  };

  const onSubmit = (values: ProjectInfoFormData) => {
    onNext({ ...values, configFormat, packaging });
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
              Live Initializr Metadata
            </span>
          )}
        </div>
        <p className="text-slate-600 dark:text-muted-foreground text-sm">
          Define core metadata, build tool, Java runtime, and official Spring Boot release.
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

        {/* Build Tool Selector (Maven vs Gradle) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Build Tool <span className="text-blue-600 dark:text-blue-400">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "maven", label: "Maven", icon: "🛠️", file: "pom.xml" },
              { id: "gradle", label: "Gradle", icon: "🐘", file: "build.gradle" },
            ].map((tool) => (
              <label
                key={tool.id}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border cursor-pointer font-mono text-sm font-semibold transition-all ${
                  watch("buildTool") === tool.id
                    ? "bg-blue-50 dark:bg-blue-600/20 border-blue-500 text-blue-700 dark:text-blue-400 shadow-sm dark:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                    : "bg-slate-100/60 dark:bg-black/30 border-slate-300 dark:border-white/10 text-slate-700 dark:text-muted-foreground hover:border-slate-400 dark:hover:border-white/20"
                }`}
              >
                <input
                  type="radio"
                  {...register("buildTool")}
                  value={tool.id}
                  className="sr-only"
                />
                <div className="flex items-center gap-2">
                  <span>{tool.icon} {tool.label}</span>
                </div>
                <span className="text-[10px] opacity-70 font-normal">{tool.file}</span>
              </label>
            ))}
          </div>
          <FieldError message={errors.buildTool?.message} />
        </div>

        {/* Config File Format Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Config File Format
          </label>
          <div className="grid grid-cols-2 gap-3">
            {([
              { id: "yaml",       label: "YAML",       icon: "📄", file: "application.yml",        hint: "Human-readable, nested" },
              { id: "properties", label: "Properties", icon: "📝", file: "application.properties", hint: "Classic flat-key style"  },
            ] as { id: ConfigFormat; label: string; icon: string; file: string; hint: string }[]).map((fmt) => (
              <button
                key={fmt.id}
                type="button"
                onClick={() => {
                  setConfigFormat(fmt.id);
                  onChange?.({ configFormat: fmt.id });
                }}
                className={`flex items-start justify-between px-4 py-3 rounded-xl border cursor-pointer font-mono text-sm font-semibold transition-all text-left ${
                  configFormat === fmt.id
                    ? "bg-violet-50 dark:bg-violet-600/20 border-violet-500 text-violet-700 dark:text-violet-300 shadow-sm dark:shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                    : "bg-slate-100/60 dark:bg-black/30 border-slate-300 dark:border-white/10 text-slate-700 dark:text-muted-foreground hover:border-slate-400 dark:hover:border-white/20"
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span>{fmt.icon}</span>
                    <span>{fmt.label}</span>
                  </div>
                  <div className="text-[10px] font-normal opacity-60 mt-0.5">{fmt.hint}</div>
                </div>
                <span className="text-[10px] opacity-60 font-normal shrink-0 ml-2 mt-0.5">{fmt.file}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Packaging Selector (Jar vs War) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Packaging
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "jar" as Packaging, label: "Jar", icon: "📦", file: ".jar", hint: "Executable JAR application" },
              { id: "war" as Packaging, label: "War", icon: "🌐", file: ".war", hint: "Traditional Servlet Container WAR" },
            ].map((pkgOpt) => (
              <button
                key={pkgOpt.id}
                type="button"
                onClick={() => {
                  setPackaging(pkgOpt.id);
                  onChange?.({ packaging: pkgOpt.id });
                }}
                className={`flex items-start justify-between px-4 py-3 rounded-xl border cursor-pointer font-mono text-sm font-semibold transition-all text-left ${
                  packaging === pkgOpt.id
                    ? "bg-emerald-50 dark:bg-emerald-600/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-sm dark:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                    : "bg-slate-100/60 dark:bg-black/30 border-slate-300 dark:border-white/10 text-slate-700 dark:text-muted-foreground hover:border-slate-400 dark:hover:border-white/20"
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span>{pkgOpt.icon}</span>
                    <span>{pkgOpt.label}</span>
                  </div>
                  <div className="text-[10px] font-normal opacity-60 mt-0.5">{pkgOpt.hint}</div>
                </div>
                <span className="text-[10px] opacity-60 font-normal shrink-0 ml-2 mt-0.5">{pkgOpt.file}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Java Version Selector (Fetched Live from Spring Initializr Metadata) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Coffee className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Java Version SDK <span className="text-blue-600 dark:text-blue-400">*</span>
            </label>
            {isLoadingVersions && (
              <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Syncing Initializr SDKs...
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {javaVersions.map((ver) => (
              <label
                key={ver.version}
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border cursor-pointer font-mono text-xs font-bold transition-all ${
                  watch("javaVersion") === ver.version
                    ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/20"
                    : "bg-slate-100/60 dark:bg-black/30 border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-white/20"
                }`}
              >
                <input
                  type="radio"
                  {...register("javaVersion")}
                  value={ver.version}
                  className="sr-only"
                />
                <span>Java {ver.label}</span>
                {ver.isDefault && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-400/30 text-amber-900 dark:text-amber-300 font-semibold">
                    LTS
                  </span>
                )}
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

      <div className="flex justify-end pt-4 pb-8 mb-4 border-t border-slate-200 dark:border-white/10">
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
