import React from "react";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useAuthStore } from '@/src/store/useAuthStore';
import { DashboardLayout } from '@/src/components/layout/DashboardLayout';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { EmeraldButton } from '@/src/components/ui/EmeraldButton';
import { Input } from '@/src/components/ui/Input';
import { MapPin, Car, Bike, Send, Minus, Plus, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

const vehicleTypes = [
  { id: 'ev-car', label: 'EV Car', seats: '1-4 seats', range: 'BDT 40-80', icon: <Car className="w-6 h-6 text-emerald-500" /> },
  { id: 'ebike', label: 'eBike', seats: '1-2 seats', range: 'BDT 20-40', icon: <Bike className="w-6 h-6 text-slate-400" /> },
  { id: 'cng', label: 'CNG', seats: '1-3 seats', range: 'BDT 30-60', icon: <Send className="w-6 h-6 text-slate-400" /> },
];

export default function PostRide() {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const [selectedVehicle, setSelectedVehicle] = useState('ev-car');
  const [seats, setSeats] = useState(2);
  const [pickup, setPickup] = useState('IUB, Dhaka');
  const [destination, setDestination] = useState('sfsoft BD, Mirpur');
  const [fare, setFare] = useState(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    const maxSeats = selectedVehicle === 'ev-car' ? 4 : selectedVehicle === 'ebike' ? 1 : 3;
    if (seats > maxSeats) {
      setSeats(maxSeats);
    }
  }, [selectedVehicle, seats]);

  const handlePostRide = async () => {
    if (!user) return;
    
    // Validate seats
    const vehicle = vehicleTypes.find(v => v.id === selectedVehicle);
    if (vehicle) {
      const maxSeats = selectedVehicle === 'ev-car' ? 4 : selectedVehicle === 'ebike' ? 1 : 3;
      if (seats > maxSeats) {
        setError(`Maximum seats for ${vehicle.label} is ${maxSeats}`);
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      const rideRef = await addDoc(collection(db, 'rides'), {
        customerId: user.uid,
        customerName: profile?.fullName || user.displayName || 'Anonymous',
        pickup,
        destination,
        fare,
        vehicleType: selectedVehicle,
        seats,
        status: 'Pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      navigate(`/driver-bids?rideId=${rideRef.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to post ride request.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-slate-800 mb-1">Post a Ride</h1>
          <p className="text-slate-500 font-medium">Book your next EV journey</p>
        </header>

        {/* Live Map Preview Placeholder */}
        <GlassCard className="p-0 overflow-hidden h-64 bg-slate-100 relative border-slate-200">
           <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 gap-4 p-8 opacity-20">
             {Array.from({ length: 24 }).map((_, i) => (
               <div key={i} className="bg-slate-400 rounded-lg" />
             ))}
           </div>
           <div className="absolute inset-0 flex items-center justify-center">
             <div className="relative w-full max-w-lg">
                <div className="absolute left-1/4 top-1/2 w-4 h-4 bg-emerald-500 rounded-full ring-4 ring-emerald-500/20 z-10" />
                <div className="absolute right-1/4 top-1/3 w-4 h-4 bg-red-500 rounded-full ring-4 ring-red-500/20 z-10" />
                <svg className="w-full h-32 overflow-visible">
                  <path 
                    d="M 128 64 L 200 64 L 200 42 L 384 42" 
                    fill="none" 
                    stroke="#10b981" 
                    strokeWidth="3" 
                    strokeDasharray="8 6"
                    className="opacity-60"
                  />
                </svg>
             </div>
           </div>
           <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest shadow-sm border border-slate-200">
             Live Map Preview
           </div>
        </GlassCard>

        <GlassCard className="p-10 space-y-8">
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
              label="Pickup Address" 
              placeholder="IUB, Dhaka" 
              icon={<MapPin className="text-emerald-500" size={18} />} 
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
            />
            <Input 
              label="Destination Address" 
              placeholder="sfsoft BD, Mirpur" 
              icon={<MapPin className="text-red-500" size={18} />}
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>

          <div className="max-w-xs">
            <Input 
              label="Offer Amount (BDT)" 
              placeholder="50" 
              type="number"
              value={fare}
              onChange={(e) => setFare(Number(e.target.value))}
            />
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Vehicle</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {vehicleTypes.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVehicle(v.id)}
                  className={cn(
                    "p-6 rounded-2xl border-2 text-left transition-all group",
                    selectedVehicle === v.id 
                      ? "border-emerald-500 bg-emerald-50/50 ring-4 ring-emerald-500/5 shadow-lg shadow-emerald-100" 
                      : "border-slate-100 bg-white hover:border-slate-200"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl mb-4 flex items-center justify-center transition-colors",
                    selectedVehicle === v.id ? "bg-emerald-500 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100"
                  )}>
                    {v.icon}
                  </div>
                  <h4 className={cn("font-bold mb-1 transition-colors", selectedVehicle === v.id ? "text-emerald-900" : "text-slate-800")}>
                    {v.label}
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{v.seats}</p>
                  <p className={cn("text-xs font-bold", selectedVehicle === v.id ? "text-emerald-600" : "text-slate-400")}>{v.range}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between py-4 border-t border-slate-50">
            <div>
              <p className="font-bold text-slate-800">Number of Seats</p>
              <p className="text-xs text-slate-400">Select passenger count</p>
            </div>
            <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl">
              <button 
                onClick={() => setSeats(Math.max(1, seats - 1))}
                className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm"
              >
                <Minus size={18} className="text-slate-400" />
              </button>
              <span className="text-xl font-black text-slate-800 min-w-[2ch] text-center">{seats}</span>
              <button 
                onClick={() => setSeats(Math.min(4, seats + 1))}
                className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-100"
              >
                <Plus size={18} className="text-white" />
              </button>
            </div>
          </div>

          <EmeraldButton 
            className="w-full py-5 text-lg"
            onClick={handlePostRide}
            disabled={loading || !user}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5 rotate-[-15deg]" />
            )}
            {loading ? 'Posting Request...' : 'Post Ride Request'}
          </EmeraldButton>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
