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
const outputDir =
  process.env.MOBILE_WORKFLOW_DIR ??
  "/workspace-root/audit-artifacts/mobile-workflow";
const chromiumPath = process.env.CHROMIUM_PATH ?? "/usr/bin/chromium";
const apiRewriteFrom = process.env.API_REWRITE_FROM ?? "http://localhost:3000";
const publishedApiOrigin =
  process.env.API_REWRITE_PUBLISHED ?? "https://my-dash-droq.onrender.com";
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
      console.log(
        `[api:failed] ${request.method()} ${request.url()} ${request.failure()?.errorText}`,
      );
    }
  });
}

let authToken = "";
let organizationId = "";

async function apiJson(path, init = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API ${path} returned ${response.status}: ${await response.text()}`);
  }

  return response.json();
}

async function getSeedSession() {
  const login = await apiJson("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: loginEmail, password: loginPassword }),
  });
  const session = login.data;
  authToken = session.accessToken;

  const organizations = await apiJson("/organizations");
  const activeOrganization = organizations.data.find((org) => org.status === "active");
  if (!activeOrganization) throw new Error("No active organization in seed data");

  organizationId = activeOrganization.id;

  return {
    token: session.accessToken,
    user: session.user,
    organizationId,
  };
}

function byNumber(rows, numberField, value) {
  const row = rows.find((item) => item[numberField] === value);
  if (!row) throw new Error(`Could not find ${value}`);
  return row;
}

const seedSession = await getSeedSession();

await context.addInitScript(({ token, user, organizationId: orgId }) => {
  window.localStorage.setItem("auth-token", token);
  window.localStorage.setItem("auth-user", JSON.stringify(user));
  window.localStorage.setItem("current-organization-id", orgId);
}, seedSession);

const page = await context.newPage();
page.setDefaultTimeout(30_000);
attachDiagnostics(page);

async function openRoute(route) {
  await page.goto(`${frontendUrl}${route}`, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await page.waitForLoadState("load", { timeout: 10_000 }).catch(() => {});
  await page.waitForTimeout(900);
}

async function capture(name) {
  const path = join(outputDir, name);
  await page.screenshot({ path, fullPage: false });
  console.log(path);
}

async function fillByPlaceholder(placeholder, value) {
  const field = page.getByPlaceholder(placeholder).first();
  await field.scrollIntoViewIfNeeded();
  await field.fill(value);
}

async function clickText(text, options = {}) {
  const locator = page.getByText(text, { exact: options.exact ?? true });
  const target = options.last ? locator.last() : locator.first();
  await target.scrollIntoViewIfNeeded();
  await target.click();
}

async function waitForText(text, options = {}) {
  await page
    .getByText(text, { exact: options.exact ?? false })
    .first()
    .waitFor({ timeout: options.timeout ?? 30_000 });
}

async function confirmDialog(actionLabel, dialogTitle) {
  await clickText(actionLabel);
  await waitForText(dialogTitle, { exact: true });
  await clickText(actionLabel, { last: true });
  await page.waitForTimeout(1_200);
}

const quotesResponse = await apiJson(`/organizations/${organizationId}/quotes`);
const invoicesResponse = await apiJson(`/organizations/${organizationId}/invoices`);
const draftQuote = byNumber(quotesResponse.data, "quoteNumber", "DEV-2026-002");
const sentQuote = byNumber(quotesResponse.data, "quoteNumber", "DEV-2026-001");
const invoiceToPay = byNumber(invoicesResponse.data, "invoiceNumber", "FAC-2026-002");

await openRoute("/");
await waitForText("Tableau de bord", { exact: true });
await capture("01-dashboard-seeded-mobile.png");

await openRoute("/companies");
await waitForText("Entreprises", { exact: true });
await capture("02-companies-customers-mobile.png");

await openRoute("/companies/create");
await waitForText("Nouveau client", { exact: true });
await fillByPlaceholder("Acme Corp", "Audit Mobile Parcours");
await fillByPlaceholder("123 456 789", "301245879");
await fillByPlaceholder("123 456 789 00012", "30124587900017");
await fillByPlaceholder("FR12345678900", "FR44301245879");
await fillByPlaceholder("Technologie", "Conseil digital");
await fillByPlaceholder("12 rue de la Paix", "9 rue des Archives");
await fillByPlaceholder("Paris", "Rennes");
await fillByPlaceholder("75001", "35000");
await fillByPlaceholder("FR", "FR");
await fillByPlaceholder("https://www.exemple.fr", "https://audit-mobile.test");
await capture("03-company-create-filled-mobile.png");
await clickText("Cree le client");
await waitForText("Entreprises", { exact: true });
await clickText("Prospects", { exact: false });
await waitForText("Audit Mobile Parcours", { exact: true });
await capture("04-company-created-prospect-mobile.png");

await openRoute(`/quotes/${draftQuote.id}/add-line`);
await waitForText("Ajouter une ligne", { exact: true });
await fillByPlaceholder("Ex: Prestation de conseil", "Prestation UX mobile audit");
await fillByPlaceholder("1", "2");
await fillByPlaceholder("0.00", "480");
await fillByPlaceholder("20", "20");
await capture("05-quote-line-filled-mobile.png");
await clickText("Ajouter la ligne");
await page.waitForTimeout(1_000);
await openRoute(`/quotes/${draftQuote.id}`);
await waitForText("Lignes du devis", { exact: true });
await page
  .getByText("Prestation UX mobile audit", { exact: false })
  .first()
  .scrollIntoViewIfNeeded();
await page.waitForTimeout(500);
await capture("06-quote-line-added-mobile.png");

await confirmDialog("Envoyer", "Envoyer le devis");
await waitForText("Envoye", { exact: true });
await capture("07-quote-sent-mobile.png");

await openRoute(`/quotes/${sentQuote.id}`);
await waitForText("DEV-2026-001", { exact: true });
await capture("08-quote-sent-before-accept-mobile.png");
await confirmDialog("Accepter", "Accepter le devis");
await waitForText("Accepte", { exact: true });
await capture("09-quote-accepted-mobile.png");

await openRoute("/invoices");
await waitForText("Factures", { exact: true });
await capture("10-invoices-after-quote-accept-mobile.png");

await openRoute(`/invoices/${invoiceToPay.id}/add-payment`);
await waitForText("Enregistrer un paiement", { exact: true });
await fillByPlaceholder("0.00", "4800");
await fillByPlaceholder("AAAA-MM-JJ", "2026-05-26");
await fillByPlaceholder("Ref. virement, n° cheque...", "VIR-AUDIT-MOBILE-0526");
await capture("11-payment-filled-mobile.png");
await clickText("Enregistrer le paiement");
await waitForText("FAC-2026-002", { exact: true });
await waitForText("Payee", { exact: true });
await capture("12-invoice-paid-mobile.png");

await openRoute("/");
await waitForText("Tableau de bord", { exact: true });
await capture("13-dashboard-after-workflow-mobile.png");

await browser.close();
