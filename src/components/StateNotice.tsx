type StateNoticeProps = {
  kind?: "warning" | "error" | "success";
  title: string;
  children?: React.ReactNode;
};

export function StateNotice({ kind = "warning", title, children }: StateNoticeProps) {
  return (
    <div className={`notice ${kind}`} role={kind === "error" ? "alert" : "status"}>
      <strong>{title}</strong>
      {children ? <p>{children}</p> : null}
    </div>
  );
}
