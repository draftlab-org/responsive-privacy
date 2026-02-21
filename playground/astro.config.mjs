import { defineConfig } from 'astro/config';

// In a real project, you'd import from '@responsive-privacy/astro'
// Here we use the workspace link
import { responsivePrivacy } from '@responsive-privacy/astro';
import privacyConfig from './responsive-privacy.config';

export default defineConfig({
  integrations: [
    responsivePrivacy(privacyConfig),
  ],
});
