import asyncHandler from 'express-async-handler';
import SellRequest from '../models/SellRequest.js';
import Pet from '../models/Pet.js';
import Category from '../models/Category.js';
import {
  sendSellRequestConfirmationEmail,
  sendSellRequestAdminEmail,
  sendSellStatusEmail,
} from '../utils/email.js';

const mapImages = (files = []) => files.map((f) => `/uploads/sell/${f.filename}`);

// @desc    Create sell request
// @route   POST /api/sell
// @access  Public
export const createSellRequest = asyncHandler(async (req, res) => {
  const images = mapImages(req.files);

  if (!images.length) {
    res.status(400);
    throw new Error('Please upload at least one photo of the pet');
  }

  const sellerName = (req.body.sellerName || '').trim();
  const sellerPhone = (req.body.sellerPhone || '').trim();
  const sellerEmail = (req.body.sellerEmail || '').trim().toLowerCase();
  const name = (req.body.name || '').trim();
  const age = (req.body.age || '').trim();
  const price = Number(req.body.price);
  const categoryValue = (req.body.category || '').trim();
  const isOtherCategory = categoryValue === 'other' || categoryValue === '__other__';

  if (!sellerName || !sellerPhone || !sellerEmail || !name || !age) {
    res.status(400);
    throw new Error('Please fill all required seller and pet fields');
  }
  if (!/^\S+@\S+\.\S+$/.test(sellerEmail)) {
    res.status(400);
    throw new Error('Please provide a valid email');
  }
  if (!Number.isFinite(price) || price < 0) {
    res.status(400);
    throw new Error('Please provide a valid price');
  }

  let category = null;
  let customCategory = '';
  let breed = (req.body.breed || '').trim();
  let customBreed = false;
  let mode = 'catalog';

  if (isOtherCategory) {
    mode = 'other';
    customBreed = true;
    customCategory = (req.body.customCategory || '').trim() || 'Other';
    if (!breed) {
      res.status(400);
      throw new Error('Please enter the breed');
    }
  } else {
    if (!categoryValue) {
      res.status(400);
      throw new Error('Please select a category');
    }
    const cat = await Category.findById(categoryValue);
    if (!cat) {
      res.status(400);
      throw new Error('Invalid category');
    }
    category = cat._id;

    if (!breed) {
      res.status(400);
      throw new Error('Please select a breed');
    }
  }

  const request = await SellRequest.create({
    mode,
    category,
    customCategory,
    name,
    breed,
    customBreed,
    age,
    gender: req.body.gender || 'Unknown',
    color: (req.body.color || '').trim(),
    weight: (req.body.weight || '').trim(),
    price,
    vaccinationStatus: req.body.vaccinationStatus || 'Not Vaccinated',
    healthStatus: (req.body.healthStatus || 'Healthy').trim(),
    temperament: (req.body.temperament || '').trim(),
    description: (req.body.description || '').trim(),
    images,
    videoUrl: (req.body.videoUrl || '').trim(),
    sellerName,
    sellerPhone,
    sellerEmail,
    sellerCity: (req.body.sellerCity || '').trim(),
    sellerState: (req.body.sellerState || '').trim(),
    sellerAddress: (req.body.sellerAddress || '').trim(),
    customer: req.body.customerId || null,
  });

  Promise.all([
    sendSellRequestConfirmationEmail({ request }),
    sendSellRequestAdminEmail({ request }),
  ]).catch(() => {});

  res.status(201).json({
    success: true,
    message: 'Sell request submitted! We will review and contact you soon.',
    data: request,
  });
});

// @desc    List sell requests (admin)
// @route   GET /api/sell
// @access  Private/Admin
export const getSellRequests = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { breed: { $regex: search, $options: 'i' } },
      { sellerName: { $regex: search, $options: 'i' } },
      { sellerEmail: { $regex: search, $options: 'i' } },
      { sellerPhone: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(Number(page) || 1, 1);
  const limitNum = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const [data, total] = await Promise.all([
    SellRequest.find(query)
      .populate('category', 'name slug')
      .populate('referencePet', 'name breed slug images')
      .populate('publishedPet', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    SellRequest.countDocuments(query),
  ]);

  res.json({
    success: true,
    count: data.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    data,
  });
});

// @desc    Get single sell request
// @route   GET /api/sell/:id
// @access  Private/Admin
export const getSellRequest = asyncHandler(async (req, res) => {
  const request = await SellRequest.findById(req.params.id)
    .populate('category', 'name slug')
    .populate('referencePet', 'name breed slug images price')
    .populate('publishedPet', 'name slug');
  if (!request) {
    res.status(404);
    throw new Error('Sell request not found');
  }
  res.json({ success: true, data: request });
});

// @desc    Update sell request status (optionally publish as pet)
// @route   PUT /api/sell/:id
// @access  Private/Admin
export const updateSellRequest = asyncHandler(async (req, res) => {
  const request = await SellRequest.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error('Sell request not found');
  }

  const previousStatus = request.status;
  if (req.body.status) request.status = req.body.status;
  if (req.body.adminNotes !== undefined) request.adminNotes = String(req.body.adminNotes);

  // Publish to catalog when approving (if not already published)
  if (req.body.publish === true || req.body.publish === 'true') {
    if (!request.publishedPet) {
      if (!request.category) {
        res.status(400);
        throw new Error(
          'Cannot publish yet — this request used "Other" category. Assign a real category first or create the pet manually.'
        );
      }
      const pet = await Pet.create({
        name: request.name,
        breed: request.breed || 'Unknown',
        category: request.category,
        age: request.age,
        gender: request.gender,
        color: request.color,
        weight: request.weight,
        price: request.price,
        vaccinationStatus: request.vaccinationStatus,
        healthStatus: request.healthStatus,
        temperament: request.temperament,
        description: request.description,
        images: request.images,
        videoUrl: request.videoUrl,
        availability: true,
        featured: false,
      });
      request.publishedPet = pet._id;
      request.status = 'Approved';
    }
  }

  const updated = await request.save();
  await updated.populate([
    { path: 'category', select: 'name slug' },
    { path: 'referencePet', select: 'name breed slug images' },
    { path: 'publishedPet', select: 'name slug' },
  ]);

  if (req.body.status && req.body.status !== previousStatus) {
    sendSellStatusEmail({ request: updated }).catch(() => {});
  } else if (updated.status === 'Approved' && previousStatus !== 'Approved') {
    sendSellStatusEmail({ request: updated }).catch(() => {});
  }

  res.json({ success: true, data: updated });
});

// @desc    Delete sell request
// @route   DELETE /api/sell/:id
// @access  Private/Admin
export const deleteSellRequest = asyncHandler(async (req, res) => {
  const request = await SellRequest.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error('Sell request not found');
  }
  await request.deleteOne();
  res.json({ success: true, message: 'Sell request deleted' });
});
