import mongoose from 'mongoose';

const enquiryPromptSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'default', unique: true },
    promptEnabled: { type: Boolean, default: true },
    promptDelaySeconds: { type: Number, default: 30, min: 5, max: 600 },
    promptTitle: { type: String, default: 'Looking for a pet?' },
    promptMessage: {
      type: String,
      default:
        'Tell us what you need — pick a category and breed, and our team will get back to you.',
    },
    promptCtaText: { type: String, default: 'Submit Enquiry' },
  },
  { timestamps: true }
);

export default mongoose.model('EnquiryPromptSettings', enquiryPromptSettingsSchema);
