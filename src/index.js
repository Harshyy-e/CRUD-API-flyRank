import { discoverBookUrls } from './index.js';
import { extractBookDetail } from './extractor.js';

async function main() {
  const urls = await discoverBookUrls();
  console.log(`Found ${urls.length} books. Extracting first record sample...`);

  const sample = await extractBookDetail(urls[0], 'https://books.toscrape.com/catalogue/page-1.html');
  console.log('Sample Raw Record:', JSON.stringify(sample, null, 2));
}

main().catch(console.error);