import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
    ArrowLeft, Save, Loader2, Star, Eye
} from 'lucide-react';
import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import reviewService from '@/api/services/reviewService';
import productService from '@/api/services/productService';
import useAuthStore from '@/store/authStore';

const StarInput = ({ rating, onRate, size = 32 }) => {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="flex items-center gap-2">
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
                            : 'fill-transparent text-gray-200 hover:text-amber-200'
                            }`}
                    />
                </button>
            ))}
            {rating > 0 && (
                <span className="ml-2 text-sm font-medium text-gray-500">
                    {rating}/5
                </span>
            )}
        </div>
    );
};

const StarDisplay = ({ rating, size = 20 }) => (
    <div className="flex items-center gap-1">
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

const AddReview = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const isEditMode = !!id && !window.location.pathname.includes('/view/');
    const isViewMode = window.location.pathname.includes('/view/');

    const { user } = useAuthStore();

    const [products, setProducts] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        text: '',
        rating: 0,
        product: '',
    });

    const [errors, setErrors] = useState({});

    // Fetch ALL products from the database for the product selector
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await productService.getAll({ limit: 1000 });
                const prods = Array.isArray(res.data)
                    ? res.data
                    : res.data?.products || [];
                setProducts(prods);

                // Auto-select product from URL query parameter (?product=ID)
                const productFromUrl = searchParams.get('product');
                if (productFromUrl && !id) {
                    setFormData(prev => ({ ...prev, product: productFromUrl }));
                }
            } catch (error) {
                console.error('Failed to fetch products', error);
                toast.error('Failed to load products');
            }
        };
        fetchProducts();
    }, [searchParams, id]);

    // Fetch review data if editing or viewing
    useEffect(() => {
        if (id) {
            const fetchReview = async () => {
                setIsLoading(true);
                try {
                    const res = await reviewService.getById(id);
                    const review = res.data?.data || res.data;

                    setFormData({
                        title: review.title || '',
                        text: review.text || '',
                        rating: review.rating || 0,
                        product: review.product?._id || review.product || '',
                    });
                } catch (error) {
                    console.error('Failed to fetch review', error);
                    toast.error('Failed to load review details');
                    navigate('/dashboard/reviews');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchReview();
        }
    }, [id, navigate]);

    const validate = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Review title is required';
        if (formData.title.trim().length < 3) newErrors.title = 'Title must be at least 3 characters';
        if (!formData.text.trim()) newErrors.text = 'Review text is required';
        if (formData.text.trim().length < 10) newErrors.text = 'Review must be at least 10 characters';
        if (formData.rating === 0) newErrors.rating = 'Please select a rating';
        if (!formData.product) newErrors.product = 'Please select a product';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const payload = {
                title: formData.title,
                text: formData.text,
                rating: formData.rating,
            };

            if (isEditMode) {
                await reviewService.update(id, payload);
                toast.success('Review updated successfully');
            } else {
                await reviewService.create(formData.product, payload);
                toast.success('Review created successfully');
            }

            navigate('/dashboard/reviews');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} review`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="animate-spin text-gray-400" size={32} />
            </div>
        );
    }

    // View mode - read only
    if (isViewMode) {
        const selectedProduct = products.find(p => p._id === formData.product);
        return (
            <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-20">
                <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-6">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full hover:bg-gray-100">
                            <ArrowLeft size={20} />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-light tracking-tight text-black">Review Details</h1>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-2">
                                Viewing review information
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="outline"
                            onClick={() => navigate(`/dashboard/reviews/edit/${id}`)}
                            className="border-gray-200 text-gray-500 hover:text-black hover:bg-gray-50 px-6 py-3 text-xs uppercase tracking-widest font-bold transition-colors rounded-none"
                        >
                            Edit Review
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="rounded-3xl border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
                            <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-8 py-6">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-500">Review Content</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <Label className="uppercase text-[10px] tracking-widest text-gray-400 font-bold">Rating</Label>
                                    <div className="flex items-center gap-3">
                                        <StarDisplay rating={formData.rating} size={24} />
                                        <span className="text-lg font-light text-gray-900">{formData.rating}/5</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="uppercase text-[10px] tracking-widest text-gray-400 font-bold">Title</Label>
                                    <p className="text-lg font-semibold text-gray-900">{formData.title}</p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="uppercase text-[10px] tracking-widest text-gray-400 font-bold">Review Text</Label>
                                    <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-4">{formData.text}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        <Card className="rounded-3xl border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
                            <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-8 py-6">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-500">Product Info</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-4">
                                {selectedProduct ? (
                                    <>
                                        {selectedProduct.images?.length > 0 && (
                                            <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-50">
                                                <img src={selectedProduct.images[0]} alt={selectedProduct.name} className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <p className="font-bold text-sm text-gray-900">{selectedProduct.name}</p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">{selectedProduct.category?.name || 'Uncategorized'}</p>
                                    </>
                                ) : (
                                    <p className="text-sm text-gray-400">Product information loading...</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    // Add / Edit mode
    return (
        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-20">
            <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-6">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full hover:bg-gray-100">
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-light tracking-tight text-black">{isEditMode ? 'Edit Review' : 'New Review'}</h1>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-2">
                            {isEditMode ? 'Update the review details' : 'Add a new review for a product'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <Button variant="outline" onClick={() => navigate(-1)} className="border-gray-200 text-gray-500 hover:text-black hover:bg-gray-50 px-6 py-3 text-xs uppercase tracking-widest font-bold transition-colors rounded-none">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-black text-white hover:bg-gray-800 min-w-[140px] px-6 py-3 text-xs uppercase tracking-widest font-bold transition-colors rounded-none">
                        {isSubmitting ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
                        {isEditMode ? 'Update' : 'Publish'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Main Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Rating Card */}
                    <Card className="rounded-3xl border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-8 py-6">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-500">Rating</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-4">
                            <div className="space-y-3">
                                <Label className="uppercase text-[10px] tracking-widest text-gray-400 font-bold">Select Rating</Label>
                                <StarInput
                                    rating={formData.rating}
                                    onRate={(val) => setFormData({ ...formData, rating: val })}
                                    size={36}
                                />
                                {errors.rating && <span className="text-red-500 text-xs">{errors.rating}</span>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Review Details Card */}
                    <Card className="rounded-3xl border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-8 py-6">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-500">Review Details</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">

                            <div className="space-y-2">
                                <Label className="uppercase text-[10px] tracking-widest text-gray-400 font-bold">Review Title</Label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Excellent craftsmanship!"
                                    className="input-premium bg-white"
                                    maxLength={100}
                                />
                                {errors.title && <span className="text-red-500 text-xs">{errors.title}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label className="uppercase text-[10px] tracking-widest text-gray-400 font-bold">Review Text</Label>
                                <Textarea
                                    value={formData.text}
                                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                                    placeholder="Share your detailed experience with this product..."
                                    className="input-premium bg-white min-h-[150px]"
                                    maxLength={500}
                                />
                                <div className="flex justify-between items-center">
                                    {errors.text && <span className="text-red-500 text-xs">{errors.text}</span>}
                                    <span className="text-[10px] text-gray-300 ml-auto">{formData.text.length}/500</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Product Selection */}
                <div className="space-y-8">
                    <Card className="rounded-3xl border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-8 py-6">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-500">Product</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-4">
                            <div className="space-y-2">
                                <Label className="uppercase text-[10px] tracking-widest text-gray-400 font-bold">Select Product</Label>
                                <Select
                                    onValueChange={(val) => setFormData({ ...formData, product: val })}
                                    value={formData.product}
                                    disabled={isEditMode}
                                >
                                    <SelectTrigger className="input-premium bg-white h-auto py-4">
                                        <SelectValue placeholder="Select a product" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products.map((product) => (
                                            <SelectItem key={product._id} value={product._id}>
                                                <div className="flex items-center gap-3">
                                                    {product.images?.length > 0 && (
                                                        <img src={product.images[0]} alt="" className="w-6 h-6 rounded object-cover" />
                                                    )}
                                                    <span>{product.name}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {isEditMode && (
                                    <p className="text-[10px] text-gray-400 italic">Product cannot be changed when editing</p>
                                )}
                                {errors.product && <span className="text-red-500 text-xs">{errors.product}</span>}
                            </div>

                            {/* Preview selected product */}
                            {formData.product && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    {(() => {
                                        const selectedProduct = products.find(p => p._id === formData.product);
                                        if (!selectedProduct) return null;
                                        return (
                                            <div className="space-y-3">
                                                {selectedProduct.images?.length > 0 && (
                                                    <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-50">
                                                        <img src={selectedProduct.images[0]} alt={selectedProduct.name} className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                                <p className="font-bold text-sm text-gray-900">{selectedProduct.name}</p>
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wider">{selectedProduct.category?.name || 'Uncategorized'}</p>
                                                {selectedProduct.price && (
                                                    <p className="text-sm font-medium text-gray-700">${selectedProduct.price.toFixed(2)}</p>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Tips */}
                    <Card className="rounded-3xl border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-8 py-6">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-500">Writing Tips</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <ul className="space-y-3">
                                {[
                                    'Be specific about what you liked or disliked',
                                    'Mention the quality, craftsmanship, and delivery',
                                    'Keep it honest and constructive',
                                    'A good title summarizes your experience',
                                ].map((tip, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-[9px] font-black">{i + 1}</span>
                                        </span>
                                        <span className="text-xs text-gray-500">{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AddReview;
