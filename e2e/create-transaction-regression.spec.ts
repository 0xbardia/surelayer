import { expect, test, type Page } from "@playwright/test";

const CONTRACT = "0x1111111111111111111111111111111111111111";
const ROUTER = "0xb7278A61aa25c888815aFC32Ad3cC52fF24fE575";
const ACCOUNT = "0x2222222222222222222222222222222222222222";
const BOND_HEX = "0xde0b6b3a7640000";
const EVIDENCE_URL = "https://example.com/issuer-evidence";
const EVIDENCE_HASH = `sha256:${"a".repeat(64)}`;
const ARTIFACT_URL = "https://example.com/artifact";
const ARTIFACT_HASH = `sha256:${"b".repeat(64)}`;

type Mode = "success" | "cleanup-error" | "tracking-error" | "wallet-rejected" | "execution-error";

async function prepare(page: Page, mode: Mode) {
  const hash = `0x${mode === "success" ? "a" : mode === "cleanup-error" ? "b" : mode === "tracking-error" ? "c" : mode === "wallet-rejected" ? "d" : "e"}${"0".repeat(63)}`;
  await page.route("**/api/status", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      configured: true,
      readable: true,
      network: "studionet",
      chainId: 61999,
      contractAddress: CONTRACT,
      config: {
        minClaimBond: "1000000000000000000",
        challengeBond: "500000000000000000",
        challengeWindowSeconds: "86400",
        resolutionTimeoutSeconds: "86400",
        maxStatement: 1200,
        maxCriteria: 2000,
        maxSources: 4,
        maxPageSize: 25,
      },
      stats: { claimCount: "0", totalLocked: "0", totalCredits: "0", contractBalance: "0" },
    }),
  }));
  await page.route("**/api/config", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ network: "studionet", chainId: 61999, contractAddress: CONTRACT, rpcUrl: "https://studio.genlayer.com/api", appUrl: "http://127.0.0.1:3001", protocolTestClaimIds: [], configurationError: null }),
  }));
  await page.route("https://studio.genlayer.com/api", async (route) => {
    let body: { id?: number; method?: string; params?: unknown[] } = {};
    try { body = route.request().postDataJSON() as typeof body; } catch { /* pass through non-JSON requests */ }
    if (body.method !== "eth_getTransactionByHash") return route.continue();
    if (mode === "tracking-error") {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ jsonrpc: "2.0", id: body.id, error: { code: -32001, message: "transaction not found" } }) });
    }
    await new Promise((resolve) => setTimeout(resolve, 75));
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: body.id,
        result: {
          hash: body.params?.[0],
          from_address: ACCOUNT,
          origin_address: ACCOUNT,
          to_address: CONTRACT,
          data: null,
          value: 1000000000000000000,
          type: 2,
          status: "FINALIZED",
          result: 6,
          consensus_data: { leader_receipt: [{ execution_result: mode === "execution-error" ? "ERROR" : "SUCCESS", result: "AAk=" }] },
        },
      }),
    });
  });
  await page.addInitScript(({ selectedMode, transactionHash, account }) => {
    const calls: Array<{ method: string; params?: unknown[] }> = [];
    const fakeProvider = {
      request: async ({ method, params }: { method: string; params?: unknown[] }) => {
        calls.push({ method, params });
        if (method === "eth_requestAccounts" || method === "eth_accounts") return [account];
        if (method === "eth_chainId") return "0xf22f";
        if (method === "eth_getTransactionCount") return "0x0";
        if (method === "eth_gasPrice") return "0x1";
        if (method === "eth_estimateGas") return "0x5208";
        if (method === "eth_sendTransaction") {
          if (selectedMode === "wallet-rejected") throw Object.assign(new Error("User rejected the request"), { code: 4001 });
          return transactionHash;
        }
        throw new Error(`Unexpected wallet request: ${method}`);
      },
    };
    Object.defineProperty(window, "__walletCalls", { configurable: true, writable: true, value: calls });
    Object.defineProperty(window, "ethereum", { configurable: true, writable: true, value: fakeProvider });
    window.confirm = () => true;
    if (selectedMode === "cleanup-error") HTMLFormElement.prototype.reset = () => { throw new Error("forced post-success cleanup failure"); };
  }, { selectedMode: mode, transactionHash: hash, account: ACCOUNT });
  await page.goto("/create", { waitUntil: "networkidle" });
}

async function fillAndSubmit(page: Page) {
  await page.getByLabel("Specific claim").fill("This controlled create flow reaches the async finality boundary.");
  await page.getByLabel("Warranty criteria").fill("The captured final transaction must be handled truthfully.");
  await page.getByLabel("Artifact reference").fill(ARTIFACT_URL);
  await page.getByLabel("Artifact hash").fill(ARTIFACT_HASH);
  await page.getByLabel("Issuer evidence sources").fill(EVIDENCE_URL);
  await page.getByLabel("Issuer evidence SHA-256 commitments").fill(EVIDENCE_HASH);
  await page.getByLabel("I understand that the bond is locked").setChecked(true);
  await page.getByRole("button", { name: "Lock bond and issue warranty" }).click();
}

test("successful finalization survives the async form lifecycle", async ({ page }) => {
  await prepare(page, "success");
  await fillAndSubmit(page);
  await expect(page.getByText("Finalized", { exact: true })).toBeVisible({ timeout: 15000 });
  await expect(page.locator(".error-summary")).toHaveCount(0);
  await expect(page.locator("textarea[name=statement]")).toHaveValue("");
  await expect(page.locator("textarea[name=criteria]")).toHaveValue("");
  const write = await page.evaluate(() => (window as unknown as { __walletCalls: Array<{ method: string; params?: unknown[] }> }).__walletCalls.find((call) => call.method === "eth_sendTransaction"));
  expect(write?.params?.[0]).toMatchObject({ to: ROUTER, value: BOND_HEX, chainId: "0xf22f" });
  const data = String((write?.params?.[0] as { data?: string }).data).toLowerCase();
  expect(data).toContain(CONTRACT.slice(2).toLowerCase());
  expect(data).toContain(Buffer.from(EVIDENCE_URL).toString("hex"));
  expect(data).toContain(Buffer.from(EVIDENCE_HASH).toString("hex"));
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
});

test("challenge serializes each URL with its canonical hash", async ({ page }) => {
  await page.route("**/api/status", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      configured: true,
      readable: true,
      network: "studionet",
      chainId: 61999,
      contractAddress: CONTRACT,
      config: {
        minClaimBond: "1000000000000000000",
        challengeBond: "500000000000000000",
        challengeWindowSeconds: "86400",
        resolutionTimeoutSeconds: "86400",
        maxStatement: 1200,
        maxCriteria: 2000,
        maxSources: 4,
        maxPageSize: 25,
      },
      stats: { claimCount: "1", totalLocked: "1000000000000000000", totalCredits: "0", contractBalance: "1000000000000000000" },
    }),
  }));
  await page.route("**/api/config", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ network: "studionet", chainId: 61999, contractAddress: CONTRACT, rpcUrl: "https://studio.genlayer.com/api", appUrl: "http://127.0.0.1:3001", protocolTestClaimIds: [], configurationError: null }),
  }));
  await page.route("**/api/claims/1", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      configured: true,
      readable: true,
      claim: {
        id: "1",
        issuer: ACCOUNT,
        statement: "This open claim is used for serialization coverage.",
        artifactRef: "",
        artifactHash: "",
        artifactIntegrity: "",
        criteria: "The challenge calldata must preserve every evidence commitment.",
        claimBond: "1000000000000000000",
        createdAt: "1757289600",
        challengeDeadline: "1757376000",
        state: 1,
        stateName: "OPEN",
        challenger: "",
        challengeReason: "",
        challengeBond: "0",
        challengedAt: "0",
        resolutionDeadline: "0",
        verdict: "",
        evidenceState: "",
        criteriaMet: false,
        supportingSourceCount: 0,
        resolutionSummary: "",
        resolvedAt: "0",
        settlementDone: false,
        issuerSources: [],
        issuerHashes: [],
        challengerSources: [],
        challengerHashes: [],
        timeline: [],
      },
    }),
  }));
  const hash = `0x${"f".repeat(64)}`;
  await page.route("https://studio.genlayer.com/api", async (route) => {
    let body: { id?: number; method?: string; params?: unknown[] } = {};
    try { body = route.request().postDataJSON() as typeof body; } catch { /* pass through non-JSON requests */ }
    if (body.method !== "eth_getTransactionByHash") return route.continue();
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ jsonrpc: "2.0", id: body.id, result: { hash: body.params?.[0], status: "FINALIZED", result: 6, consensus_data: { leader_receipt: [{ execution_result: "SUCCESS", result: "AAk=" }] } } }),
    });
  });
  await page.addInitScript(({ account, transactionHash }) => {
    const calls: Array<{ method: string; params?: unknown[] }> = [];
    const provider = {
      request: async ({ method, params }: { method: string; params?: unknown[] }) => {
        calls.push({ method, params });
        if (method === "eth_accounts" || method === "eth_requestAccounts") return [account];
        if (method === "eth_chainId") return "0xf22f";
        if (method === "eth_getTransactionCount") return "0x0";
        if (method === "eth_gasPrice") return "0x1";
        if (method === "eth_estimateGas") return "0x5208";
        if (method === "eth_sendTransaction") return transactionHash;
        throw new Error(`Unexpected wallet request: ${method}`);
      },
    };
    Object.defineProperty(window, "__walletCalls", { configurable: true, writable: true, value: calls });
    Object.defineProperty(window, "ethereum", { configurable: true, writable: true, value: provider });
    window.confirm = () => true;
  }, { account: ACCOUNT, transactionHash: hash });
  await page.goto("/claims/1", { waitUntil: "networkidle" });
  await page.getByLabel("Challenge reason").fill("The committed evidence must be preserved.");
  await page.getByLabel("Challenger evidence sources").fill(EVIDENCE_URL);
  await page.getByLabel("Challenger evidence SHA-256 commitments").fill(EVIDENCE_HASH);
  await page.getByLabel(/I understand that .* will be locked/).check();
  await page.getByRole("button", { name: "Post challenge bond" }).click();
  await expect(page.getByText("Finalized", { exact: true })).toBeVisible({ timeout: 15000 });
  const write = await page.evaluate(() => (window as unknown as { __walletCalls: Array<{ method: string; params?: unknown[] }> }).__walletCalls.find((call) => call.method === "eth_sendTransaction"));
  const data = String((write?.params?.[0] as { data?: string }).data).toLowerCase();
  expect(data).toContain(Buffer.from(EVIDENCE_URL).toString("hex"));
  expect(data).toContain(Buffer.from(EVIDENCE_HASH).toString("hex"));
});

test("pending presentation preserves the hash and does not imply failure", async ({ page }) => {
  await prepare(page, "success");
  let releaseFinality!: () => void;
  const finalityGate = new Promise<void>(resolve => { releaseFinality = resolve; });
  await page.route("https://studio.genlayer.com/api", async route => {
    if (route.request().postDataJSON().method === "eth_getTransactionByHash") await finalityGate;
    await route.fallback();
  });
  await fillAndSubmit(page);
  const pending = page.locator(".notice.pending");
  await expect(pending).toHaveAttribute("role", "status");
  await expect(pending).toContainText("Consensus pending");
  await expect(pending).toContainText("Transaction: 0x");
  await expect(page.getByRole("button", { name: "Waiting for finality…" })).toBeDisabled();
  releaseFinality();
  await expect(page.getByText("Finalized", { exact: true })).toBeVisible();
});

test("post-success cleanup failure remains a protocol success", async ({ page }) => {
  await prepare(page, "cleanup-error");
  await fillAndSubmit(page);
  await expect(page.getByText("Finalized", { exact: true })).toBeVisible();
  await expect(page.locator(".error-summary")).toHaveCount(0);
  await expect(page.locator("body")).toContainText("form could not be cleared");
  await expect(page.locator("body")).not.toContainText("Not finalized");
  await expect(page.locator("textarea[name=statement]")).not.toHaveValue("");
});

test("wallet rejection keeps the form and creates no pending record", async ({ page }) => {
  await prepare(page, "wallet-rejected");
  await fillAndSubmit(page);
  await expect(page.getByText("Wallet canceled", { exact: true })).toBeVisible();
  await expect(page.locator("textarea[name=statement]")).toHaveValue("This controlled create flow reaches the async finality boundary.");
  await expect(page.locator("textarea[name=criteria]")).toHaveValue("The captured final transaction must be handled truthfully.");
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
});

test("finalized execution errors keep values and clear the pending record", async ({ page }) => {
  await prepare(page, "execution-error");
  await fillAndSubmit(page);
  await expect(page.getByText("Not finalized", { exact: true })).toBeVisible();
  await expect(page.locator(".error-summary")).toContainText("final contract execution failed");
  await expect(page.locator("textarea[name=statement]")).toHaveValue("This controlled create flow reaches the async finality boundary.");
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
});

test("tracking failure persists and refresh resumes tracking instead of writing", async ({ page }) => {
  await prepare(page, "tracking-error");
  await fillAndSubmit(page);
  await expect(page.getByText("Finality unresolved", { exact: true })).toBeVisible();
  const beforeRefresh = await page.evaluate(() => ({ keys: Object.keys(localStorage), calls: (window as unknown as { __walletCalls: Array<{ method: string }> }).__walletCalls }));
  expect(beforeRefresh.keys).toHaveLength(1);
  expect(beforeRefresh.keys[0]).toContain("surelayer.pending-write:");
  const pendingRecord = await page.evaluate(() => localStorage.getItem(Object.keys(localStorage)[0]));
  expect(pendingRecord).not.toBeNull();
  expect(JSON.parse(pendingRecord!)).toMatchObject({ action: "create_claim", account: ACCOUNT, network: "studionet", contractAddress: CONTRACT });

  await page.reload({ waitUntil: "networkidle" });
  await expect(page.getByText("Finality unresolved", { exact: true })).toBeVisible();
  const afterRefresh = await page.evaluate(() => ({ calls: (window as unknown as { __walletCalls: Array<{ method: string }> }).__walletCalls, keys: Object.keys(localStorage) }));
  expect(afterRefresh.calls.filter((call) => call.method === "eth_sendTransaction")).toHaveLength(0);
  expect(afterRefresh.keys).toHaveLength(1);
});
