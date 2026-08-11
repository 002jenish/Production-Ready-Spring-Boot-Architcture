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

export function generatePomXml(req: GenerateRequest): string {
    const springVersion = normalizeSpringVersion(req.springBootVersion);
    const jwtBlock = hasJwt(req)
        ? `        <jjwt.version>0.12.6</jjwt.version>\n` : "";
    const springdocBlock = hasSwagger(req)
        ? `        <springdoc.version>2.8.9</springdoc.version>\n` : "";

    const jpaBlock = hasJpa(req) && !hasMongo(req) ? `
        <!-- Spring Data JPA -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>` : "";

    const mongoBlock = hasMongo(req) ? `
        <!-- Spring Data MongoDB -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-mongodb</artifactId>
        </dependency>` : "";

    const securityBlock = hasSecurity(req) ? `
        <!-- Spring Security -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>` : "";

    const jwtLibBlock = hasJwt(req) ? `
        <!-- JWT (JJWT) -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>\${jjwt.version}</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>\${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>\${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>` : "";

    const oauth2Block = hasOauth2(req) ? `
        <!-- OAuth2 Resource Server -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
        </dependency>` : "";

    const postgresBlock = hasPostgres(req) ? `
        <!-- PostgreSQL Driver -->
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>` : "";

    const mysqlBlock = hasMysql(req) ? `
        <!-- MySQL Driver -->
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>` : "";

    const flywayBlock = hasFlyway(req) ? `
        <!-- Flyway -->
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-core</artifactId>
        </dependency>${hasPostgres(req) ? `
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-database-postgresql</artifactId>
        </dependency>` : ""}${hasMysql(req) ? `
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-mysql</artifactId>
        </dependency>` : ""}` : "";

    const actuatorBlock = hasActuator(req) ? `
        <!-- Actuator -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>` : "";

    const swaggerBlock = hasSwagger(req) ? `
        <!-- OpenAPI / Swagger UI -->
        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
            <version>\${springdoc.version}</version>
        </dependency>` : "";

    const securityTestBlock = hasSecurity(req) ? `
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>` : "";

    // Set of artifacts already included in explicit blocks above to prevent duplicates
    const seenArtifacts = new Set<string>([
        "spring-boot-starter-web",
        "spring-boot-starter-validation",
        "lombok",
        "spring-boot-starter-test",
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
        // Pure code feature flags
        "exception-handler", "audit-logging", "docker", "github-actions"
    ]);

    // Dynamic extra dependencies mapper
    const extraDepsLines: string[] = [];
    for (const depId of (req.dependencies || [])) {
        const resolved = resolveDependency(depId);
        if (!resolved) continue;

        if (seenArtifacts.has(resolved.artifactId)) continue;
        seenArtifacts.add(resolved.artifactId);

        const comment = resolved.comment ? `\n        <!-- ${resolved.comment} -->` : "";
        const versionTag = resolved.version ? `\n            <version>${resolved.version}</version>` : "";
        const scopeTag = resolved.scope ? `\n            <scope>${resolved.scope}</scope>` : "";
        const optionalTag = resolved.optional ? `\n            <optional>true</optional>` : "";

        extraDepsLines.push(`${comment}
        <dependency>
            <groupId>${resolved.groupId}</groupId>
            <artifactId>${resolved.artifactId}</artifactId>${versionTag}${scopeTag}${optionalTag}
        </dependency>`);
    }

    const extraDeps = extraDepsLines.join("");

    return `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>${springVersion}</version>
        <relativePath/>
    </parent>

    <groupId>${req.groupId}</groupId>
    <artifactId>${req.artifactId}</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>${req.projectName}</name>
    <description>${req.projectName} - Generated by ArchForge</description>
    <packaging>jar</packaging>

    <properties>
        <java.version>${req.javaVersion}</java.version>
        <maven.compiler.source>${req.javaVersion}</maven.compiler.source>
        <maven.compiler.target>${req.javaVersion}</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
${jwtBlock}${springdocBlock}    </properties>

    <dependencies>
        <!-- Spring Web -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- Validation -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
${jpaBlock}${mongoBlock}${securityBlock}${jwtLibBlock}${oauth2Block}${postgresBlock}${mysqlBlock}${flywayBlock}${actuatorBlock}${swaggerBlock}${extraDeps}
        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>

        <!-- Testing -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>${securityTestBlock}
    </dependencies>

    <build>
        // <sourceDirectory>src/main/java</sourceDirectory>
        // <testSourceDirectory>src/test/java</testSourceDirectory>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
`;
}
