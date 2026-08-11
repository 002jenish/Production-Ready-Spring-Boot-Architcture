import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://archforge.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ArchForge — Spring Boot Architecture Generator & pom.xml Builder",
    template: "%s | ArchForge Spring Boot Generator",
  },
  description:
    "Production-ready Spring Boot project generator and pom.xml / build.gradle builder. Visually select Layered, Hexagonal, Clean, or Modular architecture, pick 200+ live Spring starters, choose YAML or Properties, and download a compilable Java 21 project instantly.",
  keywords: [
    // Core Spring Boot terms
    "Spring Initializr",
    "Spring Boot Generator",
    "Spring Boot Initializr",
    "Spring Boot Starter",
    "Spring Boot Project Generator",
    "Spring Boot 3.5",
    "Java 21 Spring Boot",
    
    // Architecture terms
    "Spring Boot Architecture Generator",
    "Hexagonal Architecture Spring Boot",
    "Clean Architecture Spring Boot",
    "Modular Monolith Spring Boot",
    "Layered Architecture Spring Boot",
    "Domain Driven Design Spring Boot",
    "DDD Java Spring",

    // Build Tool & Maven terms
    "pom.xml generator",
    "build.gradle generator",
    "Online pom.xml generator",
    "Maven dependency generator",
    "Gradle build file builder",
    "Spring Boot pom.xml online",
    
    // Feature & Tech terms
    "Spring Security JWT starter",
    "Spring Boot Flyway Docker",
    "Spring Boot Microservices scaffolding",
    "JHipster alternative",
    "Java backend project generator",
    "Production ready Spring Boot",
    "Spring Boot REST API starter",
  ],
  authors: [{ name: "ArchForge Team", url: siteUrl }],
  creator: "ArchForge",
  publisher: "ArchForge",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "ArchForge",
    title: "ArchForge — Spring Boot Architecture Generator & pom.xml Builder",
    description:
      "Visually select your architecture pattern (Layered, Hexagonal, Clean, Modular), pick 200+ verified Spring starters, and download a compilable Java 21 starter project instantly.",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "ArchForge Spring Boot Architecture Generator Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ArchForge — Spring Boot Architecture Generator & pom.xml Builder",
    description:
      "Generate production-ready Spring Boot projects with visual architecture selection & 200+ verified starters.",
    images: [`${siteUrl}/og-image.png`],
    creator: "@archforge_dev",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLdSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#software`,
      name: "ArchForge",
      url: siteUrl,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "All",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description:
        "Production-ready Spring Boot project generator supporting Layered, Hexagonal, Clean, and Modular Monolith architectures with 200+ live verified Spring Initializr starters.",
      featureList: [
        "Visual Architecture Pattern Selector (Hexagonal, Clean, Layered, Modular)",
        "200+ Whitelisted Spring Initializr Dependencies",
        "Standalone pom.xml & build.gradle Generator",
        "YAML and Properties Config Format Support",
        "Stateless JWT Security & Flyway DB Migrations",
        "Multi-stage Dockerfiles & GitHub Actions CI",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "ArchForge",
      description: "Spring Boot Architecture Generator & pom.xml Builder",
      publisher: {
        "@type": "Organization",
        name: "ArchForge",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
