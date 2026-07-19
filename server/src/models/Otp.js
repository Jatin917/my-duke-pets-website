import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
  {
    channel: { type: String, enum: ['email', 'phone'], required: true },
    identifier: { type: String, required: true, trim: true, lowercase: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    verified: { type: Boolean, default: false },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

otpSchema.index({ identifier: 1, channel: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Otp', otpSchema);
