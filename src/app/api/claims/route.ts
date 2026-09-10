import { NextResponse } from "next/server";

import { appConfig, configured } from "@/lib/config";
import { logServerError, publicError, publicStatus } from "@/lib/errors";
import { claimPage } from "@/lib/protocol";
import { jsonSafe } from "@/lib/json";

function boundedNumber(value: string | null, fallback: number, max: number) {
  if (value === null || !/^\d+$/.test(value)) return fallback;
  return Math.min(Number(value), max);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const offset = boundedNumber(url.searchParams.get("offset"), 0, 10000);
  const limit = boundedNumber(url.searchParams.get("limit"), 12, 25);
  const config = appConfig();
  if (!configured(config)) {
    return NextResponse.json({ configured: false, readable: false, claims: [], offset, limit });
  }
  try {
    const claims = await claimPage(offset, limit);
    return NextResponse.json(jsonSafe({ configured: true, readable: true, claims: claims.map((claim) => ({ ...claim, protocolTest: config.protocolTestClaimIds.includes(claim.id) })), offset, limit }), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    logServerError("claims", error);
    return NextResponse.json({ configured: true, readable: false, claims: [], offset, limit, error: publicError(error) }, { status: publicStatus(error, 503), headers: { "Cache-Control": "no-store" } });
  }
}
