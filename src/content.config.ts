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
    thumbnailImage: z.string().optional(),
    thumbnailImagePosition: z.string().optional(),
    shareImage: z.string().optional(),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    keywords: z.array(z.string()).default([]),
    comments: z.boolean().default(true),
    showSocial: z.boolean().default(true)
  })
});

export const collections = { posts };
