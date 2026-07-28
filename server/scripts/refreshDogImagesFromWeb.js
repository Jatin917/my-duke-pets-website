/**
 * Replace pet images with 3 quality Creative Commons photos via Openverse.
 *
 *   node scripts/refreshDogImagesFromWeb.js
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGO_URI =
  process.env.IMPORT_MONGO_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pets_marketplace';
const OUT_DIR = path.join(__dirname, '..', 'uploads', 'pets');
const IMAGES_PER_BREED = 3;
const MIN_WIDTH = 500;
const MIN_BYTES = 15_000;
const UA = 'MyDukePets/1.0 (breed image import; https://mydukepetsolution.com)';

const SEARCH_QUERY = {
  'Labrador Retriever': 'yellow labrador retriever dog',
  'Golden Retriever': 'golden retriever dog',
  'German Shepherd': 'german shepherd dog',
  Beagle: 'beagle dog',
  Pug: 'pug dog',
  Rottweiler: 'rottweiler dog',
  'Doberman Pinscher': 'doberman pinscher dog',
  'Shih Tzu': 'shih tzu dog',
  'Indian Spitz': 'indian spitz dog',
  Dachshund: 'dachshund dog',
  Boxer: 'boxer dog',
  'Great Dane': 'great dane dog',
  'Siberian Husky': 'siberian husky dog',
  'French Bulldog': 'french bulldog dog',
  Bullmastiff: 'bullmastiff dog',
  'Border Collie': 'border collie dog',
  'Cocker Spaniel': 'cocker spaniel dog',
  Dalmatian: 'dalmatian dog',
  Pomeranian: 'pomeranian dog',
  'Basset Hound': 'basset hound dog',
  'Lhasa Apso': 'lhasa apso dog',
  'Saint Bernard': 'saint bernard dog',
  Akita: 'akita dog',
  'Alaskan Malamute': 'alaskan malamute dog',
  'Bichon Frise': 'bichon frise dog',
  'Poodle (Standard)': 'standard poodle dog',
  'Chow Chow': 'chow chow dog',
  Papillon: 'papillon dog',
  Samoyed: 'samoyed dog',
  Greyhound: 'greyhound dog',
  'Bull Terrier': 'bull terrier dog',
  'Australian Shepherd': 'australian shepherd dog',
  'Irish Setter': 'irish setter dog',
  'Cane Corso': 'cane corso dog',
  Newfoundland: 'newfoundland dog',
  'Belgian Malinois': 'belgian malinois dog',
  'Old English Sheepdog': 'old english sheepdog',
  'Pembroke Welsh Corgi': 'pembroke welsh corgi dog',
  Basenji: 'basenji dog',
  'Tibetan Mastiff': 'tibetan mastiff dog',
  Chihuahua: 'chihuahua dog',
  'Great Swiss Mountain Dog': 'greater swiss mountain dog',
  'Irish Wolfhound': 'irish wolfhound dog',
  Kangal: 'kangal dog',
  'Shiba Inu': 'shiba inu dog',
  Boerboel: 'boerboel dog',
  'Australian Cattle Dog': 'australian cattle dog',
  'American Bully': 'american bully dog',
  'Giant Schnauzer': 'giant schnauzer dog',
};

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
    const req = mod.get(url, { headers: { 'User-Agent': UA, Accept: 'image/*,*/*' } }, (res) => {
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
    });
    req.on('error', reject);
  });

async function openverseUrls(query, count) {
  const q = encodeURIComponent(query);
  const url =
    `https://api.openverse.org/v1/images/?q=${q}&page_size=20` +
    `&license=cc0,pdm,by,by-sa,by-nc,by-nc-sa&extension=jpg,jpeg,png`;
  const json = await fetchJson(url);
  const results = json.results || [];
  const urls = [];
  const seen = new Set();
  for (const r of results) {
    const w = Number(r.width || 0);
    const h = Number(r.height || 0);
    if (w && w < MIN_WIDTH) continue;
    if (h && h < 350) continue;
    const src = r.url || r.thumbnail;
    if (!src || seen.has(src)) continue;
    // Prefer single-subject photos: skip obvious collage keywords in title
    const title = String(r.title || '').toLowerCase();
    if (/(collage|composite|montage|infographic|chart)/.test(title)) continue;
    seen.add(src);
    urls.push(src);
    if (urls.length >= count) break;
  }
  if (!urls.length) throw new Error(`No Openverse hits for "${query}"`);
  return urls;
}

async function saveBreedImages(breedName, urls) {
  const slug = slugify(breedName);
  // Remove previous web images for this breed
  for (const old of fs.readdirSync(OUT_DIR)) {
    if (old.startsWith(`web-breed-${slug}-`)) fs.unlinkSync(path.join(OUT_DIR, old));
  }

  const paths = [];
  for (let i = 0; i < urls.length && paths.length < IMAGES_PER_BREED; i++) {
    const filename = `web-breed-${slug}-${paths.length + 1}.jpg`;
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
      console.warn(`  skip ${i + 1}: ${e.message}`);
    }
  }
  return paths;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const breeds = JSON.parse(fs.readFileSync(path.join(__dirname, 'dogPdfBreeds.json'), 'utf8')).filter(
    (b) => !b.skip && b.priceMin != null
  );

  console.log(`Connecting ${MONGO_URI.replace(/\/\/.*@/, '//***@')}`);
  await mongoose.connect(MONGO_URI);
  const dogs = await Category.findOne({ name: 'Dogs' });
  if (!dogs) throw new Error('Dogs category missing');

  let ok = 0;
  for (const b of breeds) {
    console.log(`\n${b.name}`);
    try {
      const query = SEARCH_QUERY[b.name] || `${b.name} dog`;
      const urls = await openverseUrls(query, IMAGES_PER_BREED + 4);
      await sleep(350); // be polite to Openverse
      const images = await saveBreedImages(b.name, urls);
      if (!images.length) {
        console.warn('  no images saved');
        continue;
      }
      const pet = await Pet.findOne({ category: dogs._id, breed: b.name });
      if (!pet) {
        console.warn('  pet missing');
        continue;
      }
      pet.images = images;
      await pet.save();
      ok += 1;
      console.log(`  updated (${images.length} images)`);
    } catch (e) {
      console.error(`  ERROR: ${e.message}`);
    }
  }

  console.log(`\nDone. Updated ${ok}/${breeds.length} pets.`);
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
