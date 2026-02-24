import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, ArrowLeft, Mail, Phone, Globe, Briefcase, Award, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useAuthStore from '@/store/authStore';
import { toast } from 'sonner';
import userService from '@/api/services/userService';
import productService from '@/api/services/productService';
import Spinner from '@/components/ui/Spinner';
import ProductCard from '@/components/ProductCard';

const ArtisanDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();
    const [artisan, setArtisan] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [imageFailed, setImageFailed] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followerCount, setFollowerCount] = useState(284);
    const [followingCount] = useState(91);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Artisan
                const artisanRes = await userService.getArtisanById(id);
                const artisanData = artisanRes.data.data || artisanRes.data;
                setArtisan(artisanData);

                // Fetch Artisan Products
                const productRes = await productService.getAll({ artisan: id });
                
                // Extremely resilient data extraction
                const rawData = productRes.data;
                const innerData = rawData.data || rawData;
                const productsArray = Array.isArray(innerData) 
                    ? innerData 
                    : (innerData.products || innerData.data || []);
                    
                setProducts(productsArray);
            } catch (error) {
                console.error('Failed to fetch artisan data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        setImageFailed(false);
    }, [id, artisan?.profilePicture]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Spinner />
            </div>
        );
    }

    if (!artisan) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
                <h2 className="text-4xl font-light tracking-tight uppercase mb-6">Artisan Not Found</h2>
                <Button onClick={() => navigate('/artisans')} className="bg-black text-white hover:bg-gray-800 rounded-none px-8">
                    Back
                </Button>
            </div>
        );
    }

    const normalizedTelephone = typeof artisan.telephone === 'string' ? artisan.telephone.trim() : '';
    const normalizedEmail = typeof artisan.email === 'string' ? artisan.email.trim() : '';
    const normalizedLocation = typeof artisan.location === 'string' ? artisan.location.trim() : '';
    const telephoneHref = normalizedTelephone ? `tel:${normalizedTelephone.replace(/[^\d+]/g, '')}` : null;
    const emailHref = normalizedEmail ? `mailto:${normalizedEmail}` : null;
    const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(normalizedLocation || 'Global Artisan')}`;
    const toggleFollow = () => {
        if (!isAuthenticated) {
            toast.info('Login to follow this artisan');
            return;
        }

        setIsFollowing((prev) => {
            setFollowerCount((count) => Math.max(0, count + (prev ? -1 : 1)));
            return !prev;
        });
    };

    return (
        <div className="bg-white min-h-screen pt-24 pb-14 font-sans text-black">
            <div className="container mx-auto px-6 md:px-12">
                
                {/* Back Button */}
                <button 
                    onClick={() => navigate('/artisans')}
                    className="flex items-center text-[10px] font-bold uppercase text-gray-400 hover:text-black transition-colors mb-6 cursor-pointer"
                >
                    <ArrowLeft size={14} className="mr-2" /> Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left: Identity */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="aspect-square bg-gray-50 overflow-hidden max-w-[240px]">
                            {!artisan.profilePicture || imageFailed ? (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                    <User className="w-12 h-12 text-gray-400" />
                                </div>
                            ) : (
                                <img 
                                    src={artisan.profilePicture} 
                                    alt={artisan.name} 
                                    onError={() => setImageFailed(true)}
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>
                        
                        <div className="space-y-4 pt-1">
                            <div>
                                <h1 className="text-3xl md:text-[2.1rem] font-serif italic mb-1">{artisan.name}</h1>
                            </div>
                            <div className="grid grid-cols-2 gap-4 max-w-[220px]">
                                <div>
                                    <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">Followers</p>
                                    <p className="text-lg font-light text-black leading-none mt-1">{followerCount}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">Following</p>
                                    <p className="text-lg font-light text-black leading-none mt-1">{followingCount}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Story */}
                    <div className="lg:col-span-9 space-y-7">
                        <section className="space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-[10px] font-bold uppercase text-gray-300">The Narrative</span>
                                <button
                                    onClick={toggleFollow}
                                    className={`h-9 px-5 text-[10px] uppercase tracking-widest font-bold border transition-colors cursor-pointer ${
                                        isFollowing
                                            ? 'bg-black text-white border-black'
                                            : 'bg-white text-black border-gray-300 hover:border-black'
                                    }`}
                                >
                                    {isFollowing ? 'Following' : 'Follow'}
                                </button>
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-2xl md:text-3xl font-light tracking-tight leading-tight max-w-3xl">
                                    {artisan.category ? `A master of ${artisan.category.toLowerCase()} crafting stories through materials.` : 'A dedicated maker preserving traditional techniques.'}
                                </h2>
                                <p className="text-base md:text-lg text-gray-600 font-light leading-relaxed max-w-4xl">
                                    {artisan.bio || 'Dedication to the craft defined by patience and respect for materials. Each piece is a dialogue between tradition and modern utility.'}
                                </p>
                            </div>
                        </section>

                        <section className="border-y border-gray-100 py-4 space-y-3">
                            <h4 className="text-[10px] font-bold uppercase text-gray-400">Contact & Info</h4>
                            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-gray-600">
                                {artisan.studioName && (
                                    <div className="flex items-center gap-2.5">
                                        <Briefcase size={14} className="text-gray-400" />
                                        <span>{artisan.studioName}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2.5">
                                    <Mail size={14} className="text-gray-400" />
                                    {emailHref ? (
                                        <a
                                            href={emailHref}
                                            className="underline decoration-gray-300 decoration-1 underline-offset-4 hover:decoration-gray-500 transition-colors"
                                        >
                                            {normalizedEmail}
                                        </a>
                                    ) : (
                                        <span>{artisan.email}</span>
                                    )}
                                </div>
                                {artisan.telephone && (
                                    <div className="flex items-center gap-2.5">
                                        <Phone size={14} className="text-gray-400" />
                                        {telephoneHref ? (
                                            <a
                                                href={telephoneHref}
                                                className="underline decoration-gray-300 decoration-1 underline-offset-4 hover:decoration-gray-500 transition-colors"
                                            >
                                                {artisan.telephone}
                                            </a>
                                        ) : (
                                            <span>{artisan.telephone}</span>
                                        )}
                                    </div>
                                )}
                                {artisan.portfolio && (
                                    <div className="flex items-center gap-2.5">
                                        <Globe size={14} className="text-gray-400" />
                                        <a
                                            href={artisan.portfolio}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="underline decoration-gray-300 decoration-1 underline-offset-4 hover:decoration-gray-500 transition-colors"
                                        >
                                            Portfolio
                                        </a>
                                    </div>
                                )}
                                <div className="flex items-center gap-2.5">
                                    <MapPin size={14} className="text-gray-400" />
                                    <a
                                        href={mapsHref}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline decoration-gray-300 decoration-1 underline-offset-4 hover:decoration-gray-500 transition-colors"
                                    >
                                        {normalizedLocation || 'Global Artisan'}
                                    </a>
                                </div>
                            </div>
                        </section>

                        {artisan.skills && artisan.skills.length > 0 && (
                            <section className="space-y-2">
                                <h4 className="text-[10px] font-bold uppercase text-gray-400">Expertise</h4>
                                <div className="flex flex-wrap gap-2">
                                    {artisan.skills.map((skill, idx) => (
                                        <span key={idx} className="text-[10px] uppercase tracking-widest bg-gray-50 px-2.5 py-1 border border-gray-100 italic">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}

                        {(artisan.experience || artisan.process) && (
                            <section className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                                {artisan.experience && (
                                    <div className="space-y-2.5 bg-[#FAF9F6]/35 border border-gray-100 p-4">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Award size={16} />
                                            <h4 className="text-[10px] font-bold uppercase">The Journey</h4>
                                        </div>
                                        <p className="text-sm text-gray-500 leading-relaxed font-light italic">
                                            "{artisan.experience}"
                                        </p>
                                    </div>
                                )}
                                {artisan.process && (
                                    <div className="space-y-2.5 bg-[#FAF9F6]/35 border border-gray-100 p-4">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Briefcase size={16} />
                                            <h4 className="text-[10px] font-bold uppercase">The Process</h4>
                                        </div>
                                        <p className="text-sm text-gray-500 leading-relaxed font-light">
                                            {artisan.process}
                                        </p>
                                    </div>
                                )}
                            </section>
                        )}
                    </div>
                </div>

                {/* Artisan Products Section */}
                <section className="mt-16 pt-10 border-t border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                        <div>
                            <span className="text-[10px] font-bold uppercase text-gray-400 block mb-4 tracking-[0.2em]">The Archive</span>
                            <h2 className="text-4xl font-serif italic text-black">Curated Works</h2>
                        </div>
                        {products && products.length > 0 && (
                            <div className="text-[10px] font-bold uppercase text-gray-300 tracking-widest pb-1 border-b border-gray-50">
                                {products.length} {products.length === 1 ? 'Design' : 'Designs'} in Collection
                            </div>
                        )}
                    </div>

                    {products && products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
                            {products.map((product) => (
                                <div key={product._id}>
                                    <ProductCard 
                                        product={product}
                                        linkState={{
                                            from: 'artisan',
                                            artisanId: artisan._id,
                                            artisanName: artisan.name
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center border border-dashed border-gray-100 bg-[#FAF9F6]/30">
                            <p className="text-gray-400 font-serif italic text-lg">No archived works found by this artisan yet.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default ArtisanDetails;
