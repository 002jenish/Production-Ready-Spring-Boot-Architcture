import { GenerateRequest } from "../types";
import {
  hasActuator, hasFlyway, hasJpa, hasJwt, hasMongo, hasMysql,
  hasPostgres, hasSwagger, getBasePackage
} from "./utils";

export function generateApplicationYml(req: GenerateRequest): string {
  const pkg = getBasePackage(req);
  let s = `spring:
  application:
    name: ${req.artifactId}
  profiles:
    active: \${SPRING_PROFILES_ACTIVE:dev}
`;

  if (hasJpa(req) && !hasMongo(req)) {
    s += `
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    open-in-view: false
    properties:
      hibernate:
        format_sql: true
        dialect: ${hasMysql(req) ? "org.hibernate.dialect.MySQLDialect" : "org.hibernate.dialect.PostgreSQLDialect"}
`;
  }

  if (hasMongo(req)) {
    s += `
  data:
    mongodb:
      uri: \${MONGODB_URI:mongodb://localhost:27017}
      database: \${MONGODB_DB:${req.artifactId.replace(/-/g, "_")}}
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

export function generateApplicationDevYml(req: GenerateRequest): string {
  const pkg = getBasePackage(req);
  let s = `# ── Development Profile ──────────────────────────────────────────
spring:
`;

  if (hasJpa(req) && !hasMongo(req)) {
    const url = hasMysql(req)
      ? `jdbc:mysql://localhost:3306/${req.artifactId.replace(/-/g, "_")}?useSSL=false&allowPublicKeyRetrieval=true`
      : `jdbc:postgresql://localhost:5432/${req.artifactId.replace(/-/g, "_")}`;
    s += `  datasource:
    url: ${url}
    username: \${DB_USERNAME:postgres}
    password: \${DB_PASSWORD:password}
    hikari:
      maximum-pool-size: 5
      minimum-idle: 2
  jpa:
    show-sql: true
`;
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

export function generateApplicationProdYml(req: GenerateRequest): string {
  const pkg = getBasePackage(req);
  let s = `# ── Production Profile ───────────────────────────────────────────
spring:
`;

  if (hasJpa(req) && !hasMongo(req)) {
    const url = hasMysql(req)
      ? `jdbc:mysql://\${DB_HOST}:\${DB_PORT:3306}/${req.artifactId.replace(/-/g, "_")}`
      : `jdbc:postgresql://\${DB_HOST}:\${DB_PORT:5432}/${req.artifactId.replace(/-/g, "_")}`;
    s += `  datasource:
    url: ${url}
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

  s += `
logging:
  level:
    root: WARN
    ${pkg}: INFO
`;
  return s;
}
