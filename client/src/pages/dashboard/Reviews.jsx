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
                    <p className="font-bold text-sm text-gray-900">{val}</p>
                    <p className="text-[10px] text-gray-400 truncate max-w-[200px]">{row.text}</p>
                </div>
            )
        },
        {
            key: 'user',
            label: 'Reviewer',
            render: (val) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
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
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-500" onClick={() => navigate(`/product/${row.product?._id || row.product}#reviews`)}>
                        <Eye size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500" onClick={() => handleDelete(row)}>
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
                <div>
                    <h1 className="text-3xl font-light tracking-tight text-black">Reviews & Ratings</h1>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-2">Browse products and view all reviews</p>
                </div>
            </header>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                        className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
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
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-fit">
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
                    <div className="flex items-center space-x-4 bg-white p-4 rounded-2xl border border-gray-50 shadow-sm">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <Input
                                placeholder="Search products to review..."
                                className="pl-11 bg-gray-50 border-transparent focus:bg-white transition-all rounded-xl"
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                            />
                        </div>
                        <Badge variant="outline" className="text-[10px] px-3 py-1.5 bg-gray-50 border-gray-100">
                            {filteredProducts.length} products
                        </Badge>
                    </div>

                    {/* Product Grid */}
                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {filteredProducts.map((product, idx) => {
                                const reviewCount = getProductReviewCount(product._id);
                                const avgRat = getProductAvgRating(product._id);
                                return (
                                    <motion.div
                                        key={product._id}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all duration-300 overflow-hidden"
                                    >
                                        {/* Product Image */}
                                        <div className="aspect-square bg-gray-50 relative overflow-hidden">
                                            {product.images && product.images.length > 0 ? (
                                                <img
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package size={40} className="text-gray-200" />
                                                </div>
                                            )}

                                            {/* Rating overlay */}
                                            {reviewCount > 0 && (
                                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 shadow-sm">
                                                    <Star size={12} className="fill-amber-400 text-amber-400" />
                                                    <span className="text-xs font-bold text-gray-900">{avgRat}</span>
                                                </div>
                                            )}

                                            {/* Review count badge */}
                                            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm rounded-lg px-2.5 py-1.5 shadow-sm">
                                                <span className="text-[9px] font-bold text-white uppercase tracking-wider">
                                                    {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Product Info */}
                                        <div className="p-4 space-y-3">
                                            <div>
                                                <h3 className="font-bold text-sm text-gray-900 truncate">{product.name}</h3>
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">
                                                    {product.category?.name || 'Uncategorized'}
                                                </p>
                                            </div>

                                            {/* Star display */}
                                            <div className="flex items-center gap-2">
                                                <StarDisplay rating={Math.round(parseFloat(avgRat) || 0)} size={13} />
                                                {reviewCount > 0 && (
                                                    <span className="text-[10px] text-gray-400">({reviewCount})</span>
                                                )}
                                            </div>

                                            {/* Price */}
                                            {product.price && (
                                                <p className="text-sm font-semibold text-gray-800">${product.price.toFixed(2)}</p>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                                                <Button
                                                    onClick={() => {
                                                        setSelectedProduct(product);
                                                        setIsReviewModalOpen(true);
                                                    }}
                                                    className="flex-1 bg-black text-white hover:bg-gray-800 text-[9px] uppercase tracking-widest font-bold h-9 rounded-lg"
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
                    ) : (
                        <div className="h-96 flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-[2rem] space-y-4 bg-gray-50/50">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                                <Package size={24} className="text-gray-300" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-bold text-gray-900">No products found</h3>
                                <p className="text-gray-400 text-xs uppercase tracking-widest mt-1">Try adjusting your search</p>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* ─── REVIEWS TAB ─── */}
            {activeTab === 'reviews' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    {/* Review Filters */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 bg-white p-4 rounded-2xl border border-gray-50 shadow-sm">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <Input
                                placeholder="Search reviews..."
                                className="pl-11 bg-gray-50 border-transparent focus:bg-white transition-all rounded-xl"
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
                        <div className="space-y-4 mt-4">
                            {(() => {
                                const productReviews = reviews.filter(r => (r.product?._id || r.product) === selectedProduct._id);
                                if (productReviews.length === 0) {
                                    return (
                                        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                            No reviews found for this product.
                                        </div>
                                    );
                                }
                                return productReviews.map(review => (
                                    <div key={review._id} className="flex flex-col sm:flex-row gap-4 justify-between items-start p-5 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
                                        <div className="space-y-3 flex-1 w-full">
                                            <div className="flex items-center justify-between sm:justify-start gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
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
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(review)}>
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="pl-0 sm:pl-14">
                                                <h4 className="font-bold text-sm text-gray-900 mb-1">{review.title}</h4>
                                                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">{review.text}</p>
                                            </div>
                                        </div>
                                        <div className="hidden sm:block">
                                            <Button variant="ghost" size="icon" className="h-9 w-9 text-red-400 hover:text-red-600 hover:bg-red-50 bg-white border border-gray-100 shadow-sm" onClick={() => handleDelete(review)}>
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
