import { expect, test } from "@playwright/test";

const routes = ["/", "/claims", "/create", "/account", "/claims/1"];

test("connected account address wraps without hiding withdrawal controls", async ({ page }) => {
  await page.addInitScript(() => {
    window.ethereum = { request: async ({ method }) => {
      if (method === "eth_accounts" || method === "eth_requestAccounts") return ["0x1111111111111111111111111111111111111111"];
      throw new Error("Read-only layout test cannot sign");
    } };
  });
  await page.route("**/api/credit?*", route => route.fulfill({json:{readable:true,credit:"0"}}));
  await page.goto("/account", {waitUntil:"networkidle"});
  await expect(page.getByRole("button", {name:"Withdraw available credit"})).toBeDisabled();
  await expect(page.locator('nav [aria-current="page"]')).toHaveText("Account");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
});

for (const route of routes) {
  test(`renders ${route} without runtime or network failures`, async ({ page }, testInfo) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    const failedRequests: string[] = [];
    const serverErrors: string[] = [];
    page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("requestfailed", (request) => {
      const failure = request.failure()?.errorText ?? "failed";
      if (failure === "net::ERR_ABORTED" && request.url().includes("?_rsc=")) return;
      failedRequests.push(`${request.method()} ${request.url()} ${failure}`);
    });
    page.on("response", (response) => { if (response.status() >= 500) serverErrors.push(`${response.status()} ${response.url()}`); });
    await page.goto(route, { waitUntil: "networkidle" });
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator("body")).not.toContainText("Unhandled Runtime Error");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBeTruthy();
    await page.screenshot({ path: `test-results/${testInfo.project.name}-${route.replaceAll("/", "_") || "home"}.png`, fullPage: true });
    expect(consoleErrors, `console errors on ${route}`).toEqual([]);
    expect(pageErrors, `page errors on ${route}`).toEqual([]);
    expect(failedRequests, `failed requests on ${route}`).toEqual([]);
    expect(serverErrors, `server responses on ${route}`).toEqual([]);
  });
}

test("create form exposes a truthful no-deployment error", async ({ page }) => {
  await page.goto("/create", { waitUntil: "networkidle" });
  await page.getByLabel("Specific claim").fill("This test claim is bounded.");
  await page.getByLabel("Warranty criteria").fill("The evidence must support the exact statement.");
  await page.getByLabel("I understand that the bond is locked").check();
  await page.getByRole("button", { name: "Lock bond and issue warranty" }).click();
  await expect(page.locator(".error-summary")).toContainText("final contract configuration");
  await expect(page.locator(".error-summary")).toBeFocused();
});

test("keyboard focus is visible on the primary navigation", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus-visible")).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus-visible")).toBeVisible();
});

test("125 percent effective viewport remains usable", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 720 });
  await page.goto("/create", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Put a bond behind a claim." })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBeTruthy();
});

test("landing hero keeps intentional spacing below the header", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto("/", { waitUntil: "networkidle" });
  const gap = await page.evaluate(() => {
    const header = document.querySelector(".site-header")?.getBoundingClientRect();
    const kicker = document.querySelector(".hero-v4 .hero-kicker")?.getBoundingClientRect();
    return header && kicker ? kicker.top - header.bottom : -1;
  });
  expect(gap).toBeGreaterThanOrEqual(40);
  expect(gap).toBeLessThanOrEqual(100);
});

test("reduced-motion preference keeps the primary form usable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/create", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Put a bond behind a claim." })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBeTruthy();
});

test("required viewport widths remain free of horizontal overflow", async ({ browser }) => {
  test.setTimeout(120_000);
  for (const width of [375, 768, 1024, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    for (const route of ["/", "/claims", "/create", "/account", "/claims/1"]) {
      await page.goto(route, { waitUntil: "networkidle" });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${route} overflows at ${width}px`).toBeTruthy();
    }
    await context.close();
  }
});
