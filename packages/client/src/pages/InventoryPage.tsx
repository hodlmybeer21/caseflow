import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../api/client';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Badge } from '../components/Badge';
import type { Inventory, Brand } from '../types';

function AddStockModal({ open, onClose, brands, onSave }: {
  open: boolean;
  onClose: () => void;
  brands: Brand[];
  onSave: (brandId: number, quantity: number) => Promise<void>;
}) {
  const [brandId, setBrandId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandId || !quantity || Number(quantity) <= 0) {
      setError('Valid brand and quantity are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onSave(Number(brandId), Number(quantity));
      onClose();
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
      title="Add Stock"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Adding...' : 'Add Stock'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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

export function InventoryPage() {
  const { data: inventory = [], error, refetch } = useApi(() => api.getInventory(), []);
  const { data: brands = [] } = useApi(() => api.getBrands(), []);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = inventory.filter(i =>
    i.brandName.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddStock = async (brandId: number, quantity: number) => {
    await api.addStock(brandId, quantity);
    refetch();
  };

  const columns = [
    { key: 'brandName', label: 'Brand', sortable: true },
    {
      key: 'currentQuantity',
      label: 'Current Quantity',
      sortable: true,
      render: (i: Inventory) => {
        const isLow = i.currentQuantity < 10;
        return (
          <div className="flex items-center gap-2">
            <span className={isLow ? 'text-red-600 font-medium' : ''}>
              {i.currentQuantity}
            </span>
            {isLow && <Badge variant="danger">Low Stock</Badge>}
          </div>
        );
      },
    },
    {
      key: 'lastUpdated',
      label: 'Last Updated',
      sortable: true,
      render: (i: Inventory) => new Date(i.lastUpdated).toLocaleString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
          <p className="text-slate-500 mt-1">{inventory.length} items tracked</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          + Add Stock
        </Button>
      </div>

      <div className="relative max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search inventory..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <DataTable columns={columns} data={filtered} />

      <AddStockModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        brands={brands}
        onSave={handleAddStock}
      />
    </div>
  );
}
