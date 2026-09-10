export type PublicErrorCode =
  | "CONTRACT_NOT_CONFIGURED"
  | "CONFIGURATION_INVALID"
  | "INVALID_INPUT"
  | "RPC_UNAVAILABLE"
  | "WALLET_UNAVAILABLE"
  | "WALLET_REJECTED"
  | "NETWORK_MISMATCH"
  | "TRANSACTION_UNDETERMINED"
  | "TRANSACTION_FAILED"
  | "NOT_FOUND"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  constructor(
    public readonly code: PublicErrorCode,
    message: string,
    public readonly status = 400,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "AppError";
  }
}

export function publicError(error: unknown): { code: PublicErrorCode; message: string } {
  if (error instanceof AppError) return { code: error.code, message: error.message };
  return {
    code: "INTERNAL_ERROR",
    message: "The request could not be completed. Check the network status and retry without resubmitting a wallet transaction.",
  };
}

export function publicStatus(error: unknown, fallback = 500): number {
  return error instanceof AppError ? error.status : fallback;
}

export function logServerError(scope: string, error: unknown) {
  const code = error instanceof AppError ? error.code : "INTERNAL_ERROR";
  const message = error instanceof Error ? error.message.slice(0, 240) : "unknown error";
  console.error(`[${scope}] ${code}: ${message}`);
}
