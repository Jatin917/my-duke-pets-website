/**
 * Replace dog photos with cute puppy images (Wikimedia + Openverse fallback).
 *
 *   node scripts/refreshDogPuppyImages.js
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
const BREEDS_PATH = path.join(__dirname, 'dogPdfBreeds.json');
const IMAGES_PER = 3;
const MIN_BYTES = 15_000;
const UA = 'MyDukePets/1.0 (puppy photos; https://mydukepetsolution.com)';

const SEARCH_TERMS = {
  'Labrador Retriever': ['Labrador Retriever puppy', 'Yellow Labrador puppy'],
  'Golden Retriever': ['Golden Retriever puppy', 'Golden Retriever pup'],
  'German Shepherd': ['German Shepherd puppy', 'German Shepherd Dog puppy'],
  Beagle: ['Beagle puppy', 'Beagle puppies'],
  Pug: ['Pug puppy', 'Pug puppies cute'],
  Rottweiler: ['Rottweiler puppy', 'Rottweiler puppies'],
  'Doberman Pinscher': ['Doberman puppy', 'Dobermann puppy'],
  'Shih Tzu': ['Shih Tzu puppy', 'Shih-Tzu puppy'],
  'Indian Spitz': ['Indian Spitz puppy', 'Spitz puppy'],
  Dachshund: ['Dachshund puppy', 'Wiener dog puppy'],
  Boxer: ['Boxer puppy', 'Boxer dog puppy'],
  'Great Dane': ['Great Dane puppy', 'Great Dane puppies'],
  'Siberian Husky': ['Siberian Husky puppy', 'Husky puppy'],
  'French Bulldog': ['French Bulldog puppy', 'Frenchie puppy'],
  Bullmastiff: ['Bullmastiff puppy', 'Bull Mastiff puppy'],
  'Border Collie': ['Border Collie puppy', 'Border Collie puppies'],
  'Cocker Spaniel': ['Cocker Spaniel puppy', 'English Cocker Spaniel puppy'],
  Dalmatian: ['Dalmatian puppy', 'Dalmatian puppies'],
  Pomeranian: ['Pomeranian puppy', 'Pomeranian puppies cute'],
  'Basset Hound': ['Basset Hound puppy', 'Basset puppy'],
  'Lhasa Apso': ['Lhasa Apso puppy', 'Lhasa Apso puppies'],
  'Saint Bernard': ['Saint Bernard puppy', 'St Bernard puppy'],
  Akita: ['Akita puppy', 'Akita Inu puppy'],
  'Alaskan Malamute': ['Alaskan Malamute puppy', 'Malamute puppy'],
  'Bichon Frise': ['Bichon Frise puppy', 'Bichon puppy'],
  'Poodle (Standard)': ['Poodle puppy', 'Standard Poodle puppy'],
  'Chow Chow': ['Chow Chow puppy', 'Chow puppy'],
  Papillon: ['Papillon puppy', 'Papillon dog puppy'],
  Samoyed: ['Samoyed puppy', 'Samoyed puppies'],
  Greyhound: ['Greyhound puppy', 'Greyhound puppies'],
  'Bull Terrier': ['Bull Terrier puppy', 'English Bull Terrier puppy'],
  'Australian Shepherd': ['Australian Shepherd puppy', 'Aussie puppy'],
  'Irish Setter': ['Irish Setter puppy', 'Irish Setter puppies'],
  'Cane Corso': ['Cane Corso puppy', 'Cane Corso puppies'],
  Newfoundland: ['Newfoundland puppy', 'Newfoundland dog puppy'],
  'Belgian Malinois': ['Belgian Malinois puppy', 'Malinois puppy'],
  'Old English Sheepdog': ['Old English Sheepdog puppy', 'Bobtail puppy'],
  'Pembroke Welsh Corgi': ['Corgi puppy', 'Pembroke Welsh Corgi puppy'],
  Basenji: ['Basenji puppy', 'Basenji puppies'],
  'Tibetan Mastiff': ['Tibetan Mastiff puppy', 'Tibetan Mastiff puppies'],
  Chihuahua: ['Chihuahua puppy', 'Chihuahua puppies cute'],
  'Great Swiss Mountain Dog': ['Greater Swiss Mountain Dog puppy', 'Swiss Mountain Dog puppy'],
  'Irish Wolfhound': ['Irish Wolfhound puppy', 'Irish Wolfhound puppies'],
  Kangal: ['Kangal puppy', 'Kangal dog puppy'],
  'Shiba Inu': ['Shiba Inu puppy', 'Shiba puppy'],
  Boerboel: ['Boerboel puppy', 'Boerboel puppies'],
  'Australian Cattle Dog': ['Australian Cattle Dog puppy', 'Blue Heeler puppy'],
  'American Bully': ['American Bully puppy', 'American Bully puppies'],
  'Giant Schnauzer': ['Giant Schnauzer puppy', 'Schnauzer puppy'],
};

const REJECT =
  /\b(adult|senior|skeleton|diagram|chart|collage|x-?ray|dead|attack|skull|taxidermy|drawing|painting|logo|map)\b/i;
const WANT = /\b(puppy|puppies|pup|welpe|chiot|cachorro|baby)\b/i;

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
          if (res.statusCode === 429) {
            reject(new Error('HTTP 429'));
            return;
          }
          if (res.statusCode !== 200) {
            reject(new Error(`HTTP ${res.statusCode}`));
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

async function wikiPuppyUrls(terms, count) {
  const seen = new Set();
  const urls = [];

  for (const term of terms) {
    const api =
      'https://commons.wikimedia.org/w/api.php?action=query&format=json' +
      `&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(term)}` +
      `&gsrlimit=20&prop=imageinfo&iiprop=url|mime|size&iiurlwidth=1000`;
    let json;
    try {
      json = await fetchJson(api);
    } catch (e) {
      console.warn(`  wiki fail "${term}": ${e.message}`);
      await sleep(2000);
      continue;
    }

    const pages = Object.values(json?.query?.pages || {});
    // Prefer titles that clearly say puppy
    const ranked = pages
      .map((p) => {
        const title = String(p.title || '');
        const info = p.imageinfo?.[0];
        if (!info) return null;
        const mime = info.mime || '';
        if (!mime.startsWith('image/') || mime.includes('svg')) return null;
        if (REJECT.test(title)) return null;
        let score = 0;
        if (WANT.test(title)) score += 10;
        if (/cute|adorable|fluffy|baby/i.test(title)) score += 3;
        if ((info.width || 0) >= 600) score += 1;
        return { url: info.thumburl || info.url, score, title };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score);

    for (const r of ranked) {
      if (seen.has(r.url)) continue;
      // Require puppy signal when available; allow lower scores only if short on images
      if (r.score < 10 && urls.length + ranked.filter((x) => x.score >= 10 && !seen.has(x.url)).length >= count) {
        continue;
      }
      if (r.score < 10 && urls.length === 0) {
        // keep searching other terms first
        continue;
      }
      if (r.score < 10) continue;
      seen.add(r.url);
      urls.push(r.url);
      if (urls.length >= count) return urls;
    }
    await sleep(800);
  }

  // Fallback: accept best non-rejected breed photos if puppy-tagged were scarce
  if (urls.length < count) {
    for (const term of terms) {
      const api =
        'https://commons.wikimedia.org/w/api.php?action=query&format=json' +
        `&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(term.replace(/ puppy| puppies/gi, ' dog puppy'))}` +
        `&gsrlimit=15&prop=imageinfo&iiprop=url|mime&iiurlwidth=1000`;
      try {
        const json = await fetchJson(api);
        for (const p of Object.values(json?.query?.pages || {})) {
          const title = String(p.title || '');
          const info = p.imageinfo?.[0];
          if (!info || REJECT.test(title)) continue;
          if (!WANT.test(title)) continue;
          const mime = info.mime || '';
          if (!mime.startsWith('image/') || mime.includes('svg')) continue;
          const u = info.thumburl || info.url;
          if (seen.has(u)) continue;
          seen.add(u);
          urls.push(u);
          if (urls.length >= count) return urls;
        }
      } catch {
        /* ignore */
      }
      await sleep(800);
    }
  }

  return urls;
}

async function openversePuppyUrls(query, count) {
  const url =
    `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&page_size=20` +
    `&license=cc0,pdm,by,by-sa,by-nc,by-nc-sa&extension=jpg,jpeg,png`;
  const json = await fetchJson(url);
  const urls = [];
  for (const r of json.results || []) {
    const title = String(r.title || '');
    const tags = Array.isArray(r.tags) ? r.tags.map((t) => t.name || t).join(' ') : '';
    const blob = `${title} ${tags}`;
    if (REJECT.test(blob) || !WANT.test(blob)) continue;
    if ((r.width || 0) && r.width < 400) continue;
    const src = r.url || r.thumbnail;
    if (!src) continue;
    urls.push(src);
    if (urls.length >= count) break;
  }
  return urls;
}

async function saveImages(breedName, urls) {
  const slug = slugify(breedName);
  for (const old of fs.readdirSync(OUT_DIR)) {
    if (old.startsWith(`web-breed-${slug}-`)) fs.unlinkSync(path.join(OUT_DIR, old));
  }
  const paths = [];
  for (let i = 0; i < urls.length && paths.length < IMAGES_PER; i++) {
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
    await sleep(200);
  }
  return paths;
}

async function resolveUrls(breedName) {
  const terms = SEARCH_TERMS[breedName] || [`${breedName} puppy`];
  let urls = await wikiPuppyUrls(terms, IMAGES_PER + 2);
  if (urls.length < IMAGES_PER) {
    console.log('  wiki short — trying Openverse…');
    await sleep(1500);
    try {
      const more = await openversePuppyUrls(terms[0], IMAGES_PER + 2);
      for (const u of more) {
        if (!urls.includes(u)) urls.push(u);
      }
    } catch (e) {
      console.warn(`  openverse: ${e.message}`);
    }
  }
  if (!urls.length) throw new Error('no puppy URLs found');
  return urls.slice(0, IMAGES_PER + 3);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const breeds = JSON.parse(fs.readFileSync(BREEDS_PATH, 'utf8')).filter((b) => !b.skip && b.priceMin != null);

  console.log(`Connecting ${MONGO_URI.replace(/\/\/.*@/, '//***@')}`);
  await mongoose.connect(MONGO_URI);
  const dogs = await Category.findOne({ name: 'Dogs' });
  if (!dogs) throw new Error('Dogs category missing');

  let ok = 0;
  for (const b of breeds) {
    console.log(`\n${b.name}`);
    try {
      const urls = await resolveUrls(b.name);
      const images = await saveImages(b.name, urls);
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
      pet.age = 'Puppy';
      await pet.save();
      ok += 1;
      console.log(`  OK ${images.length} puppy photos`);
    } catch (e) {
      console.error(`  ERROR: ${e.message}`);
    }
    await sleep(600);
  }

  console.log(`\nDone. ${ok}/${breeds.length} dogs updated with puppy images.`);
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
