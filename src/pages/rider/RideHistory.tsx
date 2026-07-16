import React from "react";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/src/components/layout/DashboardLayout';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useAuthStore } from '@/src/store/useAuthStore';

export default function RideHistory() {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const [activeTab, setActiveTab] = useState('All');
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'rides'),
      where('riderId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rides = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHistory(rides);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredHistory = history.filter(ride => {
    if (activeTab === 'All') return true;
    return ride.status === activeTab;
  });

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-1">Ride History</h1>
            <p className="text-slate-500 font-medium">All past trips • {profile?.completedTrips || '0'} total completed</p>
          </div>
          <div className="flex gap-12">
            <div className="text-right">
               <p className="text-lg font-black text-slate-800">{profile?.totalEarnings || 'BDT 0'}</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total earned</p>
            </div>
            <div className="text-right">
               <p className="text-lg font-black text-slate-800">{profile?.completedTrips || '0'}</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Completed</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
           {['All', 'Completed', 'Cancelled'].map(tab => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={cn(
                 "px-6 py-2 rounded-xl text-xs font-bold transition-all",
                 activeTab === tab ? "bg-[#0f172a] text-white" : "bg-slate-100 text-slate-400 hover:bg-slate-200"
               )}
             >
               {tab}
             </button>
           ))}
        </div>

        {/* History Table */}
        <GlassCard className="p-0 overflow-hidden border-slate-100">
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-slate-50/50">
                 <tr>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trip ID</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date & Time</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pickup</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Destination</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Passengers</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fare</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {loading ? (
                    <tr>
                      <td colSpan={7} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading history...</p>
                        </div>
                      </td>
                    </tr>
                 ) : filteredHistory.length > 0 ? filteredHistory.map((ride) => (
                   <tr 
                     key={ride.id} 
                     onClick={() => {
                       if (ride.status === 'Active') {
                         navigate(`/rider/trip/active?rideId=${ride.id}`);
                       }
                     }}
                     className={cn(
                       "group hover:bg-slate-50/30 transition-colors",
                       ride.status === 'Active' && "cursor-pointer"
                     )}
                   >
                     <td className="px-8 py-6 text-xs font-bold text-slate-400 uppercase">#{ride.id.slice(-6)}</td>
                     <td className="px-8 py-6">
                        <p className="text-sm font-bold text-slate-700">
                          {ride.createdAt?.toDate ? ride.createdAt.toDate().toLocaleDateString() : 'Today'}
                        </p>
                        <p className="text-[10px] font-medium text-slate-400">
                          {ride.createdAt?.toDate ? ride.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                        </p>
                     </td>
                     <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                           <span className="text-sm font-bold text-slate-600 truncate max-w-[150px]">{ride.pickup}</span>
                        </div>
                     </td>
                     <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                           <span className="text-sm font-bold text-slate-600 truncate max-w-[150px]">{ride.destination}</span>
                        </div>
                     </td>
                     <td className="px-8 py-6 text-sm font-bold text-slate-600 text-center">{ride.seats}</td>
                     <td className="px-8 py-6 text-sm font-black text-slate-800">BDT {ride.finalFare || ride.fare}</td>
                     <td className="px-8 py-6">
                        <div className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2",
                          ride.status === 'Completed' ? "bg-emerald-50 text-emerald-600" : 
                          ride.status === 'Cancelled' ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                        )}>
                           <div className={cn("w-1 h-1 rounded-full", 
                             ride.status === 'Completed' ? "bg-emerald-500" : 
                             ride.status === 'Cancelled' ? "bg-red-500" : "bg-blue-500"
                           )} />
                           {ride.status}
                        </div>
                     </td>
                   </tr>
                 )) : (
                   <tr>
                     <td colSpan={7} className="px-8 py-20 text-center text-slate-400 font-medium italic">
                       No ride history found.
                     </td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>

           {/* Pagination */}
           <div className="p-8 border-t border-slate-50 flex justify-between items-center bg-slate-50/30">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Showing 8 of 143 trips</p>
              <div className="flex items-center gap-2">
                 <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
                    <ChevronLeft size={16} />
                 </button>
                 <button className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black">1</button>
                 <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 flex items-center justify-center text-[10px] font-bold hover:bg-slate-50 transition-colors">2</button>
                 <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 flex items-center justify-center text-[10px] font-bold hover:bg-slate-50 transition-colors">3</button>
                 <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
                    <ChevronRight size={16} />
                 </button>
              </div>
           </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
