import Link from "next/link";

import { ProtocolStatus } from "@/components/ProtocolStatus";
import { BrandMark } from "@/components/BrandMark";
import { ProtocolTrace } from "@/components/ProtocolTrace";

export default function HomePage() {
  return (
    <>
      <section className="hero hero-v2 hero-v3 hero-v4" data-surface="home">
        <div className="hero-ambient" aria-hidden="true"><span /><span /><span /></div>
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="hero-kicker"><p className="eyebrow">Economic assurance for AI-agent claims</p><span className="hero-index">Signature / 01</span></div>
            <h1 className="display-title"><span>Trust,</span><span className="title-accent">backed</span><span>by consensus.</span></h1>
            <p className="lead">Put economic weight behind a precise claim. When challenged, GenLayer independently evaluates the evidence and settles the warranty.</p>
            <div className="hero-actions">
              <Link href="/create" className="button">Issue a warranty</Link>
              <Link href="/claims" className="button secondary">Browse claims</Link>
            </div>
            <p className="hero-commitment"><span aria-hidden="true">↘</span>One claim. One bond. One final state.</p>
            <div className="hero-signals" aria-label="SureLayer protocol sequence">
              <div><span>01</span><strong>Commit</strong><small>bond</small></div><div><span>02</span><strong>Challenge</strong><small>evidence</small></div><div><span>03</span><strong>Settle</strong><small>finality</small></div>
            </div>
          </div>
          <div className="hero-panel hero-protocol-panel instrument-panel">
            <div className="panel-kicker"><span>Convergence ledger</span><span>Scene / 01</span></div>
            <ProtocolTrace />
            <div className="panel-foot"><span>LIVE PROTOCOL READ</span><ProtocolStatus /></div>
            <p className="diagram-disclaimer">Conceptual map. Submission is not settlement; finality is verified on GenLayer.</p>
          </div>
        </div>
      </section>

      <section className="section premise-section" id="how-it-works">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">01 / The premise</p>
            <div><h2>Make the claim carry weight.</h2><p>AI output is cheap to produce and difficult to audit. SureLayer turns a bounded assertion into an observable economic commitment.</p></div>
          </div>
          <div className="numbered-grid protocol-steps">
            <div className="numbered-card protocol-step"><span className="number">01</span><h3>Issue</h3><p>Define the claim, warranty criteria, artifact, and bounded evidence. Lock a GEN bond.</p><span className="step-caption">promise / commitment</span></div>
            <div className="numbered-card protocol-step"><span className="number">02</span><h3>Challenge</h3><p>A second participant posts a challenge bond and identifies the criterion they contest.</p><span className="step-caption">dispute / evidence</span></div>
            <div className="numbered-card protocol-step"><span className="number">03</span><h3>Resolve</h3><p>GenLayer consensus evaluates untrusted sources and records a structured verdict.</p><span className="step-caption">convergence / record</span></div>
          </div>
        </div>
      </section>

      <section className="section protocol-story" id="protocol-flow">
        <div className="container story-grid">
          <div className="story-intro"><p className="eyebrow">01.5 / The sequence</p><h2>Every claim leaves a trace.</h2><p>SureLayer keeps the path from promise to settlement legible. Each layer adds a commitment, an independent check, or a final economic record.</p><span className="story-rule" aria-hidden="true" /></div>
          <div className="story-track">
            <article className="story-item"><span className="story-number">01</span><div><p className="story-label">Claim / commit</p><h3>A precise promise enters the ledger.</h3><p>One statement, one standard, one bond. The warranty begins as a bounded record—not a vague intention.</p></div><span className="story-node" aria-hidden="true" /></article>
            <article className="story-item"><span className="story-number">02</span><div><p className="story-label">Challenge / evidence</p><h3>Disagreement has an economic shape.</h3><p>A second participant can post a challenge bond and point to the criterion that needs to be tested.</p></div><span className="story-node" aria-hidden="true" /></article>
            <article className="story-item"><span className="story-number">03</span><div><p className="story-label">Consensus / decision</p><h3>Independent evaluation converges.</h3><p>GenLayer validators inspect bounded, untrusted evidence and converge on a structured outcome.</p></div><span className="story-node" aria-hidden="true" /></article>
            <article className="story-item story-item-final"><span className="story-number">04</span><div><p className="story-label">Settlement / finality</p><h3>The ledger records what the evidence supports.</h3><p>SUPPORTED, BREACHED, INCONCLUSIVE, or TIMEOUT. The final state determines where the locked value goes.</p></div><span className="story-node" aria-hidden="true" /></article>
          </div>
        </div>
      </section>

      <section className="section" id="economics">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">02 / The ledger</p>
            <div><h2>Outcome follows the evidence.</h2><p>Funds move according to a small, explicit state machine. There is no administrator who can rewrite a verdict.</p></div>
          </div>
          <div className="outcome-intro"><span>Settlement register</span><span>What the final state changes</span></div>
          <div className="economics outcome-ledger">
            <div className="econ-cell"><strong>SUPPORTED</strong><span>Issuer receives the claim bond and challenge bond.</span></div>
            <div className="econ-cell"><strong>BREACHED</strong><span>Challenger receives the challenge bond and issuer bond.</span></div>
            <div className="econ-cell"><strong>INCONCLUSIVE</strong><span>Each participant receives their own bond back.</span></div>
            <div className="econ-cell"><strong>TIMEOUT</strong><span>A permissionless failsafe recovers challenged funds when resolution cannot complete.</span></div>
          </div>
        </div>
      </section>

      <section className="section ink-section consensus-section" id="genlayer-fit">
        <div className="container split">
          <div className="consensus-intro"><p className="eyebrow">03 / Why GenLayer</p><h2>Not a backend boolean.</h2><p className="accent-line">A centralized service can ask an LLM for a verdict. It cannot give every validator an opportunity to independently inspect the evidence and converge on the economic decision.</p><ProtocolTrace compact state="CONSENSUS" /></div>
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
            <div><h3>Write a warranty</h3><p className="muted">Call the payable create method with a claim, criteria, artifact reference, and bounded URL/hash commitments. The bond is real GEN, not a UI balance.</p><code className="code-block">create_claim(statement, artifact, hash, criteria, source_urls, source_hashes)</code></div>
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
