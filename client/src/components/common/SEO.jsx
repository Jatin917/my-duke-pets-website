import { Helmet } from 'react-helmet-async';
import {
  DEFAULT_SEO_DESCRIPTION,
  DEFAULT_SEO_KEYWORDS,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  SITE_ADDRESS,
  PHONE_NUMBER,
  FACEBOOK_URL,
  INSTAGRAM_URL,
} from '../../utils/constants';

const toAbsoluteUrl = (path = '/') => {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

const SEO = ({
  title,
  description,
  image,
  path,
  url,
  keywords,
  type = 'website',
  noindex = false,
  jsonLd,
}) => {
  const fullTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} — Buy & Sell Verified Pets in India | ${SITE_TAGLINE}`;
  const desc = description || DEFAULT_SEO_DESCRIPTION;
  const kw = keywords || DEFAULT_SEO_KEYWORDS;
  const canonical = toAbsoluteUrl(url || path || (typeof window !== 'undefined' ? window.location.pathname : '/'));
  const ogImage = toAbsoluteUrl(image || '/logo.png');

  const defaultJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: toAbsoluteUrl('/logo.png'),
      description: desc,
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: PHONE_NUMBER,
        contactType: 'customer support',
        areaServed: 'IN',
        availableLanguage: ['English', 'Hindi'],
      },
      sameAs: [INSTAGRAM_URL, FACEBOOK_URL].filter(Boolean),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
      description: desc,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/pets?search={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'PetStore',
      name: SITE_NAME,
      url: SITE_URL,
      description: desc,
      image: toAbsoluteUrl('/logo.png'),
      telephone: PHONE_NUMBER,
      priceRange: '₹₹',
      keywords: kw,
      address: {
        '@type': 'PostalAddress',
        streetAddress: SITE_ADDRESS,
        addressLocality: 'Gurugram',
        addressRegion: 'Haryana',
        postalCode: '122001',
        addressCountry: 'IN',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 28.4229,
        longitude: 77.0365,
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '09:00',
          closes: '19:00',
        },
      ],
      areaServed: [
        { '@type': 'City', name: 'Gurugram' },
        { '@type': 'City', name: 'Gurgaon' },
        { '@type': 'AdministrativeArea', name: 'Delhi NCR' },
        { '@type': 'Country', name: 'India' },
      ],
      sameAs: [INSTAGRAM_URL, FACEBOOK_URL].filter(Boolean),
    },
  ];

  const schema = jsonLd
    ? Array.isArray(jsonLd)
      ? [...defaultJsonLd, ...jsonLd]
      : [...defaultJsonLd, jsonLd]
    : defaultJsonLd;

  return (
    <Helmet>
      <html lang="en-IN" />
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content={kw} />
      <meta
        name="robots"
        content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1'}
      />
      <meta name="author" content={SITE_NAME} />
      <meta name="geo.region" content="IN-HR" />
      <meta name="geo.placename" content="Gurugram" />
      {import.meta.env.VITE_GOOGLE_SITE_VERIFICATION ? (
        <meta
          name="google-site-verification"
          content={import.meta.env.VITE_GOOGLE_SITE_VERIFICATION}
        />
      ) : null}
      <link rel="canonical" href={canonical} />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={`${SITE_NAME} — verified pets marketplace`} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={ogImage} />

      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

export default SEO;
