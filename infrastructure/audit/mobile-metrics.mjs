import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { performance } from "node:perf_hooks";

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
  process.env.MOBILE_METRICS_DIR ?? "/workspace-root/audit-artifacts/metrics";
const chromiumPath = process.env.CHROMIUM_PATH ?? "/usr/bin/chromium";
const apiRewriteFrom = process.env.API_REWRITE_FROM ?? "http://localhost:3000";
const publishedApiOrigin =
  process.env.API_REWRITE_PUBLISHED ?? "https://my-dash-droq.onrender.com";
const apiRewriteTo = process.env.API_REWRITE_TO ?? "http://backend:3000";
const apiBaseUrl = process.env.API_BASE_URL ?? `${apiRewriteTo}/api`;
const loginEmail = process.env.SEED_EMAIL ?? "admin@mydash.local";
const loginPassword = process.env.SEED_PASSWORD ?? "password123";

const routes = [
  { key: "dashboard", path: "/", expectedText: "Tableau de bord" },
  { key: "companies", path: "/companies", expectedText: "Entreprises" },
  { key: "quotes", path: "/quotes", expectedText: "Devis" },
  { key: "invoices", path: "/invoices", expectedText: "Factures" },
  { key: "organizations", path: "/organizations", expectedText: "Organisations" },
];

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  "access-control-allow-headers": "authorization,content-type",
};

await mkdir(outputDir, { recursive: true });

let authToken = "";

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

  return {
    token: session.accessToken,
    user: session.user,
    organizationId: activeOrganization.id,
  };
}

function percentile(values, ratio) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * ratio) - 1)];
}

function round(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value);
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function summarizeResources(resources) {
  const byType = {};

  for (const item of resources) {
    const type = item.initiatorType || "other";
    byType[type] ??= {
      count: 0,
      transferSize: 0,
      encodedBodySize: 0,
      decodedBodySize: 0,
      durationMs: 0,
    };
    byType[type].count += 1;
    byType[type].transferSize += item.transferSize;
    byType[type].encodedBodySize += item.encodedBodySize;
    byType[type].decodedBodySize += item.decodedBodySize;
    byType[type].durationMs += item.duration;
  }

  for (const value of Object.values(byType)) {
    value.transferSize = round(value.transferSize);
    value.encodedBodySize = round(value.encodedBodySize);
    value.decodedBodySize = round(value.decodedBodySize);
    value.durationMs = round(value.durationMs);
  }

  return byType;
}

function getRouteApiEvents(apiEvents, startedAt, finishedAt) {
  return apiEvents.filter((event) => event.startedAt >= startedAt && event.startedAt <= finishedAt);
}

function makeRouteSummary(routeResult) {
  const navigation = routeResult.performance.navigation?.[0] ?? {};
  const resources = routeResult.performance.resources;
  const resourceSummary = summarizeResources(resources);
  const apiDurations = routeResult.apiEvents.map((event) => event.durationMs);
  const failedStatuses = routeResult.apiEvents.filter((event) => event.status >= 400);
  const warnings = routeResult.consoleMessages.filter((message) => message.type === "warning");
  const errors = routeResult.consoleMessages.filter((message) => message.type === "error");
  const totalTransferSize = sum(resources.map((resource) => resource.transferSize));
  const scriptTransferSize = sum(
    resources
      .filter((resource) => resource.initiatorType === "script")
      .map((resource) => resource.transferSize),
  );
  const imageTransferSize = sum(
    resources
      .filter((resource) => resource.initiatorType === "img")
      .map((resource) => resource.transferSize),
  );

  return {
    key: routeResult.key,
    path: routeResult.path,
    title: routeResult.performance.title,
    bodyTextSample: routeResult.performance.bodyTextSample,
    expectedTextFound: routeResult.expectedTextFound,
    wallTimeMs: round(routeResult.wallTimeMs),
    domContentLoadedMs: round(navigation.domContentLoadedEventEnd),
    loadEventMs: round(navigation.loadEventEnd),
    firstPaintMs: round(
      routeResult.performance.paints.find((paint) => paint.name === "first-paint")?.startTime ?? 0,
    ),
    firstContentfulPaintMs: round(
      routeResult.performance.paints.find((paint) => paint.name === "first-contentful-paint")
        ?.startTime ?? 0,
    ),
    resourceCount: resources.length,
    totalTransferSize,
    scriptTransferSize,
    imageTransferSize,
    resourceSummary,
    apiCount: routeResult.apiEvents.length,
    apiAvgMs: round(apiDurations.length ? sum(apiDurations) / apiDurations.length : 0),
    apiP95Ms: round(percentile(apiDurations, 0.95)),
    apiFailedCount: failedStatuses.length,
    consoleWarningCount: warnings.length,
    consoleErrorCount: errors.length,
  };
}

function renderBytes(value) {
  if (!value) return "0 B";
  if (value < 1024) return `${round(value)} B`;
  if (value < 1024 * 1024) return `${round(value / 1024)} KB`;
  return `${Math.round((value / 1024 / 1024) * 10) / 10} MB`;
}

function renderMarkdown(report) {
  const lines = [
    "# Mobile metrics audit (Network comparison)",
    "",
    `Generated: ${report.generatedAt}`,
    `Viewport: ${report.viewport.width}x${report.viewport.height}, DPR ${report.viewport.deviceScaleFactor}`,
    `Frontend: ${report.frontendUrl}`,
    `API target: ${report.apiRewriteTo}`,
    "",
    "## Network Throttling Profiles",
    "- **Local**: No bandwidth restrictions, 0ms extra latency.",
    "- **3G Throttled**: 1.6 Mbps download, 750 Kbps upload, 150ms RTT latency (simulating typical mobile network).",
    "",
    "## Route timings (Comparison)",
    "",
    "| Route | Wall (Local) | Wall (3G) | DCL (Local) | DCL (3G) | FCP (Local) | FCP (3G) | Transfer | Console |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
  ];

  for (let i = 0; i < report.routes.length; i++) {
    const local = report.localSummaries[i];
    const throttled = report.throttledSummaries[i];
    lines.push(
      `| ${local.path} | ${local.wallTimeMs} ms | ${throttled.wallTimeMs} ms | ${local.domContentLoadedMs} ms | ${throttled.domContentLoadedMs} ms | ${local.firstContentfulPaintMs} ms | ${throttled.firstContentfulPaintMs} ms | ${renderBytes(local.totalTransferSize)} | ${local.consoleWarningCount} w / ${local.consoleErrorCount} e |`,
    );
  }

  lines.push(
    "",
    "## API calls (Local vs 3G)",
    "",
    "| Route | Calls | Avg (Local) | Avg (3G) | P95 (Local) | P95 (3G) |",
    "| --- | ---: | ---: | ---: | ---: | ---: |",
  );

  for (let i = 0; i < report.routes.length; i++) {
    const local = report.localSummaries[i];
    const throttled = report.throttledSummaries[i];
    lines.push(
      `| ${local.path} | ${local.apiCount} | ${local.apiAvgMs} ms | ${throttled.apiAvgMs} ms | ${local.apiP95Ms} ms | ${throttled.apiP95Ms} ms |`,
    );
  }

  lines.push("", "## Console warnings and errors (Local)", "");
  for (const route of report.localRoutes) {
    const messages = route.consoleMessages.filter((message) =>
      ["warning", "error"].includes(message.type),
    );
    lines.push(`### ${route.path}`);
    if (messages.length === 0) {
      lines.push("- None captured.");
    } else {
      for (const message of messages.slice(0, 12)) {
        lines.push(`- ${message.type}: ${message.text.replaceAll("\n", " ").slice(0, 220)}`);
      }
      if (messages.length > 12) {
        lines.push(`- ${messages.length - 12} additional messages truncated.`);
      }
    }
    lines.push("");
  }

  lines.push(
    "## Notes",
    "",
    "- Measurements are from the Docker audit network with Chromium headless and mobile viewport.",
    "- Throttling is applied dynamically using Chrome DevTools Protocol (`Network.emulateNetworkConditions`) in Playwright.",
    "- These timings represent audit signals to compare impact of network latency on large Javascript bundles.",
    "",
  );

  return lines.join("\n");
}

const seedSession = await getSeedSession();
const chromium = await loadChromium();
const browser = await chromium.launch({
  executablePath: chromiumPath,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
});

async function runPass(throttle) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 1,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  });

  const apiEvents = [];

  for (const sourceOrigin of new Set([apiRewriteFrom, publishedApiOrigin])) {
    if (!sourceOrigin || sourceOrigin === apiRewriteTo) continue;

    await context.route(`${sourceOrigin}/**`, async (route) => {
      const request = route.request();
      if (request.method() === "OPTIONS") {
        await route.fulfill({ status: 204, headers: corsHeaders, body: "" });
        return;
      }

      const url = request.url().replace(sourceOrigin, apiRewriteTo);
      const startedAt = performance.now();
      const response = await route.fetch({ url });
      const finishedAt = performance.now();
      apiEvents.push({
        method: request.method(),
        url: request.url(),
        targetUrl: url,
        status: response.status(),
        startedAt,
        durationMs: round(finishedAt - startedAt),
      });
      await route.fulfill({
        response,
        headers: {
          ...response.headers(),
          ...corsHeaders,
        },
      });
    });
  }

  await context.addInitScript(({ token, user, organizationId }) => {
    window.localStorage.setItem("auth-token", token);
    window.localStorage.setItem("auth-user", JSON.stringify(user));
    window.localStorage.setItem("current-organization-id", organizationId);
  }, seedSession);

  const routeResults = [];
  const page = await context.newPage();
  page.setDefaultTimeout(60_000);

  if (throttle) {
    const client = await page.context().newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: Math.round(1.6 * 1024 * 1024 / 8), // 1.6 Mbps
      uploadThroughput: Math.round(750 * 1024 / 8), // 750 Kbps
      latency: 150, // 150ms RTT
    });
    console.log("Enabled 3G network throttling (1.6 Mbps, 150ms latency)");
  } else {
    console.log("No network throttling (Local)");
  }

  const consoleMessages = [];
  const requestFailures = [];

  page.on("console", (message) => {
    if (["warning", "error"].includes(message.type())) {
      consoleMessages.push({
        type: message.type(),
        text: message.text(),
        location: message.location(),
        routeKey: routeResults.at(-1)?.key ?? null,
        capturedAt: new Date().toISOString(),
      });
    }
  });

  page.on("requestfailed", (request) => {
    requestFailures.push({
      method: request.method(),
      url: request.url(),
      errorText: request.failure()?.errorText ?? "",
      routeKey: routeResults.at(-1)?.key ?? null,
      capturedAt: new Date().toISOString(),
    });
  });

  for (const route of routes) {
    const routeStart = performance.now();
    const consoleStart = consoleMessages.length;
    await page.goto(`${frontendUrl}${route.path}`, {
      waitUntil: "domcontentloaded",
      timeout: 90_000,
    });
    await page.waitForLoadState("load", { timeout: 20_000 }).catch(() => {});
    await page.waitForTimeout(1_500); // Allow React Native Web to render and process layout
    await page
      .getByText(route.expectedText, { exact: false })
      .first()
      .waitFor({ timeout: 45_000 });
    const routeEnd = performance.now();

    const performanceSnapshot = await page.evaluate(() => ({
      href: window.location.href,
      title: document.title,
      bodyTextSample: document.body.innerText.slice(0, 500),
      navigation: performance.getEntriesByType("navigation").map((entry) => ({
        name: entry.name,
        startTime: entry.startTime,
        duration: entry.duration,
        domInteractive: entry.domInteractive,
        domContentLoadedEventStart: entry.domContentLoadedEventStart,
        domContentLoadedEventEnd: entry.domContentLoadedEventEnd,
        loadEventStart: entry.loadEventStart,
        loadEventEnd: entry.loadEventEnd,
        transferSize: entry.transferSize,
        encodedBodySize: entry.encodedBodySize,
        decodedBodySize: entry.decodedBodySize,
      })),
      paints: performance.getEntriesByType("paint").map((entry) => ({
        name: entry.name,
        startTime: entry.startTime,
        duration: entry.duration,
      })),
      resources: performance.getEntriesByType("resource").map((entry) => ({
        name: entry.name,
        initiatorType: entry.initiatorType,
        startTime: entry.startTime,
        duration: entry.duration,
        transferSize: entry.transferSize,
        encodedBodySize: entry.encodedBodySize,
        decodedBodySize: entry.decodedBodySize,
      })),
    }));

    const routeResult = {
      ...route,
      url: `${frontendUrl}${route.path}`,
      wallTimeMs: routeEnd - routeStart,
      expectedTextFound: performanceSnapshot.bodyTextSample.includes(route.expectedText),
      performance: performanceSnapshot,
      apiEvents: getRouteApiEvents(apiEvents, routeStart, routeEnd),
      consoleMessages: consoleMessages.slice(consoleStart),
    };
    routeResults.push(routeResult);
    console.log(
      `Pass [${throttle ? "3G" : "Local"}] ${route.path} wall=${round(routeResult.wallTimeMs)}ms api=${routeResult.apiEvents.length} warnings=${routeResult.consoleMessages.length}`,
    );
  }

  await context.close();
  return { routeResults, routeSummaries: routeResults.map(makeRouteSummary) };
}

console.log("Starting Pass 1: Local Network...");
const localPass = await runPass(false);

console.log("\nStarting Pass 2: Throttled Cellular Network (3G)...");
const throttledPass = await runPass(true);

const report = {
  generatedAt: new Date().toISOString(),
  frontendUrl,
  apiRewriteTo,
  viewport: {
    width: 390,
    height: 844,
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 1,
  },
  routes: routes.map((r) => r.path),
  localRoutes: localPass.routeResults,
  localSummaries: localPass.routeSummaries,
  throttledRoutes: throttledPass.routeResults,
  throttledSummaries: throttledPass.routeSummaries,
};

await writeFile(join(outputDir, "mobile-metrics.json"), JSON.stringify(report, null, 2));
await writeFile(join(outputDir, "mobile-metrics.md"), renderMarkdown(report));

await browser.close();
console.log("\nSaved files:");
console.log(join(outputDir, "mobile-metrics.json"));
console.log(join(outputDir, "mobile-metrics.md"));
