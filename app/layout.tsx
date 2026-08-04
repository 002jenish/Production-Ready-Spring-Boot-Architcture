import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ArchForge — Spring Boot Architecture Generator",
  description:
    "Generate production-ready Spring Boot projects with visual architecture selection. Choose your dependencies, architecture pattern, and download a compilable ZIP instantly.",
  keywords: [
    "Spring Boot",
    "Java",
    "Architecture Generator",
    "Project Scaffolding",
    "Spring Initializr",
  ],
  authors: [{ name: "ArchForge" }],
  openGraph: {
    title: "ArchForge — Spring Boot Architecture Generator",
    description:
      "Generate production-ready Spring Boot projects with a beautiful visual wizard.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
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
