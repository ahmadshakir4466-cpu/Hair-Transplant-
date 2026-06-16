import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Appointment } from '../../types';
import { Calendar, MapPin, X, Bell, Printer, User, History } from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '../../contexts/AppContext';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

export default function ClientDashboard() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { clinicSettings } = useApp();
  const navigate = useNavigate();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dismissedNotifs, setDismissedNotifs] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'appointments' | 'profile'>('appointments');
  const [profileName, setProfileName] = useState(user?.user_metadata?.full_name || '');
  const [profilePhone, setProfilePhone] = useState(user?.user_metadata?.phone || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

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
      setProfileName(user?.user_metadata?.full_name || '');
      setProfilePhone(user?.user_metadata?.phone || '');
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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profileName,
          phone: profilePhone,
        }
      });
      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
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
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">My Appointments</h1>
            <p className="text-slate-500">Track and manage your upcoming visits.</p>
          </div>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="text-slate-500 hover:text-slate-800 font-medium text-sm px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-200 self-start sm:self-auto"
          >
            Sign Out
          </button>
        </div>

        <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 flex items-center mb-8 inline-flex">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm transition-all ${activeTab === 'appointments' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
          >
            <History size={18} />
            Appointments
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm transition-all ${activeTab === 'profile' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
          >
            <User size={18} />
            Patient Profile
          </button>
        </div>

        {activeTab === 'profile' ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 sm:p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Contact Information</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none transition-all"
                    placeholder="Your Full Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address (Cannot be changed)</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none transition-all"
                    placeholder="e.g. +1 234 567 8900"
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="bg-teal-600 text-white px-8 py-3 rounded-xl font-bold disabled:opacity-70 flex justify-center items-center hover:bg-teal-700 transition-colors"
                  >
                    {isSavingProfile ? (
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <>
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
                          const doc = new jsPDF();
                          doc.setFillColor(13, 148, 136); // Teal header
                          doc.rect(0, 0, 210, 40, 'F');
                          doc.setTextColor(255, 255, 255);
                          doc.setFontSize(22);
                          doc.text(clinicSettings?.clinic_name || 'Clinic', 105, 20, { align: 'center' });
                          doc.setFontSize(16);
                          doc.text('Official Appointment Slip', 105, 30, { align: 'center' });
                          
                          doc.setTextColor(51, 51, 51);
                          doc.setFontSize(12);
                          
                          let y = 60;
                          doc.text(`Patient Name: ${appt.full_name}`, 20, y); y += 10;
                          doc.text(`Service: ${appt.service?.name || ''}`, 20, y); y += 10;
                          doc.text(`Date: ${format(new Date(appt.appointment_date), 'MMMM do, yyyy')}`, 20, y); y += 10;
                          doc.text(`Start Time: ${formatTime(appt.start_time)}`, 20, y); y += 10;
                          doc.text(`Status: Confirmed`, 20, y);
                          
                          doc.setFontSize(10);
                          doc.setTextColor(102, 102, 102);
                          doc.text('Please arrive at least 10 minutes prior to your scheduled time.', 105, 270, { align: 'center' });
                          doc.text(clinicSettings?.clinic_address || '', 105, 275, { align: 'center' });
                          
                          doc.save(`Appointment_Slip_${format(new Date(appt.appointment_date), 'yyyy-MM-dd')}.pdf`);
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
          </>
        )}
      </div>
    </div>
  );
}
