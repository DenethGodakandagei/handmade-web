import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ArtisanSection = ({ artisan }) => {
    if (!artisan) return null;

    const artisanName = artisan.name || "Unknown Artisan";
    const artisanImage = artisan.profilePicture || artisan.image; 
    const artisanLocation = artisan.location || "Sri Lanka";

    return (
        <div className="container mx-auto px-6 md:px-12">
            <motion.section 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="mt-32 border-t border-gray-100 pt-20"
            >
               <div className="max-w-4xl mx-auto">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 block mb-12 text-center">The Creator</span>
                  
                  <div className="bg-white border border-gray-100 p-8 md:p-12 flex flex-col md:flex-row gap-12 items-center">
                     <div className="w-40 h-40 shrink-0 bg-gray-50 overflow-hidden relative group">
                        <img 
                          src={artisanImage} 
                          alt={artisanName} 
                          className="w-full h-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                        />
                     </div>
                     
                     <div className="flex-1 text-center md:text-left space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                            <h3 className="text-3xl font-serif italic text-black">{artisanName}</h3>
                            <div className="flex items-center justify-center md:justify-start text-xs text-gray-400 uppercase tracking-widest">
                                <MapPin size={12} className="mr-2" />
                                {artisanLocation}
                            </div>
                        </div>
                        
                        <p className="text-sm text-gray-500 font-light leading-loose max-w-xl">
                            {artisan.bio || "Dedication to the craft defined by patience and respect for materials. Each piece is a dialogue between tradition and modern utility."}
                        </p>
    
                        <Link to="/artisans" className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest hover:underline underline-offset-4 decoration-1 transition-all mt-4 group">
                            View Artisan Profile <ArrowUpRight className="ml-1 w-3 h-3 text-gray-400 group-hover:text-black transition-colors" />
                        </Link>
                     </div>
                  </div>
               </div>
            </motion.section>
        </div>
    );
};

export default ArtisanSection;
