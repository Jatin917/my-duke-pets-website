import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiX, FiCheckCircle, FiEye, FiLock } from 'react-icons/fi';
import { submitEnquiry } from '../../services/enquiryService';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { formatPrice } from '../../utils/formatters';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none transition text-sm';
const errorClass = 'text-red-500 text-xs mt-1';

const EnquiryModal = ({ pet, onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const { isAuthenticated, customer } = useCustomerAuth();
  const navigate = useNavigate();
  useBodyScrollLock(true);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: customer?.name || '',
      email: customer?.email || '',
      phone: customer?.phone || '',
    },
  });

  const loginHref = `/login?return_url=${encodeURIComponent(`/pets/${pet.slug || pet._id}`)}`;

  const handleViewPrice = () => {
    if (isAuthenticated) return;
    onClose();
    navigate(loginHref);
  };

  const onSubmit = async (formData) => {
    try {
      await submitEnquiry({ ...formData, pet: pet._id });
      setSubmitted(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overscroll-none"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 22, stiffness: 260 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full max-w-lg rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto relative"
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 z-10"
          >
            <FiX />
          </button>

          {submitted ? (
            <div className="p-10 text-center">
              <div className="w-20 h-20 rounded-full bg-green-50 text-green-500 flex items-center justify-center mx-auto mb-5 text-4xl">
                <FiCheckCircle />
              </div>
              <h3 className="text-2xl font-display font-bold text-gray-800 mb-2">Thank You!</h3>
              <p className="text-gray-500 mb-6">
                Our team will contact you shortly regarding <strong>{pet.name}</strong>.
              </p>
              <button
                onClick={onClose}
                className="btn-gradient text-white font-semibold px-8 py-3 rounded-full"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="p-6 sm:p-8">
              <h3 className="text-2xl font-display font-bold text-gray-800 mb-1">
                Enquire About {pet.name}
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Fill in your details and our team will reach out to you soon.
              </p>

              <div className="mb-6 rounded-2xl border border-primary-100 bg-primary-50/60 p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Pet price</p>
                  {isAuthenticated ? (
                    <p className="text-xl font-display font-bold text-primary-600">
                      {formatPrice(pet.discountPrice || pet.price)}
                      {pet.discountPrice ? (
                        <span className="ml-2 text-sm font-normal text-gray-400 line-through">
                          {formatPrice(pet.price)}
                        </span>
                      ) : null}
                    </p>
                  ) : (
                    <p className="flex items-center gap-1.5 text-gray-400 font-semibold tracking-widest">
                      <FiLock size={14} /> ••••••
                    </p>
                  )}
                </div>
                {!isAuthenticated ? (
                  <button
                    type="button"
                    onClick={handleViewPrice}
                    className="inline-flex items-center gap-1.5 shrink-0 rounded-xl bg-white border border-primary-200 text-primary-600 font-semibold text-sm px-3.5 py-2.5 hover:bg-primary-50 transition shadow-sm"
                  >
                    <FiEye size={14} />
                    View Price
                  </button>
                ) : (
                  <Link
                    to={`/pets/${pet.slug || pet._id}`}
                    onClick={onClose}
                    className="text-xs font-semibold text-primary-600 hover:underline shrink-0"
                  >
                    View pet
                  </Link>
                )}
              </div>

              {!isAuthenticated && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-4">
                  Login to unlock pricing for {pet.name}. You can still submit an enquiry below.
                </p>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      placeholder="Full Name *"
                      className={inputClass}
                      {...register('name', { required: 'Full name is required' })}
                    />
                    {errors.name && <p className={errorClass}>{errors.name.message}</p>}
                  </div>
                  <div>
                    <input
                      placeholder="Phone Number *"
                      className={inputClass}
                      {...register('phone', {
                        required: 'Phone number is required',
                        pattern: { value: /^[0-9+\-\s]{7,15}$/, message: 'Enter a valid phone number' },
                      })}
                    />
                    {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
                  </div>
                </div>

                <div>
                  <input
                    placeholder="Email Address *"
                    type="email"
                    className={inputClass}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
                    })}
                  />
                  {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      placeholder="City *"
                      className={inputClass}
                      {...register('city', { required: 'City is required' })}
                    />
                    {errors.city && <p className={errorClass}>{errors.city.message}</p>}
                  </div>
                  <div>
                    <input
                      placeholder="State *"
                      className={inputClass}
                      {...register('state', { required: 'State is required' })}
                    />
                    {errors.state && <p className={errorClass}>{errors.state.message}</p>}
                  </div>
                </div>

                <div>
                  <input placeholder="Address (optional)" className={inputClass} {...register('address')} />
                </div>

                <div>
                  <input
                    disabled
                    value={`Interested in: ${pet.name} (${pet.breed})`}
                    className={`${inputClass} bg-gray-50 text-gray-500`}
                  />
                </div>

                <div>
                  <textarea
                    placeholder="Additional Message (optional)"
                    rows={3}
                    className={inputClass}
                    {...register('message')}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-gradient text-white font-semibold py-3.5 rounded-xl shadow-glow disabled:opacity-60"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Enquiry'}
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EnquiryModal;
