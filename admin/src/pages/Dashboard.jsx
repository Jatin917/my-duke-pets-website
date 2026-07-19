import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { FiPackage, FiTag, FiMail, FiClock, FiArrowRight } from 'react-icons/fi';
import StatCard from '../components/common/StatCard';
import Loader from '../components/common/Loader';
import { fetchDashboardStats } from '../services/enquiryService';
import { formatDate } from '../utils/formatters';

const STATUS_COLORS = {
  Pending: '#f59e0b',
  Contacted: '#3b82f6',
  Completed: '#22c55e',
  Rejected: '#ef4444',
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats()
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader full />;
  if (!stats) return null;

  const pieData = (stats.statusBreakdown || []).map((s) => ({
    name: s._id,
    value: s.count,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={FiPackage} label="Total Pets" value={stats.totalPets} color="from-primary-500 to-primary-600" delay={0} />
        <StatCard icon={FiTag} label="Total Categories" value={stats.totalCategories} color="from-secondary-500 to-secondary-600" delay={0.05} />
        <StatCard icon={FiMail} label="Total Enquiries" value={stats.totalEnquiries} color="from-emerald-500 to-emerald-600" delay={0.1} />
        <StatCard icon={FiClock} label="Pending Enquiries" value={stats.pendingEnquiries} color="from-amber-500 to-amber-600" delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-soft p-6">
          <h3 className="font-bold text-gray-800 mb-4">Enquiries — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={stats.enquiryTrend}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickFormatter={(d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                fontSize={12}
                stroke="#9ca3af"
              />
              <YAxis fontSize={12} stroke="#9ca3af" allowDecimals={false} />
              <Tooltip
                labelFormatter={(d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              />
              <Area type="monotone" dataKey="count" stroke="#f97316" strokeWidth={3} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-6">
          <h3 className="font-bold text-gray-800 mb-4">Enquiry Status</h3>
          {pieData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-16">No enquiries yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#a3a3a3'} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-soft p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">Latest Enquiries</h3>
          <Link to="/enquiries" className="text-sm text-primary-600 font-medium flex items-center gap-1 hover:gap-2 transition-all">
            View all <FiArrowRight />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="py-2.5 pr-4 font-medium">Name</th>
                <th className="py-2.5 pr-4 font-medium">Pet</th>
                <th className="py-2.5 pr-4 font-medium">Phone</th>
                <th className="py-2.5 pr-4 font-medium">Date</th>
                <th className="py-2.5 pr-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {(stats.latestEnquiries || []).map((e) => (
                <tr key={e._id} className="border-b border-gray-50 last:border-0">
                  <td className="py-3 pr-4 font-medium text-gray-700">{e.name}</td>
                  <td className="py-3 pr-4 text-gray-500">{e.petName}</td>
                  <td className="py-3 pr-4 text-gray-500">{e.phone}</td>
                  <td className="py-3 pr-4 text-gray-500">{formatDate(e.createdAt)}</td>
                  <td className="py-3 pr-4">
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{
                        backgroundColor: `${STATUS_COLORS[e.status]}20`,
                        color: STATUS_COLORS[e.status],
                      }}
                    >
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
              {(stats.latestEnquiries || []).length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    No enquiries yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
