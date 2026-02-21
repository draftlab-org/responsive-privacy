// Types
export type {
  PrivacyLevel,
  PrivacyLevelDefinition,
  RiskLevel,
  AttributeCategory,
  RedactionStrategy,
  AttributeDefinition,
  FieldMapping,
  CollectionConfig,
  ResponsivePrivacyConfig,
  PrivacyContext,
  FieldResult,
  TransformResult,
} from './types.js';

// Config
export {
  defineConfig,
  resolveConfig,
  readPrivacyLevel,
  createContext,
} from './config.js';

// Transformer
export {
  isAttributeVisible,
  getRedactedValue,
  transformEntry,
  transformCollection,
  buildSummary,
} from './transformer.js';

// Defaults (also available as separate import via @responsive-privacy/core/defaults)
export {
  DEFAULT_PRIVACY_LEVELS,
  DEFAULT_ATTRIBUTES,
} from './defaults.js';
