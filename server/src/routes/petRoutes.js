import express from 'express';
import {
  getPets,
  getFeaturedPets,
  getLatestPets,
  getPet,
  createPet,
  updatePet,
  deletePet,
} from '../controllers/petController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import { petValidator } from '../validators/petValidator.js';
import validate from '../validators/validate.js';

const router = express.Router();

router.get('/', getPets);
router.get('/featured', getFeaturedPets);
router.get('/latest', getLatestPets);
router.get('/:id', getPet);
router.post('/', protect, upload.array('images', 10), petValidator, validate, createPet);
router.put('/:id', protect, upload.array('images', 10), updatePet);
router.delete('/:id', protect, deletePet);

export default router;
