import { NextResponse } from "next/server";
import { fetchSpringMetadata } from "@/lib/springInitializr";

export async function GET() {
  try {
    const data = await fetchSpringMetadata();
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    console.error("Failed to serve Spring metadata:", error);
    return NextResponse.json(
      { error: "Failed to fetch metadata from Spring Initializr" },
      { status: 500 }
    );
  }
}
