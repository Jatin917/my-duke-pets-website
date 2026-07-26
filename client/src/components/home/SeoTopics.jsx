import { Link } from 'react-router-dom';
import { SITE_NAME } from '../../utils/constants';

const topics = [
  {
    title: 'Buy dogs & puppies in India',
    text: 'Browse verified dogs and puppies for sale with health checks, vaccination records, and genuine seller profiles.',
    to: '/pets',
  },
  {
    title: 'Buy cats & kittens online',
    text: 'Find cats and kittens from responsible breeders and pet parents — every listing reviewed before it goes live.',
    to: '/pets',
  },
  {
    title: 'Sell or rehome your pet',
    text: 'List your pet for free with photos and details. Reach real buyers looking for a forever home.',
    to: '/sell',
  },
  {
    title: 'Birds, rabbits, fish & exotic pets',
    text: 'Explore more companions beyond dogs and cats — birds, rabbits, fish, and exotic pets across India.',
    to: '/pets',
  },
];

const SeoTopics = () => (
  <section className="border-t border-black/[0.06] bg-white py-14 sm:py-16" aria-label={`${SITE_NAME} pet marketplace topics`}>
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <h2 className="font-display text-xl font-extrabold text-gray-900 sm:text-2xl">
        Find pets for sale &amp; adoption across India
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-600 sm:text-base">
        {SITE_NAME} is a trusted pet marketplace connecting buyers and sellers of healthy, vaccinated
        dogs, cats, birds, rabbits, fish, and exotic pets. Whether you want to buy a pet online, sell a
        litter, or rehome a companion, we verify listings so families can welcome pets with confidence.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {topics.map((topic) => (
          <Link
            key={topic.title}
            to={topic.to}
            className="rounded-2xl border border-black/[0.06] bg-[#fafafa] p-5 transition hover:border-primary-200 hover:bg-primary-50/40"
          >
            <h3 className="font-display text-base font-bold text-gray-900">{topic.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">{topic.text}</p>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default SeoTopics;
