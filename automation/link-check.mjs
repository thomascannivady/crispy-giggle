#!/usr/bin/env node
// Walks every review post's product list and checks that each affiliate
// link still resolves to a real product page. A delisted/out-of-stock
// product usually redirects to an Amazon search or error page instead of
// returning a clean 404, so status-code checks alone aren't enough —
// this also flags suspicious redirect destinations.
//
// Run: npm run link-check   (from automation/)
// Intended to run on a schedule (see ../README.md) so dead links get
// caught before they cost conversions.

import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REVIEWS_DIR = join(__dirname, '../site/src/content/reviews');
const TIMEOUT_MS = 10_000;
const SUSPICIOUS_PATTERNS = [/\/s\?/, /\/s\//, /\/errors\//, /404/];

function loadPosts() {
  return readdirSync(REVIEWS_DIR)
    .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))
    .map((f) => {
      const raw = readFileSync(join(REVIEWS_DIR, f), 'utf-8');
      const { data } = matter(raw);
      return { file: f, ...data };
    });
}

async function checkUrl(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
      },
    });
    res.body?.cancel();
    const finalUrl = res.url;
    const suspicious = SUSPICIOUS_PATTERNS.some((p) => p.test(finalUrl));
    return { ok: res.ok && !suspicious, status: res.status, finalUrl, suspicious };
  } catch (err) {
    return { ok: false, status: null, error: err.message };
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  const posts = loadPosts();
  let problems = 0;
  let checked = 0;

  for (const post of posts) {
    for (const product of post.products ?? []) {
      if (product.asin?.startsWith('B0EXAMPLE')) {
        console.log(`SKIP   [${post.file}] ${product.name} — placeholder ASIN, not a real link`);
        continue;
      }
      checked++;
      const result = await checkUrl(product.affiliateUrl);
      if (result.ok) {
        console.log(`OK     [${post.file}] ${product.name}`);
      } else {
        problems++;
        console.log(
          `FLAG   [${post.file}] ${product.name} — status=${result.status ?? 'error'} ${
            result.error ?? result.finalUrl
          }`
        );
      }
      // Be polite — avoid hammering Amazon with rapid-fire requests.
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  console.log(`\n${checked} live link(s) checked, ${problems} flagged.`);
  if (problems > 0) process.exitCode = 1;
}

main();
