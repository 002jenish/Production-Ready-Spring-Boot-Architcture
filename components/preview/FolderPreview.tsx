"use client";

import { useMemo, useState } from "react";
import { WizardState, FolderNode, CustomTreeAction } from "@/lib/types";
import {
  Folder,
  FileText,
  Eye,
  RotateCcw,
  Check,
  X,
  FolderPlus,
  FilePlus,
  Edit2,
  Trash2,
  Copy,
  FileCode,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generatePomXml } from "@/lib/templates/pom-generator";
import { generateBuildGradle } from "@/lib/templates/gradle-generator";

interface FolderPreviewProps {
  state: WizardState;
  currentStep: number;
  onCustomActionsChange?: (actions: CustomTreeAction[]) => void;
}

function buildBaseTree(state: WizardState): FolderNode {
  const has = (dep: string) => state.dependencies?.includes(dep);
  const pkg = (state.groupId + "." + state.artifactId.replace(/-/g, "")).replace(/\./g, "/");
  const javaPkgPath = `src/main/java/${pkg || "com/example/app"}`;
  const resPath = `src/main/resources`;

  const getArchPackages = (): FolderNode[] => {
    switch (state.architecture) {
      case "hexagonal":
        return [
          {
            name: "domain",
            path: `${javaPkgPath}/domain`,
            type: "folder" as const,
            children: [
              { name: "model", path: `${javaPkgPath}/domain/model`, type: "folder" as const, children: [] },
              {
                name: "port",
                path: `${javaPkgPath}/domain/port`,
                type: "folder" as const,
                children: [
                  { name: "in", path: `${javaPkgPath}/domain/port/in`, type: "folder" as const, children: [] },
                  { name: "out", path: `${javaPkgPath}/domain/port/out`, type: "folder" as const, children: [] },
                ],
              },
            ],
          },
          {
            name: "adapter",
            path: `${javaPkgPath}/adapter`,
            type: "folder" as const,
            children: [
              { name: "in/web", path: `${javaPkgPath}/adapter/in/web`, type: "folder" as const, children: [] },
              { name: "out/persistence", path: `${javaPkgPath}/adapter/out/persistence`, type: "folder" as const, children: [] },
            ],
          },
        ];
      case "clean":
        return [
          {
            name: "domain",
            path: `${javaPkgPath}/domain`,
            type: "folder" as const,
            children: [
              { name: "entity", path: `${javaPkgPath}/domain/entity`, type: "folder" as const, children: [] },
              { name: "usecase", path: `${javaPkgPath}/domain/usecase`, type: "folder" as const, children: [] },
              { name: "repository", path: `${javaPkgPath}/domain/repository`, type: "folder" as const, children: [] },
            ],
          },
          {
            name: "infrastructure",
            path: `${javaPkgPath}/infrastructure`,
            type: "folder" as const,
            children: [
              { name: "persistence", path: `${javaPkgPath}/infrastructure/persistence`, type: "folder" as const, children: [] },
            ],
          },
          {
            name: "presentation",
            path: `${javaPkgPath}/presentation`,
            type: "folder" as const,
            children: [
              { name: "controller", path: `${javaPkgPath}/presentation/controller`, type: "folder" as const, children: [] },
              { name: "dto", path: `${javaPkgPath}/presentation/dto`, type: "folder" as const, children: [] },
            ],
          },
        ];
      case "modular":
        return [
          { name: "shared", path: `${javaPkgPath}/shared`, type: "folder" as const, children: [] },
          {
            name: "user",
            path: `${javaPkgPath}/user`,
            type: "folder" as const,
            children: [
              { name: "UserController.java", path: `${javaPkgPath}/user/UserController.java`, type: "file" as const },
              { name: "UserService.java", path: `${javaPkgPath}/user/UserService.java`, type: "file" as const },
            ],
          },
        ];
      case "layered":
      default:
        return [
          {
            name: "controller",
            path: `${javaPkgPath}/controller`,
            type: "folder" as const,
            children: [
              { name: "HealthController.java", path: `${javaPkgPath}/controller/HealthController.java`, type: "file" as const },
              ...(has("security")
                ? [{ name: "AuthController.java", path: `${javaPkgPath}/controller/AuthController.java`, type: "file" as const }]
                : []),
            ],
          },
          { name: "service/impl", path: `${javaPkgPath}/service/impl`, type: "folder" as const, children: [] },
          { name: "repository", path: `${javaPkgPath}/repository`, type: "folder" as const, children: [] },
          {
            name: "entity",
            path: `${javaPkgPath}/entity`,
            type: "folder" as const,
            children: [
              { name: "BaseEntity.java", path: `${javaPkgPath}/entity/BaseEntity.java`, type: "file" as const },
            ],
          },
          {
            name: "dto",
            path: `${javaPkgPath}/dto`,
            type: "folder" as const,
            children: [
              { name: "request", path: `${javaPkgPath}/dto/request`, type: "folder" as const, children: [] },
              { name: "response", path: `${javaPkgPath}/dto/response`, type: "folder" as const, children: [] },
            ],
          },
          {
            name: "exception",
            path: `${javaPkgPath}/exception`,
            type: "folder" as const,
            children: [
              { name: "GlobalExceptionHandler.java", path: `${javaPkgPath}/exception/GlobalExceptionHandler.java`, type: "file" as const },
              { name: "ResourceNotFoundException.java", path: `${javaPkgPath}/exception/ResourceNotFoundException.java`, type: "file" as const },
            ],
          },
          ...(has("security")
            ? [
              {
                name: "security",
                path: `${javaPkgPath}/security`,
                type: "folder" as const,
                children: [
                  { name: "SecurityConfig.java", path: `${javaPkgPath}/security/SecurityConfig.java`, type: "file" as const },
                  { name: "JwtService.java", path: `${javaPkgPath}/security/JwtService.java`, type: "file" as const },
                ],
              },
            ]
            : []),
        ];
    }
  };

  const javaMainName = `${state.projectName
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("")}Application.java`;

  return {
    name: state.artifactId || "inventory-service",
    path: state.artifactId || "inventory-service",
    type: "folder" as const,
    children: [
      ...(state.buildTool === "gradle"
        ? [
          { name: "build.gradle", path: "build.gradle", type: "file" as const },
          { name: "settings.gradle", path: "settings.gradle", type: "file" as const },
          { name: "gradlew", path: "gradlew", type: "file" as const },
        ]
        : [
          { name: "pom.xml", path: "pom.xml", type: "file" as const },
          { name: "mvnw", path: "mvnw", type: "file" as const },
        ]),
      { name: "README.md", path: "README.md", type: "file" as const },
      { name: ".gitignore", path: ".gitignore", type: "file" as const },
      {
        name: "src/main/java",
        path: javaPkgPath,
        type: "folder" as const,
        children: [
          { name: javaMainName, path: `${javaPkgPath}/${javaMainName}`, type: "file" as const },
          ...getArchPackages(),
        ],
      },
      {
        name: "src/main/resources",
        path: resPath,
        type: "folder" as const,
        children: [
          {
            name: state.configFormat === "properties" ? "application.properties" : "application.yml",
            path: `${resPath}/${state.configFormat === "properties" ? "application.properties" : "application.yml"}`,
            type: "file" as const,
          },
          {
            name: state.configFormat === "properties" ? "application-dev.properties" : "application-dev.yml",
            path: `${resPath}/${state.configFormat === "properties" ? "application-dev.properties" : "application-dev.yml"}`,
            type: "file" as const,
          },
          {
            name: state.configFormat === "properties" ? "application-prod.properties" : "application-prod.yml",
            path: `${resPath}/${state.configFormat === "properties" ? "application-prod.properties" : "application-prod.yml"}`,
            type: "file" as const,
          },
          ...(has("flyway")
            ? [
              {
                name: "db/migration",
                path: `${resPath}/db/migration`,
                type: "folder" as const,
                children: [{ name: "V1__init.sql", path: `${resPath}/db/migration/V1__init.sql`, type: "file" as const }],
              },
            ]
            : []),
        ],
      },
      ...(has("docker")
        ? [
          { name: "Dockerfile", path: "Dockerfile", type: "file" as const },
          { name: "docker-compose.yml", path: "docker-compose.yml", type: "file" as const },
        ]
        : []),
    ],
  };
}

// Syntax Highlighting Helper for XML and Gradle
function renderHighlightedLine(line: string, isGradle: boolean): React.ReactNode {
  if (!line) return "\n";

  // Comments
  if (line.trim().startsWith("<!--") || line.trim().startsWith("//")) {
    return <span className="text-slate-500 italic">{line}</span>;
  }

  if (isGradle) {
    const isKeywordLine = /^(plugins|dependencies|java|repositories|configurations|tasks|toolchain)/.test(line.trim());
    if (isKeywordLine) {
      return <span className="text-pink-400 font-bold">{line}</span>;
    }

    const parts = line.split(/('[^']*')/g);
    return (
      <span>
        {parts.map((part, i) => {
          if (part.startsWith("'") && part.endsWith("'")) {
            return <span key={i} className="text-emerald-300 font-mono">{part}</span>;
          }
          if (/\b(implementation|runtimeOnly|compileOnly|testImplementation|testRuntimeOnly|annotationProcessor|id|version|group|languageVersion)\b/.test(part)) {
            return (
              <span key={i}>
                {part.split(/\b(implementation|runtimeOnly|compileOnly|testImplementation|testRuntimeOnly|annotationProcessor|id|version|group|languageVersion)\b/g).map((sub, j) =>
                  /\b(implementation|runtimeOnly|compileOnly|testImplementation|testRuntimeOnly|annotationProcessor|id|version|group|languageVersion)\b/.test(sub) ? (
                    <span key={j} className="text-violet-400 font-semibold">{sub}</span>
                  ) : (
                    sub
                  )
                )}
              </span>
            );
          }
          return <span key={i} className="text-slate-200">{part}</span>;
        })}
      </span>
    );
  }

  // XML Syntax Highlighting
  const parts = line.split(/(<[^>]+>)/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith("<") && part.endsWith(">")) {
          if (part.startsWith("<?") || part.startsWith("</")) {
            const tagName = part.replace(/^<\/?\??/, "").replace(/\??>$/, "");
            return (
              <span key={i}>
                <span className="text-cyan-500 font-mono font-bold">&lt;{part.startsWith("</") ? "/" : "?"}</span>
                <span className="text-cyan-300 font-semibold">{tagName}</span>
                <span className="text-cyan-500 font-mono font-bold">{part.startsWith("<?") ? "?" : ""}&gt;</span>
              </span>
            );
          }

          const tagMatch = part.match(/^<([a-zA-Z0-9_\-]+)([\s\S]*)>$/);
          if (tagMatch) {
            const [, tagName, attrs] = tagMatch;
            return (
              <span key={i}>
                <span className="text-cyan-500 font-mono font-bold">&lt;</span>
                <span className="text-cyan-300 font-semibold">{tagName}</span>
                {attrs && (
                  <span>
                    {attrs.split(/(\s+[a-zA-Z0-9_\-:]+="[^"]*")/g).map((attrPart, k) => {
                      const attrMatch = attrPart.match(/^(\s+)([a-zA-Z0-9_\-:]+)=(".*")$/);
                      if (attrMatch) {
                        return (
                          <span key={k}>
                            {attrMatch[1]}
                            <span className="text-violet-300 font-semibold">{attrMatch[2]}</span>
                            <span className="text-slate-400">=</span>
                            <span className="text-emerald-300">{attrMatch[3]}</span>
                          </span>
                        );
                      }
                      return <span key={k} className="text-slate-300">{attrPart}</span>;
                    })}
                  </span>
                )}
                <span className="text-cyan-500 font-mono font-bold">&gt;</span>
              </span>
            );
          }
          return <span key={i} className="text-cyan-400 font-mono">{part}</span>;
        }
        return <span key={i} className="text-amber-200 font-medium">{part}</span>;
      })}
    </span>
  );
}

// IDE Code Preview Container Component
export function CodePreviewContainer({ code, lang }: { code: string; lang: "xml" | "gradle" | "yaml" | "properties" | "java" }) {
  const lines = useMemo(() => code.split("\n"), [code]);
  const isGradle = lang === "gradle";

  function renderLine(line: string): React.ReactNode {
    if (!line) return "\n";
    // YAML / .properties
    if (lang === "yaml") {
      if (line.trim().startsWith("#")) return <span className="text-slate-500 italic">{line}</span>;
      const colonIdx = line.indexOf(":");
      if (colonIdx > -1) {
        const key = line.slice(0, colonIdx + 1);
        const val = line.slice(colonIdx + 1);
        return <span><span className="text-cyan-300 font-semibold">{key}</span><span className="text-amber-200">{val}</span></span>;
      }
      return <span className="text-slate-200">{line}</span>;
    }
    if (lang === "properties") {
      if (line.trim().startsWith("#")) return <span className="text-slate-500 italic">{line}</span>;
      const eqIdx = line.indexOf("=");
      if (eqIdx > -1) {
        const key = line.slice(0, eqIdx);
        const val = line.slice(eqIdx);
        return <span><span className="text-violet-300 font-semibold">{key}</span><span className="text-amber-200">{val}</span></span>;
      }
      return <span className="text-slate-200">{line}</span>;
    }
    if (lang === "java") {
      if (line.trim().startsWith("//") || line.trim().startsWith("/*") || line.trim().startsWith("*")) {
        return <span className="text-slate-500 italic">{line}</span>;
      }
      if (line.trim().startsWith("@")) {
        return <span className="text-amber-400 font-bold">{line}</span>;
      }
      return <span className="text-slate-200">{line}</span>;
    }
    return renderHighlightedLine(line, isGradle);
  }

  return (
    <div className="flex-1 h-0 overflow-auto bg-[#080d1a] text-slate-100 font-mono text-[11px] leading-relaxed relative flex select-text">
      {/* Line Numbers Gutter */}
      <div className="py-3 px-2 bg-[#0e1526] border-r border-slate-800/80 select-none text-right shrink-0 text-slate-500 font-mono text-[10px] min-w-[36px]">
        {lines.map((_, i) => (
          <div key={i} className="h-5 flex items-center justify-end pr-1">
            {i + 1}
          </div>
        ))}
      </div>

      {/* Code Area with Horizontal Scroll */}
      <div className="p-3 flex-1 overflow-x-auto whitespace-pre font-mono text-[11px] leading-relaxed">
        {lines.map((line, i) => (
          <div key={i} className="h-5 flex items-center hover:bg-blue-500/10 px-1 rounded transition-colors">
            {renderLine(line)}
          </div>
        ))}
      </div>
    </div>
  );
}

export function FolderPreview({ state, onCustomActionsChange }: FolderPreviewProps) {
  const [customActions, setCustomActions] = useState<CustomTreeAction[]>([]);
  const [addingToPath, setAddingToPath] = useState<string | null>(null);
  const [addType, setAddType] = useState<"file" | "folder">("file");
  const [addName, setAddName] = useState("");
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [previewMode, setPreviewMode] = useState<"tree" | "code">("tree");
  const [copied, setCopied] = useState(false);

  const updateActions = (newActions: CustomTreeAction[]) => {
    setCustomActions(newActions);
    onCustomActionsChange?.(newActions);
  };

  const handleAdd = (parentPath: string) => {
    if (!addName.trim()) return;
    const cleanName = addName.trim();
    const newPath = `${parentPath}/${cleanName}`;
    const action: CustomTreeAction = {
      type: "add",
      path: newPath,
      targetName: cleanName,
      nodeType: addType,
    };
    updateActions([...customActions, action]);
    setAddName("");
    setAddingToPath(null);
  };

  const handleDelete = (targetPath: string) => {
    const action: CustomTreeAction = {
      type: "delete",
      path: targetPath,
    };
    updateActions([...customActions, action]);
  };

  const handleRename = (targetPath: string) => {
    if (!renameValue.trim()) return;
    const cleanName = renameValue.trim();
    const action: CustomTreeAction = {
      type: "rename",
      path: targetPath,
      targetName: cleanName,
    };
    updateActions([...customActions, action]);
    setRenameValue("");
    setRenamingPath(null);
  };

  const handleReset = () => {
    updateActions([]);
    setAddingToPath(null);
    setRenamingPath(null);
  };

  // Generate live code for pom.xml or build.gradle
  const isGradle = state.buildTool === "gradle";
  const buildFileName = isGradle ? "build.gradle" : "pom.xml";

  const generatedBuildCode = useMemo(() => {
    if (isGradle) {
      return generateBuildGradle(state);
    }
    return generatePomXml(state);
  }, [state, isGradle]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedBuildCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const mimeType = isGradle ? "text/plain" : "application/xml";
    const blob = new Blob([generatedBuildCode], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = buildFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Construct tree applying customActions
  const tree = useMemo(() => {
    const base = buildBaseTree(state);

    const deletedPaths = new Set(
      customActions.filter((a) => a.type === "delete").map((a) => a.path)
    );

    const renameMap = new Map<string, string>();
    customActions.forEach((a) => {
      if (a.type === "rename" && a.targetName) {
        renameMap.set(a.path, a.targetName);
      }
    });

    function processNode(node: FolderNode): FolderNode | null {
      if (deletedPaths.has(node.path)) return null;

      let name = node.name;
      if (renameMap.has(node.path)) {
        name = renameMap.get(node.path)!;
      }

      let children: FolderNode[] | undefined = undefined;
      if (node.children) {
        children = node.children
          .map(processNode)
          .filter((n): n is FolderNode => n !== null);
      }

      return {
        ...node,
        name,
        children,
      };
    }

    let processedTree = processNode(base) || base;

    const addedActions = customActions.filter((a) => a.type === "add");
    addedActions.forEach((action) => {
      const parentDir = action.path.substring(0, action.path.lastIndexOf("/"));
      const newNode: FolderNode = {
        name: action.targetName || "CustomNode",
        path: action.path,
        type: action.nodeType || "file",
        custom: true,
        children: action.nodeType === "folder" ? [] : undefined,
      };

      function injectNode(root: FolderNode): boolean {
        if (root.path === parentDir) {
          if (!root.children) root.children = [];
          root.children.push(newNode);
          return true;
        }
        if (root.children) {
          for (const child of root.children) {
            if (injectNode(child)) return true;
          }
        }
        return false;
      }

      injectNode(processedTree);
    });

    return processedTree;
  }, [state, customActions]);

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Header with View Mode Tabs & Customization Reset */}
      <div className="flex items-center justify-between">
        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-black/40 p-1 rounded-xl border border-slate-300 dark:border-white/10">
          <button
            onClick={() => setPreviewMode("tree")}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all",
              previewMode === "tree"
                ? "bg-white dark:bg-blue-600 text-blue-700 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <Folder className="w-3.5 h-3.5 text-amber-500" />
            Folder View
          </button>
          <button
            onClick={() => setPreviewMode("code")}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all",
              previewMode === "code"
                ? "bg-white dark:bg-blue-600 text-blue-700 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <FileCode className="w-3.5 h-3.5 text-blue-500" />
            {buildFileName}
          </button>
        </div>

        {previewMode === "tree" && customActions.length > 0 && (
          <button
            onClick={handleReset}
            title="Reset tree customizations"
            className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors font-medium"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Tree
          </button>
        )}

        {previewMode === "code" && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleDownloadFile}
              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer"
              title={`Download ${buildFileName}`}
              aria-label={`Download ${buildFileName}`}
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleCopyCode}
              className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-500/30 transition-all cursor-pointer"
              title={copied ? "Copied!" : "Copy code"}
              aria-label="Copy code"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Main Glass Panel Card */}
      <div className="glass-panel rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex-1 flex flex-col shadow-xl">
        {/* Top Window Bar */}
        <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-200 dark:border-white/10 bg-slate-100/90 dark:bg-black/40">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          </div>
          <span className="text-[10px] font-mono font-semibold text-slate-600 dark:text-muted-foreground truncate flex items-center gap-1.5">
            {previewMode === "tree" ? (
              <>{state.artifactId || "inventory-service"}.zip</>
            ) : (
              <span className="text-blue-600 dark:text-cyan-300 font-bold">{buildFileName}</span>
            )}
          </span>
        </div>

        {/* View Mode Content */}
        {previewMode === "tree" ? (
          <div className="p-3.5 flex-1 h-0 overflow-y-auto">
            <TreeNodeRenderer
              node={tree}
              depth={0}
              addingToPath={addingToPath}
              setAddingToPath={setAddingToPath}
              addType={addType}
              setAddType={setAddType}
              addName={addName}
              setAddName={setAddName}
              handleAdd={handleAdd}
              renamingPath={renamingPath}
              setRenamingPath={setRenamingPath}
              renameValue={renameValue}
              setRenameValue={setRenameValue}
              handleRename={handleRename}
              handleDelete={handleDelete}
            />
          </div>
        ) : (
          <CodePreviewContainer
            code={generatedBuildCode}
            lang={isGradle ? "gradle" : "xml"}
          />
        )}

        {/* Footer Hint */}
        <div className="p-2.5 border-t border-slate-200 dark:border-white/5 bg-slate-100/80 dark:bg-black/20 text-[10px] text-slate-500 dark:text-muted-foreground text-center font-medium">
          {previewMode === "tree"
            ? "Hover any item to add, rename, or remove nodes"
            : `Live preview of ${buildFileName} · updates as you change settings`}
        </div>
      </div>
    </div>
  );
}

// Tree Node Renderer Component with hover action buttons
function TreeNodeRenderer({
  node,
  depth = 0,
  addingToPath,
  setAddingToPath,
  addType,
  setAddType,
  addName,
  setAddName,
  handleAdd,
  renamingPath,
  setRenamingPath,
  renameValue,
  setRenameValue,
  handleRename,
  handleDelete,
}: {
  node: FolderNode;
  depth?: number;
  addingToPath: string | null;
  setAddingToPath: (p: string | null) => void;
  addType: "file" | "folder";
  setAddType: (t: "file" | "folder") => void;
  addName: string;
  setAddName: (n: string) => void;
  handleAdd: (p: string) => void;
  renamingPath: string | null;
  setRenamingPath: (p: string | null) => void;
  renameValue: string;
  setRenameValue: (v: string) => void;
  handleRename: (p: string) => void;
  handleDelete: (p: string) => void;
}) {
  const isKeyFile =
    node.name.endsWith(".java") ||
    node.name.endsWith(".yml") ||
    node.name.endsWith(".properties") ||
    node.name === "pom.xml" ||
    node.name === "build.gradle" ||
    node.name === "settings.gradle" ||
    node.name === "docker-compose.yml" ||
    node.name.endsWith(".sql");

  const isRenaming = renamingPath === node.path;
  const isAdding = addingToPath === node.path;

  return (
    <div style={{ paddingLeft: depth > 0 ? `${depth * 10}px` : 0 }}>
      {/* Current Node Row */}
      <div className="group flex items-center justify-between py-1 px-1.5 rounded hover:bg-slate-200/60 dark:hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-1.5 text-[11px] font-mono truncate min-w-0">
          {node.type === "folder" ? (
            <Folder className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          ) : (
            <FileText className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
          )}

          {isRenaming ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRename(node.path)}
                className="bg-white dark:bg-black/60 border border-blue-500 rounded px-1 py-0.5 text-[11px] font-mono text-slate-900 dark:text-white outline-none"
              />
              <button
                onClick={() => handleRename(node.path)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-white"
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                onClick={() => setRenamingPath(null)}
                className="text-red-500 hover:text-red-700 dark:hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <span
              className={cn(
                "truncate",
                node.type === "folder" && "text-amber-800 dark:text-amber-300 font-bold",
                isKeyFile && node.type === "file" && "text-blue-700 dark:text-cyan-300 font-semibold",
                !isKeyFile && node.type === "file" && "text-slate-600 dark:text-slate-400"
              )}
            >
              {node.name}
            </span>
          )}

          {node.custom && (
            <span className="text-[9px] font-mono px-1 rounded bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/40 font-medium">
              Custom
            </span>
          )}
        </div>

        {/* Hover Action Buttons */}
        {!isRenaming && (
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0 transition-opacity">
            {node.type === "folder" && (
              <>
                <button
                  title="Add File"
                  onClick={() => {
                    setAddingToPath(node.path);
                    setAddType("file");
                    setAddName("");
                  }}
                  className="p-1 rounded hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  <FilePlus className="w-3 h-3" />
                </button>
                <button
                  title="Add Subfolder"
                  onClick={() => {
                    setAddingToPath(node.path);
                    setAddType("folder");
                    setAddName("");
                  }}
                  className="p-1 rounded hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                >
                  <FolderPlus className="w-3 h-3" />
                </button>
              </>
            )}

            <button
              title="Rename"
              onClick={() => {
                setRenamingPath(node.path);
                setRenameValue(node.name);
              }}
              className="p-1 rounded hover:bg-slate-300/50 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <Edit2 className="w-3 h-3" />
            </button>

            {depth > 0 && (
              <button
                title="Delete"
                onClick={() => handleDelete(node.path)}
                className="p-1 rounded hover:bg-red-500/20 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Inline Add Node Form */}
      {isAdding && (
        <div className="ml-4 my-1 flex items-center gap-1.5 p-1 rounded bg-slate-200/80 dark:bg-black/60 border border-blue-500/50">
          <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400">
            +{addType}:
          </span>
          <input
            type="text"
            autoFocus
            placeholder={addType === "file" ? "NewClass.java" : "packageName"}
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd(node.path)}
            className="flex-1 bg-white dark:bg-black/40 border border-slate-300 dark:border-white/20 rounded px-1.5 py-0.5 text-[11px] font-mono text-slate-900 dark:text-white outline-none"
          />
          <button
            onClick={() => handleAdd(node.path)}
            className="p-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setAddingToPath(null)}
            className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Render Sub-children recursively */}
      {node.children && node.children.length > 0 && (
        <div>
          {node.children.map((childNode) => (
            <TreeNodeRenderer
              key={childNode.path}
              node={childNode}
              depth={depth + 1}
              addingToPath={addingToPath}
              setAddingToPath={setAddingToPath}
              addType={addType}
              setAddType={setAddType}
              addName={addName}
              setAddName={setAddName}
              handleAdd={handleAdd}
              renamingPath={renamingPath}
              setRenamingPath={setRenamingPath}
              renameValue={renameValue}
              setRenameValue={setRenameValue}
              handleRename={handleRename}
              handleDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
