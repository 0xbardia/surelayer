/** Layered paths registering around one shared commitment. */
export function BrandMark({ className = "" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <path d="M10 16 31 5l23 12v8L43 31l11 6v8L31 57 10 45v-8l11-6-11-7v-8Zm21 1L20 23l11 6 12-6-12-6Zm0 20-11 6 11 6 12-6-12-6Z" fill="currentColor" fillRule="evenodd" />
    <path d="M31 5v12m0 12v8m0 12v8" stroke="currentColor" strokeWidth="1.5" opacity=".45" />
    <circle cx="31" cy="35" r="2.25" fill="currentColor" />
  </svg>;
}
