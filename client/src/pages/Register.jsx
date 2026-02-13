import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, AlertCircle, Briefcase, ShoppingBag, Sparkles, Fingerprint } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'buyer'
  });
  const { register, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register(formData);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] px-6 py-24 relative overflow-hidden">
      {/* Decorative Warm Glows */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-2xl z-10"
      >
        <div className="text-center mb-12 space-y-4">
           <div className="bg-white p-5 rounded-[2rem] shadow-2xl shadow-black/5 inline-flex items-center justify-center mb-6">
              <Fingerprint size={40} className="text-primary" />
           </div>
           <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter uppercase leading-[0.9]">Create New <br />Lineage.</h1>
           <p className="text-gray-400 font-light flex items-center justify-center space-x-2">
              <Sparkles size={14} className="text-primary" />
              <span>Join the global network of verified curators and artisans.</span>
           </p>
        </div>

        <Card className="rounded-[4rem] border-none shadow-3xl shadow-primary/10 bg-white p-6 overflow-hidden">
          <CardContent className="p-10 space-y-10">
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl text-[10px] flex items-center space-x-4 font-black uppercase tracking-widest"
              >
                <AlertCircle size={18} />
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Role Selection - Emotional Radios */}
              <div className="grid grid-cols-2 gap-4">
                 <button 
                   type="button"
                   onClick={() => setFormData({...formData, role: 'buyer'})}
                   className={`flex flex-col items-center gap-4 p-8 rounded-[2.5rem] border-2 transition-all duration-500 relative overflow-hidden group ${formData.role === 'buyer' ? 'border-primary bg-primary/5 shadow-xl shadow-primary/5' : 'border-gray-50 bg-gray-50/50 hover:bg-white hover:border-gray-200'}`}
                 >
                   {formData.role === 'buyer' && (
                      <motion.div layoutId="role-bg" className="absolute inset-0 bg-primary/5 -z-10" />
                   )}
                   <div className={`p-4 rounded-2xl transition-all ${formData.role === 'buyer' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white text-gray-300 group-hover:text-black'}`}>
                      <ShoppingBag size={24} />
                   </div>
                   <div className="text-center">
                      <span className={`block text-[11px] font-black uppercase tracking-widest ${formData.role === 'buyer' ? 'text-black' : 'text-gray-400'}`}>Collector</span>
                      <span className="text-[9px] text-gray-400 font-medium">Acquire treasures</span>
                   </div>
                 </button>

                 <button 
                   type="button"
                   onClick={() => setFormData({...formData, role: 'artisan'})}
                   className={`flex flex-col items-center gap-4 p-8 rounded-[2.5rem] border-2 transition-all duration-500 relative overflow-hidden group ${formData.role === 'artisan' ? 'border-primary bg-primary/5 shadow-xl shadow-primary/5' : 'border-gray-50 bg-gray-50/50 hover:bg-white hover:border-gray-200'}`}
                 >
                   <div className={`p-4 rounded-2xl transition-all ${formData.role === 'artisan' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white text-gray-300 group-hover:text-black'}`}>
                      <Briefcase size={24} />
                   </div>
                   <div className="text-center">
                      <span className={`block text-[11px] font-black uppercase tracking-widest ${formData.role === 'artisan' ? 'text-black' : 'text-gray-400'}`}>Artisan</span>
                      <span className="text-[9px] text-gray-400 font-medium">Exhibit mastery</span>
                   </div>
                 </button>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.4em] text-primary ml-6">Personal Code</Label>
                  <div className="relative group">
                    <User className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
                    <input
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="FULL NAME"
                      className="w-full bg-gray-50/50 border-gray-100 pl-20 pr-10 py-5 rounded-[2.5rem] focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-bold uppercase tracking-widest placeholder:text-gray-200"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.4em] text-primary ml-6">Digital Address</Label>
                  <div className="relative group">
                    <Mail className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="EMAIL@EXAMPLE.COM"
                      className="w-full bg-gray-50/50 border-gray-100 pl-20 pr-10 py-5 rounded-[2.5rem] focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-bold uppercase tracking-widest placeholder:text-gray-200"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.4em] text-primary ml-6">Master Key</Label>
                  <div className="relative group">
                    <Lock className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="MINIMUM 8 CHARACTERS"
                      className="w-full bg-gray-50/50 border-gray-100 pl-20 pr-10 py-5 rounded-[2.5rem] focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-bold uppercase tracking-widest placeholder:text-gray-200"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full btn-artisan h-20 rounded-full shadow-3xl shadow-primary/30 mt-6"
              >
                {loading ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <span className="flex items-center space-x-3">
                    <UserPlus size={22} />
                    <span className="text-xs font-black uppercase tracking-[0.3em]">Commit to Lineage</span>
                  </span>
                )}
              </Button>
            </form>

            <div className="pt-10 text-center bg-gray-50/50 -mx-10 -mb-10 p-10 border-t border-gray-50">
               <p className="text-[10px] font-black tracking-[0.4em] uppercase text-gray-400">
                  Already cataloged?{' '}
                  <Link to="/login" className="text-primary hover:underline underline-offset-8" onClick={clearError}>
                    Authenticate session
                  </Link>
               </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;
