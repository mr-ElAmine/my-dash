import { mkdir } from "node:fs/promises";
import { join } from "node:path";

async function loadChromium() {
  const candidates = [
    "playwright-core",
    "/workspace/frontend/node_modules/playwright-core/index.js",
    "/usr/local/lib/node_modules/playwright-core/index.js",
  ];

  let lastError;
  for (const candidate of candidates) {
    try {
      const playwright = await import(candidate);
      return playwright.chromium ?? playwright.default?.chromium;
    } catch (error) {
      lastError = error;
      if (error?.code !== "ERR_MODULE_NOT_FOUND") throw error;
    }
  }

  throw lastError;
}

const frontendUrl = process.env.FRONTEND_URL ?? "http://frontend:8081";
const outputDir = process.env.MOBILE_CAPTURE_DIR ?? "/workspace-root/audit-artifacts/mobile";
const chromiumPath = process.env.CHROMIUM_PATH ?? "/usr/bin/chromium";
const apiRewriteFrom = process.env.API_REWRITE_FROM ?? "http://localhost:3000";
const publishedApiOrigin = process.env.API_REWRITE_PUBLISHED ?? "https://my-dash-droq.onrender.com";
const apiRewriteTo = process.env.API_REWRITE_TO ?? "http://backend:3000";
const apiBaseUrl = process.env.API_BASE_URL ?? `${apiRewriteTo}/api`;

const loginEmail = process.env.SEED_EMAIL ?? "admin@mydash.local";
const loginPassword = process.env.SEED_PASSWORD ?? "password123";

await mkdir(outputDir, { recursive: true });

const chromium = await loadChromium();
const browser = await chromium.launch({
  executablePath: chromiumPath,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
});

const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 1,
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
});

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  "access-control-allow-headers": "authorization,content-type",
};

for (const sourceOrigin of new Set([apiRewriteFrom, publishedApiOrigin])) {
  if (!sourceOrigin || sourceOrigin === apiRewriteTo) continue;

  await context.route(`${sourceOrigin}/**`, async (route) => {
    const request = route.request();
    if (request.method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers: corsHeaders, body: "" });
      return;
    }

    const url = request.url().replace(sourceOrigin, apiRewriteTo);
    const response = await route.fetch({ url });
    await route.fulfill({
      response,
      headers: {
        ...response.headers(),
        ...corsHeaders,
      },
    });
  });
}

function attachDiagnostics(targetPage) {
  targetPage.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) {
      console.log(`[browser:${message.type()}] ${message.text()}`);
    }
  });
  targetPage.on("request", (request) => {
    if (request.url().includes("/api/")) {
      console.log(`[api:request] ${request.method()} ${request.url()}`);
    }
  });
  targetPage.on("response", (response) => {
    if (response.url().includes("/api/")) {
      console.log(`[api:response] ${response.status()} ${response.url()}`);
    }
  });
  targetPage.on("requestfailed", (request) => {
    if (request.url().includes("/api/")) {
      console.log(`[api:failed] ${request.method()} ${request.url()} ${request.failure()?.errorText}`);
    }
  });
}

let page = await context.newPage();
page.setDefaultTimeout(30_000);
attachDiagnostics(page);

async function openRoute(route) {
  await page.goto(`${frontendUrl}${route}`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForLoadState("load", { timeout: 10_000 }).catch(() => {});
  await page.waitForTimeout(750);
}

async function capture(name) {
  const path = join(outputDir, name);
  await page.screenshot({ path, fullPage: false });
  console.log(path);
}

async function apiJson(path, init = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, init);
  if (!response.ok) {
    throw new Error(`API ${path} returned ${response.status}: ${await response.text()}`);
  }
  return response.json();
}

async function getSeedSession() {
  const login = await apiJson("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: loginEmail, password: loginPassword }),
  });
  const session = login.data;
  const organizations = await apiJson("/organizations", {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
  const activeOrganization = organizations.data.find((org) => org.status === "active");

  return {
    token: session.accessToken,
    user: session.user,
    organizationId: activeOrganization?.id ?? null,
  };
}

await openRoute("/login");
await page.getByPlaceholder("nom@exemple.fr").waitFor();
await capture("01-login-mobile.png");

await openRoute("/register");
await page.getByPlaceholder("nom@exemple.fr").waitFor();
await capture("02-register-mobile.png");

const seedSession = await getSeedSession();
await page.close();
await context.addInitScript(({ token, user, organizationId }) => {
  window.localStorage.setItem("auth-token", token);
  window.localStorage.setItem("auth-user", JSON.stringify(user));
  if (organizationId) {
    window.localStorage.setItem("current-organization-id", organizationId);
  }
}, seedSession);
page = await context.newPage();
page.setDefaultTimeout(30_000);
attachDiagnostics(page);

await openRoute("/");
await page.getByText("Tableau de bord", { exact: true }).waitFor().catch(async (error) => {
  const diagnostics = await page.evaluate(() => ({
    href: window.location.href,
    hasAuthToken: Boolean(window.localStorage.getItem("auth-token")),
    hasAuthUser: Boolean(window.localStorage.getItem("auth-user")),
    hasOrganizationId: Boolean(window.localStorage.getItem("current-organization-id")),
    text: document.body.innerText.slice(0, 500),
  }));
  console.log(`[page:diagnostics] ${JSON.stringify(diagnostics)}`);
  await capture("03-dashboard-timeout-mobile.png");
  throw error;
});
await capture("03-dashboard-mobile.png");

const pages = [
  ["04-quotes-mobile.png", "/quotes", "Devis"],
  ["05-invoices-mobile.png", "/invoices", "Factures"],
  ["06-companies-mobile.png", "/companies", "Entreprises"],
  ["07-organizations-mobile.png", "/organizations", "Organisations"],
];

for (const [fileName, route, expectedText] of pages) {
  await openRoute(route);
  await page.getByText(expectedText, { exact: false }).first().waitFor();
  await capture(fileName);
}

await browser.close();
