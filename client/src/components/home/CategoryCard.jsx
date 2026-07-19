import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { resolveImageUrl } from '../../services/api';
import { getCategoryEmoji } from '../../utils/categoryIcons';

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
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-primary" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 text-center">
        <span className="text-4xl mb-2 group-hover:scale-125 transition-transform duration-300">
          {getCategoryEmoji(category.name)}
        </span>
        <h3 className="text-lg font-display font-bold">{category.name}</h3>
        <p className="text-xs text-white/80 mt-1">{category.petCount ?? 0} pets available</p>
      </div>
    </Link>
  </motion.div>
);

export default CategoryCard;
