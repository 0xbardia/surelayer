"use client";

import { useEffect, useState } from "react";

import { formatGen, parseProtocolState, type ProtocolReadState } from "@/lib/protocol";

export function ProtocolStatus() {
  const [state, setState] = useState<ProtocolReadState | null>(null);
  useEffect(() => { fetch("/api/status", { cache: "no-store" }).then((response) => response.json()).then((body) => setState(parseProtocolState(body))).catch(() => setState({ configured: false, readable: false, network: "unknown", chainId: null, contractAddress: null })); }, []);
  if (!state) return <span className="status">Checking protocol</span>;
  if (!state.configured) return <span className="status inconclusive">Deployment not configured</span>;
  if (!state.readable) return <span className="status breached">RPC unavailable</span>;
  return <span className="status supported">Live · {state.stats ? `${formatGen(state.stats.totalLocked)} GEN locked` : "readable"}</span>;
}
