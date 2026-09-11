import type { Metadata } from "next";

import { ClaimsExplorer } from "@/components/ClaimsExplorer";

export const metadata: Metadata = { title: "Claims — SureLayer", description: "Browse finalized SureLayer warranty claims from the configured GenLayer contract." };

export default function ClaimsPage() {
  return <><section className="page-header page-header-index"><div className="container"><p className="eyebrow">Protocol ledger</p><h1>Claims under warranty.</h1><p>Browse finalized chain state. Every row is a bounded claim with an economic position behind it.</p></div></section><section className="section compact"><div className="container"><ClaimsExplorer /></div></section></>;
}
