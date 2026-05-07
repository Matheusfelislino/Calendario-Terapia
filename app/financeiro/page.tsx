import MainLayout from "@/components/layout/main-layout";
import { getFinancialStats } from "@/app/actions";
import { DollarSignIcon, CheckCircleIcon, ClockIcon, ActivityIcon } from "lucide-react";
import FinanceChart from "./finance-chart";

export default async function FinancePage() {
  const today = new Date();
  const stats = await getFinancialStats(today.getFullYear(), today.getMonth());

  return (
    <MainLayout>
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard Financeiro</h1>
            <p className="text-zinc-500 mt-2">Resumo de desempenho para este mês.</p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-100 shadow-sm">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500">
                  Total Recebido
                </h3>
                <DollarSignIcon className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-emerald-400">R$ {stats.totalReceived.toFixed(2)}</div>
            </div>
            
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-100 shadow-sm">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500">
                  Total Pendente
                </h3>
                <ClockIcon className="h-4 w-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-amber-400">R$ {stats.totalPending.toFixed(2)}</div>
            </div>
            
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-100 shadow-sm">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500">
                  Qtd. Sessões
                </h3>
                <ActivityIcon className="h-4 w-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-bold">{stats.totalSessions}</div>
            </div>
            
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-100 shadow-sm">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500">
                  Pagas
                </h3>
                <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-emerald-400">{stats.paidSessions}</div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-100 shadow-sm">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500">
                  Não Pagas
                </h3>
                <ClockIcon className="h-4 w-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-amber-400">{stats.unpaidSessions}</div>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
             <div className="col-span-4 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-100 shadow-sm p-6">
                <h3 className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 mb-4">Evolução de Pagamentos</h3>
                <div className="pl-2">
                  <FinanceChart sessions={stats.sessions} />
                </div>
             </div>
             
             <div className="col-span-3 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-100 shadow-sm p-6">
                <h3 className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 mb-4">Últimas Sessões Pendentes</h3>
                <div className="space-y-4">
                  {stats.sessions
                    .filter(s => !s.paid && s.status !== 'cancelled')
                    .sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
                    .slice(0, 5)
                    .map(session => (
                      <div key={session.id} className="flex items-center justify-between border-b border-zinc-800 pb-3 last:border-0 last:pb-0">
                        <div>
                          <p className="text-sm font-medium leading-none text-white">{session.clientName}</p>
                          <p className="text-[11px] text-zinc-500 mt-1">{new Date(session.startDate).toLocaleDateString()}</p>
                        </div>
                        <div className="font-medium text-amber-400">R$ {session.value.toFixed(2)}</div>
                      </div>
                  ))}
                  {stats.sessions.filter(s => !s.paid && s.status !== 'cancelled').length === 0 && (
                    <p className="text-sm text-zinc-500 text-center py-4">Nenhuma sessão pendente.</p>
                  )}
                </div>
             </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
