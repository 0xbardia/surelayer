"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { ChallengeForm } from "@/components/ChallengeForm";
import { ProtocolTrace } from "@/components/ProtocolTrace";
import { StateNotice } from "@/components/StateNotice";
import { TransactionStatus } from "@/components/TransactionStatus";
import { requestWalletAccount, submitWrite, transactionErrorState, type BrowserProvider, type TransactionState } from "@/lib/genlayer";
import { formatDate, formatGen, parseClaimDetail, type ClaimDetail } from "@/lib/protocol";

type DetailResponse = { readable: boolean; claim: unknown | null; error?: { message?: string } };
type ActionMethod = "resolve_claim" | "finalize_unchallenged" | "recover_challenge_timeout";

function safeHttp(value: string) {
  try { const url = new URL(value); return (url.protocol === "http:" || url.protocol === "https:") && !url.username && !url.password; } catch { return false; }
}

function settlementRecipient(claim: ClaimDetail): string {
  if (claim.stateName === "SUPPORTED" || claim.stateName === "UNCHALLENGED_FINALIZED") return "Issuer credit";
  if (claim.stateName === "BREACHED") return "Challenger credit";
  if (claim.stateName === "INCONCLUSIVE" || claim.stateName === "TIMEOUT_RECOVERED") return "Issuer + challenger credit";
  return "—";
}

export function ClaimDetailView({ id }: { id: string }) {
  const [claim, setClaim] = useState<ClaimDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/claims/${encodeURIComponent(id)}`, { cache: "no-store" });
      const body = await response.json() as DetailResponse;
      if (!response.ok || !body.readable || !body.claim) throw new Error(body.error?.message ?? "This claim is not readable in final state.");
      setClaim(parseClaimDetail(body.claim));
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Claim detail could not be loaded.");
    } finally { setLoading(false); }
  }, [id]);
  useEffect(() => { void load(); }, [load]);

  if (loading) return <div className="container section claim-loading"><div className="loading-bar" aria-label="Loading claim" /><p className="muted mt-24">Reading finalized claim state…</p></div>;
  if (error || !claim) return <div className="container section"><h1 className="detail-title">Claim unavailable</h1><StateNotice kind="error" title="Claim unavailable">{error ?? "No claim was returned."}</StateNotice><Link href="/claims" className="button secondary mt-24">Back to claims</Link></div>;

  return <ClaimContent claim={claim} onRefresh={load} />;
}

function ClaimContent({ claim, onRefresh }: { claim: ClaimDetail; onRefresh: () => Promise<void> }) {
  return (
    <div className="container section detail-shell">
      <div className="detail-grid">
        <article className="detail-main">
          <div className="detail-topline"><Link href="/claims" className="muted small">← Browse claims</Link><span className="record-label">Finalized chain record</span></div>
          <div className="detail-id-row"><div className="eyebrow mt-24">Warranty #{claim.id}</div><span className="record-mark" aria-hidden="true">SL / {claim.id}</span></div>
          <h1 className="detail-title">{claim.statement}</h1>
          <div className="detail-status-row"><span className={`status ${claim.stateName.toLowerCase().replaceAll("_", "-")}`}>{claim.stateName}</span><span className="detail-status-note">State recorded by the configured contract</span></div>
          {claim.protocolTest ? <div className="mt-24"><StateNotice title="Protocol test claim">This is a live on-chain protocol test used to exercise the Studionet deployment. It is not user adoption, a customer claim, or an endorsement.</StateNotice></div> : null}
          <section className={`detail-trace-frame protocol-state-${claim.stateName.toLowerCase().replaceAll("_", "-")}`} aria-labelledby="trace-title"><div className="detail-trace-heading"><p className="eyebrow" id="trace-title">Protocol trace</p><span>Recorded state / {claim.stateName}</span></div><ProtocolTrace compact state={claim.stateName} /><p className="detail-trace-note">A presentation of the claim path from bond to settlement. The contract and finalized GenLayer state remain authoritative.</p></section>
          {claim.verdict ? <section className={`verdict-panel ${claim.verdict.toLowerCase()}`} aria-labelledby="verdict-title"><div className="verdict-seal" aria-hidden="true"><BrandGlyph /></div><div><p className="eyebrow">Recorded outcome</p><h2 id="verdict-title">{claim.verdict}</h2><p>{claim.resolutionSummary || "The final verdict is recorded in the claim state."}</p><div className="verdict-trace" aria-hidden="true"><span>Evidence</span><i /><span>Consensus</span><i /><span>Ledger</span></div></div></section> : <div className="state-panel"><span className="state-panel-dot" aria-hidden="true" /><div><p className="eyebrow">Awaiting outcome</p><strong>{claim.stateName === "OPEN" ? "The challenge window remains open." : "The claim is awaiting its final protocol outcome."}</strong><p>Only a finalized GenLayer execution can change this record.</p></div></div>}
          <section className="detail-block"><h2>Warranty criteria</h2><p>{claim.criteria}</p></section>
          <section className="detail-block"><h2>Artifact</h2><dl className="data-table"><div className="data-cell"><dt>Reference</dt><dd>{safeHttp(claim.artifactRef) ? <a className="source-link" href={claim.artifactRef} target="_blank" rel="noopener noreferrer">{claim.artifactRef} ↗</a> : claim.artifactRef || "Not supplied"}</dd></div><div className="data-cell"><dt>Content hash</dt><dd className="mono">{claim.artifactHash || "Not supplied"}</dd></div></dl></section>
          <section className="detail-block"><h2>Evidence sources</h2><SourceGroup label="Issuer sources" sources={claim.issuerSources} /><SourceGroup label="Challenger sources" sources={claim.challengerSources} /></section>
          {claim.challengeReason ? <section className="detail-block"><h2>Challenge</h2><p>{claim.challengeReason}</p></section> : null}
          {claim.verdict ? <section className="detail-block"><h2>Resolution</h2><dl className="data-table"><div className="data-cell"><dt>Verdict</dt><dd><span className={`status ${claim.verdict.toLowerCase()}`}>{claim.verdict}</span></dd></div><div className="data-cell"><dt>Evidence state</dt><dd>{claim.evidenceState || "—"}</dd></div><div className="data-cell"><dt>Criteria met</dt><dd>{claim.criteriaMet ? "Yes" : "No / not established"}</dd></div><div className="data-cell"><dt>Supporting sources</dt><dd>{claim.supportingSourceCount}</dd></div><div className="data-cell"><dt>Settlement recipient</dt><dd>{settlementRecipient(claim)}</dd></div><div className="data-cell"><dt>Settlement</dt><dd>{claim.settlementDone ? "Recorded in contract" : "Not recorded"}</dd></div><div className="data-cell"><dt>Resolved at</dt><dd>{formatDate(claim.resolvedAt)}</dd></div></dl>{claim.resolutionSummary ? <p className="mt-24">{claim.resolutionSummary}</p> : null}</section> : null}
          <section className="detail-block"><h2>Timeline</h2><ol className="timeline">{claim.timeline.map((event, index) => <li key={`${event.event}-${event.timestamp.toString()}-${index}`}><span className="timeline-dot" aria-hidden="true" /><div><strong>{event.event}</strong><span>{formatDate(event.timestamp)} · {event.actor}</span></div></li>)}</ol></section>
        </article>
        <aside className="side-actions">
          <div className="aside-card"><h2>Economic position</h2><dl><div><dt>Claim bond</dt><dd>{formatGen(claim.claimBond)} GEN</dd></div><div><dt>Challenge bond</dt><dd>{claim.challengeBond ? `${formatGen(claim.challengeBond)} GEN` : "Not posted"}</dd></div><div><dt>Challenge closes</dt><dd>{formatDate(claim.challengeDeadline)}</dd></div><div><dt>Issuer</dt><dd className="mono small">{claim.issuer}</dd></div>{claim.challenger ? <div><dt>Challenger</dt><dd className="mono small">{claim.challenger}</dd></div> : null}</dl></div>
          {claim.stateName === "OPEN" ? <ChallengeForm claimId={claim.id} bond={claim.challengeBond || undefined} /> : null}
          {claim.stateName === "CHALLENGED" ? <ProtocolAction method="resolve_claim" claimId={claim.id} label="Resolve with consensus" detail="This starts bounded evidence evaluation. The final verdict is not known until GenLayer consensus completes." onDone={onRefresh} /> : null}
          {claim.stateName === "OPEN" ? <ProtocolAction method="finalize_unchallenged" claimId={claim.id} label="Finalize after deadline" detail="The contract will reject this until the challenge window has actually expired." onDone={onRefresh} /> : null}
          {claim.stateName === "CHALLENGED" ? <ProtocolAction method="recover_challenge_timeout" claimId={claim.id} label="Recover after timeout" detail="Permissionless failsafe; the contract will reject this until resolution is overdue." onDone={onRefresh} /> : null}
        </aside>
      </div>
    </div>
  );
}

function BrandGlyph() {
  return <svg viewBox="0 0 64 64" fill="none"><path d="M10 16 31 5l23 12v8L43 31l11 6v8L31 57 10 45v-8l11-6-11-7v-8Zm21 1L20 23l11 6 12-6-12-6Zm0 20-11 6 11 6 12-6-12-6Z" fill="currentColor" fillRule="evenodd"/><circle cx="31" cy="35" r="2.25" fill="currentColor"/></svg>;
}

function SourceGroup({ label, sources }: { label: string; sources: string[] }) {
  return <div className="mt-24"><h3 className="small muted">{label}</h3>{sources.length ? <ul className="source-list">{sources.map((source) => <li key={source}>{safeHttp(source) ? <a className="source-link" href={source} target="_blank" rel="noopener noreferrer">{source} ↗</a> : source}</li>)}</ul> : <p className="muted small">None supplied.</p>}</div>;
}

function ProtocolAction({ method, claimId, label, detail, onDone }: { method: ActionMethod; claimId: string; label: string; detail: string; onDone: () => Promise<void> }) {
  const [state, setState] = useState<TransactionState>("idle");
  const [error, setError] = useState<string>();
  async function act() {
    setError(undefined);
    try {
      if (!window.ethereum) throw new Error("Install a compatible wallet to sign this action.");
      await requestWalletAccount(window.ethereum as BrowserProvider);
      if (!window.confirm(`${label}\n\n${detail}\n\nValue sent to the protocol: 0 GEN. Wallet and consensus fees may apply.\n\nThis action is signed by your wallet and cannot be undone.`)) return;
      setState("submitting");
      const receipt = await submitWrite(method, [Number(claimId)], 0n, window.ethereum as BrowserProvider, { onSubmitted: () => setState("waiting") });
      setState("success");
      try {
        await onDone();
      } catch (cause) {
        setError(cause instanceof Error ? `Action finalized, but the claim view could not refresh: ${cause.message}` : "Action finalized, but the claim view could not refresh. Reload before retrying.");
      }
      return receipt;
    } catch (cause) { setState(transactionErrorState(cause)); setError(cause instanceof Error ? cause.message : "The action failed."); }
  }
  return <div className="form-card"><h2>{label}</h2><p className="small muted">{detail}</p><button className="button" type="button" onClick={() => void act()} disabled={state === "submitting" || state === "waiting" || state === "undetermined"}>{state === "success" ? "Action finalized" : state === "undetermined" ? "Read transaction before retrying" : label}</button>{error ? <p className="form-error mt-24" role="alert">{error}</p> : null}<TransactionStatus state={state} /></div>;
}
