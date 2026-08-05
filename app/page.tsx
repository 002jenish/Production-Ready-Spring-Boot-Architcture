"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Code2,
  Download,
  Layers,
  Shield,
  Zap,
  GitBranch,
  Star,
  CheckCircle2,
  Terminal,
  Cpu,
  Boxes,
  Sparkles,
  ChevronRight,
  FileCode,
  FolderTree
} from "lucide-react";

const features = [
  {
    icon: <Layers className="w-6 h-6 text-blue-400" />,
    title: "Visual Architecture Designer",
    description:
      "Choose from Layered, Hexagonal, Clean, or Modular Monolith patterns with real-time interactive diagrams.",
    bg: "from-blue-500/10 to-indigo-500/5 border-blue-500/20",
    accent: "#3b82f6"
  },
  {
    icon: <Zap className="w-6 h-6 text-violet-400" />,
    title: "Instant ZIP Scaffolding",
    description:
      "Generates a complete, compilable Spring Boot project ZIP in <2 seconds. Unzip and run immediately.",
    bg: "from-violet-500/10 to-purple-500/5 border-violet-500/20",
    accent: "#8b5cf6"
  },
  {
    icon: <Shield className="w-6 h-6 text-emerald-400" />,
    title: "Production-Grade Security",
    description:
      "Stateless JWT auth, Spring Security, OAuth2, and BCrypt pre-configured with industry standard security filters.",
    bg: "from-emerald-500/10 to-teal-500/5 border-emerald-500/20",
    accent: "#10b981"
  },
  {
    icon: <Code2 className="w-6 h-6 text-cyan-400" />,
    title: "Production Ready DevOps",
    description:
      "Multi-profile YAML configs, Flyway DB migrations, multi-stage Dockerfiles, and GitHub Actions CI pipelines.",
    bg: "from-cyan-500/10 to-sky-500/5 border-cyan-500/20",
    accent: "#06b6d4"
  },
];

const stats = [
  { value: "4", label: "Architecture Patterns", icon: <Boxes className="w-4 h-4 text-blue-400" /> },
  { value: "18+", label: "Spring Boot Starters", icon: <Cpu className="w-4 h-4 text-violet-400" /> },
  { value: "< 2s", label: "Generation Speed", icon: <Zap className="w-4 h-4 text-emerald-400" /> },
  { value: "100%", label: "Compilable Java 21", icon: <CheckCircle2 className="w-4 h-4 text-cyan-400" /> },
];

const sampleTabs = [
  {
    id: "pom",
    label: "pom.xml",
    language: "xml",
    content: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.5.3</version>
    </parent>
    <groupId>com.archforge</groupId>
    <artifactId>inventory-service</artifactId>
    <properties>
        <java.version>21</java.version>
    </properties>
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
</project>`
  },
  {
    id: "security",
    label: "SecurityConfig.java",
    language: "java",
    content: `@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(STATELESS))
            .authorizeHttpRequests(a -> a
                .requestMatchers("/api/auth/**", "/swagger-ui/**").permitAll()
                .anyRequest().authenticated())
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }
}`
  },
  {
    id: "yaml",
    label: "application-dev.yml",
    language: "yaml",
    content: `spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/inventory_db
    username: \${DB_USERNAME:postgres}
    password: \${DB_PASSWORD:password}
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true

application:
  security:
    jwt:
      expiration: 86400000 # 24 Hours`
  },
  {
    id: "docker",
    label: "docker-compose.yml",
    language: "yaml",
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
      POSTGRES_PASSWORD: password`
  }
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("security");

  return (
    <div className="min-h-screen bg-mesh text-foreground relative overflow-hidden">
      {/* Background Animated Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            x: [0, 80, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-blue-600/15 blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, -60, 0],
            y: [0, 80, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 -right-32 w-[550px] h-[550px] rounded-full bg-violet-600/15 blur-[140px]"
        />
      </div>

      {/* Navigation */}
      <header className="fixed top-0 inset-x-0 z-50 glass-panel border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:scale-105 transition-transform">
              AF
            </div>
            <span className="font-extrabold text-xl tracking-tight gradient-text">
              ArchForge
            </span>
          </Link>

          <div className="flex items-center gap-5">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <GitBranch className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <Link
              href="/generate"
              className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold hover:brightness-110 transition-all shadow-lg glow-primary"
            >
              <span>Start Generator</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-36 pb-20 px-6 max-w-7xl mx-auto text-center relative z-10">
        {/* Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold glass-panel border border-blue-500/30 text-blue-300 mb-8 shadow-inner"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span>Spring Initializr + JHipster Hybrid Architecture Builder</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.15]"
        >
          Forge Production-Ready <br className="hidden sm:inline" />
          <span className="gradient-text">Spring Boot Architecture</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-normal"
        >
          Visually select your architecture pattern (Layered, Hexagonal, Clean, or Modular Monolith), choose dependencies, and download a compilable Java 21 starter project ZIP instantly.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link
            href="/generate"
            className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white font-bold text-base hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl glow-primary"
          >
            <Zap className="w-5 h-5 fill-current text-yellow-300" />
            <span>Launch Visual Generator</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#interactive-demo"
            className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-base glass-panel hover:bg-white/5 border border-white/10 transition-all"
          >
            <span>Explore Templates</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </a>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              className="glass-panel p-5 rounded-2xl border border-white/5 text-center flex flex-col items-center justify-center hover:border-blue-500/30 transition-colors"
            >
              <div className="flex items-center gap-1.5 mb-1">
                {stat.icon}
                <span className="text-3xl font-extrabold gradient-text">
                  {stat.value}
                </span>
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Interactive Code Preview Section */}
      <section id="interactive-demo" className="py-16 px-6 max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3">Generated Code Quality</h2>
          <p className="text-muted-foreground text-sm">
            Clean, formatted Java 21 & Spring Boot 3.5 code adhering to SOLID principles.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-panel rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
        >
          {/* Code Window Header / Tabs */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-secondary/50 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-2 text-xs font-mono text-muted-foreground hidden sm:inline">
                ArchForge Output Preview
              </span>
            </div>

            {/* Code Tabs */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
              {sampleTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white font-semibold shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Code Editor Body */}
          <div className="p-6 bg-[#040711] font-mono text-xs sm:text-sm text-slate-200 overflow-x-auto min-h-[300px]">
            <AnimatePresence mode="wait">
              <motion.pre
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="leading-relaxed"
              >
                <code>{sampleTabs.find((t) => t.id === activeTab)?.content}</code>
              </motion.pre>
            </AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 px-6 max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Everything You Need, Built Right
          </h2>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            Eliminate boilerplate overhead. Generate a clean foundation tailored to your exact architectural requirements.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -4 }}
              className={`glass-panel p-8 rounded-3xl border bg-gradient-to-br ${feature.bg} transition-all`}
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-inner">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call to Action Footer Banner */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center relative z-10">
        <div className="glass-panel p-12 rounded-3xl border border-blue-500/30 relative overflow-hidden bg-gradient-to-br from-blue-900/20 via-indigo-900/10 to-transparent">
          <h2 className="text-3xl font-extrabold mb-4">
            Ready to Scaffold Your Next Project?
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-8">
            Create your custom Spring Boot project structure with zero configuration hassle.
          </p>
          <Link
            href="/generate"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-base hover:scale-105 transition-all shadow-xl glow-primary"
          >
            <Download className="w-5 h-5" />
            <span>Generate Project ZIP Now</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5 text-center text-xs text-muted-foreground relative z-10">
        <p>ArchForge © {new Date().getFullYear()} — Production Ready Spring Boot Scaffolder.</p>
      </footer>
    </div>
  );
}
