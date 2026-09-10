import type { Metadata } from "next";

import { ClaimDetailView } from "@/components/ClaimDetailView";

export const metadata: Metadata = { title: "Claim detail — SureLayer", description: "Inspect the evidence, economic position, timeline, and finalized state of a SureLayer claim." };

export default async function ClaimPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ClaimDetailView id={id} />;
}
