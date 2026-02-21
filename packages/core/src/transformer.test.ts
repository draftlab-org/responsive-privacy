/**
 * Tests for the core transformer.
 * Run with: node --test dist/transformer.test.js
 */

import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { transformEntry, buildSummary, isAttributeVisible } from './transformer.js';
import { createContext, resolveConfig } from './config.js';
import { DEFAULT_ATTRIBUTES } from './defaults.js';
import type { ResponsivePrivacyConfig, PrivacyContext } from './types.js';

// Test config mapping a simple "team" collection
const testConfig: ResponsivePrivacyConfig = {
  collections: {
    team: {
      fields: {
        name: 'ID-01',       // threshold 2
        photo: 'ID-02',      // threshold 2
        role: 'ID-03',       // threshold 1
        bio: 'ID-04',        // threshold 3
        email: 'CV-01',      // threshold 4
        department: 'OR-01', // threshold 1
      },
    },
    posts: {
      fields: {
        author: 'ID-01',
        byline: 'AD-05',     // threshold 2
        publishDate: 'AD-03', // threshold 2
      },
    },
  },
};

// Sample team member data
const teamMember = {
  name: 'Jane Smith',
  photo: '/images/jane.jpg',
  role: 'Program Director',
  bio: 'Jane has 15 years of experience in humanitarian response.',
  email: 'jane@example.org',
  department: 'Programs',
  slug: 'jane-smith', // unmapped field — should pass through
};

describe('isAttributeVisible', () => {
  it('should show Level 1+ attributes at Level 1', () => {
    assert.equal(isAttributeVisible('ID-03', 1, DEFAULT_ATTRIBUTES), true);
    assert.equal(isAttributeVisible('OR-01', 1, DEFAULT_ATTRIBUTES), true);
  });

  it('should hide Level 2+ attributes at Level 1', () => {
    assert.equal(isAttributeVisible('ID-01', 1, DEFAULT_ATTRIBUTES), false);
    assert.equal(isAttributeVisible('ID-02', 1, DEFAULT_ATTRIBUTES), false);
  });

  it('should show all attributes at Level 4', () => {
    for (const [id] of Object.entries(DEFAULT_ATTRIBUTES)) {
      assert.equal(isAttributeVisible(id, 4, DEFAULT_ATTRIBUTES), true,
        `${id} should be visible at Level 4`);
    }
  });

  it('should hide all attributes at Level 0', () => {
    for (const [id, attr] of Object.entries(DEFAULT_ATTRIBUTES)) {
      if (attr.threshold > 0) {
        assert.equal(isAttributeVisible(id, 0, DEFAULT_ATTRIBUTES), false,
          `${id} (threshold ${attr.threshold}) should be hidden at Level 0`);
      }
    }
  });

  it('should treat unknown attributes as visible', () => {
    assert.equal(isAttributeVisible('UNKNOWN-99', 0, DEFAULT_ATTRIBUTES), true);
  });
});

describe('transformEntry — Level 4 (Full Transparency)', () => {
  const ctx = createContext(testConfig, 4);

  it('should pass through all fields', () => {
    const result = transformEntry('team', teamMember, ctx);
    assert.equal(result.hiddenFields.length, 0);
    assert.equal(result.data.name, 'Jane Smith');
    assert.equal(result.data.email, 'jane@example.org');
    assert.equal(result.data.slug, 'jane-smith');
  });
});

describe('transformEntry — Level 2 (Professional Identity)', () => {
  const ctx = createContext(testConfig, 2);

  it('should show name, photo, role, department', () => {
    const result = transformEntry('team', teamMember, ctx);
    assert.equal(result.data.name, 'Jane Smith');
    assert.equal(result.data.photo, '/images/jane.jpg');
    assert.equal(result.data.role, 'Program Director');
    assert.equal(result.data.department, 'Programs');
  });

  it('should hide bio (threshold 3) and email (threshold 4)', () => {
    const result = transformEntry('team', teamMember, ctx);
    assert.ok(result.hiddenFields.includes('bio'));
    assert.ok(result.hiddenFields.includes('email'));
  });

  it('should replace email with redacted value', () => {
    const result = transformEntry('team', teamMember, ctx);
    // CV-01 has redaction: 'replace', redactedValue: 'Contact the organization'
    assert.equal(result.data.email, 'Contact the organization');
  });

  it('should omit bio entirely', () => {
    const result = transformEntry('team', teamMember, ctx);
    // ID-04 has redaction: 'omit'
    assert.equal(result.data.bio, undefined);
    assert.ok(!('bio' in result.data));
  });

  it('should pass through unmapped fields', () => {
    const result = transformEntry('team', teamMember, ctx);
    assert.equal(result.data.slug, 'jane-smith');
  });
});

describe('transformEntry — Level 1 (Role-Only)', () => {
  const ctx = createContext(testConfig, 1);

  it('should replace name with "Staff Member"', () => {
    const result = transformEntry('team', teamMember, ctx);
    // ID-01 has redaction: 'replace', redactedValue: 'Staff Member'
    assert.equal(result.data.name, 'Staff Member');
  });

  it('should show only role and department', () => {
    const result = transformEntry('team', teamMember, ctx);
    assert.equal(result.data.role, 'Program Director');
    assert.equal(result.data.department, 'Programs');
  });

  it('should hide photo via omit', () => {
    const result = transformEntry('team', teamMember, ctx);
    assert.ok(!('photo' in result.data));
  });
});

describe('transformEntry — Level 0 (Complete Anonymity)', () => {
  const ctx = createContext(testConfig, 0);

  it('should hide all mapped fields', () => {
    const result = transformEntry('team', teamMember, ctx);
    // All thresholds are >= 1, so everything mapped should be hidden
    assert.ok(result.hiddenFields.includes('name'));
    assert.ok(result.hiddenFields.includes('photo'));
    assert.ok(result.hiddenFields.includes('role'));
    assert.ok(result.hiddenFields.includes('bio'));
    assert.ok(result.hiddenFields.includes('email'));
    assert.ok(result.hiddenFields.includes('department'));
  });

  it('should still pass through unmapped fields', () => {
    const result = transformEntry('team', teamMember, ctx);
    assert.equal(result.data.slug, 'jane-smith');
  });

  it('should apply redaction strategies even at Level 0', () => {
    const result = transformEntry('team', teamMember, ctx);
    // ID-01 (name) should be replaced, not omitted
    assert.equal(result.data.name, 'Staff Member');
    // CV-01 (email) should be replaced
    assert.equal(result.data.email, 'Contact the organization');
  });
});

describe('transformEntry — unconfigured collection', () => {
  const ctx = createContext(testConfig, 0);

  it('should pass through all data unchanged', () => {
    const result = transformEntry('unknown-collection', teamMember, ctx);
    assert.equal(result.hiddenFields.length, 0);
    assert.equal(result.data.name, 'Jane Smith');
    assert.equal(result.data.email, 'jane@example.org');
  });
});

describe('compliance warnings', () => {
  const ctx = createContext(testConfig, 0);

  it('should warn when hiding compliance-protected attributes', () => {
    // OR-02 (Board Membership) is complianceProtected
    const data = { boardRole: 'Board Chair' };
    const config: ResponsivePrivacyConfig = {
      collections: {
        governance: {
          fields: { boardRole: 'OR-02' },
        },
      },
    };
    const govCtx = createContext(config, 1); // Below threshold 3
    const result = transformEntry('governance', data, govCtx);
    assert.ok(result.warnings.length > 0);
    assert.ok(result.warnings[0].includes('Compliance-protected'));
    assert.ok(result.warnings[0].includes('Board Membership'));
  });
});

describe('buildSummary', () => {
  it('should produce a readable summary', () => {
    const ctx = createContext(testConfig, 1);
    const results = new Map<string, any[]>();
    results.set('team', [transformEntry('team', teamMember, ctx)]);

    const summary = buildSummary(results, ctx);
    assert.ok(summary.includes('Level: 1'));
    assert.ok(summary.includes('Role-Only Visibility'));
    assert.ok(summary.includes('team'));
    assert.ok(summary.includes('fields hidden'));
  });
});
