'use client';

import React, { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import SessionModal from './session-modal';
import { getSessions, updateSession, deleteSession } from '@/app/actions';
import { toast } from 'sonner';

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 8:00 to 18:00

export default function WeekCalendar({ initialDate, initialSessions }: { initialDate: Date, initialSessions: any[] }) {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [sessions, setSessions] = useState(initialSessions);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [slotDate, setSlotDate] = useState<Date | undefined>(undefined);
  const [slotStart, setSlotStart] = useState<string | undefined>(undefined);
  const [slotEnd, setSlotEnd] = useState<string | undefined>(undefined);

  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i));

  useEffect(() => {
    const fetchSessions = async () => {
      const start = weekDays[0];
      const end = new Date(weekDays[6]);
      end.setHours(23, 59, 59, 999);
      const data = await getSessions(start, end);
      setSessions(data);
    };
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  const handleDragStart = (e: React.DragEvent, session: any) => {
    e.dataTransfer.setData('sessionId', session.id);
  };

  const handleDrop = async (e: React.DragEvent, date: Date, hour: number) => {
    e.preventDefault();
    const sessionId = e.dataTransfer.getData('sessionId');
    if (!sessionId) return;

    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    const sessionStartDate = new Date(session.startDate);
    const sessionEndDate = new Date(session.endDate);
    
    const duration = sessionEndDate.getTime() - sessionStartDate.getTime();
    
    const newStartDate = new Date(date);
    newStartDate.setHours(hour, sessionStartDate.getMinutes(), 0, 0);
    const newEndDate = new Date(newStartDate.getTime() + duration);

    try {
       setSessions(prev => prev.map(s => s.id === sessionId ? {...s, startDate: newStartDate, endDate: newEndDate} : s));
       await updateSession(sessionId, { 
         startDate: newStartDate.toISOString(), 
         endDate: newEndDate.toISOString() 
       });
       toast.success("Horário atualizado");
    } catch (err: any) {
       toast.error("Erro ao mover: " + err.message);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const openNewSession = (date: Date, hour: number) => {
    setSlotDate(date);
    setSlotStart(`${hour.toString().padStart(2, '0')}:00`);
    setSlotEnd(`${(hour + 1).toString().padStart(2, '0')}:00`);
    setSelectedSession(null);
    setModalOpen(true);
  };

  const openEditSession = (session: any) => {
    setSelectedSession(session);
    setSlotDate(undefined);
    setSlotStart(undefined);
    setSlotEnd(undefined);
    setModalOpen(true);
  };

  const getEventStyle = (session: any) => {
    const start = new Date(session.startDate);
    const end = new Date(session.endDate);
    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;
    
    const top = (startHour - 8) * 64;
    const height = (endHour - startHour) * 64;
    
    return { top: `${top}px`, height: `${height}px` };
  };

  const getEventColors = (session: any) => {
    if (session.status === 'cancelled') return 'bg-rose-500/10 border-rose-500 text-rose-400 opacity-60';
    if (session.paid) return 'bg-emerald-500/10 border-emerald-500 text-emerald-400';
    return 'bg-amber-500/10 border-amber-500 text-amber-400';
  };

  const getTextColor = (session: any) => {
    if (session.status === 'cancelled') return 'text-rose-500/80';
    if (session.paid) return 'text-emerald-500/80';
    return 'text-amber-500/80';
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(!confirm("Deseja realmente excluir esta sessão?")) return;
    try {
      await deleteSession(id);
      setSessions(prev => prev.filter(s => s.id !== id));
      toast.success("Sessão excluída");
    } catch(err:any) {
      toast.error(err.message);
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 font-sans text-zinc-100">
      {/* Header */}
      <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-zinc-950/80 backdrop-blur-sm z-10 shrink-0">
        <div className="flex items-center gap-6">
          <h2 className="text-lg font-semibold capitalize">{format(currentDate, "MMMM yyyy", { locale: ptBR })}</h2>
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-1">
            <button className="px-4 py-1 text-xs rounded-md bg-zinc-800 text-white font-medium">Semana</button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentDate(subWeeks(currentDate, 1))} className="p-2 text-zinc-400 hover:text-zinc-100 transition-colors">
            &larr;
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="text-xs font-medium text-zinc-400 hover:text-white">Hoje</button>
          <button onClick={() => setCurrentDate(addWeeks(currentDate, 1))} className="p-2 text-zinc-400 hover:text-zinc-100 transition-colors">
            &rarr;
          </button>
        </div>
      </header>

      {/* Calendar Grid */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Week Days Header */}
        <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-zinc-800 bg-zinc-900/50 shrink-0">
          <div className="h-10 border-r border-zinc-800"></div>
          {weekDays.map((day, i) => {
            const isToday = isSameDay(day, new Date());
            return (
              <div key={i} className={`h-10 flex items-center justify-center text-[11px] font-medium uppercase tracking-widest ${i !== 6 ? 'border-r border-zinc-800' : ''} ${isToday ? 'bg-indigo-500/10 text-white' : 'text-zinc-500'}`}>
                {format(day, 'eee', { locale: ptBR }).substring(0,3)} 
                <span className={`ml-2 ${isToday ? 'text-indigo-400' : ''}`}>{format(day, 'dd')}</span>
              </div>
            );
          })}
        </div>

        {/* Scrolling Body Area */}
        <div className="flex-1 overflow-y-auto relative custom-scrollbar">
          <div className="grid grid-cols-[80px_repeat(7,1fr)] min-h-max isolate" style={{ height: `${HOURS.length * 64}px` }}>
            {/* Time Column */}
            <div className="border-r border-zinc-800 flex flex-col bg-zinc-950 z-20 sticky left-0">
              {HOURS.map(hour => (
                <div key={hour} className="h-16 border-b border-zinc-900 flex items-start justify-center pt-2 text-[10px] text-zinc-600">
                  {hour.toString().padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {/* Calendar Lanes */}
            {weekDays.map((day, dayIndex) => (
              <div key={dayIndex} className={`relative ${dayIndex !== 6 ? 'border-r border-zinc-900' : ''} ${isSameDay(day, new Date()) ? 'bg-indigo-500/5' : ''}`}>
                
                {/* Horizontal Grid Lines */}
                <div className="absolute inset-0 pointer-events-none flex flex-col">
                  {HOURS.map(hour => (
                    <div key={hour} className="h-16 border-b border-zinc-900/50 w-full"></div>
                  ))}
                </div>

                {/* Drop zones */}
                <div className="absolute inset-0 flex flex-col z-10">
                  {HOURS.map(hour => (
                    <div 
                      key={hour} 
                      className="h-16 w-full cursor-pointer hover:bg-white/5 transition-colors"
                      onClick={() => openNewSession(day, hour)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, day, hour)}
                    ></div>
                  ))}
                </div>

                {/* Events */}
                {sessions.filter(s => isSameDay(new Date(s.startDate), day)).map((session) => (
                  <div
                    key={session.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, session)}
                    onClick={() => openEditSession(session)}
                    className={`absolute left-1 right-1 border-l-4 p-2 rounded shadow-sm z-30 cursor-pointer transition-all hover:brightness-110 overflow-hidden group ${getEventColors(session)}`}
                    style={getEventStyle(session)}
                  >
                    <div className="flex justify-between items-start">
                      <p className="text-[11px] font-bold leading-tight">{session.clientName}</p>
                      <button onClick={(e) => handleDelete(session.id, e)} className="opacity-0 group-hover:opacity-100 text-current hover:text-white text-[10px]">✕</button>
                    </div>
                    <p className={`text-[10px] ${getTextColor(session)} truncate mt-0.5`}>{session.procedure}</p>
                    <p className="text-[10px] mt-1 font-semibold text-white/90">
                      R$ {session.value.toFixed(2)} • {session.status === 'cancelled' ? 'Cancelado' : session.paid ? 'Pago' : 'Pendente'}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats Footer */}
      <footer className="h-12 border-t border-zinc-800 flex items-center px-8 bg-zinc-900/30 gap-8 shrink-0">
         <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
           <span className="text-[11px] text-zinc-400">Pago / Concluído</span>
         </div>
         <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-amber-500"></div>
           <span className="text-[11px] text-zinc-400">Pendente</span>
         </div>
         <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-rose-500"></div>
           <span className="text-[11px] text-zinc-400">Cancelado</span>
         </div>
      </footer>

      {modalOpen && (
        <SessionModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            const refreshSessions = async () => {
              const start = weekDays[0];
              const end = new Date(weekDays[6]);
              end.setHours(23, 59, 59, 999);
              const data = await getSessions(start, end);
              setSessions(data);
            };
            refreshSessions();
          }}
          initialDate={slotDate}
          initialStartTime={slotStart}
          initialEndTime={slotEnd}
          existingSession={selectedSession}
        />
      )}
    </div>
  );
}
