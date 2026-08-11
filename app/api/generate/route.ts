import { NextRequest, NextResponse } from "next/server";
import { generateHybridProjectZip } from "@/lib/springInitializr";
import { generatePomXml } from "@/lib/templates/pom-generator";
import { generateBuildGradle } from "@/lib/templates/gradle-generator";
import { GenerateRequest } from "@/lib/types";

function parseQueryToRequest(searchParams: URLSearchParams): GenerateRequest {
  const typeParam = searchParams.get("type") || searchParams.get("buildTool") || "maven";
  const buildTool: "maven" | "gradle" = typeParam.includes("gradle") ? "gradle" : "maven";

  const artifactId = searchParams.get("artifactId") || searchParams.get("baseDir") || "demo";
  const groupId = searchParams.get("groupId") || "com.example";
  const projectName = searchParams.get("projectName") || searchParams.get("baseDir") || searchParams.get("name") || artifactId;
  const javaVersion = searchParams.get("javaVersion") || "21";
  const springBootVersion = searchParams.get("bootVersion") || searchParams.get("springBootVersion") || "3.5.3";

  const rawArch = searchParams.get("architecture") || "layered";
  const validArchs = ["layered", "hexagonal", "clean", "modular"];
  const architecture = (validArchs.includes(rawArch) ? rawArch : "layered") as any;

  const rawDeps = searchParams.get("dependencies");
  const dependencies = rawDeps
    ? rawDeps.split(",").map((s) => s.trim()).filter(Boolean)
    : ["web", "lombok"];

  return {
    projectName,
    groupId,
    artifactId,
    buildTool,
    javaVersion,
    springBootVersion,
    architecture,
    dependencies,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const req = body as GenerateRequest & { pomOnly?: boolean; format?: string };

    if (!req.projectName || !req.groupId || !req.artifactId) {
      return NextResponse.json(
        { error: "Missing required fields: projectName, groupId, artifactId" },
        { status: 400 }
      );
    }

    if (!req.javaVersion) {
      return NextResponse.json(
        { error: "Java version is required" },
        { status: 400 }
      );
    }

    if (!["layered", "hexagonal", "clean", "modular"].includes(req.architecture)) {
      return NextResponse.json(
        { error: "Invalid architecture" },
        { status: 400 }
      );
    }

    // Handle pom.xml standalone generation mode if requested
    if (req.pomOnly || req.format === "pom") {
      if (req.buildTool === "gradle") {
        const gradleContent = generateBuildGradle(req);
        return new NextResponse(gradleContent, {
          status: 200,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Content-Disposition": 'attachment; filename="build.gradle"',
            "Cache-Control": "no-store",
          },
        });
      }
      const pomContent = generatePomXml(req);
      return new NextResponse(pomContent, {
        status: 200,
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          "Content-Disposition": 'attachment; filename="pom.xml"',
          "Cache-Control": "no-store",
        },
      });
    }

    // Scaffolding Project ZIP (via Spring Initializr API + ArchForge Injection + Fallback)
    const zipBuffer = await generateHybridProjectZip(req);
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
    console.error("Project generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate project. Please check parameters and try again." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const req = parseQueryToRequest(searchParams);

    const isPomOnly = searchParams.get("format") === "pom" || searchParams.get("pomOnly") === "true";
    if (isPomOnly) {
      if (req.buildTool === "gradle") {
        const gradleContent = generateBuildGradle(req);
        return new NextResponse(gradleContent, {
          status: 200,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Content-Disposition": 'attachment; filename="build.gradle"',
            "Cache-Control": "no-store",
          },
        });
      }
      const pomContent = generatePomXml(req);
      return new NextResponse(pomContent, {
        status: 200,
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          "Content-Disposition": 'attachment; filename="pom.xml"',
          "Cache-Control": "no-store",
        },
      });
    }

    const zipBuffer = await generateHybridProjectZip(req);
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
    console.error("GET Project generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate project via GET request." },
      { status: 500 }
    );
  }
}
