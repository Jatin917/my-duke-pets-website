import { Link, Navigate } from 'react-router-dom';
import { FiLogOut, FiMail, FiPhone, FiUser } from 'react-icons/fi';
import SEO from '../components/common/SEO';
import Breadcrumb from '../components/common/Breadcrumb';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { SITE_NAME } from '../utils/constants';

const Account = () => {
  const { customer, isAuthenticated, logout } = useCustomerAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login?return_url=/account" replace />;
  }

  return (
    <>
      <SEO title="My Account" description={`Manage your ${SITE_NAME} account.`} />

      <div className="bg-gray-50 min-h-[70vh] pb-16">
        <div className="bg-white border-b border-gray-100 py-8">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumb items={[{ label: 'My Account' }]} />
            <h1 className="font-display text-3xl font-bold text-gray-800 mt-3">My Account</h1>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="bg-white rounded-3xl shadow-soft p-6 sm:p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-primary text-white flex items-center justify-center text-2xl">
                <FiUser />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {customer?.name || 'Pet Parent'}
                </h2>
                <p className="text-sm text-gray-500">Welcome back to {SITE_NAME}</p>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              {customer?.email && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                  <FiMail className="text-primary-500" />
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="text-sm font-medium text-gray-800">{customer.email}</p>
                  </div>
                </div>
              )}
              {customer?.phone && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                  <FiPhone className="text-primary-500" />
                  <div>
                    <p className="text-xs text-gray-400">Phone</p>
                    <p className="text-sm font-medium text-gray-800">+91 {customer.phone}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/pets"
                className="btn-gradient text-white font-semibold px-6 py-3 rounded-xl"
              >
                Browse Pets
              </Link>
              <button
                onClick={logout}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition"
              >
                <FiLogOut /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Account;
