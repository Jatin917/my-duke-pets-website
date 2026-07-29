/**
 * Upsert 49 PDF dog breeds into Dogs category, attaching existing web-breed-*.jpg images.
 *   node scripts/upsertDogsWithWebImages.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import Category from '../src/models/Category.js';
import Pet from '../src/models/Pet.js';
import Breed from '../src/models/Breed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGO_URI =
  process.env.IMPORT_MONGO_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pets_marketplace';
const petsDir = path.join(__dirname, '..', 'uploads', 'pets');
const breeds = JSON.parse(fs.readFileSync(path.join(__dirname, 'dogPdfBreeds.json'), 'utf8')).filter(
  (b) => !b.skip && b.priceMin != null
);

const slugify = (n) =>
  n
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
const mid = (a, b) => Math.round((a + b) / 2 / 500) * 500;
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

const files = fs.existsSync(petsDir)
  ? fs.readdirSync(petsDir).filter((f) => f.startsWith('web-breed-'))
  : [];

const imagesFor = (name) =>
  files
    .filter((f) => f.startsWith(`web-breed-${slugify(name)}-`))
    .sort()
    .map((f) => `/uploads/pets/${f}`);

async function main() {
  console.log(`Connecting ${MONGO_URI.replace(/\/\/.*@/, '//***@')}`);
  console.log(`Found ${files.length} web-breed image files, ${breeds.length} breeds`);
  await mongoose.connect(MONGO_URI);

  let dogs = await Category.findOne({ name: 'Dogs' });
  if (!dogs) {
    dogs = await Category.create({
      name: 'Dogs',
      description: 'Loyal, playful companions for every family.',
      icon: 'Dog',
      image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&q=80',
      order: 1,
      isActive: true,
    });
  }

  let created = 0;
  let updated = 0;
  let noImg = 0;

  for (let i = 0; i < breeds.length; i++) {
    const b = breeds[i];
    const images = imagesFor(b.name);
    if (!images.length) {
      noImg += 1;
      console.warn(`NO IMAGES ${b.name}`);
    }

    await Breed.findOneAndUpdate(
      { category: dogs._id, name: b.name },
      { $set: { category: dogs._id, name: b.name, isActive: true, order: i + 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const price = mid(b.priceMin, b.priceMax);
    const payload = {
      name: b.name,
      breed: b.name,
      category: dogs._id,
      age: 'Available on enquiry',
      gender: 'Unknown',
      color: '',
      weight: b.weight,
      price,
      discountPrice: null,
      vaccinationStatus: 'Vaccinated',
      healthStatus: 'Healthy',
      temperament: b.temperament,
      foodPreference: b.food,
      description: [
        `${b.name} — origin ${b.origin}.`,
        `Temperament: ${b.temperament}.`,
        `Height ${b.height}, weight ${b.weight}, lifespan ${b.lifespan}.`,
        `Family friendly: ${b.familyFriendly}. Good with kids: ${b.goodWithKids}. Good with other pets: ${b.goodWithPets}. Apartment friendly: ${b.apartmentFriendly}.`,
        `Typical price in India: ₹${b.priceMin.toLocaleString('en-IN')} – ₹${b.priceMax.toLocaleString('en-IN')}.`,
        `Watch for: ${b.health}.`,
      ].join(' '),
      additionalNotes: `Origin: ${b.origin}. Source: Pet Dogs of India breed guide.`,
      images,
      videoUrl: '',
      availability: true,
      featured: i < 6,
      size: sizeFromWeight(b.weight),
      lifespan: b.lifespan,
      deliveryEstimate: 'Contact us for availability & delivery',
      careTips: [
        { title: 'Daily care', text: b.careTips },
        { title: 'Grooming', text: b.grooming },
        { title: 'Exercise', text: b.exercise },
        { title: 'Training', text: `Trainability: ${b.trainability}. Climate: ${b.climate}.` },
      ],
      faqs: [
        {
          question: `Is the ${b.name} good for families?`,
          answer: `Family friendly: ${b.familyFriendly}. Good with kids: ${b.goodWithKids}.`,
        },
        { question: `What does a ${b.name} eat?`, answer: b.food },
        { question: 'What health issues should I watch for?', answer: b.health },
      ],
      recommendedDiet: [{ title: 'Recommended diet', text: b.food }],
      foodsToAvoid: [
        { title: 'Avoid', text: 'Chocolate, grapes, onions, xylitol, cooked bones, and excess table scraps.' },
      ],
      seoTitle: `Buy ${b.name} in India | My Duke`,
      seoDescription: `${b.name} — ${b.temperament}. Price from ₹${b.priceMin.toLocaleString('en-IN')}.`,
    };

    const existing = await Pet.findOne({ category: dogs._id, breed: b.name });
    if (existing) {
      Object.assign(existing, payload);
      existing.markModified('images');
      await existing.save();
      updated += 1;
      console.log(`upd ${b.name} ₹${price} imgs ${images.length}`);
    } else {
      await Pet.create(payload);
      created += 1;
      console.log(`new ${b.name} ₹${price} imgs ${images.length}`);
    }
  }

  const total = await Pet.countDocuments({ category: dogs._id });
  console.log(`Done created=${created} updated=${updated} noImg=${noImg} totalDogs=${total}`);
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
