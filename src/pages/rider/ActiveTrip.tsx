import { useState } from 'react';
import { DashboardLayout } from '@/src/components/layout/DashboardLayout';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { EmeraldButton } from '@/src/components/ui/EmeraldButton';
import { Phone, Send, User, MessageSquare, MapPin } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const messages = [
  { id: 1, sender: 'other', text: 'Hi, I am at gate 3.', time: '11:05' },
  { id: 2, sender: 'me', text: 'Coming! 1 minute.', time: '11:06' },
  { id: 3, sender: 'other', text: 'Okay, I see the car.', time: '11:07' },
];

const passengers = [
  { id: 1, name: 'Aynan Nishat', status: 'Onboard', loc: 'sfsoft BD, Mirpur', fare: 'BDT 50', type: '1st Person' },
  { id: 2, name: 'Sofina', status: 'Waiting', loc: 'Jamuna Future Park', fare: 'BDT 40', type: '2nd Person' },
];

export default function ActiveTrip() {
  const [input, setInput] = useState('');

  return (
    <DashboardLayout userType="rider" userName="Nasrin Akter">
      <div className="max-w-6xl mx-auto flex gap-8 h-[calc(100vh-8rem)]">
        
        {/* Left Sidebar: Trip & Passengers */}
        <div className="w-80 flex flex-col gap-6 overflow-y-auto">
          <GlassCard className="p-6">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Active Trip</h3>
            <div className="flex items-center gap-2 mb-4">
               <div className="w-2 h-2 bg-emerald-500 rounded-full" />
               <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">In Progress</span>
            </div>
            <p className="font-bold text-slate-800 mb-4">Walton EV • DHA-5678</p>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
               <div className="bg-emerald-500 h-full w-[45%]" />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-400">
               <span>0%</span>
               <span>45%</span>
               <span>100%</span>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Customer Details</h3>
            <div className="space-y-8">
              {passengers.map((p) => (
                <div key={p.id} className="relative">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                      <User size={20} className="text-slate-300" />
                    </div>
                    <div className="flex-1">
                       <div className="flex justify-between items-start mb-1">
                          <p className="text-xs font-black text-slate-800">{p.type}: {p.name}</p>
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider",
                            p.status === 'Onboard' ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                          )}>
                            {p.status}
                          </span>
                       </div>
                       <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium mb-1">
                          <MapPin size={10} />
                          {p.loc}
                       </div>
                       <p className="text-xs font-black text-emerald-600">{p.fare}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Area: Chat Window */}
        <GlassCard className="flex-1 flex flex-col p-0 overflow-hidden border-slate-100">
          <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-white/50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Private Chat — Aynan Nishat</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Destination: sfsoft BD, Mirpur</p>
              </div>
            </div>
            <EmeraldButton className="py-2.5 px-6 text-xs shadow-none">
              <Phone size={14} />
              Call
            </EmeraldButton>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={cn(
                  "flex flex-col max-w-[80%]",
                  msg.sender === 'me' ? "ml-auto items-end" : "items-start"
                )}
              >
                <div className={cn(
                  "px-6 py-4 rounded-3xl text-sm font-medium leading-relaxed shadow-sm",
                  msg.sender === 'me' 
                    ? "bg-emerald-500 text-white rounded-tr-none shadow-emerald-100" 
                    : "bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100"
                )}>
                  {msg.text}
                </div>
                <span className="text-[10px] font-bold text-slate-300 mt-2 px-2">{msg.time}</span>
              </div>
            ))}
          </div>

          <div className="p-8 bg-slate-50/50">
            <div className="relative">
              <input 
                type="text"
                placeholder="Message Aynan Nishat..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 outline-hidden focus:border-emerald-500 transition-all pr-16 shadow-sm font-medium text-slate-600"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100">
                <Send size={18} className="rotate-[-15deg]" />
              </button>
            </div>
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
