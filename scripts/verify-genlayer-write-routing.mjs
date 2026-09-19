import { readFile } from "node:fs/promises";
import { abi, chains, createClient } from "genlayer-js";
import { decodeFunctionData, fromHex, fromRlp } from "viem";

const root = new URL("..", import.meta.url);
const FINAL_CONTRACT_ADDRESS = "0x4F8a90c42E04f194415fdd86aE26D379a5fACF51";
const envText = await readFile(new URL(".env", root), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).flatMap((line) => {
  const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
  return match ? [[match[1], match[2].trim().replace(/^("|')(.*)\1$/, "$2")]] : [];
}));

const network = env.GENLAYER_NETWORK;
const chainId = Number(env.GENLAYER_CHAIN_ID);
const contractAddress = env.GENLAYER_CONTRACT_ADDRESS;
const rpcUrl = env.GENLAYER_RPC_URL;
if (!network || !Object.hasOwn(chains, network)) throw new Error("GENLAYER_NETWORK is not a supported SDK network");
if (!Number.isSafeInteger(chainId) || chainId !== Number(chains[network].id)) throw new Error("GENLAYER_CHAIN_ID does not match the configured SDK network");
if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress ?? "") || /^0x0{40}$/i.test(contractAddress)) throw new Error("GENLAYER_CONTRACT_ADDRESS is not a non-zero address");
if (contractAddress.toLowerCase() !== FINAL_CONTRACT_ADDRESS.toLowerCase()) throw new Error(`GENLAYER_CONTRACT_ADDRESS must be the final contract ${FINAL_CONTRACT_ADDRESS}`);
if (!rpcUrl) throw new Error("GENLAYER_RPC_URL is missing");

// This address is used only as a decoded sender in a capture-only provider.
// No private key is loaded and no transaction is submitted.
const captureAccount = "0x3333333333333333333333333333333333333333";
const writes = [
  { action: "create_claim", args: ["Runtime Contract routing proof", "", "", "The referenced page states that GenLayer transactions use a consensus submission router.", [], []], value: 1000000000000000000n },
  { action: "challenge_claim", args: [1, "Contract routing challenge proof", [], []], value: 500000000000000000n },
  { action: "resolve_claim", args: [1], value: 0n },
  { action: "finalize_unchallenged", args: [1], value: 0n },
  { action: "recover_challenge_timeout", args: [1], value: 0n },
  { action: "withdraw_credit", args: [], value: 0n },
];

function canonical(value) {
  if (typeof value === "bigint" || typeof value === "number") return String(value);
  if (value instanceof Uint8Array) return `bytes(${value.length})`;
  if (value instanceof Map) return Object.fromEntries([...value.entries()].map(([key, item]) => [key, canonical(item)]));
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object" && value.constructor?.name === "CalldataAddress") return `0x${Buffer.from(value.bytes).toString("hex")}`;
  return value;
}

const router = chains[network].consensusMainContract.address;
const rows = [];
for (const spec of writes) {
  let captured;
  const provider = { request: async ({ method, params = [] }) => {
    if (method === "eth_chainId") return `0x${chainId.toString(16)}`;
    if (method === "eth_getTransactionCount") return "0x5";
    if (method === "eth_estimateGas") return "0x7a120";
    if (method === "eth_gasPrice") return "0x1";
    if (method === "eth_sendTransaction") {
      captured = params[0];
      throw new Error("CAPTURE_ONLY");
    }
    throw new Error(`unexpected provider method ${method}`);
  } };
  const client = createClient({ chain: chains[network], endpoint: rpcUrl, account: captureAccount, provider });
  try {
    await client.writeContract({ address: contractAddress, functionName: spec.action, args: spec.args, value: spec.value });
  } catch (error) {
    if (!String(error?.message ?? error).includes("CAPTURE_ONLY")) throw error;
  }
  if (!captured) throw new Error(`${spec.action}: no wallet request captured`);

  const outer = decodeFunctionData({ abi: client.chain.consensusMainContract.abi, data: captured.data });
  const [encodedCall] = fromRlp(outer.args[4]);
  const inner = abi.calldata.decode(fromHex(encodedCall, "bytes"));
  const decodedArguments = canonical(inner.get("args") ?? []);
  const expectedArguments = canonical(spec.args);
  const actualValue = BigInt(captured.value ?? "0x0");
  const checks = {
    rawEvmDestination: captured.to.toLowerCase() === router.toLowerCase(),
    submissionMethod: outer.functionName === "addTransaction",
    chainId: Number(captured.chainId) === chainId,
    icRecipient: outer.args[1].toLowerCase() === contractAddress.toLowerCase(),
    method: inner.get("method") === spec.action,
    arguments: JSON.stringify(decodedArguments) === JSON.stringify(expectedArguments),
    value: actualValue === spec.value,
  };
  rows.push({
    action: spec.action,
    rawEvmDestination: captured.to,
    submissionMethod: outer.functionName,
    decodedIcRecipient: outer.args[1],
    decodedMethod: inner.get("method"),
    decodedArguments,
    valueWei: actualValue.toString(),
    chainId: Number(captured.chainId),
    checks,
    result: Object.values(checks).every(Boolean) ? "PASS" : "FAIL",
  });
}

console.log(JSON.stringify({ network, chainId, consensusRouter: router, contractAddress, submitted: false, rows }, null, 2));
if (rows.some((row) => row.result !== "PASS")) process.exit(1);
