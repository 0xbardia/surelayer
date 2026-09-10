import { NextResponse } from "next/server";

import { appConfig, configured } from "@/lib/config";
import { logServerError, publicError, publicStatus } from "@/lib/errors";
import { claimDetail } from "@/lib/protocol";
import { jsonSafe } from "@/lib/json";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const config = appConfig();
  if (!configured(config)) return NextResponse.json({ configured: false, readable: false, claim: null });
  try {
    const claim = await claimDetail(id);
    return NextResponse.json(jsonSafe({ configured: true, readable: true, claim: { ...claim, protocolTest: config.protocolTestClaimIds.includes(claim.id) } }), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    logServerError(`claim:${id}`, error);
    return NextResponse.json({ configured: true, readable: false, claim: null, error: publicError(error) }, { status: publicStatus(error, 503), headers: { "Cache-Control": "no-store" } });
  }
}
