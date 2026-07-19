import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiPlus, FiSave, FiTrash2 } from 'react-icons/fi';
import Loader from '../components/common/Loader';
import ImageUploader from '../components/common/ImageUploader';
import { fetchPetById, createPet, updatePet } from '../services/petService';
import { fetchCategories } from '../services/categoryService';

const inputClass =
  'w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none text-sm transition';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';
const errorClass = 'text-red-500 text-xs mt-1';

const DEFAULT_CARE_TIPS = [
  { title: 'Diet', text: 'Feed age-appropriate, high-quality food suited to the pet’s size and breed.' },
  { title: 'Exercise & Enrichment', text: 'Daily activity and playtime that suits your home and the pet’s temperament.' },
  { title: 'Grooming', text: 'Regular grooming and coat/skin checks keep them comfortable and healthy.' },
  { title: 'Health', text: 'Keep vaccination and deworming on schedule and book regular vet check-ups.' },
];

const DEFAULT_DIET = [
  { title: 'High-Quality Food', text: 'Protein-rich food formulated for your pet’s age and breed size.' },
  { title: 'Fresh Water', text: 'Always keep clean, fresh water available throughout the day.' },
  { title: 'Fruits & Vegetables', text: 'Vet-approved fruits and vegetables provide essential fiber and vitamins.' },
  { title: 'Supplements', text: 'Omega-3 and joint supplements (as advised by your vet) support coat and joints.' },
];

const DEFAULT_AVOID = [
  { title: 'Chocolate & Caffeine', text: 'Contains compounds that are highly toxic to most pets.' },
  { title: 'Onions & Garlic', text: 'Can damage red blood cells and lead to anemia.' },
  { title: 'Grapes & Raisins', text: 'Known to cause sudden kidney issues in dogs.' },
  { title: 'Xylitol & Sugary Foods', text: 'Artificial sweeteners can cause serious liver problems.' },
];

const DEFAULT_FAQS = [
  {
    question: 'How much does this pet cost?',
    answer: 'Pricing is visible after login. Final price is confirmed during enquiry follow-up.',
  },
  {
    question: 'Is this pet vaccinated and healthy?',
    answer: 'Vaccination and health status are shown on this page. Full records are shared at handover.',
  },
  {
    question: 'Do you provide home delivery?',
    answer: 'Yes, safe doorstep delivery is available in most cities within the estimate shown in Quick Facts.',
  },
  {
    question: 'What is your health guarantee policy?',
    answer: 'Every pet is vet-checked before dispatch and backed by our post-adoption support team.',
  },
];

const TitleTextList = ({ title, hint, items, onChange, keyA = 'title', keyB = 'text', labelA = 'Title', labelB = 'Text' }) => {
  const updateItem = (index, field, value) => {
    const next = items.map((item, i) => (i === index ? { ...item, [field]: value } : item));
    onChange(next);
  };

  const addItem = () => onChange([...items, { [keyA]: '', [keyB]: '' }]);
  const removeItem = (index) => onChange(items.filter((_, i) => i !== index));

  return (
    <div className="bg-white rounded-2xl shadow-soft p-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-gray-800">{title}</h3>
          {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          <FiPlus size={14} /> Add
        </button>
      </div>

      {items.length === 0 && (
        <p className="text-sm text-gray-400 italic">No items yet — site defaults will be shown on the detail page.</p>
      )}

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">#{index + 1}</span>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-red-400 hover:text-red-600 p-1"
                title="Remove"
              >
                <FiTrash2 size={14} />
              </button>
            </div>
            <div>
              <label className={labelClass}>{labelA}</label>
              <input
                className={inputClass}
                value={item[keyA] || ''}
                onChange={(e) => updateItem(index, keyA, e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>{labelB}</label>
              <textarea
                rows={2}
                className={inputClass}
                value={item[keyB] || ''}
                onChange={(e) => updateItem(index, keyB, e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

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
  const [careTips, setCareTips] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [recommendedDiet, setRecommendedDiet] = useState([]);
  const [foodsToAvoid, setFoodsToAvoid] = useState([]);

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
          size: pet.size || '',
          lifespan: pet.lifespan || '',
          deliveryEstimate: pet.deliveryEstimate || '',
        });
        setExistingImages(pet.images || []);
        setCareTips(pet.careTips?.length ? pet.careTips.map((t) => ({ title: t.title || '', text: t.text || '' })) : []);
        setFaqs(
          pet.faqs?.length
            ? pet.faqs.map((f) => ({ question: f.question || '', answer: f.answer || '' }))
            : []
        );
        setRecommendedDiet(
          pet.recommendedDiet?.length
            ? pet.recommendedDiet.map((t) => ({ title: t.title || '', text: t.text || '' }))
            : []
        );
        setFoodsToAvoid(
          pet.foodsToAvoid?.length
            ? pet.foodsToAvoid.map((t) => ({ title: t.title || '', text: t.text || '' }))
            : []
        );
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
      formData.append('careTips', JSON.stringify(careTips));
      formData.append('faqs', JSON.stringify(faqs));
      formData.append('recommendedDiet', JSON.stringify(recommendedDiet));
      formData.append('foodsToAvoid', JSON.stringify(foodsToAvoid));
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
          <p className="text-gray-500 text-sm">
            Edit listing + detail page content (FAQs, tips, diet). Trust badges stay site-wide.
          </p>
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

        <div className="bg-white rounded-2xl shadow-soft p-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="sm:col-span-3 flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-gray-800">Quick Facts extras</h3>
              <p className="text-xs text-gray-400 mt-1">
                Breed, gender, age, color, and vaccination come from Basic Info. Leave blank to use category defaults.
              </p>
            </div>
          </div>

          <div>
            <label className={labelClass}>Size</label>
            <input placeholder="e.g. Medium - Large" className={inputClass} {...register('size')} />
          </div>
          <div>
            <label className={labelClass}>Lifespan</label>
            <input placeholder="e.g. 10-14 Years" className={inputClass} {...register('lifespan')} />
          </div>
          <div>
            <label className={labelClass}>Delivery estimate</label>
            <input placeholder="e.g. 3-5 Days" className={inputClass} {...register('deliveryEstimate')} />
          </div>
        </div>

        <div>
          <div className="flex justify-end mb-2">
            <button
              type="button"
              onClick={() => setCareTips(DEFAULT_CARE_TIPS.map((t) => ({ ...t })))}
              className="text-xs font-medium text-primary-600 hover:text-primary-700"
            >
              Fill care tip defaults
            </button>
          </div>
          <TitleTextList
            title="Care Tips"
            hint="Shown under “Care Tips for {name}” on the detail page."
            items={careTips}
            onChange={setCareTips}
          />
        </div>

        <div>
          <div className="flex justify-end gap-3 mb-2">
            <button
              type="button"
              onClick={() => setRecommendedDiet(DEFAULT_DIET.map((t) => ({ ...t })))}
              className="text-xs font-medium text-primary-600 hover:text-primary-700"
            >
              Fill recommended diet defaults
            </button>
            <button
              type="button"
              onClick={() => setFoodsToAvoid(DEFAULT_AVOID.map((t) => ({ ...t })))}
              className="text-xs font-medium text-primary-600 hover:text-primary-700"
            >
              Fill foods-to-avoid defaults
            </button>
          </div>
          <div className="space-y-6">
            <TitleTextList
              title="Recommended Diet"
              hint="Left column on the detail page diet section."
              items={recommendedDiet}
              onChange={setRecommendedDiet}
            />
            <TitleTextList
              title="Foods to Avoid"
              hint="Right column on the detail page diet section."
              items={foodsToAvoid}
              onChange={setFoodsToAvoid}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-end mb-2">
            <button
              type="button"
              onClick={() => setFaqs(DEFAULT_FAQS.map((f) => ({ ...f })))}
              className="text-xs font-medium text-primary-600 hover:text-primary-700"
            >
              Fill FAQ defaults
            </button>
          </div>
          <TitleTextList
            title="FAQs"
            hint="Custom FAQs replace the auto-generated ones when at least one is saved."
            items={faqs}
            onChange={setFaqs}
            keyA="question"
            keyB="answer"
            labelA="Question"
            labelB="Answer"
          />
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
