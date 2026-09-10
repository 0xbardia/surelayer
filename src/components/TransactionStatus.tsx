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
  return (
    <div className={`notice ${pending ? "pending" : success ? "success" : status === "Wallet canceled" ? "warning" : status === "Finality unresolved" ? "warning" : "error"}`} role={success || pending ? "status" : "alert"}>
      <strong>{status}</strong>
      <p>{detail}</p>
      {hash ? <p className="mono small mt-24">Transaction: {hash}</p> : null}
    </div>
  );
}
