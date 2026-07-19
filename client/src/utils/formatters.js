export const formatPrice = (value) => {
  if (value === null || value === undefined) return '';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

export const truncate = (text = '', length = 100) =>
  text.length > length ? `${text.slice(0, length)}...` : text;

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
