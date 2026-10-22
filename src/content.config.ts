import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const plugins = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/plugins' }),
  schema: z.object({
    name: z.string(),
    summary: z.string(),
    colour: z.string(), // the plugin's own, as the plugin draws it
    order: z.number(),
    //  the parts on its product page, in reading order; without them the page is its text alone
    parts: z
      .array(
        z.object({
          shot: z.string(), // public/product/<plugin>/<shot>.webp
          crop: z.tuple([z.number(), z.number(), z.number(), z.number()]), // in the window's points
          label: z.string(),
          title: z.string(),
          text: z.string(),
          points: z.array(z.string()).optional(),
        }),
      )
      .optional(),
  }),
});

export const collections = { plugins };
