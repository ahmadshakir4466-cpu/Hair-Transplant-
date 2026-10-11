import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Service } from '../../types';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronRight, 
  ArrowLeft, 
  Info, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Star, 
  Award, 
  Activity, 
  FileText, 
  Heart,
  ChevronLeft,
  CalendarCheck,
  CheckCircle2,
  Stethoscope,
  ChevronDown
} from 'lucide-react';
import { format, addDays, startOfDay, addMinutes, isBefore, parseISO, isSameDay, getDay } from 'date-fns';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

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

  // Before & After Gallery active index
  const [galleryIndex, setGalleryIndex] = useState(0);
  const galleryItems = [
    {
      title: "FUE Hair Transplant (6 Months)",
      before: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
      after: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250"
    },
    {
      title: "Beard Restoration (4 Months)",
      before: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=250",
      after: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=250"
    }
  ];

  // Form State
  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Focus and feedback indicators
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

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

  // Time slots categories grouping
  const morningSlots = availableSlots.filter(s => s.start.getHours() < 12);
  const afternoonSlots = availableSlots.filter(s => s.start.getHours() >= 12 && s.start.getHours() < 17);
  const eveningSlots = availableSlots.filter(s => s.start.getHours() >= 17);

  // Stepper Items
  const stepsConfig = [
    { num: 1, label: "Service" },
    { num: 2, label: "Schedule" },
    { num: 3, label: "Details & Review" }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 md:py-16 text-[#0F172A] selection:bg-[#0E9F8C]/10 selection:text-[#0E9F8C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-[#0E9F8C]/10 text-[#0E9F8C] rounded-full text-xs font-semibold mb-3 tracking-wide uppercase"
          >
            <Sparkles size={12} /> Apple-Inspired Premium Booking
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold text-[#0F172A] tracking-tight mb-3"
          >
            Schedule Your Visit
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base text-[#64748B]"
          >
            Experience premium aesthetic and hair restoration services personalized for you.
          </motion.p>
        </div>

        {/* Dynamic Premium Stepper */}
        <div className="flex justify-center items-center mb-12 max-w-md mx-auto">
          {stepsConfig.map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center relative">
                <motion.div 
                  initial={{ scale: 0.9 }}
                  animate={{ 
                    scale: step === s.num ? 1.05 : 1,
                    backgroundColor: step === s.num ? "#0E9F8C" : step > s.num ? "#0E9F8C" : "#FFFFFF",
                    color: step === s.num ? "#FFFFFF" : step > s.num ? "#FFFFFF" : "#64748B",
                    borderColor: step >= s.num ? "#0E9F8C" : "#E8EEF5"
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 shadow-xs z-10 transition-all duration-300`}
                >
                  {step > s.num ? <Check size={16} strokeWidth={3} /> : s.num}
                </motion.div>
                <span className={`absolute -bottom-6 whitespace-nowrap text-[11px] font-bold tracking-tight uppercase ${
                  step === s.num ? 'text-[#0E9F8C]' : 'text-[#64748B]'
                }`}>
                  {s.label}
                </span>
              </div>
              {idx < stepsConfig.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 bg-[#E8EEF5] relative overflow-hidden">
                  <motion.div 
                    className="absolute inset-y-0 left-0 bg-[#0E9F8C]"
                    initial={{ width: "0%" }}
                    animate={{ width: step > s.num ? "100%" : "0%" }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Master Two-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 mt-12 items-start">
          
          {/* LEFT COLUMN: Doctor Card & Visual Trust Elements */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
            
            {/* Professional Doctor Profile Card */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#E8EEF5] shadow-[0_4px_20px_-4px_rgba(15,23,42,0.03)] hover:shadow-[0_12px_30px_-6px_rgba(15,23,42,0.06)] transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=250" 
                    alt="Dr. Sohail" 
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#0E9F8C]/20 shadow-inner"
                  />
                  <span className="absolute bottom-0 right-0 w-4 h-4 bg-[#22C55E] border-2 border-white rounded-full" title="Available Today" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-lg text-[#0F172A] tracking-tight">Dr. M. Sohail</h3>
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1] }} 
                      transition={{ repeat: Infinity, duration: 2.5 }}
                      className="bg-[#0E9F8C]/10 text-[#0E9F8C] p-0.5 rounded-full"
                    >
                      <ShieldCheck size={14} className="fill-[#0E9F8C]/15" />
                    </motion.div>
                  </div>
                  <p className="text-xs font-semibold text-[#0E9F8C] uppercase tracking-wider mb-1">Lead Hair Transplant &amp; Aesthetic Surgeon</p>
                  <div className="flex items-center gap-1 text-xs text-[#64748B] font-medium">
                    <div className="flex items-center text-[#F59E0B]">
                      <Star size={13} className="fill-current" />
                      <Star size={13} className="fill-current" />
                      <Star size={13} className="fill-current" />
                      <Star size={13} className="fill-current" />
                      <Star size={13} className="fill-current" />
                    </div>
                    <span className="text-[#0F172A] font-bold ml-1">4.9</span>
                    <span>(1,200+ Reviews)</span>
                  </div>
                </div>
              </div>

              {/* Doctor Details */}
              <div className="space-y-3.5 border-t border-[#E8EEF5] pt-5 text-sm text-[#64748B]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#F8FAFC] rounded-xl text-[#0E9F8C]">
                    <Award size={16} />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Experience</span>
                    <span className="font-bold text-[#0F172A]">15+ Years Clinical Expertise</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#F8FAFC] rounded-xl text-[#0E9F8C]">
                    <Activity size={16} />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Languages</span>
                    <span className="font-bold text-[#0F172A]">English, Urdu, Punjabi</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#F8FAFC] rounded-xl text-[#0E9F8C]">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Clinic Address</span>
                    <span className="font-bold text-[#0F172A] text-xs line-clamp-1">
                      {clinicSettings?.clinic_address || "Aesthetic & Laser Clinic, Pakistan"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Before & After Interactive Showcase */}
            <div className="bg-white rounded-3xl p-6 border border-[#E8EEF5] shadow-[0_4px_20px_-4px_rgba(15,23,42,0.03)]">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-extrabold text-[#0F172A] text-sm uppercase tracking-wider flex items-center gap-2">
                  <Sparkles size={15} className="text-[#0E9F8C]" /> Clinical Outcomes
                </h4>
                <div className="flex gap-1">
                  {galleryItems.map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setGalleryIndex(i)} 
                      className={`w-2 h-2 rounded-full transition-all ${galleryIndex === i ? 'w-5 bg-[#0E9F8C]' : 'bg-[#E8EEF5]'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Slider Image Representation */}
              <div className="relative overflow-hidden rounded-2xl bg-slate-50 border border-[#E8EEF5] aspect-video">
                <div className="absolute inset-0 flex">
                  {/* Before */}
                  <div className="w-1/2 h-full relative border-r border-[#E8EEF5]">
                    <img 
                      src={galleryItems[galleryIndex].before} 
                      alt="Before treatment" 
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 text-white rounded-md text-[10px] font-bold uppercase tracking-wider">Before</span>
                  </div>
                  {/* After */}
                  <div className="w-1/2 h-full relative">
                    <img 
                      src={galleryItems[galleryIndex].after} 
                      alt="After treatment" 
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-[#0E9F8C]/90 text-white rounded-md text-[10px] font-bold uppercase tracking-wider">After</span>
                  </div>
                </div>
              </div>
              <p className="text-xs font-bold text-center text-[#64748B] mt-3">{galleryItems[galleryIndex].title}</p>
            </div>

            {/* Clinic Standard Trust Badges */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="bg-white rounded-2xl p-4 border border-[#E8EEF5] flex items-center gap-3">
                <div className="bg-[#0E9F8C]/10 text-[#0E9F8C] p-2 rounded-xl">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="font-extrabold text-xs text-[#0F172A] leading-tight">100% Certified</p>
                  <p className="text-[10px] text-[#64748B] font-medium mt-0.5">FDA-Approved Tech</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-[#E8EEF5] flex items-center gap-3">
                <div className="bg-[#0E9F8C]/10 text-[#0E9F8C] p-2 rounded-xl">
                  <Heart size={18} />
                </div>
                <div>
                  <p className="font-extrabold text-xs text-[#0F172A] leading-tight">Patient Care</p>
                  <p className="text-[10px] text-[#64748B] font-medium mt-0.5">Free Follow-ups</p>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: The Interactive Booking Stepper Flow */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] border border-[#E8EEF5] shadow-[0_8px_30px_rgb(0,0,0,0.01)] overflow-hidden transition-all duration-300">
              <AnimatePresence mode="wait">
                
                {/* STEP 1: SELECT SERVICE */}
                {step === 1 && (
                  <motion.div 
                    key="step-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="p-6 md:p-10"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-xl md:text-2xl font-extrabold text-[#0F172A] tracking-tight">Select Treatment</h2>
                        <p className="text-xs text-[#64748B] mt-1">Please select the service you would like to book a session for.</p>
                      </div>
                      <div className="hidden sm:block text-right">
                        <span className="text-[11px] font-bold text-[#64748B] bg-[#F8FAFC] border border-[#E8EEF5] px-2.5 py-1 rounded-full uppercase tracking-wider">
                          Services Loaded: {services.length}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {services.map((service) => {
                        const isSelected = selectedService?.id === service.id;
                        return (
                          <motion.button
                            key={service.id}
                            onClick={() => {
                              setSelectedService(service);
                              setStep(2);
                            }}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.99 }}
                            className={`w-full text-left p-5 md:p-6 rounded-2xl border-2 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer relative ${
                              isSelected 
                                ? 'border-[#0E9F8C] bg-[#0E9F8C]/5 shadow-sm' 
                                : 'border-[#E8EEF5] bg-white hover:border-[#0E9F8C]/40 hover:bg-[#F8FAFC]'
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute top-4 right-4 bg-[#0E9F8C] text-white p-1 rounded-full">
                                <Check size={12} strokeWidth={3} />
                              </div>
                            )}

                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-extrabold text-base text-[#0F172A] tracking-tight">{service.name}</h3>
                                <span className="px-2 py-0.5 bg-[#F8FAFC] border border-[#E8EEF5] text-slate-400 rounded-md text-[10px] font-bold">Aesthetic</span>
                              </div>
                              <p className="text-xs text-[#64748B] leading-relaxed line-clamp-2 max-w-xl">{service.description}</p>
                              
                              {/* Extra Suitable details inspired by description */}
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-2 text-[11px] text-[#64748B] font-semibold">
                                <span className="flex items-center gap-1"><Clock size={12} className="text-[#0E9F8C]" /> Duration: {service.duration_minutes} mins</span>
                                <span className="flex items-center gap-1"><Award size={12} className="text-[#0E9F8C]" /> High Patient Satisfaction</span>
                              </div>
                            </div>

                            <div className="flex md:flex-col items-start md:items-end justify-between md:justify-center border-t md:border-t-0 border-[#E8EEF5] pt-3 md:pt-0 shrink-0">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Estimated Price</span>
                              <span className="font-extrabold text-[#0E9F8C] text-lg">PKR {service.price.toLocaleString()}</span>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: SELECT DATE & TIME */}
                {step === 2 && (
                  <motion.div 
                    key="step-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="p-6 md:p-10"
                  >
                    <button 
                      onClick={() => setStep(1)} 
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-[#0E9F8C] mb-6 transition-colors border border-[#E8EEF5] px-3 py-1.5 rounded-full bg-white cursor-pointer"
                    >
                      <ArrowLeft size={14} /> Back to Treatments
                    </button>

                    <div className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div>
                        <h2 className="text-xl md:text-2xl font-extrabold text-[#0F172A] tracking-tight">Select Date &amp; Time</h2>
                        <p className="text-xs text-[#64748B] mt-1">Pick an available day and convenient clinical time window.</p>
                      </div>
                      {selectedService && (
                        <div className="px-3.5 py-1.5 bg-[#F8FAFC] border border-[#E8EEF5] rounded-xl self-start sm:self-auto flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-[#0E9F8C] rounded-full animate-ping" />
                          <span className="text-xs font-bold text-[#0F172A]">{selectedService.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Premium Horizontal Calendar */}
                    <div className="mb-10">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          {selectedDate ? format(selectedDate, 'MMMM yyyy') : "Select a Date"}
                        </span>
                        <span className="text-[10px] font-bold text-[#64748B]">
                          14-Day Forecast
                        </span>
                      </div>
                      
                      <div className="flex gap-2.5 overflow-x-auto pb-4 snap-x scrollbar-thin scrollbar-thumb-teal-600">
                        {nextDays.map((date) => {
                          const dateStr = format(date, 'yyyy-MM-dd');
                          const dayOfWeek = getDay(date);
                          const isUnavailable = unavailableDates[dateStr] || closedWeekdays.includes(dayOfWeek);
                          const isToday = isSameDay(date, new Date());
                          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                          return (
                            <button
                              key={date.toISOString()}
                              disabled={isUnavailable}
                              onClick={() => {
                                setSelectedDate(date);
                                setSelectedSlot(null);
                              }}
                              className={`min-w-[4.5rem] flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 snap-start transition-all duration-200 cursor-pointer ${
                                isUnavailable
                                  ? 'border-red-50 bg-red-50/20 text-red-300 cursor-not-allowed opacity-60'
                                  : selectedDate && isSameDay(selectedDate, date)
                                    ? 'border-[#0E9F8C] bg-[#0E9F8C] text-white shadow-md shadow-[#0E9F8C]/25 scale-102'
                                    : 'border-[#E8EEF5] bg-white text-[#64748B] hover:border-[#0E9F8C]/40 hover:text-[#0F172A]'
                              }`}
                            >
                              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                selectedDate && isSameDay(selectedDate, date) ? 'text-white' : isWeekend ? 'text-[#0E9F8C]/80' : 'text-slate-400'
                              }`}>
                                {format(date, 'eee')}
                              </span>
                              <span className={`text-xl font-extrabold my-1 leading-none ${
                                selectedDate && isSameDay(selectedDate, date) ? 'text-white' : 'text-[#0F172A]'
                              }`}>
                                {format(date, 'd')}
                              </span>
                              {isToday ? (
                                <span className={`text-[9px] font-bold uppercase px-1 rounded ${
                                  selectedDate && isSameDay(selectedDate, date) ? 'bg-white/20 text-white' : 'bg-[#0E9F8C]/10 text-[#0E9F8C]'
                                }`}>Today</span>
                              ) : (
                                <span className="text-[10px] font-medium">{format(date, 'MMM')}</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Time Window Slots */}
                    {selectedDate && (
                      <div className="space-y-6">
                        <h3 className="text-sm font-extrabold text-[#0F172A] uppercase tracking-wider mb-2 flex items-center gap-2">
                          <Clock size={15} className="text-[#0E9F8C]" /> Available Appointment Times
                        </h3>

                        {isLoadingSlots ? (
                          <div className="flex items-center gap-3 text-sm text-[#64748B] py-8 justify-center bg-[#F8FAFC] rounded-2xl border border-[#E8EEF5]">
                            <div className="animate-spin h-5 w-5 border-2 border-slate-300 border-t-[#0E9F8C] rounded-full"></div>
                            <span>Scanning clinic room availability...</span>
                          </div>
                        ) : availableSlots.length > 0 ? (
                          <div className="space-y-5">
                            
                            {/* Morning Slots */}
                            {morningSlots.length > 0 && (
                              <div>
                                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest block mb-2.5">🌅 Morning Session</span>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                  {morningSlots.map((slot, i) => (
                                    <button
                                      key={`morning-${i}`}
                                      onClick={() => setSelectedSlot(slot)}
                                      className={`py-3 px-2 rounded-xl text-xs font-semibold border-2 transition-all text-center cursor-pointer ${
                                        selectedSlot?.start === slot.start
                                          ? 'border-[#0E9F8C] bg-[#0E9F8C] text-white shadow-sm'
                                          : 'border-[#E8EEF5] bg-white text-[#0F172A] hover:border-[#0E9F8C]/30 hover:bg-[#F8FAFC]'
                                      }`}
                                    >
                                      {slot.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Afternoon Slots */}
                            {afternoonSlots.length > 0 && (
                              <div>
                                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest block mb-2.5">☀️ Afternoon Session</span>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                  {afternoonSlots.map((slot, i) => (
                                    <button
                                      key={`afternoon-${i}`}
                                      onClick={() => setSelectedSlot(slot)}
                                      className={`py-3 px-2 rounded-xl text-xs font-semibold border-2 transition-all text-center cursor-pointer ${
                                        selectedSlot?.start === slot.start
                                          ? 'border-[#0E9F8C] bg-[#0E9F8C] text-white shadow-sm'
                                          : 'border-[#E8EEF5] bg-white text-[#0F172A] hover:border-[#0E9F8C]/30 hover:bg-[#F8FAFC]'
                                      }`}
                                    >
                                      {slot.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Evening Slots */}
                            {eveningSlots.length > 0 && (
                              <div>
                                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest block mb-2.5">🌙 Evening Session</span>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                  {eveningSlots.map((slot, i) => (
                                    <button
                                      key={`evening-${i}`}
                                      onClick={() => setSelectedSlot(slot)}
                                      className={`py-3 px-2 rounded-xl text-xs font-semibold border-2 transition-all text-center cursor-pointer ${
                                        selectedSlot?.start === slot.start
                                          ? 'border-[#0E9F8C] bg-[#0E9F8C] text-white shadow-sm'
                                          : 'border-[#E8EEF5] bg-white text-[#0F172A] hover:border-[#0E9F8C]/30 hover:bg-[#F8FAFC]'
                                      }`}
                                    >
                                      {slot.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                          </div>
                        ) : (
                          <div className="bg-[#F8FAFC] p-8 rounded-2xl text-center border border-[#E8EEF5]">
                            <p className="text-[#0F172A] font-bold">All Slots Reserved</p>
                            <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">Dr. Sohail is fully booked for this date. Please pick another day from the calendar.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Navigation Actions */}
                    <div className="mt-12 pt-6 border-t border-[#E8EEF5] flex justify-end">
                      <button
                        disabled={!selectedSlot}
                        onClick={() => setStep(3)}
                        className="bg-[#0E9F8C] text-white px-8 py-3.5 rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#0E9F8C]/90 shadow-lg shadow-[#0E9F8C]/15 transition-all duration-200 flex items-center gap-2 cursor-pointer text-sm"
                      >
                        Continue <ChevronRight size={16} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: PATIENT DETAILS & FINAL REVIEW */}
                {step === 3 && (
                  <motion.div 
                    key="step-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col md:flex-row"
                  >
                    {/* Input Forms */}
                    <div className="p-6 md:p-10 flex-1 border-b md:border-b-0 md:border-r border-[#E8EEF5]">
                      <button 
                        onClick={() => setStep(2)} 
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-[#0E9F8C] mb-6 transition-colors border border-[#E8EEF5] px-3 py-1.5 rounded-full bg-white cursor-pointer"
                      >
                        <ArrowLeft size={14} /> Back to Schedule
                      </button>

                      <h2 className="text-xl md:text-2xl font-extrabold text-[#0F172A] tracking-tight mb-2">Patient Details</h2>
                      <p className="text-xs text-[#64748B] mb-6">Complete your appointment details to lock-in your schedule slot.</p>
                      
                      {!user && (
                        <div className="bg-[#0E9F8C]/5 border border-[#0E9F8C]/10 text-[#0E9F8C] rounded-2xl p-4 mb-6 flex items-start gap-3">
                          <Info size={18} className="mt-0.5 shrink-0" />
                          <p className="text-xs font-medium">
                            <Link to="/client-auth" className="font-bold underline hover:text-[#0E9F8C]/80">Sign in or create an account</Link> to easily track your medical bookings, check reviews, and view records.
                          </p>
                        </div>
                      )}

                      <form onSubmit={handleSubmit} className="space-y-5">
                        
                        {/* Name Input */}
                        <div className="relative">
                          <label className={`block text-xs font-extrabold uppercase tracking-wider mb-1.5 ${focusedInput === 'name' ? 'text-[#0E9F8C]' : 'text-slate-400'}`}>
                            Full Name
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                              <User size={16} />
                            </span>
                            <input 
                              required
                              type="text" 
                              value={formData.fullName}
                              onFocus={() => setFocusedInput('name')}
                              onBlur={() => setFocusedInput(null)}
                              onChange={e => setFormData({...formData, fullName: e.target.value})}
                              className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 outline-none text-sm transition-all duration-200 ${
                                focusedInput === 'name' 
                                  ? 'border-[#0E9F8C] bg-white ring-4 ring-[#0E9F8C]/5' 
                                  : 'border-[#E8EEF5] bg-[#F8FAFC] hover:bg-white'
                              }`}
                              placeholder="e.g. Ahmad Shakir"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {/* Email Input */}
                          <div>
                            <label className={`block text-xs font-extrabold uppercase tracking-wider mb-1.5 ${focusedInput === 'email' ? 'text-[#0E9F8C]' : 'text-slate-400'}`}>
                              Email Address
                            </label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <Mail size={16} />
                              </span>
                              <input 
                                required
                                type="email" 
                                value={formData.email}
                                onFocus={() => setFocusedInput('email')}
                                onBlur={() => setFocusedInput(null)}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 outline-none text-sm transition-all duration-200 ${
                                  focusedInput === 'email' 
                                    ? 'border-[#0E9F8C] bg-white ring-4 ring-[#0E9F8C]/5' 
                                    : 'border-[#E8EEF5] bg-[#F8FAFC] hover:bg-white'
                                }`}
                                placeholder="jane@example.com"
                              />
                            </div>
                          </div>

                          {/* Phone Input */}
                          <div>
                            <label className={`block text-xs font-extrabold uppercase tracking-wider mb-1.5 ${focusedInput === 'phone' ? 'text-[#0E9F8C]' : 'text-slate-400'}`}>
                              Phone Number
                            </label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <Phone size={16} />
                              </span>
                              <input 
                                required
                                type="tel" 
                                value={formData.phone}
                                onFocus={() => setFocusedInput('phone')}
                                onBlur={() => setFocusedInput(null)}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                                className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 outline-none text-sm transition-all duration-200 ${
                                  focusedInput === 'phone' 
                                    ? 'border-[#0E9F8C] bg-white ring-4 ring-[#0E9F8C]/5' 
                                    : 'border-[#E8EEF5] bg-[#F8FAFC] hover:bg-white'
                                }`}
                                placeholder="e.g. 0300 1234567"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Notes Input */}
                        <div>
                          <label className={`block text-xs font-extrabold uppercase tracking-wider mb-1.5 ${focusedInput === 'notes' ? 'text-[#0E9F8C]' : 'text-slate-400'}`}>
                            Additional Medical Concerns (Optional)
                          </label>
                          <textarea 
                            rows={3}
                            value={formData.notes}
                            onFocus={() => setFocusedInput('notes')}
                            onBlur={() => setFocusedInput(null)}
                            onChange={e => setFormData({...formData, notes: e.target.value})}
                            className={`w-full px-4 py-3.5 rounded-2xl border-2 outline-none text-sm transition-all duration-200 resize-none ${
                              focusedInput === 'notes' 
                                ? 'border-[#0E9F8C] bg-white ring-4 ring-[#0E9F8C]/5' 
                                : 'border-[#E8EEF5] bg-[#F8FAFC] hover:bg-white'
                            }`}
                            placeholder="Any details about medical conditions, skin allergies, or specific transplant inquiries?"
                          />
                        </div>

                        {/* Apple-style Policy Check Info */}
                        <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E8EEF5] space-y-2 text-xs text-[#64748B]">
                          <div className="flex items-center gap-2 text-[#0F172A] font-bold">
                            <ShieldCheck size={14} className="text-[#0E9F8C]" /> Cancellation &amp; Booking Terms
                          </div>
                          <p className="leading-relaxed">
                            Rescheduling is simple and free up to 24 hours prior. Pay safely at the clinic during your doctor consultation. No advance credit required.
                          </p>
                        </div>

                        {/* Primary Submit Button */}
                        <motion.button
                          type="submit"
                          disabled={isSubmitting}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className="w-full bg-[#0E9F8C] text-white px-8 py-4 rounded-2xl font-extrabold flex justify-center items-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed hover:bg-[#0E9F8C]/95 transition-all mt-4 shadow-lg shadow-[#0E9F8C]/20 cursor-pointer text-sm"
                        >
                          {isSubmitting ? (
                             <span className="flex items-center gap-2">
                              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                              Processing booking secure token...
                             </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <CalendarCheck size={16} /> Confirm Clinic Appointment
                            </span>
                          )}
                        </motion.button>
                      </form>
                    </div>

                    {/* Sticky Summarized Receipt Sidebar */}
                    <div className="p-6 md:p-10 w-full md:w-80 bg-[#F8FAFC] rounded-r-[1.5rem] md:rounded-r-[2rem] flex flex-col justify-between">
                      <div>
                        <h3 className="font-extrabold text-[#0F172A] mb-6 uppercase text-xs tracking-wider border-b border-[#E8EEF5] pb-2 flex items-center gap-1.5">
                          <FileText size={14} className="text-[#0E9F8C]" /> Booking Summary
                        </h3>
                        
                        {selectedService && (
                          <div className="mb-6 space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Treatment Service</span>
                            <p className="font-extrabold text-[#0F172A] leading-tight">{selectedService.name}</p>
                            <p className="text-xs text-[#64748B]">{selectedService.duration_minutes} min duration</p>
                          </div>
                        )}
                        
                        {selectedSlot && (
                          <div className="mb-6 space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Scheduled Slot</span>
                            <p className="font-extrabold text-[#0F172A] leading-tight">{format(selectedSlot.start, 'EEEE, MMM d, yyyy')}</p>
                            <p className="text-xs text-[#0E9F8C] font-semibold">{format(selectedSlot.start, 'h:mm a')} - {format(selectedSlot.end, 'h:mm a')}</p>
                          </div>
                        )}

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Clinic Location</span>
                          <p className="font-extrabold text-xs text-[#0F172A]">Sohail Aesthetic Clinic</p>
                          <p className="text-[11px] text-[#64748B] leading-relaxed">Multan, Pakistan</p>
                        </div>
                      </div>
                      
                      <div className="mt-8 pt-6 border-t border-[#E8EEF5]">
                        <div className="flex justify-between items-center font-extrabold text-sm mb-1.5">
                          <span className="text-[#64748B]">Consultation Fee</span>
                          <span className="text-[#0F172A]">PKR {selectedService?.price.toLocaleString() || 0}</span>
                        </div>
                        <div className="flex justify-between items-center font-extrabold text-sm mb-4">
                          <span className="text-[#64748B]">Taxes &amp; Hospital Care</span>
                          <span className="text-[#22C55E]">Included</span>
                        </div>
                        <div className="flex justify-between items-center font-extrabold text-lg border-t border-dashed border-[#E8EEF5] pt-4">
                          <span className="text-[#0F172A]">Total Due</span>
                          <span className="text-[#0E9F8C]">PKR {selectedService?.price.toLocaleString() || 0}</span>
                        </div>
                        <p className="text-[10px] text-[#64748B] mt-3 text-right font-medium">✨ Cash or Card payment accepted at clinic.</p>
                      </div>

                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
            
            {/* Lower FAQ/Trust Cards for complete design coverage */}
            <div className="bg-[#0E9F8C]/5 rounded-3xl p-6 border border-[#0E9F8C]/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="font-extrabold text-[#0F172A] text-sm">Need help with your reservation?</p>
                <p className="text-xs text-[#64748B]">Contact our active helpdesk for support anytime.</p>
              </div>
              <div className="flex gap-3 text-xs">
                <a href="tel:03001234567" className="px-3.5 py-2 bg-white border border-[#E8EEF5] rounded-xl font-bold hover:text-[#0E9F8C] transition-colors shadow-xs">
                  📞 Call Desk
                </a>
                <Link to="/faq" className="px-3.5 py-2 bg-white border border-[#E8EEF5] rounded-xl font-bold hover:text-[#0E9F8C] transition-colors shadow-xs">
                  ❓ FAQs Portal
                </Link>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
