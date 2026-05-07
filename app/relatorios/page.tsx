import MainLayout from "@/components/layout/main-layout";
import { getFinancialStats } from "@/app/actions";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ month?: string; year?: string }>;
}

export default async function ReportsPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const today = new Date();
  
  const selectedMonth = searchParams.month ? parseInt(searchParams.month) : today.getMonth();
  const selectedYear = searchParams.year ? parseInt(searchParams.year) : today.getFullYear();

  const stats = await getFinancialStats(selectedYear, selectedMonth);

  const months = [
    { value: 0, label: "Janeiro" },
    { value: 1, label: "Fevereiro" },
    { value: 2, label: "Março" },
    { value: 3, label: "Abril" },
    { value: 4, label: "Maio" },
    { value: 5, label: "Junho" },
    { value: 6, label: "Julho" },
    { value: 7, label: "Agosto" },
    { value: 8, label: "Setembro" },
    { value: 9, label: "Outubro" },
    { value: 10, label: "Novembro" },
    { value: 11, label: "Dezembro" },
  ];

  return (
    <MainLayout>
      <div className="flex-1 flex flex-col h-full bg-zinc-950 font-sans text-zinc-100 p-8 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto space-y-8 w-full">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Relatório Mensal</h1>
              <p className="text-zinc-500 mt-2">Visão detalhada de todas as sessões e faturamento.</p>
            </div>
            
            <div className="flex items-center gap-3">
               <div className="bg-zinc-900 border border-zinc-800 rounded-lg flex overflow-hidden">
                 {months.map(m => (
                   <Link key={m.value} href={`/relatorios?month=${m.value}&year=${selectedYear}`} className={`px-3 py-1.5 text-xs font-medium transition-colors ${selectedMonth === m.value ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'}`}>
                     {m.label.substring(0,3)}
                   </Link>
                 ))}
               </div>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-3">
             <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                <h3 className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 mb-2">Faturado no Mês</h3>
                <div className="text-2xl font-bold text-white">R$ {stats.totalBilled.toFixed(2)}</div>
             </div>
             <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                <h3 className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 mb-2">Recebido</h3>
                <div className="text-2xl font-bold text-emerald-400">R$ {stats.totalReceived.toFixed(2)}</div>
             </div>
             <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                <h3 className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 mb-2">Pendente</h3>
                <div className="text-2xl font-bold text-amber-400">R$ {stats.totalPending.toFixed(2)}</div>
             </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
             <h3 className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 mb-4">Relatório Detalhado</h3>
             <div className="rounded-md border border-zinc-800 overflow-hidden">
               <table className="w-full text-sm text-left">
                 <thead className="bg-zinc-950 text-zinc-400 text-xs uppercase">
                   <tr>
                     <th className="px-4 py-3 font-semibold">Data</th>
                     <th className="px-4 py-3 font-semibold">Cliente</th>
                     <th className="px-4 py-3 font-semibold">Procedimento</th>
                     <th className="px-4 py-3 font-semibold">Status</th>
                     <th className="px-4 py-3 font-semibold text-right">Valor</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-zinc-800">
                   {stats.sessions.sort((a,b)=>new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).map(session => (
                     <tr key={session.id} className="hover:bg-zinc-800/50 transition-colors">
                       <td className="px-4 py-3">{new Date(session.startDate).toLocaleDateString()}</td>
                       <td className="px-4 py-3 font-medium text-white">{session.clientName}</td>
                       <td className="px-4 py-3 text-zinc-400">{session.procedure}</td>
                       <td className="px-4 py-3">
                         {session.status === 'cancelled' ? (
                           <span className="bg-rose-500/10 text-rose-400 px-2.5 py-0.5 rounded-full text-xs font-semibold">Cancelado</span>
                         ) : session.paid ? (
                           <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full text-xs font-semibold">Pago</span>
                         ) : (
                           <span className="bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded-full text-xs font-semibold">Pendente</span>
                         )}
                       </td>
                       <td className="px-4 py-3 text-right font-medium">R$ {session.value.toFixed(2)}</td>
                     </tr>
                   ))}
                   {stats.sessions.length === 0 && (
                     <tr>
                       <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">Nenhuma sessão encontrada para este período.</td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
          </div>
          
        </div>
      </div>
    </MainLayout>
  );
}
