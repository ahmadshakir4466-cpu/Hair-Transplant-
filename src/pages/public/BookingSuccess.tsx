import { useLocation, Navigate, Link } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { CheckCircle, Calendar, Clock, MapPin, ArrowLeft } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Appointment, Service } from '../../types';

export default function BookingSuccess() {
  const location = useLocation();
  const { clinicSettings } = useApp();
  
  const state = location.state as { appointment: Appointment, service: Service } | null;

  if (!state || !state.appointment || !state.service) {
    return <Navigate to="/book" replace />;
  }

  const { appointment, service } = state;
  const appointmentDate = parseISO(appointment.appointment_date);
  
  // Format times safely
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

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 md:p-12 text-center border border-slate-100">
        <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-teal-600" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Booking Confirmed!</h1>
        <p className="text-lg text-slate-600 mb-10 max-w-lg mx-auto">
          Thank you, {appointment.full_name.split(' ')[0]}. Your appointment request has been received and is pending confirmation.
        </p>

        <div className="bg-slate-50 rounded-2xl p-6 md:p-8 text-left mb-10 border border-slate-100">
          <h3 className="font-bold text-slate-900 mb-6 border-b border-slate-200 pb-4">Appointment Details</h3>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-white p-2 rounded-lg shadow-sm text-teal-600">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Date</p>
                <p className="text-slate-900 font-medium">{format(appointmentDate, 'EEEE, MMMM do, yyyy')}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-white p-2 rounded-lg shadow-sm text-teal-600">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Time</p>
                <p className="text-slate-900 font-medium">{formatTime(appointment.start_time)}</p>
                <p className="text-xs text-slate-500 mt-1">{service.name} • {service.duration_minutes} min</p>
              </div>
            </div>

            {clinicSettings?.clinic_address && (
              <div className="flex items-start gap-4">
                <div className="bg-white p-2 rounded-lg shadow-sm text-teal-600">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Location</p>
                  <p className="text-slate-900 font-medium">{clinicSettings.clinic_name}</p>
                  <p className="text-sm text-slate-600 leading-relaxed mt-1 max-w-[200px]">{clinicSettings.clinic_address}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <Link 
          to="/" 
          className="inline-flex items-center justify-center gap-2 text-teal-600 font-medium hover:text-teal-700 transition-colors"
        >
          <ArrowLeft size={16} /> Return to Home
        </Link>
      </div>
    </div>
  );
}
