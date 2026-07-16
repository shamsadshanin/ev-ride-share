import React from "react";
import { DashboardLayout } from '@/src/components/layout/DashboardLayout';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { EmeraldButton } from '@/src/components/ui/EmeraldButton';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/src/store/useAuthStore';
import { Plus, CheckCircle2, Activity, ShieldCheck, ChevronRight, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const { profile, user } = useAuthStore();
  const userName = profile?.fullName || user?.displayName || 'User';
  const kycStatus = profile?.kycStatus || 'Not Started';
  const userType = profile?.userType;

  const [recentRides, setRecentRides] = React.useState<any[]>([]);
  const [activeRide, setActiveRide] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState({ completed: 0, pending: 0 });

  React.useEffect(() => {
    if (userType === 'Rider') {
      navigate('/rider/dashboard');
    }
  }, [userType, navigate]);

  React.useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'rides'),
      where('customerId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rides = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      setRecentRides(rides);
      
      const active = rides.find(r => ['Pending', 'Active'].includes(r.status));
      setActiveRide(active || null);
      
      const completed = rides.filter(r => r.status === 'Completed').length;
      setStats({ completed, pending: active ? 1 : 0 });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const displayStats = [
    {
      id: 'completed',
      label: 'Completed Rides',
      value: stats.completed.toString(),
      sub: 'Journey history',
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" />,
      bg: 'bg-emerald-50/50',
      border: 'border-emerald-100',
    },
    {
      id: 'active',
      label: 'Current Status',
      value: activeRide ? '1' : '0',
      sub: activeRide ? activeRide.status : 'No active rides',
      icon: <Activity className="w-6 h-6 text-blue-500" />,
      bg: 'bg-blue-50/50',
      border: 'border-blue-100',
      path: activeRide ? (activeRide.status === 'Pending' ? `/driver-bids?rideId=${activeRide.id}` : `/active-rides?rideId=${activeRide.id}`) : '/post-ride'
    },
    {
      id: 'verified',
      label: 'KYC Status',
      value: kycStatus,
      sub: kycStatus === 'Approved' ? 'Fully verified' : 'Action required',
      icon: <ShieldCheck className="w-6 h-6 text-purple-500" />,
      bg: 'bg-purple-50/50',
      border: 'border-purple-100',
    }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Verification Alert */}
        {kycStatus !== 'Approved' && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl bg-amber-50 border border-amber-100 flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
                <ShieldCheck size={28} />
              </div>
              <div>
                <h3 className="text-amber-900 font-bold text-lg">Complete Your Verification</h3>
                <p className="text-amber-700/70 text-sm font-medium">To start booking rides and access full features, please complete your KYC.</p>
              </div>
            </div>
            <EmeraldButton onClick={() => navigate('/kyc')} className="bg-amber-600 hover:bg-amber-700 shadow-amber-200">
              Verify Identity
            </EmeraldButton>
          </motion.div>
        )}

        {/* Header Section */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-1">Good morning, {userName.split(' ')[0]} 👋</h1>
            <p className="text-slate-500 font-medium">{new Date().toLocaleDateString('en-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <EmeraldButton 
            onClick={() => {
              if (kycStatus !== 'Approved') {
                navigate('/kyc');
              } else {
                navigate('/post-ride');
              }
            }} 
            disabled={kycStatus !== 'Approved'}
            className={cn("shadow-emerald-200", kycStatus !== 'Approved' && "opacity-50 grayscale cursor-not-allowed")}
          >
            <Plus className="w-5 h-5" />
            Book a Ride
          </EmeraldButton>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayStats.map((stat) => (
            <GlassCard 
              key={stat.id} 
              onClick={() => {
                if (stat.path) {
                  navigate(stat.path);
                } else if (stat.id === 'verified' && kycStatus !== 'Approved') {
                  navigate('/kyc');
                }
              }}
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
            <button 
              onClick={() => navigate('/active-rides')}
              className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              View all
            </button>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading your rides...</p>
                      </div>
                    </td>
                  </tr>
                ) : recentRides.length > 0 ? recentRides.map((ride, idx) => (
                  <tr 
                    key={idx} 
                    onClick={() => {
                      if (ride.status === 'Pending') navigate(`/driver-bids?rideId=${ride.id}`);
                      if (ride.status === 'Active') navigate(`/active-rides?rideId=${ride.id}`);
                    }}
                    className="group hover:bg-slate-50/30 transition-colors cursor-pointer"
                  >
                    <td className="px-8 py-5 text-sm font-semibold text-slate-600 truncate max-w-[200px]">{ride.pickup}</td>
                    <td className="px-8 py-5 text-sm font-semibold text-slate-600 truncate max-w-[200px]">{ride.destination}</td>
                    <td className="px-8 py-5 text-sm font-medium text-slate-400 uppercase">{ride.vehicleType}</td>
                    <td className="px-8 py-5 text-sm font-bold text-slate-800">BDT {ride.fare}</td>
                    <td className="px-8 py-5">
                      <span className={cn(
                         "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                         ride.status === 'Completed' ? "bg-emerald-100 text-emerald-600" : 
                         ride.status === 'Pending' ? "bg-amber-100 text-amber-600" :
                         ride.status === 'Active' ? "bg-blue-100 text-blue-600" :
                         "bg-red-100 text-red-600"
                       )}>
                        {ride.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-medium italic">
                      No rides found. Book your first ride!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
