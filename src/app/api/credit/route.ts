import { NextResponse } from "next/server";

import { appConfig, configured } from "@/lib/config";
import { logServerError, publicError, publicStatus } from "@/lib/errors";
import { jsonSafe } from "@/lib/json";
import { readMethod } from "@/lib/genlayer";

export async function GET(request: Request) {
  const config = appConfig();
  const address = new URL(request.url).searchParams.get("address") ?? "";
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) return NextResponse.json({ configured: configured(config), readable: false, credit: "0", error: { code: "INVALID_INPUT", message: "A wallet address is required." } }, { status: 400 });
  if (!configured(config)) return NextResponse.json({ configured: false, readable: false, credit: "0" });
  try {
    return NextResponse.json(jsonSafe({ configured: true, readable: true, credit: await readMethod("get_credit", [address]) }), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    logServerError("credit", error);
    return NextResponse.json({ configured: true, readable: false, credit: "0", error: publicError(error) }, { status: publicStatus(error, 503), headers: { "Cache-Control": "no-store" } });
  }
}
