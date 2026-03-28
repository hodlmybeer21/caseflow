import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../api/client';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import type { Brand } from '../types';

function BrandModal({ open, onClose, brand, onSave }: {
  open: boolean;
  onClose: () => void;
  brand?: Brand;
  onSave: (data: Omit<Brand, 'id' | 'createdAt'>) => Promise<void>;
}) {
  const [name, setName] = useState(brand?.name || '');
  const [category, setCategory] = useState(brand?.category || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category.trim()) {
      setError('Name and Category are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onSave({ name: name.trim(), category: category.trim() });
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
      title={brand ? 'Edit Brand' : 'Add Brand'}
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
          placeholder="Brand name"
          required
        />
        <Input
          label="Category"
          value={category}
          onChange={e => setCategory(e.target.value)}
          placeholder="e.g., Beer, Wine, Spirits"
          required
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </form>
    </Modal>
  );
}

export function BrandsPage() {
  const { data: brands = [], error, refetch } = useApi(() => api.getBrands(), []);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | undefined>();

  const categories = [...new Set(brands.map(b => b.category))];
  const filtered = brands.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || b.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSave = async (data: Omit<Brand, 'id' | 'createdAt'>) => {
    if (editing) {
      await api.updateBrand(editing.id, data);
    } else {
      await api.createBrand(data);
    }
    refetch();
    setEditing(undefined);
  };

  const handleDelete = async (b: Brand) => {
    if (confirm(`Delete brand "${b.name}"?`)) {
      await api.deleteBrand(b.id);
      refetch();
    }
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (b: Brand) => new Date(b.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Brands</h1>
          <p className="text-slate-500 mt-1">{brands.length} total brands</p>
        </div>
        <Button onClick={() => { setEditing(undefined); setModalOpen(true); }}>
          + Add Brand
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search brands..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <DataTable
        columns={columns}
        data={filtered}
        actions={b => (
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => { setEditing(b); setModalOpen(true); }} className="text-xs text-amber-600 hover:text-amber-700">Edit</button>
            <button onClick={() => handleDelete(b)} className="text-xs text-red-600 hover:text-red-700">Delete</button>
          </div>
        )}
      />

      <BrandModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(undefined); }}
        brand={editing}
        onSave={handleSave}
      />
    </div>
  );
}
