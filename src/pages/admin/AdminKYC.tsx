import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from '@/src/lib/firebase';
import { useAuthStore } from '@/src/store/useAuthStore';
import { CheckCircle2, XCircle, Eye, Loader2, Search, Filter, FileImage, User, Bike, Car } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

type Submission = {
  id: string;
  kind: 'Customer' | 'Rider';
  userId: string;
  fullName: string;
  email: string;
  status: string;
  submittedAt?: any;
  docs: { label: string; value: string }[];
  meta: Record<string, any>;
};

const STATUS_TABS = ['Pending', 'Approved', 'Rejected', 'All'] as const;
type Tab = typeof STATUS_TABS[number];

export default function AdminKYC() {
  const { user } = useAuthStore();
  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('Pending');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Customer' | 'Rider'>('All');
  const [query, setQuery] = useState('');
  const [viewer, setViewer] = useState<{ name: string; docs: { label: string; value: string }[] } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [custSnap, riderSnap, usersSnap] = await Promise.all([
        getDocs(collection(db, 'kyc_submissions')),
        getDocs(collection(db, 'rider_kyc_submissions')),
        getDocs(collection(db, 'users')),
      ]);

      const userMap = new Map<string, any>();
      usersSnap.forEach(d => userMap.set(d.id, d.data()));

      const parse = (snap: any, kind: 'Customer' | 'Rider'): Submission[] =>
        snap.docs.map((d: any) => {
          const data = d.data();
          const prof = userMap.get(d.id) || {};
          const docs: { label: string; value: string }[] = [];
          if (kind === 'Customer') {
            if (data.frontImage) docs.push({ label: 'ID Front', value: data.frontImage });
            if (data.backImage) docs.push({ label: 'ID Back', value: data.backImage });
          } else {
            if (data.evPhoto) docs.push({ label: 'EV Photo', value: data.evPhoto });
            if (data.registrationDocs) docs.push({ label: 'Registration', value: data.registrationDocs });
            if (data.licenseFront) docs.push({ label: 'License Front', value: data.licenseFront });
            if (data.licenseBack) docs.push({ label: 'License Back', value: data.licenseBack });
          }
          return {
            id: d.id,
            kind,
            userId: data.userId || d.id,
            fullName: prof.fullName || (data.userId ? `User ${data.userId.slice(0, 6)}` : 'Unknown'),
            email: prof.email || '',
            status: data.status || 'Pending',
            submittedAt: data.submittedAt,
            docs,
            meta: data,
          };
        });

      setItems([...parse(custSnap, 'Customer'), ...parse(riderSnap, 'Rider')]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const decide = async (item: Submission, decision: 'Approved' | 'Rejected') => {
    setBusyId(item.id);
    try {
      const coll = item.kind === 'Customer' ? 'kyc_submissions' : 'rider_kyc_submissions';
      await updateDoc(doc(db, coll, item.id), {
        status: decision,
        reviewedBy: user?.uid,
        updatedAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'users', item.userId), {
        kycStatus: decision,
        updatedAt: serverTimestamp(),
      });
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: decision } : i));
    } catch (e) {
      console.error(e);
      alert('Failed to update. Check Firestore rules are deployed.');
    } finally {
      setBusyId(null);
    }
  };

  const filtered = items.filter(i => {
    if (tab !== 'All' && i.status !== tab) return false;
    if (typeFilter !== 'All' && i.kind !== typeFilter) return false;
    if (query && !`${i.fullName} ${i.email}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const counts = {
    Pending: items.filter(i => i.status === 'Pending').length,
    Approved: items.filter(i => i.status === 'Approved').length,
    Rejected: items.filter(i => i.status === 'Rejected').length,
  };

  const statusBadge = (s: string) => cn(
    "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
    s === 'Approved' ? "bg-emerald-100 text-emerald-600" :
    s === 'Rejected' ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
  );

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-6 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">KYC Review</h1>
          <p className="text-slate-500 font-medium">Verify customer & rider identity documents</p>
        </div>
        <button onClick={load} className="self-start lg:self-auto px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-600 hover:border-emerald-300 transition-colors">
          Refresh
        </button>
      </header>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          {STATUS_TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                tab === t ? "bg-[#0f172a] text-white" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
              )}>
              {t}{t === 'Pending' ? ` (${counts.Pending})` : ''}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center ml-auto">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search name or email"
              className="pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-sm outline-none focus:border-emerald-500 w-56" />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-600 outline-none focus:border-emerald-500">
            <option value="All">All Types</option>
            <option value="Customer">Customer</option>
            <option value="Rider">Rider</option>
          </select>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center text-slate-400 font-medium italic border-2 border-dashed border-slate-200 rounded-3xl">
          No KYC submissions match this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map(item => (
            <div key={item.id} className="p-6 rounded-3xl bg-white border border-slate-100">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0",
                    item.kind === 'Rider' ? "bg-purple-50 text-purple-600" : "bg-emerald-50 text-emerald-600"
                  )}>
                    {item.kind === 'Rider' ? <Bike size={20} /> : <User size={20} />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate">{item.fullName}</p>
                    <p className="text-xs text-slate-400 truncate">{item.email || item.userId}</p>
                  </div>
                </div>
                <span className={statusBadge(item.status)}>{item.status}</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <span className={cn("px-2.5 py-1 rounded-lg", item.kind === 'Rider' ? "bg-purple-50 text-purple-600" : "bg-emerald-50 text-emerald-600")}>{item.kind}</span>
                {item.kind === 'Rider' && item.meta.vehicleType && <span className="px-2.5 py-1 rounded-lg bg-slate-100">{item.meta.vehicleType}</span>}
                {item.kind === 'Customer' && item.meta.cardType && <span className="px-2.5 py-1 rounded-lg bg-slate-100">{item.meta.cardType}</span>}
              </div>

              <div className="flex items-center gap-2 mb-5">
                <FileImage size={16} className="text-emerald-500" />
                <span className="text-xs font-semibold text-slate-500">{item.docs.length} document(s) submitted</span>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setViewer({ name: item.fullName, docs: item.docs })}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-wider hover:bg-slate-200 transition-colors">
                  <Eye size={14} /> View Docs
                </button>
                {item.status !== 'Approved' && (
                  <button disabled={busyId === item.id} onClick={() => decide(item, 'Approved')}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-black uppercase tracking-wider hover:bg-emerald-600 transition-colors disabled:opacity-60">
                    {busyId === item.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Approve
                  </button>
                )}
                {item.status !== 'Rejected' && (
                  <button disabled={busyId === item.id} onClick={() => decide(item, 'Rejected')}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500 text-white text-xs font-black uppercase tracking-wider hover:bg-red-600 transition-colors disabled:opacity-60">
                    {busyId === item.id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />} Reject
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Viewer Modal */}
      <AnimatePresence>
        {viewer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto"
            onClick={() => setViewer(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl p-6 w-full max-w-3xl my-8"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-black text-slate-800">{viewer.name}</h2>
                  <p className="text-xs text-slate-400 font-medium">Submitted documents (stored per user)</p>
                </div>
                <button onClick={() => setViewer(null)} className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200">✕</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {viewer.docs.map((d, i) => (
                  <div key={i} className="rounded-2xl border border-slate-100 overflow-hidden bg-slate-50">
                    <p className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 bg-white">{d.label}</p>
                    {d.value.startsWith('data:') ? (
                      <img src={d.value} alt={d.label} className="w-full h-56 object-contain p-2" />
                    ) : (
                      <a href={d.value} target="_blank" rel="noreferrer" className="block p-6 text-emerald-600 text-sm font-bold text-center hover:underline">Open file</a>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
