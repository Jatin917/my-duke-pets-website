/**
 * Post-build prerender: write route HTML shells with real <title>, meta, and H1
 * so Googlebot sees content before JS hydrates.
 *
 *   node scripts/prerender.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');
const SITE_URL = (process.env.VITE_SITE_URL || 'https://mydukepetsolution.com').replace(/\/$/, '');
const API = (process.env.VITE_API_URL || 'https://api.mydukepetsolution.com/api').replace(/\/$/, '');
const SITE_NAME = 'My Duke';

const escapeHtml = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const STATIC_ROUTES = [
  {
    route: '/',
    title: `Buy & Sell Verified Pets in India | ${SITE_NAME}`,
    description:
      'Buy dogs, cats, birds, rabbits, fish & exotic pets online in India. My Duke lists only healthy, vaccinated pets from verified sellers.',
    h1: 'Buy & Sell Verified Pets in India',
  },
  {
    route: '/pets',
    title: `Browse Pets for Sale & Adoption in India | ${SITE_NAME}`,
    description:
      'Browse verified dogs, cats, birds, rabbits, fish and exotic pets for sale or adoption across India on My Duke.',
    h1: 'Explore All Pets',
  },
  {
    route: '/about',
    title: `About Us | ${SITE_NAME}`,
    description: `Learn about ${SITE_NAME} — verified pet marketplace in Gurugram, India.`,
    h1: 'About My Duke',
  },
  {
    route: '/contact',
    title: `Contact Us | ${SITE_NAME}`,
    description: `Contact ${SITE_NAME} in Gurugram about listings, rehoming, or support.`,
    h1: 'Contact Us',
  },
  {
    route: '/sell',
    title: `Sell a Pet Online | ${SITE_NAME}`,
    description: 'List your pet for sale or rehoming on My Duke — reach genuine buyers across India.',
    h1: 'Sell a Pet',
  },
  {
    route: '/help',
    title: `Help & Support | ${SITE_NAME}`,
    description: 'FAQs and support for buying or selling pets on My Duke.',
    h1: 'Help & Support',
  },
  {
    route: '/pets-in-gurugram',
    title: `Pets for Sale in Gurugram & Delhi-NCR | ${SITE_NAME}`,
    description:
      'Buy verified dogs, cats, birds and more in Gurugram / Gurgaon and Delhi-NCR. Visit My Duke at Sector 17C, Sukhrali.',
    h1: 'Pets for Sale in Gurugram',
  },
];

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

function injectMeta(html, { title, description, canonical, h1 }) {
  let out = html;
  out = out.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  if (/name="description"/i.test(out)) {
    out = out.replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="description" content="${escapeHtml(description)}" />`
    );
  } else {
    out = out.replace(
      '</head>',
      `    <meta name="description" content="${escapeHtml(description)}" />\n  </head>`
    );
  }
  if (/rel="canonical"/i.test(out)) {
    out = out.replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
      `<link rel="canonical" href="${escapeHtml(canonical)}" />`
    );
  } else {
    out = out.replace(
      '</head>',
      `    <link rel="canonical" href="${escapeHtml(canonical)}" />\n  </head>`
    );
  }
  // Crawler-visible content before React mounts
  const noscript = `<noscript><main><h1>${escapeHtml(h1)}</h1><p>${escapeHtml(description)}</p><p><a href="${escapeHtml(SITE_URL)}/pets">Browse pets</a></p></main></noscript>`;
  if (!out.includes('<noscript><main>')) {
    out = out.replace('<div id="root"></div>', `<div id="root"></div>\n    ${noscript}`);
  }
  return out;
}

function writeRoute(route, html) {
  const clean = route === '/' ? '' : route.replace(/^\//, '');
  const dir = clean ? path.join(distDir, clean) : distDir;
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'index.html');
  fs.writeFileSync(file, html, 'utf8');
  console.log('prerender', route, '→', path.relative(distDir, file));
}

async function main() {
  const indexPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    throw new Error('dist/index.html missing — run vite build first');
  }
  const baseHtml = fs.readFileSync(indexPath, 'utf8');

  for (const r of STATIC_ROUTES) {
    const html = injectMeta(baseHtml, {
      ...r,
      canonical: `${SITE_URL}${r.route === '/' ? '/' : r.route}`,
    });
    writeRoute(r.route, html);
  }

  // Category hubs
  try {
    const cats = await fetchJson(`${API}/categories`).then((j) => j.data || j || []);
    for (const c of cats) {
      if (!c.slug) continue;
      const route = `/pets/category/${c.slug}`;
      const title = `${c.name} for Sale in India | ${SITE_NAME}`;
      const description =
        c.description ||
        `Browse verified ${c.name.toLowerCase()} for sale across India on My Duke. Healthy, vaccinated pets from genuine sellers.`;
      writeRoute(
        route,
        injectMeta(baseHtml, {
          title,
          description,
          canonical: `${SITE_URL}${route}`,
          h1: `${c.name} for Sale`,
        })
      );
    }
  } catch (e) {
    console.warn('category prerender skipped:', e.message);
  }

  // Top featured / latest pets
  try {
    const pets = await fetchJson(`${API}/pets?limit=30&sort=newest`).then((j) => j.data || []);
    for (const p of pets.slice(0, 30)) {
      if (!p.slug) continue;
      const route = `/pets/${p.slug}`;
      const title = `${p.seoTitle || `${p.name} for Sale`} | ${SITE_NAME}`;
      const description =
        p.seoDescription ||
        p.description ||
        `${p.name} — ${p.breed || 'pet'} available on My Duke.`;
      writeRoute(
        route,
        injectMeta(baseHtml, {
          title,
          description: String(description).slice(0, 160),
          canonical: `${SITE_URL}${route}`,
          h1: p.name,
        })
      );
    }
  } catch (e) {
    console.warn('pet prerender skipped:', e.message);
  }

  // Breed landings (unique slugs from pets)
  try {
    const pets = await fetchJson(`${API}/pets?limit=100`).then((j) => j.data || []);
    const breedSlugs = new Map();
    for (const p of pets) {
      const raw = String(p.breed || '');
      const s = raw
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      if (s && !breedSlugs.has(s)) breedSlugs.set(s, raw);
    }
    for (const [s, name] of breedSlugs) {
      const route = `/pets/breed/${s}`;
      writeRoute(
        route,
        injectMeta(baseHtml, {
          title: `Buy ${name} in India | ${SITE_NAME}`,
          description: `Buy ${name} pets in India on ${SITE_NAME}. Verified listings with photos and support from Gurugram / Delhi-NCR.`,
          canonical: `${SITE_URL}${route}`,
          h1: `Buy ${name} in India`,
        })
      );
    }
  } catch (e) {
    console.warn('breed prerender skipped:', e.message);
  }

  // Redirect rules: specific prerendered paths before SPA fallback
  const redirects = [
    '/pets/category/*  /pets/category/:splat/index.html  200',
    '/pets/breed/*     /pets/breed/:splat/index.html  200',
    '/pets/*           /pets/:splat/index.html  200',
    '/pets-in-gurugram /pets-in-gurugram/index.html  200',
    '/about            /about/index.html  200',
    '/contact          /contact/index.html  200',
    '/sell             /sell/index.html  200',
    '/help             /help/index.html  200',
    '/*                /index.html  200',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(distDir, '_redirects'), redirects, 'utf8');
  console.log('Updated dist/_redirects for prerendered routes');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
