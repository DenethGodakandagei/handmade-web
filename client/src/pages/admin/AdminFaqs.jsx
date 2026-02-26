import React, { useEffect, useState } from 'react';
import { HelpCircle, RefreshCcw, Save, X, Power, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import DataTable from '@/components/DataTable';
import Spinner from '@/components/ui/Spinner';
import { toast } from 'sonner';
import faqService from '@/api/services/faqService';

const MAX_QUESTION = 100;
const MAX_ANSWER = 500;

const emptyForm = {
  question: '',
  answer: '',
  published: false,
  status: 'draft'
};

const AdminFaqs = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('newest');
  const [isDraft, setIsDraft] = useState(true);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const res = await faqService.getAllAdmin();
      const faqList = res.data?.faqs || [];
      setFaqs(faqList);
    } catch (err) {
      toast.error('Failed to fetch FAQ registry');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setIsDraft(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.question.trim() || !form.answer.trim()) {
      toast.warning('Question and answer are required');
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        await faqService.update(editingId, {
          ...form,
          published: false,
          status: isDraft ? 'draft' : 'pending'
        });
        toast.success('FAQ updated');
      } else {
        await faqService.create({
          ...form,
          published: false,
          status: isDraft ? 'draft' : 'pending'
        });
        toast.success('FAQ created');
      }
      resetForm();
      fetchFaqs();
    } catch (err) {
      toast.error('Failed to save FAQ');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (faq) => {
    setEditingId(faq._id);
    setForm({
      question: faq.question || '',
      answer: faq.answer || '',
      published: Boolean(faq.published),
      status: faq.status || (faq.published ? 'published' : 'draft')
    });
    setIsDraft((faq.status || (faq.published ? 'published' : 'draft')) === 'draft');
  };

  const handleDelete = async (faq) => {
    if (!window.confirm(`Delete FAQ: "${faq.question}"?`)) {
      return;
    }

    try {
      await faqService.delete(faq._id);
      toast.success('FAQ deleted');
      if (editingId === faq._id) {
        resetForm();
      }
      fetchFaqs();
    } catch (err) {
      toast.error('Failed to delete FAQ');
    }
  };

  const handleTogglePublish = async (faq) => {
    try {
      if (!faq.question?.trim() || !faq.answer?.trim()) {
        toast.warning('Fill question and answer before publishing');
        return;
      }
      await faqService.update(faq._id, {
        question: faq.question,
        answer: faq.answer,
        published: !faq.published,
        status: faq.published ? 'draft' : 'published'
      });
      toast.success(faq.published ? 'FAQ unpublished' : 'FAQ published');
      fetchFaqs();
    } catch (err) {
      toast.error('Failed to update publish status');
    }
  };

  const faqColumns = [
    {
      key: 'question',
      label: 'QUESTION',
      render: (val, row) => (
        <div className="space-y-2 max-w-xl">
          <p className="font-black text-sm text-gray-900">{val}</p>
          <p className="text-[10px] text-gray-400 font-semibold line-clamp-2">{row.answer}</p>
        </div>
      )
    },
    {
      key: 'published',
      label: 'STATUS',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className={`text-[8px] h-5 px-3 font-black border-none ${
              row.status === 'published'
                ? 'bg-emerald-100 text-emerald-700'
                : row.status === 'pending'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {row.status === 'published' ? 'Published' : row.status === 'pending' ? 'Pending' : 'Draft'}
          </Badge>
          <Button
            type="button"
            className="h-7 px-3 text-[9px] font-black rounded-none bg-black text-white hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap"
            onClick={() => handleTogglePublish(row)}
          >
            <Power size={12} className="mr-2" />
            {val ? 'Unpublish' : 'Publish'}
          </Button>
        </div>
      )
    },
    {
      key: 'updatedAt',
      label: 'LAST UPDATE',
      render: (val) => (
        <div className="space-y-1">
          <span className="block text-[10px] text-gray-900 font-black">{new Date(val).toLocaleDateString()}</span>
          <span className="block text-[8px] text-gray-400 font-bold">{new Date(val).toLocaleTimeString()}</span>
        </div>
      )
    }
  ];

  const filteredFaqs = faqs
    .filter((faq) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return (
      faq.question?.toLowerCase().includes(query) ||
      faq.answer?.toLowerCase().includes(query)
    );
    })
    .filter((faq) => {
      if (statusFilter === 'published') return faq.status === 'published' || faq.published === true;
      if (statusFilter === 'draft') return faq.status === 'draft';
      if (statusFilter === 'pending') return faq.status === 'pending';
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return dateFilter === 'oldest' ? dateA - dateB : dateB - dateA;
    });

  if (loading) {
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
          <h1 className="text-3xl font-light tracking-tight text-black">FAQ Registry</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-2">Curated Questions & Answers</p>
        </div>
        <Button
          onClick={fetchFaqs}
          className="bg-black text-white px-6 py-3 text-xs uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors rounded-none"
        >
          <RefreshCcw size={16} className="mr-2" />
          Synq FAQs
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
                <HelpCircle size={16} />
              </div>
              <div>
                <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-900">{editingId ? 'Edit FAQ' : 'Create FAQ'}</h2>
                <p className="text-[9px] uppercase tracking-widest text-gray-400">Publish control & clarity</p>
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
                {saving ? 'Saving...' : 'Save FAQ'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Question</label>
            <Input
              value={form.question}
              onChange={(e) => {
                const value = e.target.value;
                setForm((prev) => ({ ...prev, question: value }));
              }}
              maxLength={MAX_QUESTION}
              placeholder="What is the most selling item?"
              className="h-10 rounded-none border-gray-100 text-sm"
            />
            <div className="text-[9px] uppercase tracking-widest text-gray-400 text-right">
              {form.question.length}/{MAX_QUESTION}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Answer</label>
            <Textarea
              value={form.answer}
              onChange={(e) => {
                const value = e.target.value;
                setForm((prev) => ({ ...prev, answer: value }));
              }}
              maxLength={MAX_ANSWER}
              placeholder="Share the response that appears on the back of the card."
              className="min-h-[110px] rounded-none border-gray-100 text-sm"
            />
            <div className="text-[9px] uppercase tracking-widest text-gray-400 text-right">
              {form.answer.length}/{MAX_ANSWER}
            </div>
          </div>

          <div className="flex items-center justify-between bg-gray-50 px-4 py-2">
            <div>
              <p className="text-[9px] font-black text-gray-900">Draft</p>
              <p className="text-[8px] text-gray-400">Unpublished content</p>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={isDraft}
                onCheckedChange={(checked) => {
                  const nextDraft = Boolean(checked);
                  setIsDraft(nextDraft);
                  setForm((prev) => ({
                    ...prev,
                    published: false,
                    status: nextDraft ? 'draft' : 'pending'
                  }));
                }}
                className="cursor-pointer"
              />
              <span className="text-[9px] uppercase tracking-widest text-gray-500">Mark Draft</span>
            </div>
          </div>

          <div className="h-px bg-gray-100" />
        </form>

        <div className="bg-white rounded-none border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
              <Input
                placeholder="SEARCH FAQS..."
                className="pl-10 h-11 rounded-none border-gray-100 text-[9px] focus-visible:ring-black"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-11 px-4 border border-gray-100 text-[10px] font-bold bg-white text-gray-500 focus:outline-none rounded-none"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
              </select>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="h-11 px-4 border border-gray-100 text-[10px] font-bold bg-white text-gray-500 focus:outline-none rounded-none"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>
          <DataTable
            columns={faqColumns}
            data={filteredFaqs}
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

export default AdminFaqs;
