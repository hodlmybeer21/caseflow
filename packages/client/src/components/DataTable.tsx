import { useState, type ReactNode } from 'react';

interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => ReactNode;
}

interface DataTableProps<T extends { id: number }> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  expandedRow?: (item: T) => ReactNode;
  actions?: (item: T) => ReactNode;
}

export function DataTable<T extends { id: number }>({
  columns,
  data,
  onRowClick,
  expandedRow,
  actions,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = (a as Record<string, unknown>)[sortKey];
    const bVal = (b as Record<string, unknown>)[sortKey];
    if (aVal === bVal) return 0;
    const cmp = String(aVal) < String(bVal) ? -1 : 1;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const handleRowClick = (item: T) => {
    if (expandedRow) {
      setExpandedId(expandedId === item.id ? null : item.id);
    }
    onRowClick?.(item);
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {columns.map(col => (
              <th
                key={String(col.key)}
                className={`px-4 py-3 text-left font-medium text-slate-600 ${col.sortable ? 'cursor-pointer hover:bg-slate-100 select-none' : ''}`}
                onClick={() => col.sortable && handleSort(String(col.key))}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && sortKey === String(col.key) && (
                    <span>{sortDir === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
            ))}
            {actions && <th className="px-4 py-3 text-right font-medium text-slate-600">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {sorted.map(item => (
            <>
              <tr
                key={item.id}
                className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${onRowClick || expandedRow ? 'cursor-pointer' : ''}`}
                onClick={() => handleRowClick(item)}
              >
                {columns.map(col => (
                  <td key={String(col.key)} className="px-4 py-3 text-slate-900">
                    {col.render
                      ? col.render(item)
                      : String((item as Record<string, unknown>)[String(col.key)] ?? '')}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                    {actions(item)}
                  </td>
                )}
              </tr>
              {expandedRow && expandedId === item.id && (
                <tr key={`${item.id}-expanded`} className="bg-slate-50">
                  <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-4">
                    {expandedRow(item)}
                  </td>
                </tr>
              )}
            </>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-8 text-center text-slate-500">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
