import express from 'express';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import { categoryValidator } from '../validators/categoryValidator.js';
import validate from '../validators/validate.js';

const router = express.Router();

router.get('/', getCategories);
router.get('/:id', getCategory);
router.post('/', protect, upload.single('image'), categoryValidator, validate, createCategory);
router.put('/:id', protect, upload.single('image'), updateCategory);
router.delete('/:id', protect, deleteCategory);

export default router;
