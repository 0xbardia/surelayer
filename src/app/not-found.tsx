import Link from "next/link";

import { ProtocolTrace } from "@/components/ProtocolTrace";

export default function NotFound() {
  return <section className="section"><div className="container empty-state not-found-surface"><p className="eyebrow">Protocol record / unavailable</p><h1>Claim unavailable.</h1><p className="muted">That route does not exist. No protocol state was changed.</p><ProtocolTrace compact state="INCONCLUSIVE" /><Link href="/" className="button mt-24">Return home</Link></div></section>;
}
