import { chains } from "genlayer-js";

export type NetworkName = "localnet" | "studionet" | "testnetAsimov" | "testnetBradbury";
export type HexAddress = `0x${string}`;
type Environment = Record<string, string | undefined>;

const NETWORKS: readonly NetworkName[] = ["localnet", "studionet", "testnetAsimov", "testnetBradbury"];

function networkName(value: string | undefined): NetworkName | null {
  const candidate = value?.trim();
  return candidate && NETWORKS.includes(candidate as NetworkName) ? candidate as NetworkName : null;
}

function address(value: string | undefined): HexAddress | null {
  const candidate = value?.trim() ?? "";
  return /^0x[a-fA-F0-9]{40}$/.test(candidate) && !/^0x0{40}$/i.test(candidate)
    ? (candidate as HexAddress)
    : null;
}

function chainId(value: string | undefined): number | null {
  const candidate = value?.trim() ?? "";
  if (!/^\d+$/.test(candidate)) return null;
  const parsed = Number(candidate);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function httpUrl(value: string | undefined, originOnly = false): string | null {
  const candidate = value?.trim() ?? "";
  if (!candidate) return null;
  try {
    const parsed = new URL(candidate);
    if (!/^https?:$/.test(parsed.protocol) || parsed.username || parsed.password || parsed.search || parsed.hash) return null;
    if (originOnly && (parsed.pathname !== "/" || parsed.search || parsed.hash)) return null;
    return originOnly ? parsed.origin : parsed.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export type AppConfig = {
  network: NetworkName | null;
  chainId: number | null;
  contractAddress: HexAddress | null;
  rpcUrl: string | undefined;
  appBaseUrl: string | null;
  protocolTestClaimIds: readonly string[];
  configurationError: string | null;
};

export type ConfiguredAppConfig = AppConfig & {
  network: NetworkName;
  chainId: number;
  contractAddress: HexAddress;
  rpcUrl: string;
  appBaseUrl: string;
  configurationError: null;
};

function runtimeEnvironment(): Environment {
  return {
    GENLAYER_NETWORK: process.env.GENLAYER_NETWORK,
    GENLAYER_CHAIN_ID: process.env.GENLAYER_CHAIN_ID,
    GENLAYER_CONTRACT_ADDRESS: process.env.GENLAYER_CONTRACT_ADDRESS,
    GENLAYER_RPC_URL: process.env.GENLAYER_RPC_URL,
    APP_URL: process.env.APP_URL,
    PROTOCOL_TEST_CLAIM_IDS: process.env.PROTOCOL_TEST_CLAIM_IDS,
    SURELAYER_ALLOW_UNCONFIGURED: process.env.SURELAYER_ALLOW_UNCONFIGURED,
  };
}

export function appConfig(env: Environment = runtimeEnvironment()): AppConfig {
  const networkValue = env.GENLAYER_NETWORK?.trim() ?? "";
  const network = networkName(networkValue);
  const chainIdValue = env.GENLAYER_CHAIN_ID?.trim() ?? "";
  const configuredChainId = chainId(chainIdValue);
  const expectedChainId = network ? Number(chains[network].id) : null;
  const contractValue = env.GENLAYER_CONTRACT_ADDRESS?.trim() ?? "";
  const contractAddress = address(contractValue);
  const rpcUrl = httpUrl(env.GENLAYER_RPC_URL) ?? undefined;
  const appBaseUrl = httpUrl(env.APP_URL, true);
  const issues: string[] = [];

  if (!networkValue) issues.push("GENLAYER_NETWORK is required.");
  else if (!network) issues.push(`GENLAYER_NETWORK must be one of: ${NETWORKS.join(", ")}.`);
  if (!chainIdValue) issues.push("GENLAYER_CHAIN_ID is required.");
  else if (configuredChainId === null) issues.push("GENLAYER_CHAIN_ID must be a positive integer.");
  else if (expectedChainId !== null && configuredChainId !== expectedChainId) {
    issues.push(`GENLAYER_CHAIN_ID must match ${network} (${expectedChainId}).`);
  }
  if (!contractValue && env.SURELAYER_ALLOW_UNCONFIGURED !== "1") {
    issues.push("GENLAYER_CONTRACT_ADDRESS is required.");
  } else if (contractValue && !contractAddress) {
    issues.push("GENLAYER_CONTRACT_ADDRESS must be a non-zero 20-byte hexadecimal address.");
  }
  if (!rpcUrl && env.SURELAYER_ALLOW_UNCONFIGURED !== "1") issues.push("GENLAYER_RPC_URL must be an absolute http(s) URL without credentials, query, or hash.");
  if (!appBaseUrl) issues.push("APP_URL must be an absolute http(s) origin without credentials or a path.");

  return {
    network,
    chainId: configuredChainId,
    contractAddress,
    rpcUrl,
    appBaseUrl,
    protocolTestClaimIds: (env.PROTOCOL_TEST_CLAIM_IDS ?? "")
      .split(",").map((value) => value.trim()).filter(Boolean),
    configurationError: issues[0] ?? null,
  };
}

export type PublicRuntimeConfig = {
  network: NetworkName | null;
  chainId: number | null;
  contractAddress: HexAddress | null;
  rpcUrl: string | null;
  appUrl: string | null;
  protocolTestClaimIds: readonly string[];
  configurationError: string | null;
};

export function publicRuntimeConfig(config = appConfig()): PublicRuntimeConfig {
  return {
    network: config.network,
    chainId: config.chainId,
    contractAddress: config.contractAddress,
    rpcUrl: config.rpcUrl ?? null,
    appUrl: config.appBaseUrl,
    protocolTestClaimIds: config.protocolTestClaimIds,
    configurationError: config.configurationError,
  };
}

function invalidRuntimeConfig(message: string): AppConfig {
  return { network: null, chainId: null, contractAddress: null, rpcUrl: undefined, appBaseUrl: null, protocolTestClaimIds: [], configurationError: message };
}

export async function loadRuntimeConfig(): Promise<AppConfig> {
  if (typeof window === "undefined") return appConfig();
  try {
    const response = await fetch("/api/config", { cache: "no-store" });
    const body = await response.json() as Partial<PublicRuntimeConfig>;
    return appConfig({
      GENLAYER_NETWORK: typeof body.network === "string" ? body.network : undefined,
      GENLAYER_CHAIN_ID: typeof body.chainId === "number" ? String(body.chainId) : undefined,
      GENLAYER_CONTRACT_ADDRESS: typeof body.contractAddress === "string" ? body.contractAddress : undefined,
      GENLAYER_RPC_URL: typeof body.rpcUrl === "string" ? body.rpcUrl : undefined,
      APP_URL: typeof body.appUrl === "string" ? body.appUrl : undefined,
      PROTOCOL_TEST_CLAIM_IDS: Array.isArray(body.protocolTestClaimIds) ? body.protocolTestClaimIds.filter((value): value is string => typeof value === "string").join(",") : undefined,
    });
  } catch {
    return invalidRuntimeConfig("The runtime configuration could not be loaded.");
  }
}

export function configured(config = appConfig()): config is ConfiguredAppConfig {
  return Boolean(
    config.contractAddress &&
    config.network &&
    config.chainId !== null &&
    config.rpcUrl &&
    config.appBaseUrl &&
    !config.configurationError,
  );
}

export function requirePublicOrigin(config = appConfig()): string {
  if (!config.appBaseUrl) {
    throw new Error("SureLayer configuration error: APP_URL must be an absolute http(s) origin.");
  }
  return config.appBaseUrl;
}

export function assertBuildConfiguration(env: Environment = runtimeEnvironment()): void {
  const config = appConfig(env);
  if (config.configurationError) throw new Error(`SureLayer configuration error: ${config.configurationError}`);
}
