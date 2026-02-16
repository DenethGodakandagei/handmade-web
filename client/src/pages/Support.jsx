import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Package, ShieldCheck, RefreshCw, BookOpen, AlertCircle, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const faqs = [
  {
    category: 'Orders & Logistics',
    items: [
      {
        q: "How do you track my heritage sequence?",
        a: "Every artifact is assigned a unique cryptographic hash upon creation. You can track its journey from the artisan's workshop to your doorstep via real-time GPS nodes."
      },
      {
        q: "What is the delivery timeline for commissions?",
        a: "Bespoke commissions typically require 4-6 weeks for crafting, followed by 5-7 days for global secure transport."
      }
    ]
  },
  {
    category: 'Authenticity & Purity',
    items: [
      {
        q: "How is material purity verified?",
        a: "We conduct independent spectral analysis on all raw materials. Every clay, wood, and fiber is certified 100% organic and locally sourced."
      },
      {
        q: "Do I receive a certificate of lineage?",
        a: "Yes. Every acquisition comes with a physical and digital certificate signed by the master artisan and the Heritage Council."
      }
    ]
  },
  {
    category: 'Returns & Safekeeping',
    items: [
      {
        q: "What is the return policy for artifacts?",
        a: "Due to the unique nature of handmade goods, returns are accepted only for damage during transit. Please report any anomalies within 48 hours of reception."
      }
    ]
  }
];

const Support = () => {
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-24 relative">
       {/* Hero */}
       <div className="container mx-auto px-6 mb-24 text-center max-w-4xl">
          <div className="inline-flex items-center space-x-2 bg-white px-6 py-2 rounded-full shadow-sm border border-gray-50 mb-8">
             <AlertCircle size={14} className="text-primary" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Knowledge Base</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter uppercase leading-[0.85] mb-8 text-balance">
             Heritage <br /><span className="text-primary italic font-light">Support Core.</span>
          </h1>
          <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto leading-relaxed mb-12">
             Access the central archive for protocols, logistics, and preservation guidelines.
          </p>
          
          <div className="relative max-w-2xl mx-auto group">
             <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={24} />
             <input 
               type="text" 
               placeholder="SEARCH PROTOCOLS..." 
               className="w-full bg-white h-20 pl-20 pr-8 rounded-[2rem] shadow-2xl shadow-primary/5 border border-gray-50 focus:outline-none focus:ring-4 focus:ring-primary/5 text-sm font-bold uppercase tracking-widest placeholder:text-gray-200 transition-all"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
          </div>
       </div>

       {/* Quick Access Grid */}
       <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-32">
          {[
            { icon: Package, title: "Track Order", desc: "Locate your shipment", link: "/orders" },
            { icon: ShieldCheck, title: "Verify Lineage", desc: "Check authenticity", link: "/collection" },
            { icon: RefreshCw, title: "Returns", desc: "Report damage", link: "/contact" },
            { icon: BookOpen, title: "Journal", desc: "Read preservation guide", link: "/blog" },
          ].map((item, i) => (
             <Link key={i} to={item.link} className="bg-white p-8 rounded-[2.5rem] border border-gray-50 hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-2 transition-all group flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-all">
                   <item.icon size={24} />
                </div>
                <div>
                   <h3 className="text-sm font-black uppercase tracking-widest mb-1">{item.title}</h3>
                   <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{item.desc}</p>
                </div>
             </Link>
          ))}
       </div>

       {/* FAQs */}
       <div className="container mx-auto px-6 max-w-3xl">
          <div className="space-y-16">
             {faqs.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                   <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-8 border-b border-gray-200 pb-4">{section.category}</h3>
                   <div className="space-y-4">
                      {section.items.map((item, i) => {
                         const index = `${sectionIndex}-${i}`;
                         return (
                            <div key={i} className="bg-white rounded-[2rem] border border-gray-50 overflow-hidden">
                               <button 
                                 onClick={() => toggleAccordion(index)}
                                 className="w-full flex justify-between items-center p-8 text-left hover:bg-gray-50 transition-colors"
                               >
                                  <span className="text-sm font-bold uppercase tracking-wide pr-8">{item.q}</span>
                                  <ChevronDown 
                                    size={16} 
                                    className={`text-gray-400 transition-transform duration-300 ${activeAccordion === index ? 'rotate-180' : ''}`} 
                                  />
                               </button>
                               <AnimatePresence>
                                  {activeAccordion === index && (
                                     <motion.div
                                       initial={{ height: 0, opacity: 0 }}
                                       animate={{ height: 'auto', opacity: 1 }}
                                       exit={{ height: 0, opacity: 0 }}
                                     >
                                        <div className="px-8 pb-8 pt-0 text-gray-500 font-light text-sm leading-relaxed border-t border-gray-50 mt-2">
                                           {item.a}
                                        </div>
                                     </motion.div>
                                  )}
                               </AnimatePresence>
                            </div>
                         );
                      })}
                   </div>
                </div>
             ))}
          </div>

          <div className="mt-24 bg-black text-white p-12 rounded-[3.5rem] text-center relative overflow-hidden">
             <div className="relative z-10 space-y-8">
                <h2 className="text-3xl font-black uppercase tracking-tighter">Still require assistance?</h2>
                <p className="text-gray-400 font-light max-w-md mx-auto">Our dedicated team of heritage consuls is available 24/7 to resolve complex inquiries.</p>
                <Button asChild className="btn-artisan h-16 bg-white text-black hover:bg-gray-200">
                   <Link to="/contact">Open Secure Channel</Link>
                </Button>
             </div>
          </div>
       </div>
    </div>
  );
};

export default Support;
