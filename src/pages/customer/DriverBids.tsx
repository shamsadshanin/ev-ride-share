import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/src/components/layout/DashboardLayout';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { EmeraldButton } from '@/src/components/ui/EmeraldButton';
import { User, ChevronRight, MapPin, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

const bids = [
  { 
    id: 1, 
    name: 'Rakib Hassan', 
    rating: '4.8', 
    vehicle: 'Toyota Proton EV', 
    plate: 'DHA-1234', 
    trips: '142 completed trips',
    eta: '3 min', 
    fare: 'BDT 50' 
  },
  { 
    id: 2, 
    name: 'Nasrin Akter', 
    rating: '4.9', 
    vehicle: 'Walton EV Sedan', 
    plate: 'DHA-5678', 
    trips: '287 completed trips',
    eta: '5 min', 
    fare: 'BDT 45' 
  },
  { 
    id: 3, 
    name: 'Mahbub Alam', 
    rating: '4.7', 
    vehicle: 'BYD e6 EV', 
    plate: 'DHA-9012', 
    trips: '94 completed trips',
    eta: '7 min', 
    fare: 'BDT 55' 
  }
];

export default function DriverBids() {
  const navigate = useNavigate();

  return (
    <DashboardLayout userName="Aynan Nishat">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-1">Driver Bids</h1>
            <p className="text-slate-500 font-medium">IUB, Dhaka → sfsoft BD • 3 offers received</p>
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
               <span className="text-sm font-bold text-slate-700">IUB, Dhaka</span>
            </div>
            <div className="flex-1 flex items-center justify-center relative">
               <div className="w-full border-t-2 border-dashed border-slate-200" />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 py-1 rounded-full border border-slate-100 text-[10px] font-bold text-slate-400">
                 ~4.2 km
               </div>
            </div>
            <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-slate-100 shadow-sm">
               <div className="w-2 h-2 bg-red-500 rounded-full" />
               <span className="text-sm font-bold text-slate-700">sfsoft BD</span>
            </div>
            <div className="ml-4">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Your offer</p>
              <p className="text-lg font-black text-slate-800">BDT 50</p>
            </div>
          </div>
        </GlassCard>

        {/* Bids List */}
        <div className="space-y-4">
          {bids.map((bid, idx) => (
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
                      <h3 className="font-bold text-slate-800">{bid.name}</h3>
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black">
                        {bid.rating} ★
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mb-1">{bid.vehicle} • {bid.plate}</p>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{bid.trips}</p>
                  </div>

                  <div className="text-center px-6 border-x border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">ETA</p>
                    <p className="text-lg font-black text-slate-800">{bid.eta}</p>
                  </div>

                  <div className="text-center px-6">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Fare</p>
                    <p className="text-lg font-black text-emerald-600">{bid.fare}</p>
                  </div>

                  <div className="flex gap-3">
                    <button className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all">
                      Cancel
                    </button>
                    <EmeraldButton 
                      onClick={() => navigate('/active-rides')}
                      className="py-2.5 px-6 text-xs"
                    >
                      View
                    </EmeraldButton>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
