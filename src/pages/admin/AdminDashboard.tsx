import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from '@/src/lib/firebase';
import { Wallet, CheckCircle2, Clock, Gavel, ShieldAlert, ShieldCheck, Users, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/src/lib/utils';

interface Stat {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  bg: string;
  border: string;
  to?: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalEarnings: 0,
    completedRides: 0,
    pendingRides: 0,
    totalBids: 0,
    kycPending: 0,
    kycVerified: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [ridesSnap, bidsSnap, usersSnap, custSnap, riderSnap] = await Promise.all([
          getDocs(collection(db, 'rides')),
          getDocs(collection(db, 'bids')),
          getDocs(collection(db, 'users')),
          getDocs(query(collection(db, 'kyc_submissions'), where('status', '==', 'Pending'))),
          getDocs(query(collection(db, 'rider_kyc_submissions'), where('status', '==', 'Pending'))),
        ]);

        let earnings = 0;
        let completed = 0;
        let pending = 0;
        ridesSnap.forEach(d => {
          const r = d.data();
          if (r.status === 'Completed') {
            completed++;
            earnings += Number(r.finalFare || r.fare || 0);
          } else if (r.status === 'Pending') {
            pending++;
          }
        });

        let verified = 0;
        usersSnap.forEach(d => {
          if (d.data().kycStatus === 'Approved') verified++;
        });

        if (!active) return;
        setStats({
          totalEarnings: earnings,
          completedRides: completed,
          pendingRides: pending,
          totalBids: bidsSnap.size,
          kycPending: custSnap.size + riderSnap.size,
          kycVerified: verified,
          users: usersSnap.size,
        });
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const cards: Stat[] = [
    { label: "Total Earnings", value: `BDT ${stats.totalEarnings.toLocaleString()}`, sub: "From completed rides", icon: <Wallet className="text-emerald-500" />, bg: "bg-emerald-50/50", border: "border-emerald-100" },
    { label: "Rides Completed", value: stats.completedRides.toString(), sub: "All time", icon: <CheckCircle2 className="text-blue-500" />, bg: "bg-blue-50/50", border: "border-blue-100" },
    { label: "Pending Rides", value: stats.pendingRides.toString(), sub: "Awaiting bids", icon: <Clock className="text-amber-500" />, bg: "bg-amber-50/50", border: "border-amber-100" },
    { label: "Total Bids", value: stats.totalBids.toString(), sub: "Ride offers placed", icon: <Gavel className="text-purple-500" />, bg: "bg-purple-50/50", border: "border-purple-100" },
    { label: "KYC Pending", value: stats.kycPending.toString(), sub: "Needs review", icon: <ShieldAlert className="text-red-500" />, bg: "bg-red-50/50", border: "border-red-100", to: "/shanin-panel/admin/kyc" },
    { label: "KYC Verified", value: stats.kycVerified.toString(), sub: "Approved users", icon: <ShieldCheck className="text-emerald-500" />, bg: "bg-emerald-50/50", border: "border-emerald-100" },
    { label: "Users Registered", value: stats.users.toString(), sub: "Total accounts", icon: <Users className="text-slate-500" />, bg: "bg-slate-50", border: "border-slate-100" },
    { label: "Active Rate", value: stats.users ? `${Math.round((stats.completedRides / Math.max(stats.users, 1)) * 100)}%` : "0%", sub: "Rides per user", icon: <TrendingUp className="text-teal-500" />, bg: "bg-teal-50/50", border: "border-teal-100" },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Dashboard</h1>
        <p className="text-slate-500 font-medium">Platform overview & key metrics</p>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-32 rounded-3xl bg-white border border-slate-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((c) => {
            const Wrapper = c.to ? Link : 'div';
            return (
              <Wrapper key={c.label} to={c.to || ''} className={cn(
                "p-6 rounded-3xl bg-white border transition-all",
                c.bg, c.border,
                c.to && "hover:-translate-y-1 hover:shadow-lg cursor-pointer"
              )}>
                <div className="flex items-start justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">{c.icon}</div>
                </div>
                <p className="text-3xl font-black text-slate-800 tracking-tight">{c.value}</p>
                <p className="text-sm font-bold text-slate-700 mt-1">{c.label}</p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">{c.sub}</p>
              </Wrapper>
            );
          })}
        </div>
      )}
    </div>
  );
}
