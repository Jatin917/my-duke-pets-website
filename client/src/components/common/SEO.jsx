import { Helmet } from 'react-helmet-async';
import { SITE_NAME } from '../../utils/constants';

const SEO = ({ title, description, image, url }) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Find Your Perfect Pet`;
  const desc =
    description ||
    'Browse dogs, cats, birds, rabbits, fish & exotic pets available for adoption and sale. Trusted, healthy, and vaccinated pets near you.';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={image || '/logo.png'} />
      {url && <meta property="og:url" content={url} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
    </Helmet>
  );
};

export default SEO;
