/**
 * Content Transformer
 *
 * The core engine that takes content data + a privacy context and returns
 * transformed content with fields hidden or redacted based on the current
 * privacy level and the attribute taxonomy thresholds.
 *
 * This is the function that gets called at build time for every content entry.
 */

import type {
  PrivacyContext,
  TransformResult,
  FieldResult,
  AttributeDefinition,
  CollectionConfig,
  PrivacyLevel,
} from './types.js';

/**
 * Check if a specific attribute is visible at the given privacy level.
 */
export function isAttributeVisible(
  attributeId: string,
  currentLevel: PrivacyLevel,
  attributes: Record<string, AttributeDefinition>
): boolean {
  const attr = attributes[attributeId];
  if (!attr) {
    // Unknown attribute — visible by default (fail-open for unknown fields)
    return true;
  }
  return currentLevel >= attr.threshold;
}

/**
 * Get the redacted value for a hidden attribute.
 * Returns undefined if the strategy is 'omit' (field should be removed entirely).
 */
export function getRedactedValue(
  attr: AttributeDefinition
): unknown | undefined {
  const strategy = attr.redaction ?? 'omit';

  if (strategy === 'omit') {
    return undefined;
  }

  if (strategy === 'replace') {
    return attr.redactedValue ?? `[${attr.name} hidden]`;
  }

  return undefined;
}

/**
 * Transform a single content entry's data based on the privacy context.
 *
 * @param collectionName - The name of the content collection (e.g. 'team', 'posts')
 * @param data - The raw content data (frontmatter fields)
 * @param ctx - The privacy context for this build
 * @returns TransformResult with filtered data and metadata
 */
export function transformEntry(
  collectionName: string,
  data: Record<string, unknown>,
  ctx: PrivacyContext
): TransformResult {
  const collectionConfig = ctx.config.collections[collectionName];

  // If this collection isn't configured, pass through unchanged
  if (!collectionConfig) {
    return {
      data: { ...data },
      fields: Object.keys(data).map((field) => ({
        field,
        attributeId: '',
        visible: true,
        value: data[field],
      })),
      hiddenFields: [],
      warnings: [],
    };
  }

  return applyPrivacy(data, collectionConfig, ctx);
}

/**
 * Apply privacy filtering to a data object using field mappings.
 */
function applyPrivacy(
  data: Record<string, unknown>,
  collectionConfig: CollectionConfig,
  ctx: PrivacyContext
): TransformResult {
  const result: Record<string, unknown> = {};
  const fields: FieldResult[] = [];
  const hiddenFields: string[] = [];
  const warnings: string[] = [];

  for (const [field, value] of Object.entries(data)) {
    const attributeId = collectionConfig.fields[field];

    // Field not mapped to any attribute — pass through
    if (!attributeId) {
      result[field] = value;
      fields.push({
        field,
        attributeId: '',
        visible: true,
        value,
      });
      continue;
    }

    const attr = ctx.config.attributes[attributeId];

    // Attribute ID not found in definitions — pass through with warning
    if (!attr) {
      console.warn(
        `[responsive-privacy] Field "${field}" mapped to unknown attribute "${attributeId}". Passing through.`
      );
      result[field] = value;
      fields.push({
        field,
        attributeId,
        visible: true,
        value,
      });
      continue;
    }

    const visible = ctx.currentLevel >= attr.threshold;

    if (visible) {
      // Attribute is visible at this level
      result[field] = value;
      fields.push({
        field,
        attributeId,
        visible: true,
        value,
      });
    } else {
      // Attribute should be hidden

      // Check compliance protection
      if (attr.complianceProtected) {
        warnings.push(
          `Compliance-protected attribute "${attr.name}" (${attributeId}) ` +
          `would be hidden at Level ${ctx.currentLevel} (threshold: ${attr.threshold}). ` +
          `Requires legal review before removal.`
        );
        // Still hide it, but the warning alerts the build operator
      }

      const redactedValue = getRedactedValue(attr);
      const strategy = attr.redaction ?? 'omit';

      if (strategy === 'replace' && redactedValue !== undefined) {
        // Replace with redacted value
        result[field] = redactedValue;
        fields.push({
          field,
          attributeId,
          visible: false,
          value: redactedValue,
          redactionApplied: 'replace',
        });
      } else {
        // Omit entirely — don't add to result
        fields.push({
          field,
          attributeId,
          visible: false,
          value: undefined,
          redactionApplied: 'omit',
        });
      }

      hiddenFields.push(field);
    }
  }

  return { data: result, fields, hiddenFields, warnings };
}

/**
 * Transform an entire collection of entries.
 *
 * Convenience function for processing all entries in a content collection.
 */
export function transformCollection(
  collectionName: string,
  entries: Record<string, unknown>[],
  ctx: PrivacyContext
): TransformResult[] {
  return entries.map((entry) => transformEntry(collectionName, entry, ctx));
}

/**
 * Generate a build summary showing what was hidden/redacted.
 * Useful for build logs and audit trails.
 */
export function buildSummary(
  results: Map<string, TransformResult[]>,
  ctx: PrivacyContext
): string {
  const level = ctx.config.levels?.find((l) => l.level === ctx.currentLevel);
  const lines: string[] = [
    `\n🔒 Responsive Privacy Build Summary`,
    `   Level: ${ctx.currentLevel} — ${level?.name ?? 'Unknown'}`,
    `   ${level?.description ?? ''}\n`,
  ];

  let totalHidden = 0;
  let totalWarnings = 0;

  for (const [collection, transformResults] of results) {
    const collectionHidden = transformResults.reduce(
      (sum, r) => sum + r.hiddenFields.length, 0
    );
    const collectionWarnings = transformResults.reduce(
      (sum, r) => sum + r.warnings.length, 0
    );

    totalHidden += collectionHidden;
    totalWarnings += collectionWarnings;

    if (collectionHidden > 0) {
      lines.push(
        `   📁 ${collection}: ${transformResults.length} entries, ${collectionHidden} fields hidden`
      );

      // Collect unique hidden field names
      const hiddenFieldNames = new Set<string>();
      for (const r of transformResults) {
        for (const f of r.hiddenFields) {
          hiddenFieldNames.add(f);
        }
      }
      lines.push(`      Hidden: ${[...hiddenFieldNames].join(', ')}`);
    }

    // Show warnings
    for (const r of transformResults) {
      for (const w of r.warnings) {
        lines.push(`   ⚠️  ${w}`);
      }
    }
  }

  lines.push('');
  lines.push(`   Total: ${totalHidden} fields hidden, ${totalWarnings} compliance warnings`);
  lines.push('');

  return lines.join('\n');
}
