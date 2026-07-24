export const SITE_NAME = 'My Duke';
export const SITE_TAGLINE = import.meta.env.VITE_SITE_TAGLINE || 'pet solution';
export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '919999999999';
export const PHONE_NUMBER = import.meta.env.VITE_PHONE_NUMBER || '+919999999999';

export const WHATSAPP_LINK = (message = 'Hello, I am interested in your pet.') =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

export const PHONE_LINK = `tel:${PHONE_NUMBER}`;

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
];

export const GENDER_OPTIONS = ['Male', 'Female', 'Unknown'];
