import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  userType?: 'customer' | 'rider';
  userName: string;
}

export function DashboardLayout({ children, userType, userName }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar userType={userType} userName={userName} />
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
