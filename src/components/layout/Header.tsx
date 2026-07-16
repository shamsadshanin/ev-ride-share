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
    <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100 w-96">
        <Search className="text-slate-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Search for rides, routes..." 
          className="bg-transparent border-none outline-none text-sm font-medium text-slate-600 w-full placeholder:text-slate-400"
        />
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={() => navigate(notificationPath)}
          className="relative w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all border border-slate-100 group"
        >
          <Bell className="w-6 h-6 transition-transform group-hover:rotate-12" />
          <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
        </button>

        <div className="flex items-center gap-4 pl-6 border-l border-slate-100">
           <div className="text-right">
              <p className="text-sm font-bold text-slate-800 leading-tight">{profile?.fullName || 'User'}</p>
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{profile?.userType || 'Customer'}</p>
           </div>
           <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
             <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-black text-lg">
               {profile?.fullName?.charAt(0) || 'U'}
             </div>
           </div>
        </div>
      </div>
    </header>
  );
}
