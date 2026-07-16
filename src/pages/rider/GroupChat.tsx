import React, { useEffect, useState, useRef } from 'react';
import { DashboardLayout } from '@/src/components/layout/DashboardLayout';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Send, User, MessageSquare, Users, Loader2 } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, limit } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { handleFirestoreError, OperationType } from '@/src/lib/firestore-errors';
import { useAuthStore } from '@/src/store/useAuthStore';
import { cn } from '@/src/lib/utils';
import { EmeraldButton } from '@/src/components/ui/EmeraldButton';

export default function RiderGroupChat() {
  const { user, profile } = useAuthStore();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const collectionPath = 'group_messages';
    const q = query(
      collection(db, collectionPath),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).reverse();
      setMessages(msgs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, collectionPath);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !input.trim()) return;

    const text = input;
    setInput('');
    const collectionPath = 'group_messages';

    try {
      await addDoc(collection(db, collectionPath), {
        text,
        senderId: user.uid,
        senderName: profile?.fullName || 'Rider',
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, collectionPath);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto flex gap-6 h-[calc(100vh-12rem)]">
        {/* Sidebar info */}
        <div className="w-80 hidden lg:block space-y-6">
          <GlassCard className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white">
                <Users size={24} />
              </div>
              <div>
                <h2 className="font-bold text-slate-800">Rider Community</h2>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active Chat</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              Share updates about traffic, charging stations, and IUB route status with fellow riders.
            </p>
            <div className="space-y-3">
               <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-slate-600">42 Riders Online</span>
               </div>
            </div>
          </GlassCard>
        </div>

        {/* Chat area */}
        <GlassCard className="flex-1 flex flex-col p-0 overflow-hidden border-slate-100">
           {/* Chat header */}
           <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white/50">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 lg:hidden">
                    <Users size={20} />
                 </div>
                 <div>
                    <h3 className="font-bold text-slate-800">Rider Group Chat</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">IUB - Mirpur Route</p>
                 </div>
              </div>
           </div>

           {/* Messages */}
           <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                   <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                </div>
              ) : messages.map((m) => {
                const isMe = m.senderId === user?.uid;
                return (
                  <div key={m.id} className={cn("flex items-start gap-3", isMe ? "flex-row-reverse" : "")}>
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                       <User size={16} className="text-slate-400" />
                    </div>
                    <div className={cn("max-w-[70%]", isMe ? "text-right" : "")}>
                       {!isMe && <p className="text-[10px] font-bold text-slate-400 mb-1 ml-1">{m.senderName}</p>}
                       <div className={cn(
                         "px-4 py-2.5 rounded-2xl text-sm shadow-sm",
                         isMe ? "bg-emerald-500 text-white rounded-tr-none" : "bg-white border border-slate-100 text-slate-700 rounded-tl-none"
                       )}>
                         {m.text}
                       </div>
                    </div>
                  </div>
                );
              })}
              <div ref={scrollRef} />
           </div>

           {/* Input */}
           <form onSubmit={handleSendMessage} className="p-6 border-t border-slate-50 bg-white/50">
              <div className="flex gap-4">
                 <input 
                   type="text" 
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                   placeholder="Type your message here..."
                   className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-6 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                 />
                 <EmeraldButton type="submit" className="w-12 h-12 p-0 flex items-center justify-center shrink-0">
                    <Send size={18} className="rotate-[-15deg]" />
                 </EmeraldButton>
              </div>
           </form>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
