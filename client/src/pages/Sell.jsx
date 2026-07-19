import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiCheck, FiImage, FiList, FiEdit3, FiX, FiUpload } from 'react-icons/fi';
import SEO from '../components/common/SEO';
import Breadcrumb from '../components/common/Breadcrumb';
import Loader from '../components/common/Loader';
import { fetchPets } from '../services/petService';
import { fetchCategories } from '../services/categoryService';
import { submitSellRequest } from '../services/sellService';
import { resolveImageUrl } from '../services/api';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { SITE_NAME, GENDER_OPTIONS } from '../utils/constants';
import { formatPrice } from '../utils/formatters';

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none text-sm';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';

const Sell = () => {
  const { customer, isAuthenticated } = useCustomerAuth();
  const [mode, setMode] = useState('listed'); // listed | custom
  const [step, setStep] = useState('choose'); // choose | form | done
  const [pets, setPets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [referencePetId, setReferencePetId] = useState('');
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      gender: 'Unknown',
      vaccinationStatus: 'Not Vaccinated',
      healthStatus: 'Healthy',
    },
  });

  useEffect(() => {
    Promise.all([fetchPets({ limit: 48, availability: true }), fetchCategories()])
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

  const selectedPet = useMemo(
    () => pets.find((p) => p._id === referencePetId),
    [pets, referencePetId]
  );

  const startMode = (nextMode) => {
    setMode(nextMode);
    setReferencePetId('');
    setPhotos([]);
    setStep('form');
  };

  const onAddPhotos = (e) => {
    const files = Array.from(e.target.files || []);
    setPhotos((prev) => [...prev, ...files].slice(0, 10));
    e.target.value = '';
  };

  const onSubmit = async (values) => {
    if (mode === 'listed' && !referencePetId) {
      toast.error('Select a listed pet to base your listing on');
      return;
    }
    if (!photos.length) {
      toast.error('Upload at least one photo');
      return;
    }

    const fd = new FormData();
    fd.append('mode', mode);
    if (mode === 'listed') fd.append('referencePet', referencePetId);
    if (mode === 'custom') {
      fd.append('category', values.category);
      fd.append('breed', values.breed);
    }

    const petName =
      mode === 'listed'
        ? values.name?.trim() || selectedPet?.name || 'Pet'
        : values.name;

    fd.append('name', petName);
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
      reset();
      setPhotos([]);
      setReferencePetId('');
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
        description={`List your pet for sale on ${SITE_NAME}. Quick sell from existing listings or create a full custom listing.`}
      />

      <div className="bg-gray-50 min-h-screen pb-16">
        <div className="bg-gradient-hero text-white py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumb items={[{ label: 'Sell' }]} />
            <h1 className="font-display text-3xl sm:text-5xl font-bold mt-4">Sell with {SITE_NAME}</h1>
            <p className="text-white/80 mt-3 max-w-2xl">
              List your pet with us. Choose a quick path from pets already on our site, or create a
              full custom listing.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
          {step === 'choose' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <button
                type="button"
                onClick={() => startMode('listed')}
                className="text-left bg-white rounded-3xl shadow-soft border border-gray-100 p-6 hover:border-primary-300 hover:shadow-glow transition group"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center text-xl mb-4 group-hover:bg-primary-500 group-hover:text-white transition">
                  <FiList />
                </div>
                <h2 className="font-display text-xl font-bold text-gray-800 mb-2">
                  Sell a listed type
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Pick a pet already on {SITE_NAME}. We reuse its category &amp; breed — you mainly
                  add photos, age, price and your contact details.
                </p>
              </button>

              <button
                type="button"
                onClick={() => startMode('custom')}
                className="text-left bg-white rounded-3xl shadow-soft border border-gray-100 p-6 hover:border-primary-300 hover:shadow-glow transition group"
              >
                <div className="w-12 h-12 rounded-2xl bg-secondary-50 text-secondary-600 flex items-center justify-center text-xl mb-4 group-hover:bg-secondary-500 group-hover:text-white transition">
                  <FiEdit3 />
                </div>
                <h2 className="font-display text-xl font-bold text-gray-800 mb-2">
                  Sell something else
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Full form — choose category, breed, and all pet details yourself for pets not
                  covered by our current listings.
                </p>
              </button>
            </div>
          )}

          {step === 'done' && (
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
                  onClick={() => setStep('choose')}
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
          )}

          {step === 'form' && (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="bg-white rounded-3xl shadow-soft border border-gray-100 p-6 sm:p-8 space-y-8"
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">
                    {mode === 'listed' ? 'Listed type' : 'Custom listing'}
                  </p>
                  <h2 className="font-display text-2xl font-bold text-gray-800">
                    {mode === 'listed' ? 'Quick sell form' : 'Full sell form'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('choose')}
                  className="text-sm text-gray-500 hover:text-primary-600"
                >
                  Change option
                </button>
              </div>

              {mode === 'listed' && (
                <section>
                  <h3 className="font-semibold text-gray-800 mb-3">1. Pick a listed pet</h3>
                  {pets.length === 0 ? (
                    <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl p-3">
                      No listed pets found. Use the custom listing option instead.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                      {pets.map((pet) => {
                        const active = referencePetId === pet._id;
                        return (
                          <button
                            key={pet._id}
                            type="button"
                            onClick={() => {
                              setReferencePetId(pet._id);
                              setValue('name', pet.name);
                            }}
                            className={`flex gap-3 p-3 rounded-2xl border text-left transition ${
                              active
                                ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-100'
                                : 'border-gray-200 hover:border-primary-300'
                            }`}
                          >
                            <img
                              src={resolveImageUrl(pet.images?.[0])}
                              alt={pet.name}
                              className="w-16 h-16 rounded-xl object-cover bg-gray-100 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-800 truncate">{pet.name}</p>
                              <p className="text-xs text-gray-500">
                                {pet.breed} · {pet.category?.name || 'Pet'}
                              </p>
                              <p className="text-xs text-primary-600 font-medium mt-0.5">
                                Ref. {formatPrice(pet.discountPrice || pet.price)}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {selectedPet && (
                    <p className="text-xs text-gray-500 mt-3">
                      Category &amp; breed will be taken from <strong>{selectedPet.name}</strong> (
                      {selectedPet.breed}).
                    </p>
                  )}
                </section>
              )}

              <section className="space-y-4">
                <h3 className="font-semibold text-gray-800">
                  {mode === 'listed' ? '2. Your pet details' : '1. Pet details'}
                </h3>

                {mode === 'custom' && (
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
                      </select>
                      {errors.category && (
                        <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>Breed *</label>
                      <input
                        className={inputClass}
                        placeholder="e.g. Labrador"
                        {...register('breed', { required: mode === 'custom' ? 'Breed is required' : false })}
                      />
                      {errors.breed && (
                        <p className="text-red-500 text-xs mt-1">{errors.breed.message}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>
                      Pet name {mode === 'custom' ? '*' : '(optional)'}
                    </label>
                    <input
                      className={inputClass}
                      placeholder={selectedPet?.name || 'Pet name'}
                      {...register('name', {
                        required: mode === 'custom' ? 'Name is required' : false,
                      })}
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

                {mode === 'custom' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Color</label>
                      <input className={inputClass} {...register('color')} />
                    </div>
                    <div>
                      <label className={labelClass}>Weight</label>
                      <input className={inputClass} placeholder="e.g. 12 kg" {...register('weight')} />
                    </div>
                    <div>
                      <label className={labelClass}>Health status</label>
                      <input className={inputClass} {...register('healthStatus')} />
                    </div>
                    <div>
                      <label className={labelClass}>Temperament</label>
                      <input className={inputClass} {...register('temperament')} />
                    </div>
                  </div>
                )}

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
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                      <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
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
                      <input type="file" accept="image/*" multiple className="hidden" onChange={onAddPhotos} />
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
