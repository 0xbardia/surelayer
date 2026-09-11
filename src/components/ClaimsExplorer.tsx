"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { StateNotice } from "@/components/StateNotice";
import { formatDate, formatGen, parseClaimSummary, type ClaimSummary } from "@/lib/protocol";

type ClaimsResponse = { configured: boolean; readable: boolean; claims: unknown[]; offset: number; limit: number; error?: { message?: string } };

export function ClaimsExplorer() {
  const [claims, setClaims] = useState<ClaimSummary[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const limit = 12;

  const load = useCallback(async (nextOffset: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/claims?offset=${nextOffset}&limit=${limit}`, { cache: "no-store" });
      const body = await response.json() as ClaimsResponse;
      if (!response.ok || !body.readable) throw new Error(body.error?.message ?? "The final claim list is not readable yet.");
      const next = (body.claims ?? []).map(parseClaimSummary);
      setClaims(next);
      setOffset(nextOffset);
      setHasNext(next.length === limit);
    } catch (cause) {
      setClaims([]);
      setError(cause instanceof Error ? cause.message : "Claims could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(0); }, [load]);

  return (
    <section aria-live="polite">
      <div className="toolbar"><div><span className="toolbar-note">Final chain state only · page {Math.floor(offset / limit) + 1}</span><p className="toolbar-caption">A live index of bonded promises and their recorded outcome.</p></div><Link href="/create" className="button secondary">Issue a warranty</Link></div>
      {loading ? <><div className="loading-bar" aria-label="Loading claims" /><p className="muted mt-24">Reading the latest finalized page…</p></> : null}
      {error ? <StateNotice kind="warning" title="Claims are not available">{error}</StateNotice> : null}
      {!loading && !error && claims.length === 0 ? <div className="empty-state"><strong>No finalized claims are available.</strong><p className="muted">This is a live-chain view. It stays empty until a configured deployment has claims to read.</p></div> : null}
      {!loading && !error && claims.length ? <div className="ledger-columns" aria-hidden="true"><span>Record</span><span>Bound claim</span><span>Position</span><span>State</span></div> : null}
      <div className="claim-grid mt-24">
        {claims.map((claim) => <Link className="claim-row" href={`/claims/${claim.id}`} key={claim.id}>
          <span className="claim-id"><i aria-hidden="true" />#{claim.id}</span>
          <div className="claim-row-main"><div className="claim-row-title"><h3>{claim.statement}</h3><span className="claim-row-arrow" aria-hidden="true">↗</span></div><p>{claim.issuer}</p>{claim.protocolTest ? <p className="demo-label">Protocol test claim · not usage data</p> : null}</div>
          <span className="claim-meta"><span>Bonded position</span>{formatGen(claim.claimBond)} GEN<br /><span>{formatDate(claim.createdAt)}</span></span>
          <span className="claim-row-state"><span>Recorded state</span><span className={`status ${claim.stateName.toLowerCase().replaceAll("_", "-")}`}>{claim.stateName}</span><small>{claim.challenger ? "Challenger posted" : "Challenge window"}</small></span>
        </Link>)}
      </div>
      <div className="toolbar mt-34"><button className="button secondary" type="button" disabled={loading || offset === 0} onClick={() => void load(Math.max(0, offset - limit))}>Previous</button><button className="button secondary" type="button" disabled={loading || !hasNext} onClick={() => void load(offset + limit)}>Next</button></div>
    </section>
  );
}
