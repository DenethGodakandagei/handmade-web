import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import Spinner from '@/components/ui/Spinner';
import { ArrowLeft, Upload, Check } from 'lucide-react';
import productService from '../api/services/productService';
import customizationService from '../api/services/customizationService';
import { useCurrency } from '@/hooks/useCurrency';
import { toast } from 'sonner';

const RequestCustomization = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Customization Form State
    const [customValues, setCustomValues] = useState({});
    const [customMessage, setCustomMessage] = useState('');
    const [designImage, setDesignImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // Currency Hook
    const { formatPrice } = useCurrency('USD'); // Default to USD or fetch user pref

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await productService.getById(id);
                setProduct(res.data);
            } catch (err) {
                console.error("Error fetching product:", err);
                toast.error("Failed to load product details.");
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setDesignImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCustomValueChange = (optionName, value) => {
        setCustomValues(prev => ({
            ...prev,
            [optionName]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // Validate required options
            if (product.customizationOptions) {
                for (const option of product.customizationOptions) {
                    if (option.required && !customValues[option.name]) {
                        toast.error(`Please provide a value for ${option.name}`);
                        setSubmitting(false);
                        return;
                    }
                }
            }

            const formData = new FormData();
            formData.append('product', product._id);

            // Transform customValues object to array format expected by backend
            const customizationsArray = Object.entries(customValues).map(([key, value]) => ({
                optionName: key,
                selectedValue: value
            }));

            formData.append('customizations', JSON.stringify(customizationsArray));
            formData.append('customMessage', customMessage);
            if (designImage) {
                formData.append('designImage', designImage);
            }

            await customizationService.create(formData);

            toast.success("Customization request submitted successfully!");
            navigate('/dashboard/customizations');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to submit request.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
            <Spinner />
        </div>
    );

    if (!product) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF9F6]">
            <h2 className="text-2xl font-light mb-4">Product Not Found</h2>
            <Button asChild variant="outline">
                <Link to="/collection">Back to Collection</Link>
            </Button>
        </div>
    );

    return (
        <div className="bg-[#FAF9F6] min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <Link to={`/collection/${product._id}`} className="text-sm text-gray-500 hover:text-black flex items-center gap-2 mb-4 transition-colors">
                        <ArrowLeft size={16} /> Back to Product
                    </Link>
                    <h1 className="text-3xl font-light tracking-tight uppercase">Request Customization</h1>
                    <p className="text-gray-500 mt-2">Tailor this piece to your exact specifications.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Left: Product Preview */}
                    <div className="lg:col-span-1">
                        <Card className="border-none shadow-sm sticky top-24">
                            <CardContent className="p-0">
                                <div className="aspect-square bg-gray-100 overflow-hidden rounded-t-lg">
                                    <img
                                        src={product.images?.[0] || '/images/placeholder-product.jpg'}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-6 bg-white rounded-b-lg">
                                    <h3 className="font-serif text-xl mb-2">{product.name}</h3>
                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{product.description}</p>
                                    <div className="flex justify-between items-center text-sm font-medium">
                                        <span>Base Price</span>
                                        <span>{formatPrice(product.price)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: Customization Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow-sm">

                            {/* Dynamic Options from Product Model */}
                            {product.customizationOptions?.length > 0 && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-medium border-b pb-2 mb-4">Available Options</h3>
                                    {product.customizationOptions.map((option, index) => (
                                        <div key={index} className="space-y-2">
                                            <Label className="text-sm font-medium uppercase tracking-wider text-gray-700">
                                                {option.name} {option.required && <span className="text-red-500">*</span>}
                                            </Label>

                                            {option.type === 'select' || option.type === 'color' ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {option.options.map((optValue) => (
                                                        <button
                                                            key={optValue}
                                                            type="button"
                                                            onClick={() => handleCustomValueChange(option.name, optValue)}
                                                            className={`px-4 py-2 text-sm border transition-all ${customValues[option.name] === optValue
                                                                ? 'bg-black text-white border-black'
                                                                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                                                                }`}
                                                        >
                                                            {optValue}
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <Input
                                                    type="text"
                                                    placeholder={`Enter ${option.name}`}
                                                    required={option.required}
                                                    value={customValues[option.name] || ''}
                                                    onChange={(e) => handleCustomValueChange(option.name, e.target.value)}
                                                    className="max-w-md"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* General Customization Notes */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium border-b pb-2 mb-4">Additional Details</h3>
                                <div className="space-y-2">
                                    <Label htmlFor="customMessage" className="text-sm font-medium uppercase tracking-wider text-gray-700">
                                        Notes for the Artisan
                                    </Label>
                                    <Textarea
                                        id="customMessage"
                                        placeholder="Describe your specific requirements, measurements, or any other details..."
                                        rows={5}
                                        value={customMessage}
                                        onChange={(e) => setCustomMessage(e.target.value)}
                                        className="resize-none"
                                    />
                                </div>
                            </div>

                            {/* Reference Image Upload */}
                            <div className="space-y-4">
                                <Label className="text-sm font-medium uppercase tracking-wider text-gray-700">
                                    Reference Image (Optional)
                                </Label>
                                <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center hover:border-black transition-colors cursor-pointer relative bg-gray-50/50">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    {imagePreview ? (
                                        <div className="relative w-full max-w-xs aspect-video">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-full object-contain rounded-md"
                                            />
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setDesignImage(null);
                                                    setImagePreview(null);
                                                }}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 z-10"
                                            >
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload size={32} className="text-gray-400 mb-2" />
                                            <p className="text-sm text-gray-500 font-medium">Click to upload or drag and drop</p>
                                            <p className="text-xs text-gray-400 mt-1">SVG, PNG, JPG or WEBP (MAX. 5MB)</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-6 border-t flex items-center justify-end gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate(`/collection/${product._id}`)}
                                    disabled={submitting}
                                    className="rounded-none h-12 px-8"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-black text-white hover:bg-gray-800 rounded-none h-12 px-10 uppercase tracking-widest font-bold text-xs"
                                >
                                    {submitting ? (
                                        <>
                                            <Spinner className="mr-2 h-4 w-4" /> Sending Request...
                                        </>
                                    ) : (
                                        <>
                                            Send Request <ArrowLeft className="ml-2 rotate-180" size={16} />
                                        </>
                                    )}
                                </Button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestCustomization;
