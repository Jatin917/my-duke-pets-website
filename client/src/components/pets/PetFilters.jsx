import { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';
import { fetchCategories } from '../../services/categoryService';
import { GENDER_OPTIONS } from '../../utils/constants';

const PetFilters = ({ filters, onChange, onClear, className = '' }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories().then((res) => setCategories(res.data || []));
  }, []);

  const toggleCategory = (slug) => {
    const current = filters.category ? filters.category.split(',') : [];
    const next = current.includes(slug) ? current.filter((c) => c !== slug) : [...current, slug];
    onChange({ ...filters, category: next.join(',') });
  };

  const toggleGender = (gender) => {
    const current = filters.gender ? filters.gender.split(',') : [];
    const next = current.includes(gender) ? current.filter((g) => g !== gender) : [...current, gender];
    onChange({ ...filters, gender: next.join(',') });
  };

  const selectedCategories = filters.category ? filters.category.split(',') : [];
  const selectedGenders = filters.gender ? filters.gender.split(',') : [];

  return (
    <div className={`bg-white rounded-2xl shadow-soft p-6 space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-gray-800">Filters</h3>
        <button onClick={onClear} className="text-xs text-primary-600 font-semibold hover:underline">
          Clear All
        </button>
      </div>

      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Category</p>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat._id} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.slug)}
                onChange={() => toggleCategory(cat.slug)}
                className="w-4 h-4 rounded accent-primary-500"
              />
              <span className="text-sm text-gray-600 group-hover:text-primary-600 transition">
                {cat.name}
              </span>
              <span className="text-xs text-gray-400 ml-auto">({cat.petCount ?? 0})</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Gender</p>
        <div className="flex flex-wrap gap-2">
          {GENDER_OPTIONS.map((gender) => (
            <button
              key={gender}
              onClick={() => toggleGender(gender)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition ${
                selectedGenders.includes(gender)
                  ? 'bg-primary-500 border-primary-500 text-white'
                  : 'border-gray-200 text-gray-600 hover:border-primary-300'
              }`}
            >
              {gender}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Price Range</p>
        <div className="flex items-center gap-3">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={(e) => onChange({ ...filters, minPrice: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-primary-400 focus:outline-none"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-primary-400 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Breed</p>
        <input
          type="text"
          placeholder="e.g. Labrador"
          value={filters.breed || ''}
          onChange={(e) => onChange({ ...filters, breed: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-primary-400 focus:outline-none"
        />
      </div>

      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Availability</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'All', value: '' },
            { label: 'Available', value: 'true' },
            { label: 'Adopted', value: 'false' },
          ].map((opt) => (
            <button
              key={opt.label}
              onClick={() => onChange({ ...filters, availability: opt.value })}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition ${
                (filters.availability || '') === opt.value
                  ? 'bg-primary-500 border-primary-500 text-white'
                  : 'border-gray-200 text-gray-600 hover:border-primary-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ActiveFilterChips = ({ filters, onRemove }) => {
  const chips = [];
  if (filters.search) chips.push({ key: 'search', label: `Search: ${filters.search}` });
  if (filters.category)
    filters.category.split(',').forEach((c) => chips.push({ key: 'category', value: c, label: c }));
  if (filters.gender)
    filters.gender.split(',').forEach((g) => chips.push({ key: 'gender', value: g, label: g }));
  if (filters.breed) chips.push({ key: 'breed', label: `Breed: ${filters.breed}` });
  if (filters.minPrice || filters.maxPrice)
    chips.push({
      key: 'price',
      label: `Price: ${filters.minPrice || 0} - ${filters.maxPrice || '∞'}`,
    });

  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {chips.map((chip, i) => (
        <span
          key={i}
          className="flex items-center gap-1.5 bg-primary-50 text-primary-700 text-xs font-medium px-3 py-1.5 rounded-full"
        >
          {chip.label}
          <button onClick={() => onRemove(chip)}>
            <FiX size={12} />
          </button>
        </span>
      ))}
    </div>
  );
};

export default PetFilters;
