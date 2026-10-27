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
        /**
         * The contrast ratios and colours the page prints, one claim per line, so a theme change that makes one
         * wrong fails the build instead of shipping. Read by scripts/check-contrast.js, which says what each
         * column means; the site renders nothing from it.
         */
        contrast: z.string().optional(),
        /**
         * Inspiration entries only (#144). Their remaining rules (which tier may carry which field, a Goal or
         * Kind from the right list, a state file per State, every Flow step resolving) need the entry's folder
         * and the files beside it, which Starlight's single `docsSchema` cannot see. `src/inspiration.js`
         * checks them and fails the build; these lines only fix each field's shape.
         *
         * `status` may only raise an entry to experimental. Its derived status comes from the components it
         * uses, and nothing can lower that.
         */
        status: z.literal('experimental').optional(),
        /** A Screen's named States, `key: label`, each backed by `<screen>.<key>.html`. */
        states: z.record(z.string(), z.string()).optional(),
        /** A Flow's steps in order, each a Screen slug or `screen.state`. */
        screens: z.array(z.string()).optional(),
      }),
    }),
  }),
};
