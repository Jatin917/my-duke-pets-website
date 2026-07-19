import mongoose from 'mongoose';

const sellRequestSchema = new mongoose.Schema(
  {
    mode: { type: String, enum: ['catalog', 'other'], default: 'catalog' },
    referencePet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', default: null },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    customCategory: { type: String, trim: true, default: '' },
    name: { type: String, trim: true, required: true },
    breed: { type: String, trim: true, default: '' },
    customBreed: { type: Boolean, default: false },
    age: { type: String, trim: true, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Unknown'], default: 'Unknown' },
    color: { type: String, trim: true, default: '' },
    weight: { type: String, trim: true, default: '' },
    price: { type: Number, required: true, min: 0 },
    vaccinationStatus: {
      type: String,
      enum: ['Vaccinated', 'Not Vaccinated', 'Partially Vaccinated'],
      default: 'Not Vaccinated',
    },
    healthStatus: { type: String, trim: true, default: 'Healthy' },
    temperament: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    images: [{ type: String }],
    videoUrl: { type: String, trim: true, default: '' },
    // Seller contact
    sellerName: { type: String, trim: true, required: true },
    sellerPhone: { type: String, trim: true, required: true },
    sellerEmail: { type: String, trim: true, required: true, lowercase: true },
    sellerCity: { type: String, trim: true, default: '' },
    sellerState: { type: String, trim: true, default: '' },
    sellerAddress: { type: String, trim: true, default: '' },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
    status: {
      type: String,
      enum: ['Pending', 'Reviewed', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    adminNotes: { type: String, trim: true, default: '' },
    publishedPet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', default: null },
  },
  { timestamps: true }
);

sellRequestSchema.index({ status: 1, createdAt: -1 });
sellRequestSchema.index({ sellerEmail: 1 });

export default mongoose.model('SellRequest', sellRequestSchema);
