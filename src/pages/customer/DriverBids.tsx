import React from "react";
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { handleFirestoreError, OperationType } from '@/src/lib/firestore-errors';
import { DashboardLayout } from '@/src/components/layout/DashboardLayout';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { EmeraldButton } from '@/src/components/ui/EmeraldButton';
import { User, ChevronRight, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface Bid {
  id: string;
  riderId: string;
  riderName: string;
  fare: number;
  eta: string;
  status: string;
  vehicle: string;
  plate: string;
  rating: string;
  trips: string;
}

export default function DriverBids() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rideId = searchParams.get('rideId');
  const [bids, setBids] = useState<Bid[]>([]);
  const [rideData, setRideData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!rideId) return;

    // Fetch ride details
    const fetchRide = async () => {
      const path = `rides/${rideId}`;
      try {
        const rideDoc = await getDoc(doc(db, 'rides', rideId));
        if (rideDoc.exists()) {
          setRideData(rideDoc.data());
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, path);
      }
    };
    fetchRide();

    // Listen for bids
    const collectionPath = 'bids';
    const q = query(collection(db, collectionPath), where('rideId', '==', rideId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bidsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Bid[];
      setBids(bidsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, collectionPath);
    });

    return () => unsubscribe();
  }, [rideId]);

  const handleAcceptBid = async (bid: Bid) => {
    if (!rideId) return;
    const path = `rides/${rideId}`;
    try {
      await updateDoc(doc(db, 'rides', rideId), {
        riderId: bid.riderId,
        status: 'Active',
        riderName: bid.riderName,
        finalFare: bid.fare,
        updatedAt: new Date(),
      });
      navigate(`/active-rides?rideId=${rideId}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-1">Driver Bids</h1>
            <p className="text-slate-500 font-medium">
              {rideData?.pickup || '...'} → {rideData?.destination || '...'} • {bids.length} offers received
            </p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
             <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Live Matching</span>
          </div>
        </header>

        {/* Route visualization */}
        <GlassCard className="p-6 bg-slate-50/50 border-slate-200">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-slate-100 shadow-sm">
               <div className="w-2 h-2 bg-emerald-500 rounded-full" />
               <span className="text-sm font-bold text-slate-700">{rideData?.pickup || 'Pickup'}</span>
            </div>
            <div className="flex-1 flex items-center justify-center relative">
               <div className="w-full border-t-2 border-dashed border-slate-200" />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 py-1 rounded-full border border-slate-100 text-[10px] font-bold text-slate-400">
                 ~4.2 km
               </div>
            </div>
            <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-slate-100 shadow-sm">
               <div className="w-2 h-2 bg-red-500 rounded-full" />
               <span className="text-sm font-bold text-slate-700">{rideData?.destination || 'Destination'}</span>
            </div>
            <div className="ml-4">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Your offer</p>
              <p className="text-lg font-black text-slate-800">BDT {rideData?.fare || '0'}</p>
            </div>
          </div>
        </GlassCard>

        {/* Bids List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="font-medium">Waiting for drivers to bid...</p>
            </div>
          ) : bids.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4 border-2 border-dashed border-slate-200 rounded-3xl">
              <AlertCircle className="w-12 h-12 opacity-20" />
              <p className="font-medium">No bids yet. Drivers are being notified.</p>
            </div>
          ) : (
            bids.map((bid, idx) => (
              <motion.div
                key={bid.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <GlassCard className="p-6 hover:shadow-2xl hover:shadow-emerald-100/50 transition-all border-slate-100 group">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                       <User size={32} className="text-slate-300" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-800">{bid.riderName}</h3>
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black">
                          {bid.rating || '5.0'} ★
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mb-1">{bid.vehicle} • {bid.plate}</p>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{bid.trips || 'New Driver'}</p>
                    </div>

                    <div className="text-center px-6 border-x border-slate-100">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">ETA</p>
                      <p className="text-lg font-black text-slate-800">{bid.eta}</p>
                    </div>

                    <div className="text-center px-6">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Fare</p>
                      <p className="text-lg font-black text-emerald-600">BDT {bid.fare}</p>
                    </div>

                    <div className="flex gap-3">
                      <EmeraldButton 
                        onClick={() => handleAcceptBid(bid)}
                        className="py-2.5 px-6 text-xs"
                      >
                        Accept
                      </EmeraldButton>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
