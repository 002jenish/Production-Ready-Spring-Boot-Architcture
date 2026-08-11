import { NextRequest } from "next/server";
import { GET as generateGET } from "../generate/route";

export async function GET(request: NextRequest) {
  return generateGET(request);
}
