import { BrandMark } from "@/components/BrandMark";

type ProtocolTraceProps = {
  state?: string;
  compact?: boolean;
};

function stateSlug(value: string) {
  return value.toLowerCase().replaceAll("_", "-").replace(/[^a-z0-9-]/g, "");
}

export function ProtocolTrace({ state = "CONCEPTUAL", compact = false }: ProtocolTraceProps) {
  const isConceptual = state === "CONCEPTUAL";
  const slug = stateSlug(state);
  const outcome = isConceptual ? "Convergence" : state.replaceAll("_", " ");
  const description = isConceptual
    ? "Conceptual protocol trace: a bonded claim enters through evidence paths, converges through consensus, and records a final settlement. This is not live validator telemetry."
    : `Protocol trace for claim state ${outcome}. The visualization is a presentation of the recorded state, not live validator telemetry.`;

  return (
    <div className={`protocol-trace ${compact ? "protocol-trace-compact" : ""} protocol-state-${slug}`} role="img" aria-label={description}>
      <svg className="protocol-trace-svg" viewBox="0 0 620 340" aria-hidden="true" focusable="false">
        <path className="protocol-trace-line trace-line-a" d="M18 72H158C207 72 218 137 272 137H301" />
        <path className="protocol-trace-line trace-line-b" d="M18 268H158C207 268 218 203 272 203H301" />
        <path className="protocol-trace-line trace-line-c" d="M602 72H462C413 72 402 137 348 137H319" />
        <path className="protocol-trace-line trace-line-d" d="M602 268H462C413 268 402 203 348 203H319" />
        <path className="protocol-trace-axis" d="M310 24V316" />
        <circle className="protocol-trace-orbit" cx="310" cy="170" r="77" />
        <circle className="protocol-trace-orbit protocol-trace-orbit-inner" cx="310" cy="170" r="59" />
        <circle className="protocol-trace-plane" cx="310" cy="170" r="4" />
        <path className="protocol-trace-cross" d="M297 170h26M310 157v26" />
      </svg>
      <div className="protocol-trace-core"><BrandMark className="protocol-trace-mark" /><span>{isConceptual ? "decision plane" : outcome}</span></div>
      <div className="trace-node trace-node-claim"><span>01 / Claim</span><strong>Economic promise</strong><small>bounded record</small></div>
      <div className="trace-node trace-node-bond"><span>02 / Bond</span><strong>Value at stake</strong><small>real GEN</small></div>
      <div className="trace-node trace-node-evidence"><span>03 / Evidence</span><strong>Independent paths</strong><small>untrusted inputs</small></div>
      <div className="trace-node trace-node-verdict"><span>04 / Verdict</span><strong>{outcome}</strong><small>settlement follows</small></div>
      <div className="trace-register" aria-hidden="true"><span>Promise</span><i /><span>Weight</span><i /><span>Evidence</span><i /><span>Final state</span></div>
    </div>
  );
}
