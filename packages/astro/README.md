# @responsive-privacy/astro

Astro integration for [Responsive Privacy](https://github.com/draftlab-org/responsive-privacy) — build-time PII protection for static sites. Filters content fields at build time based on a 5-level privacy taxonomy.

## Install

```bash
pnpm add @responsive-privacy/core @responsive-privacy/astro
```

## Setup

### 1. Configure field mappings

Create `responsive-privacy.config.ts` in your project root:

```typescript
import { defineConfig } from '@responsive-privacy/core';

export default defineConfig({
  collections: {
    team: {
      fields: {
        name:       'ID-01',  // Full Name — visible at Level 2+
        photo:      'ID-02',  // Photo — visible at Level 2+
        role:       'ID-03',  // Job Title — visible at Level 1+
        bio:        'ID-04',  // Biography — visible at Level 3+
        email:      'CV-01',  // Email — visible at Level 4 only
        department: 'OR-01',  // Department — visible at Level 1+
      },
    },
  },
});
```

### 2. Add the integration

```javascript
// astro.config.mjs
import { responsivePrivacy } from '@responsive-privacy/astro';
import privacyConfig from './responsive-privacy.config';

export default defineConfig({
  integrations: [responsivePrivacy(privacyConfig)],
});
```

### 3. Filter content in templates

```astro
---
import { getCollection } from 'astro:content';
import { filterCollection } from '@responsive-privacy/astro/helpers';
import privacyConfig from '../responsive-privacy.config';

const rawTeam = await getCollection('team');
const team = filterCollection('team', rawTeam, privacyConfig);
---

{team.map((member) => (
  <div>
    <h3>{member.data.name}</h3>
    {member.data.role && <p>{member.data.role}</p>}
    {member.data.email && <a href={`mailto:${member.data.email}`}>Email</a>}
  </div>
))}
```

### 4. Build at different levels

```bash
PRIVACY_LEVEL=4 astro build   # Full transparency (default)
PRIVACY_LEVEL=1 astro build   # Role only — names replaced
PRIVACY_LEVEL=0 astro build   # Complete anonymity
```

## Template Helpers

Imported from `@responsive-privacy/astro/helpers`:

- **`filterCollection(name, entries, config, level?)`** — filter all entries in a collection, returns entries with transformed `data` and `_privacy` metadata
- **`filterEntry(name, entry, config, level?)`** — filter a single entry
- **`shouldShow(name, fieldName, config, level?)`** — check if a field would be visible (for conditional rendering)
- **`getPrivacyStatus(config, level?)`** — get current level info for display (level, name, description, isReduced)

## Virtual Module

The integration also provides a `virtual:responsive-privacy` module with the config baked in at build time. Add to your `env.d.ts`:

```typescript
/// <reference types="@responsive-privacy/astro/virtual" />
```

Then import directly without passing config:

```typescript
import { PRIVACY_LEVEL, isVisible, isFieldVisible } from 'virtual:responsive-privacy';
```

## Integration Options

```typescript
responsivePrivacy({
  ...config,
  level: 2,        // Override level (instead of reading PRIVACY_LEVEL env var)
  verbose: false,   // Suppress build log output (default: true)
})
```

## License

MIT
