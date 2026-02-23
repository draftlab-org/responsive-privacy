# Responsive Privacy

[![npm core](https://img.shields.io/npm/v/@responsive-privacy/core?label=core)](https://www.npmjs.com/package/@responsive-privacy/core)
[![npm astro](https://img.shields.io/npm/v/@responsive-privacy/astro?label=astro)](https://www.npmjs.com/package/@responsive-privacy/astro)
[![license](https://img.shields.io/npm/l/@responsive-privacy/core)](./LICENSE)

Build-time PII protection for static sites. Toggle staff visibility across five privacy levels without destroying content.

Based on the [Superbloom/Draftlab Responsive Transparency research](https://research-superbloom.netlify.app/) — an evidence-based taxonomy for managing organizational PII exposure.

## The Problem

Civil society organizations need public transparency for credibility, but that visibility exposes staff to harassment, doxxing, and physical threats. Current solutions involve destructive deletion that takes hours. Staff need protection within minutes.

## The Solution

Responsive Privacy lets you build the same site at different privacy levels. Content is never deleted — it's filtered at build time based on the Attribution Taxonomy's five-tier system:

| Level | Name                  | What's Visible                             |
| ----- | --------------------- | ------------------------------------------ |
| **0** | Complete Anonymity    | Nothing — all PII hidden                   |
| **1** | Role-Only Visibility  | Job titles and departments only            |
| **2** | Professional Identity | Names, roles, project attribution          |
| **3** | Public Professional   | Full professional profile, no contact info |
| **4** | Full Transparency     | Everything including contact details       |

## Quick Start

### 1. Install

```bash
pnpm add @responsive-privacy/core @responsive-privacy/astro
```

### 2. Configure

Create `responsive-privacy.config.ts` in your project root:

```typescript
import { defineConfig } from "@responsive-privacy/core";

export default defineConfig({
	collections: {
		team: {
			fields: {
				name: "ID-01", // Full Name → visible at Level 2+
				photo: "ID-02", // Photo → visible at Level 2+
				role: "ID-03", // Job Title → visible at Level 1+
				bio: "ID-04", // Biography → visible at Level 3+
				email: "CV-01", // Email → visible at Level 4 only
				department: "OR-01", // Department → visible at Level 1+
			},
		},
	},
});
```

### 3. Add the Astro integration

```javascript
// astro.config.mjs
import { responsivePrivacy } from "@responsive-privacy/astro";
import privacyConfig from "./responsive-privacy.config";

export default defineConfig({
	integrations: [responsivePrivacy(privacyConfig)],
});
```

### 4. Filter content in your templates

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
    <h3>{member.data.name}</h3>         {/* "Staff Member" at Level 0-1 */}
    {member.data.role && <p>{member.data.role}</p>}  {/* hidden at Level 0 */}
    {member.data.email && <a href={`mailto:${member.data.email}`}>Email</a>}
  </div>
))}
```

### 5. Build at different levels

```bash
# Normal build — full transparency
astro build

# Threat response — hide identities
PRIVACY_LEVEL=1 astro build

# Emergency — complete anonymity
PRIVACY_LEVEL=0 astro build
```

## How It Works

Each content field is mapped to an **Attribute ID** from the taxonomy (e.g. `ID-01` = Full Name, `CV-01` = Email). Each attribute has a **privacy level threshold** — the minimum level at which it's visible.

At build time, the package reads `PRIVACY_LEVEL` from the environment, compares it to each attribute's threshold, and either passes the field through, replaces it with a redacted value (e.g. "Staff Member"), or omits it entirely.

Content is never modified or deleted. The same source produces different outputs at different levels.

## Packages

| Package                     | Description                                                 |
| --------------------------- | ----------------------------------------------------------- |
| `@responsive-privacy/core`  | Framework-agnostic transformer engine and taxonomy defaults |
| `@responsive-privacy/astro` | Astro integration, virtual module, and template helpers     |

## Attribution Taxonomy Reference

The default attribute definitions ship with the package. Here's the full mapping:

### Identity Attributes

| ID    | Name           | Risk   | Threshold | Redaction                |
| ----- | -------------- | ------ | --------- | ------------------------ |
| ID-01 | Full Name      | High   | Level 2   | Replace → "Staff Member" |
| ID-02 | Photo/Headshot | High   | Level 2   | Omit                     |
| ID-03 | Job Title/Role | Medium | Level 1   | Omit                     |
| ID-04 | Biography      | Medium | Level 3   | Omit                     |
| ID-05 | Credentials    | Low    | Level 3   | Omit                     |

### Contact Vectors

| ID    | Name              | Risk      | Threshold | Redaction                            |
| ----- | ----------------- | --------- | --------- | ------------------------------------ |
| CV-01 | Email Address     | Very High | Level 4   | Replace → "Contact the organization" |
| CV-02 | Phone Number      | Very High | Level 4   | Omit                                 |
| CV-03 | Office Location   | Very High | Level 4   | Omit                                 |
| CV-04 | Social Media      | Medium    | Level 3   | Omit                                 |
| CV-05 | Messaging Handles | High      | Level 4   | Omit                                 |

### Organizational Relationships

| ID    | Name                 | Risk   | Threshold | Redaction                      |
| ----- | -------------------- | ------ | --------- | ------------------------------ |
| OR-01 | Department/Team      | Low    | Level 1   | Omit                           |
| OR-02 | Board Membership     | Medium | Level 3   | Omit (⚠️ compliance protected) |
| OR-03 | Partner Orgs         | Medium | Level 3   | Omit                           |
| OR-04 | Project Associations | Low    | Level 2   | Omit                           |
| OR-05 | Advisory Status      | Low    | Level 3   | Omit                           |

### Temporal/Activity Data

| ID    | Name                | Risk   | Threshold | Redaction                      |
| ----- | ------------------- | ------ | --------- | ------------------------------ |
| AD-01 | Work Schedule       | High   | Level 4   | Omit                           |
| AD-02 | Event Participation | Medium | Level 3   | Omit                           |
| AD-03 | Publication Dates   | Low    | Level 2   | Omit                           |
| AD-04 | Project Timelines   | Medium | Level 3   | Omit                           |
| AD-05 | Bylines/Authorship  | Medium | Level 2   | Replace → "Organization Staff" |

## Customization

Override any default threshold or redaction strategy:

```typescript
import { defineConfig } from "@responsive-privacy/core";

export default defineConfig({
	// Override defaults for your organization
	attributes: {
		"ID-01": {
			name: "Full Name",
			category: "identity",
			risk: "high",
			threshold: 3, // Your org wants names hidden more aggressively
			redaction: "replace",
			redactedValue: "Anonymous",
		},
	},
	collections: {
		/* ... */
	},
});
```

## Deployment Integration

Trigger privacy-level builds via webhook from your CMS or deploy platform:

```bash
# Coolify / GitHub Actions / Netlify build command
PRIVACY_LEVEL=${{ inputs.privacy_level }} astro build
```

For PagesCMS, configure a webhook that passes the privacy level as an environment variable to your build pipeline.

## Research

This project implements the Attribution Taxonomy from:

> **Responsive Transparency: An Analysis of Organizational Readiness for PII Protection**
> Philliph Drummond (Superbloom) & Tin Geber (Draftlab), 2025
> https://research-superbloom.netlify.app/

## License

MIT
