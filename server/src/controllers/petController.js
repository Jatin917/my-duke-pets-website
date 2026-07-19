import asyncHandler from 'express-async-handler';
import fs from 'fs';
import path from 'path';
import Pet from '../models/Pet.js';
import Category from '../models/Category.js';

const toPublicPath = (filename) => `/uploads/pets/${filename}`;

const TITLE_TEXT_KEYS = ['careTips', 'faqs', 'recommendedDiet', 'foodsToAvoid'];

const parseJsonArray = (value) => {
  if (value === undefined || value === null || value === '') return null;
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
  return null;
};

const normalizeTitleTextItems = (items, { questionMode = false } = {}) => {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      if (questionMode) {
        const question = String(item.question || item.q || '').trim();
        const answer = String(item.answer || item.a || '').trim();
        return question || answer ? { question, answer } : null;
      }
      const title = String(item.title || '').trim();
      const text = String(item.text || '').trim();
      return title || text ? { title, text } : null;
    })
    .filter(Boolean);
};

const applyDetailContent = (target, body) => {
  ['size', 'lifespan', 'deliveryEstimate'].forEach((field) => {
    if (body[field] !== undefined) target[field] = body[field];
  });

  TITLE_TEXT_KEYS.forEach((key) => {
    if (body[key] === undefined) return;
    const parsed = parseJsonArray(body[key]);
    if (parsed === null) return;
    target[key] = normalizeTitleTextItems(parsed, { questionMode: key === 'faqs' });
  });
};

const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
  'name-asc': { name: 1 },
  'name-desc': { name: -1 },
};

// @desc    Get all pets with search, filters, sorting, pagination
// @route   GET /api/pets
// @access  Public
export const getPets = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    gender,
    minAge,
    maxAge,
    minPrice,
    maxPrice,
    breed,
    availability,
    featured,
    sort = 'newest',
    page = 1,
    limit = 12,
  } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { breed: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  if (category) {
    const categories = Array.isArray(category) ? category : category.split(',');
    const catDocs = await Category.find({
      $or: [{ slug: { $in: categories } }, { _id: { $in: categories.filter((c) => c.match(/^[0-9a-fA-F]{24}$/)) } }],
    });
    query.category = { $in: catDocs.map((c) => c._id) };
  }

  if (gender) query.gender = { $in: gender.split(',') };
  if (breed) query.breed = { $regex: breed, $options: 'i' };
  if (availability !== undefined) query.availability = availability === 'true';
  if (featured !== undefined) query.featured = featured === 'true';

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  if (minAge || maxAge) {
    // age stored as string like "2 years"; attempt numeric filter on leading number
    query.age = { $exists: true };
  }

  const pageNum = Math.max(Number(page) || 1, 1);
  const limitNum = Math.min(Math.max(Number(limit) || 12, 1), 50);
  const skip = (pageNum - 1) * limitNum;

  const sortOption = SORT_OPTIONS[sort] || SORT_OPTIONS.newest;

  const [pets, total] = await Promise.all([
    Pet.find(query).populate('category', 'name slug').sort(sortOption).skip(skip).limit(limitNum),
    Pet.countDocuments(query),
  ]);

  res.json({
    success: true,
    count: pets.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    data: pets,
  });
});

// @desc    Get featured pets
// @route   GET /api/pets/featured
// @access  Public
export const getFeaturedPets = asyncHandler(async (req, res) => {
  const pets = await Pet.find({ featured: true, availability: true })
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .limit(8);
  res.json({ success: true, data: pets });
});

// @desc    Get latest pets
// @route   GET /api/pets/latest
// @access  Public
export const getLatestPets = asyncHandler(async (req, res) => {
  const pets = await Pet.find({ availability: true })
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .limit(8);
  res.json({ success: true, data: pets });
});

// @desc    Get single pet by id or slug + related pets
// @route   GET /api/pets/:id
// @access  Public
export const getPet = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id };

  const pet = await Pet.findOne(query).populate('category', 'name slug');

  if (!pet) {
    res.status(404);
    throw new Error('Pet not found');
  }

  pet.views += 1;
  await pet.save();

  const relatedPets = await Pet.find({
    category: pet.category,
    _id: { $ne: pet._id },
  })
    .limit(4)
    .populate('category', 'name slug');

  res.json({ success: true, data: pet, related: relatedPets });
});

// @desc    Create pet
// @route   POST /api/pets
// @access  Private/Admin
export const createPet = asyncHandler(async (req, res) => {
  const images = (req.files || []).map((f) => toPublicPath(f.filename));

  const payload = {
    ...req.body,
    availability: req.body.availability === 'false' ? false : true,
    featured: req.body.featured === 'true' || req.body.featured === true,
    images,
  };

  // Strip raw JSON fields then normalize via helper
  TITLE_TEXT_KEYS.forEach((key) => {
    delete payload[key];
  });
  applyDetailContent(payload, req.body);

  const pet = await Pet.create(payload);

  res.status(201).json({ success: true, data: pet });
});

// @desc    Update pet
// @route   PUT /api/pets/:id
// @access  Private/Admin
export const updatePet = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.id);

  if (!pet) {
    res.status(404);
    throw new Error('Pet not found');
  }

  const fields = [
    'name',
    'breed',
    'category',
    'age',
    'gender',
    'color',
    'weight',
    'price',
    'discountPrice',
    'vaccinationStatus',
    'healthStatus',
    'temperament',
    'foodPreference',
    'description',
    'additionalNotes',
    'videoUrl',
    'seoTitle',
    'seoDescription',
  ];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) pet[field] = req.body[field];
  });

  applyDetailContent(pet, req.body);

  if (req.body.availability !== undefined) {
    pet.availability = req.body.availability === 'true' || req.body.availability === true;
  }
  if (req.body.featured !== undefined) {
    pet.featured = req.body.featured === 'true' || req.body.featured === true;
  }

  // Handle removal of existing images
  if (req.body.removedImages) {
    const removed = Array.isArray(req.body.removedImages)
      ? req.body.removedImages
      : [req.body.removedImages];
    removed.forEach((img) => {
      const imgPath = path.join(process.cwd(), img.replace(/^\//, ''));
      fs.existsSync(imgPath) && fs.unlink(imgPath, () => {});
    });
    pet.images = pet.images.filter((img) => !removed.includes(img));
  }

  if (req.files && req.files.length) {
    const newImages = req.files.map((f) => toPublicPath(f.filename));
    pet.images = [...pet.images, ...newImages];
  }

  const updated = await pet.save();
  res.json({ success: true, data: updated });
});

// @desc    Delete pet
// @route   DELETE /api/pets/:id
// @access  Private/Admin
export const deletePet = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.id);

  if (!pet) {
    res.status(404);
    throw new Error('Pet not found');
  }

  pet.images.forEach((img) => {
    const imgPath = path.join(process.cwd(), img.replace(/^\//, ''));
    fs.existsSync(imgPath) && fs.unlink(imgPath, () => {});
  });

  await pet.deleteOne();
  res.json({ success: true, message: 'Pet deleted successfully' });
});
