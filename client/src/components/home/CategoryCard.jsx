import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { resolveImageUrl } from '../../services/api';

const CategoryCard = ({ category, index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.08 }}
  >
    <Link
      to={`/pets?category=${category.slug}`}
      className="group relative block rounded-2xl overflow-hidden h-48 sm:h-56 shadow-soft hover:shadow-glow transition-shadow"
    >
      {category.image ? (
        <img
          src={resolveImageUrl(category.image)}
          alt={category.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover will-change-transform"
          style={{
            animation: 'categoryKenBurns 8s ease-in-out infinite alternate',
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-primary" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 flex flex-col items-start justify-end text-white p-4 sm:p-5">
        <h3 className="text-lg sm:text-xl font-display font-bold drop-shadow-sm">{category.name}</h3>
        <p className="text-xs text-white/85 mt-1">{category.petCount ?? 0} pets available</p>
      </div>
    </Link>
  </motion.div>
);

export default CategoryCard;
