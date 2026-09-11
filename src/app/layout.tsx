import type { Metadata } from "next";
import Link from "next/link";

import { WalletButton } from "@/components/WalletButton";
import { BrandMark } from "@/components/BrandMark";
import { PrimaryNav } from "@/components/PrimaryNav";
import { appConfig, requirePublicOrigin } from "@/lib/config";

import "./globals.css";

const publicOrigin = requirePublicOrigin(appConfig());

export const metadata: Metadata = {
  metadataBase: new URL(publicOrigin),
  title: "SureLayer — Trust, backed by consensus",
  description: "Economic assurance for AI-agent claims, evaluated by GenLayer consensus.",
  alternates: { canonical: publicOrigin },
  icons: { icon: "/icon.svg" },
  openGraph: {
    type: "website",
    url: publicOrigin,
    siteName: "SureLayer",
    title: "SureLayer — Trust, backed by consensus",
    description: "Economic assurance for AI-agent claims, evaluated by GenLayer consensus.",
    images: [{ url: `${publicOrigin}/brand/surelayer-social.svg`, width: 1200, height: 630, alt: "SureLayer — Trust, backed by consensus" }],
  },
  twitter: {
    card: "summary",
    title: "SureLayer — Trust, backed by consensus",
    description: "Economic assurance for AI-agent claims, evaluated by GenLayer consensus.",
    images: [`${publicOrigin}/brand/surelayer-social.svg`],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <header className="site-header">
          <div className="container header-inner">
            <Link href="/" className="brand" aria-label="SureLayer home">
              <BrandMark className="brand-mark" />
              <span className="brand-lockup"><span className="brand-name">SureLayer</span><span className="brand-subline">Assurance protocol</span></span>
            </Link>
            <PrimaryNav />
            <WalletButton />
          </div>
        </header>
        <main id="main-content">{children}</main>
        <footer className="site-footer">
          <div className="container footer-grid">
            <div>
              <Link href="/" className="brand footer-brand"><BrandMark className="brand-mark" /><span className="brand-lockup"><span className="brand-name">SureLayer</span><span className="brand-subline">Assurance protocol</span></span></Link>
              <p className="footer-note">A bounded economic assurance layer for claims made by AI agents and their operators.</p>
            </div>
            <div className="footer-links">
              <Link href="/claims">Browse claims</Link>
              <Link href="/create">Create warranty</Link>
              <a href="https://docs.genlayer.com/developers/intelligent-contracts/equivalence-principle" target="_blank" rel="noopener noreferrer">GenLayer consensus ↗</a>
              <a href="https://github.com/0xbardia/surelayer" target="_blank" rel="noopener noreferrer">Open source ↗</a>
            </div>
            <div className="footer-meta">
              <span>AI &amp; Agents</span>
              <span>Verifiable inference</span>
              <span>Source verification</span>
            </div>
          </div>
          <div className="container footer-signoff"><span>Claims with consequences.</span><span>Evidence → consensus → finality</span></div>
        </footer>
      </body>
    </html>
  );
}
