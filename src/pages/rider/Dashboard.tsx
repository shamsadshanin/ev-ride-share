import React from "react";
import { DashboardLayout } from '@/src/components/layout/DashboardLayout';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { EmeraldButton } from '@/src/components/ui/EmeraldButton';
import { Plus, Activity, Car, UserCheck, MapPin, Wallet, Map as MapIcon, Star, Clock, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/src/store/useAuthStore';
import { collection, query, where, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { handleFirestoreError, OperationType } from '@/src/lib/firestore-errors';

export default function RiderDashboard() {
  const navigate = useNavigate();
  const { profile, user } = useAuthStore();
  const kycStatus = profile?.kycStatus || 'Not Started';
  const userName = profile?.fullName || user?.displayName || 'Rider';
  const userType = profile?.userType;

  React.useEffect(() => {
    if (userType === 'Customer') {
      navigate('/dashboard');
    }
  }, [userType, navigate]);

  const isVerified = kycStatus === 'Approved';

  const [activeRide, setActiveRide] = React.useState<any>(null);

  React.useEffect(() => {
    if (!user || !isVerified) return;

    const collectionPath = 'rides';
    const q = query(
      collection(db, collectionPath),
      where('riderId', '==', user.uid),
      where('status', '==', 'Active'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setActiveRide({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      } else {
        setActiveRide(null);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, collectionPath);
    });

    return () => unsubscribe();
  }, [user, isVerified]);

  const stats = [
    { label: "Today's Earnings", value: isVerified ? (profile?.todayEarnings || 'BDT 0') : 'BDT 0', icon: <Wallet className="text-emerald-500" />, sub: '' },
    { label: 'Trips Today', value: isVerified ? (profile?.todayTrips || '0') : '0', icon: <MapIcon className="text-blue-500" />, sub: '' },
    { label: 'Rating', value: isVerified ? (profile?.rating ? `${profile.rating} ★` : '5.0 ★') : 'N/A', icon: <Star className="text-amber-500" />, sub: '' },
    { label: 'Online Hours', value: isVerified ? (profile?.onlineHours || '0 hrs') : '0 hrs', icon: <Clock className="text-purple-500" />, sub: '' },
  ];

  const actionCards = [
    { label: 'Add EV', sub: 'Register new vehicle', icon: <Plus className="text-emerald-500" />, bg: 'bg-emerald-50/50', border: 'border-emerald-100', path: '/rider/kyc' },
    { 
      label: 'Active Rides', 
      sub: activeRide ? 'Trip in progress' : (isVerified ? 'No active trips' : 'Verify to start'), 
      icon: <Activity className={cn("transition-colors", activeRide ? "text-emerald-500" : "text-blue-500")} />, 
      bg: activeRide ? 'bg-emerald-50/50' : 'bg-blue-50/50', 
      border: activeRide ? 'border-emerald-100' : 'border-blue-100', 
      path: activeRide ? `/rider/trip/active?rideId=${activeRide.id}` : '/rider/history' 
    },
    { label: 'My Rides', sub: isVerified ? `${profile?.completedTrips || '0'} total completed` : '0 completed', icon: <Car className="text-purple-500" />, bg: 'bg-purple-50/50', border: 'border-purple-100', path: '/rider/history' },
    { label: 'Profile', sub: kycStatus === 'Approved' ? 'KYC Verified ✓' : 'Action Required', icon: <UserCheck className="text-amber-500" />, bg: 'bg-amber-50/50', border: 'border-amber-100', path: '/rider/profile' },
  ];

  const [realNearbyRequests, setRealNearbyRequests] = React.useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = React.useState(true);

  React.useEffect(() => {
    if (!isVerified) {
      setLoadingRequests(false);
      return;
    }

    const collectionPath = 'rides';
    const q = query(
      collection(db, collectionPath),
      where('status', '==', 'Pending'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRealNearbyRequests(requests);
      setLoadingRequests(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, collectionPath);
    });

    return () => unsubscribe();
  }, [isVerified]);

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
                <h3 className="text-amber-900 font-bold text-lg">Verification Required</h3>
                <p className="text-amber-700/70 text-sm font-medium">To start accepting ride requests and earning, please complete your vehicle and identity verification.</p>
              </div>
            </div>
            <EmeraldButton onClick={() => navigate('/rider/kyc')} className="bg-amber-600 hover:bg-amber-700 shadow-amber-200">
              Complete KYC
            </EmeraldButton>
          </motion.div>
        )}

        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-1">Rider Dashboard</h1>
            <p className="text-slate-500 font-medium">Welcome back, {userName.split(' ')[0]}</p>
          </div>
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full border",
            isVerified ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-slate-100 opacity-50"
          )}>
             <div className={cn("w-2 h-2 rounded-full", isVerified ? "bg-emerald-500" : "bg-slate-400")} />
             <span className={cn(
               "text-[10px] font-black uppercase tracking-widest",
               isVerified ? "text-emerald-600" : "text-slate-400"
             )}>
               {isVerified ? 'Online • Accepting' : 'Offline • Unverified'}
             </span>
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
          {actionCards.map((card, idx) => {
            const isDisabled = !isVerified && card.path !== '/rider/kyc' && card.path !== '/rider/profile';
            
            return (
              <GlassCard 
                key={idx} 
                onClick={() => !isDisabled && navigate(card.path)}
                className={cn(
                  "p-8 transition-all group",
                  isDisabled ? "opacity-50 grayscale cursor-not-allowed" : "cursor-pointer hover:translate-y-[-4px]",
                  card.bg, card.border
                )}
              >
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-1">{card.label}</h3>
                <p className="text-xs text-slate-500 font-medium">{card.sub}</p>
              </GlassCard>
            );
          })}
        </div>

        {/* Nearby Requests */}
        <GlassCard className="p-8 border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-slate-800">Nearby Ride Requests</h3>
            <div className={cn(
              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
              isVerified ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-400"
            )}>
              {isVerified ? `${realNearbyRequests.length} near you` : '0 near you'}
            </div>
          </div>
          <div className="space-y-4">
            {loadingRequests ? (
              <div className="py-10 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                <p className="text-slate-400 text-sm font-medium">Scanning for requests...</p>
              </div>
            ) : realNearbyRequests.length > 0 ? realNearbyRequests.map((req, idx) => (
              <div key={req.id} className="flex items-center justify-between p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-all">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-emerald-500 shadow-sm">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 mb-1">{req.pickup} → {req.destination}</h4>
                    <p className="text-xs text-slate-400 font-medium">
                      {req.vehicleType?.toUpperCase()} • {req.seats} seats
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <span className="text-lg font-black text-slate-800">BDT {req.fare}</span>
                  <EmeraldButton 
                    onClick={() => navigate(`/rider/requests?rideId=${req.id}`)}
                    className="py-2.5 px-8 text-xs shadow-none"
                  >
                    View & Bid
                  </EmeraldButton>
                </div>
              </div>
            )) : (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="text-slate-300" size={32} />
                </div>
                <p className="text-slate-400 font-medium italic">
                  {isVerified ? 'No requests in your area right now.' : 'Complete verification to see requests.'}
                </p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}

