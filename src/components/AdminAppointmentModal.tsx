import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Appointment, Service } from '../types';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

interface AdminAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  appointment?: Appointment;
}

export default function AdminAppointmentModal({ isOpen, onClose, onSuccess, appointment }: AdminAppointmentModalProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    notes: '',
    service_id: '',
    appointment_date: '',
    start_time: '',
    status: 'pending'
  });

  useEffect(() => {
    if (isOpen) {
      fetchServices();
      if (appointment) {
        setFormData({
          full_name: appointment.full_name,
          email: appointment.email,
          phone: appointment.phone,
          notes: appointment.notes || '',
          service_id: appointment.service_id,
          appointment_date: appointment.appointment_date,
          start_time: appointment.start_time.substring(0,5),
          status: appointment.status
        });
      } else {
        setFormData({
          full_name: '',
          email: '',
          phone: '',
          notes: '',
          service_id: '',
          appointment_date: '',
          start_time: '',
          status: 'confirmed'
        });
      }
    }
  }, [isOpen, appointment]);

  const fetchServices = async () => {
    try {
      const { data } = await supabase.from('services').select('*').eq('is_active', true);
      if (data) {
        setServices(data);
        if (!appointment && data.length > 0 && !formData.service_id) {
          setFormData(prev => ({ ...prev, service_id: data[0].id }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const calculateEndTime = (startTime: string, serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    const duration = service ? service.duration_minutes : 30;
    
    if (!startTime) return '00:00:00';
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const date = new Date(2000, 0, 1, hours, minutes);
    date.setMinutes(date.getMinutes() + duration);
    
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:00`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.service_id || !formData.appointment_date || !formData.start_time) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const end_time = calculateEndTime(formData.start_time, formData.service_id);
      
      const payload = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        notes: formData.notes,
        service_id: formData.service_id,
        appointment_date: formData.appointment_date,
        start_time: formData.start_time.length === 5 ? `${formData.start_time}:00` : formData.start_time,
        end_time,
        status: formData.status
      };

      if (appointment) {
        const { error } = await supabase
          .from('appointments')
          .update(payload)
          .eq('id', appointment.id);
        if (error) throw error;
        toast.success('Appointment & Profile updated successfully');
      } else {
        const { error } = await supabase
          .from('appointments')
          .insert(payload);
        if (error) throw error;
        toast.success('Appointment booked successfully');
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Error saving appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">
            {appointment ? 'Edit Profile & Appointment' : 'Book New Appointment'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Patient Full Name</label>
              <input 
                type="text" 
                required 
                value={formData.full_name}
                onChange={e => setFormData({...formData, full_name: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
               <input 
                 type="email" 
                 required 
                 value={formData.email}
                 onChange={e => setFormData({...formData, email: e.target.value})}
                 className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
               />
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
               <input 
                 type="tel" 
                 required 
                 value={formData.phone}
                 onChange={e => setFormData({...formData, phone: e.target.value})}
                 className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
               />
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
               <select 
                 value={formData.status}
                 onChange={e => setFormData({...formData, status: e.target.value})}
                 className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
               >
                 <option value="pending">Pending</option>
                 <option value="confirmed">Confirmed</option>
                 <option value="completed">Completed</option>
                 <option value="cancelled">Cancelled</option>
               </select>
            </div>
            <div className="md:col-span-2">
               <label className="block text-sm font-medium text-slate-700 mb-1">Service</label>
               <select 
                 required
                 value={formData.service_id}
                 onChange={e => setFormData({...formData, service_id: e.target.value})}
                 className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
               >
                 <option value="" disabled>Select a service</option>
                 {services.map(s => (
                   <option key={s.id} value={s.id}>{s.name} ({s.duration_minutes} min)</option>
                 ))}
               </select>
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
               <input 
                 type="date" 
                 required 
                 value={formData.appointment_date}
                 onChange={e => setFormData({...formData, appointment_date: e.target.value})}
                 className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
               />
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
               <input 
                 type="time" 
                 required 
                 value={formData.start_time}
                 onChange={e => setFormData({...formData, start_time: e.target.value})}
                 className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
               />
            </div>
            <div className="md:col-span-2">
               <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
               <textarea 
                 rows={3}
                 value={formData.notes || ''}
                 onChange={e => setFormData({...formData, notes: e.target.value})}
                 className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
               />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
             <button
               type="button"
               onClick={onClose}
               className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
             >
               Cancel
             </button>
             <button
               type="submit"
               disabled={isSubmitting}
               className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
             >
               {isSubmitting ? 'Saving...' : 'Save Appointment'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}
