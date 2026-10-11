import { useLocation, Navigate, Link } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { 
  CheckCircle2, 
  Calendar, 
  Clock, 
  MapPin, 
  ArrowLeft, 
  Sparkles, 
  Printer, 
  CalendarPlus,
  Compass,
  PhoneCall,
  Check
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Appointment, Service } from '../../types';
import { motion } from 'motion/react';

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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#0E9F8C]/10 selection:text-[#0E9F8C]">
      <div className="max-w-2xl w-full">
        
        {/* Main Card container */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", damping: 25 }}
          className="bg-white rounded-[2rem] border border-[#E8EEF5] shadow-[0_8px_40px_-6px_rgba(15,23,42,0.04)] p-8 md:p-12 text-center"
        >
          {/* Animated Premium Checked ring */}
          <div className="relative w-24 h-24 mx-auto mb-8">
            <motion.div 
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 150 }}
              className="absolute inset-0 bg-[#0E9F8C]/10 text-[#0E9F8C] rounded-full flex items-center justify-center"
            >
              <div className="w-16 h-16 bg-[#0E9F8C] text-white rounded-full flex items-center justify-center shadow-md shadow-[#0E9F8C]/20">
                <Check size={32} strokeWidth={3} />
              </div>
            </motion.div>
            
            <motion.div 
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.2, 0.6] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute -inset-2 border-2 border-dashed border-[#0E9F8C]/30 rounded-full"
            />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-bold tracking-wide uppercase mb-3">
              <Sparkles size={12} /> Appointment Locked-In
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] mb-4 tracking-tight">
              Booking Confirmed!
            </h1>
            <p className="text-base text-[#64748B] mb-10 max-w-lg mx-auto leading-relaxed">
              Thank you, <span className="font-extrabold text-[#0F172A]">{appointment.full_name.split(' ')[0]}</span>. Your aesthetic consultation has been successfully logged. Dr. Sohail's desk team will verify and sync this on our calendar.
            </p>
          </motion.div>

          {/* Aesthetic Medical Digital Pass / Ticket Layout */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45 }}
            className="bg-[#F8FAFC] rounded-2xl border-2 border-[#E8EEF5] text-left mb-8 overflow-hidden relative"
          >
            {/* Ticket header line */}
            <div className="bg-[#0E9F8C]/5 px-6 py-4 border-b border-[#E8EEF5] flex justify-between items-center">
              <span className="text-xs font-extrabold text-[#0E9F8C] uppercase tracking-wider">Aesthetic Consultation Pass</span>
              <span className="text-[10px] bg-white border border-[#E8EEF5] text-[#64748B] font-bold px-2 py-0.5 rounded-md uppercase">
                ID: #{appointment.id.substring(0, 6).toUpperCase()}
              </span>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Date Row */}
                <div className="flex items-start gap-3.5">
                  <div className="bg-white p-2.5 rounded-xl border border-[#E8EEF5] text-[#0E9F8C] shadow-xs">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Date</span>
                    <p className="text-sm text-[#0F172A] font-extrabold">{format(appointmentDate, 'EEEE, MMM d, yyyy')}</p>
                  </div>
                </div>

                {/* Time Row */}
                <div className="flex items-start gap-3.5">
                  <div className="bg-white p-2.5 rounded-xl border border-[#E8EEF5] text-[#0E9F8C] shadow-xs">
                    <Clock size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Time Slot</span>
                    <p className="text-sm text-[#0F172A] font-extrabold">{formatTime(appointment.start_time)}</p>
                    <p className="text-[11px] text-[#0E9F8C] font-semibold mt-0.5">{service.name} ({service.duration_minutes} min)</p>
                  </div>
                </div>

              </div>

              {clinicSettings?.clinic_address && (
                <div className="flex items-start gap-3.5 pt-5 border-t border-[#E8EEF5]">
                  <div className="bg-white p-2.5 rounded-xl border border-[#E8EEF5] text-[#0E9F8C] shadow-xs shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block text-left">Clinical Venue</span>
                    <p className="text-sm text-[#0F172A] font-extrabold text-left">{clinicSettings.clinic_name}</p>
                    <p className="text-xs text-[#64748B] leading-relaxed mt-1 max-w-md text-left">{clinicSettings.clinic_address}</p>
                  </div>
                </div>
              )}

            </div>

            {/* Ticket jagged edge design circles */}
            <div className="absolute top-1/2 -left-3 w-6 h-6 bg-[#F8FAFC] border-r-2 border-[#E8EEF5] rounded-full transform -translate-y-1/2" />
            <div className="absolute top-1/2 -right-3 w-6 h-6 bg-[#F8FAFC] border-l-2 border-[#E8EEF5] rounded-full transform -translate-y-1/2" />
          </motion.div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 border-b border-[#E8EEF5] pb-8 mb-8">
            <button 
              onClick={handlePrint}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 border border-[#E8EEF5] rounded-2xl text-xs font-bold text-[#64748B] hover:text-[#0F172A] transition-all cursor-pointer shadow-xs"
            >
              <Printer size={15} /> Print Receipt
            </button>
            <a 
              href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Sohail+Aesthetic+Clinic+Appointment&dates=${format(appointmentDate, 'yyyyMMdd')}/${format(appointmentDate, 'yyyyMMdd')}&details=${encodeURIComponent(service.name + ' with Dr. Sohail')}&location=${encodeURIComponent(clinicSettings?.clinic_address || 'Multan, Pakistan')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 border border-[#E8EEF5] rounded-2xl text-xs font-bold text-[#64748B] hover:text-[#0F172A] transition-all cursor-pointer shadow-xs"
            >
              <CalendarPlus size={15} /> Add to Calendar
            </a>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-[#64748B]">
            <Link 
              to="/" 
              className="inline-flex items-center justify-center gap-2 text-[#0E9F8C] hover:text-[#0E9F8C]/80 transition-colors cursor-pointer group"
            >
              <Compass size={14} className="group-hover:rotate-12 transition-transform" /> Return to Homepage
            </Link>

            <span className="hidden sm:inline text-slate-300">|</span>

            <a 
              href="tel:03001234567" 
              className="inline-flex items-center justify-center gap-1.5 hover:text-[#0F172A] transition-colors"
            >
              <PhoneCall size={14} /> Desk Helpline: 0300 1234567
            </a>
          </div>

        </motion.div>
      </div>
    </div>
  );
}

