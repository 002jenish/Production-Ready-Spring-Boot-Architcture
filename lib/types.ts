export type Architecture = "layered" | "hexagonal" | "clean" | "modular";

export type DependencyId =
  // Core
  | "web" | "validation" | "jpa" | "lombok" | "actuator"
  // Security
  | "security" | "jwt" | "oauth2"
  // Database
  | "postgresql" | "mysql" | "mongodb"
  // DevTools
  | "swagger" | "docker" | "github-actions" | "flyway" | "exception-handler" | "audit-logging";

export interface DependencyDef {
  id: DependencyId;
  label: string;
  description: string;
  icon: string;
  category: "core" | "security" | "database" | "devtools";
  alwaysIncluded?: boolean;
}

export interface CustomTreeAction {
  type: "add" | "rename" | "delete";
  path: string;
  targetName?: string;
  nodeType?: "file" | "folder";
}

export interface GenerateRequest {
  projectName: string;
  groupId: string;
  artifactId: string;
  javaVersion: string;
  springBootVersion: string;
  architecture: Architecture;
  dependencies: string[];
  customTreeActions?: CustomTreeAction[];
}

export interface WizardState {
  projectName: string;
  groupId: string;
  artifactId: string;
  javaVersion: string;
  springBootVersion: string;
  architecture: Architecture;
  dependencies: string[];
  customTreeActions?: CustomTreeAction[];
}

export interface FolderNode {
  id?: string;
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FolderNode[];
  custom?: boolean;
}
