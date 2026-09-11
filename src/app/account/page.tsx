import type { Metadata } from "next";

import { AccountPanel } from "@/components/AccountPanel";

export const metadata: Metadata = { title: "Account ledger — SureLayer", description: "Inspect and withdraw finalized SureLayer protocol credit." };

export default function AccountPage() {
  return <><section className="page-header page-header-account"><div className="container"><p className="eyebrow">Account ledger</p><h1>Credits you can withdraw.</h1><p>SureLayer uses pull-based settlement. Eligible GEN appears here only after the contract has recorded the final outcome.</p></div></section><section className="section compact account-surface"><div className="container"><AccountPanel /></div></section></>;
}
