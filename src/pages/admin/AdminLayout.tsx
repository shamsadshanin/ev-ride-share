import React, { useState } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { useAuthStore } from '@/src/store/useAuthStore';
import { LayoutDashboard, ShieldCheck, LogOut, Menu, X, Leaf } from 'lucide-react';
import { cn } from '@/src/lib/utils';

// --- Admin access configuration ---
// The admin panel lives at /shanin-panel/admin and is protected by a PIN.
// Set your own PIN here. Optionally restrict to specific accounts.
export const ADMIN_PIN = "0811";
export const ADMIN_EMAILS: string[] = []; // e.g. ["admin@evride.com"]
export const ADMIN_UIDS: string[] = [];    // e.g. ["abc123..."]

function isAuthorizedAccount(user: any): boolean {
  if (!user) return false;
  if (ADMIN_EMAILS.length && user.email && ADMIN_EMAILS.includes(user.email)) return true;
  if (ADMIN_UIDS.length && user.uid && ADMIN_UIDS.includes(user.uid)) return true;
  return false;
}

function PinGate({ onSuccess }: { onSuccess: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem("evride_admin", "1");
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center">
        <div className="w-14 h-14 mx-auto bg-emerald-500 rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg shadow-emerald-200">
          <ShieldCheck size={26} />
        </div>
        <h1 className="text-xl font-black text-slate-800">Admin Access</h1>
        <p className="text-sm text-slate-500 mt-1 mb-6">Enter the admin PIN to continue</p>
        <input
          type="password"
          value={pin}
          autoFocus
          onChange={(e) => { setPin(e.target.value); setError(false); }}
          placeholder="••••"
          className={cn(
            "w-full text-center tracking-[0.4em] text-lg font-bold bg-slate-50 border rounded-2xl px-4 py-3 outline-none transition-all",
            error ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-emerald-500"
          )}
        />
        {error && <p className="text-red-500 text-xs font-medium mt-3">Incorrect PIN. Try again.</p>}
        <button type="submit" className="w-full mt-6 py-3 rounded-2xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-colors">
          Unlock
        </button>
      </form>
    </div>
  );
}

const navItems = [
  { to: "/shanin-panel/admin", label: "Dashboard", icon: <LayoutDashboard size={18} />, end: true },
  { to: "/shanin-panel/admin/kyc", label: "KYC Review", icon: <ShieldCheck size={18} /> },
];

export default function AdminLayout() {
  const { user, profile, setUser, setProfile, setLoading } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem("evride_admin") === "1" || isAuthorizedAccount(user)
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center">
          <div className="w-14 h-14 mx-auto bg-emerald-500 rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg shadow-emerald-200">
            <Leaf size={26} />
          </div>
          <h1 className="text-xl font-black text-slate-800">EV Ride Admin</h1>
          <p className="text-sm text-slate-500 mt-1 mb-6">Please sign in to access the panel.</p>
          <Link to="/login" className="block w-full py-3 rounded-2xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (!authed) {
    return <PinGate onSuccess={() => setAuthed(true)} />;
  }

  const handleLogout = async () => {
    sessionStorage.removeItem("evride_admin");
    try {
      const { signOut } = await import('firebase/auth');
      const { auth } = await import('@/src/lib/firebase');
      await signOut(auth);
    } catch {}
    setUser(null);
    setProfile(null);
    setLoading(true);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-[#0f172a] text-slate-300 flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center gap-2 px-6 border-b border-white/10">
          <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-emerald-900/40">EV</div>
          <div>
            <p className="text-white font-extrabold leading-tight">EV Ride</p>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                isActive ? "bg-emerald-500 text-white shadow-lg shadow-emerald-900/40" : "hover:bg-white/5 hover:text-white"
              )}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="px-4 py-3 mb-2">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Signed in as</p>
            <p className="text-sm font-bold text-white truncate">{profile?.fullName || user.email}</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-300 hover:bg-red-500/10 w-full transition-all">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="lg:hidden flex items-center gap-3 h-16 px-5 bg-white border-b border-slate-100 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-700"><Menu size={22} /></button>
          <span className="font-extrabold text-slate-800">EV Ride Admin</span>
        </div>
        <main className="flex-1 p-5 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
