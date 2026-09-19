"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

import { TransactionStatus } from "@/components/TransactionStatus";
import { loadRuntimeConfig } from "@/lib/config";
import { parseEvidence } from "@/lib/evidence";
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

export function ChallengeForm({ claimId, bond }: { claimId: string; bond?: bigint }) {
  const [protocol, setProtocol] = useState<ProtocolReadState | null>(null);
  const [txState, setTxState] = useState<TransactionState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string>();
  const [txMessage, setTxMessage] = useState<string>();
  const errorRef = useRef<HTMLDivElement>(null);
  const displayBond = bond ?? protocol?.config?.challengeBond;
  const bondLabel = displayBond !== undefined ? `${formatGen(displayBond)} GEN` : "the live challenge amount (loading)";

  useEffect(() => {
    fetch("/api/status", { cache: "no-store" }).then((response) => response.json()).then((body) => setProtocol(parseProtocolState(body))).catch(() => setError("Protocol configuration could not be loaded."));
  }, []);
  useEffect(() => {
    let disposed = false;
    void (async () => {
      const runtime = await loadRuntimeConfig();
      const pending = pendingWriteForAction(runtime, "challenge_claim");
      if (!pending || disposed) return;
      setTxHash(pending.hash);
      setTxMessage("A submitted challenge is being tracked. Do not submit another challenge while it is unresolved.");
      setTxState("waiting");
      try {
        const receipt = await resumePendingWrite("challenge_claim", runtime);
        if (!receipt || disposed) return;
        setTxHash(receipt.hash);
        setTxMessage("The pending challenge finalized successfully.");
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

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setTxMessage(undefined);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const expected = bond ?? (protocol?.config ? BigInt(protocol.config.challengeBond) : null);
      if (expected === null) throw new Error("The final challenge bond is unavailable.");
      const reason = String(form.get("reason") ?? "");
      const evidence = parseEvidence(String(form.get("sources") ?? ""), String(form.get("hashes") ?? ""), protocol?.config?.maxSources);
      if (!window.ethereum) throw new Error("Install a compatible wallet to sign this challenge.");
      await requestWalletAccount(window.ethereum as BrowserProvider);
      if (!window.confirm(`Post this challenge?\n\nChallenge bond: ${formatGen(expected)} GEN. It is returned only for a breached or inconclusive outcome; a supported claim transfers it to the issuer.\n\nThe challenge becomes final only after GenLayer consensus. Wallet and consensus fees may apply.`)) return;
      setTxState("submitting");
      const receipt = await submitWrite("challenge_claim", [Number(claimId), reason, evidence.urls, evidence.hashes], expected, window.ethereum as BrowserProvider, { onSubmitted: (hash) => { setTxHash(hash); setTxState("waiting"); } });
      const cleanup = resetFormAfterSuccess(formElement);
      setTxHash(receipt.hash);
      setTxMessage(cleanup === "POST_SUCCESS_UI_ERROR"
        ? "The challenge finalized successfully, but the form could not be cleared; your entries were preserved."
        : "The challenge is final. The claim now awaits permissionless resolution.");
      setTxState("success");
    } catch (cause) {
      setTxState(transactionErrorState(cause));
      setError(cause instanceof Error ? cause.message : "The challenge could not be submitted.");
    }
  }

  return (
    <div className="form-card">
      <div className="form-intro"><div className="form-intro-top"><p className="eyebrow">Counter-evidence</p><span className="form-code">CHALLENGE / 02</span></div><h2>Challenge this claim</h2><p>A specific objection, backed by a bond.</p><div className="challenge-commitment"><span className="challenge-sigil" aria-hidden="true">↗</span><div><strong>{bondLabel}</strong><p>at risk until the final verdict</p></div></div></div>
      <div className="adversarial-brief" aria-label="Issuer and challenger positions"><div><span>Issuer position</span><strong>Claim bond</strong><small>locked against the warranty</small></div><div className="brief-divider" aria-hidden="true">vs</div><div><span>Challenger position</span><strong>{bondLabel}</strong><small>returned by the final outcome</small></div></div>
      {error ? <div ref={errorRef} className="error-summary" tabIndex={-1} role="alert"><strong>Challenge not submitted</strong>{error}</div> : null}
      <TransactionStatus state={txState} hash={txHash} message={txMessage ?? "The challenge is final. The claim now awaits permissionless resolution."} />
      <form className="form-stack mt-24" onSubmit={submit}>
        <div className="field"><label htmlFor="reason">Challenge reason</label><textarea id="reason" name="reason" required maxLength={1200} placeholder="Identify the specific warranty criterion that is not met." /><small>Keep the challenge bounded and testable.</small></div>
        <div className="field"><label htmlFor="sources">Challenger evidence sources <span className="muted">(optional)</span></label><textarea id="sources" name="sources" maxLength={2200} placeholder="One http(s) URL per line; up to 4 sources" /><small>Line N is paired with evidence hash line N.</small></div>
        <div className="field"><label htmlFor="hashes">Challenger evidence SHA-256 commitments <span className="muted">(optional)</span></label><textarea id="hashes" name="hashes" maxLength={4 * 71 + 3} spellCheck={false} placeholder="sha256:<64 lowercase hex> per line; line N matches source N" /><small>Hashes are explicit browser inputs; no server-side URL fetch is used.</small></div>
        <label className="checkline"><input type="checkbox" required /> <span>I understand that {bondLabel} will be locked and returned only according to the final verdict.</span></label>
        <button className="button" type="submit" disabled={txState === "submitting" || txState === "waiting" || txState === "undetermined"}>{txState === "submitting" ? "Confirm in wallet…" : txState === "waiting" ? "Waiting for finality…" : txState === "undetermined" ? "Read transaction before retrying" : "Post challenge bond"}</button>
      </form>
    </div>
  );
}
