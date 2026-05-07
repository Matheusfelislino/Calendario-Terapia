'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export type SessionInput = {
  clientName: string;
  procedure: string;
  value: number;
  paid: boolean;
  startDate: string;
  endDate: string;
  notes?: string;
  status: string;
};

export async function getSessions(start: Date, end: Date) {
  const sessions = await prisma.session.findMany({
    where: {
      startDate: {
        gte: start,
      },
      endDate: {
        lte: end,
      },
      status: {
        not: 'deleted',
      }
    },
  });
  return sessions;
}

export async function createSession(data: SessionInput) {
  const session = await prisma.session.create({
    data: {
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    },
  });
  revalidatePath('/');
  revalidatePath('/financeiro');
  revalidatePath('/relatorios');
  return session;
}

export async function updateSession(id: string, data: Partial<SessionInput>) {
  const updateData: any = { ...data };
  if (data.startDate) updateData.startDate = new Date(data.startDate);
  if (data.endDate) updateData.endDate = new Date(data.endDate);

  const session = await prisma.session.update({
    where: { id },
    data: updateData,
  });
  revalidatePath('/');
  revalidatePath('/financeiro');
  revalidatePath('/relatorios');
  return session;
}

export async function deleteSession(id: string) {
  await prisma.session.delete({ where: { id } });
  revalidatePath('/');
  revalidatePath('/financeiro');
  revalidatePath('/relatorios');
}

export async function getFinancialStats(year: number, month: number) {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

  const sessions = await prisma.session.findMany({
    where: {
      startDate: { gte: startDate, lte: endDate },
      status: { not: 'deleted' }
    },
  });

  const totalBilled = sessions.filter(s => s.status !== 'cancelled').reduce((acc, s) => acc + s.value, 0);
  const totalReceived = sessions.filter(s => s.paid && s.status !== 'cancelled').reduce((acc, s) => acc + s.value, 0);
  const totalPending = sessions.filter(s => !s.paid && s.status !== 'cancelled').reduce((acc, s) => acc + s.value, 0);
  
  return {
    totalBilled,
    totalReceived,
    totalPending,
    totalSessions: sessions.filter(s=>s.status!=='cancelled').length,
    paidSessions: sessions.filter(s => s.paid && s.status!=='cancelled').length,
    unpaidSessions: sessions.filter(s => !s.paid && s.status !== 'cancelled').length,
    cancelledSessions: sessions.filter(s => s.status === 'cancelled').length,
    sessions,
  };
}
