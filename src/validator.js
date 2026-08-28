import { z } from 'zod';

// Zod Schema
export const BookSchema = z.object({
  title: z.string().min(1),
  product_url: z.string().url(),
  price_text: z.string(),
  price_gbp: z.number().positive(),
  availability_text: z.string(),
  rating_text: z.string().nullable(),
  description: z.string().nullable(),
  source_page: z.string().url(),
  fetched_at: z.string().datetime()
});

export function normalizeRecord(raw) {
  // Convert "£51.77" to 51.77
  const priceNumeric = parseFloat(raw.price_text.replace(/[^0-9.]/g, ''));

  return {
    ...raw,
    price_gbp: isNaN(priceNumeric) ? 0 : priceNumeric
  };
}