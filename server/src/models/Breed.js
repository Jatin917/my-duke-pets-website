import mongoose from 'mongoose';

const breedSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

breedSchema.index({ category: 1, name: 1 }, { unique: true });

export default mongoose.model('Breed', breedSchema);
