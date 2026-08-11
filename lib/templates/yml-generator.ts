import { GenerateRequest } from "../types";
import {
  hasActuator, hasFlyway, hasJpa, hasJwt, hasMongo, hasMysql,
  hasPostgres, hasSwagger, getBasePackage, has
} from "./utils";

// ── Helpers ──────────────────────────────────────────────────────────────────
const hasRedis      = (req: GenerateRequest) => has(req, "data-redis") || has(req, "redis");
const hasKafka      = (req: GenerateRequest) => has(req, "kafka");
const hasR2dbc      = (req: GenerateRequest) => has(req, "r2dbc");
const hasCassandra  = (req: GenerateRequest) => has(req, "data-cassandra") || has(req, "cassandra");
const hasElastic    = (req: GenerateRequest) => has(req, "data-elasticsearch") || has(req, "elasticsearch");
const hasMariadb    = (req: GenerateRequest) => has(req, "mariadb");
const hasH2         = (req: GenerateRequest) => has(req, "h2");
const hasMssql      = (req: GenerateRequest) => has(req, "mssql");
const hasRabbit     = (req: GenerateRequest) => has(req, "amqp") || has(req, "rabbit") || has(req, "rabbitmq");
const hasGraphql    = (req: GenerateRequest) => has(req, "graphql");

function dbName(req: GenerateRequest): string {
  return req.artifactId.replace(/-/g, "_");
}

function isYaml(req: GenerateRequest): boolean {
  return (req.configFormat ?? "yaml") === "yaml";
}

// ── YAML generators ───────────────────────────────────────────────────────────

function buildMainYaml(req: GenerateRequest): string {
  const pkg = getBasePackage(req);
  let s = `spring:
  application:
    name: ${req.artifactId}
  profiles:
    active: \${SPRING_PROFILES_ACTIVE:dev}
`;

  if (hasJpa(req) && !hasMongo(req) && !hasR2dbc(req)) {
    const dialect = hasMysql(req) || hasMariadb(req)
      ? "org.hibernate.dialect.MySQLDialect"
      : hasMssql(req)
      ? "org.hibernate.dialect.SQLServerDialect"
      : "org.hibernate.dialect.PostgreSQLDialect";
    s += `
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    open-in-view: false
    properties:
      hibernate:
        format_sql: true
        dialect: ${dialect}
`;
  }

  if (hasMongo(req)) {
    s += `
  data:
    mongodb:
      uri: \${MONGODB_URI:mongodb://localhost:27017}
      database: \${MONGODB_DB:${dbName(req)}}
`;
  }

  if (hasRedis(req)) {
    s += `
  data:
    redis:
      host: \${REDIS_HOST:localhost}
      port: \${REDIS_PORT:6379}
      password: \${REDIS_PASSWORD:}
      timeout: 2000ms
`;
  }

  if (hasCassandra(req)) {
    s += `
  cassandra:
    keyspace-name: \${CASSANDRA_KEYSPACE:${dbName(req)}}
    contact-points: \${CASSANDRA_HOST:localhost}
    port: \${CASSANDRA_PORT:9042}
    local-datacenter: datacenter1
`;
  }

  if (hasElastic(req)) {
    s += `
  elasticsearch:
    uris: \${ELASTICSEARCH_URIS:http://localhost:9200}
    username: \${ELASTICSEARCH_USER:}
    password: \${ELASTICSEARCH_PASSWORD:}
`;
  }

  if (hasKafka(req)) {
    s += `
  kafka:
    bootstrap-servers: \${KAFKA_BOOTSTRAP_SERVERS:localhost:9092}
    consumer:
      group-id: ${req.artifactId}-group
      auto-offset-reset: earliest
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.apache.kafka.common.serialization.StringDeserializer
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.apache.kafka.common.serialization.StringSerializer
`;
  }

  if (hasRabbit(req)) {
    s += `
  rabbitmq:
    host: \${RABBITMQ_HOST:localhost}
    port: \${RABBITMQ_PORT:5672}
    username: \${RABBITMQ_USERNAME:guest}
    password: \${RABBITMQ_PASSWORD:guest}
    virtual-host: /
`;
  }

  if (hasR2dbc(req)) {
    s += `
  r2dbc:
    url: \${R2DBC_URL:r2dbc:postgresql://localhost:5432/${dbName(req)}}
    username: \${DB_USERNAME:postgres}
    password: \${DB_PASSWORD:password}
`;
  }

  if (hasGraphql(req)) {
    s += `
  graphql:
    graphiql:
      enabled: true
    schema:
      printer:
        enabled: true
`;
  }

  if (hasFlyway(req)) {
    s += `
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true
`;
  }

  if (hasActuator(req)) {
    s += `
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: when-authorized
`;
  }

  if (hasSwagger(req)) {
    s += `
springdoc:
  api-docs:
    path: /api-docs
  swagger-ui:
    path: /swagger-ui.html
    try-it-out-enabled: true
    operations-sorter: method
`;
  }

  if (hasJwt(req)) {
    s += `
application:
  security:
    jwt:
      secret-key: \${JWT_SECRET_KEY:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}
      expiration: \${JWT_EXPIRATION:86400000}
      refresh-token:
        expiration: \${JWT_REFRESH_EXPIRATION:604800000}
`;
  }

  return s;
}

function buildDevYaml(req: GenerateRequest): string {
  const pkg = getBasePackage(req);
  let s = `# ── Development Profile ──────────────────────────────────────────
spring:
`;

  if ((hasJpa(req) || hasR2dbc(req)) && !hasMongo(req)) {
    const jdbcUrl = hasMysql(req)
      ? `jdbc:mysql://localhost:3306/${dbName(req)}?useSSL=false&allowPublicKeyRetrieval=true`
      : hasMariadb(req)
      ? `jdbc:mariadb://localhost:3306/${dbName(req)}`
      : hasMssql(req)
      ? `jdbc:sqlserver://localhost:1433;databaseName=${dbName(req)}`
      : hasH2(req)
      ? `jdbc:h2:mem:${dbName(req)};DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=false`
      : `jdbc:postgresql://localhost:5432/${dbName(req)}`;

    if (!hasR2dbc(req)) {
      s += `  datasource:
    url: ${jdbcUrl}
    username: \${DB_USERNAME:${hasH2(req) ? "sa" : "postgres"}}
    password: \${DB_PASSWORD:${hasH2(req) ? "" : "password"}}
    hikari:
      maximum-pool-size: 5
      minimum-idle: 2
`;
    }

    if (hasJpa(req)) {
      s += `  jpa:
    hibernate:
      ddl-auto: ${hasH2(req) ? "create-drop" : "validate"}
    show-sql: true
`;
    }

    if (hasH2(req)) {
      s += `  h2:
    console:
      enabled: true
      path: /h2-console
`;
    }
  }

  s += `
logging:
  level:
    root: INFO
    ${pkg}: DEBUG
    org.hibernate.SQL: DEBUG
    org.springframework.security: DEBUG
`;
  return s;
}

function buildProdYaml(req: GenerateRequest): string {
  const pkg = getBasePackage(req);
  let s = `# ── Production Profile ───────────────────────────────────────────
spring:
`;

  if ((hasJpa(req) || hasR2dbc(req)) && !hasMongo(req)) {
    const jdbcUrl = hasMysql(req)
      ? `jdbc:mysql://\${DB_HOST}:\${DB_PORT:3306}/${dbName(req)}`
      : hasMariadb(req)
      ? `jdbc:mariadb://\${DB_HOST}:\${DB_PORT:3306}/${dbName(req)}`
      : hasMssql(req)
      ? `jdbc:sqlserver://\${DB_HOST}:\${DB_PORT:1433};databaseName=${dbName(req)}`
      : `jdbc:postgresql://\${DB_HOST}:\${DB_PORT:5432}/${dbName(req)}`;

    if (!hasR2dbc(req)) {
      s += `  datasource:
    url: ${jdbcUrl}
    username: \${DB_USERNAME}
    password: \${DB_PASSWORD}
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
`;
    }
  }

  s += `
logging:
  level:
    root: WARN
    ${pkg}: INFO
`;
  return s;
}

// ── .properties generators ────────────────────────────────────────────────────

function buildMainProperties(req: GenerateRequest): string {
  const lines: string[] = [
    `spring.application.name=${req.artifactId}`,
    `spring.profiles.active=\${SPRING_PROFILES_ACTIVE:dev}`,
  ];

  if (hasJpa(req) && !hasMongo(req) && !hasR2dbc(req)) {
    const dialect = hasMysql(req) || hasMariadb(req)
      ? "org.hibernate.dialect.MySQLDialect"
      : hasMssql(req)
      ? "org.hibernate.dialect.SQLServerDialect"
      : "org.hibernate.dialect.PostgreSQLDialect";
    lines.push(
      "",
      "# JPA",
      "spring.jpa.hibernate.ddl-auto=validate",
      "spring.jpa.show-sql=false",
      "spring.jpa.open-in-view=false",
      "spring.jpa.properties.hibernate.format_sql=true",
      `spring.jpa.properties.hibernate.dialect=${dialect}`,
    );
  }

  if (hasMongo(req)) {
    lines.push(
      "",
      "# MongoDB",
      `spring.data.mongodb.uri=\${MONGODB_URI:mongodb://localhost:27017}`,
      `spring.data.mongodb.database=\${MONGODB_DB:${dbName(req)}}`,
    );
  }

  if (hasRedis(req)) {
    lines.push(
      "",
      "# Redis",
      `spring.data.redis.host=\${REDIS_HOST:localhost}`,
      `spring.data.redis.port=\${REDIS_PORT:6379}`,
      `spring.data.redis.password=\${REDIS_PASSWORD:}`,
      `spring.data.redis.timeout=2000ms`,
    );
  }

  if (hasCassandra(req)) {
    lines.push(
      "",
      "# Cassandra",
      `spring.cassandra.keyspace-name=\${CASSANDRA_KEYSPACE:${dbName(req)}}`,
      `spring.cassandra.contact-points=\${CASSANDRA_HOST:localhost}`,
      `spring.cassandra.port=\${CASSANDRA_PORT:9042}`,
      `spring.cassandra.local-datacenter=datacenter1`,
    );
  }

  if (hasElastic(req)) {
    lines.push(
      "",
      "# Elasticsearch",
      `spring.elasticsearch.uris=\${ELASTICSEARCH_URIS:http://localhost:9200}`,
      `spring.elasticsearch.username=\${ELASTICSEARCH_USER:}`,
      `spring.elasticsearch.password=\${ELASTICSEARCH_PASSWORD:}`,
    );
  }

  if (hasKafka(req)) {
    lines.push(
      "",
      "# Kafka",
      `spring.kafka.bootstrap-servers=\${KAFKA_BOOTSTRAP_SERVERS:localhost:9092}`,
      `spring.kafka.consumer.group-id=${req.artifactId}-group`,
      `spring.kafka.consumer.auto-offset-reset=earliest`,
      `spring.kafka.consumer.key-deserializer=org.apache.kafka.common.serialization.StringDeserializer`,
      `spring.kafka.consumer.value-deserializer=org.apache.kafka.common.serialization.StringDeserializer`,
      `spring.kafka.producer.key-serializer=org.apache.kafka.common.serialization.StringSerializer`,
      `spring.kafka.producer.value-serializer=org.apache.kafka.common.serialization.StringSerializer`,
    );
  }

  if (hasRabbit(req)) {
    lines.push(
      "",
      "# RabbitMQ",
      `spring.rabbitmq.host=\${RABBITMQ_HOST:localhost}`,
      `spring.rabbitmq.port=\${RABBITMQ_PORT:5672}`,
      `spring.rabbitmq.username=\${RABBITMQ_USERNAME:guest}`,
      `spring.rabbitmq.password=\${RABBITMQ_PASSWORD:guest}`,
      `spring.rabbitmq.virtual-host=/`,
    );
  }

  if (hasR2dbc(req)) {
    lines.push(
      "",
      "# R2DBC",
      `spring.r2dbc.url=\${R2DBC_URL:r2dbc:postgresql://localhost:5432/${dbName(req)}}`,
      `spring.r2dbc.username=\${DB_USERNAME:postgres}`,
      `spring.r2dbc.password=\${DB_PASSWORD:password}`,
    );
  }

  if (hasFlyway(req)) {
    lines.push(
      "",
      "# Flyway",
      `spring.flyway.enabled=true`,
      `spring.flyway.locations=classpath:db/migration`,
      `spring.flyway.baseline-on-migrate=true`,
    );
  }

  if (hasActuator(req)) {
    lines.push(
      "",
      "# Actuator",
      `management.endpoints.web.exposure.include=health,info,metrics,prometheus`,
      `management.endpoint.health.show-details=when-authorized`,
    );
  }

  if (hasSwagger(req)) {
    lines.push(
      "",
      "# SpringDoc / Swagger",
      `springdoc.api-docs.path=/api-docs`,
      `springdoc.swagger-ui.path=/swagger-ui.html`,
      `springdoc.swagger-ui.try-it-out-enabled=true`,
      `springdoc.swagger-ui.operations-sorter=method`,
    );
  }

  if (hasJwt(req)) {
    lines.push(
      "",
      "# JWT",
      `application.security.jwt.secret-key=\${JWT_SECRET_KEY:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}`,
      `application.security.jwt.expiration=\${JWT_EXPIRATION:86400000}`,
      `application.security.jwt.refresh-token.expiration=\${JWT_REFRESH_EXPIRATION:604800000}`,
    );
  }

  return lines.join("\n") + "\n";
}

function buildDevProperties(req: GenerateRequest): string {
  const pkg = getBasePackage(req);
  const lines: string[] = [
    "# ── Development Profile ──────────────────────────────────────────",
  ];

  if ((hasJpa(req) || hasR2dbc(req)) && !hasMongo(req)) {
    const jdbcUrl = hasMysql(req)
      ? `jdbc:mysql://localhost:3306/${dbName(req)}?useSSL=false&allowPublicKeyRetrieval=true`
      : hasMariadb(req)
      ? `jdbc:mariadb://localhost:3306/${dbName(req)}`
      : hasMssql(req)
      ? `jdbc:sqlserver://localhost:1433;databaseName=${dbName(req)}`
      : hasH2(req)
      ? `jdbc:h2:mem:${dbName(req)};DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=false`
      : `jdbc:postgresql://localhost:5432/${dbName(req)}`;

    if (!hasR2dbc(req)) {
      lines.push(
        "",
        "# Datasource",
        `spring.datasource.url=${jdbcUrl}`,
        `spring.datasource.username=\${DB_USERNAME:${hasH2(req) ? "sa" : "postgres"}}`,
        `spring.datasource.password=\${DB_PASSWORD:${hasH2(req) ? "" : "password"}}`,
        `spring.datasource.hikari.maximum-pool-size=5`,
        `spring.datasource.hikari.minimum-idle=2`,
      );
    }

    if (hasJpa(req)) {
      lines.push(
        "",
        "# JPA (dev)",
        `spring.jpa.hibernate.ddl-auto=${hasH2(req) ? "create-drop" : "validate"}`,
        `spring.jpa.show-sql=true`,
      );
    }

    if (hasH2(req)) {
      lines.push(
        "",
        "# H2 Console",
        `spring.h2.console.enabled=true`,
        `spring.h2.console.path=/h2-console`,
      );
    }
  }

  lines.push(
    "",
    "# Logging",
    `logging.level.root=INFO`,
    `logging.level.${pkg}=DEBUG`,
    `logging.level.org.hibernate.SQL=DEBUG`,
    `logging.level.org.springframework.security=DEBUG`,
  );

  return lines.join("\n") + "\n";
}

function buildProdProperties(req: GenerateRequest): string {
  const pkg = getBasePackage(req);
  const lines: string[] = [
    "# ── Production Profile ───────────────────────────────────────────",
  ];

  if ((hasJpa(req) || hasR2dbc(req)) && !hasMongo(req)) {
    const jdbcUrl = hasMysql(req)
      ? `jdbc:mysql://\${DB_HOST}:\${DB_PORT:3306}/${dbName(req)}`
      : hasMariadb(req)
      ? `jdbc:mariadb://\${DB_HOST}:\${DB_PORT:3306}/${dbName(req)}`
      : hasMssql(req)
      ? `jdbc:sqlserver://\${DB_HOST}:\${DB_PORT:1433};databaseName=${dbName(req)}`
      : `jdbc:postgresql://\${DB_HOST}:\${DB_PORT:5432}/${dbName(req)}`;

    if (!hasR2dbc(req)) {
      lines.push(
        "",
        "# Datasource",
        `spring.datasource.url=${jdbcUrl}`,
        `spring.datasource.username=\${DB_USERNAME}`,
        `spring.datasource.password=\${DB_PASSWORD}`,
        `spring.datasource.hikari.maximum-pool-size=20`,
        `spring.datasource.hikari.minimum-idle=5`,
        `spring.datasource.hikari.connection-timeout=30000`,
        `spring.datasource.hikari.idle-timeout=600000`,
        `spring.datasource.hikari.max-lifetime=1800000`,
      );
    }
  }

  lines.push(
    "",
    "# Logging",
    `logging.level.root=WARN`,
    `logging.level.${pkg}=INFO`,
  );

  return lines.join("\n") + "\n";
}

// ── Public API ────────────────────────────────────────────────────────────────

export function generateApplicationYml(req: GenerateRequest): string {
  return isYaml(req) ? buildMainYaml(req) : buildMainProperties(req);
}

export function generateApplicationDevYml(req: GenerateRequest): string {
  return isYaml(req) ? buildDevYaml(req) : buildDevProperties(req);
}

export function generateApplicationProdYml(req: GenerateRequest): string {
  return isYaml(req) ? buildProdYaml(req) : buildProdProperties(req);
}

/** Returns the correct filenames for main / dev / prod config files based on chosen format */
export function getConfigFilenames(req: GenerateRequest): {
  main: string;
  dev: string;
  prod: string;
} {
  const ext = isYaml(req) ? "yml" : "properties";
  return {
    main: `application.${ext}`,
    dev: `application-dev.${ext}`,
    prod: `application-prod.${ext}`,
  };
}
