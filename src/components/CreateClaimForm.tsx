"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

import { TransactionStatus } from "@/components/TransactionStatus";
import { loadRuntimeConfig } from "@/lib/config";
import { pendingWriteForAction, requestWalletAccount, resumePendingWrite, submitWrite, transactionErrorState, type BrowserProvider, type TransactionState } from "@/lib/genlayer";
import { formatGen, parseProtocolState } from "@/lib/protocol";
import type { ProtocolReadState } from "@/lib/protocol";

type PostSuccessCleanup = "CLEAN" | "POST_SUCCESS_UI_ERROR";

function resetFormAfterSuccess(form: HTMLFormElement): PostSuccessCleanup {
  try {
    form.reset();
    return "CLEAN";
  } catch {
    return "POST_SUCCESS_UI_ERROR";
  }
}

function parseGen(value: string): bigint {
  if (!/^\d+(\.\d{1,18})?$/.test(value.trim())) throw new Error("Enter a GEN amount with up to 18 decimal places.");
  const [whole, fraction = ""] = value.trim().split(".");
  return BigInt(whole) * 10n ** 18n + BigInt(fraction.padEnd(18, "0") || "0");
}

function sources(value: string) {
  const list = value.split("\n").map((item) => item.trim()).filter(Boolean);
  if (list.some((item) => !/^https?:\/\/[^\s<>"']+$/.test(item))) throw new Error("Every evidence source must be a valid http:// or https:// URL.");
  return list;
}

export function CreateClaimForm() {
  const [protocol, setProtocol] = useState<ProtocolReadState | null>(null);
  const [preview, setPreview] = useState({ statement: "", criteria: "", bond: "", sourceCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [txState, setTxState] = useState<TransactionState>("idle");
  const [txMessage, setTxMessage] = useState<string>();
  const [txHash, setTxHash] = useState<string>();
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/status", { cache: "no-store" })
      .then(async (response) => {
        const body = parseProtocolState(await response.json());
        if (!response.ok || !body.configured || !body.readable || !body.config) throw new Error("The live contract is not readable yet. Configure a final deployment before submitting a claim.");
        setProtocol(body);
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Protocol status could not be loaded."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let disposed = false;
    void (async () => {
      const runtime = await loadRuntimeConfig();
      const pending = pendingWriteForAction(runtime, "create_claim");
      if (!pending || disposed) return;
      setTxHash(pending.hash);
      setTxMessage("A submitted create action is being tracked. Do not submit another claim while it is unresolved.");
      setTxState("waiting");
      try {
        const receipt = await resumePendingWrite("create_claim", runtime);
        if (!receipt || disposed) return;
        setTxHash(receipt.hash);
        setTxMessage("Your pending warranty finalized successfully. Open Claims to inspect it.");
        setTxState("success");
      } catch (cause) {
        if (disposed) return;
        setTxState(transactionErrorState(cause));
        setError(cause instanceof Error ? cause.message : "The pending transaction could not be verified.");
      }
    })();
    return () => { disposed = true; };
  }, []);

  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);

  function updatePreview(event: FormEvent<HTMLFormElement>) {
    const values = new FormData(event.currentTarget);
    const issuerSources = String(values.get("issuerSources") ?? "").split("\n").map((item) => item.trim()).filter(Boolean);
    setPreview({ statement: String(values.get("statement") ?? ""), criteria: String(values.get("criteria") ?? ""), bond: String(values.get("bond") ?? ""), sourceCount: issuerSources.length });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setTxMessage(undefined);
    setTxHash(undefined);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      if (!protocol?.config) throw new Error("The final contract configuration is unavailable.");
      const bond = parseGen(String(form.get("bond") ?? ""));
      if (bond < protocol.config.minClaimBond) throw new Error(`The claim bond must be at least ${formatGen(protocol.config.minClaimBond)} GEN.`);
      const statement = String(form.get("statement") ?? "");
      const criteria = String(form.get("criteria") ?? "");
      const issuerSources = sources(String(form.get("issuerSources") ?? ""));
      if (!window.ethereum) throw new Error("Install a compatible wallet to sign this claim.");
      await requestWalletAccount(window.ethereum as BrowserProvider);
      if (!window.confirm(`Issue this warranty?\n\nClaim bond: ${formatGen(bond)} GEN. The bond is returned for a supported or inconclusive outcome, and is transferred to a successful challenger if the claim is breached.\n\nThe challenge window is ${Number(protocol.config.challengeWindowSeconds) / 3600} hours. Wallet and consensus fees may apply. The result is final only after GenLayer consensus.`)) return;
      setTxState("submitting");
      const receipt = await submitWrite("create_claim", [
        statement,
        String(form.get("artifactRef") ?? ""),
        String(form.get("artifactHash") ?? ""),
        criteria,
        issuerSources,
      ], bond, window.ethereum as BrowserProvider, { onSubmitted: (hash) => { setTxHash(hash); setTxState("waiting"); } });
      const cleanup = resetFormAfterSuccess(formElement);
      setTxHash(receipt.hash);
      setTxMessage(cleanup === "POST_SUCCESS_UI_ERROR"
        ? "Your warranty finalized successfully, but the form could not be cleared; your entries were preserved. Open Claims to inspect it."
        : "Your warranty is now in the final chain state. Open Claims to inspect it.");
      setTxState("success");
    } catch (cause) {
      setTxState(transactionErrorState(cause));
      setError(cause instanceof Error ? cause.message : "The claim could not be submitted.");
    }
  }

  return (
    <div className="form-layout">
      <div className="form-card">
        <div className="form-intro"><div className="form-intro-top"><p className="eyebrow">01 / Your commitment</p><span className="form-code">ISSUE / 01</span></div><h2>Define the warranty</h2><p>Be precise. These details become part of the permanent claim.</p><div className="form-steps" aria-label="Warranty issue steps"><span className="active"><i>01</i> Define</span><span><i>02</i> Bond</span><span><i>03</i> Finalize</span></div></div>
        {loading ? <div className="loading-bar" aria-label="Loading protocol configuration" /> : null}
        {error ? <div ref={errorRef} className="error-summary" tabIndex={-1} role="alert"><strong>Action needs attention</strong>{error}</div> : null}
        <TransactionStatus state={txState} message={txMessage} hash={txHash} />
        <form className="form-stack mt-24" onSubmit={submit} onInput={updatePreview}>
          <div className="field">
            <label htmlFor="statement">Specific claim</label>
            <textarea id="statement" name="statement" required maxLength={1200} placeholder="Example: This report uses only primary sources for its factual claims." />
            <small>State what an observer can actually verify. Maximum 1,200 characters.</small>
          </div>
          <div className="field">
            <label htmlFor="criteria">Warranty criteria</label>
            <textarea id="criteria" name="criteria" required maxLength={2000} placeholder="Define the evidence standard that would support or breach this claim." />
            <small>These criteria guide the independent GenLayer evaluation.</small>
          </div>
          <div className="field">
            <label htmlFor="artifactRef">Artifact reference <span className="muted">(optional)</span></label>
            <input id="artifactRef" name="artifactRef" maxLength={500} placeholder="IPFS, URL, repository, or internal reference" />
          </div>
          <div className="field">
            <label htmlFor="artifactHash">Artifact hash <span className="muted">(optional)</span></label>
            <input id="artifactHash" name="artifactHash" maxLength={128} placeholder="Content hash for the exact output" />
          </div>
          <div className="field">
            <label htmlFor="issuerSources">Issuer evidence sources <span className="muted">(optional)</span></label>
            <textarea id="issuerSources" name="issuerSources" maxLength={2200} placeholder="One http(s) URL per line; up to 4 sources" />
            <small>Sources are untrusted evidence. GenLayer fetches bounded excerpts during consensus.</small>
          </div>
          <div className="field">
            <label htmlFor="bond">Claim bond (GEN)</label>
            <input key={protocol?.config?.minClaimBond.toString() ?? "pending"} id="bond" name="bond" inputMode="decimal" required defaultValue={protocol?.config ? formatGen(protocol.config.minClaimBond) : "1"} placeholder="1" />
            <small>{protocol?.config ? `Minimum ${formatGen(protocol.config.minClaimBond)} GEN. This bond is at risk if the claim is breached.` : "The live minimum will be checked before signing."}</small>
          </div>
          <label className="checkline"><input type="checkbox" required /> <span>I understand that the bond is locked, challenges can change the economic outcome, and finality depends on GenLayer consensus.</span></label>
          <button className="button" type="submit" disabled={txState === "submitting" || txState === "waiting" || txState === "undetermined"}>{txState === "submitting" ? "Confirm in wallet…" : txState === "waiting" ? "Waiting for finality…" : txState === "undetermined" ? "Read transaction before retrying" : "Lock bond and issue warranty"}</button>
        </form>
      </div>
      <aside className="form-aside">
        <div className="aside-card">
          <p className="eyebrow">Preflight / 01</p><h2>Before you sign</h2>
          <p className="aside-lead">Your warranty becomes a permanent protocol record with real value at stake.</p>
          <dl>
            <div><dt>Claim bond</dt><dd>{protocol?.config ? `${formatGen(protocol.config.minClaimBond)} GEN minimum` : "Live contract required"}</dd></div>
            <div><dt>Challenge window</dt><dd>{protocol?.config ? `${Number(protocol.config.challengeWindowSeconds) / 3600} hours` : "—"}</dd></div>
            <div><dt>Network</dt><dd>{protocol?.network ? `${protocol.network} · ${protocol.chainId ?? "—"}` : "Live contract required"}</dd></div>
            <div><dt>Final decision</dt><dd>Consensus, not submission, settles the warranty.</dd></div>
          </dl>
          <div className="aside-signature"><span>Commitment</span><strong>Evidence → consensus → finality</strong></div>
        </div>
        <div className="warranty-preview" aria-live="polite">
          <div className="preview-topline"><span>Draft instrument</span><span>Warranty / pending</span></div>
          <div className="preview-id"><span>Warranty ID</span><strong>Pending</strong></div>
          <p className="preview-label">Claim</p>
          <p className="preview-statement">{preview.statement.trim() || "Your precise promise will appear here."}</p>
          <div className="preview-criteria"><span>Criteria</span><p>{preview.criteria.trim() || "A bounded evidence standard will appear here."}</p></div>
          <dl className="preview-facts">
            <div><dt>Bond</dt><dd>{preview.bond.trim() || (protocol?.config ? formatGen(protocol.config.minClaimBond) : "—")} GEN</dd></div>
            <div><dt>Challenge bond</dt><dd>{protocol?.config ? `${formatGen(protocol.config.challengeBond)} GEN` : "—"}</dd></div>
            <div><dt>Evidence</dt><dd>{preview.sourceCount} source{preview.sourceCount === 1 ? "" : "s"}</dd></div>
            <div><dt>Window</dt><dd>{protocol?.config ? `${Number(protocol.config.challengeWindowSeconds) / 3600}h` : "—"}</dd></div>
            <div><dt>Network</dt><dd>{protocol?.network ? `${protocol.network} · ${protocol.chainId ?? "—"}` : "—"}</dd></div>
          </dl>
          <p className="preview-note">A visual draft only. The contract becomes authoritative after final GenLayer execution.</p>
        </div>
      </aside>
    </div>
  );
}
