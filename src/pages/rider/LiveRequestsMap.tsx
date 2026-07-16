import { DashboardLayout } from '@/src/components/layout/DashboardLayout';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { EmeraldButton } from '@/src/components/ui/EmeraldButton';
import { MapPin, Navigation, Eye, X } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useNavigate } from 'react-router-dom';

const requests = [
  { id: 1, loc: 'sfsoft BD', sub: 'Mirpur 15', pax: '2 pax', fare: 'BDT 40', top: '35%', left: '30%', color: 'emerald' },
  { id: 2, loc: 'IUB, Dhaka', sub: 'Uttara', pax: '3 pax', fare: 'BDT 65', top: '25%', left: '65%', color: 'blue' },
  { id: 3, loc: 'Jamuna Future Park', sub: 'Gulshan 2', pax: '1 pax', fare: 'BDT 50', top: '55%', left: '55%', color: 'purple' },
];

export default function LiveRequestsMap() {
  const navigate = useNavigate();

  return (
    <DashboardLayout userType="rider" userName="Nasrin Akter">
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
                <div className={cn(
                   "w-6 h-6 rounded-full border-4 border-white shadow-xl mb-2 flex items-center justify-center",
                   req.color === 'emerald' ? "bg-emerald-500" : req.color === 'blue' ? "bg-blue-500" : "bg-purple-500"
                )}>
                   <div className="w-1 h-1 bg-white rounded-full animate-ping" />
                </div>

                {/* Floating Card */}
                <GlassCard className="absolute top-8 left-0 min-w-64 p-4 shadow-2xl border-white group-hover:scale-105 transition-transform">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-black text-slate-800 text-sm leading-tight">{req.loc}</h4>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                        <Navigation size={10} />
                        {req.sub}
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{req.pax}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-emerald-600">{req.fare}</span>
                    <div className="flex gap-2">
                       <button className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-red-500 transition-all">
                         <X size={16} />
                       </button>
                       <EmeraldButton 
                        onClick={() => navigate('/rider/trip/active')}
                        className="p-2 py-2 px-4 text-[10px] h-auto shadow-none"
                       >
                         <Eye size={14} />
                         View
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
