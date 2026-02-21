# @responsive-privacy/core

Framework-agnostic build-time PII protection engine. Filters, redacts, or omits content fields based on a 5-level privacy taxonomy derived from the [Superbloom/Draftlab Responsive Transparency research](https://research-superbloom.netlify.app/).

Part of the [Responsive Privacy](https://github.com/draftlab-org/responsive-privacy) monorepo.

## Install

```bash
pnpm add @responsive-privacy/core
```

## Usage

```typescript
import { defineConfig, createContext, transformEntry } from '@responsive-privacy/core';

const config = defineConfig({
  collections: {
    team: {
      fields: {
        name:       'ID-01',  // Full Name — visible at Level 2+
        role:       'ID-03',  // Job Title — visible at Level 1+
        email:      'CV-01',  // Email — visible at Level 4 only
        department: 'OR-01',  // Department — visible at Level 1+
      },
    },
  },
});

// Create context for the current build (reads PRIVACY_LEVEL env var)
const ctx = createContext(config);

// Transform a content entry
const result = transformEntry('team', {
  name: 'Jane Smith',
  role: 'Program Director',
  email: 'jane@example.org',
  department: 'Programs',
}, ctx);

// At PRIVACY_LEVEL=1:
// result.data.name → "Staff Member" (replaced)
// result.data.role → "Program Director" (visible)
// result.data.email → "Contact the organization" (replaced)
// result.data.department → "Programs" (visible)
```

## API

### Configuration

- **`defineConfig(config)`** — define a privacy configuration with collection field mappings
- **`resolveConfig(config)`** — merge user config with the default 20-attribute taxonomy
- **`readPrivacyLevel(fallback?)`** — read `PRIVACY_LEVEL` from env (0–4, defaults to 4)
- **`createContext(config, level?)`** — create a resolved privacy context for a build

### Transformer

- **`transformEntry(collectionName, data, ctx)`** — transform a single entry's fields based on privacy level
- **`transformCollection(collectionName, entries, ctx)`** — transform an array of entries
- **`isAttributeVisible(attributeId, level, attributes)`** — check if an attribute is visible at a given level
- **`getRedactedValue(attr)`** — get the replacement value for a hidden attribute
- **`buildSummary(results, ctx)`** — generate a build log showing what was hidden

### Defaults

The full 20-attribute taxonomy ships as defaults and can be imported separately:

```typescript
import { DEFAULT_ATTRIBUTES, DEFAULT_PRIVACY_LEVELS } from '@responsive-privacy/core/defaults';
```

## Privacy Levels

| Level | Name | What's Visible |
|-------|------|----------------|
| 0 | Complete Anonymity | Nothing — all PII hidden |
| 1 | Role-Only Visibility | Job titles and departments only |
| 2 | Professional Identity | Names, roles, project attribution |
| 3 | Public Professional | Full professional profile, no contact info |
| 4 | Full Transparency | Everything including contact details |

## License

MIT
