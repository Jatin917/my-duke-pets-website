/**
 * Import pet birds + download 3 Openverse images each.
 *
 *   node scripts/importBirds.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import Category from '../src/models/Category.js';
import Pet from '../src/models/Pet.js';
import Breed from '../src/models/Breed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGO_URI =
  process.env.IMPORT_MONGO_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pets_marketplace';
const OUT_DIR = path.join(__dirname, '..', 'uploads', 'pets');
const DATA_PATH = path.join(__dirname, 'petBirds.json');
const IMAGES_PER = 3;
const MIN_WIDTH = 400;
const MIN_BYTES = 12_000;
const UA = 'MyDukePets/1.0 (bird image import; https://mydukepetsolution.com)';

const midPrice = (min, max) => Math.round((Number(min) + Number(max)) / 2 / 100) * 100;

const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const fetchJson = (url) =>
  new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetchJson(res.headers.location).then(resolve).catch(reject);
          return;
        }
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          if (res.statusCode !== 200) {
            reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 120)}`));
            return;
          }
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });

const downloadFile = (url, dest) =>
  new Promise((resolve, reject) => {
    const mod = url.startsWith('http://') ? http : https;
    mod
      .get(url, { headers: { 'User-Agent': UA, Accept: 'image/*,*/*' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          downloadFile(res.headers.location, dest).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        const ws = fs.createWriteStream(dest);
        res.pipe(ws);
        ws.on('finish', () => ws.close(() => resolve(dest)));
        ws.on('error', reject);
      })
      .on('error', reject);
  });

async function openverseUrls(query, count) {
  const q = encodeURIComponent(query);
  const url =
    `https://api.openverse.org/v1/images/?q=${q}&page_size=20` +
    `&license=cc0,pdm,by,by-sa,by-nc,by-nc-sa&extension=jpg,jpeg,png`;
  const json = await fetchJson(url);
  const urls = [];
  const seen = new Set();
  for (const r of json.results || []) {
    const w = Number(r.width || 0);
    const h = Number(r.height || 0);
    if (w && w < MIN_WIDTH) continue;
    if (h && h < 300) continue;
    const src = r.url || r.thumbnail;
    if (!src || seen.has(src)) continue;
    const title = String(r.title || '').toLowerCase();
    if (/(collage|composite|montage|infographic|chart)/.test(title)) continue;
    seen.add(src);
    urls.push(src);
    if (urls.length >= count) break;
  }
  if (!urls.length) throw new Error(`No Openverse hits for "${query}"`);
  return urls;
}

async function saveImages(bird, urls) {
  const slug = slugify(bird.name);
  for (const old of fs.readdirSync(OUT_DIR)) {
    if (old.startsWith(`web-bird-${slug}-`)) fs.unlinkSync(path.join(OUT_DIR, old));
  }
  const paths = [];
  for (let i = 0; i < urls.length && paths.length < IMAGES_PER; i++) {
    const filename = `web-bird-${slug}-${paths.length + 1}.jpg`;
    const dest = path.join(OUT_DIR, filename);
    try {
      await downloadFile(urls[i], dest);
      const size = fs.statSync(dest).size;
      if (size < MIN_BYTES) {
        fs.unlinkSync(dest);
        throw new Error(`too small (${size}B)`);
      }
      paths.push(`/uploads/pets/${filename}`);
      console.log(`  saved ${filename} (${Math.round(size / 1024)}KB)`);
    } catch (e) {
      console.warn(`  skip image ${i + 1}: ${e.message}`);
    }
  }
  return paths;
}

function buildDescription(b) {
  return [
    `${b.name} (${b.scientificName}) — origin ${b.origin}.`,
    `Size ${b.size}, lifespan ${b.lifespan}.`,
    `Nature: ${b.temperament}.`,
    `Best for: ${b.bestFor}.`,
    `Diet: ${b.diet}.`,
    `Typical price in India: ₹${b.priceMin.toLocaleString('en-IN')} – ₹${b.priceMax.toLocaleString('en-IN')} (may vary by age, colour morph & quality).`,
  ].join(' ');
}

async function ensureBirdsCategory() {
  let cat = await Category.findOne({ name: 'Birds' });
  if (!cat) {
    cat = await Category.create({
      name: 'Birds',
      description: 'Colorful, melodious companions for your home.',
      icon: 'Bird',
      image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&q=80',
      order: 3,
      isActive: true,
    });
    console.log('Created Birds category');
  }
  return cat;
}

async function upsertPet(categoryId, bird, images, order) {
  const price = midPrice(bird.priceMin, bird.priceMax);
  const payload = {
    name: bird.name,
    breed: bird.name,
    category: categoryId,
    age: 'Available on enquiry',
    gender: 'Unknown',
    color: '',
    weight: bird.size,
    price,
    discountPrice: null,
    vaccinationStatus: 'Not Vaccinated',
    healthStatus: 'Healthy',
    temperament: bird.temperament,
    foodPreference: bird.diet,
    description: buildDescription(bird),
    additionalNotes: `Scientific name: ${bird.scientificName}. Best for: ${bird.bestFor}.`,
    images,
    videoUrl: '',
    availability: true,
    featured: order <= 4,
    size: bird.size,
    lifespan: bird.lifespan,
    deliveryEstimate: 'Contact us for availability & delivery',
    careTips: [
      { title: 'Daily care', text: `Best for ${bird.bestFor}. Provide clean water, fresh food, and social time.` },
      { title: 'Diet', text: bird.diet },
      { title: 'Space', text: `Adult size about ${bird.size}. Use an appropriately sized cage with room to fly/climb.` },
    ],
    faqs: [
      {
        question: `Is the ${bird.name} good for beginners?`,
        answer: `Best for: ${bird.bestFor}. Nature: ${bird.temperament}.`,
      },
      { question: `What does a ${bird.name} eat?`, answer: bird.diet },
      {
        question: `How long do ${bird.name}s live?`,
        answer: `Typical lifespan: ${bird.lifespan}. Origin: ${bird.origin}.`,
      },
    ],
    recommendedDiet: [
      { title: 'Recommended diet', text: bird.diet },
      { title: 'Tip', text: 'Avoid avocado, chocolate, caffeine, alcohol, and salty/fatty human snacks.' },
    ],
    foodsToAvoid: [
      { title: 'Avoid', text: 'Avocado, chocolate, caffeine, alcohol, fruit pits/seeds that are toxic, and junk food.' },
    ],
    seoTitle: `Buy ${bird.name} in India | My Duke`,
    seoDescription: `${bird.name} — ${bird.temperament}. Price from ₹${bird.priceMin.toLocaleString('en-IN')}.`,
  };

  const existing = await Pet.findOne({ category: categoryId, breed: bird.name });
  if (existing) {
    Object.assign(existing, payload);
    existing.markModified('images');
    await existing.save();
    return 'updated';
  }
  await Pet.create(payload);
  return 'created';
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const birds = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

  console.log(`Connecting ${MONGO_URI.replace(/\/\/.*@/, '//***@')}`);
  await mongoose.connect(MONGO_URI);
  const birdsCat = await ensureBirdsCategory();

  let created = 0;
  let updated = 0;

  for (let i = 0; i < birds.length; i++) {
    const b = birds[i];
    console.log(`\n${b.name}`);
    let images = [];
    try {
      const urls = await openverseUrls(b.search || `${b.name} bird`, IMAGES_PER + 4);
      await sleep(350);
      images = await saveImages(b, urls);
    } catch (e) {
      console.warn(`  image fetch failed: ${e.message}`);
    }

    await Breed.findOneAndUpdate(
      { category: birdsCat._id, name: b.name },
      { $set: { category: birdsCat._id, name: b.name, isActive: true, order: i + 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const action = await upsertPet(birdsCat._id, b, images, i + 1);
    if (action === 'created') created += 1;
    else updated += 1;
    console.log(`  ${action} @ ₹${midPrice(b.priceMin, b.priceMax)} (${images.length} images)`);
  }

  const total = await Pet.countDocuments({ category: birdsCat._id });
  console.log(`\nDone. created=${created} updated=${updated} totalBirds=${total}`);
  await mongoose.disconnect();
}

main().catch(async (e) => {
  console.error(e);
  try {
    await mongoose.disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
