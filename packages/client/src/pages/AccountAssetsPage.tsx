import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../api/client';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import type { AccountAsset, Customer, Brand } from '../types';

function AssetModal({ open, onClose, asset, customers, brands, onSave }: {
  open: boolean;
  onClose: () => void;
  asset?: AccountAsset;
  customers: Customer[];
  brands: Brand[];
  onSave: (data: Omit<AccountAsset, 'id'>) => Promise<void>;
}) {
  const [customerId, setCustomerId] = useState(asset?.customerId?.toString() || '');
  const [brandId, setBrandId] = useState(asset?.brandId?.toString() || '');
  const [assetType, setAssetType] = useState(asset?.assetType || '');
  const [serialNumber, setSerialNumber] = useState(asset?.serialNumber || '');
  const [placedDate, setPlacedDate] = useState(asset?.placedDate?.split('T')[0] || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !brandId || !assetType.trim() || !serialNumber.trim() || !placedDate) {
      setError('All fields are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const customer = customers.find(c => c.id === Number(customerId));
      const brand = brands.find(b => b.id === Number(brandId));
      await onSave({
        customerId: Number(customerId),
        customerName: customer?.name || '',
        brandId: Number(brandId),
        brandName: brand?.name || '',
        assetType: assetType.trim(),
        serialNumber: serialNumber.trim(),
        placedDate,
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
      title={asset ? 'Edit Asset' : 'Add Asset'}
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
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Customer</label>
          <select
            value={customerId}
            onChange={e => setCustomerId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          >
            <option value="">Select customer</option>
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
          label="Asset Type"
          value={assetType}
          onChange={e => setAssetType(e.target.value)}
          placeholder="e.g., Cooler, Display, Tap"
          required
        />
        <Input
          label="Serial Number"
          value={serialNumber}
          onChange={e => setSerialNumber(e.target.value)}
          placeholder="Serial number"
          required
        />
        <Input
          label="Placed Date"
          type="date"
          value={placedDate}
          onChange={e => setPlacedDate(e.target.value)}
          required
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </form>
    </Modal>
  );
}

export function AccountAssetsPage() {
  const { data: assets = [], error, refetch } = useApi(() => api.getAccountAssets(), []);
  const { data: customers = [] } = useApi(() => api.getCustomers(), []);
  const { data: brands = [] } = useApi(() => api.getBrands(), []);
  const [customerFilter, setCustomerFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AccountAsset | undefined>();

  const filtered = assets.filter(a => {
    const matchesCustomer = !customerFilter || a.customerId === Number(customerFilter);
    const matchesBrand = !brandFilter || a.brandId === Number(brandFilter);
    return matchesCustomer && matchesBrand;
  });

  const handleSave = async (data: Omit<AccountAsset, 'id'>) => {
    if (editing) {
      await api.updateAccountAsset(editing.id, data);
    } else {
      await api.createAccountAsset(data);
    }
    refetch();
    setEditing(undefined);
  };

  const handleDelete = async (a: AccountAsset) => {
    if (confirm(`Delete this ${a.assetType} asset?`)) {
      await api.deleteAccountAsset(a.id);
      refetch();
    }
  };

  const columns = [
    { key: 'customerName', label: 'Customer', sortable: true },
    { key: 'brandName', label: 'Brand', sortable: true },
    { key: 'assetType', label: 'Asset Type', sortable: true },
    { key: 'serialNumber', label: 'Serial Number', sortable: true },
    {
      key: 'placedDate',
      label: 'Placed Date',
      sortable: true,
      render: (a: AccountAsset) => new Date(a.placedDate).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Account Assets</h1>
          <p className="text-slate-500 mt-1">{assets.length} tracked assets</p>
        </div>
        <Button onClick={() => { setEditing(undefined); setModalOpen(true); }}>
          + Add Asset
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <select
          value={customerFilter}
          onChange={e => setCustomerFilter(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
        >
          <option value="">All Customers</option>
          {customers.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={brandFilter}
          onChange={e => setBrandFilter(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
        >
          <option value="">All Brands</option>
          {brands.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <DataTable
        columns={columns}
        data={filtered}
        actions={a => (
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => { setEditing(a); setModalOpen(true); }} className="text-xs text-amber-600 hover:text-amber-700">Edit</button>
            <button onClick={() => handleDelete(a)} className="text-xs text-red-600 hover:text-red-700">Delete</button>
          </div>
        )}
      />

      <AssetModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(undefined); }}
        asset={editing}
        customers={customers}
        brands={brands}
        onSave={handleSave}
      />
    </div>
  );
}
