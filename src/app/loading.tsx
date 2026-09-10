export default function Loading() {
  return (
    <section className="container section" aria-busy="true" aria-label="Loading SureLayer">
      <div className="loading-bar" />
      <p className="muted mt-24">Reading finalized protocol state…</p>
    </section>
  );
}
