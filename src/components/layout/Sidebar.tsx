import { NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '@/src/lib/firebase';
import { useAuthStore } from '@/src/store/useAuthStore';
import { LayoutDashboard, Send, Car, LogOut, Bell, User, MessageSquare } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const customerLinks = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Send, label: 'Post a Ride', path: '/post-ride' },
  { icon: Car, label: 'Active Rides', path: '/active-rides' },
  { icon: MessageSquare, label: 'Community', path: '/community' },
];

const riderLinks = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/rider/dashboard' },
  { icon: Car, label: 'My Rides', path: '/rider/history' },
  { icon: MessageSquare, label: 'Community Chat', path: '/rider/chat' },
  { icon: Bell, label: 'Notifications', path: '/rider/notifications' },
];

export function Sidebar() {
  const { profile, user } = useAuthStore();
  const userType = profile?.userType?.toLowerCase() || 'customer';
  const userName = profile?.fullName || user?.displayName || 'User';
  const userStatus = profile?.userStatus || 'Active';
  const kycStatus = profile?.kycStatus || 'Not Started';
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isVerified = kycStatus === 'Approved';
  const links = userType === 'customer' ? customerLinks : riderLinks;

  return (
    <aside className="w-64 h-screen bg-[#0f172a] text-white flex flex-col fixed left-0 top-0 z-50">
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
            <Send className="text-white w-6 h-6 rotate-[-15deg]" />
          </div>
          <div>
            <h1 className="font-bold text-xl leading-tight">EV Ride</h1>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Share Platform</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {links.map((link) => {
          const isDisabled = !isVerified && link.path !== '/dashboard' && link.path !== '/rider/dashboard';
          
          return (
            <NavLink
              key={link.path}
              to={isDisabled ? '#' : link.path}
              onClick={(e) => {
                if (isDisabled) {
                  e.preventDefault();
                  navigate(userType === 'customer' ? '/dashboard' : '/rider/dashboard');
                }
              }}
              className={({ isActive }) => cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white",
                isDisabled && "opacity-40 cursor-not-allowed hover:bg-transparent hover:text-slate-400"
              )}
            >
              <link.icon className="w-5 h-5" />
              <span className="font-medium">{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-4">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-3.5 w-full text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/5"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Log Out</span>
        </button>

        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center relative overflow-hidden">
             <User className="w-6 h-6 text-slate-400" />
             <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#0f172a] rounded-full" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{userName}</p>
            <p className="text-[10px] text-emerald-400 font-medium">{userStatus}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
