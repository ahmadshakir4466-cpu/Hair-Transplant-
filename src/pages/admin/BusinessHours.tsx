import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { BusinessHours as BusinessHoursType } from '../../types';
import toast from 'react-hot-toast';

const WEEKDAYS = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export default function BusinessHours() {
  const [hours, setHours] = useState<BusinessHoursType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchHours();
  }, []);

  const fetchHours = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('business_hours')
        .select('*')
        .order('weekday', { ascending: true });

      if (error) throw error;
      if (data) setHours(data);
    } catch (err: any) {
      toast.error('Failed to load business hours.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (index: number, field: keyof BusinessHoursType, value: any) => {
    const updated = [...hours];
    updated[index] = { ...updated[index], [field]: value };
    setHours(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('business_hours')
        .upsert(hours);

      if (error) throw error;
      toast.success('Business hours successfully updated.');
    } catch (err) {
      toast.error('Failed to update business hours.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
       <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
       </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Business Hours</h1>
          <p className="text-slate-500">Define the clinic's operating schedule.</p>
        </div>
        <button
           onClick={handleSave}
           disabled={isSaving}
           className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors shadow-sm disabled:opacity-70"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
         <div className="divide-y divide-slate-100">
           {hours.map((hourSet, index) => (
             <div key={hourSet.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
               <div className="flex items-center gap-4 w-48">
                 <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={hourSet.is_open}
                      onChange={(e) => handleChange(index, 'is_open', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                  </label>
                  <span className="font-semibold text-slate-900">{WEEKDAYS[hourSet.weekday]}</span>
               </div>
               
               <div className="flex items-center gap-4 flex-1">
                 {hourSet.is_open ? (
                   <>
                    <div className="flex flex-col flex-1 max-w-[200px]">
                      <label className="text-xs text-slate-500 font-medium mb-1">Open time</label>
                      <input 
                        type="time" 
                        value={hourSet.start_time.substring(0, 5)}
                        onChange={(e) => handleChange(index, 'start_time', `${e.target.value}:00`)}
                        className="px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm font-medium"
                      />
                    </div>
                    <span className="text-slate-400 font-medium">to</span>
                    <div className="flex flex-col flex-1 max-w-[200px]">
                      <label className="text-xs text-slate-500 font-medium mb-1">Close time</label>
                      <input 
                        type="time" 
                        value={hourSet.end_time.substring(0, 5)}
                        onChange={(e) => handleChange(index, 'end_time', `${e.target.value}:00`)}
                         className="px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm font-medium"
                      />
                    </div>
                   </>
                 ) : (
                   <div className="flex-1 px-4 py-3 bg-slate-100 rounded-xl border border-slate-200 border-dashed text-slate-500 text-sm font-medium text-center">
                     Closed
                   </div>
                 )}
               </div>
             </div>
           ))}
         </div>
      </div>
    </div>
  );
}
