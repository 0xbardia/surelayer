"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="container section" aria-labelledby="app-error-title">
      <div className="notice error">
        <h1 id="app-error-title">This view could not be loaded.</h1>
        <p>SureLayer could not render the requested state. Retry once, then inspect the protocol status before resubmitting a wallet transaction.</p>
        <div className="hero-actions">
          <button className="button" type="button" onClick={reset}>Retry view</button>
          <a className="button secondary" href="/">Return home</a>
        </div>
      </div>
    </section>
  );
}
