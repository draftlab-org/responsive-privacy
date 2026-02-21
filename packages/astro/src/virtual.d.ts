/**
 * Type declarations for the virtual:responsive-privacy module.
 *
 * Add this to your project's env.d.ts or a global declaration file:
 *
 *   /// <reference types="@responsive-privacy/astro/virtual" />
 */

declare module 'virtual:responsive-privacy' {
  /** The current build privacy level (0–4) */
  export const PRIVACY_LEVEL: import('@responsive-privacy/core').PrivacyLevel;

  /** Human-readable name of the current level */
  export const LEVEL_NAME: string;

  /** Check if an attribute ID is visible at the current build level */
  export function isVisible(attributeId: string): boolean;

  /** Check if a specific field in a collection is visible */
  export function isFieldVisible(collectionName: string, fieldName: string): boolean;

  /** Get the redacted replacement value for an attribute, or undefined if omitted */
  export function redactedValueFor(attributeId: string): string | undefined;
}
