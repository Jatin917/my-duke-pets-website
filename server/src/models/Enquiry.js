import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true, default: '' },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    address: { type: String, trim: true, default: '' },
    pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet' },
    petName: { type: String, trim: true, default: '' },
    category: { type: String, trim: true, default: '' },
    breed: { type: String, trim: true, default: '' },
    source: {
      type: String,
      enum: ['pet', 'prompt'],
      default: 'pet',
    },
    message: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['Pending', 'Contacted', 'Completed', 'Rejected'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Enquiry', enquirySchema);
