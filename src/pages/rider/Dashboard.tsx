import React from "react";
import { DashboardLayout } from '@/src/components/layout/DashboardLayout';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { EmeraldButton } from '@/src/components/ui/EmeraldButton';
import { Plus, Activity, Car, UserCheck, MapPin, Wallet, Map as MapIcon, Star, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useNavigate } from 'react-router-dom';

const stats = [
  { label: "Today's Earnings", value: 'BDT 620', icon: <Wallet className="text-emerald-500" />, sub: '' },
  { label: 'Trips Today', value: '8', icon: <MapIcon className="text-blue-500" />, sub: '' },
  { label: 'Rating', value: '4.9 ★', icon: <Star className="text-amber-500" />, sub: '' },
  { label: 'Online Hours', value: '6.5 hrs', icon: <Clock className="text-purple-500" />, sub: '' },
];

const actionCards = [
  { label: 'Add EV', sub: 'Register new vehicle', icon: <Plus className="text-emerald-500" />, bg: 'bg-emerald-50/50', border: 'border-emerald-100', path: '/rider/kyc' },
  { label: 'Active Rides', sub: '2 ongoing trips', icon: <Activity className="text-blue-500" />, bg: 'bg-blue-50/50', border: 'border-blue-100', path: '/rider/rides' },
  { label: 'My Rides', sub: '143 total completed', icon: <Car className="text-purple-500" />, bg: 'bg-purple-50/50', border: 'border-purple-100', path: '/rider/history' },
  { label: 'Profile', sub: 'KYC Verified ✓', icon: <UserCheck className="text-amber-500" />, bg: 'bg-amber-50/50', border: 'border-amber-100', path: '/rider/profile' },
];

const nearbyRequests = [
  { route: 'IUB, Dhaka → sfsoft BD', info: '0.8 km away • 2 passengers', fare: 'BDT 50' },
  { route: 'Mirpur 15 → Jamuna Future Park', info: '1.2 km away • 1 passenger', fare: 'BDT 40' },
];

export default function RiderDashboard() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-1">Rider Dashboard</h1>
            <p className="text-slate-500 font-medium">Welcome back, Nasrin Akter</p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
             <div className="w-2 h-2 bg-emerald-500 rounded-full" />
             <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Online • Accepting</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <GlassCard key={idx} className="p-6 flex items-center gap-6 border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                {stat.icon}
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-xl font-black text-slate-800">{stat.value}</p>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {actionCards.map((card, idx) => (
            <GlassCard 
              key={idx} 
              onClick={() => navigate(card.path)}
              className={cn("p-8 cursor-pointer hover:translate-y-[-4px] transition-all group", card.bg, card.border)}
            >
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {card.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-1">{card.label}</h3>
              <p className="text-xs text-slate-500 font-medium">{card.sub}</p>
            </GlassCard>
          ))}
        </div>

        {/* Nearby Requests */}
        <GlassCard className="p-8 border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-slate-800">Nearby Ride Requests</h3>
            <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
              3 near you
            </div>
          </div>
          <div className="space-y-4">
            {nearbyRequests.map((req, idx) => (
              <div key={idx} className="flex items-center justify-between p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-all">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-emerald-500 shadow-sm">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 mb-1">{req.route}</h4>
                    <p className="text-xs text-slate-400 font-medium">{req.info}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <span className="text-lg font-black text-slate-800">{req.fare}</span>
                  <EmeraldButton 
                    onClick={() => navigate('/rider/requests')}
                    className="py-2.5 px-8 text-xs shadow-none"
                  >
                    Accept
                  </EmeraldButton>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
