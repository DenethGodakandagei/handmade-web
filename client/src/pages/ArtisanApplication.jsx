import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ArtisanApplication = () => {
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

         <form className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold">Studio Name</label>
                  <input type="text" className="w-full border-b border-gray-200 py-2 outline-none focus:border-black transition-colors bg-transparent placeholder:text-gray-300" placeholder="e.g. Clay & Co." />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold">Contact Person</label>
                  <input type="text" className="w-full border-b border-gray-200 py-2 outline-none focus:border-black transition-colors bg-transparent placeholder:text-gray-300" placeholder="Full Name" />
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] uppercase tracking-widest font-bold">Email Address</label>
               <input type="email" className="w-full border-b border-gray-200 py-2 outline-none focus:border-black transition-colors bg-transparent placeholder:text-gray-300" placeholder="studio@example.com" />
            </div>

            <div className="space-y-2">
               <label className="text-[10px] uppercase tracking-widest font-bold">Portfolio / Instagram</label>
               <input type="text" className="w-full border-b border-gray-200 py-2 outline-none focus:border-black transition-colors bg-transparent placeholder:text-gray-300" placeholder="https://" />
            </div>

            <div className="space-y-2">
               <label className="text-[10px] uppercase tracking-widest font-bold">Tell us about your process</label>
               <textarea className="w-full border-b border-gray-200 py-2 outline-none focus:border-black transition-colors bg-transparent placeholder:text-gray-300 resize-none h-24" placeholder="Materials, lineage, philosophy..."></textarea>
            </div>

            <div className="pt-8">
               <Button className="w-full h-14 bg-black text-white hover:bg-gray-900 rounded-none text-xs uppercase tracking-[0.2em] font-bold transition-all">
                  Submit Application <ArrowUpRight className="ml-2 w-4 h-4" />
               </Button>
            </div>
         </form>
      </section>

    </div>
  );
};

export default ArtisanApplication;
