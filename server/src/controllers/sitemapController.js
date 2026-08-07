import asyncHandler from 'express-async-handler';
import Pet from '../models/Pet.js';
import Category from '../models/Category.js';
import Breed from '../models/Breed.js';

const SITE_URL = (process.env.CLIENT_URL || 'https://mydukepetsolution.com').replace(/\/$/, '');

const escapeXml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const urlEntry = (loc, { lastmod, changefreq = 'weekly', priority = '0.5' } = {}) => {
  const parts = [`  <url>`, `    <loc>${escapeXml(loc)}</loc>`];
  if (lastmod) parts.push(`    <lastmod>${escapeXml(lastmod)}</lastmod>`);
  parts.push(`    <changefreq>${changefreq}</changefreq>`);
  parts.push(`    <priority>${priority}</priority>`);
  parts.push(`  </url>`);
  return parts.join('\n');
};

const toIsoDate = (d) => {
  try {
    return new Date(d).toISOString().slice(0, 10);
  } catch {
    return undefined;
  }
};

const slugifyBreed = (name = '') =>
  String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/**
 * Dynamic sitemap: static pages + categories + breeds + every available pet.
 * Served at /sitemap.xml and /api/sitemap.xml
 */
export const getSitemap = asyncHandler(async (req, res) => {
  const [pets, categories, breeds] = await Promise.all([
    Pet.find({ availability: true }).select('slug updatedAt createdAt').lean(),
    Category.find({ isActive: true }).select('slug updatedAt').lean(),
    Breed.find({ isActive: true }).select('name updatedAt').lean(),
  ]);

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

  const entries = [
    ...staticPages.map((p) =>
      urlEntry(`${SITE_URL}${p.path}`, { changefreq: p.changefreq, priority: p.priority })
    ),
    ...categories.map((c) =>
      urlEntry(`${SITE_URL}/pets/category/${c.slug}`, {
        lastmod: toIsoDate(c.updatedAt),
        changefreq: 'daily',
        priority: '0.85',
      })
    ),
    ...breeds.map((b) => {
      const slug = slugifyBreed(b.name);
      if (!slug) return null;
      return urlEntry(`${SITE_URL}/pets/breed/${slug}`, {
        lastmod: toIsoDate(b.updatedAt),
        changefreq: 'weekly',
        priority: '0.8',
      });
    }).filter(Boolean),
    ...pets.map((p) =>
      urlEntry(`${SITE_URL}/pets/${p.slug}`, {
        lastmod: toIsoDate(p.updatedAt || p.createdAt),
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
  ].join('\n');

  res.set('Content-Type', 'application/xml; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=3600');
  res.send(xml);
});
