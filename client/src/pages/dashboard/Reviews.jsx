import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Eye, Star, MessageSquare, Package, ArrowRight } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import reviewService from '@/api/services/reviewService';
import productService from '@/api/services/productService';
import useAuthStore from '@/store/authStore';
import DataTable from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';

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

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
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

const Reviews = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [allProducts, setAllProducts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [productSearch, setProductSearch] = useState('');
    const [filterRating, setFilterRating] = useState(0);
    const [activeTab, setActiveTab] = useState('products'); // 'products' or 'reviews'
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        try {
            setIsLoading(true);

            // Fetch products from the database, filtering by artisan if applicable
            const queryParams = { limit: 1000 };
            if (user?.role === 'artisan') {
                queryParams.artisan = user._id || user.id;
            }
            const prodRes = await productService.getAll(queryParams);
            const products = Array.isArray(prodRes.data)
                ? prodRes.data
                : prodRes.data?.products || [];
            setAllProducts(products);

            // Fetch all reviews
            try {
                const revRes = await reviewService.getAll();
                let allReviews = Array.isArray(revRes.data)
                    ? revRes.data
                    : revRes.data?.reviews || revRes.data || [];

                // If the user is an artisan, filter reviews to only show those for their products
                if (user?.role === 'artisan') {
                    const myProductIds = new Set(products.map(p => (p._id || p.id).toString()));
                    allReviews = allReviews.filter(r => {
                        const rProductId = (r.product?._id || r.product)?.toString();
                        return myProductIds.has(rProductId);
                    });
                }

                setReviews(allReviews);
            } catch {
                // If getAll fails, try fetching per product
                let allReviews = [];
                for (const product of products) {
                    try {
                        const revRes = await reviewService.getByProduct(product._id);
                        const productReviews = revRes.data || [];
                        allReviews.push(...productReviews);
                    } catch {
                        // skip
                    }
                }
                setReviews(allReviews);
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (row) => {
        if (window.confirm(`Are you sure you want to delete this review "${row.title}"?`)) {
            try {
                await reviewService.delete(row._id);
                setReviews(reviews.filter(r => r._id !== row._id));
                toast.success('Review deleted successfully');
            } catch (error) {
                console.error("Failed to delete review", error);
                toast.error('Failed to delete review');
            }
        }
    };

    // Filter products by search
    const filteredProducts = allProducts.filter(product =>
        product.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
        product.category?.name?.toLowerCase().includes(productSearch.toLowerCase())
    );

    // Get review count for a product
    const getProductReviewCount = (productId) =>
        reviews.filter(r => (r.product?._id || r.product) === productId).length;

    const getProductAvgRating = (productId) => {
        const productReviews = reviews.filter(r => (r.product?._id || r.product) === productId);
        if (productReviews.length === 0) return 0;
        return (productReviews.reduce((acc, r) => acc + r.rating, 0) / productReviews.length).toFixed(1);
    };

    // Filter reviews
    const filteredReviews = reviews.filter(review => {
        const matchesSearch =
            review.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            review.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            review.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            review.product?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRating = filterRating === 0 || review.rating === filterRating;
        return matchesSearch && matchesRating;
    });

    // Stats
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
        : '0.0';
    const fiveStarCount = reviews.filter((r) => r.rating === 5).length;
    const lowRatingCount = reviews.filter((r) => r.rating <= 2).length;

    const reviewColumns = [
        {
            key: 'rating',
            label: 'Rating',
            render: (val) => (
                <div className="flex items-center gap-2">
                    <StarDisplay rating={val} size={11} />
                    <span className="text-[10px] font-bold text-gray-400">{val}/5</span>
                </div>
            )
        },
        {
            key: 'title',
            label: 'Review Title',
            render: (val, row) => (
                <div>
                    <p className="text-sm font-bold text-gray-900">{val}</p>
                    <p className="text-[10px] text-gray-400 truncate max-w-[200px]">{row.text}</p>
                </div>
            )
        },
        {
            key: 'user',
            label: 'Reviewer',
            render: (val) => (
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
                        <span className="text-[10px] font-black text-gray-500 uppercase">
                            {val?.name?.charAt(0) || '?'}
                        </span>
                    </div>
                    <span className="text-xs font-semibold text-gray-800">
                        {val?.name || 'Unknown'}
                    </span>
                </div>
            )
        },
        {
            key: 'product',
            label: 'Product',
            render: (val) => (
                <Badge
                    variant="outline"
                    className="text-[8px] h-5 px-3 uppercase tracking-widest font-black border-none bg-primary/10 text-primary max-w-[140px] truncate"
                >
                    {val?.name || 'Unknown'}
                </Badge>
            )
        },
        {
            key: 'createdAt',
            label: 'Date',
            render: (val) => (
                <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-gray-900">
                        {new Date(val).toLocaleDateString()}
                    </p>
                    <p className="text-[8px] text-gray-400 uppercase tracking-wider">
                        {getTimeAgo(val)}
                    </p>
                </div>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400 hover:text-blue-500" onClick={() => navigate(`/product/${row.product?._id || row.product}#reviews`)}>
                        <Eye size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400 hover:text-red-500" onClick={() => handleDelete(row)}>
                        <Trash2 size={14} />
                    </Button>
                </div>
            )
        }
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-120px)] w-full">
                <Spinner />
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-20 space-y-8">
            {/* Header */}
            <header className="flex flex-col justify-between gap-6 pb-8 border-b border-gray-100 md:flex-row md:items-center">
                <div>
                    <h1 className="text-3xl font-light tracking-tight text-black">Reviews & Ratings</h1>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-2">Browse products and view all reviews</p>
                </div>
            </header>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                    { label: 'Total Products', value: allProducts.length, icon: Package, accent: 'bg-purple-50 text-purple-600' },
                    { label: 'Total Reviews', value: totalReviews, icon: MessageSquare, accent: 'bg-blue-50 text-blue-600' },
                    { label: 'Average Rating', value: avgRating, icon: Star, accent: 'bg-amber-50 text-amber-600' },
                    { label: '5-Star Reviews', value: fiveStarCount, icon: Star, accent: 'bg-green-50 text-green-600' },
                ].map((stat) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-5 bg-white border border-gray-100 shadow-sm rounded-2xl"
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.accent}`}>
                            <stat.icon size={18} />
                        </div>
                        <p className="text-2xl font-light tracking-tight text-gray-900">{stat.value}</p>
                        <p className="text-[9px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-1">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('products')}
                    className={`px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === 'products'
                        ? 'bg-white text-black shadow-sm'
                        : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    <Package size={14} className="inline mr-2 -mt-0.5" />
                    All Products ({allProducts.length})
                </button>
                <button
                    onClick={() => setActiveTab('reviews')}
                    className={`px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === 'reviews'
                        ? 'bg-white text-black shadow-sm'
                        : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    <MessageSquare size={14} className="inline mr-2 -mt-0.5" />
                    All Reviews ({totalReviews})
                </button>
            </div>

            {/* ─── PRODUCTS TAB ─── */}
            {activeTab === 'products' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    {/* Product Search */}
                    <div className="flex items-center p-4 space-x-4 bg-white border shadow-sm rounded-2xl border-gray-50">
                        <div className="relative flex-1">
                            <Search className="absolute text-gray-400 -translate-y-1/2 left-4 top-1/2" size={16} />
                            <Input
                                placeholder="Search products to review..."
                                className="transition-all border-transparent pl-11 bg-gray-50 focus:bg-white rounded-xl"
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                            />
                        </div>
                        <Badge variant="outline" className="text-[10px] px-3 py-1.5 bg-gray-50 border-gray-100">
                            {filteredProducts.length} products
                        </Badge>
                    </div>

                    {/* Product List (Row-wise) */}
                    {filteredProducts.length > 0 ? (
                        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
                            {/* Column headers (desktop) */}
                            <div className="hidden md:grid grid-cols-[1.6fr_0.9fr_0.6fr_0.6fr_0.5fr] px-6 py-4 bg-gray-50/50 border-b border-gray-100">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Product</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Rating</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Reviews</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Price</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Action</span>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {filteredProducts.map((product, idx) => {
                                    const reviewCount = getProductReviewCount(product._id);
                                    const avgRat = getProductAvgRating(product._id);
                                    const priceNumber = Number(product.price);

                                    return (
                                        <motion.div
                                            key={product._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.02 }}
                                            className="px-6 py-4 transition-colors hover:bg-gray-50/50"
                                        >
                                            <div className="flex flex-col md:grid md:grid-cols-[1.6fr_0.9fr_0.6fr_0.6fr_0.5fr] gap-4 md:items-center">
                                                {/* Product */}
                                                <div className="flex items-center min-w-0 gap-4">
                                                    <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 overflow-hidden border border-gray-100 rounded-xl bg-gray-50">
                                                        {product.images && product.images.length > 0 ? (
                                                            <img
                                                                src={product.images[0]}
                                                                alt={product.name}
                                                                className="object-cover w-full h-full"
                                                            />
                                                        ) : (
                                                            <Package size={20} className="text-gray-200" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-gray-900 truncate">{product.name}</p>
                                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5 truncate">
                                                            {product.category?.name || 'Uncategorized'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Rating */}
                                                <div className="flex items-center justify-between gap-3 md:justify-start">
                                                    <div className="flex items-center gap-2">
                                                        <StarDisplay rating={Math.round(parseFloat(avgRat) || 0)} size={12} />
                                                        <span className="text-[10px] font-bold text-gray-400">{avgRat}</span>
                                                    </div>
                                                    <span className="md:hidden text-[10px] font-bold uppercase tracking-widest text-gray-400">Rating</span>
                                                </div>

                                                {/* Reviews */}
                                                <div className="flex items-center justify-between md:block">
                                                    <span className="text-xs font-semibold text-gray-900">{reviewCount}</span>
                                                    <span className="md:hidden text-[10px] font-bold uppercase tracking-widest text-gray-400">Reviews</span>
                                                </div>

                                                {/* Price */}
                                                <div className="flex items-center justify-between md:block">
                                                    <span className="text-xs font-semibold text-gray-900">
                                                        {Number.isFinite(priceNumber) ? `$${priceNumber.toFixed(2)}` : '—'}
                                                    </span>
                                                    <span className="md:hidden text-[10px] font-bold uppercase tracking-widest text-gray-400">Price</span>
                                                </div>

                                                {/* Action */}
                                                <div className="flex md:justify-end">
                                                    <Button
                                                        onClick={() => {
                                                            setSelectedProduct(product);
                                                            setIsReviewModalOpen(true);
                                                        }}
                                                        className="bg-black text-white hover:bg-gray-800 text-[9px] uppercase tracking-widest font-bold h-9 rounded-lg px-4"
                                                    >
                                                        <Eye size={12} className="mr-1.5" />
                                                        View
                                                    </Button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="h-96 flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-[2rem] space-y-4 bg-gray-50/50">
                            <div className="flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-sm">
                                <Package size={24} className="text-gray-300" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-bold text-gray-900">No products found</h3>
                                <p className="mt-1 text-xs tracking-widest text-gray-400 uppercase">Try adjusting your search</p>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* ─── REVIEWS TAB ─── */}
            {activeTab === 'reviews' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    {/* Review Filters */}
                    <div className="flex flex-col items-stretch p-4 space-y-4 bg-white border shadow-sm sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 rounded-2xl border-gray-50">
                        <div className="relative flex-1">
                            <Search className="absolute text-gray-400 -translate-y-1/2 left-4 top-1/2" size={16} />
                            <Input
                                placeholder="Search reviews..."
                                className="transition-all border-transparent pl-11 bg-gray-50 focus:bg-white rounded-xl"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
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

                    {/* Reviews Table or Empty State */}
                    {filteredReviews.length > 0 ? (
                        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
                            <DataTable
                                columns={reviewColumns}
                                data={filteredReviews}
                                isLoading={isLoading}
                                hideSearch
                                showActionsColumn={false}
                            />
                        </div>
                    ) : (
                        <div className="h-96 flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-[2rem] space-y-4 bg-gray-50/50">
                            <div className="flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-sm">
                                <MessageSquare size={24} className="text-gray-300" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-bold text-gray-900">No reviews found</h3>
                                <p className="mt-1 text-xs tracking-widest text-gray-400 uppercase">
                                    {searchQuery || filterRating ? 'Try adjusting your filters' : 'Add a review from the Products tab'}
                                </p>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Reviews Dialog */}
            <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Reviews for {selectedProduct?.name}</DialogTitle>
                        <DialogDescription>
                            All user reviews for this product
                        </DialogDescription>
                    </DialogHeader>
                    {selectedProduct && (
                        <div className="mt-4 space-y-4">
                            {(() => {
                                const productReviews = reviews.filter(r => (r.product?._id || r.product) === selectedProduct._id);
                                if (productReviews.length === 0) {
                                    return (
                                        <div className="py-12 text-center text-gray-500 border border-gray-200 border-dashed bg-gray-50 rounded-xl">
                                            No reviews found for this product.
                                        </div>
                                    );
                                }
                                return productReviews.map(review => (
                                    <div key={review._id} className="flex flex-col items-start justify-between gap-4 p-5 transition-shadow bg-white border border-gray-100 shadow-sm sm:flex-row rounded-2xl hover:shadow-md">
                                        <div className="flex-1 w-full space-y-3">
                                            <div className="flex items-center justify-between gap-4 sm:justify-start">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 border border-blue-100 rounded-full bg-gradient-to-br from-indigo-50 to-blue-50">
                                                        <span className="text-sm font-black text-blue-600 uppercase">
                                                            {review.user?.name?.charAt(0) || '?'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                                                                {review.user?.name || 'Unknown User'}
                                                            </span>
                                                            <div className="flex items-center bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                                                                <StarDisplay rating={review.rating} size={10} />
                                                                <span className="text-[10px] font-bold text-gray-500 ml-1.5">{review.rating}/5</span>
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                                                            {getTimeAgo(review.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="sm:hidden">
                                                    <Button variant="ghost" size="icon" className="w-8 h-8 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(review)}>
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="pl-0 sm:pl-14">
                                                <h4 className="mb-1 text-sm font-bold text-gray-900">{review.title}</h4>
                                                <p className="p-3 text-sm leading-relaxed text-gray-600 border border-gray-100 bg-gray-50 rounded-xl">{review.text}</p>
                                            </div>
                                        </div>
                                        <div className="hidden sm:block">
                                            <Button variant="ghost" size="icon" className="text-red-400 bg-white border border-gray-100 shadow-sm h-9 w-9 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(review)}>
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default Reviews;
