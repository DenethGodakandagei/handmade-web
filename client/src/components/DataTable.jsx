import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronUp, Edit2, Trash2, Heart, MoreHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

const DataTable = ({
  columns,
  data,
  onEdit,
  onDelete,
  onFavorite,
  isLoading,
  hideSearch
}) => {
  const hasBuiltInActions = !!(onEdit || onDelete || onFavorite);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState(null);

  // Sorting & Filtering
  const filteredSortedData = React.useMemo(() => {
    let items = [...data];

    if (searchTerm) {
      items = items.filter(item =>
        Object.values(item).some(val =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (sortConfig !== null) {
      items.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [data, sortConfig, searchTerm]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="w-full bg-white border border-gray-100 overflow-hidden rounded-none">
      {/* Header / Toolbar */}
      {!hideSearch && (
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
            <Input
              placeholder="SEARCH RECORDS..."
              className="pl-10 h-11 rounded-none border-gray-100 text-[10px] uppercase font-bold tracking-widest focus-visible:ring-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="hover:bg-transparent border-gray-100">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={`px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors text-[10px] font-bold uppercase tracking-widest text-gray-400 h-14 ${col.className}`}
                  onClick={() => requestSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortConfig?.key === col.key && (
                      sortConfig.direction === 'ascending' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </div>
                </TableHead>
              ))}
              {hasBuiltInActions && (
                <TableHead className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-gray-400">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="wait">
              {isLoading ? (
                <TableRow className="hover:bg-transparent border-gray-50">
                  <TableCell colSpan={columns.length + 1} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-8 h-8 border-2 border-black/10 border-t-black rounded-full animate-spin"></div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Accessing Archives...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredSortedData.length === 0 ? (
                <TableRow className="hover:bg-transparent border-gray-50">
                  <TableCell colSpan={columns.length + 1} className="px-6 py-20 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300 italic">Historical data not found</span>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSortedData.map((row, idx) => (
                  <motion.tr
                    key={row._id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    {columns.map((col) => (
                      <TableCell key={col.key} className={`px-6 py-4 text-xs font-medium text-gray-900 ${col.className}`}>
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </TableCell>
                    ))}
                    {hasBuiltInActions && (
                      <TableCell className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          {onFavorite && (
                            <button
                              onClick={() => onFavorite(row)}
                              className={`p-2 hover:bg-white border border-transparent hover:border-gray-100 transition-all ${row.isFavorite ? 'text-red-500' : 'text-gray-300'}`}
                            >
                              <Heart size={14} fill={row.isFavorite ? "currentColor" : "none"} />
                            </button>
                          )}
                          {onEdit && (
                            <button
                              onClick={() => onEdit(row)}
                              className="p-2 text-gray-400 hover:text-black hover:bg-white border border-transparent hover:border-gray-100 transition-all"
                            >
                              <Edit2 size={14} />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(row)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-white border border-transparent hover:border-gray-100 transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                          <button className="p-2 text-gray-300">
                            <MoreHorizontal size={14} />
                          </button>
                        </div>
                      </TableCell>
                    )}
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DataTable;
