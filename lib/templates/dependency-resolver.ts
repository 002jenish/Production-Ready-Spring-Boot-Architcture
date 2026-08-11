export interface ResolvedDependency {
  groupId: string;
  artifactId: string;
  version?: string;
  scope?: "runtime" | "test" | "compile" | "provided";
  optional?: boolean;
  comment?: string;
}

/**
 * IDs that are already handled in the primary generator blocks (pom-generator / gradle-generator)
 * OR are pure ArchForge code features with no Maven artifact.
 * Returning null prevents double-emission or fake artifacts.
 */
const HANDLED_OR_NON_MAVEN_IDS = new Set<string>([
  // Core – handled in primary blocks
  "web",
  "validation",
  "jpa",
  "data-jpa",
  "mongodb",
  "data-mongodb",
  "security",
  "jwt",
  "oauth2",
  "oauth2-resource-server",
  "spring-boot-starter-oauth2-resource-server",
  "postgresql",
  "postgres",
  "mysql",
  "flyway",
  "actuator",
  "swagger",
  "openapi",
  "lombok",
  // Already in SPECIAL_MAPPINGS — guard against double-resolution
  "kafka",
  "prometheus",
  "zipkin",
  "liquibase",
  "h2",
  "mariadb",
  "oracle",
  "mssql",
  // Pure ArchForge Code Features – generate Java files, no Maven artifact
  "exception-handler",
  "audit-logging",
  "docker",
  "github-actions",
  // RestClient is built into spring-boot-starter-web (Spring Boot 3.2+)
  "restclient",
  // GraalVM Native Image – handled by build plugin, not a dependency
  "native",
  "native-image",
]);

/**
 * Strict whitelist of dependency IDs → their genuine Maven/Gradle coordinates.
 * Only IDs listed here (or in HANDLED_OR_NON_MAVEN_IDS) will emit a dependency.
 * ALL other IDs will return null to prevent emitting fake/non-existent artifacts.
 */
const SPECIAL_MAPPINGS: Record<string, ResolvedDependency> = {
  // ── Spring Boot Official Starters (No explicit version — managed by parent POM BOM) ──
  "configuration-processor": {
    groupId: "org.springframework.boot", artifactId: "spring-boot-configuration-processor",
    optional: true, comment: "Spring Boot Configuration Processor",
  },
  webflux: { groupId: "org.springframework.boot", artifactId: "spring-boot-starter-webflux", comment: "Spring WebFlux" },
  webclient: { groupId: "org.springframework.boot", artifactId: "spring-boot-starter-webflux", comment: "Spring WebFlux (WebClient)" },
  thymeleaf: { groupId: "org.springframework.boot", artifactId: "spring-boot-starter-thymeleaf", comment: "Thymeleaf" },
  freemarker: { groupId: "org.springframework.boot", artifactId: "spring-boot-starter-freemarker", comment: "FreeMarker" },
  mustache: { groupId: "org.springframework.boot", artifactId: "spring-boot-starter-mustache", comment: "Mustache" },
  groovy: { groupId: "org.springframework.boot", artifactId: "spring-boot-starter-groovy-templates", comment: "Groovy Templates" },
  "data-rest": { groupId: "org.springframework.boot", artifactId: "spring-boot-starter-data-rest", comment: "Spring Data REST" },
  "data-jdbc": { groupId: "org.springframework.boot", artifactId: "spring-boot-starter-data-jdbc", comment: "Spring Data JDBC" },
  "data-redis": { groupId: "org.springframework.boot", artifactId: "spring-boot-starter-data-redis", comment: "Spring Data Redis" },
  redis: { groupId: "org.springframework.boot", artifactId: "spring-boot-starter-data-redis", comment: "Spring Data Redis" },
  "data-redis-reactive": {
    groupId: "org.springframework.boot", artifactId: "spring-boot-starter-data-redis-reactive", comment: "Spring Data Redis Reactive",
  },
  "data-elasticsearch": {
    groupId: "org.springframework.boot", artifactId: "spring-boot-starter-data-elasticsearch", comment: "Spring Data Elasticsearch",
  },
  elasticsearch: {
    groupId: "org.springframework.boot", artifactId: "spring-boot-starter-data-elasticsearch", comment: "Spring Data Elasticsearch",
  },
  "data-ldap": { groupId: "org.springframework.boot", artifactId: "spring-boot-starter-data-ldap", comment: "Spring Data LDAP" },
  ldap: { groupId: "org.springframework.boot", artifactId: "spring-boot-starter-data-ldap", comment: "Spring Data LDAP" },
  "data-mongodb-reactive": {
    groupId: "org.springframework.boot", artifactId: "spring-boot-starter-data-mongodb-reactive", comment: "Spring Data MongoDB Reactive",
  },
  "data-cassandra": {
    groupId: "org.springframework.boot", artifactId: "spring-boot-starter-data-cassandra", comment: "Spring Data Cassandra",
  },
  cassandra: {
    groupId: "org.springframework.boot", artifactId: "spring-boot-starter-data-cassandra", comment: "Spring Data Cassandra",
  },
  "data-cassandra-reactive": {
    groupId: "org.springframework.boot", artifactId: "spring-boot-starter-data-cassandra-reactive", comment: "Spring Data Cassandra Reactive",
  },
  "data-couchbase": {
    groupId: "org.springframework.boot", artifactId: "spring-boot-starter-data-couchbase", comment: "Spring Data Couchbase",
  },
  "data-neo4j": { groupId: "org.springframework.boot", artifactId: "spring-boot-starter-data-neo4j", comment: "Spring Data Neo4j" },
  neo4j: { groupId: "org.springframework.boot", artifactId: "spring-boot-starter-data-neo4j", comment: "Spring Data Neo4j" },
  "r2dbc": { groupId: "org.springframework.boot", artifactId: "spring-boot-starter-data-r2dbc", comment: "Spring Data R2DBC" },
  graphql: { groupId: "org.springframework.boot", artifactId: "spring-boot-starter-graphql", comment: "Spring GraphQL" },
  batch: { groupId: "org.springframework.boot", artifactId: "spring-boot-starter-batch", comment: "Spring Batch" },
  cache: { groupId: "org.springframework.boot", artifactId: "spring-boot-starter-cache", comment: "Spring Cache" },
  mail: { groupId: "org.springframework.boot", artifactId: "spring-boot-starter-mail", comment: "Spring Mail" },
  websocket: { groupId: "org.springframework.boot", artifactId: "spring-boot-starter-websocket", comment: "Spring WebSocket" },
  integration: { groupId: "org.springframework.boot", artifactId: "spring-boot-starter-integration", comment: "Spring Integration" },
  amqp: { groupId: "org.springframework.boot", artifactId: "spring-boot-starter-amqp", comment: "Spring AMQP (RabbitMQ)" },
  rabbit: { groupId: "org.springframework.boot", artifactId: "spring-boot-starter-amqp", comment: "Spring AMQP (RabbitMQ)" },
  rabbitmq: { groupId: "org.springframework.boot", artifactId: "spring-boot-starter-amqp", comment: "Spring AMQP (RabbitMQ)" },
  artemis: { groupId: "org.springframework.boot", artifactId: "spring-boot-starter-artemis", comment: "Spring Artemis" },
  jersey: { groupId: "org.springframework.boot", artifactId: "spring-boot-starter-jersey", comment: "Spring Jersey" },
  rsocket: { groupId: "org.springframework.boot", artifactId: "spring-boot-starter-rsocket", comment: "Spring RSocket" },
  quartz: { groupId: "org.springframework.boot", artifactId: "spring-boot-starter-quartz", comment: "Quartz Scheduler" },
  hateoas: { groupId: "org.springframework.boot", artifactId: "spring-boot-starter-hateoas", comment: "Spring HATEOAS" },
  "oauth2-client": {
    groupId: "org.springframework.boot", artifactId: "spring-boot-starter-oauth2-client", comment: "OAuth2 Client",
  },
  "oauth2-authorization-server": {
    groupId: "org.springframework.boot", artifactId: "spring-boot-starter-oauth2-authorization-server", comment: "OAuth2 Authorization Server",
  },
  // devtools – optional runtime dep
  devtools: {
    groupId: "org.springframework.boot", artifactId: "spring-boot-devtools",
    scope: "runtime", optional: true, comment: "Spring Boot DevTools",
  },
  // testcontainers – test scope
  testcontainers: {
    groupId: "org.springframework.boot", artifactId: "spring-boot-testcontainers",
    scope: "test", comment: "Testcontainers",
  },

  // ── Security & Auth Extensions ──────────────────────────────────────────────
  saml2: {
    groupId: "org.springframework.security", artifactId: "spring-security-saml2-service-provider",
    comment: "SAML 2.0 Service Provider",
  },
  "security-saml2": {
    groupId: "org.springframework.security", artifactId: "spring-security-saml2-service-provider",
    comment: "SAML 2.0 Service Provider",
  },
  okta: { groupId: "com.okta.spring", artifactId: "okta-spring-boot-starter", version: "3.0.7", comment: "Okta Spring Boot Starter" },

  // ── Spring Cloud Starters (must include spring-cloud BOM separately; we emit the artifact only) ──
  "cloud-gateway": {
    groupId: "org.springframework.cloud", artifactId: "spring-cloud-starter-gateway", comment: "Spring Cloud Gateway",
  },
  "cloud-eureka": {
    groupId: "org.springframework.cloud", artifactId: "spring-cloud-starter-netflix-eureka-client", comment: "Eureka Discovery Client",
  },
  "cloud-eureka-server": {
    groupId: "org.springframework.cloud", artifactId: "spring-cloud-starter-netflix-eureka-server", comment: "Eureka Server",
  },
  "cloud-config": {
    groupId: "org.springframework.cloud", artifactId: "spring-cloud-starter-config", comment: "Spring Cloud Config Client",
  },
  "cloud-config-server": {
    groupId: "org.springframework.cloud", artifactId: "spring-cloud-config-server", comment: "Spring Cloud Config Server",
  },
  "cloud-openfeign": {
    groupId: "org.springframework.cloud", artifactId: "spring-cloud-starter-openfeign", comment: "OpenFeign Client",
  },
  "cloud-circuitbreaker-resilience4j": {
    groupId: "org.springframework.cloud", artifactId: "spring-cloud-starter-circuitbreaker-resilience4j", comment: "Resilience4J Circuit Breaker",
  },
  resilience4j: {
    groupId: "org.springframework.cloud", artifactId: "spring-cloud-starter-circuitbreaker-resilience4j", comment: "Resilience4J Circuit Breaker",
  },
  "cloud-sleuth": {
    groupId: "org.springframework.cloud", artifactId: "spring-cloud-starter-sleuth", comment: "Spring Cloud Sleuth (Tracing)",
  },
  "cloud-stream": {
    groupId: "org.springframework.cloud", artifactId: "spring-cloud-stream", comment: "Spring Cloud Stream",
  },
  "cloud-bus": {
    groupId: "org.springframework.cloud", artifactId: "spring-cloud-bus", comment: "Spring Cloud Bus",
  },
  "cloud-task": {
    groupId: "org.springframework.cloud", artifactId: "spring-cloud-task-core", comment: "Spring Cloud Task",
  },
  "cloud-loadbalancer": {
    groupId: "org.springframework.cloud", artifactId: "spring-cloud-starter-loadbalancer", comment: "Spring Cloud LoadBalancer",
  },
  "cloud-contract-verifier": {
    groupId: "org.springframework.cloud", artifactId: "spring-cloud-contract-verifier",
    scope: "test", comment: "Spring Cloud Contract Verifier",
  },

  // ── Database Drivers (scope: runtime) ──────────────────────────────────────
  postgresql: { groupId: "org.postgresql", artifactId: "postgresql", scope: "runtime", comment: "PostgreSQL Driver" },
  postgres: { groupId: "org.postgresql", artifactId: "postgresql", scope: "runtime", comment: "PostgreSQL Driver" },
  mysql: { groupId: "com.mysql", artifactId: "mysql-connector-j", scope: "runtime", comment: "MySQL Driver" },
  mariadb: { groupId: "org.mariadb.jdbc", artifactId: "mariadb-java-client", scope: "runtime", comment: "MariaDB Driver" },
  oracle: { groupId: "com.oracle.database.jdbc", artifactId: "ojdbc11", scope: "runtime", comment: "Oracle Driver" },
  mssql: { groupId: "com.microsoft.sqlserver", artifactId: "mssql-jdbc", scope: "runtime", comment: "Microsoft SQL Server Driver" },
  h2: { groupId: "com.h2database", artifactId: "h2", scope: "runtime", comment: "H2 Database" },

  // ── Migration, Messaging & Observability ───────────────────────────────────
  flyway: { groupId: "org.flywaydb", artifactId: "flyway-core", comment: "Flyway Core" },
  liquibase: { groupId: "org.liquibase", artifactId: "liquibase-core", comment: "Liquibase Core" },
  kafka: { groupId: "org.springframework.kafka", artifactId: "spring-kafka", comment: "Spring Kafka" },
  "kafka-streams": { groupId: "org.apache.kafka", artifactId: "kafka-streams", comment: "Kafka Streams" },
  prometheus: { groupId: "io.micrometer", artifactId: "micrometer-registry-prometheus", comment: "Prometheus Metrics" },
  zipkin: { groupId: "io.zipkin.reporter2", artifactId: "zipkin-reporter-brave", comment: "Zipkin Tracing" },

  // ── Third-Party ─────────────────────────────────────────────────────────────
  htmx: { groupId: "io.github.wirthi", artifactId: "htmx-spring-boot-starter", version: "3.6.1", comment: "HTMX Spring Boot Starter" },
};

/**
 * Resolves a dependency ID into genuine Maven/Gradle coordinates.
 *
 * Resolution order:
 *  1. Explicit groupId:artifactId[:version] string → parsed directly
 *  2. IDs in HANDLED_OR_NON_MAVEN_IDS → return null (already handled / not a Maven dep)
 *  3. IDs in SPECIAL_MAPPINGS → return exact mapping
 *  4. Unknown IDs → return null (SAFE: prevents fake spring-boot-starter-xyz artifacts)
 *
 * This strict whitelist approach guarantees only real, resolvable Maven coordinates are emitted.
 */
export function resolveDependency(depId: string): ResolvedDependency | null {
  const cleanId = depId.trim();
  if (!cleanId) return null;

  // 1. Explicit Maven coordinate: "groupId:artifactId" or "groupId:artifactId:version"
  if (cleanId.includes(":")) {
    const parts = cleanId.split(":");
    const rawVersion = parts[2]?.trim();
    const version = rawVersion && rawVersion.length > 0 ? rawVersion : undefined;

    // Spring Boot & Spring Security starters are managed by parent BOM — strip version
    const isSpringManaged =
      parts[0] === "org.springframework.boot" || parts[0] === "org.springframework.security";

    return {
      groupId: parts[0],
      artifactId: parts[1] || parts[0],
      version: isSpringManaged ? undefined : version,
      comment: `${parts[0]}:${parts[1] || parts[0]}`,
    };
  }

  const lower = cleanId.toLowerCase();

  // 2. Already handled in primary generator blocks or pure code features — emit nothing
  if (HANDLED_OR_NON_MAVEN_IDS.has(lower)) {
    return null;
  }

  // 3. Known whitelist mapping
  if (SPECIAL_MAPPINGS[lower]) {
    return SPECIAL_MAPPINGS[lower];
  }

  // 4. Unknown ID — return null to prevent emitting fake/non-existent Maven artifacts.
  //    This is intentional: if an ID is not in the whitelist, it's safer to skip it
  //    than to generate a `spring-boot-starter-xyz` that doesn't exist on Maven Central.
  console.warn(`[dependency-resolver] Unknown dependency ID skipped: "${cleanId}". Add it to SPECIAL_MAPPINGS if it has a real Maven coordinate.`);
  return null;
}
