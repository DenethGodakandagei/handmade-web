import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, User, ChevronDown, ChevronUp, Pencil, Trash2, X, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import reviewService from '../../api/services/reviewService';
import useAuthStore from '../../store/authStore';

const StarRating = ({ rating, onRate, size = 20, interactive = false }) => {
    const [hovered, setHovered] = useState(0);

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={!interactive}
                    onClick={() => interactive && onRate(star)}
                    onMouseEnter={() => interactive && setHovered(star)}
                    onMouseLeave={() => interactive && setHovered(0)}
                    className={`transition-all duration-200 ${interactive ? 'cursor-pointer hover:scale-125' : 'cursor-default'}`}
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

const ReviewCard = ({ review, currentUserId, onEdit, onDelete }) => {
    const isOwner = currentUserId === review.user?._id;
    const date = new Date(review.createdAt);
    const timeAgo = getTimeAgo(date);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="group border-b border-gray-50 py-8 last:border-none"
        >
            <div className="flex items-start gap-5">
                {/* Avatar */}
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-sm font-black text-gray-500 uppercase">
                        {review.user?.name?.charAt(0) || 'A'}
                    </span>
                </div>

                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-4 mb-2">
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-sm font-bold text-gray-900 tracking-tight">
                                {review.user?.name || 'Anonymous'}
                            </span>
                            <span className="text-[10px] text-gray-300 font-medium uppercase tracking-widest">
                                {timeAgo}
                            </span>
                        </div>

                        {isOwner && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => onEdit(review)}
                                    className="p-2 text-gray-300 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"
                                >
                                    <Pencil size={13} />
                                </button>
                                <button
                                    onClick={() => onDelete(review._id)}
                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                >
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Stars */}
                    <div className="mb-3">
                        <StarRating rating={review.rating} size={14} />
                    </div>

                    {/* Title */}
                    <h4 className="text-sm font-semibold text-gray-800 mb-1.5 tracking-tight">{review.title}</h4>

                    {/* Text */}
                    <p className="text-[13px] text-gray-500 leading-relaxed font-light">{review.text}</p>
                </div>
            </div>
        </motion.div>
    );
};

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = [
        { label: 'year', seconds: 31536000 },
        { label: 'month', seconds: 2592000 },
        { label: 'week', seconds: 604800 },
        { label: 'day', seconds: 86400 },
        { label: 'hour', seconds: 3600 },
        { label: 'minute', seconds: 60 },
    ];

    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count >= 1) return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
    return 'Just now';
}

const ReviewSection = ({ productId, averageRating }) => {
    const { user, isAuthenticated } = useAuthStore();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        text: '',
        rating: 0,
    });

    useEffect(() => {
        if (productId) fetchReviews();
    }, [productId]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const res = await reviewService.getByProduct(productId);
            setReviews(res.data || []);
        } catch (err) {
            console.error('Failed to fetch reviews', err);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ title: '', text: '', rating: 0 });
        setEditingReview(null);
        setShowForm(false);
    };

    const handleEdit = (review) => {
        setEditingReview(review);
        setFormData({
            title: review.title,
            text: review.text,
            rating: review.rating,
        });
        setShowForm(true);
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        try {
            await reviewService.delete(reviewId);
            toast.success('Review removed');
            fetchReviews();
        } catch (err) {
            toast.error(err?.message || 'Failed to delete review');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.rating === 0) {
            toast.error('Please select a rating');
            return;
        }
        if (!formData.title.trim() || !formData.text.trim()) {
            toast.error('Please fill in all fields');
            return;
        }

        setSubmitting(true);
        try {
            if (editingReview) {
                await reviewService.update(editingReview._id, formData);
                toast.success('Review updated successfully');
            } else {
                await reviewService.create(productId, formData);
                toast.success('Review submitted successfully');
            }
            resetForm();
            fetchReviews();
        } catch (err) {
            const message = err?.message || err?.error || 'Failed to submit review';
            if (message.includes('duplicate') || message.includes('E11000')) {
                toast.error('You have already reviewed this product');
            } else {
                toast.error(message);
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Rating summary
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
        : (averageRating?.toFixed(1) || '0.0');

    const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: reviews.filter((r) => r.rating === star).length,
        percentage: totalReviews > 0 ? (reviews.filter((r) => r.rating === star).length / totalReviews) * 100 : 0,
    }));

    const displayedReviews = showAll ? reviews : reviews.slice(0, 3);
    const userHasReviewed = reviews.some((r) => r.user?._id === user?._id);

    return (
        <div className="container mx-auto px-6 md:px-12 mt-20">
            {/* Section Header */}
            <div className="border-t border-gray-100 pt-16 pb-6">
                <div className="flex items-center gap-3 mb-2">
                    <MessageSquare size={18} className="text-gray-400" />
                    <h2 className="text-[11px] font-black uppercase tracking-[0.35em] text-gray-400">
                        Customer Reviews
                    </h2>
                </div>
                <h3 className="text-2xl md:text-3xl font-medium tracking-tight text-black">
                    What Our Patrons Say
                </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                {/* Left: Rating Summary */}
                <div className="lg:col-span-4">
                    <div className="bg-gradient-to-br from-gray-50/80 to-white p-8 rounded-3xl border border-gray-100 sticky top-32">
                        {/* Big Rating Display */}
                        <div className="text-center mb-8">
                            <div className="text-6xl font-light tracking-tight text-black mb-2">{avgRating}</div>
                            <StarRating rating={Math.round(parseFloat(avgRating))} size={18} />
                            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-bold mt-3">
                                {totalReviews} {totalReviews === 1 ? 'Review' : 'Reviews'}
                            </p>
                        </div>

                        {/* Rating Distribution */}
                        <div className="space-y-3">
                            {ratingDistribution.map(({ star, count, percentage }) => (
                                <div key={star} className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold text-gray-400 w-3 text-right">{star}</span>
                                    <Star size={11} className="fill-amber-400 text-amber-400" />
                                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ duration: 0.8, ease: 'easeOut' }}
                                            className="h-full bg-gradient-to-r from-amber-300 to-amber-400 rounded-full"
                                        />
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 w-6 text-right">{count}</span>
                                </div>
                            ))}
                        </div>

                        {/* Write Review Button */}
                        {isAuthenticated && !userHasReviewed && user?.role === 'user' && (
                            <Button
                                onClick={() => setShowForm(!showForm)}
                                className="w-full mt-8 bg-black text-white hover:bg-gray-800 text-[10px] font-black uppercase tracking-[0.3em] rounded-none h-12 transition-all"
                            >
                                Write a Review
                            </Button>
                        )}

                        {!isAuthenticated && (
                            <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest mt-8">
                                Sign in as a buyer to leave a review
                            </p>
                        )}

                        {userHasReviewed && !editingReview && (
                            <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest mt-8 flex items-center justify-center gap-2">
                                <Star size={10} className="fill-amber-400 text-amber-400" />
                                You've reviewed this product
                            </p>
                        )}
                    </div>
                </div>

                {/* Right: Reviews List */}
                <div className="lg:col-span-8">
                    {/* Review Form */}
                    <AnimatePresence>
                        {showForm && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <form
                                    onSubmit={handleSubmit}
                                    className="bg-white border border-gray-100 rounded-2xl p-8 mb-8 shadow-xl shadow-black/[0.02]"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
                                            {editingReview ? 'Edit Review' : 'Share Your Experience'}
                                        </h4>
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="p-2 text-gray-300 hover:text-black hover:bg-gray-50 rounded-xl transition-all"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>

                                    {/* Rating Selection */}
                                    <div className="mb-6">
                                        <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-3">
                                            Your Rating
                                        </label>
                                        <StarRating
                                            rating={formData.rating}
                                            onRate={(val) => setFormData({ ...formData, rating: val })}
                                            size={28}
                                            interactive
                                        />
                                    </div>

                                    {/* Title */}
                                    <div className="mb-5">
                                        <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">
                                            Review Title
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="Summarize your experience..."
                                            maxLength={100}
                                            className="w-full bg-gray-50/80 border border-gray-100 px-5 py-3.5 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-transparent transition-all placeholder:text-gray-300"
                                        />
                                    </div>

                                    {/* Text */}
                                    <div className="mb-6">
                                        <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">
                                            Your Review
                                        </label>
                                        <textarea
                                            rows={4}
                                            value={formData.text}
                                            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                                            placeholder="Tell us what you think about this product..."
                                            maxLength={500}
                                            className="w-full bg-gray-50/80 border border-gray-100 px-5 py-3.5 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-transparent transition-all resize-none placeholder:text-gray-300"
                                        />
                                        <p className="text-[10px] text-gray-300 text-right mt-1">{formData.text.length}/500</p>
                                    </div>

                                    {/* Submit */}
                                    <div className="flex justify-end gap-3">
                                        <Button
                                            type="button"
                                            onClick={resetForm}
                                            variant="outline"
                                            className="text-[10px] font-bold uppercase tracking-widest rounded-none h-11 px-6 border-gray-200"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={submitting}
                                            className="bg-black text-white hover:bg-gray-800 text-[10px] font-bold uppercase tracking-widest rounded-none h-11 px-8 transition-all"
                                        >
                                            {submitting ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <Send size={12} className="mr-2" />
                                                    {editingReview ? 'Update' : 'Submit'}
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Reviews List */}
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center space-y-4">
                            <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">
                                Loading reviews...
                            </span>
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="py-20 flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                                <MessageSquare size={24} className="text-gray-200" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 mb-1">No reviews yet</h4>
                                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                                    Be the first to share your experience
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <AnimatePresence mode="popLayout">
                                {displayedReviews.map((review) => (
                                    <ReviewCard
                                        key={review._id}
                                        review={review}
                                        currentUserId={user?._id}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </AnimatePresence>

                            {reviews.length > 3 && (
                                <div className="pt-6 flex justify-center">
                                    <button
                                        onClick={() => setShowAll(!showAll)}
                                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-black transition-colors py-3 px-6 hover:bg-gray-50 rounded-full"
                                    >
                                        {showAll ? (
                                            <>
                                                Show Less <ChevronUp size={14} />
                                            </>
                                        ) : (
                                            <>
                                                Show All {reviews.length} Reviews <ChevronDown size={14} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewSection;
