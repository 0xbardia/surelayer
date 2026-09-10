"use client";

import { useState } from "react";

import { requestWalletAccount, type BrowserProvider } from "@/lib/genlayer";

declare global {
  interface Window {
    ethereum?: BrowserProvider;
  }
}

function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function WalletButton() {
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function connect() {
    setError(null);
    if (!window.ethereum) {
      setError("Install a compatible wallet to sign protocol actions.");
      return;
    }
    try {
      setAddress(await requestWalletAccount(window.ethereum));
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Wallet connection failed.";
      setError(message.toLowerCase().includes("reject") ? "Wallet connection was canceled." : message);
    }
  }

  return (
    <div className="wallet-wrap">
      <button className={`wallet-button${address ? " connected" : ""}`} type="button" onClick={connect}>
        {address ? shortAddress(address) : "Connect wallet"}
      </button>
      {error ? <span className="wallet-error" role="status">{error}</span> : null}
    </div>
  );
}
