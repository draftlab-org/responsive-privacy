/**
 * Default Attribution Taxonomy
 *
 * These defaults are derived directly from the Superbloom/Draftlab
 * "Responsive Transparency" research (2025).
 *
 * Organizations can override any of these in their config.
 * The attribute IDs (ID-01, CV-01, etc.) match the research taxonomy.
 *
 * @see https://research-superbloom.netlify.app/attribution-taxonomy/
 */

import type {
  PrivacyLevelDefinition,
  AttributeDefinition,
} from './types.js';

// ---------------------------------------------------------------------------
// Privacy Levels
// Reference: /attribution-taxonomy/privacy-levels/
// ---------------------------------------------------------------------------

export const DEFAULT_PRIVACY_LEVELS: PrivacyLevelDefinition[] = [
  {
    level: 0,
    name: 'Complete Anonymity',
    description: 'Active threat, immediate danger. No attributes visible.',
  },
  {
    level: 1,
    name: 'Role-Only Visibility',
    description: 'Elevated threat environment. Only generic role and department visible.',
  },
  {
    level: 2,
    name: 'Professional Identity',
    description: 'Moderate threat, maintaining credibility. Name, role, and project attribution visible.',
  },
  {
    level: 3,
    name: 'Public Professional',
    description: 'Standard operations with security awareness. Full professional profile without direct contact.',
  },
  {
    level: 4,
    name: 'Full Transparency',
    description: 'No perceived threat, maximum accessibility. All attributes visible.',
  },
];

// ---------------------------------------------------------------------------
// Attribute Definitions
// Reference: /attribution-taxonomy/attribution-framework/
// ---------------------------------------------------------------------------

export const DEFAULT_ATTRIBUTES: Record<string, AttributeDefinition> = {
  // ---- Identity Attributes ------------------------------------------------
  'ID-01': {
    name: 'Full Name',
    category: 'identity',
    risk: 'high',
    threshold: 2,
    redaction: 'replace',
    redactedValue: 'Staff Member',
  },
  'ID-02': {
    name: 'Photo/Headshot',
    category: 'identity',
    risk: 'high',
    threshold: 2,
    redaction: 'omit',
  },
  'ID-03': {
    name: 'Job Title/Role',
    category: 'identity',
    risk: 'medium',
    threshold: 1,
  },
  'ID-04': {
    name: 'Biography/Background',
    category: 'identity',
    risk: 'medium',
    threshold: 3,
    redaction: 'omit',
  },
  'ID-05': {
    name: 'Professional Credentials',
    category: 'identity',
    risk: 'low',
    threshold: 3,
  },

  // ---- Contact Vectors ----------------------------------------------------
  'CV-01': {
    name: 'Email Address',
    category: 'contact',
    risk: 'very-high',
    threshold: 4,
    redaction: 'replace',
    redactedValue: 'Contact the organization',
  },
  'CV-02': {
    name: 'Phone Number',
    category: 'contact',
    risk: 'very-high',
    threshold: 4,
    redaction: 'omit',
  },
  'CV-03': {
    name: 'Office Location/Address',
    category: 'contact',
    risk: 'very-high',
    threshold: 4,
    redaction: 'omit',
  },
  'CV-04': {
    name: 'Social Media Links',
    category: 'contact',
    risk: 'medium',
    threshold: 3,
    redaction: 'omit',
  },
  'CV-05': {
    name: 'Messaging Handles',
    category: 'contact',
    risk: 'high',
    threshold: 4,
    redaction: 'omit',
  },

  // ---- Organizational Relationships ---------------------------------------
  'OR-01': {
    name: 'Department/Team',
    category: 'organizational',
    risk: 'low',
    threshold: 1,
  },
  'OR-02': {
    name: 'Board Membership',
    category: 'organizational',
    risk: 'medium',
    threshold: 3,
    complianceProtected: true,
  },
  'OR-03': {
    name: 'Partner Organizations',
    category: 'organizational',
    risk: 'medium',
    threshold: 3,
  },
  'OR-04': {
    name: 'Project Associations',
    category: 'organizational',
    risk: 'low',
    threshold: 2,
  },
  'OR-05': {
    name: 'Advisory/Volunteer Status',
    category: 'organizational',
    risk: 'low',
    threshold: 3,
  },

  // ---- Temporal/Activity Data ---------------------------------------------
  'AD-01': {
    name: 'Work Schedule/Availability',
    category: 'activity',
    risk: 'high',
    threshold: 4,
    redaction: 'omit',
  },
  'AD-02': {
    name: 'Event Participation',
    category: 'activity',
    risk: 'medium',
    threshold: 3,
    redaction: 'omit',
  },
  'AD-03': {
    name: 'Publication Dates',
    category: 'activity',
    risk: 'low',
    threshold: 2,
  },
  'AD-04': {
    name: 'Project Timelines',
    category: 'activity',
    risk: 'medium',
    threshold: 3,
  },
  'AD-05': {
    name: 'Bylines/Authorship',
    category: 'activity',
    risk: 'medium',
    threshold: 2,
    redaction: 'replace',
    redactedValue: 'Organization Staff',
  },
};
