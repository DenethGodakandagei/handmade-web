import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Users, Package, TrendingUp, CheckCircle2, Loader } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../api/axiosClient';

const EXPORTS = [
  { key: 'orders', label: 'Orders', desc: 'Complete order history with customer details, amounts, and shipping', icon: FileText, color: 'border-blue-200 bg-blue-50/20' },
  { key: 'users', label: 'Users', desc: 'All registered users with roles, seller status, and join dates', icon: Users, color: 'border-green-200 bg-green-50/20' },
  { key: 'products', label: 'Products', desc: 'Full product catalog with pricing, stock, artisan info, and ratings', icon: Package, color: 'border-purple-200 bg-purple-50/20' },
  { key: 'revenue', label: 'Revenue Report', desc: 'Daily revenue breakdown with order counts and averages', icon: TrendingUp, color: 'border-orange-200 bg-orange-50/20' }
];

const AdminExports = () => {
  const [exporting, setExporting] = useState(null);
  const [completed, setCompleted] = useState([]);

  const handleExport = async (type) => {
    setExporting(type);
    try {
      const res = await api.get(`/admin/ext/export/${type}`);
      const { csv, rows } = res.data;

      // Trigger CSV download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setCompleted(prev => [...prev, type]);
      toast.success(`Exported ${rows} ${type} rows`);
    } catch (err) {
      toast.error(`Export failed: ${err.response?.data?.message || 'Unknown error'}`);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <header className="border-b border-gray-100 pb-8">
        <h1 className="text-3xl font-light tracking-tight text-black">Export Center</h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-2">One-Click Data Exports — CSV Format</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {EXPORTS.map((exp, i) => {
          const Icon = exp.icon;
          const isExporting = exporting === exp.key;
          const isDone = completed.includes(exp.key);
          return (
            <motion.div
              key={exp.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`border p-8 bg-white ${exp.color} flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 border border-gray-200 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest">{exp.label}</h3>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">{exp.desc}</p>
              </div>
              <button
                onClick={() => handleExport(exp.key)}
                disabled={isExporting}
                className={`mt-6 flex items-center justify-center gap-2 w-full py-3 text-[10px] uppercase tracking-widest font-bold transition-colors ${isDone ? 'bg-green-600 text-white' : 'bg-black text-white hover:bg-gray-800'} disabled:opacity-50`}
              >
                {isExporting ? <Loader size={12} className="animate-spin" /> : isDone ? <CheckCircle2 size={12} /> : <Download size={12} />}
                {isExporting ? 'Generating...' : isDone ? 'Downloaded' : `Export ${exp.label}`}
              </button>
            </motion.div>
          );
        })}
      </div>

      <section className="border border-gray-200 p-6 bg-gray-50/30">
        <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-3">Export Notes</h3>
        <ul className="space-y-1.5 text-xs text-gray-500">
          <li>• All exports are downloaded as CSV files — compatible with Excel, Google Sheets, and most analytics tools</li>
          <li>• Every export is logged in the Audit Trail for accountability</li>
          <li>• Data reflects the current state of the database at the time of export</li>
          <li>• Large datasets may take a few seconds to generate</li>
        </ul>
      </section>
    </div>
  );
};

export default AdminExports;
