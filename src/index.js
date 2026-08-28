import fs from 'fs';
import * as cheerio from 'cheerio';
import { politeFetch, stats } from './scraper.js';
import { extractBookDetail } from './extractor.js';
import { normalizeRecord, BookSchema } from './validator.js';

const OUTPUT_DIR = './output';
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

async function runPipeline() {
  const startTime = new Date();

  // 1. Discover Catalogue URLs
  const bookItems = [];
  for (let p = 1; p <= 3; p++) {
    const pageUrl = `https://books.toscrape.com/catalogue/page-1.html`.replace('page-1', `page-${p}`);
    const html = await politeFetch(pageUrl);
    const $ = cheerio.load(html);
    $('article.product_pod h3 a').each((_, el) => {
      const href = $(el).attr('href');
      bookItems.push({ url: new URL(href, pageUrl).href, source: pageUrl });
    });
  }

  // Deduplicate
  const uniqueMap = new Map();
  bookItems.forEach((item) => uniqueMap.set(item.url, item.source));

  // TEST FAILURE SURVIVAL: Intentionally add 1 broken test URL
  uniqueMap.set('https://books.toscrape.com/catalogue/non-existent-broken-book_9999/index.html', 'test-source');

  const validRecords = [];
  const errorRecords = [];

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
      console.warn(`[SKIPPED FAILED PAGE] ${url}: ${err.message}`);
      errorRecords.push({ url, error: err.message });
    }
  }

  const endTime = new Date();
  const durationMs = endTime - startTime;

  // 2. Write Output Files
  fs.writeFileSync(`${OUTPUT_DIR}/books.json`, JSON.stringify(validRecords, null, 2));
  fs.writeFileSync(`${OUTPUT_DIR}/errors.json`, JSON.stringify(errorRecords, null, 2));

  // 3. Write Run Report
  const report = {
    started_at: startTime.toISOString(),
    finished_at: endTime.toISOString(),
    duration_ms: durationMs,
    catalogue_pages: 3,
    total_discovered_urls: uniqueMap.size,
    pages_fetched_live: stats.pagesFetched,
    cache_hits: stats.cacheHits,
    valid_records: validRecords.length,
    invalid_records: errorRecords.filter((e) => e.errors).length,
    failed_pages: stats.failedPages
  };

  fs.writeFileSync(`${OUTPUT_DIR}/run-report.json`, JSON.stringify(report, null, 2));
  console.log('Run report generated:', report);
}

runPipeline().catch(console.error);