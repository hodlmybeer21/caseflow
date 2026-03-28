import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../api/client';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Badge } from '../components/Badge';
import type { PromoStaff } from '../types';

function PromoStaffModal({ open, onClose, staff, onSave }: {
  open: boolean;
  onClose: () => void;
  staff?: PromoStaff;
  onSave: (data: Omit<PromoStaff, 'id'>) => Promise<void>;
}) {
  const [name, setName] = useState(staff?.name || '');
  const [eventAssignment, setEventAssignment] = useState(staff?.eventAssignment || '');
  const [status, setStatus] = useState<PromoStaff['status']>(staff?.status || 'available');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onSave({
        name: name.trim(),
        eventAssignment: eventAssignment.trim() || null,
        status,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={staff ? 'Edit Promo Staff' : 'Add Promo Staff'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Staff name"
          required
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as PromoStaff['status'])}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          >
            <option value="available">Available</option>
            <option value="assigned">Assigned</option>
            <option value="off">Off</option>
          </select>
        </div>
        <Input
          label="Event Assignment"
          value={eventAssignment}
          onChange={e => setEventAssignment(e.target.value)}
          placeholder="Assigned event (optional)"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </form>
    </Modal>
  );
}

export function PromoStaffPage() {
  const { data: staff = [], error, refetch } = useApi(() => api.getPromoStaff(), []);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PromoStaff | undefined>();

  const filtered = staff.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.eventAssignment && s.eventAssignment.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSave = async (data: Omit<PromoStaff, 'id'>) => {
    if (editing) {
      await api.updatePromoStaff(editing.id, data);
    } else {
      await api.createPromoStaff(data);
    }
    refetch();
    setEditing(undefined);
  };

  const handleUnassign = async (s: PromoStaff) => {
    await api.updatePromoStaff(s.id, { ...s, eventAssignment: null, status: 'available' });
    refetch();
  };

  const handleDelete = async (s: PromoStaff) => {
    if (confirm(`Delete ${s.name}?`)) {
      await api.deletePromoStaff(s.id);
      refetch();
    }
  };

  const statusVariant: Record<PromoStaff['status'], 'success' | 'warning' | 'default'> = {
    available: 'success',
    assigned: 'warning',
    off: 'default',
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'eventAssignment', label: 'Event Assignment' },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (s: PromoStaff) => (
        <Badge variant={statusVariant[s.status]}>
          {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Promo Staff</h1>
          <p className="text-slate-500 mt-1">{staff.length} staff members</p>
        </div>
        <Button onClick={() => { setEditing(undefined); setModalOpen(true); }}>
          + Add Staff
        </Button>
      </div>

      <div className="relative max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search staff..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <DataTable
        columns={columns}
        data={filtered}
        actions={s => (
          <div className="flex items-center justify-end gap-2">
            {s.eventAssignment && (
              <button onClick={() => handleUnassign(s)} className="text-xs text-blue-600 hover:text-blue-700">Unassign</button>
            )}
            <button onClick={() => { setEditing(s); setModalOpen(true); }} className="text-xs text-amber-600 hover:text-amber-700">Edit</button>
            <button onClick={() => handleDelete(s)} className="text-xs text-red-600 hover:text-red-700">Delete</button>
          </div>
        )}
      />

      <PromoStaffModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(undefined); }}
        staff={editing}
        onSave={handleSave}
      />
    </div>
  );
}
