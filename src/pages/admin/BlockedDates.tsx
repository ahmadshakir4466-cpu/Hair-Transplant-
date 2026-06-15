import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { BlockedDate } from '../../types';
import { format } from 'date-fns';
import { Plus, Trash2, CalendarOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BlockedDates() {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [newDate, setNewDate] = useState('');
  const [reason, setReason] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchBlockedDates();
  }, []);

  const fetchBlockedDates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('blocked_dates')
        .select('*')
        .order('blocked_date', { ascending: true })
        .gte('blocked_date', format(new Date(), 'yyyy-MM-dd'));

      if (error) throw error;
      if (data) setBlockedDates(data);
    } catch (err: any) {
      toast.error('Failed to load blocked dates.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) return;
    setIsAdding(true);
    
    try {
      const { error } = await supabase
        .from('blocked_dates')
        .insert({ blocked_date: newDate, reason: reason || null });

      if (error) throw error;
      
      toast.success('Date blocked successfully.');
      setNewDate('');
      setReason('');
      fetchBlockedDates();
    } catch (err) {
      toast.error('Failed to block date.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blocked_dates')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      toast.success('Blocked date removed. Slot is open again.');
      fetchBlockedDates();
    } catch (err) {
      toast.error('Failed to remove date.');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
       <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Blocked Dates</h1>
          <p className="text-slate-500">Prevent patients from booking appointments on specific dates.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
             <div className="flex items-center gap-3 mb-6">
               <div className="bg-rose-50 text-rose-600 p-2 rounded-xl">
                 <CalendarOff size={20} />
               </div>
               <h2 className="text-lg font-bold text-slate-900">Block a Date</h2>
             </div>
             
             <form onSubmit={handleAddDate} className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Select Date</label>
                  <input 
                    required
                    type="date"
                    min={format(new Date(), 'yyyy-MM-dd')}
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Reason (Optional)</label>
                  <input 
                    type="text"
                    placeholder="e.g. Public Holiday, Renovation"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none"
                  />
               </div>
               <button
                  type="submit"
                  disabled={isAdding}
                  className="w-full bg-slate-900 text-white hover:bg-slate-800 transition-colors py-3 rounded-xl font-medium mt-2 flex items-center justify-center gap-2"
               >
                 <Plus size={18} /> {isAdding ? 'Adding...' : 'Block Date'}
               </button>
             </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
           <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
             <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">Upcoming Blocked Dates</h3>
             </div>
             {isLoading ? (
               <div className="flex justify-center p-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
               </div>
             ) : blockedDates.length > 0 ? (
               <div className="divide-y divide-slate-100">
                 {blockedDates.map(date => (
                   <div key={date.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                     <div>
                       <p className="font-bold text-slate-900">{format(new Date(date.blocked_date), 'EEEE, MMMM do, yyyy')}</p>
                       {date.reason && <p className="text-sm text-slate-500 mt-1">{date.reason}</p>}
                     </div>
                     <button
                       onClick={() => handleRemove(date.id)}
                       className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                     >
                       <Trash2 size={18} />
                     </button>
                   </div>
                 ))}
               </div>
             ) : (
                <div className="p-12 text-center text-slate-500">
                  No upcoming dates are blocked.
                </div>
             )}
           </div>
        </div>

      </div>
    </div>
  );
}
