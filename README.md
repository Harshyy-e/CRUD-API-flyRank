# FlyRank Polite Scraper (Assignment A9)

A resilient, polite web scraping pipeline built in Node.js that scrapes the first 3 catalogue pages of Books to Scrape, validates each book with Zod, and outputs clean structured data with a run report.

## Target Classification
- **Target Site:** `https://books.toscrape.com/`
- **Purpose:** Public sandbox built explicitly for scraping practice.
- **Scope:** 3 catalogue pages (60 books total).
- **Robots.txt:** HTTP 404 (No robots file found).
- **Ethics Commitment:** "I will not reuse this code on another site without checking its rules and terms first."

## Politeness & Safety Rules
1. **User-Agent:** Identifies client via `FlyRankInternship-A9/1.0 (+https://github.com/Harshyy-e/CRUD-API-flyRank)`.
2. **Rate Limiting:** Minimum 600 ms delay between live network calls.
3. **Timeouts:** 5-second AbortController timeout on all HTTP requests.
4. **Local Caching:** All fetched HTML is stored in `cache/` during development to prevent redundant traffic.
5. **No Browser Required:** The catalogue data is fully server-rendered in static HTML; using Playwright/Puppeteer would add unnecessary overhead and resource cost.

## Record Schema (Zod)
- `title` (string, required)
- `product_url` (string, url)
- `price_text` (string)
- `price_gbp` (number, normalized)
- `availability_text` (string)
- `rating_text` (string | null)
- `description` (string | null)
- `source_page` (string, url)
- `fetched_at` (ISO timestamp)

## How to Run

1. Clone repository:
   ```bash
   git clone [https://github.com/Harshyy-e/CRUD-API-flyRank.git](https://github.com/Harshyy-e/CRUD-API-flyRank.git)
   cd CRUD-API-flyRank