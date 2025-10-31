# Sentinel Multi-Report Implementation Plan

## Overall Goals
- Normalize every report JSON to match the canonical `old.json` schema.
- Ensure each report renders correctly across all Sentinel Portal views.
- Highlight TRM methodology per report, aligned with *Less is More: Recursive Reasoning with Tiny Networks*.
- Provide per-report executive summaries and portal to-do lists.

## Global Tasks
1. Update `vite.config.ts` and Router to honor `BASE_URL` (done).
2. Add a report catalog, selector, and descriptor plumbing (done).
3. Normalise JSON schema for each report.
4. Update narrative content (Security Report, Overview, Impact) per report.
5. Verify all Sentinel portal pages render data from each report.
6. Document and test before deployment.

## Schema Normalisation Checklist (per report)
For each `public/reports/<slug>.json`:
- [ ] Replace severities to match enum (`Critical | High | Medium | Low | Info | N/A`).
- [ ] Flatten findings to `{ source, details { ... } }` shape.
- [ ] Move custom fields (`status`, `recommendation`, etc.) into canonical `details` properties.
- [ ] Ensure `meta.project_root`, `meta.files`, `meta.generated_at?` exist.
- [ ] Optionally add/update `log` array if we have provenance entries.

## Reports
### Balancer (`balancer.json`)
- [ ] Replace placeholder with reshaped `3263143758717162746.json` data.
- [ ] Confirm TRM bullets and summary reflect Balancer context.

### CCTP (`cctp.json`)
- [ ] Convert `"Informational"` severities to `"Info"`.
- [ ] Map `status`, `evidence`, etc. into canonical fields.
- [ ] Provide final summary + TRM highlights referencing bridge admin operations.

### Maradona (`maradona.json`)
- [ ] Normalize schema.
- [ ] Emphasise initializer drift and hub vulnerabilities in summary/TRM sections.

### Stargate (`stargate.json`)
- [ ] Normalize schema.
- [ ] Highlight beacon rotation risks + TRM methodology in summary.

### SushiSwap (`sushiswap.json`)
- [ ] Move `scope` → `meta`.
- [ ] Normalize findings.
- [ ] Highlight governance vault risks in summary.

### Uniswap V3 (`uniswapv3.json`)
- [ ] Normalize schema.
- [ ] Update summary to align with Uniswap-specific findings.

## Narrative Updates
- [ ] SecurityReport: fetch descriptor data and render contract-specific TRM sections.
- [ ] Overview: use descriptor summary, chain, category; update to-do list.
- [ ] Impact: incorporate descriptor name and TRM messaging.
- [ ] Consider referencing TRM methodology (recursive reasoning, latent refinements) in each section.

## Validation
- [ ] `npm run build` (local).
- [ ] `npm run dev` to inspect each slug manually.
- [ ] `npm run test` (ensure guardrails test passes).

## Deployment
- [ ] Push to `main`.
- [ ] Trigger GitHub Actions `Deploy Sentinel` workflow.
- [ ] Verify `https://lockthebow.github.io/Sentinel/` renders every report.
