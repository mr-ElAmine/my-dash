# Dependency security audit

Generated: 2026-05-27
Environment: Docker audit compose

## Commands

- `docker compose -f infrastructure/audit/docker-compose.yml run --rm backend pnpm audit --prod --json`
- `docker compose -f infrastructure/audit/docker-compose.yml run --rm frontend pnpm audit --prod --json`
- `docker compose -f infrastructure/audit/docker-compose.yml run --rm backend pnpm audit --json`
- `docker compose -f infrastructure/audit/docker-compose.yml run --rm frontend pnpm audit --json`

## Current summary

| Scope | Info | Low | Moderate | High | Critical | Result |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Backend prod | 0 | 0 | 0 | 0 | 0 | Passed |
| Backend full | 0 | 0 | 0 | 0 | 0 | Passed |
| Frontend prod | 0 | 0 | 0 | 0 | 0 | Passed |
| Frontend full | 0 | 0 | 0 | 0 | 0 | Passed |

## Remediation applied

| App | Override | Purpose |
| --- | --- | --- |
| Backend | `express>qs: 6.15.2` | Fix production `qs` advisory through Express |
| Backend | `superagent>qs: 6.15.2` | Fix full-audit `qs` advisory through Supertest/Superagent |
| Backend | `minimatch@10.2.5>brace-expansion: 5.0.6` | Fix full-audit `brace-expansion` advisory |
| Backend | `@esbuild-kit/core-utils>esbuild: 0.25.12` | Fix full-audit `esbuild` advisory through Drizzle tooling |
| Frontend | `@expo/metro-config>postcss: 8.5.13` | Fix Expo/Metro `postcss` advisory |
| Frontend | `@expo/cli>ws: 8.20.1` | Fix Expo CLI `ws` advisory |
| Frontend | `minimatch@10.2.5>brace-expansion: 5.0.6` | Fix Expo/ESLint `brace-expansion` advisory |
| Frontend | `xcode>uuid: 11.1.1` | Fix Expo config tooling `uuid` advisory |

## Previous findings now resolved

| App | Package | Previous version | Fixed version | Advisory |
| --- | --- | ---: | ---: | --- |
| Backend | `qs` | 6.15.1 | 6.15.2 | GHSA-q8mj-m7cp-5q26 / CVE-2026-8723 |
| Backend | `brace-expansion` | 5.0.5 | 5.0.6 | GHSA-jxxr-4gwj-5jf2 / CVE-2026-45149 |
| Backend | `esbuild` | 0.18.20 | 0.25.12 | GHSA-67mh-4wv8-2f99 |
| Frontend | `postcss` | 8.4.49 | 8.5.13 | GHSA-qx2v-qp2m-jg93 / CVE-2026-41305 |
| Frontend | `brace-expansion` | 5.0.5 | 5.0.6 | GHSA-jxxr-4gwj-5jf2 / CVE-2026-45149 |
| Frontend | `ws` | 8.20.0 | 8.20.1 | GHSA-58qx-3vcg-4xpx / CVE-2026-45736 |
| Frontend | `uuid` | 7.0.3 | 11.1.1 | GHSA-w5hq-g745-h8pq / CVE-2026-41907 |

## Validation

- Backend production audit: passed with zero advisories.
- Backend full audit: passed with zero advisories.
- Frontend production audit: passed with zero advisories.
- Frontend full audit: passed with zero advisories.
- Backend Docker check after overrides: passed, `89` test files and `614` tests.
- Frontend Docker check after overrides: passed, lint and test.
