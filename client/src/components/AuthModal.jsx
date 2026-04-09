import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const AuthModal = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalView,
    toggleAuthModalView,
    login,
    register: registerUser,
    error: authError,
    isAuthenticated
  } = useAuth();

  const [loading, setLoading] = useState(false);

  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    reset: resetLogin,
    formState: { errors: loginErrors }
  } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const {
    register: registerRegister,
    handleSubmit: handleSubmitRegister,
    reset: resetRegister,
    formState: { errors: registerErrors }
  } = useForm({
    resolver: zodResolver(registerSchema)
  });

  useEffect(() => {
    if (isAuthenticated) closeAuthModal();
  }, [isAuthenticated, closeAuthModal]);

  const onLogin = async (data) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Welcome back.');
      closeAuthModal();
      resetLogin();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onRegister = async (data) => {
    setLoading(true);
    try {
      await registerUser({ name: data.name, email: data.email, password: data.password, confirmPassword: data.confirmPassword });
      toast.success('Account created.');
      closeAuthModal();
      resetRegister();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAuthModal}
            className="absolute inset-0 bg-white/80 backdrop-blur-sm transition-opacity"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-sm bg-white p-12 shadow-2xl shadow-black/5"
          >
            <button
              onClick={closeAuthModal}
              className="absolute top-6 right-6 text-black hover:opacity-50 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-12 text-center">
              <h2 className="font-serif text-3xl font-normal text-black mb-2">
                {authModalView === 'login' ? 'Sign In.' : 'Join Us.'}
              </h2>
              <p className="text-xs uppercase tracking-widest text-gray-400">
                {authModalView === 'login' ? 'Welcome back to the archive.' : 'Begin your collection.'}
              </p>
            </div>

            {authModalView === 'login' ? (
              <form onSubmit={handleSubmitLogin(onLogin)} className="space-y-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <input
                      {...registerLogin('email')}
                      placeholder="Email Address"
                      className="w-full border-b border-gray-200 py-3 text-sm outline-none placeholder:text-gray-300 focus:border-black transition-colors bg-transparent"
                    />
                    {loginErrors.email && <p className="text-[10px] text-red-500">{loginErrors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <input
                      {...registerLogin('password')}
                      type="password"
                      placeholder="Password"
                      className="w-full border-b border-gray-200 py-3 text-sm outline-none placeholder:text-gray-300 focus:border-black transition-colors bg-transparent"
                    />
                    {loginErrors.password && <p className="text-[10px] text-red-500">{loginErrors.password.message}</p>}
                  </div>
                </div>

                {authError && <p className="text-xs text-red-500 text-center">{authError}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-900 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Enter'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmitRegister(onRegister)} className="space-y-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <input
                      {...registerRegister('name')}
                      placeholder="Full Name"
                      className="w-full border-b border-gray-200 py-3 text-sm outline-none placeholder:text-gray-300 focus:border-black transition-colors bg-transparent"
                    />
                    {registerErrors.name && <p className="text-[10px] text-red-500">{registerErrors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <input
                      {...registerRegister('email')}
                      placeholder="Email Address"
                      className="w-full border-b border-gray-200 py-3 text-sm outline-none placeholder:text-gray-300 focus:border-black transition-colors bg-transparent"
                    />
                    {registerErrors.email && <p className="text-[10px] text-red-500">{registerErrors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <input
                      {...registerRegister('password')}
                      type="password"
                      placeholder="Password"
                      className="w-full border-b border-gray-200 py-3 text-sm outline-none placeholder:text-gray-300 focus:border-black transition-colors bg-transparent"
                    />
                    {registerErrors.password && <p className="text-[10px] text-red-500">{registerErrors.password.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <input
                      {...registerRegister('confirmPassword')}
                      type="password"
                      placeholder="Confirm Password"
                      className="w-full border-b border-gray-200 py-3 text-sm outline-none placeholder:text-gray-300 focus:border-black transition-colors bg-transparent"
                    />
                    {registerErrors.confirmPassword && <p className="text-[10px] text-red-500">{registerErrors.confirmPassword.message}</p>}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-900 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Create Account'}
                </button>
              </form>
            )}

            <div className="mt-8 text-center">
              <button
                onClick={toggleAuthModalView}
                className="text-xs text-gray-400 uppercase tracking-widest hover:text-black transition-colors"
              >
                {authModalView === 'login' ? "Create an account" : "Back to Login"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
