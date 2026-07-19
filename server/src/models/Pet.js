import mongoose from 'mongoose';
import slugify from 'slugify';

const petSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    breed: { type: String, required: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    age: { type: String, required: true, trim: true },
    gender: { type: String, enum: ['Male', 'Female', 'Unknown'], default: 'Unknown' },
    color: { type: String, trim: true, default: '' },
    weight: { type: String, trim: true, default: '' },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0, default: null },
    vaccinationStatus: {
      type: String,
      enum: ['Vaccinated', 'Not Vaccinated', 'Partially Vaccinated'],
      default: 'Not Vaccinated',
    },
    healthStatus: { type: String, trim: true, default: 'Healthy' },
    temperament: { type: String, trim: true, default: '' },
    foodPreference: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    additionalNotes: { type: String, trim: true, default: '' },
    images: [{ type: String }],
    videoUrl: { type: String, trim: true, default: '' },
    availability: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    seoTitle: { type: String, trim: true, default: '' },
    seoDescription: { type: String, trim: true, default: '' },
    // Detail-page content (admin-editable). Empty = client uses built-in defaults.
    size: { type: String, trim: true, default: '' },
    lifespan: { type: String, trim: true, default: '' },
    deliveryEstimate: { type: String, trim: true, default: '' },
    careTips: [
      {
        title: { type: String, trim: true, default: '' },
        text: { type: String, trim: true, default: '' },
      },
    ],
    faqs: [
      {
        question: { type: String, trim: true, default: '' },
        answer: { type: String, trim: true, default: '' },
      },
    ],
    recommendedDiet: [
      {
        title: { type: String, trim: true, default: '' },
        text: { type: String, trim: true, default: '' },
      },
    ],
    foodsToAvoid: [
      {
        title: { type: String, trim: true, default: '' },
        text: { type: String, trim: true, default: '' },
      },
    ],
  },
  { timestamps: true }
);

petSchema.pre('validate', function (next) {
  if (this.name && (!this.slug || this.isModified('name'))) {
    this.slug = `${slugify(this.name, { lower: true, strict: true })}-${Math.random()
      .toString(36)
      .substring(2, 7)}`;
  }
  next();
});

petSchema.index({ name: 'text', breed: 'text', description: 'text' });

export default mongoose.model('Pet', petSchema);
