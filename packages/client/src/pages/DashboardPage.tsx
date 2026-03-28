import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { api } from '../api/client';
import type { Activity } from '../types';

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200">
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export function DashboardPage() {
  const { data: stats, refetch: refetchStats } = useApi(() => api.getStats(), []);
  const { data: activity, refetch: refetchActivity } = useApi<Activity[]>(() => api.getRecentActivity(), []);

  const handleRefresh = () => {
    refetchStats();
    refetchActivity();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back to CaseFlow</p>
        </div>
        <button
          onClick={handleRefresh}
          className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Customers" value={stats?.totalCustomers ?? 0} color="text-slate-900" />
        <StatCard label="Active Brands" value={stats?.activeBrands ?? 0} color="text-amber-500" />
        <StatCard label="Pending Requests" value={stats?.pendingRequests ?? 0} color="text-amber-600" />
        <StatCard label="Upcoming Events" value={stats?.upcomingEvents ?? 0} color="text-blue-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900">Quick Actions</h2>
          </div>
          <div className="p-6 grid grid-cols-2 gap-3">
            <Link
              to="/customers"
              className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-center"
            >
              <p className="font-medium text-slate-900">Add Customer</p>
              <p className="text-xs text-slate-500 mt-1">Create new customer</p>
            </Link>
            <Link
              to="/requests"
              className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-center"
            >
              <p className="font-medium text-slate-900">View Requests</p>
              <p className="text-xs text-slate-500 mt-1">POS pending items</p>
            </Link>
            <Link
              to="/events"
              className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-center"
            >
              <p className="font-medium text-slate-900">Schedule Event</p>
              <p className="text-xs text-slate-500 mt-1">Create new event</p>
            </Link>
            <Link
              to="/inventory"
              className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-center"
            >
              <p className="font-medium text-slate-900">Update Stock</p>
              <p className="text-xs text-slate-500 mt-1">Add inventory</p>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            {activity && activity.length > 0 ? (
              <ul className="space-y-3">
                {activity.map(a => (
                  <li key={a.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900">{a.description}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {new Date(a.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
