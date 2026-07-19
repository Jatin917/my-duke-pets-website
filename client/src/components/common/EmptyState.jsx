import { FiInbox } from 'react-icons/fi';

const EmptyState = ({ title = 'Nothing found', message = 'Try adjusting your filters or search.', icon }) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-4">
    <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center text-primary-500 text-3xl mb-4">
      {icon || <FiInbox />}
    </div>
    <h3 className="text-xl font-semibold text-gray-800 mb-1">{title}</h3>
    <p className="text-gray-500 max-w-sm">{message}</p>
  </div>
);

export default EmptyState;
