import * as cheerio from 'cheerio';
import { politeFetch } from './scraper.js';

export async function extractBookDetail(productUrl, sourcePage) {
  const html = await politeFetch(productUrl);
  const $ = cheerio.load(html);

  const title = $('.product_main h1').text().trim();
  const price_text = $('.product_main .price_color').text().trim();
  const availability_text = $('.product_main .availability').text().trim().replace(/\s+/g, ' ');

  // Rating class (e.g. class="star-rating Three")
  const rating_text = $('.product_main .star-rating').attr('class')?.replace('star-rating', '').trim() || null;

  // Description
  const descriptionEl = $('#product_description + p');
  const description = descriptionEl.length > 0 ? descriptionEl.text().trim() : null;

  return {
    title,
    product_url: productUrl,
    price_text,
    availability_text,
    rating_text,
    description,
    source_page: sourcePage,
    fetched_at: new Date().toISOString()
  };
}