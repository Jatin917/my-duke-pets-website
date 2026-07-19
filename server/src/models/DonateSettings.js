import mongoose from 'mongoose';

const impactItemSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, required: true },
    description: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const statSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, required: true },
    value: { type: String, trim: true, required: true },
  },
  { _id: false }
);

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, trim: true, required: true },
    answer: { type: String, trim: true, required: true },
  },
  { _id: false }
);

const thankYouSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    message: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const donateSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'default', unique: true },
    pageEnabled: { type: Boolean, default: true },
    promptEnabled: { type: Boolean, default: true },
    promptDelaySeconds: { type: Number, default: 30, min: 5, max: 600 },
    promptTitle: { type: String, default: 'Support a pet today?' },
    promptMessage: {
      type: String,
      default: 'Your donation helps My Duke care for animals in need — food, vet care, and rescue.',
    },
    promptCtaText: { type: String, default: 'Donate Now' },
    heroTitle: { type: String, default: 'Donate to My Duke' },
    heroSubtitle: {
      type: String,
      default: 'Every contribution helps us feed, treat, and find loving homes for pets in need.',
    },
    heroCtaText: { type: String, default: 'Scan QR to Donate' },
    amounts: { type: [Number], default: [100, 500, 1000, 2000] },
    upiId: { type: String, trim: true, default: '' },
    qrImage: { type: String, default: '' },
    bankDetails: { type: String, default: '' },
    payNote: {
      type: String,
      default: 'Scan the QR with any UPI app. After paying, you can optionally share a screenshot on WhatsApp.',
    },
    impactItems: {
      type: [impactItemSchema],
      default: [
        { title: 'Nutritious Food', description: 'Meals and treats for rescued and sheltered pets.' },
        { title: 'Vet Care', description: 'Vaccinations, check-ups, and emergency treatment.' },
        { title: 'Rescue & Shelter', description: 'Safe housing and transport for animals in distress.' },
        { title: 'Adoption Support', description: 'Helping pets find forever homes with loving families.' },
      ],
    },
    stats: {
      type: [statSchema],
      default: [
        { label: 'Pets helped', value: '150+' },
        { label: 'Vet visits funded', value: '80+' },
        { label: 'Happy donors', value: '200+' },
      ],
    },
    faqs: {
      type: [faqSchema],
      default: [
        {
          question: 'Where does my donation go?',
          answer:
            'Funds support food, veterinary care, rescue operations, and shelter needs for pets under My Duke care.',
        },
        {
          question: 'Can I get a receipt?',
          answer:
            'Contact us after donating with your UPI reference or screenshot, and our team will help with acknowledgment.',
        },
        {
          question: 'Is there a minimum amount?',
          answer: 'No — every contribution helps. Choose a suggested amount or donate any amount via UPI.',
        },
      ],
    },
    thankYous: {
      type: [thankYouSchema],
      default: [
        { name: 'Ananya', message: 'Happy to support the paws that need us most.' },
        { name: 'Rahul', message: 'Small gift, big love for the animals.' },
      ],
    },
    thankYouTitle: { type: String, default: 'Thank you for your kindness!' },
    thankYouMessage: {
      type: String,
      default: 'Your support means warmer shelters, healthier pets, and more happy adoptions.',
    },
  },
  { timestamps: true }
);

export default mongoose.model('DonateSettings', donateSettingsSchema);
