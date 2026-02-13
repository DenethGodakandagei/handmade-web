import React from 'react';
import { Mail, MapPin, Phone, Send, User, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // Assuming Textarea exists or I'll use standard textarea
import { toast } from 'sonner';

const Contact = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Message Transmitted', {
      description: 'Our heritage council will review your correspondence shortly.',
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-24 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div className="space-y-12">
           <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 bg-white px-6 py-2 rounded-full shadow-sm border border-gray-50">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Concierge Online</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85] text-balance">
                 Direct <br /><span className="text-primary italic font-light">Lineage.</span>
              </h1>
              <p className="text-xl text-gray-400 font-light max-w-lg leading-relaxed">
                 Whether you're a curator seeking a rare commission or an artisan looking to join the order, our encrypted channels are open.
              </p>
           </div>

           <div className="space-y-8">
              <div className="flex items-start space-x-6 group cursor-pointer">
                 <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-gray-300 group-hover:bg-primary group-hover:text-white transition-all shadow-xl shadow-black/5">
                    <MapPin size={24} />
                 </div>
                 <div className="space-y-1">
                    <h3 className="text-sm font-black uppercase tracking-widest">Headquarters</h3>
                    <p className="text-gray-400 text-sm font-medium">124 Heritage Blvd, Artisan District<br/>Colombo, Sri Lanka</p>
                 </div>
              </div>
              
              <div className="flex items-start space-x-6 group cursor-pointer">
                 <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-gray-300 group-hover:bg-primary group-hover:text-white transition-all shadow-xl shadow-black/5">
                    <Mail size={24} />
                 </div>
                 <div className="space-y-1">
                    <h3 className="text-sm font-black uppercase tracking-widest">Digital Correspondence</h3>
                    <p className="text-gray-400 text-sm font-medium">concierge@artisanconnect.com<br/>partnerships@artisanconnect.com</p>
                 </div>
              </div>

              <div className="flex items-start space-x-6 group cursor-pointer">
                 <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-gray-300 group-hover:bg-primary group-hover:text-white transition-all shadow-xl shadow-black/5">
                    <Phone size={24} />
                 </div>
                 <div className="space-y-1">
                    <h3 className="text-sm font-black uppercase tracking-widest">Voice Line</h3>
                    <p className="text-gray-400 text-sm font-medium">+94 11 234 5678<br/>Mon - Fri, 9am - 6pm IST</p>
                 </div>
              </div>
           </div>
        </div>

        <div className="bg-white p-10 md:p-16 rounded-[4rem] shadow-2xl shadow-primary/5 border border-gray-50 relative">
           <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              <div className="space-y-4">
                 <h3 className="text-2xl font-black uppercase tracking-tighter mb-8">Secure Transmission</h3>
                 
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">Identity</label>
                       <div className="relative">
                          <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                          <Input className="bg-gray-50 border-transparent pl-14 h-14 rounded-2xl" placeholder="Full Name" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">Contact Point</label>
                       <div className="relative">
                          <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                          <Input className="bg-gray-50 border-transparent pl-14 h-14 rounded-2xl" placeholder="Email Address" />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">Subject Matter</label>
                    <div className="relative">
                       <MessageCircle className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                       <Input className="bg-gray-50 border-transparent pl-14 h-14 rounded-2xl" placeholder="Commission Inquiry / Partnership / support" />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">Transmission</label>
                    <Textarea 
                      className="w-full bg-gray-50 border-transparent p-6 rounded-3xl min-h-[150px] focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm resize-none"
                      placeholder="Type your message here..."
                    />
                 </div>
              </div>

              <Button type="submit" className="w-full btn-premium h-20 text-xs shadow-2xl flex justify-between items-center px-8 group">
                 <span>Send Transmission</span>
                 <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                    <Send size={16} />
                 </div>
              </Button>
           </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
