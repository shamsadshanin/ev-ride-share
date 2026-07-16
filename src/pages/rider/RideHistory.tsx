import React from "react";
import { useState } from 'react';
import { DashboardLayout } from '@/src/components/layout/DashboardLayout';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const history = [
  { id: 'EVR-1024', date: 'Jul 10, 2026', time: '10:45 AM', pickup: 'IUB, Dhaka', dest: 'sfsoft BD', pax: '2', fare: 'BDT 50', status: 'Completed' },
  { id: 'EVR-1023', date: 'Jul 10, 2026', time: '09:12 AM', pickup: 'Mirpur 15', dest: 'Jamuna Future Park', pax: '1', fare: 'BDT 40', status: 'Completed' },
  { id: 'EVR-1022', date: 'Jul 9, 2026', time: '05:30 PM', pickup: 'Gulshan 2', dest: 'Banani', pax: '1', fare: 'BDT 35', status: 'Cancelled' },
  { id: 'EVR-1021', date: 'Jul 9, 2026', time: '02:15 PM', pickup: 'Uttara Sector 7', dest: 'Dhanmondi 27', pax: '3', fare: 'BDT 70', status: 'Completed' },
  { id: 'EVR-1020', date: 'Jul 9, 2026', time: '11:00 AM', pickup: 'Motijheel', dest: 'Farmgate', pax: '2', fare: 'BDT 45', status: 'Completed' },
  { id: 'EVR-1019', date: 'Jul 8, 2026', time: '08:30 AM', pickup: 'Khilgaon', dest: 'Paltan', pax: '1', fare: 'BDT 30', status: 'Cancelled' },
  { id: 'EVR-1018', date: 'Jul 8, 2026', time: '06:00 PM', pickup: 'Shyamoli', dest: 'Asad Gate', pax: '2', fare: 'BDT 40', status: 'Completed' },
  { id: 'EVR-1017', date: 'Jul 7, 2026', time: '03:45 PM', pickup: 'Badda', dest: 'Rampura', pax: '1', fare: 'BDT 25', status: 'Completed' },
];

export default function RideHistory() {
  const [activeTab, setActiveTab] = useState('All');

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-1">Ride History</h1>
            <p className="text-slate-500 font-medium">All past trips • 143 total completed</p>
          </div>
          <div className="flex gap-12">
            <div className="text-right">
               <p className="text-lg font-black text-slate-800">BDT 8,240</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total earned</p>
            </div>
            <div className="text-right">
               <p className="text-lg font-black text-slate-800">143</p>
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
                 {history.map((ride) => (
                   <tr key={ride.id} className="group hover:bg-slate-50/30 transition-colors">
                     <td className="px-8 py-6 text-xs font-bold text-slate-400">{ride.id}</td>
                     <td className="px-8 py-6">
                        <p className="text-sm font-bold text-slate-700">{ride.date}</p>
                        <p className="text-[10px] font-medium text-slate-400">{ride.time}</p>
                     </td>
                     <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                           <span className="text-sm font-bold text-slate-600">{ride.pickup}</span>
                        </div>
                     </td>
                     <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                           <span className="text-sm font-bold text-slate-600">{ride.dest}</span>
                        </div>
                     </td>
                     <td className="px-8 py-6 text-sm font-bold text-slate-600 text-center">{ride.pax}</td>
                     <td className="px-8 py-6 text-sm font-black text-slate-800">{ride.fare}</td>
                     <td className="px-8 py-6">
                        <div className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2",
                          ride.status === 'Completed' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                        )}>
                           <div className={cn("w-1 h-1 rounded-full", ride.status === 'Completed' ? "bg-emerald-500" : "bg-red-500")} />
                           {ride.status}
                        </div>
                     </td>
                   </tr>
                 ))}
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
