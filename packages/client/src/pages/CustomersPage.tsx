import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../api/client';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Badge } from '../components/Badge';
import type { Customer } from '../types';

function CustomerModal({ open, onClose, customer, onSave }: {
  open: boolean;
  onClose: () => void;
  customer?: Customer;
  onSave: (data: Omit<Customer, 'id' | 'createdAt'>) => Promise<void>;
}) {
  const [name, setName] = useState(customer?.name || '');
  const [repUsername, setRepUsername] = useState(customer?.repUsername || '');
  const [active, setActive] = useState(customer?.active ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !repUsername.trim()) {
      setError('Name and Rep Username are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onSave({ name: name.trim(), repUsername: repUsername.trim(), active });
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
      title={customer ? 'Edit Customer' : 'Add Customer'}
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
          placeholder="Customer name"
          required
        />
        <Input
          label="Rep Username"
          value={repUsername}
          onChange={e => setRepUsername(e.target.value)}
          placeholder="Assigned rep"
          required
        />
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={active}
            onChange={e => setActive(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
          />
          <span className="text-sm text-slate-700">Active</span>
        </label>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </form>
    </Modal>
  );
}

export function CustomersPage() {
  const { data: customers = [], loading, error, refetch } = useApi(() => api.getCustomers(), []);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | undefined>();

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.repUsername.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (data: Omit<Customer, 'id' | 'createdAt'>) => {
    if (editing) {
      await api.updateCustomer(editing.id, data);
    } else {
      await api.createCustomer(data);
    }
    refetch();
    setEditing(undefined);
  };

  const handleEdit = (c: Customer) => {
    setEditing(c);
    setModalOpen(true);
  };

  const handleDelete = async (c: Customer) => {
    if (confirm(`Delete customer "${c.name}"?`)) {
      await api.deleteCustomer(c.id);
      refetch();
    }
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'repUsername', label: 'Rep', sortable: true },
    {
      key: 'active',
      label: 'Status',
      sortable: true,
      render: (c: Customer) => (
        <Badge variant={c.active ? 'success' : 'default'}>
          {c.active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (c: Customer) => new Date(c.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-slate-500 mt-1">{customers.length} total customers</p>
        </div>
        <Button onClick={() => { setEditing(undefined); setModalOpen(true); }}>
          + Add Customer
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <DataTable
        columns={columns}
        data={filtered}
        actions={c => (
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => handleEdit(c)} className="text-xs text-amber-600 hover:text-amber-700">Edit</button>
            <button onClick={() => handleDelete(c)} className="text-xs text-red-600 hover:text-red-700">Delete</button>
          </div>
        )}
        expandedRow={c => (
          <div className="text-sm text-slate-600">
            <p><strong>ID:</strong> {c.id}</p>
            <p><strong>Created:</strong> {new Date(c.createdAt).toLocaleString()}</p>
          </div>
        )}
      />

      <CustomerModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(undefined); }}
        customer={editing}
        onSave={handleSave}
      />
    </div>
  );
}
