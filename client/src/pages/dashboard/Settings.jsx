
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useAuthStore from '@/store/authStore';
import Spinner from '@/components/ui/Spinner';
import { Camera, User, MapPin, Briefcase, Mail, Phone, Globe, Pencil } from 'lucide-react';

const Settings = () => {
    const { user } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);

    // Initial State from User Store
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        bio: '',
        studioName: '',
        location: '',
        telephone: '',
        category: '',
        skills: '',
        experience: '',
        portfolio: ''
    });

    useEffect(() => {
        // Simulate data fetching wait time
        const timer = setTimeout(() => {
            if (user) {
                setFormData({
                    name: user.name || '',
                    email: user.email || '',
                    bio: user.bio || '',
                    studioName: user.studioName || '',
                    location: user.location || '',
                    telephone: user.telephone || '',
                    category: user.category || '',
                    skills: user.skills ? user.skills.join(', ') : '',
                    experience: user.experience || '',
                    portfolio: user.portfolio || ''
                });
            }
            setIsLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, [user]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-120px)] w-full">
                <Spinner />
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 pb-20">
            <header className="flex justify-between items-end border-b border-gray-100 pb-6">
                 <div>
                     <h1 className="text-3xl font-light tracking-tight text-black">Settings</h1>
                </div>
                <button className="bg-black text-white px-6 py-3 text-xs uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors">
                    Save Changes
                </button>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* LEFT COLUMN: Personal & Profile Pic */}
                <div className="space-y-8">
                    {/* Profile Picture Card */}
                    <div className="border border-gray-100 rounded-xl p-8 text-center space-y-4 bg-white">
                        <div className="relative w-32 h-32 mx-auto">
                            <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 group cursor-pointer relative">
                                {user?.profilePicture ? (
                                    <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <User className="w-12 h-12" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md border border-gray-200 hover:bg-gray-50 transition-colors">
                                <Pencil className="w-4 h-4 text-black" />
                            </button>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium">{formData.name || 'Your Name'}</h3>
                            <p className="text-xs text-gray-400 tracking-widest">{formData.email}</p>
                        </div>
                    </div>

                    {/* Personal Info */}
                    <div className="space-y-6">
                        <h3 className="text-xs uppercase tracking-widest font-bold text-gray-400 border-b border-gray-100 pb-2">Personal Info</h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest font-bold flex items-center gap-2"><User className="w-3 h-3" /> Full Name</label>
                                <input 
                                    type="text" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full border border-gray-200 px-4 py-3 rounded text-sm focus:outline-none focus:border-black transition-colors bg-gray-50/30" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest font-bold flex items-center gap-2"><Mail className="w-3 h-3" /> Email</label>
                                <input 
                                    type="email" 
                                    value={formData.email}
                                    readOnly
                                    className="w-full border border-gray-200 px-4 py-3 rounded text-sm bg-gray-100 text-gray-500 cursor-not-allowed" 
                                />
                            </div>
                             <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest font-bold">Bio</label>
                                <textarea 
                                    rows="4"
                                    value={formData.bio}
                                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                    className="w-full border border-gray-200 px-4 py-3 rounded text-sm focus:outline-none focus:border-black transition-colors bg-gray-50/30 resize-none" 
                                    placeholder="Tell us about yourself..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Studio Info */}
                <div className="lg:col-span-2 space-y-8">
                     <h3 className="text-xs uppercase tracking-widest font-bold text-gray-400 border-b border-gray-100 pb-2">Studio Details</h3>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest font-bold flex items-center gap-2"><Briefcase className="w-3 h-3" /> Studio Name</label>
                            <input 
                                type="text" 
                                value={formData.studioName}
                                onChange={(e) => setFormData({...formData, studioName: e.target.value})}
                                className="w-full border border-gray-200 px-4 py-3 rounded text-sm focus:outline-none focus:border-black transition-colors" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest font-bold flex items-center gap-2"><Globe className="w-3 h-3" /> Portfolio URL</label>
                            <input 
                                type="text" 
                                value={formData.portfolio}
                                onChange={(e) => setFormData({...formData, portfolio: e.target.value})}
                                className="w-full border border-gray-200 px-4 py-3 rounded text-sm focus:outline-none focus:border-black transition-colors" 
                                placeholder="https://"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest font-bold flex items-center gap-2"><MapPin className="w-3 h-3" /> Location</label>
                            <input 
                                type="text" 
                                value={formData.location}
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                                className="w-full border border-gray-200 px-4 py-3 rounded text-sm focus:outline-none focus:border-black transition-colors" 
                            />
                        </div>
                         <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest font-bold flex items-center gap-2"><Phone className="w-3 h-3" /> Telephone</label>
                            <input 
                                type="text" 
                                value={formData.telephone}
                                onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                                className="w-full border border-gray-200 px-4 py-3 rounded text-sm focus:outline-none focus:border-black transition-colors" 
                            />
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest font-bold">Category</label>
                        <input 
                            type="text" 
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                            className="w-full border border-gray-200 px-4 py-3 rounded text-sm focus:outline-none focus:border-black transition-colors" 
                            placeholder="e.g. Pottery, Woodworking"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest font-bold">Skills (Comma Separated)</label>
                         <input 
                            type="text" 
                            value={formData.skills}
                            onChange={(e) => setFormData({...formData, skills: e.target.value})}
                            className="w-full border border-gray-200 px-4 py-3 rounded text-sm focus:outline-none focus:border-black transition-colors" 
                            placeholder="e.g. Carving, Painting, Design"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest font-bold">Experience / Story</label>
                        <textarea 
                            rows="6"
                            value={formData.experience}
                            onChange={(e) => setFormData({...formData, experience: e.target.value})}
                            className="w-full border border-gray-200 px-4 py-3 rounded text-sm focus:outline-none focus:border-black transition-colors bg-gray-50/30 resize-none" 
                            placeholder="Share your artisan journey..."
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Settings;
