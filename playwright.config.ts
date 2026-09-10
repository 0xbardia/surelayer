import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["json", { outputFile: "test-results/playwright.json" }]],
  use: {
    baseURL: "http://127.0.0.1:3001",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: process.getuid?.() === 0 ? { args: ["--no-sandbox"] } : undefined,
  },
  webServer: { command: "env SURELAYER_TEST_BUILD=1 SURELAYER_ALLOW_UNCONFIGURED=1 GENLAYER_CONTRACT_ADDRESS= GENLAYER_RPC_URL= GENLAYER_NETWORK=studionet GENLAYER_CHAIN_ID=61999 APP_URL=http://127.0.0.1:3001 PORT=3001 sh -c 'npm run build && npm run start'", url: "http://127.0.0.1:3001/api/health", reuseExistingServer: false, timeout: 120_000 },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 5"], viewport: { width: 393, height: 851 } } },
    { name: "narrow", use: { ...devices["Desktop Chrome"], viewport: { width: 320, height: 568 } } },
  ],
});
