export const CATEGORY_EMOJI = {
  Dogs: '🐶',
  Cats: '🐱',
  Birds: '🦜',
  Rabbits: '🐰',
  Fish: '🐠',
  'Exotic Pets': '🦎',
};

export const getCategoryEmoji = (name) => CATEGORY_EMOJI[name] || '🐾';
