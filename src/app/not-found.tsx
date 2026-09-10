import Link from "next/link";

export default function NotFound() {
  return <section className="section"><div className="container empty-state"><p className="eyebrow">404</p><h1>That route does not exist.</h1><p className="muted">No protocol state was changed.</p><Link href="/" className="button mt-24">Return home</Link></div></section>;
}
