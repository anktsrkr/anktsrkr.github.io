import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string().default(''),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    toc: z.boolean().default(false),
    series: z.string().optional(),
    seriesOrder: z.number().optional(),
    thumbnailImage: z.string().optional(),
    thumbnailImagePosition: z.string().optional(),
    shareImage: z.string().optional(),
    canonicalUrl: z.string().url().optional(),
    sourceUrl: z.string().url().optional(),
    sourceCodeUrl: z.string().url().optional(),
    sourceName: z.string().optional(),
    sourcePath: z.string().optional(),
    crosspost: z.boolean().default(false),
    difficulty: z.string().optional(),
    time: z.string().optional(),
    provider: z.string().optional(),
    hosting: z.string().optional(),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    keywords: z.array(z.string()).default([]),
    comments: z.boolean().default(true),
    showSocial: z.boolean().default(true)
  })
});

export const collections = { posts };
