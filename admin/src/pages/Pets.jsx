import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import Loader from '../components/common/Loader';
import ConfirmModal from '../components/common/ConfirmModal';
import Pagination from '../components/common/Pagination';
import { fetchPets, deletePet } from '../services/petService';
import { resolveImageUrl } from '../services/api';
import { formatPrice } from '../utils/formatters';
import useDebounce from '../hooks/useDebounce';

const Pets = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const loadPets = () => {
    setLoading(true);
    fetchPets({ search: debouncedSearch, page, limit: 10, sort: 'newest' })
      .then((res) => {
        setPets(res.data || []);
        setPages(res.pages || 1);
        setTotal(res.total || 0);
      })
      .catch(() => toast.error('Failed to load pets'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, page]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deletePet(deleteTarget._id);
      toast.success('Pet deleted successfully');
      setDeleteTarget(null);
      loadPets();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete pet');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Pets</h1>
          <p className="text-gray-500 text-sm mt-1">{total} pets in your listings</p>
        </div>
        <Link
          to="/pets/new"
          className="inline-flex items-center gap-2 btn-gradient text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg"
        >
          <FiPlus /> Add New Pet
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-soft p-4 mb-6">
        <div className="relative max-w-sm">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or breed..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:outline-none text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
        {loading ? (
          <Loader />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100 bg-gray-50">
                  <th className="py-3 px-5 font-medium">Pet</th>
                  <th className="py-3 px-5 font-medium">Category</th>
                  <th className="py-3 px-5 font-medium">Price</th>
                  <th className="py-3 px-5 font-medium">Gender</th>
                  <th className="py-3 px-5 font-medium">Availability</th>
                  <th className="py-3 px-5 font-medium">Featured</th>
                  <th className="py-3 px-5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pets.map((pet) => (
                  <tr key={pet._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={resolveImageUrl(pet.images?.[0])}
                          alt={pet.name}
                          className="w-11 h-11 rounded-lg object-cover bg-gray-100"
                        />
                        <div>
                          <p className="font-medium text-gray-800">{pet.name}</p>
                          <p className="text-xs text-gray-400">{pet.breed}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5 text-gray-600">{pet.category?.name}</td>
                    <td className="py-3 px-5 font-medium text-gray-700">{formatPrice(pet.price)}</td>
                    <td className="py-3 px-5 text-gray-600">{pet.gender}</td>
                    <td className="py-3 px-5">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          pet.availability ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {pet.availability ? 'Available' : 'Adopted'}
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      {pet.featured && (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-100 text-primary-700">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/pets/${pet._id}/edit`}
                          className="w-9 h-9 rounded-lg bg-secondary-50 text-secondary-600 flex items-center justify-center hover:bg-secondary-100 transition"
                        >
                          <FiEdit2 size={15} />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(pet)}
                          className="w-9 h-9 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pets.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-gray-400">
                      No pets found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination page={page} pages={pages} onChange={setPage} />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Pet"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
};

export default Pets;
