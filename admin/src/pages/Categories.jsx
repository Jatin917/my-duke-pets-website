import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUpload } from 'react-icons/fi';
import Loader from '../components/common/Loader';
import ConfirmModal from '../components/common/ConfirmModal';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../services/categoryService';
import { resolveImageUrl } from '../services/api';

const inputClass =
  'w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none text-sm transition';

const CategoryModal = ({ category, onClose, onSaved }) => {
  const [preview, setPreview] = useState(category?.image ? resolveImageUrl(category.image) : '');
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
      icon: category?.icon || '',
      isActive: category ? category.isActive : true,
    },
  });

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => formData.append(key, value));
      if (file) formData.append('image', file);

      if (category) {
        await updateCategory(category._id, formData);
        toast.success('Category updated');
      } else {
        await createCategory(formData);
        toast.success('Category created');
      }
      onSaved();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
          <FiX />
        </button>
        <h3 className="font-bold text-lg text-gray-800 mb-5">{category ? 'Edit Category' : 'Add Category'}</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden shrink-0">
              {preview && <img src={preview} alt="preview" className="w-full h-full object-cover" />}
            </div>
            <label className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-gray-300 text-sm text-gray-500 cursor-pointer hover:border-primary-400">
              <FiUpload /> Upload Image
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </label>
          </div>

          <div>
            <input
              placeholder="Category Name *"
              className={inputClass}
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <textarea placeholder="Description" rows={3} className={inputClass} {...register('description')} />

          <input placeholder="Icon name (optional)" className={inputClass} {...register('icon')} />

          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4 accent-primary-500" {...register('isActive')} />
            <span className="text-sm text-gray-700">Active (visible on website)</span>
          </label>

          <button
            type="submit"
            disabled={saving}
            className="w-full btn-gradient text-white font-semibold py-3 rounded-xl disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Category'}
          </button>
        </form>
      </div>
    </div>
  );
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    fetchCategories(true)
      .then((res) => setCategories(res.data || []))
      .catch(() => toast.error('Failed to load categories'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteCategory(deleteTarget._id);
      toast.success('Category deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete category');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
          <p className="text-gray-500 text-sm mt-1">{categories.length} categories</p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 btn-gradient text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg"
        >
          <FiPlus /> Add Category
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <div key={cat._id} className="bg-white rounded-2xl shadow-soft overflow-hidden">
              <div className="h-36 bg-gray-100 relative">
                {cat.image ? (
                  <img src={resolveImageUrl(cat.image)} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">🐾</div>
                )}
                <span
                  className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full ${
                    cat.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                  }`}
                >
                  {cat.isActive ? 'Active' : 'Disabled'}
                </span>
              </div>
              <div className="p-4">
                <h4 className="font-bold text-gray-800">{cat.name}</h4>
                <p className="text-xs text-gray-400 mb-3">{cat.petCount ?? 0} pets</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingCategory(cat);
                      setModalOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 text-sm py-2 rounded-lg bg-secondary-50 text-secondary-600 hover:bg-secondary-100 transition"
                  >
                    <FiEdit2 size={14} /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(cat)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-sm py-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition"
                  >
                    <FiTrash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <CategoryModal
          category={editingCategory}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            load();
          }}
        />
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Categories with existing pets cannot be deleted.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
};

export default Categories;
