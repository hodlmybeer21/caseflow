import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../api/client';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import type { Event, Customer } from '../types';

function EventModal({ open, onClose, customers, onSave }: {
  open: boolean;
  onClose: () => void;
  customers: Customer[];
  onSave: (data: Omit<Event, 'id'>) => Promise<void>;
}) {
  const [customerId, setCustomerId] = useState('');
  const [type, setType] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !type.trim() || !date) {
      setError('Customer, Type, and Date are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const customer = customers.find(c => c.id === Number(customerId));
      await onSave({
        customerId: Number(customerId),
        customerName: customer?.name || '',
        type: type.trim(),
        date,
        notes: notes.trim(),
      });
      onClose();
      setCustomerId('');
      setType('');
      setDate('');
      setNotes('');
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
      title="Create Event"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Event'}
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
        <Input
          label="Event Type"
          value={type}
          onChange={e => setType(e.target.value)}
          placeholder="e.g., Tasting, Promotion, Launch"
          required
        />
        <Input
          label="Date"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Event details..."
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </form>
    </Modal>
  );
}

export function EventsPage() {
  const { data: events = [], error, refetch } = useApi(() => api.getEvents(), []);
  const { data: customers = [] } = useApi(() => api.getCustomers(), []);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const filtered = events.filter(e =>
    e.customerName.toLowerCase().includes(search.toLowerCase()) ||
    e.type.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (data: Omit<Event, 'id'>) => {
    await api.createEvent(data);
    refetch();
  };

  const handleDelete = async (e: Event) => {
    if (confirm(`Delete this ${e.type} event?`)) {
      await api.deleteEvent(e.id);
      refetch();
    }
  };

  const columns = [
    { key: 'customerName', label: 'Customer', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (e: Event) => new Date(e.date).toLocaleDateString(),
    },
    { key: 'notes', label: 'Notes' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Events</h1>
          <p className="text-slate-500 mt-1">{events.length} scheduled events</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          + Create Event
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setView('list')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${view === 'list' ? 'bg-white shadow text-slate-900' : 'text-slate-600'}`}
          >
            List
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${view === 'calendar' ? 'bg-white shadow text-slate-900' : 'text-slate-600'}`}
          >
            Calendar
          </button>
        </div>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {view === 'list' ? (
        <DataTable
          columns={columns}
          data={filtered}
          onRowClick={setSelectedEvent}
          actions={e => (
            <button onClick={() => handleDelete(e)} className="text-xs text-red-600 hover:text-red-700">Delete</button>
          )}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-center text-slate-500">
            Calendar view — {events.length} events this month
          </p>
          <div className="mt-4 grid grid-cols-7 gap-2 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-xs font-medium text-slate-500 py-2">{d}</div>
            ))}
            {Array.from({ length: 35 }, (_, i) => {
              const dayEvents = events.filter(e => new Date(e.date).getDate() === i + 1);
              return (
                <div key={i} className="min-h-16 p-1 border border-slate-100 rounded text-xs">
                  <span className="text-slate-400">{i + 1}</span>
                  {dayEvents.slice(0, 2).map(e => (
                    <div key={e.id} className="mt-1 p-0.5 bg-amber-100 text-amber-700 rounded truncate">
                      {e.type}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Modal
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title="Event Details"
      >
        {selectedEvent && (
          <div className="space-y-3 text-sm">
            <p><strong>Customer:</strong> {selectedEvent.customerName}</p>
            <p><strong>Type:</strong> {selectedEvent.type}</p>
            <p><strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString()}</p>
            <p><strong>Notes:</strong> {selectedEvent.notes || 'No notes'}</p>
          </div>
        )}
      </Modal>

      <EventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        customers={customers}
        onSave={handleCreate}
      />
    </div>
  );
}
