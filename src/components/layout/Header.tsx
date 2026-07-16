import { Bell, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/src/store/useAuthStore';
import { cn } from '@/src/lib/utils';

export function Header() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const userType = profile?.userType?.toLowerCase() || 'customer';

  const notificationPath = userType === 'rider' ? '/rider/notifications' : '/notifications';

  return (
    <header className="glass h-20 border-b border-white/50 flex items-center justify-between px-5 lg:px-8 sticky top-0 z-30 rounded-b-3xl">
      <div className="hidden md:flex items-center gap-3 glass px-4 py-2.5 rounded-2xl border-white/60 w-96">
        <Search className="text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search for rides, routes..."
          className="bg-transparent border-none outline-none text-sm font-medium text-slate-600 w-full placeholder:text-slate-400"
        />
      </div>

      <div className="flex items-center gap-3 md:gap-6 ml-auto">
        <button
          onClick={() => navigate(notificationPath)}
          className="relative w-12 h-12 rounded-2xl glass flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:bg-emerald-50/70 transition-all border-white/60 group"
        >
          <Bell className="w-6 h-6 transition-transform group-hover:rotate-12" />
          <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
        </button>

        <div className="flex items-center gap-3 md:gap-4 pl-3 md:pl-6 border-l border-white/50">
           <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800 leading-tight">{profile?.fullName || 'User'}</p>
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{profile?.userType || 'Customer'}</p>
           </div>
           <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center overflow-hidden border-white/60">
             <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-black text-lg glow-emerald">
               {profile?.fullName?.charAt(0) || 'U'}
             </div>
           </div>
        </div>
      </div>
    </header>
  );
}
