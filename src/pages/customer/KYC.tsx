import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/src/components/layout/DashboardLayout';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { EmeraldButton } from '@/src/components/ui/EmeraldButton';
import { Check, Upload, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

export default function KYC() {
  const navigate = useNavigate();
  const [step, setStep] = useState(2); // Starting at Document Upload as per design
  const [userType, setUserType] = useState('Adult');
  const [cardType, setCardType] = useState('NID');

  const steps = [
    { id: 1, label: 'Personal Info' },
    { id: 2, label: 'Document Upload' },
    { id: 3, label: 'Review' },
  ];

  return (
    <DashboardLayout userName="Aynan Nishat">
      <div className="max-w-4xl mx-auto py-4">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">KYC Verification</h1>
          <p className="text-slate-500">Complete identity verification to unlock all features</p>
        </header>

        <GlassCard className="p-10">
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
                    onClick={() => setUserType(type)}
                    className={cn(
                      "px-8 py-3 rounded-xl font-semibold transition-all border-2",
                      userType === type 
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
              {[
                { label: 'Upload Front', icon: <Upload className="w-8 h-8 text-emerald-500" /> },
                { label: 'Upload Back', icon: <Upload className="w-8 h-8 text-emerald-500" /> }
              ].map((box, idx) => (
                <div 
                  key={idx}
                  className="border-2 border-dashed border-emerald-300 bg-emerald-50/30 rounded-3xl p-10 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:bg-emerald-50 transition-all"
                >
                  <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    {box.icon}
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-slate-800 mb-1">{box.label}</p>
                    <p className="text-[10px] text-slate-500 font-medium">JPG, PNG or PDF — max 5 MB</p>
                  </div>
                  <EmeraldButton variant="secondary" className="mt-2 py-2 px-6 text-xs">
                    Browse files
                  </EmeraldButton>
                </div>
              ))}
            </div>

            <EmeraldButton 
              className="w-full py-4 text-lg mt-4" 
              onClick={() => navigate('/dashboard')}
            >
              <Shield className="w-5 h-5" />
              Submit for Verification
            </EmeraldButton>
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
