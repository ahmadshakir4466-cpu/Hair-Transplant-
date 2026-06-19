import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Appointment } from '../../types';
import { format } from 'date-fns';
import { Filter, Calendar, Search, MapPin, Phone, Mail, FileText, Download, Trash2, Printer, FileDown } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, service:services(name)')
        .order('appointment_date', { ascending: false })
        .order('start_time', { ascending: true });

      if (error) throw error;
      if (data) setAppointments(data);
    } catch (err: any) {
      toast.error('Failed to load appointments.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const sendEmailNotification = async (to: string, subject: string, html: string) => {
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to, subject, html }),
      });
    } catch (e) {
      console.warn('Failed to send email:', e);
    }
  };

  const updateStatus = async (appointment: Appointment, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointment.id);

      if (error) throw error;
      toast.success(`Appointment marked as ${newStatus}`);
      
      // Send email notification based on status
      if (newStatus === 'confirmed') {
         const html = `<h2>Appointment Confirmed!</h2><p>Hello ${appointment.full_name},</p><p>Your appointment on <strong>${format(new Date(appointment.appointment_date), 'MMMM do, yyyy')}</strong> at <strong>${appointment.start_time.substring(0,5)}</strong> for ${appointment.service?.name || 'our service'} has been confirmed.</p><p>We look forward to seeing you!</p>`;
         await sendEmailNotification(appointment.email, 'Appointment Confirmed', html);
      } else if (newStatus === 'cancelled') {
         const html = `<h2>Appointment Cancelled</h2><p>Hello ${appointment.full_name},</p><p>Your appointment on <strong>${format(new Date(appointment.appointment_date), 'MMMM do, yyyy')}</strong> at <strong>${appointment.start_time.substring(0,5)}</strong> has been cancelled.</p><p>Please contact us if you need to reschedule.</p>`;
         await sendEmailNotification(appointment.email, 'Appointment Cancelled', html);
      }
      
      fetchAppointments();
    } catch (err: any) {
      console.error('Status update error:', err);
      toast.error(err.message || 'Failed to update status.');
    }
  };

  const confirmDelete = async () => {
    if (!appointmentToDelete) return;
    const appointment = appointmentToDelete;
    setAppointmentToDelete(null);
    try {
      // First try to add a notification for the patient (if table exists)
      try {
        await supabase.from('notifications').insert({
          email: appointment.email,
          message: `Your appointment on ${appointment.appointment_date} has been cancelled and removed by the administrator.`,
          created_at: new Date().toISOString()
        });
      } catch (e) {
        // Ignore if notifications table doesn't exist
      }
      
      // Attempt to send email
      const html = `<h2>Appointment Cancelled</h2><p>Hello ${appointment.full_name},</p><p>Your appointment on <strong>${format(new Date(appointment.appointment_date), 'MMMM do, yyyy')}</strong> at <strong>${appointment.start_time.substring(0,5)}</strong> has been cancelled and removed.</p><p>Please contact us for more details.</p>`;
      await sendEmailNotification(appointment.email, 'Appointment Cancelled', html);

      const { data, error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointment.id)
        .select();

      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error('Database refused deletion. Please enable DELETE permissions (RLS) for appointments table in Supabase.');
      }
      
      toast.success('Appointment deleted successfully');
      fetchAppointments();
    } catch (err: any) {
      console.error('Delete error:', err);
      toast.error(err.message || 'Failed to delete appointment.');
    }
  };

  const exportCSV = () => {
    if (filteredAppointments.length === 0) {
      toast.error('No appointments to export.');
      return;
    }
    
    const headers = ['Patient Name', 'Email', 'Phone', 'Service', 'Date', 'Time', 'Status', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...filteredAppointments.map(a => 
        `"${a.full_name}","${a.email}","${a.phone}","${a.service?.name}","${a.appointment_date}","${a.start_time}","${a.status}","${(a.notes || '').replace(/"/g, '""')}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `appointments_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    if (filteredAppointments.length === 0) {
      toast.error('No appointments to export.');
      return;
    }
    
    const doc = new jsPDF();
    doc.text('Appointments Summary', 14, 15);
    
    autoTable(doc, {
      head: [['Patient Name', 'Phone', 'Service', 'Date & Time', 'Status']],
      body: filteredAppointments.map(a => [
        a.full_name,
        a.phone,
        a.service?.name || '-',
        `${format(new Date(a.appointment_date), 'MMM d, yyyy')} ${a.start_time.substring(0,5)}`,
        a.status
      ]),
      startY: 20,
      styles: { fontSize: 9 }
    });
    
    doc.save(`Appointments_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const downloadSlipPDF = (appt: Appointment) => {
    const doc = new jsPDF();
    doc.setFillColor(13, 148, 136);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('Appointment Confirmation', 105, 25, { align: 'center' });
    
    doc.setTextColor(51, 51, 51);
    doc.setFontSize(12);
    
    let y = 60;
    doc.text(`Patient Name: ${appt.full_name}`, 20, y); y += 10;
    doc.text(`Email: ${appt.email}`, 20, y); y += 10;
    doc.text(`Phone: ${appt.phone}`, 20, y); y += 10;
    doc.text(`Service: ${appt.service?.name || 'Consultation'}`, 20, y); y += 10;
    doc.text(`Date: ${format(new Date(appt.appointment_date), 'MMMM do, yyyy')}`, 20, y); y += 10;
    doc.text(`Time: ${appt.start_time.substring(0,5)}`, 20, y); y += 10;
    doc.text(`Status: Confirmed`, 20, y);
    
    doc.setFontSize(10);
    doc.setTextColor(102, 102, 102);
    doc.text('Please arrive 10 minutes prior to your appointment time.', 105, 280, { align: 'center' });
    
    doc.save(`Appointment_${appt.full_name.replace(/\s+/g, '_')}_${format(new Date(appt.appointment_date), 'yyyy-MM-dd')}.pdf`);
  };

  const filteredAppointments = appointments.filter(appt => {
    const matchesFilter = filter === 'all' || appt.status === filter;
    const matchesSearch = appt.full_name.toLowerCase().includes(search.toLowerCase()) || 
                          appt.email.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'confirmed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Appointments</h1>
          <p className="text-slate-500">Manage all patient appointment requests.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
           <button 
             onClick={exportPDF}
             className="hidden sm:flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
             title="Download PDF Summary"
           >
             <FileDown size={16} />
             Export PDF
           </button>
           <button 
             onClick={exportCSV}
             className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
           >
             <Download size={16} />
             Export CSV
           </button>
           <div className="relative">
             <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input 
               type="text" 
               placeholder="Search patient..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-full sm:w-64"
             />
           </div>
           
           <div className="flex bg-white border border-slate-200 rounded-lg p-1">
             {['all', 'pending', 'confirmed', 'completed'].map(f => (
               <button
                 key={f}
                 onClick={() => setFilter(f)}
                 className={`px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${
                   filter === f ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'
                 }`}
               >
                 {f}
               </button>
             ))}
           </div>
        </div>
      </div>

      {isLoading ? (
         <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
         </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto border-t border-slate-100">
             <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Patient</th>
                    <th className="px-6 py-4">Service & Date</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAppointments.length > 0 ? (
                    filteredAppointments.map(appt => (
                       <tr key={appt.id} className="hover:bg-slate-50 transition-colors">
                         <td className="px-6 py-4">
                           <div className="font-semibold text-slate-900">{appt.full_name}</div>
                           {appt.notes && (
                             <div className="text-xs text-slate-500 mt-1 flex items-center gap-1 max-w-[150px] truncate" title={appt.notes}>
                               <FileText size={12} /> Notes provided
                             </div>
                           )}
                         </td>
                         <td className="px-6 py-4">
                           <div className="font-medium text-slate-900">{appt.service?.name}</div>
                           <div className="text-slate-500 text-xs mt-1">
                             {format(new Date(appt.appointment_date), 'MMM d, yyyy')} • {appt.start_time.substring(0,5)}
                           </div>
                         </td>
                         <td className="px-6 py-4">
                           <div className="flex flex-col gap-1 text-slate-600 text-xs">
                             <div className="flex items-center gap-1.5"><Phone size={14}/> {appt.phone}</div>
                             <div className="flex items-center gap-1.5"><Mail size={14}/> {appt.email}</div>
                           </div>
                         </td>
                         <td className="px-6 py-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold border ${getStatusColor(appt.status)}`}>
                               {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {appt.status === 'confirmed' && (
                                <button 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    downloadSlipPDF(appt);
                                  }}
                                  title="Download Confirmed Slip PDF"
                                  className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors"
                                >
                                  <FileDown size={16} />
                                </button>
                              )}
                              <select 
                                value={appt.status}
                                onChange={(e) => updateStatus(appt, e.target.value)}
                                className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                              >
                                <option value="pending">Mark Pending</option>
                                <option value="confirmed">Mark Confirmed</option>
                                <option value="completed">Mark Completed</option>
                                <option value="cancelled">Cancel Appt</option>
                              </select>
                              <button 
                                onClick={() => setAppointmentToDelete(appt)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Delete Appointment"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                         </td>
                       </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        No appointments found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
             </table>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {appointmentToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Appointment</h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete the appointment for <strong>{appointmentToDelete.full_name}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setAppointmentToDelete(null)}
                className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Delete Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
