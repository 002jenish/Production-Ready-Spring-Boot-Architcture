import { NextResponse } from "next/server";
import { fetchSpringMetadata } from "@/lib/springInitializr";

export async function GET() {
  try {
    const data = await fetchSpringMetadata();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in spring-versions route:", error);
    return NextResponse.json(
      { error: "Failed to load Spring versions" },
      { status: 500 }
    );
  }
}
