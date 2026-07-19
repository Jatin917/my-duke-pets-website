import asyncHandler from 'express-async-handler';
import fs from 'fs';
import path from 'path';
import Category from '../models/Category.js';
import Pet from '../models/Pet.js';

const toPublicPath = (filename, folder) => (filename ? `/uploads/${folder}/${filename}` : '');

// @desc    Get all categories (with pet counts)
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const filter = req.query.all === 'true' ? {} : { isActive: true };
  const categories = await Category.find(filter).sort({ order: 1, createdAt: -1 });

  const withCounts = await Promise.all(
    categories.map(async (cat) => {
      const petCount = await Pet.countDocuments({ category: cat._id, availability: true });
      return { ...cat.toObject(), petCount };
    })
  );

  res.json({ success: true, count: withCounts.length, data: withCounts });
});

// @desc    Get single category by id or slug
// @route   GET /api/categories/:id
// @access  Public
export const getCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id };
  const category = await Category.findOne(query);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  res.json({ success: true, data: category });
});

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, icon, order, isActive } = req.body;

  const image = req.file ? toPublicPath(req.file.filename, 'categories') : '';

  const category = await Category.create({
    name,
    description,
    icon,
    order,
    isActive: isActive === 'false' ? false : true,
    image,
  });

  res.status(201).json({ success: true, data: category });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  const { name, description, icon, order, isActive } = req.body;

  if (req.file) {
    if (category.image) {
      const oldPath = path.join(process.cwd(), category.image.replace(/^\//, ''));
      fs.existsSync(oldPath) && fs.unlink(oldPath, () => {});
    }
    category.image = toPublicPath(req.file.filename, 'categories');
  }

  category.name = name ?? category.name;
  category.description = description ?? category.description;
  category.icon = icon ?? category.icon;
  if (order !== undefined) category.order = order;
  if (isActive !== undefined) category.isActive = isActive === 'true' || isActive === true;

  const updated = await category.save();
  res.json({ success: true, data: updated });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  const petCount = await Pet.countDocuments({ category: category._id });
  if (petCount > 0) {
    res.status(400);
    throw new Error('Cannot delete category with existing pets. Reassign or delete pets first.');
  }

  if (category.image) {
    const imgPath = path.join(process.cwd(), category.image.replace(/^\//, ''));
    fs.existsSync(imgPath) && fs.unlink(imgPath, () => {});
  }

  await category.deleteOne();
  res.json({ success: true, message: 'Category deleted successfully' });
});
