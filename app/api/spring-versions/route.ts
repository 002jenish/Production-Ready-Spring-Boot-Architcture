import { NextResponse } from "next/server";

const FALLBACK_VERSIONS = [
  { version: "3.5.3", label: "3.5.3 (Latest Stable)", isDefault: true },
  { version: "3.4.3", label: "3.4.3 (GA)", isDefault: false },
  { version: "3.3.9", label: "3.3.9 (GA)", isDefault: false },
  { version: "3.2.12", label: "3.2.12 (LTS)", isDefault: false },
];

export async function GET() {
  try {
    const res = await fetch("https://start.spring.io/metadata/client", {
      headers: {
        Accept: "application/json",
        "User-Agent": "ArchForge-Generator/1.0",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!res.ok) {
      return NextResponse.json({ versions: FALLBACK_VERSIONS, source: "fallback" });
    }

    const data = await res.json();
    const bootVersions = data?.bootVersion?.values;

    if (Array.isArray(bootVersions) && bootVersions.length > 0) {
      const parsedVersions = bootVersions.map((v: { id: string; name: string; default?: boolean }) => ({
        version: v.id,
        label: v.name,
        isDefault: !!v.default,
      }));

      return NextResponse.json({
        versions: parsedVersions,
        source: "spring-initializr-api",
      });
    }

    return NextResponse.json({ versions: FALLBACK_VERSIONS, source: "fallback" });
  } catch (error) {
    console.warn("Failed to fetch Spring versions from start.spring.io, using fallbacks", error);
    return NextResponse.json({ versions: FALLBACK_VERSIONS, source: "fallback" });
  }
}
