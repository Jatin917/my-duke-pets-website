import { Link } from 'react-router-dom';
import { SITE_NAME } from '../../utils/constants';

/**
 * Brand mark — full logo image already includes wordmark ("MY DUKE pet solution").
 * Prefer image-only in chrome so text isn't duplicated.
 */
const BrandLogo = ({
  to = '/',
  className = '',
  imgClassName = 'h-12 sm:h-14 w-auto object-contain',
  asLink = true,
}) => {
  const img = (
    <img
      src="/logo.png"
      alt={SITE_NAME}
      className={imgClassName}
      width={160}
      height={160}
      decoding="async"
    />
  );

  if (!asLink) {
    return <span className={`inline-flex items-center ${className}`}>{img}</span>;
  }

  return (
    <Link to={to} className={`inline-flex items-center shrink-0 ${className}`} aria-label={SITE_NAME}>
      {img}
    </Link>
  );
};

export default BrandLogo;
