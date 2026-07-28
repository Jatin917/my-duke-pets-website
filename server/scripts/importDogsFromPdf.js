/**
 * Import dog breeds from PDF guide data into Pets + Breeds collections.
 * Uses local Mongo by default (matches running docker mongo).
 *
 *   node scripts/importDogsFromPdf.js
 *   MONGO_URI=mongodb://127.0.0.1:27017/pets_marketplace node scripts/importDogsFromPdf.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import slugify from 'slugify';

import Category from '../src/models/Category.js';
import Pet from '../src/models/Pet.js';
import Breed from '../src/models/Breed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const LOCAL_URI = 'mongodb://127.0.0.1:27017/pets_marketplace';
// Prefer IMPORT_MONGO_URI, else app MONGO_URI, else local docker mongo
const MONGO_URI = process.env.IMPORT_MONGO_URI || process.env.MONGO_URI || LOCAL_URI;

const breedsPath = path.join(__dirname, 'dogPdfBreeds.json');
const manifestPath = path.join(__dirname, 'dogPdfImageManifest.json');

const midPrice = (min, max) => Math.round((Number(min) + Number(max)) / 2 / 500) * 500;

const sizeFromWeight = (weight) => {
  const nums = String(weight || '')
    .match(/[\d.]+/g)
    ?.map(Number);
  if (!nums?.length) return 'Medium';
  const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
  if (avg < 10) return 'Small';
  if (avg < 25) return 'Medium';
  if (avg < 45) return 'Large';
  return 'Giant';
};

const buildDescription = (b) =>
  [
    `${b.name} — origin ${b.origin}.`,
    `Temperament: ${b.temperament}.`,
    `Height ${b.height}, weight ${b.weight}, lifespan ${b.lifespan}.`,
    `Family friendly: ${b.familyFriendly}. Good with kids: ${b.goodWithKids}. Good with other pets: ${b.goodWithPets}. Apartment friendly: ${b.apartmentFriendly}.`,
    `Typical price in India: ₹${b.priceMin.toLocaleString('en-IN')} – ₹${b.priceMax.toLocaleString('en-IN')} (may vary by location, breeder & quality).`,
    `Watch for: ${b.health}.`,
  ].join(' ');

const buildCareTips = (b) => [
  { title: 'Daily care', text: b.careTips },
  { title: 'Grooming', text: b.grooming },
  { title: 'Exercise', text: b.exercise },
  { title: 'Training', text: `Trainability: ${b.trainability}. Climate suitability: ${b.climate}.` },
];

const buildFaqs = (b) => [
  {
    question: `Is the ${b.name} good for families?`,
    answer: `Family friendly: ${b.familyFriendly}. Good with kids: ${b.goodWithKids}. Good with other pets: ${b.goodWithPets}.`,
  },
  {
    question: `What does a ${b.name} eat?`,
    answer: b.food,
  },
  {
    question: `What health issues should I watch for?`,
    answer: b.health,
  },
  {
    question: `Is the ${b.name} apartment-friendly?`,
    answer: `Apartment friendly: ${b.apartmentFriendly}. Exercise needs: ${b.exercise}.`,
  },
];

const buildDiet = (b) => [
  { title: 'Recommended diet', text: b.food },
  { title: 'Feeding tip', text: 'Use age-appropriate portions and avoid sudden diet changes. Fresh water always.' },
];

async function ensureDogsCategory() {
  let cat = await Category.findOne({ name: 'Dogs' });
  if (!cat) {
    cat = await Category.create({
      name: 'Dogs',
      description: 'Loyal, playful companions for every family.',
      icon: 'Dog',
      image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&q=80',
      order: 1,
      isActive: true,
    });
    console.log('Created Dogs category');
  }
  return cat;
}

async function upsertBreed(categoryId, name, order) {
  await Breed.findOneAndUpdate(
    { category: categoryId, name },
    { $set: { category: categoryId, name, isActive: true, order } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function upsertPet(categoryId, breed, imagePath, order) {
  const price = midPrice(breed.priceMin, breed.priceMax);
  const payload = {
    name: breed.name,
    breed: breed.name,
    category: categoryId,
    age: 'Available on enquiry',
    gender: 'Unknown',
    color: '',
    weight: breed.weight,
    price,
    discountPrice: null,
    vaccinationStatus: 'Vaccinated',
    healthStatus: 'Healthy',
    temperament: breed.temperament,
    foodPreference: breed.food,
    description: buildDescription(breed),
    additionalNotes: `Origin: ${breed.origin}. Source: Pet Dogs of India breed guide.`,
    images: imagePath ? [imagePath] : [],
    videoUrl: '',
    availability: true,
    featured: order <= 6,
    size: sizeFromWeight(breed.weight),
    lifespan: breed.lifespan,
    deliveryEstimate: 'Contact us for availability & delivery',
    careTips: buildCareTips(breed),
    faqs: buildFaqs(breed),
    recommendedDiet: buildDiet(breed),
    foodsToAvoid: [
      { title: 'Avoid', text: 'Chocolate, grapes, onions, xylitol, cooked bones, and excess table scraps.' },
    ],
    seoTitle: `Buy ${breed.name} in India | My Duke`,
    seoDescription: `${breed.name} puppies & dogs — ${breed.temperament}. Price from ₹${breed.priceMin.toLocaleString('en-IN')}.`,
  };

  // Match prior PDF imports by breed name under Dogs
  const existing = await Pet.findOne({ category: categoryId, breed: breed.name });
  if (existing) {
    // Keep slug; refresh content + image
    Object.assign(existing, payload);
    // Avoid slug regeneration on name (same name)
    existing.markModified('images');
    await existing.save();
    return { action: 'updated', id: existing._id };
  }

  const created = await Pet.create(payload);
  // Ensure deterministic-ish slug without random if possible — model adds random; fine.
  void slugify;
  return { action: 'created', id: created._id };
}

async function main() {
  const allBreeds = JSON.parse(fs.readFileSync(breedsPath, 'utf8'));
  const breeds = allBreeds.filter((b) => !b.skip && b.priceMin != null);
  if (!fs.existsSync(manifestPath)) {
    throw new Error('Missing dogPdfImageManifest.json — run cropDogPdfPhotos.py first');
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const imageByName = Object.fromEntries(manifest.map((m) => [m.name, m.path]));

  console.log(`Connecting to ${MONGO_URI}`);
  await mongoose.connect(MONGO_URI);
  console.log('Connected');

  const dogs = await ensureDogsCategory();
  let created = 0;
  let updated = 0;

  for (let i = 0; i < breeds.length; i++) {
    const b = breeds[i];
    await upsertBreed(dogs._id, b.name, i + 1);
    const img = imageByName[b.name] || '';
    if (!img) console.warn(`No image for ${b.name}`);
    const { action } = await upsertPet(dogs._id, b, img, i + 1);
    if (action === 'created') created += 1;
    else updated += 1;
    console.log(`${action}: ${b.name} @ ₹${midPrice(b.priceMin, b.priceMax)}`);
  }

  const totalDogs = await Pet.countDocuments({ category: dogs._id });
  console.log(`Done. created=${created} updated=${updated} totalDogsInCategory=${totalDogs}`);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
