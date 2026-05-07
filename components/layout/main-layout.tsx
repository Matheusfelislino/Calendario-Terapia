'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarIcon, PieChartIcon, UsersIcon, PlusIcon } from 'lucide-react';
import SessionModal from '../calendar/session-modal';
import { getFinancialStats } from '@/app/actions';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState({ received: 0, pending: 0, percent: 0, billed: 0 });

  const loadStats = async () => {
    const today = new Date();
    try {
      const data = await getFinancialStats(today.getFullYear(), today.getMonth());
      setStats({
        received: data.totalReceived,
        pending: data.totalPending,
        billed: data.totalBilled,
        percent: data.totalBilled > 0 ? (data.totalReceived / data.totalBilled) * 100 : 0
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadStats();
  }, [pathname]);

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 flex flex-col flex-shrink-0 bg-zinc-950">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
            </div>
            <span className="font-bold text-xl tracking-tight">SessionFlow</span>
          </div>
          
          <button onClick={() => setIsModalOpen(true)} className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 rounded-md text-sm font-medium flex items-center justify-center gap-2 mb-8 transition-colors shadow-lg shadow-indigo-900/20">
            <PlusIcon className="w-4 h-4" strokeWidth={2.5} />
            Nova Sessão
          </button>

          <nav className="space-y-1.5">
            <Link href="/" className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${pathname === '/' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'}`}>
              <CalendarIcon className="w-4 h-4" />
              Agenda
            </Link>
            <Link href="/financeiro" className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${pathname.startsWith('/financeiro') ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'}`}>
              <PieChartIcon className="w-4 h-4" />
              Financeiro
            </Link>
            <Link href="/relatorios" className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${pathname.startsWith('/relatorios') ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'}`}>
              <UsersIcon className="w-4 h-4" />
              Relatórios
            </Link>
          </nav>
        </div>
        
        <div className="mt-auto p-6 border-t border-zinc-800 bg-zinc-950/50">
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-3">Mês Atual</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Faturamento</span>
                <span className="text-emerald-400 font-medium">R$ {stats.billed.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Pendente</span>
                <span className="text-amber-400 font-medium">R$ {stats.pending.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(stats.percent, 100)}%` }}></div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-zinc-950 overflow-hidden relative">
        {children}
      </main>

      {isModalOpen && (
        <SessionModal 
          isOpen={isModalOpen} 
          onClose={() => {
            setIsModalOpen(false);
            loadStats();
          }} 
          initialDate={new Date()}
          initialStartTime="09:00"
          initialEndTime="10:00"
        />
      )}
    </div>
  );
}
