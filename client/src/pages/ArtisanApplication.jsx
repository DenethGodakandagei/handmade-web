import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../context/AuthContext';
import authService from '@/api/services/authService';
import { useNavigate } from 'react-router-dom';
import Spinner from '@/components/ui/Spinner';

const ArtisanApplication = () => {
  const [formData, setFormData] = React.useState({
    studioName: '',
    telephone: '',
    portfolio: '',
    location: '',
    category: '',
    experience: '',
    skills: '',
    process: ''
  });
  
  const [loading, setLoading] = React.useState(false);
  // Add initial page loading state to prevent flash
  const [pageLoading, setPageLoading] = React.useState(true);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState(null);

  const { isAuthenticated, openAuthModal, user, fetchMe, updateUser } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    const init = async () => {
      if (isAuthenticated) {
         await fetchMe(); 
      } else {
        openAuthModal('login');
      }
      setPageLoading(false);
    };
    init();
  }, [isAuthenticated, openAuthModal, fetchMe]);
  
  // Show loading spinner while checking status
  if (pageLoading) {
     return (
        <div className="bg-white min-h-screen flex items-center justify-center">
           <Spinner />
        </div>
     );
  }
  
  // If user is already pending or approved, show status
  if (user && user.sellerRequestStatus === 'pending') {
      return (
        <div className="bg-white min-h-screen text-black pt-24 pb-24 flex items-center justify-center">
            <div className="text-center space-y-6 max-w-lg px-6">
              <h1 className="text-4xl font-serif italic">Application Pending.</h1>
              <p className="text-gray-500 font-light">Your application is currently being reviewed by our curators. We will notify you once a decision has been made.</p>
              <Button onClick={() => window.location.href='/'} className="bg-black text-white hover:bg-gray-900 rounded-none uppercase tracking-[0.2em] px-8 py-4 text-xs font-bold">Return Home</Button>
            </div>
        </div>
      );
  }

  if (user && user.sellerRequestStatus === 'approved') {
      return (
        <div className="bg-white min-h-screen text-black pt-24 pb-24 flex items-center justify-center">
            <div className="text-center space-y-6 max-w-lg px-6">
              <h1 className="text-4xl font-serif italic">Welcome, Artisan.</h1>
              <p className="text-gray-500 font-light">Your application has been approved. You can now access your seller dashboard.</p>
              <Button onClick={() => window.location.href='/dashboard'} className="bg-black text-white hover:bg-gray-900 rounded-none uppercase tracking-[0.2em] px-8 py-4 text-xs font-bold">Go to Dashboard</Button>
            </div>
        </div>
      );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // If not authenticated, we could show a restricted access message or just blank
  // while the modal is open.
  if (!isAuthenticated) {
     return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
           <p className="text-gray-400 font-light mb-4">You must be logged in to apply.</p>
           <Button onClick={() => openAuthModal('login')} className="bg-black text-white hover:bg-gray-900 rounded-none uppercase tracking-[0.2em] px-8 py-4 text-xs font-bold">Sign In</Button>
        </div>
     );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // We need to import api client or auth store
      // Assuming we can use the axios instance directly or via a store action
      // For now let's use the axios client directly if available or fetch
      // Use authService (which uses axiosClient)
      const data = {
         ...formData,
         skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : []
      };

      const res = await authService.becomeSeller(data);
      if (res.data) {
         updateUser(res.data);
      }
      
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Application failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
     return (
        <div className="bg-white min-h-screen text-black pt-24 pb-24 flex items-center justify-center">
           <div className="text-center space-y-6 max-w-lg px-6">
              <h1 className="text-4xl font-serif italic">Application Received.</h1>
              <p className="text-gray-500 font-light">We have received your submission. Our curators will review your portfolio and get back to you shortly.</p>
              <Button onClick={() => window.location.href='/'} className="bg-black text-white hover:bg-gray-900 rounded-none uppercase tracking-[0.2em] px-8 py-4 text-xs font-bold">Return Home</Button>
           </div>
        </div>
     )
  }

  return (
    <div className="bg-white min-h-screen text-black pt-24 pb-24">
      
      {/* Hero Section */}
      <section className="container mx-auto px-6 md:px-12 mb-32">
         <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center text-center space-y-8"
         >
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-gray-400">The Guild</span>
            <h1 className="text-5xl md:text-8xl tracking-tight leading-[0.9] font-medium max-w-4xl">
               Join the <span className="italic font-serif">collective</span>.
            </h1>
            <p className="max-w-md text-gray-500 font-light text-sm md:text-base leading-relaxed">
               We are searching for the exceptional. Submit your studio for consideration to join our curated marketplace of global makers.
            </p>
         </motion.div>
      </section>

      {/* Narrative Section */}
      <section className="container mx-auto px-6 md:px-12 mb-32 border-t border-gray-100 pt-20">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
            <div>
               <h2 className="text-3xl font-light tracking-tight mb-8">
                  A platform for the permanent.
               </h2>
               <div className="space-y-8">
                  <div>
                     <span className="block text-xs uppercase tracking-widest text-gray-400 mb-2">01 — Global Reach</span>
                     <p className="text-sm text-gray-600 font-light max-w-sm">
                        Connect with a discerning global audience seeking authenticity and craftsmanship without borders.
                     </p>
                  </div>
                  <div>
                     <span className="block text-xs uppercase tracking-widest text-gray-400 mb-2">02 — Curated Narrative</span>
                     <p className="text-sm text-gray-600 font-light max-w-sm">
                        Your work is presented alongside the world's finest, with editorial-quality storytelling and imagery.
                     </p>
                  </div>
               </div>
            </div>
            <div className="bg-gray-50 aspect-square md:aspect-[4/5] relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?q=80&w=2449&auto=format&fit=crop" 
                  alt="Artisan at work" 
                  className="w-full h-full object-cover grayscale-[20%]"
                />
            </div>
         </div>
      </section>

      {/* Application Form */}
      <section className="container mx-auto px-6 md:px-12 max-w-2xl">
         <div className="text-center mb-16">
            <h3 className="text-2xl font-light tracking-tight mb-4">Application</h3>
            <p className="text-xs uppercase tracking-widest text-gray-400">Reviewing submissions for Spring 2026</p>
         </div>

         {error && (
            <div className="bg-red-50 text-red-500 p-4 mb-8 text-center text-xs uppercase tracking-widest font-bold">
               {error}
            </div>
         )}

         <form onSubmit={handleSubmit} className="space-y-12">
            <div className="space-y-2">
               <label className="text-[10px] uppercase tracking-widest font-bold">Studio Name</label>
               <input name="studioName" value={formData.studioName} onChange={handleChange} type="text" className="w-full border-b border-gray-200 py-2 outline-none focus:border-black transition-colors bg-transparent placeholder:text-gray-300" placeholder="e.g. Clay & Co." required />
            </div>

            <div className="space-y-2">
               <label className="text-[10px] uppercase tracking-widest font-bold">Telephone</label>
               <input name="telephone" value={formData.telephone} onChange={handleChange} type="text" className="w-full border-b border-gray-200 py-2 outline-none focus:border-black transition-colors bg-transparent placeholder:text-gray-300" placeholder="+1 234 567 8900" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold">Location</label>
                  <input name="location" value={formData.location} onChange={handleChange} type="text" className="w-full border-b border-gray-200 py-2 outline-none focus:border-black transition-colors bg-transparent placeholder:text-gray-300" placeholder="City, Country" required />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold">Category</label>
                  <input name="category" value={formData.category} onChange={handleChange} type="text" className="w-full border-b border-gray-200 py-2 outline-none focus:border-black transition-colors bg-transparent placeholder:text-gray-300" placeholder="Ceramics, Textiles, etc." required />
               </div>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold">Experience</label>
                  <input name="experience" value={formData.experience} onChange={handleChange} type="text" className="w-full border-b border-gray-200 py-2 outline-none focus:border-black transition-colors bg-transparent placeholder:text-gray-300" placeholder="e.g. 5 Years" required />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold">Skills</label>
                  <input name="skills" value={formData.skills} onChange={handleChange} type="text" className="w-full border-b border-gray-200 py-2 outline-none focus:border-black transition-colors bg-transparent placeholder:text-gray-300" placeholder="Pottery, Glazing (comma separated)" />
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] uppercase tracking-widest font-bold">Portfolio / Instagram</label>
               <input name="portfolio" value={formData.portfolio} onChange={handleChange} type="text" className="w-full border-b border-gray-200 py-2 outline-none focus:border-black transition-colors bg-transparent placeholder:text-gray-300" placeholder="https://" />
            </div>

            <div className="space-y-2">
               <label className="text-[10px] uppercase tracking-widest font-bold">Tell us about your process</label>
               <textarea name="process" value={formData.process} onChange={handleChange} className="w-full border-b border-gray-200 py-2 outline-none focus:border-black transition-colors bg-transparent placeholder:text-gray-300 resize-none h-24" placeholder="Materials, lineage, philosophy..." required></textarea>
            </div>

            <div className="pt-8">
               <Button type="submit" disabled={loading} className="w-full h-14 bg-black text-white hover:bg-gray-900 rounded-none text-xs uppercase tracking-[0.2em] font-bold transition-all disabled:opacity-50">
                  {loading ? 'Submitting...' : 'Submit Application'} <ArrowUpRight className="ml-2 w-4 h-4" />
               </Button>
            </div>
         </form>
      </section>

    </div>
  );
};

export default ArtisanApplication;
