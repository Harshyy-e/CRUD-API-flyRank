import { politeFetch } from './scraper.js';

async function main() {
  const startUrl = 'https://books.toscrape.com/catalogue/page-1.html';
  const html = await politeFetch(startUrl);
  console.log(`Received page 1: ${html.length} bytes`);
}

main().catch(console.error);