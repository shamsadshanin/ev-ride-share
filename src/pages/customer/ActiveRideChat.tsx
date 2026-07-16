import React from "react";
import { useState } from 'react';
import { DashboardLayout } from '@/src/components/layout/DashboardLayout';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { EmeraldButton } from '@/src/components/ui/EmeraldButton';
import { Phone, Send, User, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

const messages = [
  { id: 1, sender: 'other', text: 'I am on my way, will reach in 3 minutes.', time: '10:42' },
  { id: 2, sender: 'me', text: 'Great! I am at the main gate.', time: '10:43' },
  { id: 3, sender: 'other', text: 'Perfect, turning onto the main road now.', time: '10:44' },
  { id: 4, sender: 'me', text: 'Okay, I can see you. The green car?', time: '10:45' },
  { id: 5, sender: 'other', text: 'Yes that is me! Walton EV Sedan.', time: '10:45' },
];

export default function ActiveRideChat() {
  const [input, setInput] = useState('');

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto flex gap-8 h-[calc(100vh-8rem)]">
        
        {/* Left Sidebar: Ride Details */}
        <div className="w-80 flex flex-col gap-6 overflow-y-auto">
          <GlassCard className="p-6">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">EV Details</h3>
            <img 
              src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=400&auto=format&fit=crop" 
              alt="EV" 
              className="w-full h-32 object-cover rounded-2xl mb-4 bg-slate-100"
            />
            <h4 className="font-bold text-slate-800 text-lg mb-1">Walton EV Sedan</h4>
            <p className="text-xs text-slate-500 mb-4 font-medium">DHA-5678 • Pearl White</p>
            <div className="flex flex-wrap gap-2">
              {['Electric', 'AC', '4 seats'].map(tag => (
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
                <h4 className="font-bold text-slate-800">Nasrin Akter</h4>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-amber-500">4.9 ★</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">287 completed trips</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 pt-4 border-t border-slate-50">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">Route</span>
                <span className="text-xs font-bold text-slate-700">IUB → sfsoft BD</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">Fare</span>
                <span className="text-xs font-bold text-emerald-600">BDT 45</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">Status</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-wider">
                  En Route
                </span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Area: Chat Window */}
        <GlassCard className="flex-1 flex flex-col p-0 overflow-hidden border-slate-100">
          {/* Chat Header */}
          <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-white/50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Private Chat</h3>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Nasrin Akter • Online</p>
              </div>
            </div>
            <EmeraldButton className="py-2.5 px-6 text-xs">
              <Phone size={14} />
              Call
            </EmeraldButton>
          </div>

          {/* Chat Body */}
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

          {/* Chat Input */}
          <div className="p-8 bg-slate-50/50">
            <div className="relative group">
              <input 
                type="text"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 outline-hidden focus:border-emerald-500 transition-all pr-16 shadow-sm font-medium text-slate-600"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-100">
                <Send size={18} className="rotate-[-15deg]" />
              </button>
            </div>
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
