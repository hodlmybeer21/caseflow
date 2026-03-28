import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../api/client';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import type { Transfer, Customer, Brand } from '../types';

function TransferModal({ open, onClose, customers, brands, onSave }: {
  open: boolean;
  onClose: () => void;
  customers: Customer[];
  brands: Brand[];
  onSave: (data: Omit<Transfer, 'id'>) => Promise<void>;
}) {
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromAccountId || !toAccountId || !brandId || !quantity || Number(quantity) <= 0) {
      setError('All fields are required with valid quantity');
      return;
    }
    if (fromAccountId === toAccountId) {
      setError('From and To accounts must be different');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const fromCustomer = customers.find(c => c.id === Number(fromAccountId));
      const toCustomer = customers.find(c => c.id === Number(toAccountId));
      const brand = brands.find(b => b.id === Number(brandId));
      await onSave({
        fromAccountId: Number(fromAccountId),
        fromAccountName: fromCustomer?.name || '',
        toAccountId: Number(toAccountId),
        toAccountName: toCustomer?.name || '',
        brandId: Number(brandId),
        brandName: brand?.name || '',
        quantity: Number(quantity),
        date: new Date().toISOString(),
      });
      onClose();
      setFromAccountId('');
      setToAccountId('');
      setBrandId('');
      setQuantity('');
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
      title="Create Transfer"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Transfer'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">From Account</label>
          <select
            value={fromAccountId}
            onChange={e => setFromAccountId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          >
            <option value="">Select account</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">To Account</label>
          <select
            value={toAccountId}
            onChange={e => setToAccountId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          >
            <option value="">Select account</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Brand</label>
          <select
            value={brandId}
            onChange={e => setBrandId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          >
            <option value="">Select brand</option>
            {brands.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        <Input
          label="Quantity"
          type="number"
          min="1"
          value={quantity}
          onChange={e => setQuantity(e.target.value)}
          placeholder="Enter quantity"
          required
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </form>
    </Modal>
  );
}

export function TransfersPage() {
  const { data: transfers = [], error, refetch } = useApi(() => api.getTransfers(), []);
  const { data: customers = [] } = useApi(() => api.getCustomers(), []);
  const { data: brands = [] } = useApi(() => api.getBrands(), []);
  const [modalOpen, setModalOpen] = useState(false);

  const handleCreate = async (data: Omit<Transfer, 'id'>) => {
    await api.createTransfer(data);
    refetch();
  };

  const columns = [
    { key: 'fromAccountName', label: 'From Account', sortable: true },
    { key: 'toAccountName', label: 'To Account', sortable: true },
    { key: 'brandName', label: 'Brand', sortable: true },
    { key: 'quantity', label: 'Quantity', sortable: true },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (t: Transfer) => new Date(t.date).toLocaleString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transfers</h1>
          <p className="text-slate-500 mt-1">{transfers.length} transfer records</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          + Create Transfer
        </Button>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <DataTable columns={columns} data={transfers} />

      <TransferModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        customers={customers}
        brands={brands}
        onSave={handleCreate}
      />
    </div>
  );
}
