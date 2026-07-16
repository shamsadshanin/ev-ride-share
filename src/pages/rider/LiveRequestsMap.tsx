import React from "react";
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useAuthStore } from '@/src/store/useAuthStore';
import { DashboardLayout } from '@/src/components/layout/DashboardLayout';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { EmeraldButton } from '@/src/components/ui/EmeraldButton';
import { MapPin, Navigation, Eye, X, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useNavigate } from 'react-router-dom';

interface RideRequest {
  id: string;
  customerName: string;
  pickup: string;
  destination: string;
  fare: number;
  seats: number;
  vehicleType: string;
  top?: string;
  left?: string;
}

export default function LiveRequestsMap() {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const [requests, setRequests] = useState<RideRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'rides'), where('status', '==', 'Pending'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requestsData = snapshot.docs.map(doc => {
        const data = doc.data();
        // Randomly place on "map" if coordinates not present
        return {
          id: doc.id,
          ...data,
          top: data.top || `${20 + Math.random() * 60}%`,
          left: data.left || `${20 + Math.random() * 60}%`,
        };
      }) as RideRequest[];
      setRequests(requestsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleBid = async (rideId: string, suggestedFare: number) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'bids'), {
        rideId,
        riderId: user.uid,
        riderName: profile?.fullName || user.displayName || 'Nasrin Akter',
        fare: suggestedFare,
        eta: '5 min',
        status: 'Pending',
        vehicle: profile?.vehicle || 'Walton EV Sedan',
        plate: profile?.plate || 'DHA-5678',
        rating: '4.9',
        trips: '287 completed trips',
        createdAt: serverTimestamp(),
      });
      // Maybe show a success toast or change button state
      alert('Bid placed successfully!');
    } catch (error) {
      console.error('Error placing bid:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-1">Live Ride Requests</h1>
            <p className="text-slate-500 font-medium">3 active bids in your area</p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
             <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Searching nearby</span>
          </div>
        </div>

        {/* Interactive Map Area */}
        <GlassCard className="flex-1 p-0 overflow-hidden bg-slate-200 relative border-slate-200">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/50 backdrop-blur-sm z-50 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
              <p className="font-bold text-slate-500">Scanning for requests...</p>
            </div>
          ) : null}

          {/* Grid Background */}
          <div className="absolute inset-0 grid grid-cols-12 grid-rows-8 gap-4 p-8 opacity-40">
             {Array.from({ length: 96 }).map((_, i) => (
               <div key={i} className="bg-slate-400 rounded-lg" />
             ))}
          </div>

          {/* Map Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
            <path d="M 100 200 L 400 200 L 400 400 L 700 400" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray="10 8" />
            <path d="M 300 50 L 300 300 L 600 300 L 600 600" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="10 8" />
            <path d="M 800 100 L 800 450 L 500 450" fill="none" stroke="#3b82f6" strokeWidth="4" strokeDasharray="10 8" />
          </svg>

          {/* Request Markers/Cards */}
          {requests.map((req) => (
            <motion.div
              key={req.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ top: req.top, left: req.left }}
              className="absolute z-20"
            >
              <div className="relative group">
                {/* Marker Dot */}
                <div className="w-6 h-6 rounded-full border-4 border-white shadow-xl mb-2 flex items-center justify-center bg-emerald-500">
                   <div className="w-1 h-1 bg-white rounded-full animate-ping" />
                </div>

                {/* Floating Card */}
                <GlassCard className="absolute top-8 left-0 min-w-64 p-4 shadow-2xl border-white group-hover:scale-105 transition-transform">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-black text-slate-800 text-sm leading-tight">{req.customerName}</h4>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                        <MapPin size={10} className="text-emerald-500" />
                        {req.pickup}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                        <MapPin size={10} className="text-red-500" />
                        {req.destination}
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{req.seats} seats</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-emerald-600">BDT {req.fare}</span>
                    <div className="flex gap-2">
                       <button className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-red-500 transition-all">
                         <X size={16} />
                       </button>
                       <EmeraldButton 
                        onClick={() => handleBid(req.id, req.fare)}
                        className="p-2 py-2 px-4 text-[10px] h-auto shadow-none"
                       >
                         Bid Now
                       </EmeraldButton>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          ))}

          {/* Your Location */}
          <div className="absolute bottom-8 right-8">
             <div className="bg-white/90 backdrop-blur rounded-2xl p-4 shadow-xl border border-white flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                  <Navigation size={20} className="rotate-45" />
                </div>
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Your Location</p>
                   <p className="text-sm font-black text-emerald-600">Banani, Dhaka</p>
                </div>
             </div>
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
