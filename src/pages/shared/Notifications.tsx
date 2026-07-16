import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/src/components/layout/DashboardLayout';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Bell, Info, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useAuthStore } from '@/src/store/useAuthStore';
import { cn } from '@/src/lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  createdAt: any;
  read: boolean;
}

export default function Notifications() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      setNotifications(notifs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="text-emerald-500" />;
      case 'warning': return <AlertCircle className="text-amber-500" />;
      default: return <Info className="text-blue-500" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-slate-800 mb-1">Notifications</h1>
          <p className="text-slate-500 font-medium">Stay updated with your ride activity</p>
        </header>

        <div className="space-y-4">
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((n) => (
              <GlassCard key={n.id} className={cn("p-6 flex items-start gap-4 transition-all hover:translate-x-1", !n.read && "bg-white border-l-4 border-l-emerald-500")}>
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-slate-800">{n.title}</h3>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      <Clock size={10} />
                      {n.createdAt?.toDate ? n.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">{n.message}</p>
                </div>
              </GlassCard>
            ))
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-4 border-2 border-dashed border-slate-200 rounded-3xl">
              <Bell className="w-12 h-12 opacity-20" />
              <p className="font-medium">No notifications yet</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
