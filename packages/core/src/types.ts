/**
 * Responsive Privacy — Core Type Definitions
 *
 * Schema derived from the Superbloom/Draftlab "Responsive Transparency"
 * Attribution Taxonomy research (2025).
 *
 * @see https://research-superbloom.netlify.app/attribution-taxonomy/
 */

// ---------------------------------------------------------------------------
// Privacy Levels (0–4)
// Reference: /attribution-taxonomy/privacy-levels/
// ---------------------------------------------------------------------------

/**
 * Privacy levels map directly to the taxonomy's 5-tier system.
 * Higher numbers = more information visible.
 *
 * - Level 0: Complete Anonymity — active threat, immediate danger
 * - Level 1: Role-Only Visibility — elevated threat environment
 * - Level 2: Professional Identity — moderate threat, maintaining credibility
 * - Level 3: Public Professional — standard operations with security awareness
 * - Level 4: Full Transparency — no perceived threat, maximum accessibility
 */
export type PrivacyLevel = 0 | 1 | 2 | 3 | 4;

export interface PrivacyLevelDefinition {
  level: PrivacyLevel;
  name: string;
  description: string;
}

// ---------------------------------------------------------------------------
// Risk Levels
// Reference: /attribution-taxonomy/risk-response-matrix/
// ---------------------------------------------------------------------------

/**
 * Risk levels from the Risk and Response Matrix.
 * Determines removal urgency and informs default thresholds.
 */
export type RiskLevel = 'very-high' | 'high' | 'medium' | 'low';

// ---------------------------------------------------------------------------
// Attribute Categories
// Reference: /attribution-taxonomy/attribution-framework/
// ---------------------------------------------------------------------------

/**
 * The four attribute categories from the Attribution Framework.
 */
export type AttributeCategory = 'identity' | 'contact' | 'organizational' | 'activity';

// ---------------------------------------------------------------------------
// Redaction Strategies
// ---------------------------------------------------------------------------

/**
 * How to handle content that falls below the current privacy level threshold.
 *
 * - 'omit': Remove the field entirely from rendered output
 * - 'replace': Substitute with a generic redacted value
 *
 * When not specified, defaults to 'omit'.
 */
export type RedactionStrategy = 'omit' | 'replace';

// ---------------------------------------------------------------------------
// Attribute Definitions
// Reference: /attribution-taxonomy/attribution-framework/ (all four tables)
// ---------------------------------------------------------------------------

export interface AttributeDefinition {
  /** Human-readable name, e.g. "Full Name" */
  name: string;

  /** Which category this attribute belongs to */
  category: AttributeCategory;

  /** Risk level from the taxonomy */
  risk: RiskLevel;

  /**
   * Minimum privacy level at which this attribute is visible.
   * If the current build level is below this threshold, the attribute is hidden.
   *
   * Example: threshold 2 means visible at levels 2, 3, 4 — hidden at 0, 1.
   */
  threshold: PrivacyLevel;

  /** How to handle the attribute when hidden. Defaults to 'omit'. */
  redaction?: RedactionStrategy;

  /** Replacement text when redaction is 'replace' */
  redactedValue?: string;

  /**
   * If true, this attribute cannot be hidden below its threshold without
   * a compliance override. Build will emit a warning if an attempt is made.
   *
   * Reference: /attribution-taxonomy/risk-response-matrix/#compliance-integration
   */
  complianceProtected?: boolean;
}

// ---------------------------------------------------------------------------
// Collection Field Mappings
// ---------------------------------------------------------------------------

/**
 * Maps CMS content collection fields to attribute IDs.
 *
 * Keys are the field names as they appear in frontmatter/CMS schema.
 * Values are attribute IDs (e.g. 'ID-01', 'CV-01') from the taxonomy.
 */
export type FieldMapping = Record<string, string>;

export interface CollectionConfig {
  /** Field name → Attribute ID mapping */
  fields: FieldMapping;
}

// ---------------------------------------------------------------------------
// Top-Level Configuration
// ---------------------------------------------------------------------------

export interface ResponsivePrivacyConfig {
  /**
   * Privacy level definitions. Defaults to the 5-level taxonomy if not provided.
   */
  levels?: PrivacyLevelDefinition[];

  /**
   * Attribute definitions keyed by Attribute ID (e.g. 'ID-01', 'CV-02').
   * Defaults to the full taxonomy if not provided.
   */
  attributes?: Record<string, AttributeDefinition>;

  /**
   * Maps content collection names to their field→attribute mappings.
   * This is the primary configuration template authors need to set.
   */
  collections: Record<string, CollectionConfig>;
}

// ---------------------------------------------------------------------------
// Runtime / Build Context
// ---------------------------------------------------------------------------

/**
 * The resolved context passed to the transformer at build time.
 */
export interface PrivacyContext {
  /** The target privacy level for this build */
  currentLevel: PrivacyLevel;

  /** Fully resolved config (defaults merged with user overrides) */
  config: Required<ResponsivePrivacyConfig>;
}

// ---------------------------------------------------------------------------
// Transform Results
// ---------------------------------------------------------------------------

export interface FieldResult {
  /** The field name */
  field: string;

  /** The attribute ID it maps to */
  attributeId: string;

  /** Whether the field is visible at the current privacy level */
  visible: boolean;

  /** The value to use — original, redacted, or undefined (omitted) */
  value: unknown;

  /** If redacted, which strategy was applied */
  redactionApplied?: RedactionStrategy;
}

export interface TransformResult {
  /** The transformed data object with hidden fields removed or redacted */
  data: Record<string, unknown>;

  /** Per-field details about what happened */
  fields: FieldResult[];

  /** Fields that were hidden */
  hiddenFields: string[];

  /** Compliance warnings (attempted to hide compliance-protected attributes) */
  warnings: string[];
}
