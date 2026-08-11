"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
  ArrowRight,
  Code2,
  Download,
  Layers,
  Shield,
  Zap,
  CheckCircle2,
  Boxes,
  Sparkles,
  FileCode,
  FolderTree,
  Moon,
  Sun,
  ChevronRight,
  Cpu,
  GitBranch,
  Star,
  Terminal,
} from "lucide-react";

// ── Data ─────────────────────────────────────────────────────────────────────

const tools = [
  {
    id: "project",
    href: "/generate",
    icon: <FolderTree className="w-7 h-7" />,
    badge: "Full Scaffolder",
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    title: "Project ZIP Generator",
    description:
      "Generate a complete, compilable Spring Boot project with your chosen architecture pattern, dependencies, and config format. Download as a ready-to-run ZIP.",
    gradient: "from-blue-600 via-indigo-600 to-violet-600",
    glow: "shadow-blue-500/20",
    cta: "Launch Scaffolder",
    highlights: ["Visual architecture picker", "200+ live Spring starters", "JWT, Security, Docker, CI/CD"],
    emoji: "🚀",
  },
  {
    id: "pom",
    href: "/generate-pom",
    icon: <FileCode className="w-7 h-7" />,
    badge: "pom.xml / build.gradle",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    title: "Build File Generator",
    description:
      "Need just the pom.xml or build.gradle? Quickly generate a production-ready Maven or Gradle build file with precise dependency coordinates — no project setup needed.",
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    glow: "shadow-emerald-500/20",
    cta: "Open Generator",
    highlights: ["Maven & Gradle support", "Spring Initializr metadata", "Copy or download instantly"],
    emoji: "📄",
  },
];

const features = [
  {
    icon: <Layers className="w-5 h-5 text-blue-400" />,
    title: "Visual Architecture Designer",
    description: "Layered, Hexagonal, Clean, or Modular Monolith — pick your pattern with a single click.",
    border: "border-blue-500/20",
    bg: "from-blue-500/10 to-indigo-500/5",
  },
  {
    icon: <Zap className="w-5 h-5 text-violet-400" />,
    title: "Instant ZIP Scaffolding",
    description: "A compilable Spring Boot project ZIP generated in under 2 seconds. Unzip and run immediately.",
    border: "border-violet-500/20",
    bg: "from-violet-500/10 to-purple-500/5",
  },
  {
    icon: <Shield className="w-5 h-5 text-emerald-400" />,
    title: "Production-Grade Security",
    description: "JWT auth, Spring Security, OAuth2, and BCrypt pre-configured with industry-standard filters.",
    border: "border-emerald-500/20",
    bg: "from-emerald-500/10 to-teal-500/5",
  },
  {
    icon: <Code2 className="w-5 h-5 text-cyan-400" />,
    title: "DevOps Ready",
    description: "Multi-profile YAML / .properties configs, Flyway migrations, multi-stage Dockerfiles, GitHub Actions CI.",
    border: "border-cyan-500/20",
    bg: "from-cyan-500/10 to-sky-500/5",
  },
  {
    icon: <Cpu className="w-5 h-5 text-amber-400" />,
    title: "200+ Real Spring Starters",
    description: "Fetched live from Spring Initializr. All coordinates verified — no more fake starter IDs.",
    border: "border-amber-500/20",
    bg: "from-amber-500/10 to-orange-500/5",
  },
  {
    icon: <GitBranch className="w-5 h-5 text-pink-400" />,
    title: "Config Format Choice",
    description: "Generate application.yml or application.properties — your choice, live preview updates instantly.",
    border: "border-pink-500/20",
    bg: "from-pink-500/10 to-rose-500/5",
  },
];

const steps = [
  { n: "01", title: "Choose Your Tool", body: "Start with the Full Project Scaffolder or the lightweight Build File Generator." },
  { n: "02", title: "Configure Project", body: "Set metadata, build tool, config format, Spring Boot version, and Java SDK." },
  { n: "03", title: "Pick Architecture", body: "Select Layered, Hexagonal, Clean, or Modular Monolith patterns visually." },
  { n: "04", title: "Select Dependencies", body: "Search 200+ live Spring starters. Selected deps float to the top for easy review." },
  { n: "05", title: "Preview Live", body: "See the generated pom.xml, build.gradle, YAML, and folder structure update in real-time." },
  { n: "06", title: "Download & Run", body: "Download a compilable ZIP. Unzip, open in IntelliJ or VS Code, and run immediately." },
];

const stats = [
  { value: "4",    label: "Architecture Patterns",   icon: <Boxes className="w-4 h-4 text-blue-400" /> },
  { value: "200+", label: "Spring Boot Starters",    icon: <Cpu className="w-4 h-4 text-violet-400" /> },
  { value: "< 2s", label: "Generation Speed",        icon: <Zap className="w-4 h-4 text-emerald-400" /> },
  { value: "100%", label: "Compilable Java 21",      icon: <CheckCircle2 className="w-4 h-4 text-cyan-400" /> },
];

const sampleTabs = [
  {
    id: "pom",
    label: "pom.xml",
    content: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.5.3</version>
  </parent>
  <groupId>com.example</groupId>
  <artifactId>inventory-service</artifactId>
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
  </dependencies>
</project>`,
  },
  {
    id: "security",
    label: "SecurityConfig.java",
    content: `@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity http) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s
                .sessionCreationPolicy(STATELESS))
            .authorizeHttpRequests(a -> a
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated())
            .addFilterBefore(jwtFilter,
                UsernamePasswordAuthenticationFilter.class)
            .build();
    }
}`,
  },
  {
    id: "yaml",
    label: "application-dev.yml",
    content: `spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/inventory_db
    username: \${DB_USERNAME:postgres}
    password: \${DB_PASSWORD:password}
    hikari:
      maximum-pool-size: 5
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true

application:
  security:
    jwt:
      expiration: 86400000 # 24 Hours`,
  },
  {
    id: "docker",
    label: "docker-compose.yml",
    content: `version: '3.9'
services:
  app:
    build:
      context: .
      dockerfile: docker/Dockerfile
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
    depends_on:
      postgres:
        condition: service_healthy

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: inventory_db
      POSTGRES_PASSWORD: password`,
  },
];

// ── Theme Toggle ──────────────────────────────────────────────────────────────

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-9 h-9" />;

  const isDark = theme === "dark";
  return (
    <button
      id="theme-toggle"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="w-9 h-9 flex items-center justify-center rounded-xl glass-panel border border-white/10 hover:border-blue-500/40 text-slate-600 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 transition-all"
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}

// ── Home Page ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("security");

  return (
    <div className="min-h-screen bg-mesh text-foreground relative overflow-x-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <motion.div
          animate={{ x: [0, 80, 0], y: [0, 50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-blue-600/10 dark:bg-blue-600/15 blur-[140px]"
        />
        <motion.div
          animate={{ x: [0, -60, 0], y: [0, 80, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 -right-40 w-[650px] h-[650px] rounded-full bg-violet-600/10 dark:bg-violet-600/15 blur-[160px]"
        />
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -50, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] rounded-full bg-emerald-600/8 dark:bg-emerald-600/12 blur-[120px]"
        />
      </div>

      {/* ── Navbar ── */}
      <header className="fixed top-0 inset-x-0 z-50 glass-panel border-b border-slate-200/80 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-lg group-hover:scale-105 transition-transform">
              AF
            </div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight gradient-text hidden sm:inline">
              ArchForge
            </span>
          </Link>

          {/* Nav links + toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/generate-pom"
              className="hidden sm:flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors px-3 py-1.5 rounded-xl glass-panel border border-slate-200 dark:border-white/10"
            >
              <FileCode className="w-3.5 h-3.5 text-emerald-500" />
              pom.xml Generator
            </Link>

            <Link
              href="/generate"
              className="flex items-center gap-1.5 px-3 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold hover:brightness-110 transition-all shadow-lg"
            >
              <FolderTree className="w-3.5 h-3.5 sm:hidden" />
              <span className="hidden sm:inline">Project Scaffolder</span>
              <span className="sm:hidden">Scaffolder</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="pt-32 pb-16 sm:pt-40 sm:pb-24 px-4 sm:px-6 max-w-7xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold glass-panel border border-blue-500/30 text-blue-600 dark:text-blue-300 mb-8 shadow-inner"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span>Spring Initializr · JHipster Architecture Builder · Production Ready</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]"
        >
          Forge Production-Ready{" "}
          <br className="hidden sm:inline" />
          <span className="gradient-text">Spring Boot Architecture</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Visually select your architecture, pick 200+ live Spring starters, configure YAML or Properties,
          and download a compilable Java 21 starter ZIP — in under 2 seconds.
        </motion.p>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto mb-16"
        >
          {stats.map((s, i) => (
            <div
              key={i}
              className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-white/5 text-center flex flex-col items-center gap-1 hover:border-blue-500/30 transition-colors"
            >
              {s.icon}
              <span className="text-2xl font-extrabold gradient-text">{s.value}</span>
              <span className="text-[11px] font-medium text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Tool Cards ── */}
      <section id="tools" className="py-8 sm:py-12 px-4 sm:px-6 max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Choose Your Generator</h2>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            Two focused tools — one for full project scaffolding, one for build files only.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {tools.map((tool, i) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="glass-panel rounded-3xl border border-slate-200 dark:border-white/10 p-6 sm:p-8 flex flex-col gap-5 group relative overflow-hidden hover:border-blue-500/30 dark:hover:border-blue-500/30 transition-all shadow-xl"
            >
              {/* gradient glow */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none rounded-3xl`}
              />

              <div className="flex items-start justify-between">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center text-white shadow-lg ${tool.glow} shadow-xl`}>
                  {tool.icon}
                </div>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${tool.badgeColor}`}>
                  {tool.badge}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-extrabold mb-2 text-slate-900 dark:text-white">{tool.emoji} {tool.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{tool.description}</p>
              </div>

              <ul className="space-y-1.5">
                {tool.highlights.map((h, j) => (
                  <li key={j} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>

              <Link
                href={tool.href}
                className={`mt-auto w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r ${tool.gradient} text-white font-bold text-sm hover:brightness-110 transition-all shadow-lg`}
              >
                {tool.cta}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">How It Works</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            From zero to a running Spring Boot project in six steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="glass-panel rounded-2xl border border-slate-200 dark:border-white/10 p-5 sm:p-6 flex gap-4 hover:border-blue-500/20 dark:hover:border-blue-500/20 transition-colors"
            >
              <span className="text-3xl font-extrabold gradient-text shrink-0 leading-none mt-0.5">
                {step.n}
              </span>
              <div>
                <h4 className="font-bold text-sm mb-1 text-slate-900 dark:text-white">{step.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Interactive Code Preview ── */}
      <section id="preview" className="py-8 sm:py-16 px-4 sm:px-6 max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Generated Code Quality</h2>
          <p className="text-muted-foreground text-sm">
            Clean, formatted Java 21 & Spring Boot 3.5 code adhering to SOLID principles.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-panel rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl"
        >
          {/* Window header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-b border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-secondary/50 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-2 text-xs font-mono text-muted-foreground hidden sm:inline">ArchForge Output Preview</span>
            </div>

            {/* Tabs — scroll on mobile */}
            <div className="flex items-center gap-1 bg-black/20 dark:bg-black/40 p-1 rounded-xl border border-slate-200 dark:border-white/5 overflow-x-auto scrollbar-hide">
              {sampleTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-mono whitespace-nowrap transition-all flex items-center gap-1 sm:gap-1.5 ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white font-semibold shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <FileCode className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                  <span className="truncate max-w-[80px] sm:max-w-none">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Code body */}
          <div className="p-4 sm:p-6 bg-[#040711] font-mono text-[11px] sm:text-sm text-slate-200 overflow-x-auto min-h-[240px] sm:min-h-[300px]">
            <AnimatePresence mode="wait">
              <motion.pre
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="leading-relaxed"
              >
                <code>{sampleTabs.find((t) => t.id === activeTab)?.content}</code>
              </motion.pre>
            </AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* ── Feature Grid ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-4xl font-extrabold mb-4">Everything You Need, Built Right</h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            Eliminate boilerplate overhead. Generate a clean foundation tailored to your exact requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              whileHover={{ y: -4 }}
              className={`glass-panel p-6 rounded-3xl border bg-gradient-to-br ${f.bg} ${f.border} transition-all`}
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 dark:bg-white/5 border border-white/10 flex items-center justify-center mb-4 shadow-inner">
                {f.icon}
              </div>
              <h3 className="text-base font-bold mb-2 text-slate-900 dark:text-white">{f.title}</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── SEO FAQ Section (Google Rich Snippets) ── */}
      <section id="faq" className="py-16 sm:py-24 px-4 sm:px-6 max-w-4xl mx-auto relative z-10">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "What is ArchForge and how is it different from Spring Initializr?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "ArchForge is an advanced visual Spring Boot architecture generator. Unlike standard Spring Initializr which only creates a flat starter project, ArchForge allows you to visually choose architectural patterns (Layered, Hexagonal Ports & Adapters, Clean Architecture, or Modular Monolith), pick 200+ live verified starters, and select YAML or Properties format with pre-configured JWT security, Flyway migrations, and Docker.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Can I generate a standalone pom.xml or build.gradle without downloading a ZIP?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes! ArchForge features a dedicated Build File Generator page (/generate-pom) that lets you generate production-grade Maven pom.xml or Gradle build.gradle files online with live Maven Central coordinates, copyable directly into your editor.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Which Spring Boot versions and Java SDKs are supported?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "ArchForge dynamically synchronizes with official Spring Initializr metadata to support Spring Boot 3.5+, 3.4+, and 3.3 GA releases alongside Java 21 LTS, Java 23, Java 25, and Java 17.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Can I choose between application.yml and application.properties?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. In the project setup step, you can switch between YAML (application.yml) and classic flat-key style (application.properties). All multi-profile dev/prod database and security configs update in real-time.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Is the generated Spring Boot code compilable out of the box?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "100%. Every generated ZIP project includes Maven or Gradle wrappers, sanitized dependencies with BOM-managed versions, source sets, and unit tests so you can unzip and run ./mvnw spring-boot:run or ./gradlew bootRun immediately without manual dependency troubleshooting.",
                  },
                },
              ],
            }),
          }}
        />

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold glass-panel border border-blue-500/30 text-blue-400 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Frequently Asked Questions
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold mb-3">Everything You Need to Know</h2>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            Learn why backend developers use ArchForge as their primary Spring Boot architecture builder.
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "What is ArchForge and how is it different from Spring Initializr?",
              a: "ArchForge is an advanced visual Spring Boot architecture generator. Unlike standard Spring Initializr which creates a basic flat structure, ArchForge lets you choose architectural patterns (Layered, Hexagonal, Clean, or Modular Monolith), pick 200+ live starters, and choose between YAML or Properties format with pre-built JWT security, Flyway migrations, and Docker.",
            },
            {
              q: "Can I generate a standalone pom.xml or build.gradle without downloading a ZIP?",
              a: "Yes! Use our dedicated Build File Generator (/generate-pom) to configure dependencies and generate clean, valid Maven pom.xml or Gradle build.gradle code instantly without generating full project folders.",
            },
            {
              q: "Which Spring Boot versions and Java SDKs are supported?",
              a: "ArchForge fetches live metadata from start.spring.io to support the latest Spring Boot 3.5+, 3.4+, and 3.3 GA releases alongside Java 21 LTS, Java 23, Java 25, and Java 17.",
            },
            {
              q: "Can I choose between application.yml and application.properties?",
              a: "Yes. In the setup step, switch between YAML (application.yml) and Properties (application.properties). All multi-profile dev/prod database and security configs adapt automatically.",
            },
            {
              q: "Is the generated Spring Boot code compilable out of the box?",
              a: "100%. Every generated ZIP contains Maven/Gradle wrappers, sanitized dependency coordinates, and unit tests so you can unzip and run immediately without dependency resolution errors.",
            },
          ].map((item, idx) => (
            <details
              key={idx}
              className="group glass-panel rounded-2xl border border-slate-200 dark:border-white/10 p-5 transition-all cursor-pointer [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex items-center justify-between font-bold text-sm sm:text-base text-slate-900 dark:text-white select-none">
                <span>{item.q}</span>
                <span className="ml-3 flex-shrink-0 transition-transform group-open:rotate-180 text-blue-500 font-mono">
                  ▼
                </span>
              </summary>
              <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal border-t border-slate-200/60 dark:border-white/5 pt-3">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-panel p-8 sm:p-14 rounded-3xl border border-blue-500/30 relative overflow-hidden bg-gradient-to-br from-blue-900/20 via-indigo-900/10 to-transparent"
        >
          {/* Decorative glow */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl" aria-hidden>
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-blue-600/20 blur-[80px]" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-violet-600/20 blur-[80px]" />
          </div>

          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold glass-panel border border-blue-500/30 text-blue-400 mb-6">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              Production Ready
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold mb-4">
              Ready to Scaffold Your Next Project?
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-8">
              Create your custom Spring Boot project structure with zero configuration hassle. Download and run in seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/generate"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white font-bold text-sm hover:scale-105 transition-all shadow-xl"
              >
                <Zap className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                Full Project Scaffolder
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/generate-pom"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-sm glass-panel hover:bg-white/5 border border-slate-200 dark:border-white/10 transition-all text-emerald-600 dark:text-emerald-400"
              >
                <FileCode className="w-4 h-4" />
                Build File Generator
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 border-t border-slate-200 dark:border-white/5 text-center text-xs text-muted-foreground relative z-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-[10px]">
              AF
            </div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">ArchForge</span>
          </div>
          <p>© {new Date().getFullYear()} ArchForge — Production Ready Spring Boot Scaffolder.</p>
          <div className="flex items-center gap-4">
            <Link href="/generate" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Scaffolder</Link>
            <Link href="/generate-pom" className="hover:text-emerald-500 transition-colors">pom.xml</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
