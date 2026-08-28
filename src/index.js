import fs from 'fs';
import * as cheerio from 'cheerio';
import { politeFetch, stats } from './scraper.js';
import { extractBookDetail } from './extractor.js';
import { normalizeRecord, BookSchema } from './validator.js';

const OUTPUT_DIR = './output';
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

async function runPipeline() {
  // Step 1: Discover URLs
  const bookUrls = [];
  for (let p = 1; p <= 3; p++) {
    const pageUrl = `https://books.toscrape.com/catalogue/page-1.html`.replace('page-1', `page-${p}`);
    const html = await politeFetch(pageUrl);
    const $ = cheerio.load(html);
    $('article.product_pod h3 a').each((_, el) => {
      const href = $(el).attr('href');
      bookUrls.push({ url: new URL(href, pageUrl).href, source: pageUrl });
    });
  }

  // Deduplicate
  const uniqueMap = new Map();
  bookUrls.forEach((item) => uniqueMap.set(item.url, item.source));

  const validRecords = [];
  const errorRecords = [];

  // Step 2: Extract & Validate
  for (const [url, source] of uniqueMap.entries()) {
    try {
      const raw = await extractBookDetail(url, source);
      const normalized = normalizeRecord(raw);
      const parsed = BookSchema.safeParse(normalized);

      if (parsed.success) {
        validRecords.push(parsed.data);
      } else {
        errorRecords.push({ url, errors: parsed.error.issues });
      }
    } catch (err) {
      errorRecords.push({ url, error: err.message });
    }
  }

  // Step 3: Write Output
  fs.writeFileSync(`${OUTPUT_DIR}/books.json`, JSON.stringify(validRecords, null, 2));
  fs.writeFileSync(`${OUTPUT_DIR}/errors.json`, JSON.stringify(errorRecords, null, 2));

  console.log(`Pipeline complete! Valid: ${validRecords.length}, Errors: ${errorRecords.length}`);
}

runPipeline().catch(console.error);