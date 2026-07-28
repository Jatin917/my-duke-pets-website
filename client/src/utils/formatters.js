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

/** e.g. kuldeep@gmail.com → ku****@gmail.com */
export const maskEmail = (email = '') => {
  const value = String(email).trim();
  const at = value.indexOf('@');
  if (at <= 0) return value ? `${value.slice(0, 2)}****` : '';
  const local = value.slice(0, at);
  const domain = value.slice(at + 1);
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}****@${domain}`;
};

/** e.g. 9874563211 → +91 ******3211 */
export const maskPhone = (phone = '') => {
  const digits = String(phone).replace(/\D/g, '').slice(-10);
  if (digits.length < 4) return digits ? `+91 ****` : '';
  return `+91 ******${digits.slice(-4)}`;
};
