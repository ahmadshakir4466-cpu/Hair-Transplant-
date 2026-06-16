import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Appointment } from '../../types';
import { Calendar, Clock, MapPin, X, Bell, Printer } from 'lucide-react';
import { format, isFuture, isToday } from 'date-fns';
import { useApp } from '../../contexts/AppContext';

export default function ClientDashboard() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { clinicSettings } = useApp();
  const navigate = useNavigate();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dismissedNotifs, setDismissedNotifs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isAuthLoading && !user) {
      navigate('/client-auth', { replace: true });
    }
  }, [user, isAuthLoading, navigate]);

  useEffect(() => {
    const saved = localStorage.getItem('dismissed_notifs');
    if (saved) {
      try {
        setDismissedNotifs(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (user?.email) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, service:services(name, duration_minutes)')
        .eq('email', user?.email)
        .order('appointment_date', { ascending: false })
        .order('start_time', { ascending: true });

      if (error) throw error;
      if (data) setAppointments(data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const dismissNotif = (id: string) => {
    const updated = { ...dismissedNotifs, [id]: true };
    setDismissedNotifs(updated);
    localStorage.setItem('dismissed_notifs', JSON.stringify(updated));
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'confirmed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  // Helper to safely format time
  const formatTime = (timeStr: string) => {
    try {
      const today = new Date();
      const [hours, minutes] = timeStr.split(':');
      today.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
      return format(today, 'h:mm a');
    } catch (e) {
      return timeStr;
    }
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const now = new Date();

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">My Appointments</h1>
          <p className="text-slate-500">Track and manage your upcoming visits.</p>
        </div>

        {/* Notifications for upcoming confirmed appointments */}
        <div className="space-y-4 mb-8">
          {appointments.map(appt => {
            if (appt.status !== 'confirmed') return null;
            if (dismissedNotifs[appt.id]) return null;

            const apptDateTime = new Date(`${appt.appointment_date}T${appt.start_time}`);
            const timeDiff = apptDateTime.getTime() - now.getTime();
            
            // If in the future
            if (timeDiff > 0) {
              const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
              const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
              
              let timeStr = '';
              if (days > 0) {
                timeStr = `${days} day${days > 1 ? 's' : ''} and ${hours} hour${hours > 1 ? 's' : ''}`;
              } else {
                timeStr = `${hours} hour${hours > 1 ? 's' : ''}`;
              }

              return (
                <div key={`notif-${appt.id}`} className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-teal-100 text-teal-700 p-2 rounded-xl shrink-0 mt-1 sm:mt-0">
                      <Bell size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-teal-900">Upcoming Appointment Reminder</h4>
                      <p className="text-teal-700 text-sm mt-1">
                        Your {appt.service?.name} appointment is coming up in <strong>{timeStr}</strong> on {format(apptDateTime, 'MMMM do')} at {formatTime(appt.start_time)}.
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => dismissNotif(appt.id)}
                    className="text-teal-600 hover:text-teal-800 p-2 hover:bg-teal-100 rounded-lg transition-colors shrink-0"
                    title="Dismiss notification"
                  >
                    <X size={18} />
                  </button>
                </div>
              );
            }
            return null;
          })}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {appointments.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {appointments.map(appt => {
                const isPast = new Date(`${appt.appointment_date}T${appt.start_time}`).getTime() < now.getTime();
                
                return (
                <div key={appt.id} className={`p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50 transition-colors ${isPast && appt.status !== 'completed' ? 'opacity-70' : ''}`}>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-slate-900">{appt.service?.name}</h3>
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(appt.status)}`}>
                         {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3 text-slate-600">
                        <Calendar size={18} className="text-slate-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-slate-900">{format(new Date(appt.appointment_date), 'EEEE, MMMM do, yyyy')}</p>
                          <p className="text-sm">{formatTime(appt.start_time)}</p>
                        </div>
                      </div>
                      
                      {clinicSettings?.clinic_name && (
                        <div className="flex items-start gap-3 text-slate-600">
                          <MapPin size={18} className="text-slate-400 mt-0.5" />
                          <div>
                            <p className="font-medium text-slate-900">{clinicSettings.clinic_name}</p>
                            <p className="text-sm line-clamp-1">{clinicSettings.clinic_address}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {appt.status === 'pending' && (
                    <div className="text-sm text-slate-500 bg-slate-100 px-4 py-3 rounded-xl md:text-center shrink-0">
                      Waiting for clinic<br className="hidden md:block" /> approval
                    </div>
                  )}
                  {appt.status === 'confirmed' && (
                    <div className="flex flex-col gap-3 shrink-0">
                      <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 px-4 py-3 rounded-xl text-center font-medium">
                        Confirmed<br className="hidden md:block" /> See you soon!
                      </div>
                      <button
                        onClick={() => {
                          const slipContent = `
                            <html>
                              <head>
                                <title>Appointment Slip - ${appt.full_name}</title>
                                <style>
                                  body { font-family: sans-serif; padding: 40px; color: #333; max-width: 600px; margin: auto; }
                                  .header { text-align: center; border-bottom: 2px solid #0d9488; padding-bottom: 20px; margin-bottom: 30px; }
                                  h1 { color: #0f766e; }
                                  .details { line-height: 1.8; font-size: 16px; margin-bottom: 40px; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; }
                                  .footer { font-size: 12px; color: #666; text-align: center; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; }
                                </style>
                              </head>
                              <body>
                                <div class="header">
                                  <h1>${clinicSettings?.clinic_name || 'Clinic'}</h1>
                                  <h2>Official Appointment Slip</h2>
                                </div>
                                <div class="details">
                                  <strong>Patient Name:</strong> ${appt.full_name}<br>
                                  <strong>Service details:</strong> ${appt.service?.name}<br>
                                  <strong>Appointment Date:</strong> ${format(new Date(appt.appointment_date), 'MMMM do, yyyy')}<br>
                                  <strong>Start Time:</strong> ${formatTime(appt.start_time)}<br>
                                  <strong>Status:</strong> <span style="color: #059669; font-weight: bold;">Confirmed</span>
                                </div>
                                <div class="footer">
                                  Please arrive at least 10 minutes prior to your scheduled time.<br>
                                  ${clinicSettings?.clinic_address ? clinicSettings.clinic_address : ''}
                                </div>
                                <script>
                                  window.onload = function() { window.print(); }
                                </script>
                              </body>
                            </html>
                          `;
                          const blob = new Blob([slipContent], { type: 'text/html' });
                          const url = URL.createObjectURL(blob);
                          window.open(url, '_blank');
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
                      >
                        <Printer size={16} />
                        Print / Save PDF
                      </button>
                    </div>
                  )}
                </div>
              )})}
            </div>
          ) : (
            <div className="p-16 text-center">
              <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">No appointments yet</h3>
              <p className="text-slate-500 mb-6">Looks like you haven't booked any visits with us.</p>
              <button 
                onClick={() => navigate('/book')}
                className="bg-teal-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-teal-700 transition-colors"
              >
                Book Your First Visit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
