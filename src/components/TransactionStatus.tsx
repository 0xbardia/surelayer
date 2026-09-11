type TransactionStatusProps = {
  state: "idle" | "submitting" | "waiting" | "success" | "rejected" | "failed" | "undetermined";
  message?: string;
  hash?: string;
};

export function TransactionStatus({ state, message, hash }: TransactionStatusProps) {
  if (state === "idle") return null;
  if (state === "submitting") return <State status="Signing" detail="Confirm the transaction in your wallet." />;
  if (state === "waiting") return <State status="Consensus pending" detail="The transaction was submitted. Waiting for the GenLayer decision; do not resubmit yet." hash={hash} />;
  if (state === "success") return <State status="Finalized" detail={message ?? "The final GenLayer state was updated."} hash={hash} success />;
  if (state === "rejected") return <State status="Wallet canceled" detail="No protocol state changed. Review the action and retry when ready." hash={hash} />;
  if (state === "undetermined") return <State status="Finality unresolved" detail="The transaction did not reach a confirmed successful final state. Read the claim before retrying." hash={hash} />;
  return <State status="Not finalized" detail="The action did not reach a successful final state. Review the error above; no successful protocol state should be assumed." hash={hash} />;
}

function State({ status, detail, hash, success = false }: { status: string; detail: string; hash?: string; success?: boolean }) {
  const pending = status === "Signing" || status === "Consensus pending";
  const tone = pending ? "pending" : success ? "success" : status === "Wallet canceled" || status === "Finality unresolved" ? "warning" : "error";
  const activeStage = status === "Signing" ? 0 : status === "Consensus pending" ? 2 : status === "Finalized" ? 4 : 3;
  return (
    <div className={`notice transaction-notice ${tone}`} role={success || pending ? "status" : "alert"}>
      <span className="transaction-orb" aria-hidden="true"><i /></span>
      <div className="transaction-copy"><span className="transaction-label">Protocol transaction</span><strong>{status}</strong><p>{detail}</p>
      <div className="transaction-stage-rail" aria-hidden="true">{["Wallet", "Submitted", "Consensus", "Decision", "Finalized"].map((stage, index) => <span className={index <= activeStage ? "active" : ""} data-label={stage} key={stage} />)}</div>
      {hash ? <p className="mono small mt-24">Transaction: {hash}</p> : null}
      </div>
    </div>
  );
}
