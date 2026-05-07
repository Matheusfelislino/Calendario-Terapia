'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";

export default function FinanceChart({ sessions }: { sessions: any[] }) {
  const dataMap: Record<string, { name: string, Recebido: number, Pendente: number }> = {};
  
  sessions.forEach(session => {
    if(session.status === 'cancelled') return;
    
    const dateStr = new Date(session.startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    if (!dataMap[dateStr]) {
      dataMap[dateStr] = { name: dateStr, Recebido: 0, Pendente: 0 };
    }
    
    if (session.paid) {
      dataMap[dateStr].Recebido += session.value;
    } else {
      dataMap[dateStr].Pendente += session.value;
    }
  });

  const data = Object.values(dataMap).sort((a, b) => {
     return a.name.localeCompare(b.name);
  });

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#52525b"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#52525b"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `R$ ${value}`}
        />
        <Tooltip 
          cursor={{fill: '#27272a'}}
          contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
          itemStyle={{ color: '#e4e4e7' }}
        />
        <Legend />
        <Bar dataKey="Recebido" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Pendente" fill="#f59e0b" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
