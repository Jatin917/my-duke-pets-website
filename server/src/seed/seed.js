import dotenv from 'dotenv';
dotenv.config();

import connectDB from '../config/db.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Pet from '../models/Pet.js';
import { categoriesData, petsSeed } from './seedData.js';

/**
 * Safe seed: never deletes pets/categories/users unless --force-wipe is passed.
 * --force-wipe is blocked when NODE_ENV=production so marketplace listings stay intact.
 */
const forceWipe = process.argv.includes('--force-wipe');
const destroyOnly = process.argv.includes('--destroy');

const ensureAdmin = async () => {
  const email = process.env.ADMIN_EMAIL || 'admin@petnest.com';
  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    return existing;
  }

  const admin = await User.create({
    name: process.env.ADMIN_NAME || 'Super Admin',
    email,
    password: process.env.ADMIN_PASSWORD || 'Admin@12345',
    role: 'superadmin',
  });
  console.log(`Admin created: ${email}`);
  return admin;
};

const ensureCategories = async () => {
  const map = {};
  for (const cat of categoriesData) {
    const doc = await Category.findOneAndUpdate(
      { name: cat.name },
      { $setOnInsert: cat },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    map[cat.name] = doc._id;
  }
  console.log(`Categories ready: ${Object.keys(map).length}`);
  return map;
};

/** Only inserts demo pets when the pets collection is completely empty. */
const ensureDemoPetsIfEmpty = async (categoryMap) => {
  const count = await Pet.countDocuments();
  if (count > 0) {
    console.log(`Pets collection already has ${count} document(s) — skipping demo pet insert.`);
    return;
  }

  const pets = petsSeed.map(({ categoryName, ...pet }) => ({
    ...pet,
    category: categoryMap[categoryName],
  }));
  await Pet.insertMany(pets);
  console.log(`Inserted ${pets.length} demo pets (empty DB only).`);
};

const wipeAll = async () => {
  if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to wipe data when NODE_ENV=production.');
    process.exit(1);
  }
  if (!forceWipe && !destroyOnly) {
    console.error('Wipe refused. Pass --force-wipe (or --destroy --force-wipe) to delete all users/categories/pets.');
    process.exit(1);
  }

  await Promise.all([User.deleteMany(), Category.deleteMany(), Pet.deleteMany()]);
  console.log('All data destroyed.');
};

const importData = async () => {
  if (forceWipe) {
    await wipeAll();
  }

  await ensureAdmin();
  const categoryMap = await ensureCategories();
  await ensureDemoPetsIfEmpty(categoryMap);

  console.log('Seed finished (pets were not deleted).');
  console.log(
    `Admin login -> email: ${process.env.ADMIN_EMAIL || 'admin@petnest.com'} | password: (from ADMIN_PASSWORD / .env)`
  );
  process.exit(0);
};

const run = async () => {
  await connectDB();
  if (destroyOnly) {
    await wipeAll();
    process.exit(0);
  }
  await importData();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
