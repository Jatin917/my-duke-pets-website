// Lightweight, client-side "sample data" generators used to enrich the pet
// detail page with realistic-looking guidance content without requiring new
// backend fields. All content is generic/derived from existing pet fields.

const LIFESPAN_BY_CATEGORY = {
  Dogs: '10-14 Years',
  Cats: '12-16 Years',
  Birds: '5-15 Years',
  Rabbits: '8-12 Years',
  Fish: '2-5 Years',
  'Exotic Pets': '5-20 Years',
};

const SIZE_BY_CATEGORY = {
  Dogs: 'Medium - Large',
  Cats: 'Small - Medium',
  Birds: 'Small',
  Rabbits: 'Small',
  Fish: 'Small',
  'Exotic Pets': 'Small - Medium',
};

export const getLifespan = (categoryName) => LIFESPAN_BY_CATEGORY[categoryName] || '8-15 Years';
export const getSize = (categoryName) => SIZE_BY_CATEGORY[categoryName] || 'Medium';

export const getDeliveryEstimate = () => '3-5 Days';

export const getCareTips = (pet) => {
  const categoryName = pet.category?.name || 'pets';
  return [
    {
      title: 'Diet',
      text:
        pet.foodPreference ||
        `Feed age-appropriate, high-quality food suited to ${pet.name}'s size and breed, and change brands gradually.`,
    },
    {
      title: 'Exercise & Enrichment',
      text: `A ${pet.temperament?.toLowerCase() || 'friendly'} companion like ${pet.name} benefits from daily activity and playtime — plan a routine that suits your home.`,
    },
    {
      title: 'Grooming',
      text: `Regular grooming and coat/skin checks keep ${pet.name} comfortable and healthy, especially as a ${categoryName.toLowerCase()}.`,
    },
    {
      title: 'Health',
      text: `Keep vaccination and deworming on schedule (currently: ${pet.vaccinationStatus}) and book regular check-ups with a trusted vet.`,
    },
  ];
};

export const RECOMMENDED_DIET = [
  {
    title: 'High-Quality Food',
    text: 'Protein-rich food specifically formulated for your pet\u2019s age and breed size.',
  },
  {
    title: 'Fresh Water',
    text: 'Always keep clean, fresh water available throughout the day.',
  },
  {
    title: 'Fruits & Vegetables',
    text: 'Vet-approved fruits and vegetables provide essential fiber and vitamins.',
  },
  {
    title: 'Supplements',
    text: 'Omega-3 and joint supplements (as advised by your vet) support a shiny coat and healthy joints.',
  },
];

export const FOODS_TO_AVOID = [
  { title: 'Chocolate & Caffeine', text: 'Contains compounds that are highly toxic to most pets.' },
  { title: 'Onions & Garlic', text: 'Can damage red blood cells and lead to anemia.' },
  { title: 'Grapes & Raisins', text: 'Known to cause sudden kidney issues in dogs.' },
  { title: 'Xylitol & Sugary Foods', text: 'Artificial sweeteners can cause serious liver problems.' },
];

export const buildPetFAQs = (pet, { showPrice = false } = {}) => [
  {
    q: `How much does ${pet.name} cost?`,
    a: showPrice
      ? `${pet.name} is priced at ${
          pet.discountPrice ? `a discounted ₹${pet.discountPrice}` : `₹${pet.price}`
        }. The final price is confirmed by our team at the time of enquiry follow-up.`
      : `Pricing for ${pet.name} is visible after you login. Tap "View Price" or sign in with OTP to unlock the amount — final pricing is confirmed during enquiry follow-up.`,
  },
  {
    q: `Is ${pet.name} vaccinated and healthy?`,
    a: `Yes — ${pet.name}'s current vaccination status is "${pet.vaccinationStatus}" with a health status of "${pet.healthStatus || 'Healthy'}". Full health and vaccination records are shared at handover.`,
  },
  {
    q: 'Do you provide home delivery?',
    a: `Yes, safe and comfortable doorstep delivery is available in most cities within an estimated ${getDeliveryEstimate()}, depending on your location.`,
  },
  {
    q: 'What is your health guarantee policy?',
    a: 'Every pet is vet-checked before dispatch and backed by our post-adoption support team to help with any health or behavioral questions.',
  },
];
