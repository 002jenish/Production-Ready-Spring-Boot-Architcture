import { NextRequest, NextResponse } from "next/server";
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
    const body = await request.json().catch(() => ({}));
    const req: GenerateRequest = {
      projectName: body.projectName || body.artifactId || "demo",
      groupId: body.groupId || "com.example",
      artifactId: body.artifactId || "demo",
      buildTool: body.buildTool || "maven",
      javaVersion: body.javaVersion || "21",
      springBootVersion: body.springBootVersion || body.bootVersion || "3.5.3",
      architecture: body.architecture || "layered",
      dependencies: Array.isArray(body.dependencies) ? body.dependencies : ["web", "lombok"],
    };

    if (req.buildTool === "gradle") {
      const content = generateBuildGradle(req);
      return new NextResponse(content, {
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
  } catch (error) {
    console.error("POM generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate pom.xml. Please check your request parameters." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const req = parseQueryToRequest(searchParams);

    if (req.buildTool === "gradle") {
      const content = generateBuildGradle(req);
      return new NextResponse(content, {
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
  } catch (error) {
    console.error("GET pom.xml generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate pom.xml via GET request." },
      { status: 500 }
    );
  }
}
