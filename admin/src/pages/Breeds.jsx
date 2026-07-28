import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import Loader from '../components/common/Loader';
import ConfirmModal from '../components/common/ConfirmModal';
import { fetchCategories } from '../services/categoryService';
import { fetchBreeds, createBreed, updateBreed, deleteBreed } from '../services/breedService';

const inputClass =
  'w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none text-sm transition';

const BreedModal = ({ breed, categories, defaultCategory, onClose, onSaved }) => {
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: breed?.name || '',
      category: breed?.category?._id || breed?.category || defaultCategory || '',
      order: breed?.order ?? 0,
      isActive: breed ? breed.isActive : true,
    },
  });

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = {
        name: data.name,
        category: data.category,
        order: Number(data.order) || 0,
        isActive: !!data.isActive,
      };
      if (breed) {
        await updateBreed(breed._id, payload);
        toast.success('Breed updated');
      } else {
        await createBreed(payload);
        toast.success('Breed created');
      }
      onSaved();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save breed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-md p-6 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
        >
          <FiX />
        </button>
        <h3 className="font-bold text-lg text-gray-800 mb-5">
          {breed ? 'Edit Breed' : 'Add Breed'}
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Category *</label>
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
            <label className="block text-xs font-semibold text-gray-500 mb-1">Breed name *</label>
            <input
              className={inputClass}
              placeholder="e.g. Labrador Retriever"
              {...register('name', { required: 'Breed name is required' })}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Order</label>
            <input type="number" className={inputClass} {...register('order')} />
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4 accent-primary-500" {...register('isActive')} />
            <span className="text-sm text-gray-700">Active (visible on website)</span>
          </label>
          <button
            type="submit"
            disabled={saving}
            className="w-full btn-gradient text-white font-semibold py-3 rounded-xl disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Breed'}
          </button>
        </form>
      </div>
    </div>
  );
};

const Breeds = () => {
  const [categories, setCategories] = useState([]);
  const [breeds, setBreeds] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadCategories = () =>
    fetchCategories(true)
      .then((res) => setCategories(res.data || []))
      .catch(() => toast.error('Failed to load categories'));

  const loadBreeds = () => {
    setLoading(true);
    fetchBreeds({ category: categoryFilter || undefined, all: true })
      .then((res) => setBreeds(res.data || []))
      .catch(() => toast.error('Failed to load breeds'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadBreeds();
  }, [categoryFilter]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteBreed(deleteTarget._id);
      toast.success('Breed deleted');
      setDeleteTarget(null);
      loadBreeds();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete breed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Breeds</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage breeds per category for Sell, Enquiries, and prompts
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 btn-gradient text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg"
        >
          <FiPlus /> Add Breed
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-soft p-4 mb-6 max-w-sm">
        <label className="block text-xs font-semibold text-gray-500 mb-1">Filter by category</label>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className={inputClass}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
        {loading ? (
          <Loader />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100 bg-gray-50">
                  <th className="py-3 px-5 font-medium">Breed</th>
                  <th className="py-3 px-5 font-medium">Category</th>
                  <th className="py-3 px-5 font-medium">Order</th>
                  <th className="py-3 px-5 font-medium">Status</th>
                  <th className="py-3 px-5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {breeds.map((b) => (
                  <tr key={b._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="py-3 px-5 font-medium text-gray-800">{b.name}</td>
                    <td className="py-3 px-5 text-gray-600">{b.category?.name || '—'}</td>
                    <td className="py-3 px-5 text-gray-500">{b.order}</td>
                    <td className="py-3 px-5">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          b.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {b.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditing(b);
                            setModalOpen(true);
                          }}
                          className="w-9 h-9 rounded-lg bg-secondary-50 text-secondary-600 flex items-center justify-center hover:bg-secondary-100"
                        >
                          <FiEdit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(b)}
                          className="w-9 h-9 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {breeds.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-gray-400">
                      No breeds yet. Add breeds or wait for auto-seed from existing pets.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <BreedModal
          breed={editing}
          categories={categories}
          defaultCategory={categoryFilter}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSaved={() => {
            setModalOpen(false);
            setEditing(null);
            loadBreeds();
          }}
        />
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Breed"
        message={`Delete “${deleteTarget?.name}”? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
};

export default Breeds;
