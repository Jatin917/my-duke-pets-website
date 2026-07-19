import dotenv from 'dotenv';
dotenv.config();

import connectDB from '../config/db.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Pet from '../models/Pet.js';
import { categoriesData, petsSeed } from './seedData.js';

const destroyData = async () => {
  await Promise.all([User.deleteMany(), Category.deleteMany(), Pet.deleteMany()]);
  console.log('All data destroyed');
  process.exit();
};

const importData = async () => {
  await Promise.all([User.deleteMany(), Category.deleteMany(), Pet.deleteMany()]);

  await User.create({
    name: process.env.ADMIN_NAME || 'Super Admin',
    email: process.env.ADMIN_EMAIL || 'admin@petnest.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@12345',
    role: 'superadmin',
  });

  const createdCategories = await Category.insertMany(categoriesData);
  const categoryMap = createdCategories.reduce((acc, cat) => {
    acc[cat.name] = cat._id;
    return acc;
  }, {});

  const pets = petsSeed.map(({ categoryName, ...pet }) => ({
    ...pet,
    category: categoryMap[categoryName],
  }));

  await Pet.insertMany(pets);

  console.log('Seed data imported successfully!');
  console.log(`Admin login -> email: ${process.env.ADMIN_EMAIL || 'admin@petnest.com'} | password: ${process.env.ADMIN_PASSWORD || 'Admin@12345'}`);
  process.exit();
};

const run = async () => {
  await connectDB();
  if (process.argv.includes('--destroy')) {
    await destroyData();
  } else {
    await importData();
  }
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
