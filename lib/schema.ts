import { z } from "zod";

export const projectInfoSchema = z.object({
  projectName: z
    .string()
    .min(2, "Project name must be at least 2 characters")
    .max(64, "Project name must be at most 64 characters")
    .regex(
      /^[a-zA-Z][a-zA-Z0-9\-_]*$/,
      "Must start with a letter; only letters, digits, hyphens, underscores"
    ),
  groupId: z
    .string()
    .min(1, "Group ID is required")
    .regex(
      /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)*$/,
      "Must be a valid Java package name (e.g. com.example)"
    ),
  artifactId: z
    .string()
    .min(1, "Artifact ID is required")
    .regex(/^[a-z][a-z0-9\-]*$/, "Must be lowercase letters, digits or hyphens"),
  javaVersion: z.string().refine((v) => ["17", "21"].includes(v), {
    message: "Select a Java version",
  }),
  springBootVersion: z.string().min(1, "Select a Spring Boot version"),
});

export const architectureSchema = z.object({
  architecture: z
    .string()
    .refine((v) => ["layered", "hexagonal", "clean", "modular"].includes(v), {
      message: "Select an architecture",
    }),
});

export const dependenciesSchema = z.object({
  dependencies: z.array(z.string()),
});

export const fullSchema = projectInfoSchema
  .merge(architectureSchema)
  .merge(dependenciesSchema);

export type ProjectInfoFormData = z.infer<typeof projectInfoSchema>;
export type ArchitectureFormData = z.infer<typeof architectureSchema>;
export type DependenciesFormData = z.infer<typeof dependenciesSchema>;
export type FullFormData = z.infer<typeof fullSchema>;
