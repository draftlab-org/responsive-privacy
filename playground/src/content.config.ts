import { defineCollection, z } from 'astro:content';

const team = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    photo: z.string().optional(),
    role: z.string(),
    bio: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    social: z.string().url().optional(),
    department: z.string(),
    order: z.number().optional(),
  }),
});

export const collections = { team };
