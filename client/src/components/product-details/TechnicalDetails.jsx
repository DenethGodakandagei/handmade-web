import React from 'react';
import { motion } from 'framer-motion';

const TechnicalDetails = () => {
    return (
        <div className="container mx-auto px-6 md:px-12">
            <motion.section 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-10"
            >
                <div className="space-y-4">
                   <h4 className="text-[10px] font-bold uppercase tracking-widest text-black">Craftsmanship</h4>
                   <p className="text-xs text-gray-500 font-light leading-relaxed">
                     Hand-forged using traditional techniques passed down through five generations. Each surface imperfection tells the story of its creation.
                   </p>
                </div>
                <div className="space-y-4">
                   <h4 className="text-[10px] font-bold uppercase tracking-widest text-black">Dimensions & Care</h4>
                   <div className="text-xs text-gray-500 font-light leading-relaxed space-y-1">
                     <p><span className="font-medium text-black">Dimensions:</span> 12" x 8" x 4"</p>
                     <p><span className="font-medium text-black">Material:</span> Organic Clay & Glaze</p>
                     <p><span className="font-medium text-black">Care:</span> Wipe with a dry cloth.</p>
                   </div>
                </div>
                <div className="space-y-4">
                   <h4 className="text-[10px] font-bold uppercase tracking-widest text-black">Shipping & Returns</h4>
                   <p className="text-xs text-gray-500 font-light leading-relaxed">
                     Ships within 3-5 business days. Returns accepted within 30 days of delivery in original condition if accompanied by receipt.
                   </p>
                </div>
            </motion.section>
        </div>
    );
};

export default TechnicalDetails;
