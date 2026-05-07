'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { createSession, updateSession } from '@/app/actions';

export default function SessionModal({ 
  isOpen, 
  onClose, 
  initialDate, 
  initialStartTime,
  initialEndTime,
  existingSession 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  initialDate?: Date;
  initialStartTime?: string;
  initialEndTime?: string;
  existingSession?: any;
}) {
  const [formData, setFormData] = useState({
    clientName: existingSession?.clientName || '',
    procedure: existingSession?.procedure || '',
    value: existingSession?.value?.toString() || '',
    date: existingSession?.startDate ? new Date(existingSession.startDate).toISOString().split('T')[0] : (initialDate ? initialDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
    startTime: existingSession?.startDate ? new Date(existingSession.startDate).toTimeString().substring(0,5) : (initialStartTime || '09:00'),
    endTime: existingSession?.endDate ? new Date(existingSession.endDate).toTimeString().substring(0,5) : (initialEndTime || '10:00'),
    paid: existingSession?.paid || false,
    status: existingSession?.status || 'scheduled',
    notes: existingSession?.notes || '',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const startDate = new Date(`${formData.date}T${formData.startTime}:00`);
      const endDate = new Date(`${formData.date}T${formData.endTime}:00`);

      const sessionData = {
        clientName: formData.clientName,
        procedure: formData.procedure,
        value: parseFloat(formData.value) || 0,
        paid: formData.paid,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: formData.status,
        notes: formData.notes,
      };

      if (existingSession?.id) {
        await updateSession(existingSession.id, sessionData);
        toast.success("Sessão atualizada com sucesso!");
      } else {
        await createSession(sessionData);
        toast.success("Sessão agendada com sucesso!");
      }
      onClose();
    } catch (err: any) {
      toast.error("Erro ao salvar sessão: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[400px] bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 p-6 flex flex-col">
        <div className="flex justify-between items-start mb-6">
           <h3 className="text-lg font-semibold">{existingSession ? 'Editar Sessão' : 'Nova Sessão'}</h3>
           <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto">
           <div>
             <label className="text-[10px] text-zinc-500 uppercase font-bold">Cliente</label>
             <input required value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="Nome do cliente" />
           </div>

           <div>
             <label className="text-[10px] text-zinc-500 uppercase font-bold">Procedimento / Tipo</label>
             <input required value={formData.procedure} onChange={e => setFormData({...formData, procedure: e.target.value})} type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="Ex: Psicoterapia, Nutrição" />
           </div>

           <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="text-[10px] text-zinc-500 uppercase font-bold">Data</label>
               <input required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} type="date" className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm mt-1 text-white [color-scheme:dark]" />
             </div>
             <div>
               <label className="text-[10px] text-zinc-500 uppercase font-bold">Valor (R$)</label>
               <input required value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} type="number" step="0.01" className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm mt-1" placeholder="150.00" />
             </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="text-[10px] text-zinc-500 uppercase font-bold">Início</label>
               <input required value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} type="time" className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm mt-1 text-white [color-scheme:dark]" />
             </div>
             <div>
               <label className="text-[10px] text-zinc-500 uppercase font-bold">Fim</label>
               <input required value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} type="time" className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm mt-1 text-white [color-scheme:dark]" />
             </div>
           </div>
           
           <div>
             <label className="text-[10px] text-zinc-500 uppercase font-bold">Status</label>
             <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm mt-1 text-white">
               <option value="scheduled">Agendado (Pendente)</option>
               <option value="completed">Concluída</option>
               <option value="cancelled">Cancelada</option>
             </select>
           </div>
           
           <div>
             <label className="text-[10px] text-zinc-500 uppercase font-bold">Observações</label>
             <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm mt-1 text-white h-20 resize-none"></textarea>
           </div>

           <div className="flex items-center gap-2 pt-2">
             <input type="checkbox" id="pago" checked={formData.paid} onChange={e => setFormData({...formData, paid: e.target.checked})} className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 accent-indigo-500" />
             <label htmlFor="pago" className="text-sm text-zinc-300 cursor-pointer">Marcar como pago</label>
           </div>
           
           <div className="pt-4 flex gap-3">
             <button type="button" onClick={onClose} className="w-1/3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded font-medium text-sm transition-colors">Cancelar</button>
             <button disabled={loading} type="submit" className="w-2/3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded font-medium text-sm transition-colors">
                {loading ? 'Salvando...' : 'Salvar Sessão'}
             </button>
           </div>
        </form>
      </div>
    </div>
  );
}
