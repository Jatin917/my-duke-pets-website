import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiSearch, FiTrash2, FiEye, FiX, FiCheck } from 'react-icons/fi';
import Loader from '../components/common/Loader';
import ConfirmModal from '../components/common/ConfirmModal';
import Pagination from '../components/common/Pagination';
import { fetchSellRequests, updateSellRequest, deleteSellRequest } from '../services/sellService';
import { resolveImageUrl } from '../services/api';
import { formatDate } from '../utils/formatters';
import useDebounce from '../hooks/useDebounce';

const STATUS_OPTIONS = ['Pending', 'Reviewed', 'Approved', 'Rejected'];

const STATUS_STYLES = {
  Pending: 'bg-amber-100 text-amber-700',
  Reviewed: 'bg-blue-100 text-blue-700',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
};

const DetailModal = ({ item, onClose, onPublish }) => (
  <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
    <div
      onClick={(e) => e.stopPropagation()}
      className="bg-white rounded-2xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
      >
        <FiX />
      </button>
      <h3 className="font-bold text-lg text-gray-800 mb-4">Sell Request</h3>
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {(item.images || []).map((img) => (
          <img
            key={img}
            src={resolveImageUrl(img)}
            alt=""
            className="w-20 h-20 rounded-xl object-cover border border-gray-100"
          />
        ))}
      </div>
      <div className="space-y-2 text-sm">
        {[
          ['Mode', item.mode === 'other' ? 'Other (custom breed)' : 'Catalog'],
          ['Pet', item.name],
          ['Breed', item.breed || '-'],
          ['Category', item.category?.name || item.customCategory || '-'],
          ['Age', item.age],
          ['Gender', item.gender],
          ['Price', `₹${item.price}`],
          ['Vaccination', item.vaccinationStatus],
          ['Seller', item.sellerName],
          ['Phone', item.sellerPhone],
          ['Email', item.sellerEmail],
          ['City', `${item.sellerCity || '-'}, ${item.sellerState || '-'}`],
          ['Status', item.status],
          ['Date', formatDate(item.createdAt)],
          ['Published', item.publishedPet?.name || 'Not published'],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 py-2 border-b border-gray-50 last:border-0">
            <span className="text-gray-400">{label}</span>
            <span className="text-gray-800 font-medium text-right">{value}</span>
          </div>
        ))}
        {item.description && (
          <p className="text-gray-600 pt-2">
            <span className="text-gray-400 block mb-1">Description</span>
            {item.description}
          </p>
        )}
      </div>
      {!item.publishedPet && (
        <button
          type="button"
          onClick={() => onPublish(item)}
          className="mt-5 w-full inline-flex items-center justify-center gap-2 btn-gradient text-white font-semibold py-3 rounded-xl"
        >
          <FiCheck /> Approve &amp; Publish to catalog
        </button>
      )}
    </div>
  </div>
);

const SellRequests = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const load = () => {
    setLoading(true);
    fetchSellRequests({ search: debouncedSearch, status, page, limit: 10 })
      .then((res) => {
        setItems(res.data || []);
        setPages(res.pages || 1);
        setTotal(res.total || 0);
      })
      .catch(() => toast.error('Failed to load sell requests'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [debouncedSearch, status, page]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateSellRequest(id, { status: newStatus });
      setItems((prev) => prev.map((e) => (e._id === id ? { ...e, status: newStatus } : e)));
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handlePublish = async (item) => {
    try {
      const updated = await updateSellRequest(item._id, { publish: true, status: 'Approved' });
      setItems((prev) => prev.map((e) => (e._id === item._id ? updated : e)));
      setViewTarget(updated);
      toast.success('Published to pet catalog');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to publish');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteSellRequest(deleteTarget._id);
      toast.success('Deleted');
      setDeleteTarget(null);
      load();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sell Requests</h1>
        <p className="text-gray-500 text-sm mt-1">{total} seller submissions</p>
      </div>

      <div className="bg-white rounded-2xl shadow-soft p-4 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search pet or seller..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:outline-none text-sm"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="bg-white rounded-2xl shadow-soft overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="px-4 py-3 font-medium">Pet</th>
                <th className="px-4 py-3 font-medium">Seller</th>
                <th className="px-4 py-3 font-medium">Mode</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={resolveImageUrl(item.images?.[0])}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                      />
                      <div>
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-400">
                          {item.breed || '-'} · {item.category?.name || item.customCategory || 'Other'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-800">{item.sellerName}</p>
                    <p className="text-xs text-gray-400">{item.sellerPhone}</p>
                  </td>
                  <td className="px-4 py-3 capitalize">{item.mode}</td>
                  <td className="px-4 py-3">₹{item.price}</td>
                  <td className="px-4 py-3">
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item._id, e.target.value)}
                      className={`text-xs font-semibold px-2 py-1 rounded-lg border-0 ${STATUS_STYLES[item.status] || ''}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(item.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setViewTarget(item)}
                        className="w-8 h-8 rounded-lg bg-gray-50 text-gray-600 flex items-center justify-center hover:bg-primary-50 hover:text-primary-600"
                      >
                        <FiEye />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(item)}
                        className="w-8 h-8 rounded-lg bg-gray-50 text-gray-600 flex items-center justify-center hover:bg-red-50 hover:text-red-500"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                    No sell requests yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} pages={pages} onChange={setPage} />

      {viewTarget && (
        <DetailModal
          item={viewTarget}
          onClose={() => setViewTarget(null)}
          onPublish={handlePublish}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          open={Boolean(deleteTarget)}
          title="Delete Sell Request"
          message={`Delete request for ${deleteTarget.name}?`}
          confirmLabel="Delete"
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default SellRequests;
