import { NextResponse } from "next/server";

import { appConfig, publicRuntimeConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = appConfig();
  return NextResponse.json(publicRuntimeConfig(config), {
    status: config.configurationError ? 503 : 200,
    headers: { "Cache-Control": "no-store" },
  });
}
