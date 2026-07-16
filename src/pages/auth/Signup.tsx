import React from "react";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/src/lib/firebase';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { EmeraldButton } from '@/src/components/ui/EmeraldButton';
import { Input } from '@/src/components/ui/Input';
import { AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Signup() {
  const [userType, setUserType] = useState('Customer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        fullName,
        email,
        phone,
        userType,
        kycStatus: 'Not Started',
        userStatus: userType === 'Rider' ? 'Offline' : 'Active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      navigate(userType === 'Rider' ? '/rider/kyc' : '/kyc');
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
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
          kycStatus: 'Not Started',
          userStatus: 'Active',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        navigate('/kyc');
      } else {
        const userData = userDoc.data();
        if (userData.userType === 'Rider') {
          navigate('/rider/dashboard');
        } else {
          navigate('/dashboard');
        }
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <GlassCard className="p-10">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Create account</h2>
            <p className="text-slate-500">Join the EV ride-sharing revolution</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Full Name" 
                placeholder="Aynan Nishat" 
                required 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <Input 
                label="Email" 
                placeholder="you@example.com" 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                Phone Number
              </label>
              <div className="flex gap-3">
                <div className="w-24">
                  <select className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 outline-hidden focus:border-emerald-500 transition-all font-medium text-slate-600">
                    <option>+880</option>
                  </select>
                </div>
                <Input 
                  placeholder="01X XXXX XXXX" 
                  className="flex-1" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                I am a...
              </label>
              <div className="grid grid-cols-2 gap-4">
                {['Customer', 'Rider'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setUserType(type)}
                    className={`py-3 px-4 rounded-xl border-2 transition-all font-semibold ${
                      userType === type
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                        : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Password" 
                placeholder="••••••••" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input 
                label="Confirm Password" 
                placeholder="••••••••" 
                type="password" 
                required 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="flex items-start gap-3 px-1">
              <input 
                type="checkbox" 
                id="terms"
                required
                className="mt-1 w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500/20" 
              />
              <label htmlFor="terms" className="text-sm text-slate-500 leading-relaxed">
                I agree to the <Link to="/terms" className="text-emerald-600 font-bold">Terms of Service</Link> and <Link to="/privacy" className="text-emerald-600 font-bold">Privacy Policy</Link>
              </label>
            </div>

            <EmeraldButton type="submit" className="w-full py-4 text-lg" disabled={loading || googleLoading}>
              {loading ? 'Creating Account...' : 'Create Account'}
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
                <span className="bg-white/80 backdrop-blur px-4 text-slate-400 font-bold tracking-widest">or sign up with</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-700">
              Sign in
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
