import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// A single product entry inside a roundup/review post.
// Note: no `price` field on purpose — Amazon prohibits displaying prices
// that can go stale. Always send readers to Amazon to see the live price.
const product = z.object({
  name: z.string(),
  asin: z.string().regex(/^[A-Z0-9]{10}$/, 'ASIN must be exactly 10 alphanumeric characters'),
  affiliateUrl: z.string().url(),
  imageAlt: z.string(),
  pros: z.array(z.string()).min(1),
  cons: z.array(z.string()).min(1),
  verdict: z.string().optional(),
});

const reviews = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/reviews' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(160, 'Meta description should stay under ~160 chars'),
    niche: z.string(),
    // Granular grouping for the category sidebar/pages — e.g. "Coffee", "Knives", "Outdoor".
    // Distinct from `niche` (broad, e.g. "Home & Kitchen") which is more of a site-level label.
    category: z.string(),
    publishDate: z.date(),
    updatedDate: z.date().optional(),
    // Review gate: a post only ships to prod once a human flips this to false.
    draft: z.boolean().default(true),
    products: z.array(product).min(1),
  }),
});

export const collections = { reviews };
