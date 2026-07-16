import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useAuthStore } from '@/src/store/useAuthStore';
import { DashboardLayout } from '@/src/components/layout/DashboardLayout';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { EmeraldButton } from '@/src/components/ui/EmeraldButton';
import { MapPin, Car, Bike, Send, Minus, Plus, AlertCircle, Navigation, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { cn } from '@/src/lib/utils';

// Fix Leaflet icon issue
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ position, label }: { position: [number, number], label: string }) {
  return (
    <Marker position={position}>
      <Popup>{label}</Popup>
    </Marker>
  );
}

const vehicleTypes = [
  { id: 'ev-car', label: 'EV Car', seats: '1-4 seats', range: 'BDT 40-80', icon: <Car className="w-6 h-6" fill="currentColor" /> },
  { id: 'ebike', label: 'eBike', seats: '1-2 seats', range: 'BDT 20-40', icon: <Bike className="w-6 h-6" fill="currentColor" /> },
  { id: 'cng', label: 'CNG Auto', seats: '1-3 seats', range: 'BDT 30-60', icon: <Navigation className="w-6 h-6 rotate-45" fill="currentColor" /> },
];

export default function PostRide() {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const [selectedVehicle, setSelectedVehicle] = useState('ev-car');
  const [seats, setSeats] = useState(2);
  const [pickup, setPickup] = useState('IUB, Dhaka');
  const [destination, setDestination] = useState('Mirpur, Dhaka');
  const [fare, setFare] = useState(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Default positions for map markers (Simulated)
  const pickupPos: [number, number] = [23.815, 90.420];
  const destPos: [number, number] = [23.805, 90.410];

  useEffect(() => {
    const maxSeats = selectedVehicle === 'ev-car' ? 4 : selectedVehicle === 'ebike' ? 1 : 3;
    if (seats > maxSeats) {
      setSeats(maxSeats);
    }
  }, [selectedVehicle, seats]);

  const handlePostRide = async () => {
    if (!user) return;
    
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
      <div className="max-w-4xl mx-auto space-y-6 pb-20">
        <header className="px-4 lg:px-0">
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-1">Post a Ride</h1>
          <p className="text-slate-500 font-medium text-sm">Book your next EV journey</p>
        </header>

        {/* Live Map Preview */}
        <GlassCard className="p-0 overflow-hidden h-72 lg:h-80 bg-slate-100 relative border-slate-200 shadow-xl shadow-slate-200/50 rounded-[2.5rem] z-0 mx-4 lg:mx-0">
           <MapContainer 
             center={[23.8103, 90.4125]} 
             zoom={13} 
             style={{ height: '100%', width: '100%' }}
             zoomControl={false}
           >
             <TileLayer
               url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
               attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
             />
             <LocationMarker position={pickupPos} label="Pickup: IUB" />
             <LocationMarker position={destPos} label="Destination: Mirpur" />
           </MapContainer>

           <div className="absolute top-4 left-4 z-10 space-y-2">
              <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500" />
                 <span className="text-[10px] font-bold text-slate-700 uppercase tracking-tight truncate max-w-[150px]">{pickup}</span>
              </div>
              <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-red-500" />
                 <span className="text-[10px] font-bold text-slate-700 uppercase tracking-tight truncate max-w-[150px]">{destination}</span>
              </div>
           </div>

           <div className="absolute bottom-4 right-4 z-10 bg-[#0f172a] text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
             Live Map Active
           </div>
        </GlassCard>

        <GlassCard className="p-6 lg:p-10 space-y-8 rounded-[2.5rem] mx-4 lg:mx-0">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-sm font-medium"
              >
                <AlertCircle size={18} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Pickup Point</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                <input 
                  type="text"
                  placeholder="Where from?"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-12 py-4 outline-none focus:border-emerald-500 transition-all font-medium text-slate-700"
                />
              </div>
            </div>
            <div className="relative group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Destination</label>
              <div className="relative">
                <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500" size={18} />
                <input 
                  type="text"
                  placeholder="Where to?"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-12 py-4 outline-none focus:border-red-500 transition-all font-medium text-slate-700"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Offer Fare (BDT)</label>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2 flex items-center gap-2">
                <button 
                  onClick={() => setFare(Math.max(10, fare - 10))}
                  className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <Minus size={20} className="text-slate-400" />
                </button>
                <div className="flex-1 text-center">
                  <span className="text-2xl font-black text-slate-800">৳{fare}</span>
                </div>
                <button 
                  onClick={() => setFare(fare + 10)}
                  className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <Plus size={20} className="text-slate-400" />
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Seats Required</label>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2 flex items-center gap-2">
                <button 
                  onClick={() => setSeats(Math.max(1, seats - 1))}
                  className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <Minus size={20} className="text-slate-400" />
                </button>
                <div className="flex-1 text-center">
                  <span className="text-2xl font-black text-slate-800">{seats}</span>
                </div>
                <button 
                  onClick={() => setSeats(Math.min(4, seats + 1))}
                  className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-100"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Select Eco-Vehicle</label>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {vehicleTypes.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVehicle(v.id)}
                  className={cn(
                    "p-5 rounded-2xl border-2 text-left transition-all group relative overflow-hidden",
                    selectedVehicle === v.id 
                      ? "border-emerald-500 bg-emerald-50/30" 
                      : "border-slate-100 bg-white hover:border-slate-200"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl mb-4 flex items-center justify-center transition-all",
                    selectedVehicle === v.id ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200" : "bg-slate-50 text-slate-400"
                  )}>
                    {v.icon}
                  </div>
                  <h4 className={cn("font-bold mb-0.5", selectedVehicle === v.id ? "text-emerald-900" : "text-slate-800")}>
                    {v.label}
                  </h4>
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{v.seats}</p>
                    <p className={cn("text-xs font-black", selectedVehicle === v.id ? "text-emerald-600" : "text-slate-400")}>{v.range}</p>
                  </div>
                  {selectedVehicle === v.id && (
                    <motion.div 
                      layoutId="active-vehicle"
                      className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <EmeraldButton 
            className="w-full py-6 text-lg font-bold rounded-[2rem] shadow-xl shadow-emerald-100 mt-4 group"
            onClick={handlePostRide}
            disabled={loading || !user}
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Send className="w-6 h-6 rotate-[-15deg] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            )}
            <span className="ml-2">{loading ? 'Posting Request...' : 'Post Ride Request'}</span>
          </EmeraldButton>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
