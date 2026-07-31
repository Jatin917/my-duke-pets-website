/**
 * Upload all PDF dog breeds to PRODUCTION via admin API (correct Mongo DB + image files).
 *
 *   node scripts/uploadDogsToProd.js
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
const breeds = JSON.parse(fs.readFileSync(path.join(__dirname, 'dogPdfBreeds.json'), 'utf8')).filter(
  (b) => !b.skip && b.priceMin != null
);

const mid = (a, b) => Math.round((a + b) / 2 / 500) * 500;
const slugify = (n) =>
  n
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const sizeFromWeight = (weight) => {
  const nums = String(weight || '')
    .match(/[\d.]+/g)
    ?.map(Number);
  if (!nums?.length) return 'Medium';
  const avg = nums.reduce((x, y) => x + y, 0) / nums.length;
  if (avg < 10) return 'Small';
  if (avg < 25) return 'Medium';
  if (avg < 45) return 'Large';
  return 'Giant';
};

const imageFilesFor = (name) => {
  const slug = slugify(name);
  return fs
    .readdirSync(petsDir)
    .filter((f) => f.startsWith(`web-breed-${slug}-`) && /\.(jpe?g|png|webp)$/i.test(f))
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

async function getDogsCategoryId(token) {
  const res = await fetch(`${API}/categories`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  const list = json.data || json.categories || json;
  const dogs = list.find((c) => c.name === 'Dogs' || c.slug === 'dogs');
  if (!dogs) throw new Error('Dogs category not found');
  return dogs._id;
}

async function listExistingDogBreeds() {
  const res = await fetch(`${API}/pets?category=dogs&limit=50`);
  const json = await res.json();
  const pets = json.data || [];
  return new Set(pets.map((p) => (p.breed || p.name || '').toLowerCase()));
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
  // ignore duplicate errors
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
  const price = mid(b.priceMin, b.priceMax);

  form.append('name', b.name);
  form.append('breed', b.name);
  form.append('category', categoryId);
  form.append('age', 'Available on enquiry');
  form.append('gender', 'Unknown');
  form.append('weight', b.weight || '');
  form.append('price', String(price));
  form.append('vaccinationStatus', 'Vaccinated');
  form.append('healthStatus', 'Healthy');
  form.append('temperament', b.temperament || '');
  form.append('foodPreference', b.food || '');
  form.append(
    'description',
    [
      `${b.name} — origin ${b.origin}.`,
      `Temperament: ${b.temperament}.`,
      `Height ${b.height}, weight ${b.weight}, lifespan ${b.lifespan}.`,
      `Family friendly: ${b.familyFriendly}. Good with kids: ${b.goodWithKids}. Good with other pets: ${b.goodWithPets}. Apartment friendly: ${b.apartmentFriendly}.`,
      `Typical price in India: ₹${b.priceMin.toLocaleString('en-IN')} – ₹${b.priceMax.toLocaleString('en-IN')}.`,
      `Watch for: ${b.health}.`,
    ].join(' ')
  );
  form.append('additionalNotes', `Origin: ${b.origin}. Source: Pet Dogs of India breed guide.`);
  form.append('availability', 'true');
  form.append('featured', order < 6 ? 'true' : 'false');
  form.append('size', sizeFromWeight(b.weight));
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
      { title: 'Daily care', text: b.careTips },
      { title: 'Grooming', text: b.grooming },
      { title: 'Exercise', text: b.exercise },
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
  const categoryId = await getDogsCategoryId(token);
  console.log('Dogs category', categoryId);

  const existing = await listExistingDogBreeds();
  console.log('Existing dog breeds on prod:', existing.size);

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < breeds.length; i++) {
    const b = breeds[i];
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

  const after = await listExistingDogBreeds();
  console.log(`\nDone created=${created} skipped=${skipped} failed=${failed} totalNow=${after.size}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
