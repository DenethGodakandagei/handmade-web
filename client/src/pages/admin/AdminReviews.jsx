import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare, Search, RefreshCcw, Trash2, Star,
    Eye, X, Pencil, Send, ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import reviewService from '../../api/services/reviewService';
import DataTable from '../../components/DataTable';
import Spinner from '@/components/ui/Spinner';

const StarDisplay = ({ rating, size = 12 }) => (
    <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
            <Star
                key={star}
                size={size}
                className={`${star <= rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-transparent text-gray-200'
                    }`}
            />
        ))}
    </div>
);

const StarInput = ({ rating, onRate, size = 24 }) => {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onRate(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    className="cursor-pointer hover:scale-125 transition-all duration-200"
                >
                    <Star
                        size={size}
                        className={`transition-all duration-200 ${star <= (hovered || rating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-transparent text-gray-200'
                            }`}
                    />
                </button>
            ))}
        </div>
    );
};

const AdminReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedReview, setSelectedReview] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editForm, setEditForm] = useState({ title: '', text: '', rating: 0 });
    const [saving, setSaving] = useState(false);
    const [filterRating, setFilterRating] = useState(0);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const res = await reviewService.getAll();
            setReviews(res.data || []);
        } catch (err) {
            toast.error('Failed to fetch reviews');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (review) => {
        if (window.confirm(`Delete review "${review.title}" by ${review.user?.name || 'Unknown'}?`)) {
            try {
                await reviewService.delete(review._id);
                toast.success('Review permanently removed');
                fetchReviews();
                if (selectedReview?._id === review._id) closeModal();
            } catch (err) {
                toast.error('Failed to delete review');
            }
        }
    };

    const handleView = (review) => {
        setSelectedReview(review);
        setEditMode(false);
        setShowModal(true);
    };

    const handleEditClick = (review) => {
        setSelectedReview(review);
        setEditForm({
            title: review.title,
            text: review.text,
            rating: review.rating,
        });
        setEditMode(true);
        setShowModal(true);
    };

    const handleEditSave = async () => {
        if (editForm.rating === 0) {
            toast.error('Please select a rating');
            return;
        }
        if (!editForm.title.trim() || !editForm.text.trim()) {
            toast.error('Please fill in all fields');
            return;
        }

        setSaving(true);
        try {
            await reviewService.update(selectedReview._id, editForm);
            toast.success('Review updated successfully');
            closeModal();
            fetchReviews();
        } catch (err) {
            toast.error('Failed to update review');
        } finally {
            setSaving(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedReview(null);
        setEditMode(false);
        setEditForm({ title: '', text: '', rating: 0 });
    };

    const filteredReviews = reviews.filter((r) => {
        const matchesSearch =
            r.title?.toLowerCase().includes(search.toLowerCase()) ||
            r.text?.toLowerCase().includes(search.toLowerCase()) ||
            r.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
            r.product?.name?.toLowerCase().includes(search.toLowerCase());
        const matchesRating = filterRating === 0 || r.rating === filterRating;
        return matchesSearch && matchesRating;
    });

    // Stats
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
        : '0.0';
    const fiveStarCount = reviews.filter((r) => r.rating === 5).length;
    const oneStarCount = reviews.filter((r) => r.rating <= 2).length;

    const statCards = [
        { label: 'Total Reviews', value: totalReviews, icon: MessageSquare, color: 'bg-blue-50 text-blue-600' },
        { label: 'Avg Rating', value: avgRating, icon: Star, color: 'bg-amber-50 text-amber-600' },
        { label: '5-Star Reviews', value: fiveStarCount, icon: Star, color: 'bg-green-50 text-green-600' },
        { label: 'Low Ratings', value: oneStarCount, icon: Star, color: 'bg-red-50 text-red-600' },
    ];

    const reviewColumns = [
        {
            key: 'rating',
            label: 'RATING',
            render: (val) => <StarDisplay rating={val} size={11} />,
        },
        {
            key: 'title',
            label: 'REVIEW TITLE',
            render: (val, row) => (
                <div className="space-y-1 max-w-[200px]">
                    <p className="font-bold text-sm tracking-tight truncate">{val}</p>
                    <p className="text-[10px] text-gray-400 truncate">{row.text}</p>
                </div>
            ),
        },
        {
            key: 'user',
            label: 'REVIEWER',
            render: (val) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-black text-gray-500 uppercase">
                            {val?.name?.charAt(0) || '?'}
                        </span>
                    </div>
                    <span className="text-xs font-semibold text-gray-800 truncate">
                        {val?.name || 'Unknown'}
                    </span>
                </div>
            ),
        },
        {
            key: 'product',
            label: 'PRODUCT',
            render: (val) => (
                <Badge
                    variant="outline"
                    className="text-[8px] h-5 px-3 uppercase tracking-widest font-black border-none bg-primary/10 text-primary max-w-[140px] truncate"
                >
                    {val?.name || 'Unknown'}
                </Badge>
            ),
        },
        {
            key: 'createdAt',
            label: 'DATE',
            render: (val) => (
                <div className="space-y-1">
                    <span className="block text-[10px] text-gray-900 font-black uppercase tracking-widest">
                        {new Date(val).toLocaleDateString()}
                    </span>
                    <span className="block text-[8px] text-gray-400 font-bold uppercase tracking-widest">
                        {new Date(val).toLocaleTimeString()}
                    </span>
                </div>
            ),
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-120px)] w-full">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
                <div>
                    <h1 className="text-3xl font-light tracking-tight text-black">Review Vault</h1>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-2">
                        Customer Feedback Management
                    </p>
                </div>
                <Button
                    onClick={fetchReviews}
                    className="bg-black text-white px-6 py-3 text-xs uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors rounded-none"
                >
                    <RefreshCcw size={16} className="mr-2" />
                    Sync Reviews
                </Button>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statCards.map((stat) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                                <stat.icon size={18} />
                            </div>
                        </div>
                        <p className="text-2xl font-light tracking-tight text-gray-900">{stat.value}</p>
                        <p className="text-[9px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-1">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-50 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        placeholder="SEARCH REVIEWS..."
                        className="w-full bg-gray-50 border-transparent focus:bg-white transition-all rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mr-1">Filter:</span>
                    {[0, 5, 4, 3, 2, 1].map((r) => (
                        <button
                            key={r}
                            onClick={() => setFilterRating(r)}
                            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${filterRating === r
                                    ? 'bg-black text-white'
                                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                                }`}
                        >
                            {r === 0 ? 'All' : `${r}★`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            {filteredReviews.length > 0 ? (
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
                    <DataTable
                        columns={reviewColumns}
                        data={filteredReviews}
                        isLoading={loading}
                        onEdit={handleEditClick}
                        onDelete={handleDelete}
                    />
                </div>
            ) : (
                <div className="h-96 flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-[2rem] space-y-4 bg-gray-50/50">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <MessageSquare size={24} className="text-gray-300" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-gray-900">No reviews found</h3>
                        <p className="text-gray-400 text-xs uppercase tracking-widest mt-1">
                            {search || filterRating ? 'Try adjusting your filters' : 'No reviews have been submitted yet'}
                        </p>
                    </div>
                </div>
            )}

            {/* View / Edit Modal */}
            <AnimatePresence>
                {showModal && selectedReview && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={(e) => e.target === e.currentTarget && closeModal()}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                                        {editMode ? <Pencil size={16} className="text-gray-500" /> : <Eye size={16} className="text-gray-500" />}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900">
                                            {editMode ? 'Edit Review' : 'Review Details'}
                                        </h3>
                                        <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">
                                            {selectedReview.product?.name || 'Unknown Product'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-2 text-gray-300 hover:text-black hover:bg-gray-50 rounded-xl transition-all"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-5">
                                {/* Reviewer info (always shown) */}
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                        <span className="text-base font-black text-gray-500 uppercase">
                                            {selectedReview.user?.name?.charAt(0) || '?'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{selectedReview.user?.name || 'Anonymous'}</p>
                                        <p className="text-[10px] text-gray-400">{selectedReview.user?.email || ''}</p>
                                    </div>
                                    <div className="ml-auto text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                        {new Date(selectedReview.createdAt).toLocaleDateString()}
                                    </div>
                                </div>

                                {editMode ? (
                                    <>
                                        {/* Edit Rating */}
                                        <div>
                                            <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">
                                                Rating
                                            </label>
                                            <StarInput
                                                rating={editForm.rating}
                                                onRate={(val) => setEditForm({ ...editForm, rating: val })}
                                            />
                                        </div>

                                        {/* Edit Title */}
                                        <div>
                                            <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">
                                                Title
                                            </label>
                                            <input
                                                type="text"
                                                value={editForm.title}
                                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                                maxLength={100}
                                                className="w-full bg-gray-50 border border-gray-100 px-4 py-3 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10"
                                            />
                                        </div>

                                        {/* Edit Text */}
                                        <div>
                                            <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">
                                                Review
                                            </label>
                                            <textarea
                                                rows={4}
                                                value={editForm.text}
                                                onChange={(e) => setEditForm({ ...editForm, text: e.target.value })}
                                                maxLength={500}
                                                className="w-full bg-gray-50 border border-gray-100 px-4 py-3 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 resize-none"
                                            />
                                            <p className="text-[10px] text-gray-300 text-right mt-1">{editForm.text.length}/500</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* View Rating */}
                                        <div>
                                            <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">
                                                Rating
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <StarDisplay rating={selectedReview.rating} size={18} />
                                                <span className="text-lg font-light text-gray-900">{selectedReview.rating}/5</span>
                                            </div>
                                        </div>

                                        {/* View Title */}
                                        <div>
                                            <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">
                                                Title
                                            </label>
                                            <p className="text-sm font-semibold text-gray-900">{selectedReview.title}</p>
                                        </div>

                                        {/* View Text */}
                                        <div>
                                            <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">
                                                Review
                                            </label>
                                            <p className="text-sm text-gray-600 leading-relaxed">{selectedReview.text}</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50/50">
                                {editMode ? (
                                    <div className="flex items-center gap-3 w-full justify-end">
                                        <Button
                                            onClick={() => setEditMode(false)}
                                            variant="outline"
                                            className="text-[10px] font-bold uppercase tracking-widest rounded-none h-10 px-6 border-gray-200"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleEditSave}
                                            disabled={saving}
                                            className="bg-black text-white hover:bg-gray-800 text-[10px] font-bold uppercase tracking-widest rounded-none h-10 px-8"
                                        >
                                            {saving ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <Send size={12} className="mr-2" />
                                                    Save Changes
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 w-full justify-end">
                                        <Button
                                            onClick={() => handleEditClick(selectedReview)}
                                            variant="outline"
                                            className="text-[10px] font-bold uppercase tracking-widest rounded-none h-10 px-6 border-gray-200"
                                        >
                                            <Pencil size={12} className="mr-2" />
                                            Edit
                                        </Button>
                                        <Button
                                            onClick={() => handleDelete(selectedReview)}
                                            className="bg-red-500 text-white hover:bg-red-600 text-[10px] font-bold uppercase tracking-widest rounded-none h-10 px-6"
                                        >
                                            <Trash2 size={12} className="mr-2" />
                                            Delete
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminReviews;
