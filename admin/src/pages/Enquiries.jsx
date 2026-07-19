import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiSearch, FiDownload, FiTrash2, FiEye, FiX, FiExternalLink } from 'react-icons/fi';
import Loader from '../components/common/Loader';
import ConfirmModal from '../components/common/ConfirmModal';
import Pagination from '../components/common/Pagination';
import {
  fetchEnquiries,
  updateEnquiryStatus,
  deleteEnquiry,
  exportEnquiriesExcel,
  fetchGoogleSheetInfo,
} from '../services/enquiryService';
import { formatDate } from '../utils/formatters';
import useDebounce from '../hooks/useDebounce';

const STATUS_OPTIONS = ['Pending', 'Contacted', 'Completed', 'Rejected'];

const STATUS_STYLES = {
  Pending: 'bg-amber-100 text-amber-700',
  Contacted: 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
};

const DetailModal = ({ enquiry, onClose }) => (
  <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
    <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-md p-6 relative">
      <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
        <FiX />
      </button>
      <h3 className="font-bold text-lg text-gray-800 mb-4">Enquiry Details</h3>
      <div className="space-y-2 text-sm">
        {[
          ['Name', enquiry.name],
          ['Phone', enquiry.phone],
          ['Email', enquiry.email],
          ['City', enquiry.city],
          ['State', enquiry.state],
          ['Address', enquiry.address || '-'],
          ['Pet', enquiry.petName],
          ['Category', enquiry.category],
          ['Message', enquiry.message || '-'],
          ['Date', formatDate(enquiry.createdAt)],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 py-2 border-b border-gray-50 last:border-0">
            <span className="text-gray-400">{label}</span>
            <span className="text-gray-800 font-medium text-right">{value}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Enquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [googleSheet, setGoogleSheet] = useState({ enabled: false, url: null });

  const debouncedSearch = useDebounce(search, 400);

  const load = () => {
    setLoading(true);
    fetchEnquiries({ search: debouncedSearch, status, page, limit: 10 })
      .then((res) => {
        setEnquiries(res.data || []);
        setPages(res.pages || 1);
        setTotal(res.total || 0);
      })
      .catch(() => toast.error('Failed to load enquiries'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [debouncedSearch, status, page]);

  useEffect(() => {
    fetchGoogleSheetInfo()
      .then(setGoogleSheet)
      .catch(() => setGoogleSheet({ enabled: false, url: null }));
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateEnquiryStatus(id, newStatus);
      setEnquiries((prev) => prev.map((e) => (e._id === id ? { ...e, status: newStatus } : e)));
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteEnquiry(deleteTarget._id);
      toast.success('Enquiry deleted');
      setDeleteTarget(null);
      load();
    } catch {
      toast.error('Failed to delete enquiry');
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportEnquiriesExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `enquiries-${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Excel exported successfully');
    } catch {
      toast.error('Failed to export');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Enquiries</h1>
          <p className="text-gray-500 text-sm mt-1">{total} total enquiries</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {googleSheet?.url && (
            <a
              href={googleSheet.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border-2 border-green-500 text-green-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-green-50 transition"
            >
              <FiExternalLink /> Open Google Sheet
            </a>
          )}
          <button
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 btn-gradient text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg disabled:opacity-60"
          >
            <FiDownload /> {exporting ? 'Exporting...' : 'Export to Excel'}
          </button>
        </div>
      </div>

      {googleSheet?.enabled && (
        <p className="text-xs text-green-700 bg-green-50 border border-green-100 rounded-xl px-3 py-2 mb-4">
          Live sync is on — new enquiries (and status changes) are written to your Google Sheet automatically.
        </p>
      )}
      {!googleSheet?.enabled && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-4">
          Google Sheet sync is not configured yet. Add{' '}
          <code className="font-mono">GOOGLE_SHEETS_WEBHOOK_URL</code> in{' '}
          <code className="font-mono">server/.env</code> (see{' '}
          <code className="font-mono">server/scripts/google-sheets-appscript.gs</code>).
        </p>
      )}

      <div className="bg-white rounded-2xl shadow-soft p-4 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, phone, email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:outline-none text-sm"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary-400 focus:outline-none"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
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
                  <th className="py-3 px-5 font-medium">Date</th>
                  <th className="py-3 px-5 font-medium">Pet</th>
                  <th className="py-3 px-5 font-medium">Name</th>
                  <th className="py-3 px-5 font-medium">Phone</th>
                  <th className="py-3 px-5 font-medium">Email</th>
                  <th className="py-3 px-5 font-medium">City</th>
                  <th className="py-3 px-5 font-medium">Status</th>
                  <th className="py-3 px-5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((e) => (
                  <tr key={e._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="py-3 px-5 text-gray-500 whitespace-nowrap">{formatDate(e.createdAt)}</td>
                    <td className="py-3 px-5 font-medium text-gray-700">{e.petName}</td>
                    <td className="py-3 px-5 text-gray-700">{e.name}</td>
                    <td className="py-3 px-5 text-gray-500">{e.phone}</td>
                    <td className="py-3 px-5 text-gray-500">{e.email}</td>
                    <td className="py-3 px-5 text-gray-500">{e.city}</td>
                    <td className="py-3 px-5">
                      <select
                        value={e.status}
                        onChange={(ev) => handleStatusChange(e._id, ev.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border-0 cursor-pointer ${STATUS_STYLES[e.status]}`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewTarget(e)}
                          className="w-9 h-9 rounded-lg bg-secondary-50 text-secondary-600 flex items-center justify-center hover:bg-secondary-100 transition"
                        >
                          <FiEye size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(e)}
                          className="w-9 h-9 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {enquiries.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-gray-400">
                      No enquiries found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination page={page} pages={pages} onChange={setPage} />

      {viewTarget && <DetailModal enquiry={viewTarget} onClose={() => setViewTarget(null)} />}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Enquiry"
        message="Are you sure you want to delete this enquiry? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
};

export default Enquiries;
