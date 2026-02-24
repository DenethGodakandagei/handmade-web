import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { Button } from '@/components/ui/button';

const ARTISANS = [
  {
    id: 1,
    name: 'Elias Thorne',
    craft: 'Blacksmithing',
    location: 'Oslo, Norway',
    bio: 'Forging modern heirlooms from reclaimed Nordic steel. A study in permanence and utility.',
    image: '/images/artisan-1.png',
    tags: ['Metal', 'Heritage', 'Tools']
  },
  {
    id: 2,
    name: 'Elena Rossi',
    craft: 'Ceramics',
    location: 'Florence, Italy',
    bio: 'Hand-thrown stoneware focusing on organic forms and natural glazes inspired by the Tuscan landscape.',
    image: '/images/artisan-2.png',
    tags: ['Clay', 'Tableware', 'Organic']
  },
  {
    id: 3,
    name: 'Kenji Sato',
    craft: 'Woodworking',
    location: 'Kyoto, Japan',
    bio: 'Preserving traditional joinery techniques in contemporary furniture design.',
    image: '/images/artisan-3.png',
    tags: ['Wood', 'Furniture', 'Minimalism']
  },
  {
    id: 4,
    name: 'Sarah Chen',
    craft: 'Textile Art',
    location: 'Vancouver, Canada',
    bio: 'Weaving narratives through hand-dyed natural fibers and ancient loom patterns.',
    image: '/images/artisan-4.png',
    tags: ['Fiber', 'Weaving', 'Art']
  }
];

const Artisans = () => {
  const navigate = useNavigate();
  const { isAuthenticated, openAuthModal } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');

  const handleApply = () => {
    if (isAuthenticated) {
      navigate('/artisans/apply');
    } else {
      openAuthModal('login');
      // Ideally pass a callback or state to redirect after login, but for now user will stay on page and can click again.
      // Or we can assume modal close doesn't redirect.
      // User flow: Click Join -> Login Modal -> (User logs in) -> Modal closes -> User clicks Join again -> Redirects.
      // This is acceptable for MVP.
    }
  };

  const filteredArtisans = ARTISANS.filter(artisan => 
    artisan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artisan.craft.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artisan.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white min-h-screen pt-24 pb-20 font-sans text-black">
      
      {/* Header Area */}
      <section className="container mx-auto px-6 md:px-12 mb-20">
         <div className="flex flex-col md:flex-row justify-between items-end gap-8 pb-12 border-b border-gray-100">
            <div>
               <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">The Directory</span>
               <h1 className="text-4xl md:text-6xl tracking-tight leading-none font-medium">
                  Global <span className="italic font-serif text-gray-400">Makers</span>
               </h1>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
               <div className="relative group w-full sm:w-64">
                  <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                  <input 
                     type="text" 
                     placeholder="Search artisans, location..." 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="w-full pl-8 pr-4 py-2 bg-transparent border-b border-gray-200 outline-none focus:border-black transition-colors placeholder:text-gray-300 text-sm"
                  />
               </div>
               <Button 
                  onClick={handleApply}
                  className="w-full sm:w-auto bg-black text-white hover:bg-gray-900 rounded-none text-xs uppercase tracking-[0.1em] font-bold px-8 h-10"
               >
                  Join The Guild
               </Button>
            </div>
         </div>
      </section>

      {/* Grid */}
      <section className="container mx-auto px-6 md:px-12">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredArtisans.map((artisan) => (
               <motion.div 
                  key={artisan.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="group cursor-pointer"
               >
                  <div className="aspect-square bg-gray-50 mb-4 overflow-hidden relative">
                     <img 
                        src={artisan.image} 
                        alt={artisan.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale-[10%] group-hover:grayscale-0"
                     />
                     <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                  </div>
                  
                  <div className="space-y-2">
                     <div className="flex justify-between items-start">
                        <h3 className="font-serif text-xl leading-none">{artisan.name}</h3>
                        <span className="text-[10px] uppercase tracking-widest border border-gray-200 px-2 py-0.5 rounded-full text-gray-500">{artisan.craft}</span>
                     </div>
                     
                     <div className="flex items-center text-xs text-gray-400 font-medium uppercase tracking-wider">
                        <MapPin className="w-3 h-3 mr-1" />
                        {artisan.location}
                     </div>

                     <p className="text-sm text-gray-500 font-light line-clamp-2 leading-relaxed pt-2">
                        {artisan.bio}
                     </p>
                  </div>
               </motion.div>
            ))}
         </div>

         {filteredArtisans.length === 0 && (
            <div className="py-32 text-center">
               <p className="text-gray-400 font-serif italic text-xl">No artisans found.</p>
               <Button variant="link" onClick={() => setSearchQuery('')} className="mt-2">Clear search</Button>
            </div>
         )}
      </section>

    </div>
  );
};

export default Artisans;
