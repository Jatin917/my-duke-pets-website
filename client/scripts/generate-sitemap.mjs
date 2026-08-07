/**
 * Fetch pets/categories from the API and write client/public/sitemap.xml
 * so the marketing domain can serve a complete sitemap after build/deploy.
 *
 *   node scripts/generate-sitemap.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_URL = (process.env.VITE_SITE_URL || process.env.CLIENT_URL || 'https://mydukepetsolution.com').replace(
  /\/$/,
  ''
);
const API = (process.env.VITE_API_URL || process.env.PROD_API_URL || 'https://api.mydukepetsolution.com/api').replace(
  /\/$/,
  ''
);
const outPath = path.join(__dirname, '..', 'public', 'sitemap.xml');

const escapeXml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const slugify = (n) =>
  String(n || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const urlEntry = (loc, { lastmod, changefreq = 'weekly', priority = '0.5' } = {}) => {
  const parts = [`  <url>`, `    <loc>${escapeXml(loc)}</loc>`];
  if (lastmod) parts.push(`    <lastmod>${escapeXml(lastmod)}</lastmod>`);
  parts.push(`    <changefreq>${changefreq}</changefreq>`);
  parts.push(`    <priority>${priority}</priority>`);
  parts.push(`  </url>`);
  return parts.join('\n');
};

const toIso = (d) => {
  try {
    return new Date(d).toISOString().slice(0, 10);
  } catch {
    return undefined;
  }
};

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

async function fetchAllPets() {
  const pets = [];
  let page = 1;
  let pages = 1;
  do {
    const json = await fetchJson(`${API}/pets?limit=50&page=${page}&availability=true`);
    pets.push(...(json.data || []));
    pages = json.pages || 1;
    page += 1;
  } while (page <= pages);
  return pets;
}

async function main() {
  console.log(`Generating sitemap from ${API} → ${SITE_URL}`);
  let pets = [];
  let categories = [];
  let breeds = [];
  try {
    [pets, categories] = await Promise.all([
      fetchAllPets(),
      fetchJson(`${API}/categories`).then((j) => j.data || j || []),
    ]);
    try {
      breeds = await fetchJson(`${API}/breeds`).then((j) => j.data || j || []);
    } catch {
      breeds = [];
    }
  } catch (e) {
    console.warn(`API fetch failed (${e.message}) — writing static pages only.`);
  }

  const staticPages = [
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/pets', changefreq: 'daily', priority: '0.9' },
    { path: '/pets-in-gurugram', changefreq: 'weekly', priority: '0.85' },
    { path: '/sell', changefreq: 'weekly', priority: '0.8' },
    { path: '/about', changefreq: 'monthly', priority: '0.7' },
    { path: '/help', changefreq: 'monthly', priority: '0.7' },
    { path: '/contact', changefreq: 'monthly', priority: '0.7' },
    { path: '/donate', changefreq: 'monthly', priority: '0.5' },
    { path: '/privacy-policy', changefreq: 'yearly', priority: '0.3' },
    { path: '/terms-and-conditions', changefreq: 'yearly', priority: '0.3' },
  ];

  const breedSlugs = new Set();
  for (const b of breeds) {
    const s = slugify(b.name);
    if (s) breedSlugs.add(s);
  }
  for (const p of pets) {
    const s = slugify(p.breed);
    if (s) breedSlugs.add(s);
  }

  const entries = [
    ...staticPages.map((p) =>
      urlEntry(`${SITE_URL}${p.path}`, { changefreq: p.changefreq, priority: p.priority })
    ),
    ...categories.map((c) =>
      urlEntry(`${SITE_URL}/pets/category/${c.slug}`, {
        lastmod: toIso(c.updatedAt),
        changefreq: 'daily',
        priority: '0.85',
      })
    ),
    ...[...breedSlugs].map((s) =>
      urlEntry(`${SITE_URL}/pets/breed/${s}`, { changefreq: 'weekly', priority: '0.8' })
    ),
    ...pets
      .filter((p) => p.slug)
      .map((p) =>
        urlEntry(`${SITE_URL}/pets/${p.slug}`, {
          lastmod: toIso(p.updatedAt || p.createdAt),
          changefreq: 'weekly',
          priority: '0.75',
        })
      ),
  ];

  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...entries,
    `</urlset>`,
    ``,
  ].join('\n');

  fs.writeFileSync(outPath, xml, 'utf8');
  console.log(`Wrote ${entries.length} URLs → ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
