export type Architecture = "layered" | "hexagonal" | "clean" | "modular";
export type BuildTool = "maven" | "gradle";
export type ConfigFormat = "yaml" | "properties";
export type Packaging = "jar" | "war";

export type DependencyCategory = "archforge" | "core" | "security" | "database" | "messaging" | "devtools";

export interface DependencyDef {
  id: string;
  label: string;
  description: string;
  icon: string;
  category: DependencyCategory;
  alwaysIncluded?: boolean;
  isCodeFeature?: boolean; // True if this feature generates custom Java/YAML/Docker code
  groupId?: string;
  artifactId?: string;
  version?: string;
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
  buildTool?: BuildTool;
  configFormat?: ConfigFormat;
  packaging?: Packaging;
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
  buildTool?: BuildTool;
  configFormat?: ConfigFormat;
  packaging?: Packaging;
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
