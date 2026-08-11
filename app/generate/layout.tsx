import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Full Project Scaffolder — Spring Boot Architecture Builder",
  description:
    "Visually design your Spring Boot project structure. Pick from Layered, Hexagonal, Clean, or Modular Monolith patterns, select 200+ live Spring starters, and download a compilable Java 21 ZIP instantly.",
  keywords: [
    "Spring Boot Scaffolder",
    "Spring Boot Project Generator",
    "Hexagonal Architecture Spring Boot",
    "Clean Architecture Spring Boot Starter",
    "Modular Monolith Java",
    "Spring Initializr Alternative",
  ],
  alternates: {
    canonical: "/generate",
  },
  openGraph: {
    title: "Full Project Scaffolder — ArchForge",
    description:
      "Generate compilable Java 21 Spring Boot project ZIPs with visual architecture diagrams and 200+ verified starters.",
    url: "https://archforge.dev/generate",
  },
};

export default function GenerateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
