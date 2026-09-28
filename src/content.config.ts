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
  }),
});

const guidelines = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guidelines' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    order: z.number(),
  }),
});

export const collections = { plugins, guidelines };
