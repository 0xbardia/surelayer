import { NextResponse } from "next/server";

import { protocolReadState } from "@/lib/protocol";

export async function GET() {
  const state = await protocolReadState();
  const healthy = state.readable && !state.error;
  const configurationError = state.error?.code === "CONFIGURATION_INVALID";
  return NextResponse.json(
    {
      application: healthy ? "ok" : state.error ? "degraded" : "not_configured",
      rpc: configurationError ? "invalid" : state.configured ? (state.readable ? "ok" : "unreachable") : "not_configured",
      contract: configurationError ? "invalid" : state.configured ? (state.readable ? "readable" : "unreadable") : "not_configured",
      network: state.network,
      chainId: state.chainId,
      contractAddress: state.contractAddress,
      checkedAt: new Date().toISOString(),
      error: state.error,
    },
    { status: state.error ? 503 : 200, headers: { "Cache-Control": "no-store" } },
  );
}
