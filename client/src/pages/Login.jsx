import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] px-6 py-24 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full -translate-x-1/2 translate-y-1/2"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-lg z-10"
      >
        <div className="text-center mb-10 space-y-4">
          <div className="bg-white p-4 rounded-3xl shadow-xl shadow-black/5 inline-flex items-center justify-center mb-6 border border-gray-50">
            <ShieldCheck size={32} className="text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter uppercase leading-none">Initialize <br />Heritage.</h1>
          <p className="text-gray-400 font-light flex items-center justify-center space-x-2">
            <Sparkles size={14} className="text-primary" />
            <span>Identity verification required for archive access.</span>
          </p>
        </div>

        <Card className="rounded-[3rem] border-none shadow-3xl shadow-primary/5 bg-white p-4 overflow-hidden">
          <CardContent className="p-8 space-y-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl text-[10px] flex items-center space-x-3 font-black uppercase tracking-widest"
              >
                <div className="w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center shrink-0">!</div>
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.4em] text-primary ml-4">Primary Identity</Label>
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="NAME@ARCHIVE.COM"
                    className="w-full bg-gray-50/50 border-gray-100 pl-16 pr-8 py-5 rounded-3xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-bold uppercase tracking-widest placeholder:text-gray-200"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between ml-4">
                  <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Cipher Key</Label>
                  <Link to="/forgot-password" size="sm" className="text-[10px] font-black text-gray-300 hover:text-primary uppercase tracking-widest mr-4">
                    Lost Key?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-50/50 border-gray-100 pl-16 pr-8 py-5 rounded-3xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-bold uppercase tracking-widest placeholder:text-gray-200"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full btn-artisan h-16 rounded-full shadow-2xl shadow-primary/30 mt-4"
              >
                {loading ? (
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <span className="flex items-center space-x-3">
                    <LogIn size={20} />
                    <span className="text-xs font-black uppercase tracking-[0.2em]">Open Archives</span>
                  </span>
                )}
              </Button>
            </form>

            <div className="pt-8 text-center bg-gray-50/50 -mx-8 -mb-8 p-8 border-t border-gray-100">
              <p className="text-[10px] font-black tracking-[0.3em] uppercase text-gray-400">
                No active lineage?{' '}
                <Link to="/register" className="text-primary hover:underline underline-offset-8" onClick={clearError}>
                  Establish Identity
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-12 text-center text-[10px] font-bold uppercase tracking-[0.5em] text-gray-300">
          World-Class Security Handshake Active
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
