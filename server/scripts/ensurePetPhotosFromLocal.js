/**
 * Ensure every prod pet with matching local uploads/pets images has at least 2 photos.
 * Uses existing web-breed-*, web-bird-*, and pdf-breed-* files.
 *
 *   node scripts/ensurePetPhotosFromLocal.js
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
const MIN_PHOTOS = 2;
const TARGET_PHOTOS = 3;

const slugify = (n) =>
  String(n || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const allLocalFiles = fs
  .readdirSync(petsDir)
  .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
  .sort();

/** Prefer web-breed / web-bird numbered sets, then pdf-breed, then loose name matches. */
function localFilesForBreed(breed, name) {
  const candidates = [breed, name]
    .filter(Boolean)
    .map(slugify)
    .filter((s, i, arr) => s && arr.indexOf(s) === i);

  const picked = [];
  const seen = new Set();

  const addMatching = (pred) => {
    for (const f of allLocalFiles) {
      if (seen.has(f)) continue;
      if (!pred(f)) continue;
      seen.add(f);
      picked.push(path.join(petsDir, f));
    }
  };

  for (const slug of candidates) {
    addMatching((f) => f.startsWith(`web-breed-${slug}-`) || f.startsWith(`web-bird-${slug}-`));
  }
  for (const slug of candidates) {
    addMatching((f) => f === `pdf-breed-${slug}.jpg` || f === `pdf-breed-${slug}.jpeg`);
  }
  // Loose: filename contains slug (e.g. goldenretriver-*.jpg)
  for (const slug of candidates) {
    const compact = slug.replace(/-/g, '');
    addMatching(
      (f) =>
        !f.startsWith('web-breed-') &&
        !f.startsWith('web-bird-') &&
        !f.startsWith('pdf-breed-') &&
        (f.toLowerCase().includes(slug) || f.toLowerCase().replace(/[^a-z0-9]/g, '').includes(compact))
    );
  }

  return picked;
}

async function login() {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Login failed: ${JSON.stringify(json)}`);
  const token = json.token || json.data?.token;
  if (!token) throw new Error(`No token: ${JSON.stringify(json)}`);
  return token;
}

async function fetchAllPets() {
  const pets = [];
  let page = 1;
  let pages = 1;
  do {
    const res = await fetch(`${API}/pets?limit=50&page=${page}`);
    const json = await res.json();
    pets.push(...(json.data || []));
    pages = json.pages || 1;
    page += 1;
  } while (page <= pages);
  return pets;
}

async function appendImages(token, petId, filePaths) {
  const form = new FormData();
  for (const file of filePaths) {
    const buf = fs.readFileSync(file);
    const ext = path.extname(file).toLowerCase();
    const type = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
    form.append('images', new Blob([buf], { type }), path.basename(file));
  }
  const res = await fetch(`${API}/pets/${petId}`, {
    method: 'PUT',
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
  return json.data;
}

async function main() {
  if (!EMAIL || !PASSWORD) throw new Error('ADMIN_EMAIL / ADMIN_PASSWORD missing in .env');
  console.log(`API ${API}`);
  console.log(`Local image files: ${allLocalFiles.length}`);

  const token = await login();
  const pets = await fetchAllPets();
  console.log(`Pets on prod: ${pets.length}`);

  let updated = 0;
  let skippedOk = 0;
  let skippedNoFiles = 0;
  let failed = 0;

  for (const pet of pets) {
    const images = pet.images || [];
    const localCount = images.filter((i) => String(i).includes('/uploads/pets/')).length;
    if (images.length >= MIN_PHOTOS && localCount >= MIN_PHOTOS) {
      skippedOk += 1;
      continue;
    }

    const files = localFilesForBreed(pet.breed, pet.name);
    if (!files.length) {
      skippedNoFiles += 1;
      console.warn(`no local files for ${pet.name} (${pet.breed}) — skip`);
      continue;
    }

    // Prefer enough local files so the listing has ≥ MIN_PHOTOS from uploads/pets
    const needLocal = Math.max(0, MIN_PHOTOS - localCount);
    const preferTotal = Math.max(MIN_PHOTOS, Math.min(TARGET_PHOTOS, images.length + files.length));
    const needTotal = Math.max(0, preferTotal - images.length);
    const uploadCount = Math.min(files.length, Math.max(needLocal, needTotal));
    const batch = files.slice(0, uploadCount);

    if (!batch.length) {
      skippedOk += 1;
      continue;
    }

    try {
      const updatedPet = await appendImages(token, pet._id, batch);
      updated += 1;
      console.log(
        `ok ${pet.name} (${pet.breed}): +${batch.length} → ${(updatedPet.images || []).length} images`
      );
    } catch (e) {
      failed += 1;
      console.error(`FAIL ${pet.name}: ${e.message}`);
    }
  }

  // Verify
  const after = await fetchAllPets();
  const under = after.filter((p) => (p.images || []).length < MIN_PHOTOS);
  const underLocal = after.filter(
    (p) => (p.images || []).filter((i) => String(i).includes('/uploads/pets/')).length < MIN_PHOTOS
  );

  console.log(
    `\nDone updated=${updated} alreadyOk=${skippedOk} noLocalFiles=${skippedNoFiles} failed=${failed}`
  );
  console.log(`Pets with <${MIN_PHOTOS} images total: ${under.length}`);
  console.log(`Pets with <${MIN_PHOTOS} /uploads/pets images: ${underLocal.length}`);
  if (under.length) {
    console.log(
      'Still short:',
      under.map((p) => `${p.name}/${p.breed}(${(p.images || []).length})`).join(', ')
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
