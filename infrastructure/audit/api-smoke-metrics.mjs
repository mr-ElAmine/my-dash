import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { performance } from "node:perf_hooks";

const apiOrigin = process.env.API_ORIGIN ?? "http://backend:3000";
const apiBaseUrl = process.env.API_BASE_URL ?? `${apiOrigin}/api`;
const outputDir =
  process.env.API_METRICS_DIR ?? "/workspace-root/audit-artifacts/metrics";
const loginEmail = process.env.SEED_EMAIL ?? "admin@mydash.local";
const loginPassword = process.env.SEED_PASSWORD ?? "password123";
const warmupCount = Number.parseInt(process.env.API_WARMUP ?? "2", 10);
const iterationCount = Number.parseInt(process.env.API_ITERATIONS ?? "20", 10);

await mkdir(outputDir, { recursive: true });

let authToken = "";

function round(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 10) / 10;
}

function percentile(values, ratio) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * ratio) - 1)];
}

async function timedFetch(label, url, init = {}) {
  const startedAt = performance.now();
  const response = await fetch(url, init);
  const finishedAt = performance.now();
  const bodyText = await response.text();
  const durationMs = finishedAt - startedAt;

  let json = null;
  try {
    json = bodyText ? JSON.parse(bodyText) : null;
  } catch {
    json = null;
  }

  return {
    label,
    url,
    method: init.method ?? "GET",
    status: response.status,
    ok: response.ok,
    durationMs,
    bytes: Buffer.byteLength(bodyText),
    json,
    bodyText,
  };
}

async function apiJson(path, init = {}) {
  const response = await timedFetch(path, `${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new Error(
      `${response.method} ${path} returned ${response.status}: ${response.bodyText}`,
    );
  }

  return response.json;
}

async function getSeedContext() {
  const login = await apiJson("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: loginEmail, password: loginPassword }),
  });
  authToken = login.data.accessToken;

  const organizations = await apiJson("/organizations");
  const organization = organizations.data.find((org) => org.status === "active");
  if (!organization) throw new Error("No active organization found");

  const [companies, quotes, invoices] = await Promise.all([
    apiJson(`/organizations/${organization.id}/companies`),
    apiJson(`/organizations/${organization.id}/quotes`),
    apiJson(`/organizations/${organization.id}/invoices`),
  ]);

  return {
    organization,
    company: companies.data[0] ?? null,
    quote: quotes.data[0] ?? null,
    invoice: invoices.data[0] ?? null,
  };
}

function buildEndpoints(context) {
  const endpoints = [
    {
      label: "health",
      url: `${apiOrigin}/health`,
      auth: false,
    },
    {
      label: "auth_me",
      path: "/auth/me",
    },
    {
      label: "organizations_list",
      path: "/organizations",
    },
    {
      label: "dashboard_stats",
      path: `/organizations/${context.organization.id}/dashboard/stats`,
    },
    {
      label: "companies_list",
      path: `/organizations/${context.organization.id}/companies`,
    },
    {
      label: "contacts_list",
      path: `/organizations/${context.organization.id}/contacts`,
    },
    {
      label: "quotes_list",
      path: `/organizations/${context.organization.id}/quotes`,
    },
    {
      label: "invoices_list",
      path: `/organizations/${context.organization.id}/invoices`,
    },
    {
      label: "notes_list",
      path: `/organizations/${context.organization.id}/notes`,
    },
  ];

  if (context.company) {
    endpoints.push({
      label: "company_detail",
      path: `/organizations/${context.organization.id}/companies/${context.company.id}`,
    });
  }

  if (context.quote) {
    endpoints.push({
      label: "quote_detail",
      path: `/organizations/${context.organization.id}/quotes/${context.quote.id}`,
    });
  }

  if (context.invoice) {
    endpoints.push(
      {
        label: "invoice_detail",
        path: `/organizations/${context.organization.id}/invoices/${context.invoice.id}`,
      },
      {
        label: "payments_list",
        path: `/organizations/${context.organization.id}/invoices/${context.invoice.id}/payments`,
      },
    );
  }

  return endpoints;
}

function summarize(endpoint, samples) {
  const durations = samples.map((sample) => sample.durationMs);
  const bytes = samples.map((sample) => sample.bytes);
  const failures = samples.filter((sample) => !sample.ok);
  return {
    label: endpoint.label,
    method: endpoint.method ?? "GET",
    path: endpoint.path ?? endpoint.url,
    samples: samples.length,
    statusCodes: [...new Set(samples.map((sample) => sample.status))],
    minMs: round(Math.min(...durations)),
    avgMs: round(durations.reduce((total, value) => total + value, 0) / durations.length),
    p50Ms: round(percentile(durations, 0.5)),
    p95Ms: round(percentile(durations, 0.95)),
    maxMs: round(Math.max(...durations)),
    avgBytes: round(bytes.reduce((total, value) => total + value, 0) / bytes.length),
    failures: failures.length,
  };
}

async function runEndpoint(endpoint, iteration) {
  const url = endpoint.url ?? `${apiBaseUrl}${endpoint.path}`;
  const headers = endpoint.auth === false ? {} : { Authorization: `Bearer ${authToken}` };
  return timedFetch(endpoint.label, url, {
    method: endpoint.method ?? "GET",
    headers,
  }).then((result) => ({ ...result, iteration }));
}

function renderMarkdown(report) {
  const lines = [
    "# API smoke metrics",
    "",
    `Generated: ${report.generatedAt}`,
    `API origin: ${report.apiOrigin}`,
    `Warmup: ${report.warmupCount}`,
    `Iterations: ${report.iterationCount}`,
    "",
    "| Endpoint | Status | Avg | P50 | P95 | Max | Avg bytes | Failures |",
    "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |",
  ];

  for (const item of report.summaries) {
    lines.push(
      `| ${item.label} | ${item.statusCodes.join(", ")} | ${item.avgMs} ms | ${item.p50Ms} ms | ${item.p95Ms} ms | ${item.maxMs} ms | ${item.avgBytes} | ${item.failures} |`,
    );
  }

  lines.push(
    "",
    "## Notes",
    "",
    "- All endpoints were measured from the Docker audit network against the seeded local backend.",
    "- These are lightweight smoke timings, not a load test.",
    "- Mutating endpoints are intentionally excluded so the seed state stays stable.",
    "",
  );

  return lines.join("\n");
}

const context = await getSeedContext();
const endpoints = buildEndpoints(context);
const results = [];

for (const endpoint of endpoints) {
  for (let i = 0; i < warmupCount; i += 1) {
    await runEndpoint(endpoint, `warmup-${i + 1}`);
  }

  const samples = [];
  for (let i = 0; i < iterationCount; i += 1) {
    const result = await runEndpoint(endpoint, i + 1);
    samples.push(result);
  }

  results.push({ endpoint, samples });
  const summary = summarize(endpoint, samples);
  console.log(
    `${summary.label} avg=${summary.avgMs}ms p95=${summary.p95Ms}ms failures=${summary.failures}`,
  );
}

const report = {
  generatedAt: new Date().toISOString(),
  apiOrigin,
  apiBaseUrl,
  warmupCount,
  iterationCount,
  seededContext: {
    organizationId: context.organization.id,
    companyId: context.company?.id ?? null,
    quoteId: context.quote?.id ?? null,
    invoiceId: context.invoice?.id ?? null,
  },
  summaries: results.map((result) => summarize(result.endpoint, result.samples)),
  results,
};

await writeFile(join(outputDir, "api-smoke-metrics.json"), JSON.stringify(report, null, 2));
await writeFile(join(outputDir, "api-smoke-metrics.md"), renderMarkdown(report));

console.log(join(outputDir, "api-smoke-metrics.json"));
console.log(join(outputDir, "api-smoke-metrics.md"));
