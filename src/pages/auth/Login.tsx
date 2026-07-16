import React from "react";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/src/lib/firebase';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { EmeraldButton } from '@/src/components/ui/EmeraldButton';
import { Input } from '@/src/components/ui/Input';
import { Send, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user profile exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Create basic profile if it doesn't exist
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          fullName: user.displayName || 'Google User',
          email: user.email,
          phone: '',
          userType: 'Customer', // Default to Customer for Google Sign In
          kycStatus: 'Pending',
          userStatus: 'Active',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        navigate('/kyc');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Google sign in failed.');
      console.error(err);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left side: Branding/Visual */}
        <div className="hidden lg:block relative">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-200">
                <Send className="text-white w-8 h-8 rotate-[-15deg]" />
              </div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">EV Ride</h1>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-4 bg-emerald-400/20 blur-3xl rounded-full" />
              <GlassCard className="relative overflow-hidden bg-emerald-50/50 border-emerald-100">
                <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-[10px] font-bold text-emerald-600 uppercase tracking-widest shadow-sm">
                  100% Electric
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=800&auto=format&fit=crop" 
                  alt="EV Car" 
                  className="w-full h-48 object-cover rounded-2xl mb-4"
                />
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-800">Zero Emissions</h3>
                    <p className="text-sm text-slate-500">Cleaner future for everyone</p>
                  </div>
                  <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm">
                     <p className="text-xs font-bold text-slate-800">4.9 ★</p>
                     <p className="text-[10px] text-slate-400">Avg rating</p>
                  </div>
                </div>
              </GlassCard>
            </div>
          </motion.div>
        </div>

        {/* Right side: Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="max-w-md mx-auto p-10">
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome back</h2>
              <p className="text-slate-500">Sign in to your EV Ride account</p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-6">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-sm font-medium"
                  >
                    <AlertCircle size={18} />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <Input 
                label="Email" 
                placeholder="you@example.com" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              
              <div className="relative">
                <Input 
                  label="Password" 
                  placeholder="••••••••" 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[38px] text-slate-400 hover:text-emerald-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500/20" />
                  <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800">Remember me</span>
                </label>
                <Link to="/forgot-password" title="Forgot password?" className="text-sm font-bold text-emerald-600 hover:text-emerald-700">
                  Forgot password?
                </Link>
              </div>

              <EmeraldButton type="submit" className="w-full py-4 text-lg" disabled={loading || googleLoading}>
                {loading ? 'Signing in...' : 'Sign In'}
                {!loading && (
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    →
                  </motion.span>
                )}
              </EmeraldButton>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white/80 backdrop-blur px-4 text-slate-400 font-bold tracking-widest">or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button" 
                  onClick={handleGoogleSignIn}
                  disabled={loading || googleLoading}
                  className="flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-semibold text-slate-600 disabled:opacity-50"
                >
                   <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                   {googleLoading ? '...' : 'Google'}
                </button>
                <button type="button" className="flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-semibold text-slate-600">
                   <img src="https://www.svgrepo.com/show/303108/apple-black-logo.svg" className="w-5 h-5" alt="Apple" />
                   Apple
                </button>
              </div>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500">
              No account?{' '}
              <Link to="/signup" className="font-bold text-emerald-600 hover:text-emerald-700">
                Sign up
              </Link>
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
