import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { chains, createClient } from "genlayer-js";
import { TransactionHashVariant } from "genlayer-js/types";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FINAL_CONTRACT_ADDRESS = "0x4F8a90c42E04f194415fdd86aE26D379a5fACF51";
const env = parseEnv(await readFile(path.join(root, ".env"), "utf8"));
const failures = [];

function parseEnv(source) {
  return Object.fromEntries(source.split(/\r?\n/).flatMap((line) => {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) return [];
    const value = match[2].trim();
    return [[match[1], value.replace(/^("|')(.*)\1$/, "$2")]];
  }));
}

function pass(message) {
  console.log(`PASS ${message}`);
}

function fail(message) {
  failures.push(message);
  console.error(`FAIL ${message}`);
}

function required(name) {
  const value = env[name]?.trim();
  if (!value) fail(`${name} is missing`);
  return value ?? "";
}

function validAddress(value) {
  return /^0x[a-fA-F0-9]{40}$/.test(value) && !/^0x0{40}$/i.test(value);
}

function sameAddress(left, right) {
  return typeof left === "string" && left.toLowerCase() === right.toLowerCase();
}

const network = required("GENLAYER_NETWORK");
const chainIdText = required("GENLAYER_CHAIN_ID");
const contractAddress = required("GENLAYER_CONTRACT_ADDRESS");
const rpcUrl = required("GENLAYER_RPC_URL");
const appUrl = (process.env.SURELAYER_VERIFY_URL ?? required("APP_URL")).replace(/\/$/, "");

if (!validAddress(contractAddress)) fail("GENLAYER_CONTRACT_ADDRESS is not a non-zero 20-byte hexadecimal address");
if (!sameAddress(contractAddress, FINAL_CONTRACT_ADDRESS)) fail(`GENLAYER_CONTRACT_ADDRESS must be the final contract ${FINAL_CONTRACT_ADDRESS}`);
const chainId = Number(chainIdText);
if (!/^\d+$/.test(chainIdText) || !Number.isSafeInteger(chainId) || chainId <= 0) fail("GENLAYER_CHAIN_ID is not a positive integer");
if (!Object.hasOwn(chains, network)) fail(`GENLAYER_NETWORK is not a supported SDK network: ${network}`);
if (Object.hasOwn(chains, network) && chainId !== Number(chains[network].id)) fail(`GENLAYER_CHAIN_ID does not match ${network}`);

try {
  const parsed = new URL(rpcUrl);
  if (!/^https?:$/.test(parsed.protocol) || parsed.username || parsed.password || parsed.search || parsed.hash) fail("GENLAYER_RPC_URL is not a credential-free http(s) URL");
} catch {
  fail("GENLAYER_RPC_URL is not a valid URL");
}

try {
  const parsed = new URL(appUrl);
  if (!/^https?:$/.test(parsed.protocol) || parsed.username || parsed.password || parsed.pathname !== "/" || parsed.search || parsed.hash) fail("APP_URL is not a credential-free origin");
} catch {
  fail("APP_URL is not a valid URL");
}

pass(`.env contract ${contractAddress}`);
pass(`.env network ${network} / chain ${chainIdText}`);

async function endpoint(pathname) {
  const response = await fetch(`${appUrl}${pathname}`, { cache: "no-store" });
  let body;
  try {
    body = await response.json();
  } catch {
    throw new Error(`${pathname} returned non-JSON HTTP ${response.status}`);
  }
  return { response, body };
}

try {
  const { response, body } = await endpoint("/api/config");
  if (response.status !== 200) fail(`/api/config returned HTTP ${response.status}`);
  if (!sameAddress(body.contractAddress, contractAddress)) fail("runtime/public config contract does not match .env");
  if (body.network !== network || body.chainId !== chainId) fail("runtime/public config network or chain does not match .env");
  if (body.rpcUrl !== rpcUrl) fail("runtime/public config RPC does not match .env");
  if (!body.configurationError) pass("runtime/public config matches .env");
  else fail("runtime/public config reports a configuration error");
} catch (error) {
  fail(`runtime/public config unavailable: ${error instanceof Error ? error.message.slice(0, 160) : "request failed"}`);
}

try {
  const { response, body } = await endpoint("/api/health");
  if (response.status !== 200) fail(`/api/health returned HTTP ${response.status}`);
  if (body.application !== "ok" || body.rpc !== "ok" || body.contract !== "readable") fail("health does not report APP_OK/RPC_OK/CONTRACT_READABLE");
  if (!sameAddress(body.contractAddress, contractAddress)) fail("health contract does not match .env");
  if (body.network !== network || body.chainId !== chainId) fail("health network or chain does not match .env");
  if (body.application === "ok" && body.rpc === "ok" && body.contract === "readable") pass("health is readable and matches .env");
} catch (error) {
  fail(`health unavailable: ${error instanceof Error ? error.message.slice(0, 160) : "request failed"}`);
}

if (validAddress(contractAddress) && Object.hasOwn(chains, network) && chainId === Number(chains[network].id)) {
  const client = createClient({ chain: chains[network], endpoint: rpcUrl });
  const schema = await client.getContractSchema(contractAddress);
  const methods = schema && typeof schema === "object" && schema.methods && typeof schema.methods === "object" ? schema.methods : {};
  const reads = {
    get_config: 0,
    state_name: 1,
    get_protocol_stats: 0,
    get_credit: 1,
    get_my_credit: 0,
    get_claim: 1,
    get_claim_evidence: 1,
    get_claim_timeline: 1,
    list_claims: 2,
  };
  const writes = {
    create_claim: 6,
    challenge_claim: 4,
    resolve_claim: 1,
    finalize_unchallenged: 1,
    recover_challenge_timeout: 1,
    withdraw_credit: 0,
  };
  for (const [name, parameterCount] of Object.entries(reads)) {
    const method = methods[name];
    if (!method || method.readonly !== true || !Array.isArray(method.params) || method.params.length !== parameterCount) fail(`read schema mismatch: ${name}`);
    else pass(`read schema ${name}`);
  }
  for (const [name, parameterCount] of Object.entries(writes)) {
    const method = methods[name];
    if (!method || method.readonly !== false || !Array.isArray(method.params) || method.params.length !== parameterCount) fail(`write schema mismatch: ${name}`);
    else pass(`write schema ${name}`);
  }

  const probes = [
    ["get_config", []],
    ["state_name", [1]],
    ["get_protocol_stats", []],
    ["get_credit", ["0x0000000000000000000000000000000000000001"]],
    ["get_my_credit", []],
    ["list_claims", [0, 1]],
  ];
  for (const [name, args] of probes) {
    await client.readContract({ address: contractAddress, functionName: name, args, transactionHashVariant: TransactionHashVariant.LATEST_FINAL });
    pass(`live read ${name} targets ${contractAddress}`);
  }

  const stats = await client.readContract({ address: contractAddress, functionName: "get_protocol_stats", args: [], transactionHashVariant: TransactionHashVariant.LATEST_FINAL });
  const claimCount = Number(Array.isArray(stats) ? stats[0] : stats);
  for (const name of ["get_claim", "get_claim_evidence", "get_claim_timeline"]) {
    if (claimCount > 0) {
      await client.readContract({ address: contractAddress, functionName: name, args: [1], transactionHashVariant: TransactionHashVariant.LATEST_FINAL });
      pass(`live read ${name} targets ${contractAddress}`);
    } else {
      pass(`live read ${name} schema verified; detail probe skipped because claim count is zero`);
    }
  }
}

if (failures.length) {
  console.error(`${failures.length} runtime verification failure(s)`);
  process.exitCode = 1;
} else {
  console.log("Runtime configuration verification complete");
}
