import { NextRequest, NextResponse } from "next/server";
import { generateZip } from "@/lib/templates/zip-generator";
import { GenerateRequest } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Basic server-side validation
    const req = body as GenerateRequest;

    if (!req.projectName || !req.groupId || !req.artifactId) {
      return NextResponse.json(
        { error: "Missing required fields: projectName, groupId, artifactId" },
        { status: 400 }
      );
    }

    if (!["17", "21"].includes(req.javaVersion)) {
      return NextResponse.json(
        { error: "Java version must be 17 or 21" },
        { status: 400 }
      );
    }

    if (!["layered", "hexagonal", "clean", "modular"].includes(req.architecture)) {
      return NextResponse.json(
        { error: "Invalid architecture" },
        { status: 400 }
      );
    }

    // Generate the ZIP
    const zipBuffer = await generateZip(req);

    const filename = `${req.artifactId}.zip`;

    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(zipBuffer.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("ZIP generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate project. Please try again." },
      { status: 500 }
    );
  }
}
