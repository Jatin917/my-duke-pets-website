import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const location = useLocation();

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

  // When the logo points home, treat Home as the app "root":
  // walk the history stack back to the first entry instead of pushing a new
  // Home entry on top. That way, a single Back press from Home leaves the app.
  const handleClick = (e) => {
    if (to !== '/') return;
    e.preventDefault();

    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const idx = window.history.state?.idx ?? 0;
    if (idx > 0) {
      navigate(-idx);
    } else {
      navigate('/', { replace: true });
    }
  };

  return (
    <Link
      to={to}
      onClick={handleClick}
      className={`inline-flex items-center shrink-0 ${className}`}
      aria-label={SITE_NAME}
    >
      {img}
    </Link>
  );
};

export default BrandLogo;
