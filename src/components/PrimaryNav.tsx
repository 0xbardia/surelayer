"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function PrimaryNav() {
  const pathname = usePathname();
  return <nav className="main-nav" aria-label="Primary navigation">
    {[["/claims", "Claims"], ["/create", "Issue a warranty"], ["/account", "Account"]].map(([href, label]) =>
      <Link key={href} href={href} aria-current={pathname === href || pathname.startsWith(`${href}/`) ? "page" : undefined}>{label}</Link>
    )}
  </nav>;
}
