import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({ page, pages, onChange }) => {
  if (pages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-primary-50 disabled:opacity-40 transition"
      >
        <FiChevronLeft />
      </button>
      <span className="text-sm text-gray-600 px-3">
        Page {page} of {pages}
      </span>
      <button
        onClick={() => onChange(Math.min(pages, page + 1))}
        disabled={page === pages}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-primary-50 disabled:opacity-40 transition"
      >
        <FiChevronRight />
      </button>
    </div>
  );
};

export default Pagination;
