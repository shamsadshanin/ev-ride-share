import React from "react";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { useAuthStore } from './store/useAuthStore';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import KYC from './pages/customer/KYC';
import CustomerDashboard from './pages/customer/Dashboard';
import PostRide from './pages/customer/PostRide';
import DriverBids from './pages/customer/DriverBids';
import ActiveRideChat from './pages/customer/ActiveRideChat';
import VehicleKYC from './pages/rider/VehicleKYC';
import RiderDashboard from './pages/rider/Dashboard';
import LiveRequestsMap from './pages/rider/LiveRequestsMap';
import ActiveTrip from './pages/rider/ActiveTrip';
import RideHistory from './pages/rider/RideHistory';
import RiderGroupChat from './pages/rider/GroupChat';
import Notifications from './pages/shared/Notifications';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Temporary placeholder for protected screens
const Placeholder = ({ title, userType, userName }: { title: string, userType?: 'customer' | 'rider', userName?: string }) => (
  <DashboardLayout>
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
      <div className="h-96 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center text-slate-400">
        Work in Progress...
      </div>
    </div>
  </DashboardLayout>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const RootRedirect = () => {
  const { user, profile, loading } = useAuthStore();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  if (profile?.userType === 'Rider') {
    return <Navigate to="/rider/dashboard" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

export default function App() {
  const { setUser, setProfile, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setProfile(userDoc.data());
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setProfile, setLoading]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route path="/kyc" element={<ProtectedRoute><KYC /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
        <Route path="/post-ride" element={<ProtectedRoute><PostRide /></ProtectedRoute>} />
        <Route path="/driver-bids" element={<ProtectedRoute><DriverBids /></ProtectedRoute>} />
        <Route path="/active-rides" element={<ProtectedRoute><ActiveRideChat /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        
        <Route path="/rider/kyc" element={<ProtectedRoute><VehicleKYC /></ProtectedRoute>} />
        <Route path="/rider/dashboard" element={<ProtectedRoute><RiderDashboard /></ProtectedRoute>} />
        <Route path="/rider/requests" element={<ProtectedRoute><LiveRequestsMap /></ProtectedRoute>} />
        <Route path="/rider/trip/active" element={<ProtectedRoute><ActiveTrip /></ProtectedRoute>} />
        <Route path="/rider/history" element={<ProtectedRoute><RideHistory /></ProtectedRoute>} />
        <Route path="/rider/chat" element={<ProtectedRoute><RiderGroupChat /></ProtectedRoute>} />
        <Route path="/rider/rides" element={<Navigate to="/rider/history" replace />} />
        <Route path="/rider/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        
        <Route path="/" element={<RootRedirect />} />
      </Routes>
    </Router>
  );
}
