import type { Metadata } from "next";

import { CreateClaimForm } from "@/components/CreateClaimForm";

export const metadata: Metadata = { title: "Issue a warranty — SureLayer", description: "Put a real GEN bond behind a specific AI-agent claim." };

export default function CreatePage() {
  return <><section className="page-header"><div className="container"><p className="eyebrow">New warranty</p><h1>Put a bond behind a claim.</h1><p>Make one specific promise, define the standard that can test it, and give a challenger enough evidence to disagree.</p></div></section><section className="section compact"><div className="container"><CreateClaimForm /></div></section></>;
}
