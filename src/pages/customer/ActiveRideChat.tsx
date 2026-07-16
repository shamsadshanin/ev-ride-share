import React from "react";
import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, collection, query, where, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { db } from '@/src/lib/firebase';
import { useAuthStore } from '@/src/store/useAuthStore';
import { handleFirestoreError, OperationType } from '@/src/lib/firestore-errors';
import { createNotification } from '@/src/lib/notifications';
import { DashboardLayout } from '@/src/components/layout/DashboardLayout';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { EmeraldButton } from '@/src/components/ui/EmeraldButton';
import { Phone, Send, User, MessageSquare, Loader2, MapPin, ChevronLeft, Mic, PhoneOff, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

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

export default function ActiveRideChat() {
  const [searchParams] = useSearchParams();
  const rideId = searchParams.get('rideId');
  const { user, profile } = useAuthStore();
  const [ride, setRide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [viewMode, setViewMode] = useState<'chat' | 'details'>('chat');
  const [isCalling, setIsCalling] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!rideId) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'rides', rideId), (docSnap) => {
      if (docSnap.exists()) {
        setRide({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [rideId]);

  useEffect(() => {
    if (!rideId) return;

    const collectionPath = 'ride_messages';
    const q = query(
      collection(db, collectionPath),
      where('rideId', '==', rideId),
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
  }, [rideId]);

  useEffect(() => {
    if (isCalling) {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setCallDuration(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isCalling]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || !user || !rideId) return;

    const text = input;
    setInput('');
    const collectionPath = 'ride_messages';

    try {
      await addDoc(collection(db, collectionPath), {
        rideId,
        senderId: user.uid,
        senderName: profile?.fullName || 'Customer',
        text,
        createdAt: serverTimestamp(),
      });

      // Notify rider
      if (ride?.riderId) {
        await createNotification(
          ride.riderId,
          'New Message',
          `${profile?.fullName || 'Customer'}: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`,
          'info'
        );
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, collectionPath);
    }
  };

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
          <p className="font-bold text-slate-500 uppercase tracking-widest text-xs">Connecting to rider...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!ride) {
    return (
      <DashboardLayout>
        <div className="h-96 flex flex-col items-center justify-center gap-4 text-slate-400">
          <MapPin size={48} className="opacity-20" />
          <p className="font-bold uppercase tracking-widest text-xs">No active ride found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] relative">
        
        {/* Left Sidebar: Ride Details */}
        <div className={cn(
          "w-full lg:w-80 flex flex-col gap-6 overflow-y-auto transition-all duration-300",
          viewMode === 'chat' ? "hidden lg:flex" : "flex"
        )}>
           <div className="flex items-center gap-2 lg:hidden mb-2" onClick={() => setViewMode('chat')}>
              <button className="p-2 rounded-full bg-slate-100 text-slate-600">
                <ChevronLeft size={18} />
              </button>
              <span className="font-bold text-slate-600">Back to Chat</span>
           </div>

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
              <div className="absolute bottom-3 left-3 z-10">
                 <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
                    <MapPin size={10} className="text-emerald-500" />
                    <span className="text-[8px] font-bold text-slate-700 uppercase">Live Location</span>
                 </div>
              </div>
           </div>

          <GlassCard className="p-6">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">EV Details</h3>
            <img 
              src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=400&auto=format&fit=crop" 
              alt="EV" 
              className="w-full h-32 object-cover rounded-2xl mb-4 bg-slate-100"
            />
            <h4 className="font-bold text-slate-800 text-lg mb-1">{ride.vehicleType?.toUpperCase()}</h4>
            <p className="text-xs text-slate-500 mb-4 font-medium">{ride.riderName}</p>
            <div className="flex flex-wrap gap-2">
              {['Electric', 'AC', `${ride.seats || 2} seats`].map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider">
                  {tag}
                </span>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Rider Details</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                <User size={24} className="text-slate-300" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">{ride.riderName}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-amber-500">4.9 ★</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Verified Rider</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 pt-4 border-t border-slate-50">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">Route</span>
                <span className="text-[10px] font-bold text-slate-700 truncate max-w-[120px]">{ride.pickup} → {ride.destination}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">Fare</span>
                <span className="text-xs font-bold text-emerald-600">BDT {ride.finalFare || ride.fare}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">Status</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-wider">
                  {ride.status}
                </span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Area: Chat Window */}
        <div className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          viewMode === 'details' ? "hidden lg:flex" : "flex"
        )}>
          <GlassCard className="flex-1 flex flex-col p-0 overflow-hidden border-slate-100 h-full">
            {/* Chat Header */}
            <div className="px-6 lg:px-8 py-4 lg:py-6 border-b border-slate-50 flex justify-between items-center bg-white/50 shrink-0">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-800 truncate">{ride.riderName}</h3>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest truncate">Rider • Online</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsCalling(true)}
                  className="p-2.5 rounded-xl bg-emerald-50 text-emerald-500 hover:bg-emerald-100 transition-all border border-emerald-100 shadow-xs"
                >
                  <Phone size={16} />
                </button>
                <button 
                  onClick={() => setViewMode('details')}
                  className="lg:hidden p-2.5 rounded-xl bg-slate-50 text-slate-400 border border-slate-100"
                >
                  <Info size={16} />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 bg-slate-50/20">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                  <MessageSquare size={48} className="mb-4" />
                  <p className="font-black uppercase tracking-widest text-[10px]">No messages yet</p>
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

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-4 lg:p-8 bg-slate-50/50 shrink-0">
              <div className="relative group">
                <input 
                  type="text"
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 lg:px-6 py-3.5 outline-hidden focus:border-emerald-500 transition-all pr-16 shadow-sm font-medium text-slate-600"
                />
                <button 
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-100"
                >
                  <Send size={18} className="rotate-[-15deg]" />
                </button>
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
                  <h2 className="text-2xl font-bold mb-1">{ride.riderName}</h2>
                  <p className="text-emerald-400 font-bold uppercase tracking-[0.2em] text-[10px]">{formatTime(callDuration)}</p>
                </div>

                <div className="grid grid-cols-2 gap-8 mt-4">
                  <button className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors">
                    <Mic size={24} className="text-slate-400" />
                  </button>
                  <button 
                    onClick={() => setIsCalling(false)}
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
