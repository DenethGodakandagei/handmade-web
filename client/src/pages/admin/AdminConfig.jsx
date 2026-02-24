import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Shield, ToggleLeft, ToggleRight, RefreshCcw, Save, AlertTriangle, Percent, Upload, Star, Palette, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import api from '../../api/axiosClient';
import Spinner from '@/components/ui/Spinner';

const ICON_MAP = {
  maintenance_mode: AlertTriangle,
  signup_freeze: Shield,
  commission_rate: Percent,
  default_currency: ShoppingBag,
  max_upload_size_mb: Upload,
  allow_reviews: Star,
  allow_customizations: Palette,
  allow_preorders: ShoppingBag
};

const COLOR_MAP = {
  maintenance_mode: 'text-red-500',
  signup_freeze: 'text-orange-500',
  commission_rate: 'text-green-500',
  default_currency: 'text-blue-500',
  max_upload_size_mb: 'text-purple-500',
  allow_reviews: 'text-yellow-500',
  allow_customizations: 'text-pink-500',
  allow_preorders: 'text-indigo-500'
};

const AdminConfig = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [editValues, setEditValues] = useState({});

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/config');
      setConfigs(res.data || []);
      // Initialize edit values
      const vals = {};
      (res.data || []).forEach(c => { vals[c.key] = c.value; });
      setEditValues(vals);
    } catch (err) {
      toast.error('Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConfig(); }, []);

  const handleToggle = async (key) => {
    const newVal = !editValues[key];
    setSaving(key);
    try {
      await api.put(`/admin/config/${key}`, { value: newVal });
      setEditValues(prev => ({ ...prev, [key]: newVal }));
      toast.success(`${key.replace(/_/g, ' ')} ${newVal ? 'enabled' : 'disabled'}`);
    } catch (err) {
      toast.error('Failed to update');
    } finally {
      setSaving(null);
    }
  };

  const handleSaveValue = async (key) => {
    setSaving(key);
    try {
      const config = configs.find(c => c.key === key);
      let val = editValues[key];
      if (config?.type === 'number') val = Number(val);
      await api.put(`/admin/config/${key}`, { value: val });
      toast.success('Configuration saved');
    } catch (err) {
      toast.error('Failed to save');
    } finally {
      setSaving(null);
    }
  };

  if (loading && configs.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)] w-full">
        <Spinner />
      </div>
    );
  }

  const booleanConfigs = configs.filter(c => c.type === 'boolean');
  const valueConfigs = configs.filter(c => c.type !== 'boolean');

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-black">Platform Config</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-2">Feature Flags & System-Wide Parameters</p>
        </div>
        <Button onClick={fetchConfig} className="bg-black text-white px-6 py-3 text-xs uppercase tracking-widest font-bold hover:bg-gray-800 rounded-none">
          <RefreshCcw size={14} className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Reload
        </Button>
      </header>

      {/* Feature Toggles */}
      <section>
        <div className="mb-6">
          <h3 className="text-lg font-light tracking-tight flex items-center gap-2">
            <Shield className="w-4 h-4 text-black" /> Feature Flags
          </h3>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mt-1">Toggle system behaviors in real-time</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {booleanConfigs.map((config, i) => {
            const IconComp = ICON_MAP[config.key] || Settings;
            const iconColor = COLOR_MAP[config.key] || 'text-black';
            const isOn = editValues[config.key];
            const isCritical = config.key === 'maintenance_mode' || config.key === 'signup_freeze';
            return (
              <motion.div
                key={config.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`border p-6 bg-white flex items-start justify-between gap-4 ${isCritical && isOn ? 'border-red-200 bg-red-50/20' : 'border-gray-200'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0`}>
                    <IconComp className={`w-4 h-4 ${iconColor}`} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-black">{config.label}</h4>
                    <p className="text-[10px] text-gray-400 mt-1 leading-relaxed uppercase tracking-widest font-bold">{config.description}</p>
                    {config.updatedBy && (
                      <p className="text-[9px] text-gray-300 mt-2 uppercase tracking-widest">Last modified by {config.updatedBy.name || 'System'}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(config.key)}
                  disabled={saving === config.key}
                  className="flex-shrink-0 transition-colors"
                >
                  {isOn ? (
                    <ToggleRight className={`w-10 h-10 ${isCritical ? 'text-red-500' : 'text-black'}`} />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-gray-300" />
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Value Parameters */}
      <section>
        <div className="mb-6">
          <h3 className="text-lg font-light tracking-tight flex items-center gap-2">
            <Settings className="w-4 h-4 text-black" /> System Parameters
          </h3>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mt-1">Adjust global operational thresholds</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {valueConfigs.map((config, i) => {
            const IconComp = ICON_MAP[config.key] || Settings;
            const iconColor = COLOR_MAP[config.key] || 'text-black';
            return (
              <motion.div
                key={config.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border border-gray-200 p-6 bg-white space-y-4"
              >
                <div className="flex items-center gap-3">
                  <IconComp className={`w-4 h-4 ${iconColor}`} />
                  <div>
                    <h4 className="text-sm font-bold text-black">{config.label}</h4>
                    <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">{config.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type={config.type === 'number' ? 'number' : 'text'}
                    value={editValues[config.key] ?? ''}
                    onChange={e => setEditValues(prev => ({ ...prev, [config.key]: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-200 text-sm font-mono focus:outline-none focus:border-black transition-colors"
                  />
                  <button
                    onClick={() => handleSaveValue(config.key)}
                    disabled={saving === config.key}
                    className="bg-black text-white px-4 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors"
                  >
                    {saving === config.key ? <RefreshCcw size={12} className="animate-spin" /> : <Save size={12} />}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default AdminConfig;
