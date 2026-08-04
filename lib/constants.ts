import { DependencyDef } from "./types";

export const SPRING_BOOT_VERSIONS = ["3.5.3", "3.4.7", "3.3.12"];

export const JAVA_VERSIONS = ["17", "21"] as const;

export const DEPENDENCIES: DependencyDef[] = [
  // ── Core ─────────────────────────────────────────────────────────────────
  {
    id: "web",
    label: "Spring Web",
    description: "Build web & RESTful apps using Spring MVC",
    icon: "🌐",
    category: "core",
    alwaysIncluded: true,
  },
  {
    id: "validation",
    label: "Validation",
    description: "Bean Validation with Hibernate Validator",
    icon: "✅",
    category: "core",
  },
  {
    id: "jpa",
    label: "Spring Data JPA",
    description: "Persist data in SQL stores with Hibernate",
    icon: "🗄️",
    category: "core",
  },
  {
    id: "lombok",
    label: "Lombok",
    description: "Java annotation library to reduce boilerplate",
    icon: "⚡",
    category: "core",
    alwaysIncluded: true,
  },
  {
    id: "actuator",
    label: "Actuator",
    description: "Production-ready health & metrics endpoints",
    icon: "📊",
    category: "core",
  },
  // ── Security ──────────────────────────────────────────────────────────────
  {
    id: "security",
    label: "Spring Security",
    description: "Authentication and access-control framework",
    icon: "🔐",
    category: "security",
  },
  {
    id: "jwt",
    label: "JWT Authentication",
    description: "Stateless JWT token auth with JJWT library",
    icon: "🔑",
    category: "security",
  },
  {
    id: "oauth2",
    label: "OAuth2",
    description: "OAuth2 resource server support",
    icon: "🔒",
    category: "security",
  },
  // ── Database ──────────────────────────────────────────────────────────────
  {
    id: "postgresql",
    label: "PostgreSQL",
    description: "Production-grade relational database",
    icon: "🐘",
    category: "database",
  },
  {
    id: "mysql",
    label: "MySQL",
    description: "World's most popular open-source database",
    icon: "🐬",
    category: "database",
  },
  {
    id: "mongodb",
    label: "MongoDB",
    description: "NoSQL document-oriented database",
    icon: "🍃",
    category: "database",
  },
  // ── DevTools ──────────────────────────────────────────────────────────────
  {
    id: "swagger",
    label: "OpenAPI / Swagger",
    description: "API documentation with SpringDoc",
    icon: "📖",
    category: "devtools",
  },
  {
    id: "docker",
    label: "Docker Support",
    description: "Multi-stage Dockerfile + docker-compose.yml",
    icon: "🐳",
    category: "devtools",
  },
  {
    id: "github-actions",
    label: "GitHub Actions",
    description: "Maven CI workflow with test reports",
    icon: "⚙️",
    category: "devtools",
  },
  {
    id: "flyway",
    label: "Flyway",
    description: "Database migration & version control",
    icon: "🚀",
    category: "devtools",
  },
  {
    id: "exception-handler",
    label: "Global Exception Handler",
    description: "Centralized @ControllerAdvice error handling",
    icon: "🛡️",
    category: "devtools",
  },
  {
    id: "audit-logging",
    label: "Audit Logging",
    description: "JPA audit listener with createdAt/updatedBy",
    icon: "📝",
    category: "devtools",
  },
];

export const ARCHITECTURES = [
  {
    id: "layered",
    label: "Layered Architecture",
    description:
      "Classic N-tier: Controller → Service → Repository. Best for standard CRUD applications.",
    icon: "🏗️",
    packages: ["controller", "service", "repository", "entity", "dto", "config"],
  },
  {
    id: "hexagonal",
    label: "Hexagonal Architecture",
    description:
      "Ports & Adapters pattern. Business logic fully isolated from infrastructure.",
    icon: "⬡",
    packages: ["domain", "application/port/in", "application/port/out", "adapter/in/web", "adapter/out/persistence", "config"],
  },
  {
    id: "clean",
    label: "Clean Architecture",
    description:
      "Uncle Bob's Clean Architecture. Dependency inversion from the inside out.",
    icon: "🎯",
    packages: ["domain/entity", "domain/usecase", "domain/repository", "infrastructure", "presentation", "config"],
  },
  {
    id: "modular",
    label: "Modular Monolith",
    description:
      "Feature-based modules. Enforces boundaries without microservice overhead.",
    icon: "📦",
    packages: ["shared", "user", "auth", "notification", "config"],
  },
];
