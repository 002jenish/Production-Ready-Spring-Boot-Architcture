import { GenerateRequest } from "../types";
import {
  hasActuator, hasFlyway, hasJpa, hasJwt,
  hasMongo, hasMysql, hasOauth2, hasPostgres, hasSecurity, hasSwagger
} from "./utils";
import { resolveDependency } from "./dependency-resolver";

function normalizeSpringVersion(raw: string): string {
  let v = raw.replace(/\s*\(snapshot\)/gi, "-SNAPSHOT");
  v = v.replace(/\.BUILD-SNAPSHOT$/i, "-SNAPSHOT");
  v = v.replace(/-SNAPSHOT-SNAPSHOT$/i, "-SNAPSHOT");
  return v.trim();
}

export function generateBuildGradle(req: GenerateRequest): string {
  const springVersion = normalizeSpringVersion(req.springBootVersion);

  const jpaDep = hasJpa(req) && !hasMongo(req) ? "    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'\n" : "";
  const mongoDep = hasMongo(req) ? "    implementation 'org.springframework.boot:spring-boot-starter-data-mongodb'\n" : "";
  const securityDep = hasSecurity(req) ? "    implementation 'org.springframework.boot:spring-boot-starter-security'\n" : "";
  const jwtDep = hasJwt(req)
    ? "    implementation 'io.jsonwebtoken:jjwt-api:0.12.6'\n    runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.12.6'\n    runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.12.6'\n"
    : "";
  const swaggerDep = hasSwagger(req) ? "    implementation 'org.springdoc:springdoc-openapi-starter-webmvc-ui:2.8.9'\n" : "";
  const actuatorDep = hasActuator(req) ? "    implementation 'org.springframework.boot:spring-boot-starter-actuator'\n" : "";
  const flywayDep = hasFlyway(req) ? "    implementation 'org.flywaydb:flyway-core'\n" : "";
  const postgresDep = hasPostgres(req) ? "    runtimeOnly 'org.postgresql:postgresql'\n" : "";
  const mysqlDep = hasMysql(req) ? "    runtimeOnly 'com.mysql:mysql-connector-j'\n" : "";

  const isWar = req.packaging === "war";
  const tomcatWarDep = isWar ? "    providedRuntime 'org.springframework.boot:spring-boot-starter-tomcat'\n" : "";

  const seenArtifacts = new Set<string>([
    "spring-boot-starter-web",
    "spring-boot-starter-validation",
    "lombok",
    "spring-boot-starter-test",
    ...(isWar ? ["spring-boot-starter-tomcat"] : []),
    ...(hasJpa(req) && !hasMongo(req) ? ["spring-boot-starter-data-jpa"] : []),
    ...(hasMongo(req) ? ["spring-boot-starter-data-mongodb"] : []),
    ...(hasSecurity(req) ? ["spring-boot-starter-security", "spring-security-test"] : []),
    ...(hasJwt(req) ? ["jjwt-api", "jjwt-impl", "jjwt-jackson"] : []),
    ...(hasOauth2(req) ? ["spring-boot-starter-oauth2-resource-server"] : []),
    ...(hasPostgres(req) ? ["postgresql", "flyway-database-postgresql"] : []),
    ...(hasMysql(req) ? ["mysql-connector-j", "flyway-mysql"] : []),
    ...(hasFlyway(req) ? ["flyway-core"] : []),
    ...(hasActuator(req) ? ["spring-boot-starter-actuator"] : []),
    ...(hasSwagger(req) ? ["springdoc-openapi-starter-webmvc-ui"] : []),
    "exception-handler", "audit-logging", "docker", "github-actions"
  ]);

  const extraDepsLines: string[] = [];
  for (const depId of (req.dependencies || [])) {
    const resolved = resolveDependency(depId);
    if (!resolved) continue;

    if (seenArtifacts.has(resolved.artifactId)) continue;
    seenArtifacts.add(resolved.artifactId);

    let conf = "implementation";
    if (resolved.scope === "runtime") {
      conf = "runtimeOnly";
    } else if (resolved.scope === "test") {
      conf = "testImplementation";
    } else if (resolved.optional) {
      conf = "developmentOnly";
    }

    const cleanVer = resolved.version?.trim();
    const versionStr = cleanVer && cleanVer.length > 0 ? `:${cleanVer}` : "";
    extraDepsLines.push(`    ${conf} '${resolved.groupId}:${resolved.artifactId}${versionStr}'\n`);
  }

  const extraDeps = extraDepsLines.join("");

  return `plugins {
    id 'java'
${isWar ? "    id 'war'\n" : ""}    id 'org.springframework.boot' version '${springVersion}'
    id 'io.spring.dependency-management' version '1.1.7'
}

group = '${req.groupId}'
version = '0.0.1-SNAPSHOT'

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(${req.javaVersion})
    }
}

sourceSets {
    main {
        java {
            srcDirs = ['src/main/java']
        }
        resources {
            srcDirs = ['src/main/resources']
        }
    }
    test {
        java {
            srcDirs = ['src/test/java']
        }
    }
}

configurations {
    compileOnly {
        extendsFrom annotationProcessor
    }
}

repositories {
    mavenCentral()
    maven { url 'https://repo.spring.io/milestone' }
    maven { url 'https://repo.spring.io/snapshot' }
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-validation'
${tomcatWarDep}${jpaDep}${mongoDep}${securityDep}${jwtDep}${swaggerDep}${actuatorDep}${flywayDep}${postgresDep}${mysqlDep}${extraDeps}    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testRuntimeOnly 'org.junit.platform:junit-platform-launcher'
}

tasks.named('test') {
    useJUnitPlatform()
}
`;
}

export function generateSettingsGradle(req: GenerateRequest): string {
  return `rootProject.name = '${req.artifactId}'\n`;
}
