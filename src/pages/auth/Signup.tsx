import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { EmeraldButton } from '@/src/components/ui/EmeraldButton';
import { Input } from '@/src/components/ui/Input';
import { motion } from 'motion/react';

export default function Signup() {
  const [userType, setUserType] = useState('Customer');
  const navigate = useNavigate();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/kyc');
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Full Name" placeholder="Aynan Nishat" required />
              <Input label="Email" placeholder="you@example.com" type="email" required />
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
                <Input placeholder="01X XXXX XXXX" className="flex-1" />
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
              <Input label="Password" placeholder="••••••••" type="password" required />
              <Input label="Confirm Password" placeholder="••••••••" type="password" required />
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

            <EmeraldButton type="submit" className="w-full py-4 text-lg">
              Create Account
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                →
              </motion.span>
            </EmeraldButton>
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
