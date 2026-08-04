import { GenerateRequest } from "../types";
import { hasMongo, hasMysql, hasPostgres } from "./utils";

export function generateDockerfile(req: GenerateRequest): string {
  return `# ── Stage 1: Build ────────────────────────────────────────────────
FROM eclipse-temurin:${req.javaVersion}-jdk-alpine AS builder
WORKDIR /app
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline -B
COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# ── Stage 2: Run ──────────────────────────────────────────────────
FROM eclipse-temurin:${req.javaVersion}-jre-alpine AS runtime
WORKDIR /app

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", \\
    "-Djava.security.egd=file:/dev/./urandom", \\
    "-jar", \\
    "app.jar"]
`;
}

export function generateDockerCompose(req: GenerateRequest): string {
  const dbEnv = hasPostgres(req)
    ? `      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USERNAME=\${POSTGRES_USER:-postgres}
      - DB_PASSWORD=\${POSTGRES_PASSWORD:-password}`
    : hasMysql(req)
    ? `      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_USERNAME=\${MYSQL_USER:-root}
      - DB_PASSWORD=\${MYSQL_PASSWORD:-password}`
    : hasMongo(req)
    ? `      - MONGODB_URI=mongodb://mongo:27017
      - MONGODB_DB=${req.artifactId.replace(/-/g, "_")}`
    : "";

  const dbDepends = hasPostgres(req)
    ? `    depends_on:
      postgres:
        condition: service_healthy`
    : hasMysql(req)
    ? `    depends_on:
      mysql:
        condition: service_healthy`
    : hasMongo(req)
    ? `    depends_on:
      - mongo`
    : "";

  const dbName = req.artifactId.replace(/-/g, "_");

  const dbService = hasPostgres(req)
    ? `
  postgres:
    image: postgres:16-alpine
    container_name: ${req.artifactId}-db
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: ${dbName}
      POSTGRES_USER: \${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD:-password}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network
    restart: unless-stopped`
    : hasMysql(req)
    ? `
  mysql:
    image: mysql:8.0
    container_name: ${req.artifactId}-db
    ports:
      - "3306:3306"
    environment:
      MYSQL_DATABASE: ${dbName}
      MYSQL_ROOT_PASSWORD: \${MYSQL_PASSWORD:-password}
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network
    restart: unless-stopped`
    : hasMongo(req)
    ? `
  mongo:
    image: mongo:7.0
    container_name: ${req.artifactId}-mongo
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    networks:
      - app-network
    restart: unless-stopped`
    : "";

  const volumes = hasPostgres(req)
    ? `\nvolumes:\n  postgres_data:`
    : hasMysql(req)
    ? `\nvolumes:\n  mysql_data:`
    : hasMongo(req)
    ? `\nvolumes:\n  mongo_data:`
    : "";

  return `version: '3.9'

services:
  app:
    build:
      context: .
      dockerfile: docker/Dockerfile
    container_name: ${req.artifactId}-app
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
${dbEnv}
${dbDepends}
    networks:
      - app-network
    restart: unless-stopped
${dbService}
${volumes}

networks:
  app-network:
    driver: bridge
`;
}

export function generateGithubActionsWorkflow(req: GenerateRequest): string {
  const dbService = hasPostgres(req)
    ? `      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: testdb
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432`
    : hasMysql(req)
    ? `      mysql:
        image: mysql:8.0
        env:
          MYSQL_DATABASE: testdb
          MYSQL_ROOT_PASSWORD: password
        options: >-
          --health-cmd "mysqladmin ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 3306:3306`
    : hasMongo(req)
    ? `      mongo:
        image: mongo:7.0
        ports:
          - 27017:27017`
    : "";

  const dbEnvVars = hasPostgres(req)
    ? `        env:
          SPRING_DATASOURCE_URL: jdbc:postgresql://localhost:5432/testdb
          SPRING_DATASOURCE_USERNAME: postgres
          SPRING_DATASOURCE_PASSWORD: password
          SPRING_PROFILES_ACTIVE: test`
    : hasMysql(req)
    ? `        env:
          SPRING_DATASOURCE_URL: jdbc:mysql://localhost:3306/testdb?useSSL=false&allowPublicKeyRetrieval=true
          SPRING_DATASOURCE_USERNAME: root
          SPRING_DATASOURCE_PASSWORD: password
          SPRING_PROFILES_ACTIVE: test`
    : "";

  const servicesBlock = dbService
    ? `\n    services:\n${dbService}\n` : "";

  return `name: CI — Build & Test

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

permissions:
  contents: read

jobs:
  build:
    name: Build & Test
    runs-on: ubuntu-latest
${servicesBlock}
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up JDK ${req.javaVersion}
        uses: actions/setup-java@v4
        with:
          java-version: '${req.javaVersion}'
          distribution: 'temurin'
          cache: 'maven'

      - name: Build with Maven
        run: ./mvnw clean verify -B
${dbEnvVars}

      - name: Upload test reports
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-reports
          path: target/surefire-reports/

      - name: Upload build artifact
        if: success()
        uses: actions/upload-artifact@v4
        with:
          name: application-jar
          path: target/*.jar
          retention-days: 5
`;
}

export function generateFlywayMigration(req: GenerateRequest): string {
  const dbName = req.artifactId.replace(/-/g, "_");
  return `-- V1__init.sql
-- Initial database schema for ${req.projectName}
-- Generated by ArchForge

-- ── Example: Users table ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id          BIGSERIAL PRIMARY KEY,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    first_name  VARCHAR(100),
    last_name   VARCHAR(100),
    role        VARCHAR(50)  NOT NULL DEFAULT 'USER',
    enabled     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP,
    created_by  VARCHAR(100),
    updated_by  VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
`;
}
