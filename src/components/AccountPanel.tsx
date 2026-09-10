"use client";

import { useCallback, useEffect, useState } from "react";

import { StateNotice } from "@/components/StateNotice";
import { TransactionStatus } from "@/components/TransactionStatus";
import { requestWalletAccount, submitWrite, transactionErrorState, type BrowserProvider, type TransactionState } from "@/lib/genlayer";
import { formatGen } from "@/lib/protocol";

function validAddress(value: unknown): value is string { return typeof value === "string" && /^0x[a-fA-F0-9]{40}$/.test(value); }

export function AccountPanel() {
  const [address, setAddress] = useState<string | null>(null);
  const [credit, setCredit] = useState<bigint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [txState, setTxState] = useState<TransactionState>("idle");
  const [txHash, setTxHash] = useState<string>();

  const load = useCallback(async (wallet: string) => {
    const response = await fetch(`/api/credit?address=${encodeURIComponent(wallet)}`, { cache: "no-store" });
    const body = await response.json() as { readable: boolean; credit?: string; error?: { message?: string } };
    if (!response.ok || !body.readable) throw new Error(body.error?.message ?? "Credit is not readable in final state.");
    setCredit(BigInt(body.credit ?? "0"));
  }, []);

  useEffect(() => { if (window.ethereum) window.ethereum.request({ method: "eth_accounts" }).then((value) => { const wallet = Array.isArray(value) && validAddress(value[0]) ? value[0] : null; if (wallet) { setAddress(wallet); void load(wallet).catch((cause) => setError(cause instanceof Error ? cause.message : "Credit could not be loaded.")); } }).catch(() => undefined); }, [load]);

  async function connect() {
    setError(null);
    if (!window.ethereum) { setError("Install a compatible wallet to view and withdraw credit."); return; }
    try {
      const wallet = await requestWalletAccount(window.ethereum as BrowserProvider);
      setAddress(wallet);
      await load(wallet);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Wallet connection failed."); }
  }

  async function withdraw() {
    setError(null);
    try {
      if (credit === null || credit === 0n) throw new Error("No finalized credit is available to withdraw.");
      if (!window.ethereum) throw new Error("Install a compatible wallet to withdraw credit.");
      await requestWalletAccount(window.ethereum as BrowserProvider);
      if (!window.confirm(`Withdraw ${formatGen(credit)} GEN?\n\nThis consumes the available protocol credit before the external transfer is attempted. The withdrawal is final after GenLayer finality; wallet and consensus fees may apply.`)) return;
      setTxState("submitting");
      await submitWrite("withdraw_credit", [], 0n, window.ethereum as BrowserProvider, { onSubmitted: (hash) => { setTxHash(hash); setTxState("waiting"); } });
      setTxState("success");
      if (address) {
        try {
          await load(address);
        } catch (cause) {
          setError(cause instanceof Error ? `Withdrawal finalized, but the ledger view could not refresh: ${cause.message}` : "Withdrawal finalized, but the ledger view could not refresh. Reload before retrying.");
        }
      }
    } catch (cause) { setTxState(transactionErrorState(cause)); setError(cause instanceof Error ? cause.message : "Withdrawal failed."); }
  }

  return <div className="split"><div><div className="eyebrow">Personal ledger</div><h2>Available credit</h2><p className="big-number">{credit === null ? "—" : `${formatGen(credit)} GEN`}</p><p className="muted">Only finalized protocol credits are shown. The contract zeroes a credit before attempting the external transfer.</p>{error ? <StateNotice kind="error" title={txState === "success" ? "Ledger refresh delayed" : "Account action unavailable"}>{error}</StateNotice> : null}</div><div className="form-card">{address ? <><p className="mono small">{address}</p><p className="muted small">Withdrawals are signed by your wallet and settle only after GenLayer finality.</p><button className="button" type="button" onClick={() => void withdraw()} disabled={credit === null || credit === 0n || txState === "submitting" || txState === "waiting" || txState === "undetermined"}>{txState === "submitting" ? "Confirm in wallet…" : txState === "waiting" ? "Waiting for finality…" : txState === "undetermined" ? "Read transaction before retrying" : "Withdraw available credit"}</button></> : <><h2>Connect to inspect your ledger</h2><p className="muted">SureLayer never asks the server to custody your wallet or private key.</p><button className="button" type="button" onClick={() => void connect()}>Connect wallet</button></>}<TransactionStatus state={txState} hash={txHash} /></div></div>;
}
