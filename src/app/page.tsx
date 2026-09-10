import Link from "next/link";

import { ProtocolStatus } from "@/components/ProtocolStatus";
import { BrandMark } from "@/components/BrandMark";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">Economic assurance for AI-agent claims</p>
            <h1 className="display-title">Trust,<br /><em>backed</em> by<br />consensus.</h1>
            <p className="lead">SureLayer lets an agent or operator put real GEN behind a precise claim. When challenged, GenLayer independently evaluates the evidence and settles the warranty.</p>
            <div className="hero-actions">
              <Link href="/create" className="button">Issue a warranty</Link>
              <Link href="/claims" className="button secondary">Browse claims</Link>
            </div>
          </div>
          <div className="hero-panel">
            <div className="panel-kicker"><span>The assurance layer</span><span>Protocol / 01</span></div>
            <div className="assurance-diagram" role="img" aria-label="Protocol concept: a bonded claim, independently evaluated evidence, then final consensus. This diagram is not a live verdict.">
              <div className="diagram-orbit" aria-hidden="true"><BrandMark className="diagram-mark" /></div>
              <div className="proof-layer layer-one"><span>01 / COMMITMENT</span><strong>A claim with value at stake.</strong><i aria-hidden="true">↗</i></div>
              <div className="proof-layer layer-two"><span>02 / EVIDENCE</span><strong>Independently evaluated.</strong><i aria-hidden="true">↗</i></div>
              <div className="proof-layer layer-three"><span>03 / CONSENSUS</span><strong>A structured final outcome.</strong><i aria-hidden="true">↗</i></div>
            </div>
            <div className="panel-foot"><span>LIVE PROTOCOL READ</span><ProtocolStatus /></div>
            <p className="diagram-disclaimer">Submission is not settlement. Finality is verified on GenLayer.</p>
          </div>
        </div>
      </section>

      <section className="section" id="how-it-works">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">01 / The premise</p>
            <div><h2>Specific claims deserve specific consequences.</h2><p>AI output is cheap to produce and difficult to audit. SureLayer turns a bounded assertion into an observable economic commitment.</p></div>
          </div>
          <div className="numbered-grid">
            <div className="numbered-card"><span className="number">01</span><h3>Issue</h3><p>Define the claim, warranty criteria, artifact, and bounded evidence. Lock a GEN bond.</p></div>
            <div className="numbered-card"><span className="number">02</span><h3>Challenge</h3><p>A second participant posts a challenge bond and identifies the criterion they contest.</p></div>
            <div className="numbered-card"><span className="number">03</span><h3>Resolve</h3><p>GenLayer consensus evaluates untrusted sources and records a structured verdict.</p></div>
          </div>
        </div>
      </section>

      <section className="section" id="economics">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">02 / The ledger</p>
            <div><h2>Outcome follows the evidence.</h2><p>Funds move according to a small, explicit state machine. There is no administrator who can rewrite a verdict.</p></div>
          </div>
          <div className="economics">
            <div className="econ-cell"><strong>SUPPORTED</strong><span>Issuer receives the claim bond and challenge bond.</span></div>
            <div className="econ-cell"><strong>BREACHED</strong><span>Challenger receives the challenge bond and issuer bond.</span></div>
            <div className="econ-cell"><strong>INCONCLUSIVE</strong><span>Each participant receives their own bond back.</span></div>
            <div className="econ-cell"><strong>TIMEOUT</strong><span>A permissionless failsafe recovers challenged funds when resolution cannot complete.</span></div>
          </div>
        </div>
      </section>

      <section className="section ink-section" id="genlayer-fit">
        <div className="container split">
          <div><p className="eyebrow">03 / Why GenLayer</p><h2>Not a backend boolean.</h2><p className="accent-line">A centralized service can ask an LLM for a verdict. It cannot give every validator an opportunity to independently inspect the evidence and converge on the economic decision.</p></div>
          <ul className="feature-list">
            <li><b>01</b><div><strong>Independent evaluation</strong><span>Leader output is checked against validator-derived verdict, evidence state, criteria result, and support count.</span></div></li>
            <li><b>02</b><div><strong>Untrusted sources stay untrusted</strong><span>Web text is bounded, marked as data, scanned for prompt injection, and never treated as protocol instructions.</span></div></li>
            <li><b>03</b><div><strong>Final state, not optimistic UI</strong><span>The application reads the latest finalized contract state and distinguishes submission from a decided outcome.</span></div></li>
          </ul>
        </div>
      </section>

      <section className="section" id="security-model">
        <div className="container">
          <div className="section-heading"><p className="eyebrow">04 / Security model</p><div><h2>Small enough to audit. Serious enough to settle.</h2><p>The contract keeps the trust boundary narrow: bounded data, explicit transitions, pull-based credits, and no privileged verdict override.</p></div></div>
          <div className="numbered-grid">
            <div className="numbered-card"><span className="number">BOUNDS</span><h3>Finite by design</h3><p>Statements, criteria, URLs, source count, evidence extraction, pages, and consensus work all have explicit limits.</p></div>
            <div className="numbered-card"><span className="number">LEDGER</span><h3>Liabilities are visible</h3><p>Locked bonds and withdrawable credits are tracked on-chain and checked against the contract’s expected assets.</p></div>
            <div className="numbered-card"><span className="number">RECOVERY</span><h3>Timeout is permissionless</h3><p>If a challenged resolution cannot finish, either participant can recover their own bond after the deadline.</p></div>
          </div>
        </div>
      </section>

      <section className="section" id="developers">
        <div className="container">
          <div className="section-heading"><p className="eyebrow">05 / Developer path</p><div><h2>Integrate around a final contract state.</h2><p>SureLayer exposes a compact contract interface. The server normalizes reads; the connected wallet signs writes; the contract remains the source of truth.</p></div></div>
          <div className="split developer-grid">
            <div><h3>Write a warranty</h3><p className="muted">Call the payable create method with a claim, criteria, artifact reference, and bounded source list. The bond is real GEN, not a UI balance.</p><code className="code-block">create_claim(statement, artifact, hash, criteria, sources)</code></div>
            <div><h3>Read and challenge</h3><p className="muted">Read finalized pages and detail projections, then let a challenger post an exact bond against a concrete criterion.</p><code className="code-block">get_claim(id) → state, evidence, timeline</code></div>
          </div>
        </div>
      </section>

      <section className="section" id="roadmap">
        <div className="container">
          <div className="section-heading"><p className="eyebrow">06 / Roadmap</p><div><h2>Protocol before polish. Evidence before expansion.</h2><p>Only shipped behavior is presented as live. Planned work remains explicitly labeled.</p></div></div>
          <div className="roadmap-grid">
            <div className="roadmap-card"><span className="number">AVAILABLE</span><h3>Core assurance loop</h3><p>Bonded claims, one active challenge, independent evidence evaluation, three verdicts, pull credits, and timeout recovery.</p></div>
            <div className="roadmap-card"><span className="number">NEXT</span><h3>Operational tooling</h3><p>More detailed finality and fee inspection, richer developer helpers, and stronger evidence extraction once the network contract is stable.</p></div>
            <div className="roadmap-card"><span className="number">LATER</span><h3>Composable warranties</h3><p>Delegated claim templates and additional artifact adapters only after the core economic invariants have production evidence.</p></div>
          </div>
        </div>
      </section>

      <section className="section" id="faq">
        <div className="container split">
          <div><p className="eyebrow">07 / FAQ</p><h2>Questions worth asking before money moves.</h2></div>
          <div className="faq-list">
            <details><summary>Why not use a regular EVM contract?</summary><p>A regular contract can enforce bonds and transitions, but it cannot natively perform the semantic evidence adjudication that SureLayer asks validators to independently evaluate.</p></details>
            <details><summary>What if sources disagree or disappear?</summary><p>The evaluator records the evidence condition and returns INCONCLUSIVE when reliable binary support cannot be established. A timeout remains available if consensus cannot complete.</p></details>
            <details><summary>Can an issuer or administrator override a verdict?</summary><p>No. There is no admin verdict function. Resolution is permissionless while the challenged claim is within its resolution window.</p></details>
            <details><summary>When is a transaction actually final?</summary><p>After GenLayer’s final transaction status and successful contract execution are observed. A submitted wallet transaction is only progress, not a settled warranty.</p></details>
          </div>
        </div>
      </section>

      <section className="section compact closing-section">
        <div className="container split final-cta">
          <div><p className="eyebrow">08 / Protocol status</p><h2>Use the chain as the source of truth.</h2></div>
          <div><p className="muted">There are no invented activity numbers here. If a deployment is not configured or readable, SureLayer says so and leaves the live view empty.</p><div className="hero-actions"><Link href="/account" className="button secondary">View account ledger</Link><Link href="/create" className="button">Put a bond behind a claim</Link></div></div>
        </div>
      </section>
    </>
  );
}
