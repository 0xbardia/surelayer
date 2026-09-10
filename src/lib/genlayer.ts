import { chains, createClient } from "genlayer-js";
import {
  TransactionHashVariant,
  TransactionStatus,
  type CalldataEncodable,
  type GenLayerTransaction,
  type Hash,
} from "genlayer-js/types";

import { appConfig, loadRuntimeConfig, type AppConfig, type ConfiguredAppConfig, type HexAddress } from "./config";
import { AppError } from "./errors";

export type BrowserProvider = {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
};

export async function requestWalletAccount(provider: BrowserProvider): Promise<HexAddress> {
  try {
    const value = await provider.request({ method: "eth_requestAccounts" });
    const account = Array.isArray(value) ? value[0] : undefined;
    if (typeof account !== "string" || !/^0x[a-fA-F0-9]{40}$/.test(account)) {
      throw new AppError("WALLET_UNAVAILABLE", "The connected wallet returned no usable account.", 400);
    }
    return account as HexAddress;
  } catch (error) {
    if (error instanceof AppError) throw error;
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (message.includes("reject") || message.includes("denied") || message.includes("cancel")) {
      throw new AppError("WALLET_REJECTED", "The wallet canceled the connection. No protocol state changed.", 400, { cause: error });
    }
    throw new AppError("WALLET_UNAVAILABLE", "The wallet could not provide an account.", 400, { cause: error });
  }
}

function chainFor(network: ConfiguredAppConfig["network"]) {
  return chains[network];
}

function client(config: AppConfig, provider?: BrowserProvider, account?: HexAddress) {
  const valid = requireConfiguration(config);
  return createClient({
    chain: chainFor(valid.network),
    endpoint: valid.rpcUrl,
    ...(account ? { account } : {}),
    ...(provider ? { provider: provider as never } : {}),
  });
}

async function walletAccount(provider: BrowserProvider): Promise<HexAddress> {
  const value = await provider.request({ method: "eth_accounts" });
  const account = Array.isArray(value) ? value[0] : undefined;
  if (typeof account !== "string" || !/^0x[a-fA-F0-9]{40}$/.test(account)) {
    throw new AppError("WALLET_UNAVAILABLE", "The connected wallet returned no usable account.", 400);
  }
  return account as HexAddress;
}

async function assertWalletNetwork(config: AppConfig, provider: BrowserProvider) {
  const valid = requireConfiguration(config);
  const chainId = await provider.request({ method: "eth_chainId" });
  const expected = `0x${valid.chainId.toString(16)}`;
  if (typeof chainId !== "string" || chainId.toLowerCase() !== expected) {
    throw new AppError(
      "NETWORK_MISMATCH",
      `Switch the wallet to ${chainFor(valid.network).name} (${expected}) before signing.`,
      400,
    );
  }
}

function requireAddress(config = appConfig()): HexAddress {
  const valid = requireConfiguration(config);
  return valid.contractAddress;
}

function requireConfiguration(config: AppConfig): ConfiguredAppConfig {
  if (config.configurationError) {
    throw new AppError("CONFIGURATION_INVALID", config.configurationError, 503);
  }
  if (!config.contractAddress) {
    throw new AppError("CONTRACT_NOT_CONFIGURED", "This deployment has not been configured yet.", 503);
  }
  if (!config.network || config.chainId === null || !config.rpcUrl || !config.appBaseUrl) {
    throw new AppError("CONFIGURATION_INVALID", "The GenLayer network, chain ID, RPC endpoint, contract address, and public origin must be configured before use.", 503);
  }
  return config as ConfiguredAppConfig;
}

// Only immutable reads are cached. Mutable balances, claims, timelines, and
// protocol totals must reflect the latest finalized state after a write.
const READ_CACHE_TTL_MS = 30000;
const READ_CACHE_MAX_ENTRIES = 256;
const CACHEABLE_READS = new Set(["get_config", "state_name"]);
const readCache = new Map<string, { expiresAt: number; value: CalldataEncodable }>();
const readPending = new Map<string, Promise<CalldataEncodable>>();
const PENDING_WRITE_PREFIX = "surelayer.pending-write:";
const LEGACY_PENDING_WRITE_KEY = "surelayer.pending-write";

export type PendingWrite = {
  hash: string;
  network: AppConfig["network"];
  contractAddress: string;
  account: HexAddress | "";
  action: string;
};

function pendingStorageKey(config: AppConfig, account: HexAddress, action: string) {
  return `${PENDING_WRITE_PREFIX}${config.network}:${config.contractAddress?.toLowerCase() ?? ""}:${account.toLowerCase()}:${encodeURIComponent(action)}`;
}

function parsePendingWrite(raw: string | null): Partial<PendingWrite> | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<PendingWrite>;
    return typeof value.hash === "string" && value.hash.length > 0 ? value : null;
  } catch {
    return null;
  }
}

function pendingWrite(config: AppConfig, account: HexAddress, action: string): PendingWrite | null {
  if (typeof window === "undefined") return null;
  try {
    const value = parsePendingWrite(window.localStorage.getItem(pendingStorageKey(config, account, action)));
    if (value && value.network === config.network && value.contractAddress?.toLowerCase() === config.contractAddress?.toLowerCase() && value.account?.toLowerCase() === account.toLowerCase() && value.action === action) {
      return { hash: value.hash!, network: config.network, contractAddress: config.contractAddress ?? "", account, action };
    }
    const legacy = parsePendingWrite(window.localStorage.getItem(LEGACY_PENDING_WRITE_KEY));
    if (legacy && legacy.network === config.network && legacy.contractAddress?.toLowerCase() === config.contractAddress?.toLowerCase()) {
      // Legacy records predate wallet/action namespacing. Keep them as a
      // global safety stop until their lifecycle is explicitly reconciled.
      return { hash: legacy.hash!, network: config.network, contractAddress: config.contractAddress ?? "", account: "", action: "*" };
    }
    return null;
  } catch {
    return null;
  }
}

export function pendingWriteForAction(config: AppConfig, action: string): PendingWrite | null {
  if (typeof window === "undefined" || !config.contractAddress) return null;
  try {
    const prefix = `${PENDING_WRITE_PREFIX}${config.network}:${config.contractAddress.toLowerCase()}:`;
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (!key?.startsWith(prefix)) continue;
      const value = parsePendingWrite(window.localStorage.getItem(key));
      if (value?.network === config.network && value.contractAddress?.toLowerCase() === config.contractAddress.toLowerCase() && value.action === action && typeof value.account === "string" && /^0x[a-fA-F0-9]{40}$/.test(value.account)) {
        return { hash: value.hash!, network: config.network, contractAddress: config.contractAddress, account: value.account as HexAddress, action };
      }
    }
    const legacy = parsePendingWrite(window.localStorage.getItem(LEGACY_PENDING_WRITE_KEY));
    if (legacy && legacy.network === config.network && legacy.contractAddress?.toLowerCase() === config.contractAddress.toLowerCase()) {
      return { hash: legacy.hash!, network: config.network, contractAddress: config.contractAddress, account: "", action: "*" };
    }
    return null;
  } catch {
    return null;
  }
}

function rememberPendingWrite(config: AppConfig, hash: string, account: HexAddress, action: string) {
  if (typeof window === "undefined" || !config.contractAddress) return;
  try {
    const pending = { hash, network: config.network, contractAddress: config.contractAddress, account, action } satisfies PendingWrite;
    window.localStorage.setItem(pendingStorageKey(config, account, action), JSON.stringify(pending));
  } catch { /* storage is a safety aid, not a write prerequisite */ }
}

function forgetPendingWrite(config: AppConfig, hash: string, account: HexAddress | "", action: string) {
  if (typeof window === "undefined") return;
  try {
    if (account) {
      const key = pendingStorageKey(config, account, action);
      const current = parsePendingWrite(window.localStorage.getItem(key));
      if (current?.hash === hash) window.localStorage.removeItem(key);
    }
    const legacy = parsePendingWrite(window.localStorage.getItem(LEGACY_PENDING_WRITE_KEY));
    if (legacy?.hash === hash) window.localStorage.removeItem(LEGACY_PENDING_WRITE_KEY);
  } catch { /* ignore storage cleanup failures */ }
}

function readCacheKey(functionName: string, args: CalldataEncodable[], config: AppConfig): string {
  return `${config.network}:${config.contractAddress ?? ""}:${functionName}:${JSON.stringify(args, (_, value) => typeof value === "bigint" ? `${value}n` : value)}`;
}

export async function readMethod(
  functionName: string,
  args: CalldataEncodable[] = [],
  config = appConfig(),
): Promise<CalldataEncodable> {
  requireConfiguration(config);
  const key = readCacheKey(functionName, args, config);
  const cacheable = CACHEABLE_READS.has(functionName);
  const cached = cacheable ? readCache.get(key) : undefined;
  if (cached && cached.expiresAt > Date.now()) return cached.value;
  const pending = readPending.get(key);
  if (pending) return pending;
  const rpc = client(config);
  const request = (async () => {
    try {
      const value = await rpc.readContract({
        address: requireAddress(config),
        functionName,
        args,
        transactionHashVariant: TransactionHashVariant.LATEST_FINAL,
      });
      if (cacheable) {
        const now = Date.now();
        for (const [entry, item] of readCache) if (item.expiresAt <= now) readCache.delete(entry);
        if (readCache.size >= READ_CACHE_MAX_ENTRIES) {
          const oldest = readCache.keys().next().value;
          if (oldest) readCache.delete(oldest);
        }
        readCache.set(key, { expiresAt: now + READ_CACHE_TTL_MS, value });
      }
      return value;
    } catch (error) {
      throw new AppError("RPC_UNAVAILABLE", "The final GenLayer state could not be read. Retry without resubmitting a transaction.", 503, { cause: error });
    } finally {
      readPending.delete(key);
    }
  })();
  readPending.set(key, request);
  return request;
}

export type WriteReceipt = {
  hash: string;
  status: string;
  execution: string;
  result: string;
  transaction: GenLayerTransaction;
};

type StableReceiptShape = {
  statusName?: unknown;
  status_name?: unknown;
  resultName?: unknown;
  result_name?: unknown;
  status?: unknown;
  txExecutionResultName?: unknown;
  tx_execution_result?: unknown;
  consensus_data?: {
    leader_receipt?: Array<{
      execution_result?: unknown;
      genvm_result?: { execution_result?: unknown };
      result?: { status?: unknown } | string;
    }>;
  };
};

export function classifyFinalReceipt(transaction: GenLayerTransaction) {
  const receipt = transaction as unknown as StableReceiptShape;
  const status = String(receipt.statusName ?? receipt.status_name ?? receipt.status ?? "UNKNOWN");
  const result = String(receipt.resultName ?? receipt.result_name ?? "UNKNOWN");
  const directExecution = String(receipt.txExecutionResultName ?? "");
  const leader = receipt.consensus_data?.leader_receipt?.[0];
  const genvmExecution = String(leader?.genvm_result?.execution_result ?? leader?.execution_result ?? "");
  const resultStatus = typeof leader?.result === "object" && leader.result !== null
    ? String(leader.result.status ?? "")
    : String(leader?.result ?? "");
  const execution = directExecution || (genvmExecution === "SUCCESS" || resultStatus === "return"
    ? "FINISHED_WITH_RETURN"
    : genvmExecution === "ERROR" || resultStatus === "rollback"
      ? "FINISHED_WITH_ERROR"
      : "UNKNOWN");
  return { status, result, execution, finalized: status === TransactionStatus.FINALIZED || status === "7" };
}

export type TransactionState = "idle" | "submitting" | "waiting" | "success" | "rejected" | "failed" | "undetermined";

export function transactionErrorState(error: unknown): Exclude<TransactionState, "idle" | "submitting" | "waiting" | "success"> {
  if (error instanceof AppError) {
    if (error.code === "WALLET_REJECTED") return "rejected";
    if (error.code === "TRANSACTION_UNDETERMINED") return "undetermined";
  }
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  return message.includes("reject") || message.includes("denied") || message.includes("cancel") ? "rejected" : "failed";
}

type WriteOptions = {
  onSubmitted?: (hash: string) => void;
};

async function reconcilePendingWrite(config: AppConfig, previous: PendingWrite): Promise<void> {
  const rpc = client(config);
  try {
    const transaction = await rpc.getTransaction({ hash: previous.hash as Hash });
    const lifecycle = classifyFinalReceipt(transaction);
    if (lifecycle.finalized && lifecycle.execution === "FINISHED_WITH_RETURN") {
      forgetPendingWrite(config, previous.hash, previous.account, previous.action);
      throw new AppError("TRANSACTION_UNDETERMINED", `A previous transaction (${previous.hash}) finalized successfully. Read the chain state before retrying.`, 409);
    }
    if (lifecycle.finalized && lifecycle.execution === "FINISHED_WITH_ERROR") {
      forgetPendingWrite(config, previous.hash, previous.account, previous.action);
    } else if (["CANCELED", "UNDETERMINED", "LEADER_TIMEOUT", "VALIDATORS_TIMEOUT"].includes(lifecycle.status)) {
      forgetPendingWrite(config, previous.hash, previous.account, previous.action);
    } else {
      throw new AppError("TRANSACTION_UNDETERMINED", `A previous transaction (${previous.hash}) is still unresolved. Read its lifecycle before submitting another action.`, 409);
    }
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("TRANSACTION_UNDETERMINED", `A previous transaction (${previous.hash}) could not be verified. Read its lifecycle before submitting another action.`, 409, { cause: error });
  }
}

async function finalizeWrite(
  config: AppConfig,
  hash: string,
  account: HexAddress | "",
  action: string,
  provider?: BrowserProvider,
): Promise<WriteReceipt> {
  try {
    const rpc = client(config, provider, account || undefined);
    const transaction = await rpc.waitForTransactionReceipt({
      hash: hash as Hash,
      status: TransactionStatus.FINALIZED,
      interval: 3000,
      retries: 120,
    });
    const lifecycle = classifyFinalReceipt(transaction);
    if (lifecycle.finalized && lifecycle.execution === "FINISHED_WITH_ERROR") {
      forgetPendingWrite(config, hash, account, action);
      throw new AppError("TRANSACTION_FAILED", `The final contract execution failed (${lifecycle.result}). No successful protocol state should be assumed.`, 409);
    }
    if (!lifecycle.finalized || lifecycle.execution !== "FINISHED_WITH_RETURN") {
      throw new AppError("TRANSACTION_UNDETERMINED", "GenLayer did not establish a successful final decision. Read the claim before retrying.", 409);
    }
    forgetPendingWrite(config, hash, account, action);
    return { hash, status: lifecycle.status, execution: lifecycle.execution, result: lifecycle.result, transaction };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("TRANSACTION_UNDETERMINED", "The transaction is still unresolved. Check its lifecycle before submitting again.", 409, { cause: error });
  }
}

export async function resumePendingWrite(functionName: string, config?: AppConfig): Promise<WriteReceipt | null> {
  const activeConfig = config ?? (typeof window === "undefined" ? appConfig() : await loadRuntimeConfig());
  requireConfiguration(activeConfig);
  const pending = pendingWriteForAction(activeConfig, functionName);
  if (!pending) return null;
  return finalizeWrite(activeConfig, pending.hash, pending.account, functionName);
}

export async function submitWrite(
  functionName: string,
  args: CalldataEncodable[],
  value: bigint,
  provider: BrowserProvider,
  options: WriteOptions = {},
  config?: AppConfig,
): Promise<WriteReceipt> {
  const activeConfig = config ?? (typeof window === "undefined" ? appConfig() : await loadRuntimeConfig());
  const address = requireAddress(activeConfig);
  let hash: string;
  let account: HexAddress;
  try {
    account = await walletAccount(provider);
    const previous = pendingWrite(activeConfig, account, functionName);
    if (previous) await reconcilePendingWrite(activeConfig, previous);
    await assertWalletNetwork(activeConfig, provider);
    const rpc = client(activeConfig, provider, account);
    hash = String(
      await rpc.writeContract({
        address,
        functionName,
        args,
        value,
      }),
    );
    rememberPendingWrite(activeConfig, hash, account, functionName);
    options.onSubmitted?.(hash);
  } catch (error) {
    if (error instanceof AppError) throw error;
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (message.includes("reject") || message.includes("denied") || message.includes("cancel")) {
      throw new AppError("WALLET_REJECTED", "The wallet canceled the signature. No protocol state changed; your form is still safe to retry.", 400, { cause: error });
    }
    throw new AppError("TRANSACTION_FAILED", "The wallet could not submit this action. Check the selected network and fee balance before retrying.", 400, { cause: error });
  }
  return finalizeWrite(activeConfig, hash, account, functionName, provider);
}
