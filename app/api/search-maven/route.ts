import { NextRequest, NextResponse } from "next/server";

export interface MavenSearchResult {
  id: string;
  groupId: string;
  artifactId: string;
  version: string;
  label: string;
  description: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const mavenUrl = `https://search.maven.org/solrsearch/select?q=${encodeURIComponent(q)}&rows=10&wt=json`;
    const res = await fetch(mavenUrl, {
      headers: {
        "User-Agent": "ArchForge-Generator/1.0",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ results: [] });
    }

    const data = await res.json();
    const docs = data?.response?.docs || [];

    const results: MavenSearchResult[] = docs.map((doc: any) => {
      const g = doc.g || "";
      const a = doc.a || "";
      const v = doc.latestVersion || doc.v || "";
      const fullId = v ? `${g}:${a}:${v}` : `${g}:${a}`;

      return {
        id: fullId,
        groupId: g,
        artifactId: a,
        version: v,
        label: `${a}`,
        description: `${g}:${a}${v ? `:${v}` : ""}`,
      };
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Maven Central Search error:", error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
