import { useEffect, useState } from 'react';
import SectionHeading from './SectionHeading';
import CategoryCard from './CategoryCard';
import { fetchCategories } from '../../services/categoryService';

const CategoriesSection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories()
      .then((res) => setCategories(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Browse By Category"
          title="Find Pets By Category"
          description="Explore our wide range of pet categories, each with verified, healthy companions waiting for a home."
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton h-48 sm:h-56 rounded-2xl" />
              ))
            : categories.map((cat, i) => <CategoryCard key={cat._id} category={cat} index={i} />)}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
