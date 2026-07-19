import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiCheck, FiImage, FiX, FiUpload } from 'react-icons/fi';
import SEO from '../components/common/SEO';
import Breadcrumb from '../components/common/Breadcrumb';
import Loader from '../components/common/Loader';
import { fetchPets } from '../services/petService';
import { fetchCategories } from '../services/categoryService';
import { submitSellRequest } from '../services/sellService';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { SITE_NAME, GENDER_OPTIONS } from '../utils/constants';

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none text-sm';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';
const OTHER = 'other';

const Sell = () => {
  const { customer, isAuthenticated } = useCustomerAuth();
  const [step, setStep] = useState('form'); // form | done
  const [pets, setPets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      gender: 'Unknown',
      vaccinationStatus: 'Not Vaccinated',
      healthStatus: 'Healthy',
      category: '',
      breed: '',
    },
  });

  const categoryWatch = watch('category');
  const isOtherCategory = categoryWatch === OTHER;

  useEffect(() => {
    Promise.all([fetchPets({ limit: 100, availability: true }), fetchCategories()])
      .then(([petsRes, catsRes]) => {
        setPets(petsRes.data || []);
        setCategories(catsRes.data || []);
      })
      .catch(() => toast.error('Could not load pet catalog'))
      .finally(() => setLoadingMeta(false));
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !customer) return;
    if (customer.name) setValue('sellerName', customer.name);
    if (customer.email) setValue('sellerEmail', customer.email);
    if (customer.phone) setValue('sellerPhone', customer.phone);
  }, [isAuthenticated, customer, setValue]);

  // Breeds from listed pets in the selected category
  const breedOptions = useMemo(() => {
    if (!selectedCategory || selectedCategory === OTHER) return [];
    const breeds = pets
      .filter((p) => String(p.category?._id || p.category) === String(selectedCategory))
      .map((p) => p.breed)
      .filter(Boolean);
    return [...new Set(breeds)].sort((a, b) => a.localeCompare(b));
  }, [pets, selectedCategory]);

  useEffect(() => {
    setSelectedCategory(categoryWatch || '');
    setValue('breed', '');
  }, [categoryWatch, setValue]);

  const onAddPhotos = (e) => {
    const files = Array.from(e.target.files || []);
    setPhotos((prev) => [...prev, ...files].slice(0, 10));
    e.target.value = '';
  };

  const onSubmit = async (values) => {
    if (!photos.length) {
      toast.error('Upload at least one photo');
      return;
    }

    const fd = new FormData();
    fd.append('category', values.category);
    fd.append('breed', (values.breed || '').trim());
    if (values.category === OTHER) {
      fd.append('customCategory', (values.customCategory || '').trim() || 'Other');
    }
    fd.append('name', values.name.trim());
    fd.append('age', values.age);
    fd.append('gender', values.gender || 'Unknown');
    fd.append('color', values.color || '');
    fd.append('weight', values.weight || '');
    fd.append('price', values.price);
    fd.append('vaccinationStatus', values.vaccinationStatus || 'Not Vaccinated');
    fd.append('healthStatus', values.healthStatus || 'Healthy');
    fd.append('temperament', values.temperament || '');
    fd.append('description', values.description || '');
    fd.append('videoUrl', values.videoUrl || '');
    fd.append('sellerName', values.sellerName);
    fd.append('sellerPhone', values.sellerPhone);
    fd.append('sellerEmail', values.sellerEmail);
    fd.append('sellerCity', values.sellerCity || '');
    fd.append('sellerState', values.sellerState || '');
    fd.append('sellerAddress', values.sellerAddress || '');
    if (customer?.id || customer?._id) {
      fd.append('customerId', customer.id || customer._id);
    }
    photos.forEach((file) => fd.append('images', file));

    setSubmitting(true);
    try {
      await submitSellRequest(fd);
      setStep('done');
      toast.success('Sell request submitted!');
      reset({
        gender: 'Unknown',
        vaccinationStatus: 'Not Vaccinated',
        healthStatus: 'Healthy',
        category: '',
        breed: '',
      });
      setPhotos([]);
      setSelectedCategory('');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit sell request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingMeta) return <Loader full />;

  return (
    <>
      <SEO
        title="Sell a Pet"
        description={`List your pet for sale on ${SITE_NAME}. Choose category and breed, then add photos and details.`}
      />

      <div className="bg-gray-50 min-h-screen pb-16">
        <div className="bg-gradient-hero text-white py-12 sm:py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumb items={[{ label: 'Sell' }]} />
            <h1 className="font-display text-3xl sm:text-5xl font-bold mt-4">Sell with {SITE_NAME}</h1>
            <p className="text-white/80 mt-3 max-w-2xl">
              Choose a category and breed from our catalog — or pick Other to enter the breed yourself.
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
          {step === 'done' ? (
            <div className="bg-white rounded-3xl shadow-soft p-8 sm:p-10 text-center">
              <div className="w-16 h-16 rounded-full bg-green-50 text-green-500 flex items-center justify-center text-3xl mx-auto mb-4">
                <FiCheck />
              </div>
              <h2 className="text-2xl font-display font-bold text-gray-800 mb-2">Request submitted</h2>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Our team will review your listing and email you at the address you provided.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="btn-gradient text-white font-semibold px-6 py-3 rounded-xl"
                >
                  Sell another pet
                </button>
                <Link
                  to="/pets"
                  className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50"
                >
                  Browse pets
                </Link>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="bg-white rounded-3xl shadow-soft border border-gray-100 p-6 sm:p-8 space-y-8"
            >
              <section className="space-y-4">
                <h3 className="font-semibold text-gray-800">Category &amp; breed</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Category *</label>
                    <select
                      className={inputClass}
                      {...register('category', { required: 'Category is required' })}
                    >
                      <option value="">Select category</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                      <option value={OTHER}>Other</option>
                    </select>
                    {errors.category && (
                      <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>Breed *</label>
                    {isOtherCategory ? (
                      <input
                        className={inputClass}
                        placeholder="Enter breed"
                        {...register('breed', { required: 'Please enter the breed' })}
                      />
                    ) : (
                      <select
                        className={inputClass}
                        disabled={!selectedCategory}
                        {...register('breed', {
                          required: selectedCategory ? 'Please select a breed' : false,
                        })}
                      >
                        <option value="">
                          {selectedCategory ? 'Select breed' : 'Select category first'}
                        </option>
                        {breedOptions.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    )}
                    {errors.breed && (
                      <p className="text-red-500 text-xs mt-1">{errors.breed.message}</p>
                    )}
                    {!isOtherCategory && selectedCategory && breedOptions.length === 0 && (
                      <p className="text-xs text-amber-600 mt-1">
                        No breeds found for this category yet. Choose Other to type a breed.
                      </p>
                    )}
                  </div>
                </div>

                {isOtherCategory && (
                  <div>
                    <label className={labelClass}>
                      Category name <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                      className={inputClass}
                      placeholder="e.g. Exotic birds"
                      {...register('customCategory')}
                    />
                  </div>
                )}
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold text-gray-800">Pet details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Pet name *</label>
                    <input
                      className={inputClass}
                      placeholder="Pet name"
                      {...register('name', { required: 'Name is required' })}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Age *</label>
                    <input
                      className={inputClass}
                      placeholder="e.g. 8 months"
                      {...register('age', { required: 'Age is required' })}
                    />
                    {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Gender</label>
                    <select className={inputClass} {...register('gender')}>
                      {GENDER_OPTIONS.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Asking price (₹) *</label>
                    <input
                      type="number"
                      min="0"
                      className={inputClass}
                      {...register('price', { required: 'Price is required', min: 0 })}
                    />
                    {errors.price && (
                      <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Vaccination</label>
                    <select className={inputClass} {...register('vaccinationStatus')}>
                      <option>Vaccinated</option>
                      <option>Partially Vaccinated</option>
                      <option>Not Vaccinated</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    rows={3}
                    className={inputClass}
                    placeholder="Tell buyers about your pet..."
                    {...register('description')}
                  />
                </div>
              </section>

              <section>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FiImage /> Photos * (up to 10)
                </h3>
                <div className="flex flex-wrap gap-3 mb-3">
                  {photos.map((file, i) => (
                    <div
                      key={i}
                      className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center"
                      >
                        <FiX size={12} />
                      </button>
                    </div>
                  ))}
                  {photos.length < 10 && (
                    <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-primary-400 hover:text-primary-500">
                      <FiUpload size={18} />
                      <span className="text-[10px] mt-1">Add</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={onAddPhotos}
                      />
                    </label>
                  )}
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold text-gray-800">Your contact details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Full name *</label>
                    <input
                      className={inputClass}
                      {...register('sellerName', { required: 'Name is required' })}
                    />
                    {errors.sellerName && (
                      <p className="text-red-500 text-xs mt-1">{errors.sellerName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Phone *</label>
                    <input
                      className={inputClass}
                      {...register('sellerPhone', { required: 'Phone is required' })}
                    />
                    {errors.sellerPhone && (
                      <p className="text-red-500 text-xs mt-1">{errors.sellerPhone.message}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Email *</label>
                    <input
                      type="email"
                      className={inputClass}
                      {...register('sellerEmail', { required: 'Email is required' })}
                    />
                    {errors.sellerEmail && (
                      <p className="text-red-500 text-xs mt-1">{errors.sellerEmail.message}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>City</label>
                    <input className={inputClass} {...register('sellerCity')} />
                  </div>
                  <div>
                    <label className={labelClass}>State</label>
                    <input className={inputClass} {...register('sellerState')} />
                  </div>
                  <div>
                    <label className={labelClass}>Address</label>
                    <input className={inputClass} {...register('sellerAddress')} />
                  </div>
                </div>
              </section>

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-gradient text-white font-semibold py-3.5 rounded-xl shadow-glow disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : 'Submit sell request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default Sell;
