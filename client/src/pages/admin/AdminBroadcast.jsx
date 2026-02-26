import React, { useEffect, useMemo, useState } from 'react';
import { Megaphone, RefreshCcw, Save, X, Search, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import DataTable from '@/components/DataTable';
import Spinner from '@/components/ui/Spinner';
import { toast } from 'sonner';
import announcementService from '@/api/services/announcementService';

const MAX_TITLE = 120;
const MAX_BODY = 800;

const AUDIENCES = [
  { value: 'all', label: 'Everyone' },
  { value: 'buyers', label: 'Buyers' },
  { value: 'artisans', label: 'Artisans' }
];

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'urgent', label: 'Urgent' }
];

const emptyForm = {
  title: '',
  body: '',
  audience: 'all',
  priority: 'normal'
};

const AdminBroadcast = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [audienceFilter, setAudienceFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('newest');
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await announcementService.getAdmin();
      setAnnouncements(res.data?.announcements || []);
      setStats(res.data?.registry || { total: 0, active: 0, inactive: 0 });
    } catch (err) {
      toast.error(err?.message || 'Failed to fetch broadcast registry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const title = form.title.trim();
    const body = form.body.trim();
    if (!title || !body) {
      toast.warning('Title and message are required');
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        const res = await announcementService.update(editingId, {
          title,
          body,
          audience: form.audience,
          priority: form.priority
        });
        toast.success(`Broadcast updated for ${res.data?.affectedCount || 0} users`);
      } else {
        const res = await announcementService.create({
          title,
          body,
          audience: form.audience,
          priority: form.priority
        });
        toast.success(`Broadcast sent to ${res.data?.affectedCount || 0} users`);
      }
      resetForm();
      fetchAnnouncements();
    } catch (err) {
      toast.error(err?.message || 'Failed to save broadcast');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (announcement) => {
    setEditingId(announcement._id);
    setForm({
      title: announcement.title || '',
      body: announcement.body || '',
      audience: announcement.audience || 'all',
      priority: announcement.priority || 'normal'
    });
  };

  const handleDelete = async (announcement) => {
    if (!window.confirm(`Delete broadcast "${announcement.title}"?`)) return;

    try {
      await announcementService.delete(announcement._id);
      toast.success('Broadcast deleted');
      if (editingId === announcement._id) {
        resetForm();
      }
      fetchAnnouncements();
    } catch (err) {
      toast.error(err?.message || 'Failed to delete broadcast');
    }
  };

  const handleToggle = async (announcement) => {
    try {
      await announcementService.update(announcement._id, { active: !announcement.active });
      toast.success(announcement.active ? 'Broadcast hidden from users' : 'Broadcast visible to users');
      fetchAnnouncements();
    } catch (err) {
      toast.error(err?.message || 'Failed to change visibility');
    }
  };

  const filteredAnnouncements = useMemo(() => {
    return announcements
      .filter((announcement) => {
        const query = search.trim().toLowerCase();
        if (!query) return true;
        return (
          announcement.title?.toLowerCase().includes(query) ||
          announcement.body?.toLowerCase().includes(query)
        );
      })
      .filter((announcement) => {
        if (statusFilter === 'active') return announcement.active === true;
        if (statusFilter === 'inactive') return announcement.active === false;
        return true;
      })
      .filter((announcement) => (audienceFilter === 'all' ? true : announcement.audience === audienceFilter))
      .filter((announcement) => (priorityFilter === 'all' ? true : announcement.priority === priorityFilter))
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return dateFilter === 'oldest' ? dateA - dateB : dateB - dateA;
      });
  }, [announcements, search, statusFilter, audienceFilter, priorityFilter, dateFilter]);

  const columns = [
    {
      key: 'title',
      label: 'BROADCAST',
      render: (title, row) => (
        <div className="space-y-2 max-w-xl">
          <p className="font-black text-sm text-gray-900">{title}</p>
          <p className="text-[10px] text-gray-400 font-semibold line-clamp-2">{row.body}</p>
        </div>
      )
    },
    {
      key: 'audience',
      label: 'AUDIENCE',
      render: (audience) => (
        <Badge
          variant="outline"
          className="text-[8px] h-5 px-3 font-black border-none bg-gray-100 text-gray-700 uppercase"
        >
          {audience}
        </Badge>
      )
    },
    {
      key: 'priority',
      label: 'PRIORITY',
      render: (priority) => (
        <Badge
          variant="outline"
          className={`text-[8px] h-5 px-3 font-black border-none uppercase ${
            priority === 'urgent'
              ? 'bg-red-100 text-red-700'
              : priority === 'normal'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {priority}
        </Badge>
      )
    },
    {
      key: 'active',
      label: 'VISIBILITY',
      render: (active, row) => (
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className={`text-[8px] h-5 px-3 font-black border-none ${
              active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'
            }`}
          >
            {active ? 'Visible' : 'Hidden'}
          </Badge>
          <Button
            type="button"
            className="h-7 px-3 text-[9px] font-black rounded-none bg-black text-white hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap"
            onClick={() => handleToggle(row)}
          >
            {active ? <EyeOff size={12} className="mr-2" /> : <Eye size={12} className="mr-2" />}
            {active ? 'Hide' : 'Show'}
          </Button>
        </div>
      )
    },
    {
      key: 'updatedAt',
      label: 'LAST UPDATE',
      render: (value, row) => {
        const date = value || row.createdAt;
        return (
          <div className="space-y-1">
            <span className="block text-[10px] text-gray-900 font-black">{new Date(date).toLocaleDateString()}</span>
            <span className="block text-[8px] text-gray-400 font-bold">{new Date(date).toLocaleTimeString()}</span>
          </div>
        );
      }
    }
  ];

  if (loading && !announcements.length) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)] w-full">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-black">Broadcast Registry</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-2">
            Platform Announcements & Visibility Control
          </p>
        </div>
        <Button
          onClick={fetchAnnouncements}
          className="bg-black text-white px-6 py-3 text-xs uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors rounded-none"
        >
          <RefreshCcw size={16} className="mr-2" />
          Synq Broadcasts
        </Button>
      </header>

      <div className="space-y-10">
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-100 rounded-none shadow-xl shadow-black/5 p-6 space-y-4"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Megaphone size={16} />
              </div>
              <div>
                <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-900">
                  {editingId ? 'Edit Broadcast' : 'Create Broadcast'}
                </h2>
                <p className="text-[9px] uppercase tracking-widest text-gray-400">Audience targeting & delivery status</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {editingId && (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-[9px] uppercase tracking-widest font-black text-gray-400 rounded-none h-9 px-3"
                  onClick={resetForm}
                >
                  <X size={14} className="mr-2" />
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                className="h-9 px-4 rounded-none bg-black text-white text-[9px] uppercase tracking-widest font-black hover:bg-gray-800 transition-colors"
                disabled={saving}
              >
                <Save size={14} className="mr-2" />
                {saving ? 'Saving...' : editingId ? 'Update Broadcast' : 'Send Broadcast'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Title</label>
            <Input
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              maxLength={MAX_TITLE}
              placeholder="Delivery update, platform notice, urgent advisory..."
              className="h-10 rounded-none border-gray-100 text-sm"
            />
            <div className="text-[9px] uppercase tracking-widest text-gray-400 text-right">
              {form.title.length}/{MAX_TITLE}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Message</label>
            <Textarea
              value={form.body}
              onChange={(event) => setForm((prev) => ({ ...prev, body: event.target.value }))}
              maxLength={MAX_BODY}
              placeholder="Write the broadcast message shown to users."
              className="min-h-[110px] rounded-none border-gray-100 text-sm"
            />
            <div className="text-[9px] uppercase tracking-widest text-gray-400 text-right">
              {form.body.length}/{MAX_BODY}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Audience</label>
              <select
                value={form.audience}
                onChange={(event) => setForm((prev) => ({ ...prev, audience: event.target.value }))}
                className="h-11 px-4 border border-gray-100 text-[10px] font-bold bg-white text-gray-500 focus:outline-none rounded-none w-full"
              >
                {AUDIENCES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Priority</label>
              <select
                value={form.priority}
                onChange={(event) => setForm((prev) => ({ ...prev, priority: event.target.value }))}
                className="h-11 px-4 border border-gray-100 text-[10px] font-bold bg-white text-gray-500 focus:outline-none rounded-none w-full"
              >
                {PRIORITIES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="h-px bg-gray-100" />
        </form>

        <div className="bg-white rounded-none border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
          <div className="px-6 pt-5 pb-3 border-b border-gray-100 flex flex-wrap items-center gap-5 text-[9px] uppercase tracking-widest font-black text-gray-400">
            <span>Total: <span className="text-gray-900">{stats.total}</span></span>
            <span>Visible: <span className="text-emerald-700">{stats.active}</span></span>
            <span>Hidden: <span className="text-gray-500">{stats.inactive}</span></span>
          </div>
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
              <Input
                placeholder="SEARCH BROADCASTS..."
                className="pl-10 h-11 rounded-none border-gray-100 text-[9px] focus-visible:ring-black"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-11 px-4 border border-gray-100 text-[10px] font-bold bg-white text-gray-500 focus:outline-none rounded-none"
              >
                <option value="all">All Visibility</option>
                <option value="active">Visible</option>
                <option value="inactive">Hidden</option>
              </select>
              <select
                value={audienceFilter}
                onChange={(event) => setAudienceFilter(event.target.value)}
                className="h-11 px-4 border border-gray-100 text-[10px] font-bold bg-white text-gray-500 focus:outline-none rounded-none"
              >
                <option value="all">All Audiences</option>
                <option value="buyers">Buyers</option>
                <option value="artisans">Artisans</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value)}
                className="h-11 px-4 border border-gray-100 text-[10px] font-bold bg-white text-gray-500 focus:outline-none rounded-none"
              >
                <option value="all">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
              <select
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                className="h-11 px-4 border border-gray-100 text-[10px] font-bold bg-white text-gray-500 focus:outline-none rounded-none"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filteredAnnouncements}
            isLoading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            showSearch={false}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminBroadcast;
