import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { defineCollection, z } from 'astro:content';

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        /** The reference's grouping. Drives the sidebar section and the badge on the page. */
        category: z.string().optional(),
        /** Alternative names, so a search for "tabs" finds `<cs-tab-group>`. Search-only. */
        synonyms: z.array(z.string()).optional(),
        /** What the component is for, in the reader's words rather than the API's. Search-only. */
        'use-cases': z.array(z.string()).optional(),
        /** The parent component, for sub-components like `<cs-tab>`. Also gates the anatomy diagram. */
        parent: z.string().optional(),
        /**
         * Carried over from Eleventy, where it named the collection a page belonged to. Still load-bearing
         * on the utility pages: `styleUtilities` / `layoutUtilities` splits the CSS Utilities index.
         */
        tags: z.union([z.string(), z.array(z.string())]).optional(),
        /**
         * Appends a card grid of child pages. `true` lists the pages beside this one; a string names the
         * directory to list. See src/plugins/remark-page-index.js.
         */
        pageIndex: z.union([z.boolean(), z.string()]).optional(),
        /**
         * Forces the anatomy diagram on or off. Left unset it means "on unless this page has a
         * parent", which is why it cannot be modelled as a plain boolean with a default.
         */
        hasAnatomy: z.boolean().optional(),
      }),
    }),
  }),
};
