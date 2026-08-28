import * as cheerio from 'cheerio';
import { politeFetch } from './scraper.js';

export async function discoverBookUrls() {
  let currentUrl = 'https://books.toscrape.com/catalogue/page-1.html';
  const bookUrls = new Set();
  let pagesCount = 0;

  while (currentUrl && pagesCount < 3) {
    pagesCount++;
    const html = await politeFetch(currentUrl);
    const $ = cheerio.load(html);

    // Extract book links
    $('article.product_pod h3 a').each((_, el) => {
      const relativeHref = $(el).attr('href');
      if (relativeHref) {
        // Resolve absolute URL
        const absoluteUrl = new URL(relativeHref, currentUrl).href;
        bookUrls.add(absoluteUrl);
      }
    });

    // Find next page link
    const nextHref = $('li.next a').attr('href');
    if (nextHref && pagesCount < 3) {
      currentUrl = new URL(nextHref, currentUrl).href;
    } else {
      currentUrl = null;
    }
  }

  const uniqueUrls = Array.from(bookUrls);
  console.log(`catalogue_pages=${pagesCount}, discovered=${bookUrls.size}, unique_urls=${uniqueUrls.length}`);
  return uniqueUrls;
}

async function main() {
  await discoverBookUrls();
}

main().catch(console.error);