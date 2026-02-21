# CLAUDE.md — Project Context for Claude Code

## Project Overview

**Responsive Privacy** is a build-time PII protection system for static sites, designed as a standalone package that can be installed into Astro-based website templates (initially targeting scaffold.draftlab.org which uses PagesCMS).

The core concept: civil society organizations need public transparency for credibility, but that visibility exposes staff to threats. This package lets them build the same site at different "privacy levels" (0–4) without deleting content — fields are filtered, redacted, or omitted at build time based on an evidence-based taxonomy.

### Research Foundation

The schema and taxonomy are derived from published research:
- **Research site**: https://research-superbloom.netlify.app/
- **Key pages**: /attribution-taxonomy/privacy-levels/, /attribution-taxonomy/attribution-framework/, /attribution-taxonomy/risk-response-matrix/, /attribution-taxonomy/restoration-framework/
- **Authors**: Philliph Drummond (Superbloom) & Tin Geber (Draftlab)
- **GitHub**: https://github.com/sprblm/research.superbloom.design (private repo)

The Attribution Framework defines 20 attributes across 4 categories (Identity, Contact Vectors, Organizational Relationships, Temporal/Activity Data), each with a risk level and a privacy level threshold (0–4). This taxonomy is encoded in `packages/core/src/defaults.ts`.

## Architecture

```
responsive-privacy/
├── packages/
│   ├── core/         # Framework-agnostic engine, zero deps beyond TS
│   │   └── src/
│   │       ├── types.ts            # Schema types derived from research taxonomy
│   │       ├── defaults.ts         # Full 20-attribute taxonomy as defaults
│   │       ├── config.ts           # defineConfig(), resolveConfig(), env var reader
│   │       ├── transformer.ts      # Core engine: content + level → filtered output
│   │       ├── transformer.test.ts # 20 tests, all passing
│   │       └── index.ts            # Barrel export
│   ├── astro/        # Astro integration
│   │   └── src/
│   │       ├── index.ts      # Integration hook + Vite virtual module
│   │       ├── helpers.ts    # filterCollection(), filterEntry(), shouldShow()
│   │       └── virtual.d.ts  # Type declarations for virtual:responsive-privacy
│   └── pagescms/     # PagesCMS plugin (not yet implemented)
└── playground/       # Demo Astro site with sample team data
```

### How It Works

1. Template author maps CMS content fields to taxonomy attribute IDs in `responsive-privacy.config.ts`
2. At build time, `PRIVACY_LEVEL` env var (0–4) determines what's visible
3. The Astro integration injects a Vite virtual module and provides helper functions
4. In `.astro` templates, `filterCollection()` wraps `getCollection()` and returns transformed data
5. Fields below the threshold are either omitted or replaced with redacted values (e.g. name → "Staff Member")

### Key Design Decisions

- **Build-time only** — sensitive data never ships to the client. No runtime toggling (intentional for v1).
- **Fail-open for unmapped fields** — fields not in the config pass through unchanged.
- **Defaults from research** — the full taxonomy ships as defaults; orgs override only what they need.
- **Compliance flags** — `complianceProtected: true` on attributes (e.g. Board Membership) emits warnings but doesn't block the build.

## Current State

### ✅ Completed
- Core package: types, defaults, config resolver, transformer engine — **built and tested** (20/20 tests pass)
- Astro integration: Vite virtual module, integration hooks, template helpers — **written, not yet build-tested with Astro**
- Playground: demo site with 3 sample team members, team page component, layout — **written, not yet run**
- README with full taxonomy reference table and usage docs

### 🔨 Immediate Next Steps
1. **Get the playground running**: `pnpm install` at root, build the core, then `pnpm --filter playground dev` to verify the Astro integration works end-to-end
2. **Fix any Astro integration issues** — the virtual module and helpers haven't been tested against an actual Astro build yet
3. **Test all 5 privacy levels** — run `PRIVACY_LEVEL=0` through `4` and verify output differs correctly
4. **Add the PagesCMS integration** — `packages/pagescms/` is an empty directory; needs a config schema and webhook trigger

### 📋 v1 Roadmap (in priority order)
1. End-to-end playground working at all 5 levels
2. Integration with scaffold.draftlab.org (map actual content fields)
3. PagesCMS configuration page — UI for setting privacy level + triggering rebuild
4. GitHub Actions / Coolify webhook to accept privacy level parameter
5. Build summary output (audit log of what was hidden per build)

### 🗓️ v2 Features (deferred by design)
- **Individual-based scoping** — per-person privacy preferences (research supports this: 32% want collaborative control)
- **Page-specific scoping** — different levels for different pages (e.g. team page at Level 1, project pages at Level 3)
- **Restoration framework** — graduated restoration, state preservation, individual opt-in restoration (see research: /attribution-taxonomy/restoration-framework/)
- **Network coordination** — partner org threat response propagation
- **Role-based scoping** — higher-risk roles (directors, field staff) get different defaults
- **Automatic time-based restoration** — preset duration privacy modes that auto-expire

## Commands

```bash
# Install dependencies (from project root)
pnpm install

# Build the core package
cd packages/core && pnpm build

# Run core tests
cd packages/core && node --test dist/transformer.test.js

# Run playground dev server
pnpm --filter playground dev

# Build playground at specific privacy levels
cd playground
PRIVACY_LEVEL=4 pnpm build   # Full transparency
PRIVACY_LEVEL=2 pnpm build   # Professional identity
PRIVACY_LEVEL=0 pnpm build   # Complete anonymity
```

## Code Conventions

- **TypeScript strict mode** everywhere
- **ESM only** (`"type": "module"` in all package.json files)
- **pnpm workspaces** for monorepo management
- **Node test runner** (node:test) for core tests — no test framework dependency
- Heavy JSDoc comments with `@see` links back to research taxonomy pages
- Attribute IDs follow the research format: `ID-XX`, `CV-XX`, `OR-XX`, `AD-XX`

## Related Projects

- **scaffold.draftlab.org** — the Astro + PagesCMS website template this will be integrated into
- **research-superbloom.netlify.app** — the research site (built with Astro Starlight)
- **Superbloom Design** (superbloom.design) — the design research org that conducted the study
- **Draftlab** (draftlab.org) — Tin's consultancy, building this as part of their template toolkit

## Key Files to Understand First

1. `packages/core/src/types.ts` — the schema; everything flows from these types
2. `packages/core/src/defaults.ts` — the taxonomy data; maps directly to the research
3. `packages/core/src/transformer.ts` — the engine; `transformEntry()` is the core function
4. `packages/astro/src/helpers.ts` — what template authors actually use
5. `playground/responsive-privacy.config.ts` — example of how an org configures it
6. `playground/src/pages/index.astro` — example of how templates consume filtered data
