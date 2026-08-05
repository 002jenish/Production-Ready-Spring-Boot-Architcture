import JSZip from "jszip";
import { GenerateRequest } from "../types";
import { generatePomXml } from "./pom-generator";
import { generateApplicationYml, generateApplicationDevYml, generateApplicationProdYml } from "./yml-generator";
import {
  generateMainClass, generateGlobalExceptionHandler, generateResourceNotFoundException,
  generateBaseEntity, generateAuditorAware, generateOpenApiConfig,
  generateSampleController, generateCorsConfig
} from "./source-generator";
import {
  generateSecurityConfig, generateJwtService, generateJwtFilter,
  generateCustomUserDetailsService, generateAuthController
} from "./security-generator";
import {
  generateDockerfile, generateDockerCompose,
  generateGithubActionsWorkflow, generateFlywayMigration
} from "./devops-generator";
import {
  getBasePackagePath, getBasePackage, getMainClassName, hasJwt, hasSecurity,
  hasJpa, hasAudit, hasExHandler, hasSwagger, hasDocker,
  hasGithub, hasFlyway
} from "./utils";

// Maven wrapper files (base64-encoded minimal stubs)
const MVNW_CONTENT = `#!/bin/sh
# Maven Wrapper script
# Download maven-wrapper.jar from the repo if not present
exec mvn "$@"
`;

const MVNW_CMD_CONTENT = `@echo off
rem Maven Wrapper script for Windows
mvn %*
`;

const MAVEN_WRAPPER_PROPERTIES = `distributionUrl=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.9/apache-maven-3.9.9-bin.zip
wrapperUrl=https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar
`;

const GITIGNORE_CONTENT = `HELP.md
target/
!.mvn/wrapper/maven-wrapper.jar
!**/src/main/**/target/
!**/src/test/**/target/

### STS ###
.apt_generated
.classpath
.factorypath
.project
.settings
.springBeans
.sts4-cache

### IntelliJ IDEA ###
.idea
*.iws
*.iml
*.ipr

### VS Code ###
.vscode/

### Mac OS ###
.DS_Store

# Environment
.env
.env.local
`;

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

function addGitKeep(zip: JSZip, path: string) {
  zip.file(`${path}/.gitkeep`, "");
}

export async function generateZip(req: GenerateRequest): Promise<Buffer> {
  const zip = new JSZip();
  const basePkgPath = getBasePackagePath(req);
  const srcMain = `src/main/java/${basePkgPath}`;
  const srcTest = `src/test/java/${basePkgPath}`;
  const resources = `src/main/resources`;

  // ── Root files ────────────────────────────────────────────────────────────
  zip.file("pom.xml", generatePomXml(req));
  zip.file(".gitignore", GITIGNORE_CONTENT);
  zip.file("README.md", generateReadme(req));

  // ── Maven Wrapper ─────────────────────────────────────────────────────────
  zip.file("mvnw", MVNW_CONTENT);
  zip.file("mvnw.cmd", MVNW_CMD_CONTENT);
  zip.file(".mvn/wrapper/maven-wrapper.properties", MAVEN_WRAPPER_PROPERTIES);

  // ── Main Application Class ────────────────────────────────────────────────
  const mainCls = getMainClassName(req);
  zip.file(`${srcMain}/${mainCls}.java`, generateMainClass(req));

  // ── Architecture-based package structure ──────────────────────────────────
  const packages = getArchitecturePackages(req);
  for (const pkg of packages) {
    addGitKeep(zip, `${srcMain}/${pkg}`);
  }

  // ── Config files ──────────────────────────────────────────────────────────
  zip.file(`${srcMain}/config/CorsConfig.java`, generateCorsConfig(req));

  if (hasSwagger(req)) {
    zip.file(`${srcMain}/config/OpenApiConfig.java`, generateOpenApiConfig(req));
  }

  // ── Sample Controller ─────────────────────────────────────────────────────
  zip.file(`${srcMain}/controller/HealthController.java`, generateSampleController(req));

  // ── Exception Handler ─────────────────────────────────────────────────────
  if (hasExHandler(req)) {
    zip.file(`${srcMain}/exception/GlobalExceptionHandler.java`, generateGlobalExceptionHandler(req));
  }
  zip.file(`${srcMain}/exception/ResourceNotFoundException.java`, generateResourceNotFoundException(req));

  // ── JPA Audit ─────────────────────────────────────────────────────────────
  if (hasJpa(req) && hasAudit(req)) {
    zip.file(`${srcMain}/entity/BaseEntity.java`, generateBaseEntity(req));
    zip.file(`${srcMain}/audit/AuditorAwareImpl.java`, generateAuditorAware(req));
  }

  // ── JWT Security ──────────────────────────────────────────────────────────
  if (hasJwt(req)) {
    zip.file(`${srcMain}/config/SecurityConfig.java`, generateSecurityConfig(req));
    zip.file(`${srcMain}/security/JwtService.java`, generateJwtService(req));
    zip.file(`${srcMain}/security/JwtFilter.java`, generateJwtFilter(req));
    zip.file(`${srcMain}/security/CustomUserDetailsService.java`, generateCustomUserDetailsService(req));
    zip.file(`${srcMain}/controller/AuthController.java`, generateAuthController(req));
  }

  // ── Resources ─────────────────────────────────────────────────────────────
  zip.file(`${resources}/application.yml`, generateApplicationYml(req));
  zip.file(`${resources}/application-dev.yml`, generateApplicationDevYml(req));
  zip.file(`${resources}/application-prod.yml`, generateApplicationProdYml(req));

  if (hasFlyway(req)) {
    zip.file(`${resources}/db/migration/V1__init.sql`, generateFlywayMigration(req));
  }

  // ── Test directory ────────────────────────────────────────────────────────
  zip.file(`${srcTest}/${mainCls}Tests.java`, generateTestClass(req));
  addGitKeep(zip, `src/test/resources`);

  // ── Docker ────────────────────────────────────────────────────────────────
  if (hasDocker(req)) {
    zip.file("docker/Dockerfile", generateDockerfile(req));
    zip.file("docker-compose.yml", generateDockerCompose(req));
    zip.file(".env.example", generateEnvExample(req));
  }

  // ── GitHub Actions ────────────────────────────────────────────────────────
  if (hasGithub(req)) {
    zip.file(".github/workflows/ci.yml", generateGithubActionsWorkflow(req));
  }

  // ── Apply User Custom Tree Overrides (Add / Rename / Delete) ──────────────
  if (req.customTreeActions && req.customTreeActions.length > 0) {
    for (const action of req.customTreeActions) {
      if (action.type === "add") {
        if (action.nodeType === "folder") {
          addGitKeep(zip, action.path);
        } else {
          const fileName = action.targetName || "CustomClass.java";
          const isJava = fileName.endsWith(".java");
          const className = fileName.replace(".java", "");
          const content = isJava
            ? `package ${getBasePackage(req)};\n\npublic class ${className} {\n}\n`
            : `// Custom user file: ${fileName}\n`;
          zip.file(action.path, content);
        }
      } else if (action.type === "delete") {
        zip.remove(action.path);
      } else if (action.type === "rename" && action.targetName) {
        const existingFile = zip.file(action.path);
        if (existingFile) {
          const fileStr = await existingFile.async("string");
          zip.remove(action.path);
          const dir = action.path.substring(0, action.path.lastIndexOf("/"));
          const newPath = dir ? `${dir}/${action.targetName}` : action.targetName;
          zip.file(newPath, fileStr);
        }
      }
    }
  }

  const buffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  return buffer;
}

function generateTestClass(req: GenerateRequest): string {
  const pkg = req.groupId + "." + req.artifactId.replace(/-/g, "");
  const cls = getMainClassName(req);
  return `package ${pkg};

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class ${cls}Tests {

    @Test
    void contextLoads() {
        // Verifies the Spring application context loads successfully
    }
}
`;
}

function generateReadme(req: GenerateRequest): string {
  return `# ${req.projectName}

> Generated by **ArchForge** — Spring Boot Project Architecture Generator

## Tech Stack

- **Java** ${req.javaVersion}
- **Spring Boot** ${req.springBootVersion}
- **Architecture**: ${req.architecture.charAt(0).toUpperCase() + req.architecture.slice(1)}

## Getting Started

### Prerequisites

- Java ${req.javaVersion}+
- Maven 3.9+${req.dependencies.includes("postgresql") ? "\n- PostgreSQL 16+" : ""}${req.dependencies.includes("mysql") ? "\n- MySQL 8+" : ""}${req.dependencies.includes("mongodb") ? "\n- MongoDB 7+" : ""}${req.dependencies.includes("docker") ? "\n- Docker & Docker Compose" : ""}

### Run Locally

\`\`\`bash
# Clone / unzip the project
cd ${req.artifactId}

# Configure your environment (copy and edit)
cp .env.example .env

# Run with Maven
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
\`\`\`

${req.dependencies.includes("docker") ? `### Run with Docker

\`\`\`bash
docker compose up --build
\`\`\`
` : ""}

### Build

\`\`\`bash
./mvnw clean package -DskipTests
java -jar target/${req.artifactId}-0.0.1-SNAPSHOT.jar
\`\`\`

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/health\` | Health check |
${req.dependencies.includes("jwt") ? "| POST | `/api/auth/login` | Authenticate and get JWT |\n| POST | `/api/auth/refresh` | Refresh access token |" : ""}
${req.dependencies.includes("actuator") ? "| GET | `/actuator/health` | Spring Boot Actuator health |" : ""}
${req.dependencies.includes("swagger") ? "| GET | `/swagger-ui.html` | Swagger UI |" : ""}

## Project Structure

Generated with **${req.architecture}** architecture pattern.

\`\`\`
src/main/java/${(req.groupId + "." + req.artifactId.replace(/-/g, "")).replace(/\./g, "/")}
${getArchitecturePackagesDocs(req)}
\`\`\`

---
*Generated by [ArchForge](https://github.com/archforge)*
`;
}

function getArchitecturePackagesDocs(req: GenerateRequest): string {
  switch (req.architecture) {
    case "hexagonal":
      return `├── domain/
│   ├── model/
│   ├── port/in/
│   └── port/out/
├── adapter/
│   ├── in/web/
│   └── out/persistence/
└── config/`;
    case "clean":
      return `├── domain/
│   ├── entity/
│   ├── usecase/
│   └── repository/
├── infrastructure/
│   ├── persistence/
│   └── config/
└── presentation/
    ├── controller/
    └── dto/`;
    case "modular":
      return `├── shared/
├── user/
│   ├── controller/
│   ├── service/
│   ├── repository/
│   └── entity/
├── auth/
└── config/`;
    default:
      return `├── controller/
├── service/impl/
├── repository/
├── entity/
├── dto/
│   ├── request/
│   └── response/
├── mapper/
├── exception/
├── security/
├── config/
├── util/
└── audit/`;
  }
}

function generateEnvExample(req: GenerateRequest): string {
  let s = `# Environment variables for ${req.projectName}
# Copy to .env and fill in values

SPRING_PROFILES_ACTIVE=prod
`;
  if (req.dependencies.includes("postgresql")) {
    s += `DB_HOST=localhost
DB_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
`;
  }
  if (req.dependencies.includes("mysql")) {
    s += `DB_HOST=localhost
DB_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_secure_password
`;
  }
  if (req.dependencies.includes("jwt")) {
    s += `JWT_SECRET_KEY=your_256_bit_hex_secret_key_here
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000
`;
  }
  return s;
}
