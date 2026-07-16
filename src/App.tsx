/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { DashboardLayout } from './components/layout/DashboardLayout';

// Temporary placeholder for protected screens
const Placeholder = ({ title, userType, userName }: { title: string, userType?: 'customer' | 'rider', userName?: string }) => (
  <DashboardLayout userType={userType} userName={userName || "Aynan Nishat"}>
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
      <div className="h-96 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center text-slate-400">
        Work in Progress...
      </div>
    </div>
  </DashboardLayout>
);

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/kyc" element={<KYC />} />
        
        <Route path="/dashboard" element={<CustomerDashboard />} />
        <Route path="/post-ride" element={<PostRide />} />
        <Route path="/driver-bids" element={<DriverBids />} />
        <Route path="/active-rides" element={<ActiveRideChat />} />
        
        <Route path="/rider/kyc" element={<VehicleKYC />} />
        <Route path="/rider/dashboard" element={<RiderDashboard />} />
        <Route path="/rider/requests" element={<LiveRequestsMap />} />
        <Route path="/rider/trip/active" element={<ActiveTrip />} />
        <Route path="/rider/history" element={<RideHistory />} />
        <Route path="/rider/rides" element={<Navigate to="/rider/history" replace />} />
        <Route path="/rider/notifications" element={<Placeholder title="Notifications" userType="rider" userName="Nasrin Akter" />} />
        
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
