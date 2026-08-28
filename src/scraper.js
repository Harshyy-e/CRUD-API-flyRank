import fs from 'fs';
import path from 'path';

const CACHE_DIR = './cache';
const USER_AGENT = 'FlyRankInternship-A9/1.0 (+https://github.com/Harshyy-e/CRUD-API-flyRank)';
const REQUEST_TIMEOUT_MS = 5000;
const DELAY_MS = 600;

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

function getCachePath(url) {
  const safeName = url.replace(/[^a-zA-Z0-9]/g, '_') + '.html';
  return path.join(CACHE_DIR, safeName);
}

export const stats = {
  pagesFetched: 0,
  cacheHits: 0,
  failedPages: 0
};

export async function politeFetch(url) {
  const cachePath = getCachePath(url);

  // Check Cache First
  if (fs.existsSync(cachePath)) {
    stats.cacheHits++;
    console.log(`[CACHE HIT] ${url}`);
    return fs.readFileSync(cachePath, 'utf-8');
  }

  // Polite delay before live fetch
  await new Promise((r) => setTimeout(r, DELAY_MS));

  console.log(`[FETCHING] ${url}`);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      stats.failedPages++;
      throw new Error(`HTTP Error ${response.status} for ${url}`);
    }

    const html = await response.text();
    fs.writeFileSync(cachePath, html, 'utf-8');
    stats.pagesFetched++;
    return html;
  } catch (err) {
    clearTimeout(timeoutId);
    stats.failedPages++;
    throw err;
  }
}