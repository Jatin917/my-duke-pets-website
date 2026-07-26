export const SITE_NAME = 'My Duke';
export const SITE_TAGLINE = import.meta.env.VITE_SITE_TAGLINE || 'pet solution';
export const SITE_URL = (
  import.meta.env.VITE_SITE_URL || 'https://mydukepetsolution.com'
).replace(/\/$/, '');
export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '919999999999';
export const PHONE_NUMBER = import.meta.env.VITE_PHONE_NUMBER || '+919999999999';

export const DEFAULT_SEO_DESCRIPTION =
  'Buy & sell verified dogs, cats, birds, rabbits, fish and exotic pets across India on My Duke. Healthy, vaccinated pets from genuine sellers — trusted pet marketplace near you.';

export const DEFAULT_SEO_KEYWORDS = [
  'buy pets online India',
  'sell pets online',
  'verified pets for sale',
  'buy dogs India',
  'buy cats India',
  'puppies for sale',
  'kittens for sale',
  'adopt pets India',
  'rehome pets',
  'vaccinated pets',
  'healthy pets near me',
  'ethical breeders India',
  'pet marketplace India',
  'My Duke pets',
  'dogs for sale',
  'cats for sale',
  'birds for sale',
  'exotic pets India',
].join(', ');

export const WHATSAPP_LINK = (message = 'Hello, I am interested in your pet.') =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

export const PHONE_LINK = `tel:${PHONE_NUMBER}`;

export const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=61592086103682';
export const INSTAGRAM_URL = 'https://www.instagram.com/mydukepetsolution/';

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
];

export const GENDER_OPTIONS = ['Male', 'Female', 'Unknown'];
