import { useApi } from '../hooks/useApi';
import { api } from '../api/client';
import { DataTable } from '../components/DataTable';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import type { POSRequest } from '../types';

const statusVariant: Record<POSRequest['status'], 'warning' | 'info' | 'success'> = {
  pending: 'warning',
  approved: 'info',
  fulfilled: 'success',
};

export function RequestsPage() {
  const { data: requests = [], error, refetch, loading } = useApi(() => api.getRequests(), []);

  const handleApprove = async (r: POSRequest) => {
    await api.updateRequestStatus(r.id, 'approved');
    refetch();
  };

  const handleFulfill = async (r: POSRequest) => {
    await api.updateRequestStatus(r.id, 'fulfilled');
    refetch();
  };

  const columns = [
    { key: 'customerName', label: 'Customer', sortable: true },
    { key: 'brandName', label: 'Brand', sortable: true },
    { key: 'quantity', label: 'Quantity', sortable: true },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (r: POSRequest) => (
        <Badge variant={statusVariant[r.status]}>
          {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'requestedAt',
      label: 'Requested',
      sortable: true,
      render: (r: POSRequest) => new Date(r.requestedAt).toLocaleString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">POS Requests</h1>
          <p className="text-slate-500 mt-1">{requests.length} total requests</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">
            {requests.filter(r => r.status === 'pending').length} pending
          </span>
        </div>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <DataTable
        columns={columns}
        data={requests}
        actions={r => {
          if (r.status === 'pending') {
            return (
              <Button size="sm" onClick={() => handleApprove(r)}>
                Approve
              </Button>
            );
          }
          if (r.status === 'approved') {
            return (
              <Button size="sm" variant="secondary" onClick={() => handleFulfill(r)}>
                Fulfill
              </Button>
            );
          }
          return null;
        }}
      />
    </div>
  );
}
