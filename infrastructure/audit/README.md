# MyDash audit environment

This Docker setup is dedicated to performance/security work. It keeps Node
dependencies inside Docker volumes and only bind-mounts project source files.

## Start the app

```bash
docker compose -f infrastructure/audit/docker-compose.yml up --build backend frontend
```

Published services:

- Backend API: http://localhost:3000
- Frontend web: http://localhost:8081
- PostgreSQL: localhost:5434
- Mailpit UI: http://localhost:8026

Audit screenshots for this mobile app should be captured with a phone viewport,
not a desktop viewport. The bundled capture scripts use `390x844`, touch mode,
and a mobile Safari user agent. They currently save DPR 1 PNG files for Docker
stability, so each final capture is `390x844`. When the browser runs inside
Docker, it rewrites
frontend API calls from `http://localhost:3000` and the checked-in Render API
URL to `http://backend:3000`. The Compose frontend also sets
`EXPO_NO_DOTENV=1` and mounts `infrastructure/audit/frontend.env` over
`frontend/.env` inside Docker so the audit stack does not accidentally use the
published API.
Authenticated captures use the seeded audit account and inject the resulting
session into browser storage, so the screenshots stay deterministic.

The backend container applies the local raw schema push before starting:

```bash
pnpm db:push:raw
```

To seed demo credentials inside the Docker database:

```bash
docker compose -f infrastructure/audit/docker-compose.yml run --rm backend pnpm db:seed
```

Default seeded login:

- Email: `admin@mydash.local`
- Password: `password123`

## Run checks in Docker

```bash
docker compose -f infrastructure/audit/docker-compose.yml run --rm backend-check
docker compose -f infrastructure/audit/docker-compose.yml run --rm frontend-check
```

Known current status from the local read-through:

- Backend typecheck and tests pass.
- Frontend lint and Vitest currently fail; keep these failures as audit input
  until they are fixed intentionally.

## Open an audit shell

```bash
docker compose -f infrastructure/audit/docker-compose.yml run --rm audit-shell
```

Useful first commands from the shell:

```bash
cd backend && pnpm audit
cd ../frontend && pnpm audit
```

## Capture mobile screenshots

Keep the stack running, then execute:

```bash
docker compose -f infrastructure/audit/docker-compose.yml run --rm \
  -v "$PWD:/workspace-root" \
  audit-shell node /workspace-root/infrastructure/audit/mobile-capture.mjs
```

Screenshots are written to:

```txt
audit-artifacts/mobile/
```

## Capture the real mobile workflow

The full workflow script uses the coherent fake seed, signs in through the API,
injects the browser session, then performs UI actions on the app:

- seeded dashboard and customer list
- client/prospect creation form and submit
- quote line creation
- quote send
- quote accept
- invoice list after generated invoice
- payment form and submit
- final dashboard

Reset the database first if you need deterministic IDs and counts:

```bash
docker compose -f infrastructure/audit/docker-compose.yml run --rm backend pnpm db:seed
```

Then run:

```bash
docker compose -f infrastructure/audit/docker-compose.yml run --rm \
  -v "$PWD:/workspace-root" \
  audit-shell node /workspace-root/infrastructure/audit/mobile-workflow.mjs
```

Workflow screenshots are written to:

```txt
audit-artifacts/mobile-workflow/
```

## Measure mobile performance

Keep the stack running, then execute:

```bash
docker compose -f infrastructure/audit/docker-compose.yml run --rm \
  -v "$PWD:/workspace-root" \
  audit-shell node /workspace-root/infrastructure/audit/mobile-metrics.mjs
```

Reports are written to:

```txt
audit-artifacts/metrics/mobile-metrics.json
audit-artifacts/metrics/mobile-metrics.md
```

## Measure API smoke timings

This script runs read-only endpoint timings against the seeded backend. It uses
two warmups and twenty measured iterations per endpoint by default.

```bash
docker compose -f infrastructure/audit/docker-compose.yml run --rm \
  -v "$PWD:/workspace-root" \
  audit-shell node /workspace-root/infrastructure/audit/api-smoke-metrics.mjs
```

Reports are written to:

```txt
audit-artifacts/metrics/api-smoke-metrics.json
audit-artifacts/metrics/api-smoke-metrics.md
```

If Expo dev server becomes unstable during long capture sessions, restart it
after Docker image builds or other memory-heavy tasks:

```bash
docker compose -f infrastructure/audit/docker-compose.yml up -d frontend
```
