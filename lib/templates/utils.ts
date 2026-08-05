import { GenerateRequest } from "../types";

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function getBasePackage(req: GenerateRequest): string {
  return (req.groupId + "." + req.artifactId).replace(/-/g, "");
}

export function getBasePackagePath(req: GenerateRequest): string {
  return getBasePackage(req).replace(/\./g, "/");
}

export function getMainClassName(req: GenerateRequest): string {
  const words = req.artifactId.replace(/-/g, " ").replace(/_/g, " ").split(" ");
  return (
    words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("") +
    "Application"
  );
}

export function has(req: GenerateRequest, dep: string): boolean {
  return req.dependencies?.includes(dep) ?? false;
}

export const hasSecurity = (req: GenerateRequest) =>
  has(req, "security") || has(req, "jwt");
export const hasJwt = (req: GenerateRequest) => has(req, "jwt");
export const hasJpa = (req: GenerateRequest) => has(req, "jpa");
export const hasPostgres = (req: GenerateRequest) => has(req, "postgresql");
export const hasMysql = (req: GenerateRequest) => has(req, "mysql");
export const hasMongo = (req: GenerateRequest) => has(req, "mongodb");
export const hasSwagger = (req: GenerateRequest) => has(req, "swagger");
export const hasDocker = (req: GenerateRequest) => has(req, "docker");
export const hasGithub = (req: GenerateRequest) => has(req, "github-actions");
export const hasFlyway = (req: GenerateRequest) => has(req, "flyway");
export const hasOauth2 = (req: GenerateRequest) => has(req, "oauth2");
export const hasActuator = (req: GenerateRequest) => has(req, "actuator");
export const hasAudit = (req: GenerateRequest) => has(req, "audit-logging");
export const hasExHandler = (req: GenerateRequest) => has(req, "exception-handler");
