import { NextResponse } from "next/server";

import { protocolReadState } from "@/lib/protocol";
import { jsonSafe } from "@/lib/json";

export async function GET() {
  return NextResponse.json(jsonSafe(await protocolReadState()), { headers: { "Cache-Control": "no-store" } });
}
