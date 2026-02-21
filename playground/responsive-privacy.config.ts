/**
 * Responsive Privacy Configuration
 *
 * This file maps your CMS content fields to the attribution taxonomy.
 * The default attribute thresholds come from the Superbloom/Draftlab
 * research — override them here if your organization needs differ.
 *
 * @see https://research-superbloom.netlify.app/attribution-taxonomy/
 */

import { defineConfig } from '@responsive-privacy/core';

export default defineConfig({
  // Using all default privacy levels (0–4) and attribute definitions
  // from the taxonomy. Only need to define collection field mappings.

  collections: {
    // Maps the "team" content collection fields to attribute IDs
    team: {
      fields: {
        name:       'ID-01',  // Full Name → threshold 2, redacts to "Staff Member"
        photo:      'ID-02',  // Photo/Headshot → threshold 2, omitted when hidden
        role:       'ID-03',  // Job Title/Role → threshold 1
        bio:        'ID-04',  // Biography → threshold 3, omitted when hidden
        email:      'CV-01',  // Email → threshold 4, redacts to "Contact the organization"
        phone:      'CV-02',  // Phone → threshold 4, omitted
        social:     'CV-04',  // Social Media → threshold 3, omitted
        department: 'OR-01',  // Department → threshold 1
      },
    },

    // Maps blog post fields
    posts: {
      fields: {
        author:      'ID-01',  // Author name → threshold 2
        authorPhoto: 'ID-02',  // Author photo → threshold 2
        byline:      'AD-05',  // Byline → threshold 2, redacts to "Organization Staff"
      },
    },
  },
});
