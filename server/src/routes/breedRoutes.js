import express from 'express';
import {
  getBreeds,
  createBreed,
  updateBreed,
  deleteBreed,
} from '../controllers/breedController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getBreeds);
router.post('/', protect, createBreed);
router.put('/:id', protect, updateBreed);
router.delete('/:id', protect, deleteBreed);

export default router;
