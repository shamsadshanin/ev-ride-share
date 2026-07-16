import React from "react";
import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, serverTimestamp, collection, query, where, orderBy, addDoc } from 'firebase/firestore';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { db } from '@/src/lib/firebase';
import { useAuthStore } from '@/src/store/useAuthStore';
import { handleFirestoreError, OperationType } from '@/src/lib/firestore-errors';
import { createNotification } from '@/src/lib/notifications';
import { DashboardLayout } from '@/src/components/layout/DashboardLayout';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { EmeraldButton } from '@/src/components/ui/EmeraldButton';
import { Phone, Send, User, MessageSquare, MapPin, Loader2, CheckCircle, Users, AlertCircle, ChevronLeft, Mic, X, PhoneOff } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

// Fix Leaflet icon issue
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14);
  }, [center, map]);
  return null;
}

export default function ActiveTrip() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const rideId = searchParams.get('rideId');
  const { user, profile } = useAuthStore();
  
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [selectedRideId, setSelectedRideId] = useState<string | null>(rideId);
  const [viewMode, setViewMode] = useState<'list' | 'details'>('list');
  const [isCalling, setIsCalling] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!user) return;

    const collectionPath = 'rides';
    const q = query(
      collection(db, collectionPath),
      where('riderId', '==', user.uid),
      where('status', '==', 'Active')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activeRides = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRides(activeRides);
      if (activeRides.length > 0 && !selectedRideId) {
        setSelectedRideId(activeRides[0].id);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, collectionPath);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!selectedRideId) {
      setMessages([]);
      return;
    }

    const collectionPath = 'ride_messages';
    const q = query(
      collection(db, collectionPath),
      where('rideId', '==', selectedRideId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, collectionPath);
    });

    return () => unsubscribe();
  }, [selectedRideId]);

  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'connected'>('idle');

  useEffect(() => {
    if (callStatus === 'connected') {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setCallDuration(0);
    }
    return () => clearInterval(timerRef.current);
  }, [callStatus]);

  const startCall = () => {
    setCallStatus('calling');
    setTimeout(() => setCallStatus('connected'), 2000);
    setIsCalling(true);
  };

  const endCall = () => {
    setCallStatus('idle');
    setIsCalling(false);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || !user || !selectedRideId) return;

    const text = input;
    setInput('');
    const collectionPath = 'ride_messages';

    try {
      await addDoc(collection(db, collectionPath), {
        rideId: selectedRideId,
        senderId: user.uid,
        senderName: profile?.fullName || 'Rider',
        text,
        createdAt: serverTimestamp(),
      });

      // Notify customer
      if (selectedRide?.customerId) {
        await createNotification(
          selectedRide.customerId,
          'New Message',
          `Rider: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`,
          'info'
        );
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, collectionPath);
    }
  };

  const handleCompleteRide = async (id: string) => {
    try {
      await updateDoc(doc(db, 'rides', id), {
        status: 'Completed',
        completedAt: serverTimestamp(),
      });
      
      const ride = rides.find(r => r.id === id);
      if (ride?.customerId) {
        await createNotification(
          ride.customerId,
          'Ride Completed',
          'Your trip has been completed successfully. Hope you had a great ride!',
          'success'
        );
      }

      if (rides.length <= 1) {
        navigate('/rider/history');
      }
    } catch (err) {
      console.error('Error completing ride:', err);
    }
  };

  const handleToggleOnboard = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'Onboard' ? 'Waiting' : 'Onboard';
      await updateDoc(doc(db, 'rides', id), {
        rideSubStatus: newStatus
      });

      // Notify customer
      const ride = rides.find(r => r.id === id);
      if (ride?.customerId && newStatus === 'Onboard') {
        await createNotification(
          ride.customerId,
          'Ride Started',
          'Your rider has marked you as onboard. Have a safe journey!',
          'success'
        );
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const selectedRide = rides.find(r => r.id === selectedRideId) || rides[0];
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-96 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
          <p className="font-bold text-slate-500 uppercase tracking-widest text-xs">Loading active trips...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (rides.length === 0) {
    return (
      <DashboardLayout>
        <div className="h-96 flex flex-col items-center justify-center gap-4 text-slate-400">
          <MapPin size={48} className="opacity-20" />
          <p className="font-bold uppercase tracking-widest text-xs">No active trips found</p>
          <EmeraldButton onClick={() => navigate('/rider/dashboard')} className="mt-4">
             Back to Dashboard
          </EmeraldButton>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)] relative">
        
        {/* Left Side: Passenger Manifest */}
        <div className={cn(
          "w-full lg:w-96 flex flex-col gap-6 overflow-y-auto transition-all duration-300",
          viewMode === 'details' ? "hidden lg:flex" : "flex"
        )}>
           <GlassCard className="p-6">
             <div className="flex items-center gap-3 mb-6">
                <Users className="text-emerald-500" />
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">Passenger Manifest</h3>
             </div>
             
             <div className="space-y-3">
                {rides.map((r) => (
                  <div 
                    key={r.id} 
                    onClick={() => {
                      setSelectedRideId(r.id);
                      setViewMode('details');
                    }}
                    className={cn(
                      "p-5 rounded-[2rem] border transition-all cursor-pointer group mb-3 relative overflow-hidden",
                      selectedRideId === r.id ? "bg-white border-emerald-500 shadow-xl shadow-emerald-50" : "bg-white border-slate-100 hover:border-slate-200"
                    )}
                  >
                    {selectedRideId === r.id && (
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                    )}
                    <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                            selectedRideId === r.id ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200" : "bg-slate-50 text-slate-400"
                          )}>
                             <User size={20} />
                          </div>
                          <div className="min-w-0">
                             <h4 className="text-base font-bold text-slate-800 truncate">{r.customerName || 'Passenger'}</h4>
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">{r.destination}</p>
                          </div>
                       </div>
                       <button 
                         onClick={(e) => {
                           e.stopPropagation();
                           handleToggleOnboard(r.id, r.rideSubStatus);
                         }}
                         className={cn(
                           "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 shadow-sm",
                           r.rideSubStatus === 'Onboard' ? "bg-emerald-500 text-white" : "bg-amber-100 text-amber-600 border border-amber-200"
                         )}
                       >
                         {r.rideSubStatus === 'Onboard' ? 'Onboard ✓' : 'Waiting'}
                       </button>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50/50 -mx-5 -mb-5 px-5 py-3 border-t border-slate-50">
                       <div className="flex flex-col">
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Est. Fare</span>
                          <span className="text-sm font-black text-slate-800">৳{r.finalFare || r.fare}</span>
                       </div>
                       <EmeraldButton 
                         onClick={(e) => {
                           e.stopPropagation();
                           handleCompleteRide(r.id);
                         }}
                         className="py-2.5 px-5 text-[10px] font-black rounded-xl shadow-lg shadow-emerald-100"
                       >
                          Complete Ride
                       </EmeraldButton>
                    </div>
                  </div>
                ))}
             </div>
           </GlassCard>

          <GlassCard className="p-6 bg-slate-900 text-white border-none shadow-xl shadow-slate-100 hidden lg:block">
             <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold">Trip Summary</h4>
                <div className="flex items-center gap-1.5 bg-emerald-500/20 px-2 py-1 rounded-lg">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                   <span className="text-[8px] font-black uppercase">Live</span>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                   <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Onboard</p>
                   <p className="text-lg font-black">{rides.filter(r => r.rideSubStatus === 'Onboard').length}</p>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                   <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Pending</p>
                   <p className="text-lg font-black">{rides.filter(r => r.rideSubStatus !== 'Onboard').length}</p>
                </div>
             </div>
          </GlassCard>
        </div>

        {/* Right Area: Map & Chat */}
        <div className={cn(
          "flex-1 flex flex-col gap-6 overflow-hidden transition-all duration-300",
          viewMode === 'list' ? "hidden lg:flex" : "flex"
        )}>
           {/* Map Section */}
           <div className="h-48 lg:h-64 bg-slate-100 rounded-[2rem] border border-slate-200 overflow-hidden relative shrink-0 z-0">
              <MapContainer 
                center={[23.8103, 90.4125]} 
                zoom={13} 
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[23.8103, 90.4125]}>
                  <Popup>Current Location</Popup>
                </Marker>
                <MapRecenter center={[23.8103, 90.4125]} />
              </MapContainer>
              <div className="absolute bottom-4 left-4 z-10">
                 <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
                    <MapPin size={12} className="text-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-700">Dhaka, Bangladesh</span>
                 </div>
              </div>
              <button 
                onClick={() => setViewMode('list')}
                className="absolute top-4 left-4 z-10 lg:hidden w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-600 hover:text-emerald-500 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
           </div>

           {/* Selected Ride Details & Chat */}
           <GlassCard className="flex-1 flex flex-col p-0 overflow-hidden border-slate-100">
             <div className="px-6 lg:px-8 py-4 border-b border-slate-50 flex justify-between items-center bg-white/50 shrink-0">
               <div className="flex items-center gap-4 min-w-0">
                 <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0">
                   <User size={20} className="text-slate-400" />
                 </div>
                 <div className="min-w-0">
                   <h3 className="font-bold text-slate-800 truncate">{selectedRide?.customerName || 'Select a passenger'}</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{selectedRide?.destination || 'N/A'}</p>
                 </div>
               </div>
               <div className="flex gap-2 shrink-0">
                 <button 
                   onClick={startCall}
                   className="p-2.5 rounded-xl bg-emerald-50 text-emerald-500 hover:bg-emerald-100 transition-all border border-emerald-100 shadow-xs"
                 >
                    <Phone size={16} />
                 </button>
                 <button className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all border border-slate-100 shadow-xs">
                    <AlertCircle size={16} className="text-red-400" />
                 </button>
               </div>
             </div>

             <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 bg-slate-50/20">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center py-10 opacity-40">
                    <MessageSquare size={32} className="text-slate-300 mb-2" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Start a conversation</p>
                  </div>
                ) : messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={cn(
                      "flex flex-col max-w-[85%]",
                      msg.senderId === user?.uid ? "ml-auto items-end" : "items-start"
                    )}
                  >
                    <div className={cn(
                      "px-5 py-3 rounded-2xl text-sm font-medium leading-relaxed shadow-sm",
                      msg.senderId === user?.uid 
                        ? "bg-emerald-500 text-white rounded-tr-none shadow-emerald-100" 
                        : "bg-white text-slate-700 rounded-tl-none border border-slate-100"
                    )}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 mt-1.5 px-2">
                      {msg.createdAt?.toDate ? new Date(msg.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                    </span>
                  </div>
                ))}
                <div ref={scrollRef} />
             </div>

             <form onSubmit={handleSendMessage} className="p-4 lg:p-6 border-t border-slate-50 bg-white/50 shrink-0">
               <div className="flex gap-3">
                  <input 
                    type="text"
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-5 lg:px-6 py-3 lg:py-3.5 outline-none focus:border-emerald-500 transition-all shadow-sm font-medium text-sm text-slate-600"
                  />
                  <EmeraldButton type="submit" className="w-12 h-12 p-0 flex items-center justify-center shrink-0">
                    <Send size={18} className="rotate-[-15deg]" />
                  </EmeraldButton>
               </div>
             </form>
           </GlassCard>
        </div>

        {/* Calling Overlay */}
        <AnimatePresence>
          {isCalling && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-md"
            >
              <div className="flex flex-col items-center gap-8 text-white max-w-xs w-full">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-emerald-500/20 flex items-center justify-center animate-pulse">
                    <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center shadow-2xl shadow-emerald-500/50">
                      <User size={48} />
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-emerald-400 p-2 rounded-full animate-bounce">
                    <Mic size={16} />
                  </div>
                </div>
                
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-1">{selectedRide?.customerName || 'Customer'}</h2>
                  <p className="text-emerald-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                    {callStatus === 'calling' ? 'Calling...' : formatTime(callDuration)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-8 mt-4">
                  <button className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors">
                    <Mic size={24} className="text-slate-400" />
                  </button>
                  <button 
                    onClick={endCall}
                    className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors shadow-xl shadow-red-500/20"
                  >
                    <PhoneOff size={24} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
