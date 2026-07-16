import React from "react";
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useAuthStore } from '@/src/store/useAuthStore';
import { DashboardLayout } from '@/src/components/layout/DashboardLayout';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { EmeraldButton } from '@/src/components/ui/EmeraldButton';
import { Check, Upload, Shield, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

export default function KYC() {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const userType = profile?.userType;

  React.useEffect(() => {
    if (userType === 'Rider') {
      navigate('/rider/kyc');
    }
  }, [userType, navigate]);

  const [step, setStep] = useState(2);
  const kycStatus = profile?.kycStatus || 'Not Started';
  const isBypassed = sessionStorage.getItem('kyc_bypass') === 'true';

  const [kycUserType, setKycUserType] = useState('Adult');
  const [cardType, setCardType] = useState('NID');
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  if (kycStatus === 'Pending' && !isBypassed) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto py-20 text-center">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 mb-4">Verification Under Review</h1>
          <p className="text-slate-500 max-w-lg mx-auto mb-10 leading-relaxed">
            Our team is currently reviewing your documents. This usually takes 24-48 hours. 
            We'll notify you once the process is complete.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <EmeraldButton onClick={() => navigate('/dashboard')} variant="secondary">
              Back to Dashboard
            </EmeraldButton>
            <button 
              onClick={() => {
                sessionStorage.setItem('kyc_bypass', 'true');
                window.location.reload();
              }}
              className="text-slate-400 text-sm font-medium hover:text-emerald-600 transition-colors underline underline-offset-4 decoration-slate-200"
            >
              Didn't submit yet? Click here to upload.
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (kycStatus === 'Approved') {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto py-20 text-center">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <ShieldCheck className="w-12 h-12 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 mb-4">Account Verified</h1>
          <p className="text-slate-500 max-w-lg mx-auto mb-10 leading-relaxed">
            Congratulations! Your identity has been verified. You now have full access to all features.
          </p>
          <EmeraldButton onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </EmeraldButton>
        </div>
      </DashboardLayout>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (side === 'front') setFrontImage(reader.result as string);
        else setBackImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!frontImage || !backImage) {
      setError('Please upload both front and back images of your document.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Save KYC data
      await setDoc(doc(db, 'kyc_submissions', user.uid), {
        userId: user.uid,
        userType: kycUserType,
        cardType,
        frontImage: frontImage.substring(0, 200000), // Base64 truncation for demo purposes to stay under 1MB
        backImage: backImage.substring(0, 200000),
        status: 'Pending',
        submittedAt: serverTimestamp(),
      });

      // Update user profile status
      await setDoc(doc(db, 'users', user.uid), {
        kycStatus: 'Pending',
        updatedAt: serverTimestamp(),
      }, { merge: true });

      sessionStorage.removeItem('kyc_bypass');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to submit KYC.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, label: 'Personal Info' },
    { id: 2, label: 'Document Upload' },
    { id: 3, label: 'Review' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-4">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">KYC Verification</h1>
          <p className="text-slate-500">Complete identity verification to unlock all features</p>
        </header>

        <GlassCard className="p-10">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 font-medium"
              >
                <AlertCircle size={20} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stepper */}
          <div className="flex items-center justify-center gap-4 mb-12">
            {steps.map((s, idx) => (
              <div key={s.id} className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  s.id < step ? "bg-emerald-500 text-white" : 
                  s.id === step ? "bg-emerald-100 text-emerald-600 ring-4 ring-emerald-500/10" : 
                  "bg-slate-100 text-slate-400"
                )}>
                  {s.id < step ? <Check size={16} strokeWidth={3} /> : s.id}
                </div>
                <span className={cn(
                  "text-sm font-semibold whitespace-nowrap",
                  s.id <= step ? "text-slate-800" : "text-slate-400"
                )}>
                  {s.label}
                </span>
                {idx < steps.length - 1 && <div className="w-8 h-[2px] bg-slate-100 mx-2" />}
              </div>
            ))}
          </div>

          <div className="space-y-10">
            {/* User Type Selection */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">User Type</label>
              <div className="flex gap-4">
                {['Adult', 'Student'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setKycUserType(type)}
                    className={cn(
                      "px-8 py-3 rounded-xl font-semibold transition-all border-2",
                      kycUserType === type 
                        ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200" 
                        : "bg-slate-50 border-slate-50 text-slate-400 hover:border-slate-200"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Card Type Selection */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Card Type</label>
              <div className="flex flex-wrap gap-4">
                {['NID', 'Passport', 'Student ID'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setCardType(type)}
                    className={cn(
                      "px-8 py-3 rounded-xl font-semibold transition-all border-2",
                      cardType === type 
                        ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200" 
                        : "bg-slate-50 border-slate-50 text-slate-400 hover:border-slate-200"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Upload Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <input 
                type="file" 
                ref={frontInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => handleFileChange(e, 'front')} 
              />
              <input 
                type="file" 
                ref={backInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => handleFileChange(e, 'back')} 
              />

              <div 
                onClick={() => frontInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center gap-4 group cursor-pointer transition-all relative overflow-hidden",
                  frontImage ? "border-emerald-500 bg-emerald-50" : "border-emerald-300 bg-emerald-50/30 hover:bg-emerald-50"
                )}
              >
                {frontImage ? (
                  <img src={frontImage} className="absolute inset-0 w-full h-full object-cover opacity-20" alt="Front" />
                ) : null}
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  {frontImage ? <Check className="w-8 h-8 text-emerald-500" /> : <Upload className="w-8 h-8 text-emerald-500" />}
                </div>
                <div className="text-center relative">
                  <p className="font-bold text-slate-800 mb-1">Upload Front</p>
                  <p className="text-[10px] text-slate-500 font-medium">{frontImage ? 'Image Selected' : 'JPG, PNG or PDF — max 5 MB'}</p>
                </div>
                {!frontImage && (
                  <EmeraldButton variant="secondary" className="mt-2 py-2 px-6 text-xs pointer-events-none">
                    Browse files
                  </EmeraldButton>
                )}
              </div>

              <div 
                onClick={() => backInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center gap-4 group cursor-pointer transition-all relative overflow-hidden",
                  backImage ? "border-emerald-500 bg-emerald-50" : "border-emerald-300 bg-emerald-50/30 hover:bg-emerald-50"
                )}
              >
                {backImage ? (
                  <img src={backImage} className="absolute inset-0 w-full h-full object-cover opacity-20" alt="Back" />
                ) : null}
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  {backImage ? <Check className="w-8 h-8 text-emerald-500" /> : <Upload className="w-8 h-8 text-emerald-500" />}
                </div>
                <div className="text-center relative">
                  <p className="font-bold text-slate-800 mb-1">Upload Back</p>
                  <p className="text-[10px] text-slate-500 font-medium">{backImage ? 'Image Selected' : 'JPG, PNG or PDF — max 5 MB'}</p>
                </div>
                {!backImage && (
                  <EmeraldButton variant="secondary" className="mt-2 py-2 px-6 text-xs pointer-events-none">
                    Browse files
                  </EmeraldButton>
                )}
              </div>
            </div>

            <EmeraldButton 
              className="w-full py-4 text-lg mt-4" 
              onClick={handleSubmit}
              disabled={loading || !user}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
              {loading ? 'Submitting...' : 'Submit for Verification'}
            </EmeraldButton>
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
