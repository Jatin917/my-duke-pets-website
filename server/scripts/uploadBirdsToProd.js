/**
 * Upload birds from petBirds.json to PRODUCTION via admin API.
 *   node scripts/uploadBirdsToProd.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const API = process.env.PROD_API_URL || 'https://api.mydukepetsolution.com/api';
const EMAIL = process.env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD;
const petsDir = path.join(__dirname, '..', 'uploads', 'pets');
const birds = JSON.parse(fs.readFileSync(path.join(__dirname, 'petBirds.json'), 'utf8'));

const midPrice = (min, max) => Math.round((Number(min) + Number(max)) / 2 / 100) * 100;
const slugify = (n) =>
  n
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const imageFilesFor = (name) => {
  const slug = slugify(name);
  return fs
    .readdirSync(petsDir)
    .filter((f) => f.startsWith(`web-bird-${slug}-`) && /\.(jpe?g|png|webp)$/i.test(f))
    .sort()
    .slice(0, 3)
    .map((f) => path.join(petsDir, f));
};

async function login() {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Login failed: ${JSON.stringify(json)}`);
  const token = json.token || json.data?.token;
  if (!token) throw new Error(`No token in login response: ${JSON.stringify(json)}`);
  return token;
}

async function getBirdsCategoryId(token) {
  const res = await fetch(`${API}/categories`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  const list = json.data || json.categories || json;
  const birdsCat = list.find((c) => c.name === 'Birds' || c.slug === 'birds');
  if (!birdsCat) throw new Error('Birds category not found');
  return birdsCat._id;
}

async function listExistingBirdBreeds() {
  const names = new Set();
  let page = 1;
  let pages = 1;
  do {
    const res = await fetch(`${API}/pets?category=birds&limit=50&page=${page}`);
    const json = await res.json();
    const pets = json.data || [];
    pets.forEach((p) => names.add((p.breed || p.name || '').toLowerCase()));
    pages = json.pages || 1;
    page += 1;
  } while (page <= pages);
  return names;
}

async function ensureBreed(token, categoryId, name, order) {
  const res = await fetch(`${API}/breeds`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, category: categoryId, isActive: true, order }),
  });
  if (!res.ok) {
    const t = await res.text();
    if (!/duplicate|exists|E11000/i.test(t)) {
      console.warn(`  breed warn: ${t.slice(0, 120)}`);
    }
  }
}

async function createPet(token, categoryId, b, order) {
  const files = imageFilesFor(b.name);
  const form = new FormData();
  const price = midPrice(b.priceMin, b.priceMax);

  form.append('name', b.name);
  form.append('breed', b.name);
  form.append('category', categoryId);
  form.append('age', 'Available on enquiry');
  form.append('gender', 'Unknown');
  form.append('weight', b.size || '');
  form.append('price', String(price));
  form.append('vaccinationStatus', 'Not Vaccinated');
  form.append('healthStatus', 'Healthy');
  form.append('temperament', b.temperament || '');
  form.append('foodPreference', b.diet || '');
  form.append(
    'description',
    [
      `${b.name} (${b.scientificName}) — origin ${b.origin}.`,
      `Temperament: ${b.temperament}.`,
      `Size ${b.size}, lifespan ${b.lifespan}. Best for: ${b.bestFor}.`,
      `Diet: ${b.diet}.`,
      `Typical price in India: ₹${b.priceMin.toLocaleString('en-IN')} – ₹${b.priceMax.toLocaleString('en-IN')}.`,
    ].join(' ')
  );
  form.append('additionalNotes', `Scientific name: ${b.scientificName}. Best for: ${b.bestFor}.`);
  form.append('availability', 'true');
  form.append('featured', order < 4 ? 'true' : 'false');
  form.append('size', b.size || '');
  form.append('lifespan', b.lifespan || '');
  form.append('deliveryEstimate', 'Contact us for availability & delivery');
  form.append('seoTitle', `Buy ${b.name} in India | My Duke`);
  form.append(
    'seoDescription',
    `${b.name} — ${b.temperament}. Price from ₹${b.priceMin.toLocaleString('en-IN')}.`
  );
  form.append(
    'careTips',
    JSON.stringify([
      { title: 'Daily care', text: `Best for ${b.bestFor}. Provide clean water, fresh food, and social time.` },
      { title: 'Diet', text: b.diet },
      { title: 'Space', text: `Adult size about ${b.size}. Use an appropriately sized cage with room to fly/climb.` },
    ])
  );

  for (const file of files) {
    const buf = fs.readFileSync(file);
    const blob = new Blob([buf], { type: 'image/jpeg' });
    form.append('images', blob, path.basename(file));
  }

  const res = await fetch(`${API}/pets`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text.slice(0, 200) };
  }
  if (!res.ok) throw new Error(JSON.stringify(json));
  return { price, images: files.length, id: json.data?._id };
}

async function main() {
  if (!EMAIL || !PASSWORD) throw new Error('ADMIN_EMAIL / ADMIN_PASSWORD missing in .env');
  console.log(`API ${API}`);
  const token = await login();
  console.log('Logged in');
  const categoryId = await getBirdsCategoryId(token);
  console.log('Birds category', categoryId);

  const existing = await listExistingBirdBreeds();
  console.log('Existing bird breeds on prod:', existing.size, [...existing].join(', '));

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < birds.length; i++) {
    const b = birds[i];
    if (existing.has(b.name.toLowerCase())) {
      console.log(`skip existing ${b.name}`);
      skipped += 1;
      continue;
    }
    try {
      await ensureBreed(token, categoryId, b.name, i + 1);
      const r = await createPet(token, categoryId, b, i);
      created += 1;
      console.log(`created ${b.name} ₹${r.price} imgs ${r.images}`);
    } catch (e) {
      failed += 1;
      console.error(`FAIL ${b.name}: ${e.message}`);
    }
  }

  const after = await listExistingBirdBreeds();
  console.log(`\nDone created=${created} skipped=${skipped} failed=${failed} totalBirdsNow=${after.size}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
