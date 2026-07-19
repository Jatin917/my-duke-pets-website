import { Link, useLocation } from 'react-router-dom';
import { FiLock, FiEye } from 'react-icons/fi';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { formatPrice } from '../../utils/formatters';

const sizeStyles = {
  sm: {
    price: 'text-sm font-bold',
    strike: 'text-[10px]',
    locked: 'text-xs font-semibold',
    button: 'text-[11px] px-2 py-1',
  },
  md: {
    price: 'text-lg font-bold',
    strike: 'text-xs',
    locked: 'text-sm font-semibold',
    button: 'text-xs px-2.5 py-1.5',
  },
  lg: {
    price: 'text-2xl font-display font-bold',
    strike: 'text-sm',
    locked: 'text-base font-semibold',
    button: 'text-sm px-3 py-2',
  },
};

/**
 * Shows pet price only when the customer is logged in.
 * Guests see a locked state + "View Price" that routes to login.
 */
const PetPrice = ({
  pet,
  size = 'md',
  layout = 'stack', // stack | inline | compact
  returnPath,
  className = '',
}) => {
  const { isAuthenticated } = useCustomerAuth();
  const location = useLocation();
  const styles = sizeStyles[size] || sizeStyles.md;

  const loginHref = `/login?return_url=${encodeURIComponent(
    returnPath || `${location.pathname}${location.search}`
  )}`;

  if (isAuthenticated) {
    if (pet.discountPrice) {
      return (
        <div className={`${layout === 'inline' ? 'flex items-center gap-2' : ''} ${className}`}>
          <span className={`${styles.price} text-primary-600`}>
            {formatPrice(pet.discountPrice)}
          </span>
          <span className={`${styles.strike} text-gray-400 line-through block`}>
            {formatPrice(pet.price)}
          </span>
        </div>
      );
    }

    return (
      <span className={`${styles.price} text-primary-600 ${className}`}>
        {formatPrice(pet.price)}
      </span>
    );
  }

  if (layout === 'compact') {
    return (
      <Link
        to={loginHref}
        className={`inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-700 ${styles.locked} ${className}`}
        title="Login to view price"
      >
        <FiLock className="shrink-0" size={12} />
        View Price
      </Link>
    );
  }

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className={`flex items-center gap-1.5 text-gray-400 ${styles.locked}`}>
        <FiLock className="shrink-0" size={size === 'lg' ? 16 : 13} />
        <span className="tracking-widest select-none">••••••</span>
      </div>
      <Link
        to={loginHref}
        className={`inline-flex items-center justify-center gap-1.5 rounded-lg border border-primary-200 bg-primary-50 text-primary-600 font-semibold hover:bg-primary-100 transition w-fit ${styles.button}`}
      >
        <FiEye size={12} />
        View Price
      </Link>
    </div>
  );
};

export default PetPrice;
