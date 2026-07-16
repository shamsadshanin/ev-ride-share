import React from "react";
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useAuthStore } from '@/src/store/useAuthStore';
import { DashboardLayout } from '@/src/components/layout/DashboardLayout';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { EmeraldButton } from '@/src/components/ui/EmeraldButton';
import { Car, Bike, Send, Minus, Plus, Upload, FileText, CreditCard, AlertCircle, Loader2, Check, ShieldCheck } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function VehicleKYC() {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const userType = profile?.userType;

  React.useEffect(() => {
    if (userType === 'Customer') {
      navigate('/kyc');
    }
  }, [userType, navigate]);

  const kycStatus = profile?.kycStatus || 'Not Started';
  const isBypassed = sessionStorage.getItem('kyc_bypass_rider') === 'true';

  const [selectedType, setSelectedType] = useState('EV Car');
  const [seats, setSeats] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Image states
  const [evPhoto, setEvPhoto] = useState<string | null>(null);
  const [regDocs, setRegDocs] = useState<string | null>(null);
  const [licenseFront, setLicenseFront] = useState<string | null>(null);
  const [licenseBack, setLicenseBack] = useState<string | null>(null);

  const evPhotoRef = useRef<HTMLInputElement>(null);
  const regDocsRef = useRef<HTMLInputElement>(null);
  const licenseFrontRef = useRef<HTMLInputElement>(null);
  const licenseBackRef = useRef<HTMLInputElement>(null);

  if (kycStatus === 'Pending' && !isBypassed) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto py-20 text-center">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 mb-4">Verification Under Review</h1>
          <p className="text-slate-500 max-w-lg mx-auto mb-10 leading-relaxed">
            Our team is currently reviewing your vehicle and driving documents. This usually takes 24-48 hours. 
            We'll notify you once the process is complete.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <EmeraldButton onClick={() => navigate('/rider/dashboard')} variant="secondary">
              Back to Dashboard
            </EmeraldButton>
            <button 
              onClick={() => {
                sessionStorage.setItem('kyc_bypass_rider', 'true');
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
          <h1 className="text-3xl font-black text-slate-800 mb-4">Rider Verified</h1>
          <p className="text-slate-500 max-w-lg mx-auto mb-10 leading-relaxed">
            Congratulations! Your vehicle and identity have been verified. You can now start accepting ride requests.
          </p>
          <EmeraldButton onClick={() => navigate('/rider/dashboard')}>
            Go to Dashboard
          </EmeraldButton>
        </div>
      </DashboardLayout>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (type === 'evPhoto') setEvPhoto(base64String);
        if (type === 'regDocs') setRegDocs(base64String);
        if (type === 'licenseFront') setLicenseFront(base64String);
        if (type === 'licenseBack') setLicenseBack(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!evPhoto || !regDocs || !licenseFront || !licenseBack) {
      setError('Please upload all required photos and documents.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Save Rider KYC data
      await setDoc(doc(db, 'rider_kyc_submissions', user.uid), {
        userId: user.uid,
        vehicleType: selectedType,
        seatCapacity: seats,
        evPhoto: evPhoto.substring(0, 200000),
        registrationDocs: regDocs.substring(0, 200000),
        licenseFront: licenseFront.substring(0, 200000),
        licenseBack: licenseBack.substring(0, 200000),
        status: 'Pending',
        submittedAt: serverTimestamp(),
      });

      // Update user profile status
      await setDoc(doc(db, 'users', user.uid), {
        kycStatus: 'Pending',
        updatedAt: serverTimestamp(),
      }, { merge: true });

      sessionStorage.removeItem('kyc_bypass_rider');
      navigate('/rider/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to submit Rider KYC.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const vehicleTypes = [
    { id: 'EV Car', icon: <Car size={18} /> },
    { id: 'eBike', icon: <Bike size={18} /> },
    { id: 'CNG', icon: <Send size={18} /> }
  ];

  const docs = [
    { id: 'regDocs', label: 'Vehicle Registration Papers (PDF)', icon: <FileText size={16} />, state: regDocs, ref: regDocsRef },
    { id: 'licenseFront', label: 'Driving License — Front Side', icon: <CreditCard size={16} />, state: licenseFront, ref: licenseFrontRef },
    { id: 'licenseBack', label: 'Driving License — Back Side', icon: <CreditCard size={16} />, state: licenseBack, ref: licenseBackRef }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-4">
        <header className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Vehicle Registration & KYC</h1>
          <p className="text-slate-500">Complete your vehicle setup to start accepting rides</p>
        </header>

        <GlassCard className="p-10 space-y-10">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 font-medium"
              >
                <AlertCircle size={20} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Vehicle Type & Seats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Choose EV Type</label>
              <div className="flex gap-3">
                {vehicleTypes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedType(t.id)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all font-bold text-sm",
                      selectedType === t.id 
                        ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200" 
                        : "bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200"
                    )}
                  >
                    {t.icon}
                    {t.id}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Seat Capacity</label>
              <div className="flex items-center justify-between bg-slate-50 p-2 rounded-2xl border border-slate-100">
                <button 
                  onClick={() => setSeats(Math.max(1, seats - 1))}
                  className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 shadow-sm"
                >
                  <Minus size={18} className="text-slate-400" />
                </button>
                <div className="text-center">
                   <span className="text-xl font-black text-slate-800 block">{seats}</span>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Excluding driver</span>
                </div>
                <button 
                  onClick={() => setSeats(Math.min(6, seats + 1))}
                  className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 shadow-lg shadow-emerald-100"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Photo Upload */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">EV Photo</label>
            <input 
              type="file" 
              ref={evPhotoRef} 
              className="hidden" 
              accept="image/*" 
              onChange={(e) => handleFileChange(e, 'evPhoto')} 
            />
            <div 
              onClick={() => evPhotoRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center gap-4 group cursor-pointer transition-all relative overflow-hidden",
                evPhoto ? "border-emerald-500 bg-emerald-50" : "border-emerald-200 bg-emerald-50/20 hover:bg-emerald-50"
              )}
            >
              {evPhoto ? (
                <img src={evPhoto} className="absolute inset-0 w-full h-full object-cover opacity-20" alt="EV" />
              ) : null}
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-500 transition-transform group-hover:scale-110">
                {evPhoto ? <Check size={32} /> : <Car size={32} />}
              </div>
              <div className="text-center relative">
                <p className="font-bold text-slate-800">{evPhoto ? 'Photo Selected' : 'Drag and drop your EV photo'}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">JPG or PNG, min 800×600px</p>
              </div>
              {!evPhoto && (
                <EmeraldButton variant="secondary" className="px-8 py-2.5 text-xs pointer-events-none">
                  Browse Files
                </EmeraldButton>
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Required Documents</label>
            <div className="space-y-3">
              {docs.map((docItem, idx) => (
                <div key={idx} className="flex flex-col">
                  <input 
                    type="file" 
                    ref={docItem.ref} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => handleFileChange(e, docItem.id)} 
                  />
                  <div 
                    onClick={() => docItem.ref.current?.click()}
                    className={cn(
                      "flex items-center justify-between p-5 rounded-2xl border transition-all group cursor-pointer relative overflow-hidden",
                      docItem.state ? "border-emerald-500 bg-emerald-50" : "border-slate-100 bg-white hover:border-emerald-200"
                    )}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                        docItem.state ? "bg-emerald-200 text-emerald-600" : "bg-slate-50 text-slate-400 group-hover:text-emerald-500"
                      )}>
                        {docItem.state ? <Check size={16} /> : docItem.icon}
                      </div>
                      <span className={cn(
                        "text-sm font-semibold",
                        docItem.state ? "text-emerald-700" : "text-slate-700"
                      )}>{docItem.label}</span>
                    </div>
                    <button className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700 relative z-10">
                      <Upload size={14} />
                      {docItem.state ? 'Change' : 'Upload'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <EmeraldButton 
            className="w-full py-5 text-lg"
            onClick={handleSubmit}
            disabled={loading || !user}
            isLoading={loading}
          >
            Submit Vehicle for Approval
          </EmeraldButton>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}

