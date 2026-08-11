import JSZip from "jszip";
import { GenerateRequest } from "./types";
import { generateZip } from "./templates/zip-generator";
import {
  generateSecurityConfig, generateJwtService, generateJwtFilter,
  generateCustomUserDetailsService, generateAuthController
} from "./templates/security-generator";
import {
  generateDockerfile, generateDockerCompose,
  generateGithubActionsWorkflow, generateFlywayMigration
} from "./templates/devops-generator";
import {
  generateApplicationYml, generateApplicationDevYml, generateApplicationProdYml, getConfigFilenames
} from "./templates/yml-generator";
import {
  generateGlobalExceptionHandler, generateResourceNotFoundException,
  generateBaseEntity, generateAuditorAware, generateOpenApiConfig,
  generateSampleController, generateCorsConfig
} from "./templates/source-generator";
import {
  getBasePackagePath, getBasePackage, getMainClassName, hasJwt, hasSecurity,
  hasJpa, hasAudit, hasExHandler, hasSwagger, hasDocker,
  hasGithub, hasFlyway
} from "./templates/utils";
import { ARCHFORGE_CODE_FEATURES } from "./constants";

const SPRING_INITIALIZR_URL = "https://start.spring.io";

export const FALLBACK_SPRING_VERSIONS = [
  { version: "3.5.3", label: "3.5.3 (Latest Stable)", isDefault: true },
  { version: "3.4.3", label: "3.4.3 (GA)", isDefault: false },
  { version: "3.3.9", label: "3.3.9 (GA)", isDefault: false },
  { version: "3.2.12", label: "3.2.12 (LTS)", isDefault: false },
];

export const FALLBACK_JAVA_VERSIONS = [
  { version: "25", label: "25", isDefault: false },
  { version: "23", label: "23", isDefault: false },
  { version: "21", label: "21", isDefault: true },
  { version: "17", label: "17", isDefault: false },
];

function getDepIcon(id: string): string {
  const s = id.toLowerCase();
  if (s.includes("webflux") || s.includes("reactive")) return "⚡";
  if (s.includes("web")) return "🌐";
  if (s.includes("security") || s.includes("oauth")) return "🔐";
  if (s.includes("jwt")) return "🔑";
  if (s.includes("postgres")) return "🐘";
  if (s.includes("mysql") || s.includes("mariadb")) return "🐬";
  if (s.includes("mongo")) return "🍃";
  if (s.includes("redis")) return "🔴";
  if (s.includes("kafka")) return "⚡";
  if (s.includes("amqp") || s.includes("rabbit")) return "🐇";
  if (s.includes("jpa") || s.includes("jdbc") || s.includes("sql")) return "🗄️";
  if (s.includes("actuator")) return "📊";
  if (s.includes("swagger") || s.includes("openapi")) return "📖";
  if (s.includes("flyway") || s.includes("liquibase")) return "🚀";
  if (s.includes("validation")) return "✅";
  if (s.includes("lombok")) return "⚡";
  if (s.includes("mail")) return "✉️";
  if (s.includes("graphql")) return "🕸️";
  if (s.includes("docker")) return "🐳";
  if (s.includes("cache")) return "🚀";
  if (s.includes("h2")) return "💧";
  if (s.includes("cloud") || s.includes("eureka")) return "☁️";
  return "📦";
}

function mapCategory(catName: string, id: string): "archforge" | "core" | "security" | "database" | "messaging" | "devtools" {
  const name = (catName || "").toLowerCase();
  const depId = (id || "").toLowerCase();

  if (depId === "web" || depId === "lombok" || depId === "validation" || name.includes("web") || name.includes("core")) return "core";
  if (depId.includes("security") || depId.includes("oauth") || depId.includes("jwt") || name.includes("security")) return "security";
  if (name.includes("sql") || name.includes("nosql") || name.includes("data") || depId.includes("jpa") || depId.includes("mongo") || depId.includes("redis") || depId.includes("db")) return "database";
  if (name.includes("messaging") || name.includes("integration") || depId.includes("kafka") || depId.includes("amqp") || depId.includes("rabbit")) return "messaging";
  return "devtools";
}

export async function fetchSpringMetadata() {
  try {
    const res = await fetch(`${SPRING_INITIALIZR_URL}/metadata/client`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "ArchForge-Generator/1.0",
      },
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      throw new Error(`Spring Initializr metadata returned HTTP ${res.status}`);
    }

    const data = await res.json();
    const bootVersions = data?.bootVersion?.values;
    const javaVersionsData = data?.javaVersion?.values;
    const depGroups = data?.dependencies?.values;

    const parsedVersions = Array.isArray(bootVersions) && bootVersions.length > 0
      ? bootVersions.map((v: { id: string; name: string; default?: boolean }) => ({
          version: v.id,
          label: v.name,
          isDefault: !!v.default,
        }))
      : FALLBACK_SPRING_VERSIONS;

    const parsedJavaVersions = Array.isArray(javaVersionsData) && javaVersionsData.length > 0
      ? javaVersionsData.map((j: { id: string; name: string; default?: boolean }) => ({
          version: j.id,
          label: j.name || j.id,
          isDefault: !!j.default,
        }))
      : FALLBACK_JAVA_VERSIONS;

    const codeFeatureIds = new Set(ARCHFORGE_CODE_FEATURES.map((f) => f.id));
    const parsedDependencies: any[] = [...ARCHFORGE_CODE_FEATURES];

    if (Array.isArray(depGroups)) {
      for (const group of depGroups) {
        const catName = group.name || "Other";
        if (Array.isArray(group.values)) {
          for (const item of group.values) {
            if (codeFeatureIds.has(item.id)) continue;
            const category = mapCategory(catName, item.id);
            parsedDependencies.push({
              id: item.id,
              label: item.name || item.id,
              description: item.description || "",
              icon: getDepIcon(item.id),
              category,
              alwaysIncluded: item.id === "web" || item.id === "lombok",
              groupId: item.groupId,
              artifactId: item.artifactId,
              version: item.version,
              scope: item.scope,
            });
          }
        }
      }
    }

    return {
      versions: parsedVersions,
      javaVersions: parsedJavaVersions,
      dependencies: parsedDependencies,
      source: "spring-initializr-api",
    };
  } catch (error) {
    console.warn("Falling back to local Spring Boot metadata:", error);
    return {
      versions: FALLBACK_SPRING_VERSIONS,
      javaVersions: FALLBACK_JAVA_VERSIONS,
      dependencies: ARCHFORGE_CODE_FEATURES,
      source: "fallback",
    };
  }
}

export async function generateBaseProject(req: GenerateRequest): Promise<ArrayBuffer> {
  const type = req.buildTool === "gradle" ? "gradle-project" : "maven-project";
  const language = "java";
  const bootVersion = req.springBootVersion || "3.5.3";
  const groupId = req.groupId || "com.example";
  const artifactId = req.artifactId || "demo";
  const name = req.projectName || artifactId;
  const packageName = `${groupId}.${artifactId.replace(/-/g, "")}`;
  const javaVersion = req.javaVersion || "21";

  const codeFeatureIds = new Set(ARCHFORGE_CODE_FEATURES.map((f) => f.id));
  const initializrDeps = (req.dependencies || [])
    .filter((d) => !codeFeatureIds.has(d) || d === "web" || d === "lombok" || d === "validation" || d === "actuator" || d === "postgresql" || d === "mysql" || d === "mongodb")
    .join(",");

  const params = new URLSearchParams({
    type,
    language,
    bootVersion,
    groupId,
    artifactId,
    name,
    packageName,
    javaVersion,
    ...(initializrDeps ? { dependencies: initializrDeps } : {}),
  });

  const url = `${SPRING_INITIALIZR_URL}/starter.zip?${params.toString()}`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "ArchForge-Generator/1.0",
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Spring Initializr API failed (${response.status}): ${errorText || response.statusText}`);
  }

  return await response.arrayBuffer();
}

function getArchitecturePackages(req: GenerateRequest): string[] {
  switch (req.architecture) {
    case "hexagonal":
      return [
        "domain/model",
        "domain/port/in",
        "domain/port/out",
        "adapter/in/web",
        "adapter/out/persistence",
        "config",
      ];
    case "clean":
      return [
        "domain/entity",
        "domain/usecase",
        "domain/repository",
        "infrastructure/persistence",
        "infrastructure/config",
        "presentation/controller",
        "presentation/dto",
      ];
    case "modular":
      return [
        "shared/exception",
        "shared/util",
        "user/controller",
        "user/service",
        "user/repository",
        "user/entity",
        "user/dto",
        "auth/controller",
        "auth/service",
        "config",
      ];
    default: // layered
      return [
        "controller",
        "service/impl",
        "repository",
        "entity",
        "dto/request",
        "dto/response",
        "mapper",
        "exception",
        "security",
        "config",
        "util",
        "audit",
      ];
  }
}

export async function generateHybridProjectZip(req: GenerateRequest): Promise<Buffer> {
  let baseZipBuffer: ArrayBuffer | null = null;

  try {
    baseZipBuffer = await generateBaseProject(req);
  } catch (err) {
    console.warn("Spring Initializr API unreachable or failed. Falling back to ArchForge local generator:", err);
    return await generateZip(req);
  }

  try {
    const zip = await JSZip.loadAsync(baseZipBuffer);

    // Check if zip contains top-level artifactId folder prefix
    let rootPrefix = "";
    const firstKey = Object.keys(zip.files)[0];
    if (firstKey && firstKey.startsWith(`${req.artifactId}/`)) {
      rootPrefix = `${req.artifactId}/`;
    }

    const basePkgPath = getBasePackagePath(req);
    const srcMain = `${rootPrefix}src/main/java/${basePkgPath}`;
    const resources = `${rootPrefix}src/main/resources`;

    // ── Inject Architecture Packages ───────────────────────────────────────
    const packages = getArchitecturePackages(req);
    for (const pkg of packages) {
      zip.file(`${srcMain}/${pkg}/.gitkeep`, "");
    }

    // ── Inject CORS & OpenAPI Configs ──────────────────────────────────────
    zip.file(`${srcMain}/config/CorsConfig.java`, generateCorsConfig(req));
    if (hasSwagger(req)) {
      zip.file(`${srcMain}/config/OpenApiConfig.java`, generateOpenApiConfig(req));
    }

    // ── Inject Sample & Exception Controllers ──────────────────────────────
    zip.file(`${srcMain}/controller/HealthController.java`, generateSampleController(req));
    if (hasExHandler(req)) {
      zip.file(`${srcMain}/exception/GlobalExceptionHandler.java`, generateGlobalExceptionHandler(req));
    }
    zip.file(`${srcMain}/exception/ResourceNotFoundException.java`, generateResourceNotFoundException(req));

    // ── Inject JPA Audit ───────────────────────────────────────────────────
    if (hasJpa(req) && hasAudit(req)) {
      zip.file(`${srcMain}/entity/BaseEntity.java`, generateBaseEntity(req));
      zip.file(`${srcMain}/audit/AuditorAwareImpl.java`, generateAuditorAware(req));
    }

    // ── Inject JWT / Security ──────────────────────────────────────────────
    if (hasJwt(req)) {
      zip.file(`${srcMain}/config/SecurityConfig.java`, generateSecurityConfig(req));
      zip.file(`${srcMain}/security/JwtService.java`, generateJwtService(req));
      zip.file(`${srcMain}/security/JwtFilter.java`, generateJwtFilter(req));
      zip.file(`${srcMain}/security/CustomUserDetailsService.java`, generateCustomUserDetailsService(req));
      zip.file(`${srcMain}/controller/AuthController.java`, generateAuthController(req));
    }

    // ── Inject Resources (YMLs / .properties, Flyway) ──────────────────────
    const cfgFiles = getConfigFilenames(req);
    zip.file(`${resources}/${cfgFiles.dev}`, generateApplicationDevYml(req));
    zip.file(`${resources}/${cfgFiles.prod}`, generateApplicationProdYml(req));
    if (hasFlyway(req)) {
      zip.file(`${resources}/db/migration/V1__init.sql`, generateFlywayMigration(req));
    }

    // ── Inject DevOps (Docker & GitHub Actions) ─────────────────────────────
    if (hasDocker(req)) {
      zip.file(`${rootPrefix}docker/Dockerfile`, generateDockerfile(req));
      zip.file(`${rootPrefix}docker-compose.yml`, generateDockerCompose(req));
    }
    if (hasGithub(req)) {
      zip.file(`${rootPrefix}.github/workflows/ci.yml`, generateGithubActionsWorkflow(req));
    }

    // ── Apply User Custom Tree Overrides if present ────────────────────────
    if (req.customTreeActions && req.customTreeActions.length > 0) {
      for (const action of req.customTreeActions) {
        if (action.type === "add") {
          const path = action.path.startsWith("/") ? action.path.slice(1) : action.path;
          if (action.nodeType === "folder") {
            zip.file(`${rootPrefix}${path}/.gitkeep`, "");
          } else {
            zip.file(`${rootPrefix}${path}`, "// Custom created file via ArchForge Tree Editor\n");
          }
        } else if (action.type === "delete") {
          const path = action.path.startsWith("/") ? action.path.slice(1) : action.path;
          zip.remove(`${rootPrefix}${path}`);
        }
      }
    }

    // Flatten top-level directory so pom.xml/build.gradle sits directly at root
    const cleanZip = new JSZip();
    const finalKeys = Object.keys(zip.files);
    for (const key of finalKeys) {
      if (zip.files[key].dir) continue;
      const cleanPath = rootPrefix && key.startsWith(rootPrefix) ? key.slice(rootPrefix.length) : key;
      if (cleanPath) {
        const fileContent = await zip.files[key].async("nodebuffer");
        cleanZip.file(cleanPath, fileContent);
      }
    }

    const outputBuffer = await cleanZip.generateAsync({ type: "nodebuffer" });
    return outputBuffer;
  } catch (zipErr) {
    console.warn("Failed to inject files into Spring Initializr zip. Falling back to local zip generator:", zipErr);
    return await generateZip(req);
  }
}
