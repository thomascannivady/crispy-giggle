#!/usr/bin/env node
// Notifies Bing/Yandex (via the shared IndexNow protocol) whenever content changes,
// instead of waiting for a crawler to notice on its own schedule. Run this after every
// publish (any draft:false flip, edit, or rebuild that changes live URLs).
//
// Requires INDEXNOW_KEY_FILE below to already be live at the site root — see
// site/public/<key>.txt, which must match this script's KEY exactly.

import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REVIEWS_DIR = join(__dirname, '../site/src/content/reviews');

const HOST = 'homecookhouse.com';
const KEY = 'b1069d53d5dd5acc4ea9d468926130bc';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function publishedUrls() {
  const files = readdirSync(REVIEWS_DIR).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
  const urls = new Set([`https://${HOST}/`]);
  const categories = new Set();

  for (const file of files) {
    const raw = readFileSync(join(REVIEWS_DIR, file), 'utf-8');
    const { data } = matter(raw);
    if (data.draft !== false) continue;

    const slug = file.replace(/\.(md|mdx)$/, '');
    urls.add(`https://${HOST}/reviews/${slug}/`);
    if (data.category) categories.add(data.category);
  }

  for (const category of categories) {
    urls.add(`https://${HOST}/categories/${slugify(category)}/`);
  }

  return Array.from(urls);
}

async function main() {
  const urlList = publishedUrls();
  console.log(`Submitting ${urlList.length} URLs to IndexNow:`);
  urlList.forEach((u) => console.log(`  ${u}`));

  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: KEY_LOCATION,
      urlList,
    }),
  });

  console.log(`\nIndexNow response: ${res.status} ${res.statusText}`);
  if (res.status >= 200 && res.status < 300) {
    console.log('Submitted successfully.');
  } else {
    const body = await res.text().catch(() => '');
    console.log('Submission may have failed:', body);
    process.exitCode = 1;
  }
}

main();
