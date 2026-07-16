import React from "react";
import { DashboardLayout } from '@/src/components/layout/DashboardLayout';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { EmeraldButton } from '@/src/components/ui/EmeraldButton';
import { Plus, CheckCircle2, Activity, ShieldCheck, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useNavigate } from 'react-router-dom';

const stats = [
  {
    id: 'completed',
    label: 'Completed Rides',
    value: '48',
    sub: '+3 this week',
    icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" />,
    bg: 'bg-emerald-50/50',
    border: 'border-emerald-100',
  },
  {
    id: 'active',
    label: 'Active Ride',
    value: '1',
    sub: 'IUB → sfsoft BD',
    icon: <Activity className="w-6 h-6 text-blue-500" />,
    bg: 'bg-blue-50/50',
    border: 'border-blue-100',
  },
  {
    id: 'verified',
    label: 'Verified',
    value: 'Privacy & Policy',
    sub: 'KYC approved',
    icon: <ShieldCheck className="w-6 h-6 text-purple-500" />,
    bg: 'bg-purple-50/50',
    border: 'border-purple-100',
  }
];

const recentRides = [
  { pickup: 'IUB, Dhaka', destination: 'sfsoft BD', vehicle: 'EV Car', fare: 'BDT 50', status: 'Completed', date: 'Jul 9' },
  { pickup: 'Mirpur 15', destination: 'Jamuna Future Park', vehicle: 'eBike', fare: 'BDT 30', status: 'Completed', date: 'Jul 7' },
  { pickup: 'Gulshan 2', destination: 'Banani', vehicle: 'EV Car', fare: 'BDT 65', status: 'Cancelled', date: 'Jul 5' },
];

export default function CustomerDashboard() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-1">Good morning, Aynan 👋</h1>
            <p className="text-slate-500 font-medium">Thursday, 10 July 2026</p>
          </div>
          <EmeraldButton onClick={() => navigate('/post-ride')} className="shadow-emerald-200">
            <Plus className="w-5 h-5" />
            Book a Ride
          </EmeraldButton>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <GlassCard 
              key={stat.id} 
              className={cn("p-8 relative group cursor-pointer hover:translate-y-[-4px] transition-all", stat.bg, stat.border)}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                  {stat.icon}
                </div>
                <ChevronRight className="text-slate-300 group-hover:text-slate-600 transition-colors" size={20} />
              </div>
              <div>
                <h2 className="text-4xl font-black text-slate-800 mb-1 tracking-tight">{stat.value}</h2>
                <p className="font-bold text-slate-700 mb-1">{stat.label}</p>
                <p className="text-xs text-slate-400 font-medium">{stat.sub}</p>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Recent Rides Table */}
        <GlassCard className="p-0 overflow-hidden border-slate-100">
          <div className="p-8 flex justify-between items-center border-b border-slate-50">
            <h3 className="text-xl font-bold text-slate-800">Recent Rides</h3>
            <button className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors">View all</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pickup</th>
                  <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Destination</th>
                  <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vehicle</th>
                  <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fare</th>
                  <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentRides.map((ride, idx) => (
                  <tr key={idx} className="group hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-5 text-sm font-semibold text-slate-600">{ride.pickup}</td>
                    <td className="px-8 py-5 text-sm font-semibold text-slate-600">{ride.destination}</td>
                    <td className="px-8 py-5 text-sm font-medium text-slate-400">{ride.vehicle}</td>
                    <td className="px-8 py-5 text-sm font-bold text-slate-800">{ride.fare}</td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                        ride.status === 'Completed' ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                      )}>
                        {ride.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm font-semibold text-slate-400">{ride.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
