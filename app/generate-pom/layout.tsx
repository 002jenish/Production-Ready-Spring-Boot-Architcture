import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Online pom.xml & build.gradle Generator for Spring Boot",
  description:
    "Generate production-ready pom.xml or build.gradle files online instantly. Pick dependencies from 200+ official Spring Boot starters with genuine Maven Central coordinates — copy or download directly without full project setup.",
  keywords: [
    "pom.xml generator",
    "build.gradle generator",
    "Online Maven pom.xml generator",
    "Spring Boot dependency builder",
    "Spring Initializr pom.xml only",
    "Maven starter builder",
  ],
  alternates: {
    canonical: "/generate-pom",
  },
  openGraph: {
    title: "Online pom.xml & build.gradle Generator — ArchForge",
    description:
      "Quickly generate clean pom.xml or build.gradle files with genuine Maven Central coordinates.",
    url: "https://archforge.dev/generate-pom",
  },
};

export default function PomGeneratorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
