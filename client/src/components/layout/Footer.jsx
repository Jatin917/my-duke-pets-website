import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import {
  SITE_NAME,
  PHONE_NUMBER,
  PHONE_NUMBER_2,
  PHONE_NUMBERS,
  CONTACT_EMAIL,
  CONTACT_EMAIL_LINK,
  SITE_ADDRESS,
  FACEBOOK_URL,
  INSTAGRAM_URL,
  phoneLink,
} from '../../utils/constants';
import BrandLogo from '../common/BrandLogo';

const socialLinks = [
  { Icon: FiFacebook, href: FACEBOOK_URL, label: 'Facebook' },
  { Icon: FiInstagram, href: INSTAGRAM_URL, label: 'Instagram' },
];

const Footer = () => {
  const year = new Date().getFullYear();
  const phones = PHONE_NUMBERS.length
    ? PHONE_NUMBERS
    : [PHONE_NUMBER, PHONE_NUMBER_2].filter(Boolean);

  return (
    <footer className="bg-dark-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="mb-4">
              <BrandLogo imgClassName="h-16 w-auto object-contain brightness-110" />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              Your trusted marketplace to find healthy, happy pets from verified breeders and
              shelters. Every pet, a new best friend.
            </p>
            <div className="flex gap-3">
              {socialLinks.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary-500 hover:text-white transition"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-primary-400 transition">Home</Link></li>
              <li><Link to="/pets" className="hover:text-primary-400 transition">All Pets</Link></li>
              <li><Link to="/sell" className="hover:text-primary-400 transition">Sell a Pet</Link></li>
              <li><Link to="/donate" className="hover:text-primary-400 transition">Donate</Link></li>
              <li><Link to="/help" className="hover:text-primary-400 transition">Help &amp; Support</Link></li>
              <li><Link to="/about" className="hover:text-primary-400 transition">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary-400 transition">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm">
              {['Dogs', 'Cats', 'Birds', 'Rabbits'].map((c) => (
                <li key={c}>
                  <Link to={`/pets?category=${c.toLowerCase()}`} className="hover:text-primary-400 transition">
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <FiMapPin className="mt-1 text-primary-400 shrink-0" />
                <span>{SITE_ADDRESS}</span>
              </li>
              {phones.map((num) => (
                <li key={num} className="flex items-center gap-2">
                  <FiPhone className="text-primary-400 shrink-0" />
                  <a href={phoneLink(num)} className="hover:text-primary-400 transition">
                    {num}
                  </a>
                </li>
              ))}
              <li className="flex items-center gap-2">
                <FiMail className="text-primary-400 shrink-0" />
                <a href={CONTACT_EMAIL_LINK} className="hover:text-primary-400 transition">
                  {CONTACT_EMAIL}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>&copy; {year} {SITE_NAME}. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy-policy" className="hover:text-primary-400 transition">Privacy Policy</Link>
            <Link to="/terms-and-conditions" className="hover:text-primary-400 transition">Terms &amp; Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
