import asyncHandler from 'express-async-handler';
import Breed from '../models/Breed.js';
import Category from '../models/Category.js';
import Pet from '../models/Pet.js';

let seedAttempted = false;

/** One-time seed: import distinct Pet.breed values per category when breeds collection is empty. */
const seedBreedsFromPetsIfEmpty = async () => {
  if (seedAttempted) return;
  seedAttempted = true;

  const count = await Breed.countDocuments();
  if (count > 0) return;

  const pets = await Pet.find({ breed: { $exists: true, $ne: '' } })
    .select('breed category')
    .lean();

  const seen = new Set();
  const docs = [];
  for (const pet of pets) {
    if (!pet.category || !pet.breed) continue;
    const name = String(pet.breed).trim();
    if (!name) continue;
    const key = `${pet.category}:${name.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    docs.push({
      name,
      category: pet.category,
      isActive: true,
      order: 0,
    });
  }

  if (docs.length) {
    try {
      await Breed.insertMany(docs, { ordered: false });
      console.log(`[breeds] seeded ${docs.length} breeds from existing pets`);
    } catch (err) {
      console.warn('[breeds] seed partially failed:', err?.message);
    }
  }
};

// @desc    Get breeds (optionally by category)
// @route   GET /api/breeds
// @access  Public
export const getBreeds = asyncHandler(async (req, res) => {
  await seedBreedsFromPetsIfEmpty();

  const filter = {};
  if (req.query.all !== 'true') filter.isActive = true;
  if (req.query.category) filter.category = req.query.category;

  const breeds = await Breed.find(filter)
    .populate('category', 'name slug')
    .sort({ order: 1, name: 1 });

  res.json({ success: true, count: breeds.length, data: breeds });
});

// @desc    Create breed
// @route   POST /api/breeds
// @access  Private/Admin
export const createBreed = asyncHandler(async (req, res) => {
  const { name, category, order, isActive } = req.body;

  if (!name?.trim()) {
    res.status(400);
    throw new Error('Breed name is required');
  }
  if (!category) {
    res.status(400);
    throw new Error('Category is required');
  }

  const cat = await Category.findById(category);
  if (!cat) {
    res.status(404);
    throw new Error('Category not found');
  }

  const existing = await Breed.findOne({
    category,
    name: { $regex: new RegExp(`^${name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
  });
  if (existing) {
    res.status(400);
    throw new Error('This breed already exists in the selected category');
  }

  const breed = await Breed.create({
    name: name.trim(),
    category,
    order: order !== undefined ? Number(order) || 0 : 0,
    isActive: isActive === 'false' || isActive === false ? false : true,
  });

  const populated = await Breed.findById(breed._id).populate('category', 'name slug');
  res.status(201).json({ success: true, data: populated });
});

// @desc    Update breed
// @route   PUT /api/breeds/:id
// @access  Private/Admin
export const updateBreed = asyncHandler(async (req, res) => {
  const breed = await Breed.findById(req.params.id);
  if (!breed) {
    res.status(404);
    throw new Error('Breed not found');
  }

  const { name, category, order, isActive } = req.body;

  if (category) {
    const cat = await Category.findById(category);
    if (!cat) {
      res.status(404);
      throw new Error('Category not found');
    }
    breed.category = category;
  }

  if (name !== undefined) {
    const trimmed = String(name).trim();
    if (!trimmed) {
      res.status(400);
      throw new Error('Breed name is required');
    }
    const catId = category || breed.category;
    const existing = await Breed.findOne({
      _id: { $ne: breed._id },
      category: catId,
      name: { $regex: new RegExp(`^${trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    });
    if (existing) {
      res.status(400);
      throw new Error('This breed already exists in the selected category');
    }
    breed.name = trimmed;
  }

  if (order !== undefined) breed.order = Number(order) || 0;
  if (isActive !== undefined) breed.isActive = isActive === true || isActive === 'true';

  await breed.save();
  const populated = await Breed.findById(breed._id).populate('category', 'name slug');
  res.json({ success: true, data: populated });
});

// @desc    Delete breed
// @route   DELETE /api/breeds/:id
// @access  Private/Admin
export const deleteBreed = asyncHandler(async (req, res) => {
  const breed = await Breed.findById(req.params.id);
  if (!breed) {
    res.status(404);
    throw new Error('Breed not found');
  }
  await breed.deleteOne();
  res.json({ success: true, message: 'Breed deleted' });
});
