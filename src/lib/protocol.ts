import { readMethod } from "./genlayer";
import { appConfig } from "./config";
import { AppError } from "./errors";

export type ProtocolConfig = {
  minClaimBond: bigint;
  challengeBond: bigint;
  challengeWindowSeconds: bigint;
  resolutionTimeoutSeconds: bigint;
  maxStatement: number;
  maxCriteria: number;
  maxSources: number;
  maxPageSize: number;
};

export type ProtocolStats = {
  claimCount: bigint;
  totalLocked: bigint;
  totalCredits: bigint;
  contractBalance: bigint;
};

export type ClaimSummary = {
  id: string;
  issuer: string;
  statement: string;
  claimBond: bigint;
  createdAt: bigint;
  challengeDeadline: bigint;
  state: number;
  stateName: string;
  challenger: string;
  verdict: string;
  protocolTest?: boolean;
};

export type TimelineEvent = { event: string; timestamp: bigint; actor: string };

export type ClaimDetail = ClaimSummary & {
  artifactRef: string;
  artifactHash: string;
  criteria: string;
  challengeReason: string;
  challengeBond: bigint;
  challengedAt: bigint;
  resolutionDeadline: bigint;
  evidenceState: string;
  criteriaMet: boolean;
  supportingSourceCount: number;
  resolutionSummary: string;
  resolvedAt: bigint;
  settlementDone: boolean;
  issuerSources: string[];
  challengerSources: string[];
  timeline: TimelineEvent[];
};

export type ProtocolReadState = {
  configured: boolean;
  readable: boolean;
  network: string;
  chainId: number | null;
  contractAddress: string | null;
  config?: ProtocolConfig;
  stats?: ProtocolStats;
  error?: { code: string; message: string };
};

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new AppError("INTERNAL_ERROR", "The API returned an invalid object.", 502);
  return value as Record<string, unknown>;
}

function tuple(value: unknown, name: string): unknown[] {
  if (!Array.isArray(value)) throw new AppError("INTERNAL_ERROR", `The contract returned an invalid ${name} shape.`, 502);
  return value;
}

function big(value: unknown): bigint {
  if (typeof value === "bigint") return value;
  if (typeof value === "number" && Number.isFinite(value)) return BigInt(value);
  if (typeof value === "string" && /^\d+$/.test(value)) return BigInt(value);
  throw new AppError("INTERNAL_ERROR", "The contract returned an invalid numeric field.", 502);
}

function text(value: unknown): string {
  return typeof value === "string" ? value : String(value ?? "");
}

function bool(value: unknown): boolean {
  return value === true || value === 1 || value === "true";
}

function state(value: unknown): number {
  const numeric = Number(big(value));
  return Number.isSafeInteger(numeric) ? numeric : 0;
}

export function parseProtocolState(value: unknown): ProtocolReadState {
  const raw = record(value);
  const configRaw = raw.config ? record(raw.config) : null;
  const statsRaw = raw.stats ? record(raw.stats) : null;
  return {
    configured: raw.configured === true,
    readable: raw.readable === true,
    network: text(raw.network),
    chainId: raw.chainId === null || raw.chainId === undefined ? null : Number(big(raw.chainId)),
    contractAddress: typeof raw.contractAddress === "string" ? raw.contractAddress : null,
    ...(configRaw ? { config: {
      minClaimBond: big(configRaw.minClaimBond), challengeBond: big(configRaw.challengeBond),
      challengeWindowSeconds: big(configRaw.challengeWindowSeconds), resolutionTimeoutSeconds: big(configRaw.resolutionTimeoutSeconds),
      maxStatement: Number(big(configRaw.maxStatement)), maxCriteria: Number(big(configRaw.maxCriteria)),
      maxSources: Number(big(configRaw.maxSources)), maxPageSize: Number(big(configRaw.maxPageSize)),
    } } : {}),
    ...(statsRaw ? { stats: {
      claimCount: big(statsRaw.claimCount), totalLocked: big(statsRaw.totalLocked),
      totalCredits: big(statsRaw.totalCredits), contractBalance: big(statsRaw.contractBalance),
    } } : {}),
    ...(raw.error && typeof raw.error === "object" ? { error: raw.error as { code: string; message: string } } : {}),
  };
}

export function parseClaimSummary(value: unknown): ClaimSummary {
  const raw = record(value);
  const stateValue = state(raw.state);
  return {
    id: big(raw.id).toString(), issuer: text(raw.issuer), statement: text(raw.statement), claimBond: big(raw.claimBond),
    createdAt: big(raw.createdAt), challengeDeadline: big(raw.challengeDeadline), state: stateValue,
    stateName: text(raw.stateName) || stateName(stateValue), challenger: text(raw.challenger), verdict: text(raw.verdict),
    protocolTest: raw.protocolTest === true,
  };
}

export function parseClaimDetail(value: unknown): ClaimDetail {
  const raw = record(value);
  return {
    ...parseClaimSummary(raw), artifactRef: text(raw.artifactRef), artifactHash: text(raw.artifactHash), criteria: text(raw.criteria),
    challengeReason: text(raw.challengeReason), challengeBond: big(raw.challengeBond), challengedAt: big(raw.challengedAt),
    resolutionDeadline: big(raw.resolutionDeadline), evidenceState: text(raw.evidenceState), criteriaMet: bool(raw.criteriaMet),
    supportingSourceCount: Number(big(raw.supportingSourceCount)), resolutionSummary: text(raw.resolutionSummary), resolvedAt: big(raw.resolvedAt),
    settlementDone: bool(raw.settlementDone), issuerSources: Array.isArray(raw.issuerSources) ? raw.issuerSources.map(text) : [],
    challengerSources: Array.isArray(raw.challengerSources) ? raw.challengerSources.map(text) : [],
    timeline: Array.isArray(raw.timeline) ? raw.timeline.map((entry) => { const item = record(entry); return { event: text(item.event), timestamp: big(item.timestamp), actor: text(item.actor) }; }) : [],
  };
}

const STATE_NAMES: Record<number, string> = {
  1: "OPEN",
  2: "CHALLENGED",
  3: "SUPPORTED",
  4: "BREACHED",
  5: "INCONCLUSIVE",
  6: "UNCHALLENGED_FINALIZED",
  7: "TIMEOUT_RECOVERED",
};

export function stateName(value: unknown): string {
  return STATE_NAMES[state(value)] ?? "UNKNOWN";
}

export function formatGen(value: bigint): string {
  const whole = value / 10n ** 18n;
  const fraction = (value % 10n ** 18n).toString().padStart(18, "0").slice(0, 4).replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole.toString();
}

export function formatDate(value: bigint): string {
  if (value === 0n) return "—";
  return new Date(Number(value) * 1000).toLocaleString("en", { dateStyle: "medium", timeStyle: "short" });
}

export async function protocolConfig(): Promise<ProtocolConfig> {
  const raw = tuple(await readMethod("get_config"), "configuration");
  return {
    minClaimBond: big(raw[0]),
    challengeBond: big(raw[1]),
    challengeWindowSeconds: big(raw[2]),
    resolutionTimeoutSeconds: big(raw[3]),
    maxStatement: Number(big(raw[4])),
    maxCriteria: Number(big(raw[5])),
    maxSources: Number(big(raw[6])),
    maxPageSize: Number(big(raw[7])),
  };
}

export async function protocolStats(): Promise<ProtocolStats> {
  const raw = tuple(await readMethod("get_protocol_stats"), "protocol statistics");
  return { claimCount: big(raw[0]), totalLocked: big(raw[1]), totalCredits: big(raw[2]), contractBalance: big(raw[3]) };
}

function summary(rawValue: unknown): ClaimSummary {
  const raw = tuple(rawValue, "claim summary");
  const stateValue = state(raw[6]);
  return {
    id: big(raw[0]).toString(),
    issuer: text(raw[1]),
    statement: text(raw[2]),
    claimBond: big(raw[3]),
    createdAt: big(raw[4]),
    challengeDeadline: big(raw[5]),
    state: stateValue,
    stateName: stateName(stateValue),
    challenger: text(raw[7]),
    verdict: text(raw[8]),
  };
}

export async function claimPage(offset = 0, limit = 12): Promise<ClaimSummary[]> {
  const raw = tuple(await readMethod("list_claims", [offset, limit]), "claim page");
  return raw.map(summary);
}

export async function claimDetail(id: string): Promise<ClaimDetail> {
  if (!/^\d{1,8}$/.test(id) || id === "0") throw new AppError("INVALID_INPUT", "Claim IDs are positive numbers.", 400);
  const claimId = Number(id);
  const stats = await protocolStats();
  if (BigInt(claimId) > stats.claimCount) throw new AppError("NOT_FOUND", `Claim ${claimId} does not exist.`, 404);
  const [claimRaw, evidenceRaw, timelineRaw] = await Promise.all([
    readMethod("get_claim", [claimId]),
    readMethod("get_claim_evidence", [claimId]),
    readMethod("get_claim_timeline", [claimId]),
  ]);
  const raw = tuple(claimRaw, "claim detail");
  const stateValue = state(raw[9]);
  const evidence = tuple(evidenceRaw, "claim evidence");
  const timeline = tuple(timelineRaw, "claim timeline").map((item) => {
    const event = tuple(item, "timeline event");
    return { event: text(event[0]), timestamp: big(event[1]), actor: text(event[2]) };
  });
  return {
    id: big(raw[0]).toString(),
    issuer: text(raw[1]),
    statement: text(raw[2]),
    artifactRef: text(raw[3]),
    artifactHash: text(raw[4]),
    criteria: text(raw[5]),
    claimBond: big(raw[6]),
    createdAt: big(raw[7]),
    challengeDeadline: big(raw[8]),
    state: stateValue,
    stateName: stateName(stateValue),
    challenger: text(raw[10]),
    challengeReason: text(raw[11]),
    challengeBond: big(raw[12]),
    challengedAt: big(raw[13]),
    resolutionDeadline: big(raw[14]),
    verdict: text(raw[15]),
    evidenceState: text(raw[16]),
    criteriaMet: bool(raw[17]),
    supportingSourceCount: Number(big(raw[18])),
    resolutionSummary: text(raw[19]),
    resolvedAt: big(raw[20]),
    settlementDone: bool(raw[21]),
    issuerSources: Array.isArray(evidence[0]) ? evidence[0].map(text) : [],
    challengerSources: Array.isArray(evidence[1]) ? evidence[1].map(text) : [],
    timeline,
  };
}

export async function protocolReadState(): Promise<ProtocolReadState> {
  const config = appConfig();
  const base = {
    configured: Boolean(config.contractAddress) && !config.configurationError,
    readable: false,
    network: config.network ?? "unconfigured",
    chainId: config.chainId,
    contractAddress: config.contractAddress,
  };
  if (config.configurationError) {
    return { ...base, error: { code: "CONFIGURATION_INVALID", message: config.configurationError } };
  }
  if (!config.contractAddress) return base;
  try {
    const [chainConfig, stats] = await Promise.all([protocolConfig(), protocolStats()]);
    return { ...base, readable: true, config: chainConfig, stats };
  } catch {
    // Do not expose provider URLs, request details, or stack-derived messages
    // through the public status and health endpoints.
    return { ...base, error: { code: "RPC_UNAVAILABLE", message: "The configured GenLayer contract could not be read." } };
  }
}
