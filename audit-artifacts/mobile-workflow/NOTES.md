# Mobile workflow capture notes

Viewport: mobile `390x844`, touch enabled, mobile Safari user agent.

Generated from the Docker audit stack with:

```bash
docker compose -f infrastructure/audit/docker-compose.yml run --rm backend pnpm db:seed
docker compose -f infrastructure/audit/docker-compose.yml run --rm \
  -v "$PWD:/workspace-root" \
  audit-shell node /workspace-root/infrastructure/audit/mobile-workflow.mjs
```

Captured workflow:

- seeded dashboard
- companies list
- filled new company form
- created prospect confirmation
- filled quote line form
- quote detail after line addition
- quote sent
- existing sent quote before acceptance
- quote accepted
- invoice list after quote acceptance
- filled payment form
- invoice marked paid
- dashboard after workflow

Runtime warnings observed during capture:

- `colorKit.RGB` failed to convert some color values and fell back to black.
- React Native Web warned about deprecated `pointerEvents` and `shadow*` props.
- One React Native Web warning reported an unexpected text node inside `View`.
- React 19 warned about `element.ref` access.
- Reanimated warned that the selected easing is not supported on web.
