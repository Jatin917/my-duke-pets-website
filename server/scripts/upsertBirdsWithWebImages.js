/**
 * Upsert birds from petBirds.json using existing web-bird-*.jpg files (no re-download).
 *   node scripts/upsertBirdsWithWebImages.js
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
const birds = JSON.parse(fs.readFileSync(path.join(__dirname, 'petBirds.json'), 'utf8'));

const slugify = (n) =>
  n
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const midPrice = (min, max) => Math.round((Number(min) + Number(max)) / 2 / 100) * 100;

const files = fs.existsSync(petsDir)
  ? fs.readdirSync(petsDir).filter((f) => f.startsWith('web-bird-'))
  : [];

const imagesFor = (name) => {
  const slug = slugify(name);
  return files
    .filter((f) => f.startsWith(`web-bird-${slug}-`))
    .sort()
    .map((f) => `/uploads/pets/${f}`);
};

async function main() {
  console.log(`Connecting ${MONGO_URI.replace(/\/\/.*@/, '//***@')}`);
  console.log(`Found ${files.length} web-bird images, ${birds.length} species`);
  await mongoose.connect(MONGO_URI);

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
  }

  let created = 0;
  let updated = 0;

  for (let i = 0; i < birds.length; i++) {
    const b = birds[i];
    const images = imagesFor(b.name);
    if (!images.length) console.warn(`NO IMAGES ${b.name}`);

    await Breed.findOneAndUpdate(
      { category: cat._id, name: b.name },
      { $set: { category: cat._id, name: b.name, isActive: true, order: i + 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const price = midPrice(b.priceMin, b.priceMax);
    const payload = {
      name: b.name,
      breed: b.name,
      category: cat._id,
      age: 'Available on enquiry',
      gender: 'Unknown',
      color: '',
      weight: b.size,
      price,
      discountPrice: null,
      vaccinationStatus: 'Not Vaccinated',
      healthStatus: 'Healthy',
      temperament: b.temperament,
      foodPreference: b.diet,
      description: [
        `${b.name} (${b.scientificName}) — origin ${b.origin}.`,
        `Temperament: ${b.temperament}.`,
        `Size ${b.size}, lifespan ${b.lifespan}. Best for: ${b.bestFor}.`,
        `Diet: ${b.diet}.`,
        `Typical price in India: ₹${b.priceMin.toLocaleString('en-IN')} – ₹${b.priceMax.toLocaleString('en-IN')}.`,
      ].join(' '),
      additionalNotes: `Scientific name: ${b.scientificName}. Best for: ${b.bestFor}.`,
      images,
      videoUrl: '',
      availability: true,
      featured: i < 4,
      size: b.size,
      lifespan: b.lifespan,
      deliveryEstimate: 'Contact us for availability & delivery',
      careTips: [
        { title: 'Daily care', text: `Best for ${b.bestFor}. Provide clean water, fresh food, and social time.` },
        { title: 'Diet', text: b.diet },
        { title: 'Space', text: `Adult size about ${b.size}. Use an appropriately sized cage with room to fly/climb.` },
      ],
      faqs: [
        {
          question: `Is the ${b.name} good for beginners?`,
          answer: `Best for: ${b.bestFor}. Nature: ${b.temperament}.`,
        },
        { question: `What does a ${b.name} eat?`, answer: b.diet },
        {
          question: `How long do ${b.name}s live?`,
          answer: `Typical lifespan: ${b.lifespan}. Origin: ${b.origin}.`,
        },
      ],
      recommendedDiet: [
        { title: 'Recommended diet', text: b.diet },
        { title: 'Tip', text: 'Avoid avocado, chocolate, caffeine, alcohol, and salty/fatty human snacks.' },
      ],
      foodsToAvoid: [
        {
          title: 'Avoid',
          text: 'Avocado, chocolate, caffeine, alcohol, fruit pits/seeds that are toxic, and junk food.',
        },
      ],
      seoTitle: `Buy ${b.name} in India | My Duke`,
      seoDescription: `${b.name} — ${b.temperament}. Price from ₹${b.priceMin.toLocaleString('en-IN')}.`,
    };

    const existing = await Pet.findOne({ category: cat._id, breed: b.name });
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

  const total = await Pet.countDocuments({ category: cat._id });
  console.log(`Done created=${created} updated=${updated} totalBirds=${total}`);
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
