import React from "react";
import { useEffect, useState, useMemo } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useAuthStore } from '@/src/store/useAuthStore';
import { DashboardLayout } from '@/src/components/layout/DashboardLayout';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { EmeraldButton } from '@/src/components/ui/EmeraldButton';
import { MapPin, Navigation, Eye, X, Loader2, List, Map as MapIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useNavigate, useSearchParams } from 'react-router-dom';

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
  status: string;
}

export default function LiveRequestsMap() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const focusedRideId = searchParams.get('rideId');
  const { user, profile } = useAuthStore();
  const [requests, setRequests] = useState<RideRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [biddingId, setBiddingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [bidAmounts, setBidAmounts] = useState<Record<string, string>>({});

  useEffect(() => {
    const q = query(collection(db, 'rides'), where('status', '==', 'Pending'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requestsData = snapshot.docs.map(doc => {
        const data = doc.data();
        // Use doc ID as seed for consistent random positioning
        const seed = doc.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return {
          id: doc.id,
          ...data,
          top: data.top || `${20 + (seed % 60)}%`,
          left: data.left || `${20 + ((seed * 1.3) % 60)}%`,
        };
      }) as RideRequest[];
      setRequests(requestsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleBid = async (rideId: string) => {
    const amount = bidAmounts[rideId];
    if (!user || !amount) return;
    const fare = parseFloat(amount);
    if (isNaN(fare) || fare <= 0) return;

    setBiddingId(rideId);
    try {
      await addDoc(collection(db, 'bids'), {
        rideId,
        riderId: user.uid,
        riderName: profile?.fullName || user.displayName || 'Rider',
        fare: fare,
        eta: '5-10 min',
        status: 'Pending',
        vehicle: profile?.vehicleModel ? `${profile.vehicleModel} (${profile.vehiclePlate})` : 'EV Vehicle',
        plate: profile?.vehiclePlate || 'N/A',
        rating: profile?.rating || '5.0',
        trips: profile?.completedTrips || '0 trips',
        createdAt: serverTimestamp(),
      });
      
      setSuccessId(rideId);
      setBidAmounts(prev => ({ ...prev, [rideId]: '' }));
      setTimeout(() => setSuccessId(null), 3000);
    } catch (error) {
      console.error('Error placing bid:', error);
    } finally {
      setBiddingId(null);
    }
  };

  const focusedRide = useMemo(() => {
    if (!focusedRideId) return null;
    return requests.find(r => r.id === focusedRideId);
  }, [requests, focusedRideId]);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-1">Live Ride Requests</h1>
            <p className="text-slate-500 font-medium">
              {requests.length} active requests in your area
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
               <button 
                onClick={() => setViewMode('map')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                  viewMode === 'map' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
               >
                 <MapIcon size={14} /> Map
               </button>
               <button 
                onClick={() => setViewMode('list')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                  viewMode === 'list' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
               >
                 <List size={14} /> List
               </button>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
               <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Searching nearby</span>
            </div>
          </div>
        </div>

        {/* View Content */}
        <div className="flex-1 min-h-0">
          <AnimatePresence mode="wait">
            {viewMode === 'map' ? (
              <motion.div
                key="map-view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="h-full relative"
              >
                <GlassCard className="h-full p-0 overflow-hidden bg-slate-200 relative border-slate-200">
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
                  {requests.map((req) => {
                    const isSuccess = successId === req.id;
                    const isBidding = biddingId === req.id;

                    return (
                      <motion.div
                        key={req.id}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{ top: req.top, left: req.left }}
                        className="absolute z-20"
                      >
                        <div className="relative group">
                          {/* Marker Dot */}
                          <div className={cn(
                            "w-6 h-6 rounded-full border-4 border-white shadow-xl mb-2 flex items-center justify-center transition-colors",
                            isSuccess ? "bg-emerald-500" : "bg-emerald-500 group-hover:bg-emerald-600"
                          )}>
                             <div className="w-1 h-1 bg-white rounded-full animate-ping" />
                          </div>

                          {/* Floating Card */}
                          <GlassCard className={cn(
                            "absolute top-8 left-0 min-w-64 p-4 shadow-2xl border-white transition-all",
                            focusedRideId === req.id ? "ring-2 ring-emerald-500 scale-105" : "group-hover:scale-105"
                          )}>
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <h4 className="font-black text-slate-800 text-sm leading-tight">{req.customerName}</h4>
                                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase mt-0.5 truncate max-w-[180px]">
                                  <MapPin size={10} className="text-emerald-500 shrink-0" />
                                  {req.pickup}
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase mt-0.5 truncate max-w-[180px]">
                                  <MapPin size={10} className="text-red-500 shrink-0" />
                                  {req.destination}
                                </div>
                              </div>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">{req.seats} seats</span>
                            </div>
                            
                            <div className="flex items-center justify-between gap-2">
                              <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">BDT</span>
                                <input 
                                  type="number" 
                                  placeholder={req.fare.toString()}
                                  value={bidAmounts[req.id] || ''}
                                  onChange={(e) => {
                                    setBidAmounts(prev => ({ ...prev, [req.id]: e.target.value }));
                                  }}
                                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black text-slate-800 focus:outline-none focus:border-emerald-500 transition-all"
                                />
                              </div>
                              <EmeraldButton 
                                onClick={() => handleBid(req.id)}
                                disabled={isBidding || isSuccess || !bidAmounts[req.id]}
                                className={cn(
                                  "p-2 py-2 px-4 text-[10px] h-auto shadow-none shrink-0",
                                  isSuccess && "bg-emerald-600"
                                )}
                              >
                                {isBidding ? <Loader2 size={12} className="animate-spin" /> : isSuccess ? <CheckCircle2 size={12} /> : 'Bid'}
                              </EmeraldButton>
                            </div>
                          </GlassCard>
                        </div>
                      </motion.div>
                    );
                  })}

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
              </motion.div>
            ) : (
              <motion.div
                key="list-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="h-full overflow-y-auto pr-2 space-y-4"
              >
                {requests.length > 0 ? requests.map((req) => {
                  const isSuccess = successId === req.id;
                  const isBidding = biddingId === req.id;

                  return (
                    <GlassCard key={req.id} className={cn(
                      "p-6 border-slate-100 hover:border-emerald-200 transition-all",
                      focusedRideId === req.id && "ring-2 ring-emerald-500 border-emerald-500"
                    )}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-emerald-500">
                            <MapPin size={28} />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-lg mb-1">{req.customerName}</h4>
                            <div className="flex items-center gap-4">
                              <p className="text-sm text-slate-500 font-medium">{req.pickup} → {req.destination}</p>
                              <span className="w-1 h-1 bg-slate-300 rounded-full" />
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{req.seats} seats</p>
                              <span className="w-1 h-1 bg-slate-300 rounded-full" />
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{req.vehicleType}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="flex flex-col items-end mr-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Your Bid</span>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">BDT</span>
                              <input 
                                type="number" 
                                placeholder={req.fare.toString()}
                                value={bidAmounts[req.id] || ''}
                                onChange={(e) => {
                                  setBidAmounts(prev => ({ ...prev, [req.id]: e.target.value }));
                                }}
                                className="w-40 pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-800 focus:outline-none focus:border-emerald-500 transition-all"
                              />
                            </div>
                          </div>
                          <EmeraldButton 
                            onClick={() => handleBid(req.id)}
                            disabled={isBidding || isSuccess || !bidAmounts[req.id]}
                            className={cn(
                              "py-3 px-10 font-bold min-w-[160px]",
                              isSuccess && "bg-emerald-600"
                            )}
                          >
                            {isBidding ? <Loader2 size={18} className="animate-spin mr-2" /> : isSuccess ? <CheckCircle2 size={18} className="mr-2" /> : null}
                            {isBidding ? 'Placing Bid...' : isSuccess ? 'Bid Placed' : 'Bid Now'}
                          </EmeraldButton>
                        </div>
                      </div>
                    </GlassCard>
                  );
                }) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                    <AlertCircle size={48} className="opacity-20" />
                    <p className="font-bold">No ride requests found nearby.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
}
