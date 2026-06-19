import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Service } from '../../types';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Clock, ChevronRight, ArrowLeft, Info } from 'lucide-react';
import { format, addDays, startOfDay, addMinutes, isBefore, parseISO, isSameDay, getDay } from 'date-fns';
import toast from 'react-hot-toast';

export default function BookAppointment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clinicSettings } = useApp();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<{start: Date, end: Date, label: string}[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<{start: Date, end: Date, label: string} | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const [unavailableDates, setUnavailableDates] = useState<Record<string, boolean>>({});
  const [closedWeekdays, setClosedWeekdays] = useState<number[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  useEffect(() => {
    // Keep form data in sync if user changes after component mount
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || prev.email,
        fullName: user.user_metadata?.full_name || prev.fullName
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchGlobalAvailability = async () => {
      if (!isSupabaseConfigured) return;
      
      const { data: blockedData } = await supabase
        .from('blocked_dates')
        .select('blocked_date');
        
      if (blockedData) {
        const bdRecord: Record<string, boolean> = {};
        blockedData.forEach((r: any) => {
           bdRecord[r.blocked_date] = true;
        });
        setUnavailableDates(bdRecord);
      }

      const { data: hoursData } = await supabase
        .from('business_hours')
        .select('*');
        
      if (hoursData) {
        const closedDays = hoursData.filter((r: any) => !r.is_open).map((r: any) => r.weekday);
        setClosedWeekdays(closedDays);
      }
    };
    fetchGlobalAvailability();
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      if (!isSupabaseConfigured) return;
      
      const { data } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .neq('name', '__UI_SETTINGS__')
        .order('name');
      
      if (data) {
        setServices(data);
        const serviceIdFromUrl = searchParams.get('service');
        if (serviceIdFromUrl) {
          const service = data.find(s => s.id === serviceIdFromUrl);
          if (service) {
            setSelectedService(service);
            setStep(2);
          }
        }
      }
    };
    fetchServices();
  }, [searchParams]);

  // Generate Available Slots
  useEffect(() => {
    if (!selectedDate || !selectedService || !clinicSettings) return;

    const fetchAvailability = async () => {
      setIsLoadingSlots(true);
      try {
        const queryDateStr = format(selectedDate, 'yyyy-MM-dd');
        
        // 1. Get blocked date
        const { data: blockedData } = await supabase
          .from('blocked_dates')
          .select('*')
          .eq('blocked_date', queryDateStr)
          .single();
          
        if (blockedData) {
          setAvailableSlots([]);
          return;
        }

        // 2. Get business hours for this day of week
        const dayOfWeek = getDay(selectedDate);
        const { data: hoursData } = await supabase
          .from('business_hours')
          .select('*')
          .eq('weekday', dayOfWeek)
          .single();

        if (!hoursData || !hoursData.is_open) {
          setAvailableSlots([]);
          return;
        }

        // 3. Get existing appointments for this date
        const { data: appointmentsData } = await supabase
          .from('appointments')
          .select('start_time, end_time')
          .eq('appointment_date', queryDateStr)
          .neq('status', 'cancelled');

        // 4. Generate possible slots
        const slots: {start: Date, end: Date, label: string}[] = [];
        
        // Parse start and end business hours to Date objects for the selected day
        const [startHour, startMinute] = hoursData.start_time.split(':').map(Number);
        const [endHour, endMinute] = hoursData.end_time.split(':').map(Number);
        
        let currentSlotStart = new Date(selectedDate);
        currentSlotStart.setHours(startHour, startMinute, 0, 0);
        
        const businessEnd = new Date(selectedDate);
        businessEnd.setHours(endHour, endMinute, 0, 0);

        const now = new Date();
        const noticeTime = addMinutes(now, (clinicSettings.booking_notice_hours || 24) * 60);

        while (isBefore(currentSlotStart, businessEnd)) {
          const currentSlotEnd = addMinutes(currentSlotStart, selectedService.duration_minutes);
          
          if (isBefore(businessEnd, currentSlotEnd)) {
            break; // slot exceeds business hours
          }

          // Check notice hours
          if (isSameDay(currentSlotStart, now) && isBefore(currentSlotStart, noticeTime)) {
            currentSlotStart = addMinutes(currentSlotStart, clinicSettings.slot_interval_minutes || 30);
            continue;
          }

          // Check overlap with existing appointments
          let isOverlapping = false;
          if (appointmentsData) {
            for (const appt of appointmentsData) {
              const apptStart = new Date(`${queryDateStr}T${appt.start_time}`);
              const apptEnd = new Date(`${queryDateStr}T${appt.end_time}`);
              
              // overlap: new_start < existing_end && new_end > existing_start
              if (currentSlotStart < apptEnd && currentSlotEnd > apptStart) {
                isOverlapping = true;
                break;
              }
            }
          }

          if (!isOverlapping) {
             slots.push({
               start: new Date(currentSlotStart),
               end: new Date(currentSlotEnd),
               label: format(currentSlotStart, 'h:mm a')
             });
          }

          // advance by interval
          currentSlotStart = addMinutes(currentSlotStart, clinicSettings.slot_interval_minutes || 30);
        }

        setAvailableSlots(slots);
      } catch (err) {
        console.error('Error fetching availability:', err);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchAvailability();
  }, [selectedDate, selectedService, clinicSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedSlot) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          notes: formData.notes || null,
          service_id: selectedService.id,
          appointment_date: format(selectedSlot.start, 'yyyy-MM-dd'),
          start_time: format(selectedSlot.start, 'HH:mm:ss'),
          end_time: format(selectedSlot.end, 'HH:mm:ss'),
          status: 'pending'
        })
        .select()
        .single();
        
      if (error) throw error;
      
      navigate('/booking-success', { state: { appointment: data, service: selectedService } });
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to book appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate next 14 days for date selection
  const nextDays = Array.from({ length: 14 }).map((_, i) => addDays(startOfDay(new Date()), i));

  return (
    <div className="min-h-screen bg-slate-50 py-12 md:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Schedule Your Visit</h1>
          <p className="text-slate-600">Complete the steps below to request your appointment.</p>
        </div>

        {/* Steps indicator */}
        <div className="flex justify-center items-center mb-12">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                step >= s ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {s}
              </div>
              {s < 3 && (
                <div className={`h-1 w-16 md:w-24 ${step > s ? 'bg-teal-600' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
          
          {step === 1 && (
            <div className="p-8 md:p-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-8">What do you need help with?</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => {
                      setSelectedService(service);
                      setStep(2);
                    }}
                    className={`text-left p-6 rounded-2xl border-2 transition-all duration-200 ${
                      selectedService?.id === service.id 
                        ? 'border-teal-500 bg-teal-50 ring-4 ring-teal-500/10' 
                        : 'border-slate-100 hover:border-teal-200 hover:bg-slate-50'
                    }`}
                  >
                    <h3 className="font-bold text-slate-900 mb-2">{service.name}</h3>
                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">{service.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">${service.price}</span>
                      <span className="text-slate-400 flex items-center gap-1"><Clock size={14} /> {service.duration_minutes} min</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="p-8 md:p-12">
              <button 
                onClick={() => setStep(1)} 
                className="flex items-center gap-2 text-slate-500 hover:text-teal-600 mb-8 font-medium transition-colors"
              >
                <ArrowLeft size={16} /> Back to Services
              </button>
              
              <div className="mb-10">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Calendar className="text-teal-600" /> Select Date
                </h3>
                 <div className="flex gap-3 overflow-x-auto pb-4 snap-x hide-scrollbar">
                  {nextDays.map((date) => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const dayOfWeek = getDay(date);
                    const isUnavailable = unavailableDates[dateStr] || closedWeekdays.includes(dayOfWeek);

                    return (
                    <button
                      key={date.toISOString()}
                      disabled={isUnavailable}
                      onClick={() => {
                        setSelectedDate(date);
                        setSelectedSlot(null);
                      }}
                      className={`min-w-[4.5rem] flex flex-col items-center justify-center p-3 rounded-2xl border-2 snap-start transition-all ${
                        isUnavailable
                          ? 'border-red-200 bg-red-50 text-red-500 opacity-60 cursor-not-allowed'
                          : selectedDate && isSameDay(selectedDate, date)
                            ? 'border-teal-500 bg-teal-50 text-teal-700 ring-4 ring-teal-500/10'
                            : 'border-slate-100 bg-white text-slate-600 hover:border-teal-200 cursor-pointer'
                      }`}
                    >
                      <span className="text-xs font-semibold uppercase">{format(date, 'eee')}</span>
                      <span className="text-xl font-bold my-1">{format(date, 'd')}</span>
                      <span className="text-xs">{format(date, 'MMM')}</span>
                    </button>
                  )})}
                </div>
              </div>

              {selectedDate && (
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Clock className="text-teal-600" /> Available Times
                  </h3>
                  {isLoadingSlots ? (
                    <div className="flex items-center gap-3 text-slate-500">
                      <div className="animate-spin h-5 w-5 border-2 border-slate-300 border-t-teal-600 rounded-full"></div>
                      Finding available slots...
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {availableSlots.map((slot, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-3 px-2 rounded-xl text-sm font-medium border-2 transition-all text-center ${
                            selectedSlot?.start === slot.start
                              ? 'border-teal-500 bg-teal-50 text-teal-700 ring-4 ring-teal-500/10'
                              : 'border-slate-200 hover:border-teal-300 text-slate-700'
                          }`}
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-6 rounded-2xl text-center border border-slate-100">
                      <p className="text-slate-600 font-medium">No available slots on this date.</p>
                      <p className="text-sm text-slate-400 mt-1">Please select another date from the calendar above.</p>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-12 flex justify-end">
                <button
                  disabled={!selectedSlot}
                  onClick={() => setStep(3)}
                  className="bg-teal-600 text-white px-8 py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-teal-700 transition-colors flex items-center gap-2"
                >
                  Continue <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col md:flex-row">
              {/* Form Section */}
              <div className="p-8 md:p-12 flex-1 border-b md:border-b-0 md:border-r border-slate-100">
                <button 
                  onClick={() => setStep(2)} 
                  className="flex items-center gap-2 text-slate-500 hover:text-teal-600 mb-8 font-medium transition-colors"
                >
                  <ArrowLeft size={16} /> Back to Time Selection
                </button>
                
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Details</h2>
                
                {!user && (
                  <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-4 mb-6 flex items-start gap-3">
                    <Info size={20} className="mt-0.5 shrink-0" />
                    <p className="text-sm">
                      <Link to="/client-auth" className="font-bold underline hover:text-blue-900">Sign in or create an account</Link> to easily track your appointments and get reminders.
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input 
                      required
                      type="text" 
                      value={formData.fullName}
                      onChange={e => setFormData({...formData, fullName: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none transition-all"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                      <input 
                        required
                        type="email" 
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none transition-all"
                        placeholder="jane@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                      <input 
                        required
                        type="tel" 
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none transition-all"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Additional Notes (Optional)</label>
                    <textarea 
                      rows={3}
                      value={formData.notes}
                      onChange={e => setFormData({...formData, notes: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none transition-all resize-none"
                      placeholder="Any specific concerns or requests?"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-teal-600 text-white px-8 py-4 rounded-xl font-bold flex justify-center items-center gap-2 disabled:opacity-70 hover:bg-teal-700 transition-colors mt-4 shadow-lg shadow-teal-200"
                  >
                    {isSubmitting ? (
                       <span className="flex items-center gap-2">
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                        Processing...
                       </span>
                    ) : 'Confirm Booking'}
                  </button>
                </form>
              </div>

              {/* Summary Sidebar */}
              <div className="p-8 md:p-12 w-full md:w-80 bg-slate-50">
                <h3 className="font-bold text-slate-900 mb-6 uppercase text-sm tracking-wider">Appointment Summary</h3>
                
                {selectedService && (
                   <div className="mb-6">
                    <p className="text-sm text-slate-500 mb-1">Service</p>
                    <p className="font-medium text-slate-900">{selectedService.name}</p>
                    <p className="text-sm text-slate-600">${selectedService.price} • {selectedService.duration_minutes} min</p>
                   </div>
                )}
                
                {selectedSlot && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Date & Time</p>
                    <p className="font-medium text-slate-900">{format(selectedSlot.start, 'EEEE, MMMM do, yyyy')}</p>
                    <p className="text-slate-600">{format(selectedSlot.start, 'h:mm a')} - {format(selectedSlot.end, 'h:mm a')}</p>
                  </div>
                )}
                
                <div className="mt-8 pt-8 border-t border-slate-200">
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span className="text-slate-900">Total</span>
                    <span className="text-slate-900">${selectedService?.price || 0}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 text-right">Payment required after visit.</p>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
