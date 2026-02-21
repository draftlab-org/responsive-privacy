/**
 * Configuration resolver.
 *
 * Merges user-provided config with the default taxonomy,
 * allowing organizations to override thresholds, add attributes,
 * or customize redaction strategies.
 */

import type { ResponsivePrivacyConfig, PrivacyLevel, PrivacyContext } from './types.js';
import { DEFAULT_PRIVACY_LEVELS, DEFAULT_ATTRIBUTES } from './defaults.js';

/**
 * Define a responsive privacy configuration.
 * User-provided attributes are merged on top of the default taxonomy.
 */
export function defineConfig(config: ResponsivePrivacyConfig): ResponsivePrivacyConfig {
  return config;
}

/**
 * Resolve a user config into a fully populated config with all defaults applied.
 */
export function resolveConfig(
  config: ResponsivePrivacyConfig
): Required<ResponsivePrivacyConfig> {
  const attributes = {
    ...DEFAULT_ATTRIBUTES,
    ...(config.attributes ?? {}),
  };

  return {
    levels: config.levels ?? DEFAULT_PRIVACY_LEVELS,
    attributes,
    collections: config.collections,
  };
}

/**
 * Read the target privacy level from the environment.
 *
 * Checks (in order):
 * 1. `PRIVACY_LEVEL` environment variable
 * 2. Falls back to the provided default (Level 4 / Full Transparency)
 *
 * Validates that the level is 0–4.
 */
export function readPrivacyLevel(fallback: PrivacyLevel = 4): PrivacyLevel {
  const envVal = typeof process !== 'undefined'
    ? process.env.PRIVACY_LEVEL
    : undefined;

  if (envVal === undefined || envVal === '') {
    return fallback;
  }

  const parsed = parseInt(envVal, 10);

  if (isNaN(parsed) || parsed < 0 || parsed > 4) {
    console.warn(
      `[responsive-privacy] Invalid PRIVACY_LEVEL="${envVal}". Must be 0–4. Falling back to ${fallback}.`
    );
    return fallback;
  }

  return parsed as PrivacyLevel;
}

/**
 * Create a full privacy context for the current build.
 */
export function createContext(
  config: ResponsivePrivacyConfig,
  level?: PrivacyLevel
): PrivacyContext {
  return {
    currentLevel: level ?? readPrivacyLevel(),
    config: resolveConfig(config),
  };
}
