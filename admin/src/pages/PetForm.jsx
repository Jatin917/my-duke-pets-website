import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import Loader from '../components/common/Loader';
import ImageUploader from '../components/common/ImageUploader';
import { fetchPetById, createPet, updatePet } from '../services/petService';
import { fetchCategories } from '../services/categoryService';

const inputClass =
  'w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none text-sm transition';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';
const errorClass = 'text-red-500 text-xs mt-1';

const PetForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    fetchCategories(true).then((res) => setCategories(res.data || []));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    fetchPetById(id)
      .then((res) => {
        const pet = res.data;
        reset({
          name: pet.name,
          breed: pet.breed,
          category: pet.category?._id,
          age: pet.age,
          gender: pet.gender,
          color: pet.color,
          weight: pet.weight,
          price: pet.price,
          discountPrice: pet.discountPrice || '',
          vaccinationStatus: pet.vaccinationStatus,
          healthStatus: pet.healthStatus,
          temperament: pet.temperament,
          foodPreference: pet.foodPreference,
          description: pet.description,
          additionalNotes: pet.additionalNotes,
          availability: pet.availability,
          featured: pet.featured,
          seoTitle: pet.seoTitle,
          seoDescription: pet.seoDescription,
          videoUrl: pet.videoUrl || '',
        });
        setExistingImages(pet.images || []);
      })
      .catch(() => toast.error('Failed to load pet'))
      .finally(() => setLoading(false));
  }, [id, isEdit, reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) formData.append(key, value);
      });
      removedImages.forEach((img) => formData.append('removedImages', img));
      newFiles.forEach((file) => formData.append('images', file));

      if (isEdit) {
        await updatePet(id, formData);
        toast.success('Pet updated successfully');
      } else {
        await createPet(formData);
        toast.success('Pet added successfully');
      }
      navigate('/pets');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader full />;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/pets" className="w-9 h-9 rounded-lg bg-white shadow-soft flex items-center justify-center text-gray-500">
          <FiArrowLeft />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{isEdit ? 'Edit Pet' : 'Add New Pet'}</h1>
          <p className="text-gray-500 text-sm">Fill in the details below</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-soft p-6">
          <h3 className="font-bold text-gray-800 mb-4">Images</h3>
          <ImageUploader
            existingImages={existingImages}
            newFiles={newFiles}
            onRemoveExisting={(img) => {
              setExistingImages((prev) => prev.filter((i) => i !== img));
              setRemovedImages((prev) => [...prev, img]);
            }}
            onAddFiles={(files) => setNewFiles((prev) => [...prev, ...files])}
            onRemoveNew={(idx) => setNewFiles((prev) => prev.filter((_, i) => i !== idx))}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <h3 className="font-bold text-gray-800 sm:col-span-2 -mb-2">Basic Information</h3>

          <div>
            <label className={labelClass}>Pet Name *</label>
            <input className={inputClass} {...register('name', { required: 'Name is required' })} />
            {errors.name && <p className={errorClass}>{errors.name.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Breed *</label>
            <input className={inputClass} {...register('breed', { required: 'Breed is required' })} />
            {errors.breed && <p className={errorClass}>{errors.breed.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Category *</label>
            <select className={inputClass} {...register('category', { required: 'Category is required' })}>
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category && <p className={errorClass}>{errors.category.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Age *</label>
            <input placeholder="e.g. 3 months" className={inputClass} {...register('age', { required: 'Age is required' })} />
            {errors.age && <p className={errorClass}>{errors.age.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Gender</label>
            <select className={inputClass} {...register('gender')}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Color</label>
            <input className={inputClass} {...register('color')} />
          </div>

          <div>
            <label className={labelClass}>Weight</label>
            <input placeholder="e.g. 5 kg" className={inputClass} {...register('weight')} />
          </div>

          <div>
            <label className={labelClass}>Vaccination Status</label>
            <select className={inputClass} {...register('vaccinationStatus')}>
              <option value="Vaccinated">Vaccinated</option>
              <option value="Partially Vaccinated">Partially Vaccinated</option>
              <option value="Not Vaccinated">Not Vaccinated</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <h3 className="font-bold text-gray-800 sm:col-span-2 -mb-2">Pricing &amp; Availability</h3>

          <div>
            <label className={labelClass}>Price (INR) *</label>
            <input
              type="number"
              className={inputClass}
              {...register('price', { required: 'Price is required', min: { value: 0, message: 'Price must be positive' } })}
            />
            {errors.price && <p className={errorClass}>{errors.price.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Discount Price (optional)</label>
            <input type="number" className={inputClass} {...register('discountPrice')} />
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="availability" className="w-4 h-4 accent-primary-500" {...register('availability')} />
            <label htmlFor="availability" className="text-sm text-gray-700">
              Available for adoption
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="featured" className="w-4 h-4 accent-primary-500" {...register('featured')} />
            <label htmlFor="featured" className="text-sm text-gray-700">
              Mark as Featured
            </label>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <h3 className="font-bold text-gray-800 sm:col-span-2 -mb-2">Health &amp; Care</h3>

          <div>
            <label className={labelClass}>Health Status</label>
            <input className={inputClass} {...register('healthStatus')} />
          </div>

          <div>
            <label className={labelClass}>Temperament</label>
            <input placeholder="e.g. Friendly, Playful" className={inputClass} {...register('temperament')} />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Food Preference</label>
            <input className={inputClass} {...register('foodPreference')} />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Video URL (YouTube / Vimeo / .mp4)</label>
            <input
              placeholder="https://www.youtube.com/watch?v=..."
              className={inputClass}
              {...register('videoUrl')}
            />
            <p className="text-xs text-gray-400 mt-1">
              Paste a YouTube, Vimeo, or direct MP4 link. Shown as &quot;Watch Full Video&quot; on the pet detail page.
            </p>
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Description</label>
            <textarea rows={4} className={inputClass} {...register('description')} />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Additional Notes</label>
            <textarea rows={3} className={inputClass} {...register('additionalNotes')} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <h3 className="font-bold text-gray-800 sm:col-span-2 -mb-2">SEO Settings</h3>

          <div>
            <label className={labelClass}>SEO Title</label>
            <input className={inputClass} {...register('seoTitle')} />
          </div>

          <div>
            <label className={labelClass}>SEO Description</label>
            <input className={inputClass} {...register('seoDescription')} />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link to="/pets" className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 btn-gradient text-white font-semibold px-6 py-3 rounded-xl shadow-lg disabled:opacity-60"
          >
            <FiSave /> {saving ? 'Saving...' : 'Save Pet'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PetForm;
