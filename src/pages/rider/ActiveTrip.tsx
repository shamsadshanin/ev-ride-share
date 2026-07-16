import React from "react";
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, serverTimestamp, collection, query, where } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useAuthStore } from '@/src/store/useAuthStore';
import { DashboardLayout } from '@/src/components/layout/DashboardLayout';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { EmeraldButton } from '@/src/components/ui/EmeraldButton';
import { Phone, Send, User, MessageSquare, MapPin, Loader2, CheckCircle, Users, AlertCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const messages = [
  { id: 1, sender: 'other', text: 'Hi, I am at gate 3.', time: '11:05' },
  { id: 2, sender: 'me', text: 'Coming! 1 minute.', time: '11:06' },
  { id: 3, sender: 'other', text: 'Okay, I see the car.', time: '11:07' },
];

export default function ActiveTrip() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const rideId = searchParams.get('rideId');
  const { user } = useAuthStore();
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [selectedRideId, setSelectedRideId] = useState<string | null>(rideId);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'rides'),
      where('riderId', '==', user.uid),
      where('status', '==', 'Active')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activeRides = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRides(activeRides);
      if (activeRides.length > 0 && !selectedRideId) {
        setSelectedRideId(activeRides[0].id);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleCompleteRide = async (id: string) => {
    try {
      await updateDoc(doc(db, 'rides', id), {
        status: 'Completed',
        completedAt: serverTimestamp(),
      });
      if (rides.length <= 1) {
        navigate('/rider/history');
      }
    } catch (err) {
      console.error('Error completing ride:', err);
    }
  };

  const handleToggleOnboard = async (id: string, currentStatus: string) => {
    try {
      await updateDoc(doc(db, 'rides', id), {
        rideSubStatus: currentStatus === 'Onboard' ? 'Waiting' : 'Onboard'
      });
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const selectedRide = rides.find(r => r.id === selectedRideId) || rides[0];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-96 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
          <p className="font-bold text-slate-500 uppercase tracking-widest text-xs">Loading active trips...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (rides.length === 0) {
    return (
      <DashboardLayout>
        <div className="h-96 flex flex-col items-center justify-center gap-4 text-slate-400">
          <MapPin size={48} className="opacity-20" />
          <p className="font-bold uppercase tracking-widest text-xs">No active trips found</p>
          <EmeraldButton onClick={() => navigate('/rider/dashboard')} className="mt-4">
             Back to Dashboard
          </EmeraldButton>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 h-[calc(100vh-10rem)]">
        
        {/* Left Side: Passenger Manifest */}
        <div className="w-full lg:w-96 flex flex-col gap-6 overflow-y-auto">
           <GlassCard className="p-6">
             <div className="flex items-center gap-3 mb-6">
                <Users className="text-emerald-500" />
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">Passenger Manifest</h3>
             </div>
             
             <div className="space-y-3">
                {rides.map((r) => (
                  <div 
                    key={r.id} 
                    onClick={() => setSelectedRideId(r.id)}
                    className={cn(
                      "p-4 rounded-2xl border transition-all cursor-pointer group",
                      selectedRideId === r.id ? "bg-emerald-50/50 border-emerald-200" : "bg-slate-50/50 border-slate-100 hover:border-slate-200"
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 shadow-xs">
                             <User size={16} />
                          </div>
                          <div>
                             <h4 className="text-sm font-bold text-slate-800">{r.customerName || 'Customer'}</h4>
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate max-w-[120px]">{r.destination}</p>
                          </div>
                       </div>
                       <button 
                         onClick={(e) => {
                           e.stopPropagation();
                           handleToggleOnboard(r.id, r.rideSubStatus);
                         }}
                         className={cn(
                           "px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all",
                           r.rideSubStatus === 'Onboard' ? "bg-emerald-500 text-white" : "bg-amber-100 text-amber-600"
                         )}
                       >
                         {r.rideSubStatus === 'Onboard' ? 'Onboard ✓' : 'Waiting'}
                       </button>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-xs font-black text-slate-700">BDT {r.finalFare || r.fare}</span>
                       <EmeraldButton 
                         onClick={(e) => {
                           e.stopPropagation();
                           handleCompleteRide(r.id);
                         }}
                         className="py-1 px-3 text-[8px]"
                       >
                          Complete
                       </EmeraldButton>
                    </div>
                  </div>
                ))}
             </div>
          </GlassCard>

          <GlassCard className="p-6 bg-slate-900 text-white border-none shadow-xl shadow-slate-100">
             <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold">Trip Summary</h4>
                <div className="flex items-center gap-1.5 bg-emerald-500/20 px-2 py-1 rounded-lg">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                   <span className="text-[8px] font-black uppercase">Live</span>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                   <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Onboard</p>
                   <p className="text-lg font-black">{rides.filter(r => r.rideSubStatus === 'Onboard').length}</p>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                   <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Pending</p>
                   <p className="text-lg font-black">{rides.filter(r => r.rideSubStatus !== 'Onboard').length}</p>
                </div>
             </div>
          </GlassCard>
        </div>

        {/* Right Area: Map & Chat */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
           {/* Map Placeholder */}
           <div className="h-64 bg-slate-100 rounded-[2rem] border border-slate-200 overflow-hidden relative shrink-0">
              <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/88.3639,23.8103,12/1000x400?access_token=pk.eyJ1Ijoic2Zzb2Z0IiwiYSI6ImNsMWx1Z282bjAzNnkzY3A5aGZ1b2NiaTMifQ.9-N-9-N-9-N')] bg-cover bg-center opacity-40 grayscale" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="relative">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-full animate-ping" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-lg" />
                 </div>
              </div>
              <div className="absolute bottom-4 left-4 flex gap-2">
                 <div className="bg-white/80 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-200/50 flex items-center gap-2 shadow-sm">
                    <MapPin size={12} className="text-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-700">IUB, Dhaka</span>
                 </div>
              </div>
           </div>

           {/* Selected Ride Details & Chat */}
           <GlassCard className="flex-1 flex flex-col p-0 overflow-hidden border-slate-100">
             <div className="px-8 py-5 border-b border-slate-50 flex justify-between items-center bg-white/50 shrink-0">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
                   <User size={20} className="text-slate-400" />
                 </div>
                 <div>
                   <h3 className="font-bold text-slate-800">{selectedRide?.customerName || 'Select a passenger'}</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[300px]">{selectedRide?.destination || 'N/A'}</p>
                 </div>
               </div>
               <div className="flex gap-2">
                 <button className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all border border-slate-100 shadow-xs">
                    <Phone size={16} />
                 </button>
                 <button className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all border border-slate-100 shadow-xs">
                    <AlertCircle size={16} className="text-red-400" />
                 </button>
               </div>
             </div>

             <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/20">
                <div className="flex flex-col items-center justify-center py-10 opacity-40">
                   <MessageSquare size={32} className="text-slate-300 mb-2" />
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Start a conversation</p>
                </div>
             </div>

             <div className="p-6 border-t border-slate-50 bg-white/50 shrink-0">
               <div className="flex gap-3">
                  <input 
                    type="text"
                    placeholder={`Message ${selectedRide?.customerName || 'Passenger'}...`}
                    className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-6 py-3.5 outline-none focus:border-emerald-500 transition-all shadow-sm font-medium text-sm text-slate-600"
                  />
                  <EmeraldButton className="w-12 h-12 p-0 flex items-center justify-center shrink-0">
                    <Send size={18} className="rotate-[-15deg]" />
                  </EmeraldButton>
               </div>
             </div>
           </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
