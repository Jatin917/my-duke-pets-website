import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({ page, pages, onChange }) => {
  if (pages <= 1) return null;

  const pageNumbers = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pages || Math.abs(p - page) <= 1
  );

  return (
    <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-primary-50 hover:text-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        <FiChevronLeft />
      </button>

      {pageNumbers.map((p, idx) => {
        const prev = pageNumbers[idx - 1];
        const showEllipsis = prev && p - prev > 1;
        return (
          <span key={p} className="flex items-center gap-2">
            {showEllipsis && <span className="text-gray-400 px-1">...</span>}
            <button
              onClick={() => onChange(p)}
              className={`w-10 h-10 rounded-xl font-medium transition ${
                p === page
                  ? 'btn-gradient text-white shadow-glow'
                  : 'border border-gray-200 text-gray-600 hover:bg-primary-50 hover:text-primary-600'
              }`}
            >
              {p}
            </button>
          </span>
        );
      })}

      <button
        onClick={() => onChange(Math.min(pages, page + 1))}
        disabled={page === pages}
        className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-primary-50 hover:text-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        <FiChevronRight />
      </button>
    </div>
  );
};

export default Pagination;
