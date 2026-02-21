/**
 * Astro Template Helpers
 *
 * Utility functions for use directly in .astro component frontmatter.
 * These wrap the core transformer to work naturally with Astro content collections.
 *
 * Usage in an .astro file:
 *
 *   ---
 *   import { filterCollection, filterEntry } from '@responsive-privacy/astro/helpers';
 *   import { getCollection } from 'astro:content';
 *   import privacyConfig from '../responsive-privacy.config';
 *
 *   const rawTeam = await getCollection('team');
 *   const team = filterCollection('team', rawTeam, privacyConfig);
 *   ---
 */

import {
  type ResponsivePrivacyConfig,
  type PrivacyLevel,
  type PrivacyContext,
  type TransformResult,
  createContext,
  readPrivacyLevel,
  transformEntry,
  buildSummary,
} from '@responsive-privacy/core';

/**
 * Filter a single content collection entry's data fields.
 *
 * Returns the entry with its `data` object transformed according
 * to the current privacy level.
 *
 * @param collectionName - Name of the Astro content collection
 * @param entry - A single collection entry (with `.data` and other Astro fields)
 * @param config - The responsive privacy config
 * @param level - Optional override for privacy level
 */
export function filterEntry<T extends { data: Record<string, unknown> }>(
  collectionName: string,
  entry: T,
  config: ResponsivePrivacyConfig,
  level?: PrivacyLevel
): T & { _privacy: TransformResult } {
  const ctx = createContext(config, level ?? readPrivacyLevel());
  const result = transformEntry(collectionName, entry.data, ctx);

  return {
    ...entry,
    data: result.data as T['data'],
    _privacy: result,
  };
}

/**
 * Filter an entire content collection.
 *
 * Returns all entries with their data transformed, plus attaches
 * privacy metadata for use in templates.
 *
 * @param collectionName - Name of the Astro content collection
 * @param entries - Array of collection entries from getCollection()
 * @param config - The responsive privacy config
 * @param level - Optional override for privacy level
 */
export function filterCollection<T extends { data: Record<string, unknown> }>(
  collectionName: string,
  entries: T[],
  config: ResponsivePrivacyConfig,
  level?: PrivacyLevel
): Array<T & { _privacy: TransformResult }> {
  const ctx = createContext(config, level ?? readPrivacyLevel());

  return entries.map((entry) => {
    const result = transformEntry(collectionName, entry.data, ctx);
    return {
      ...entry,
      data: result.data as T['data'],
      _privacy: result,
    };
  });
}

/**
 * Check if a specific field would be visible at the current privacy level.
 *
 * Useful for conditional rendering in templates:
 *
 *   {shouldShow('team', 'email', config) && <a href={`mailto:${member.data.email}`}>Email</a>}
 */
export function shouldShow(
  collectionName: string,
  fieldName: string,
  config: ResponsivePrivacyConfig,
  level?: PrivacyLevel
): boolean {
  const ctx = createContext(config, level ?? readPrivacyLevel());
  const collection = ctx.config.collections[collectionName];

  if (!collection) return true;

  const attributeId = collection.fields[fieldName];
  if (!attributeId) return true;

  const attr = ctx.config.attributes[attributeId];
  if (!attr) return true;

  return ctx.currentLevel >= attr.threshold;
}

/**
 * Get the current privacy level and its metadata.
 * Useful for displaying privacy status in templates.
 */
export function getPrivacyStatus(config: ResponsivePrivacyConfig, level?: PrivacyLevel) {
  const ctx = createContext(config, level ?? readPrivacyLevel());
  const levelDef = ctx.config.levels.find((l) => l.level === ctx.currentLevel);

  return {
    level: ctx.currentLevel,
    name: levelDef?.name ?? 'Unknown',
    description: levelDef?.description ?? '',
    isReduced: ctx.currentLevel < 4,
  };
}
