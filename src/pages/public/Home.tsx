import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Shield, Clock, CheckCircle2, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Service } from '../../types';

export default function Home() {
  const { clinicSettings, isLoadingSettings } = useApp();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const clinicName = clinicSettings?.clinic_name || 'Aesthetic Laser & Hair Transplant Clinic';
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let targetId = '';
    if (location.hash) {
      targetId = location.hash.substring(1);
    } else if (location.state && (location.state as any).scrollTo) {
      targetId = (location.state as any).scrollTo;
    }

    if (targetId) {
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          // Clear state/hash so a refresh doesn't trigger scroll again
          navigate(location.pathname, { replace: true, state: {} });
        }
       }, 100);
    }
  }, [location, navigate]);


  useEffect(() => {
    const fetchServices = async () => {
      if (!isSupabaseConfigured) return;
      
      const { data } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .neq('name', '__UI_SETTINGS__')
        .order('price', { ascending: true });
      if (data) setServices(data);
    };
    fetchServices();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20 pb-32">
        <div className="absolute inset-0 z-0 bg-teal-50/50">
          {!isLoadingSettings && (
            <img 
              src={clinicSettings?.hero_image_url || "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80"} 
              alt="Modern Clinic" 
              className="w-full h-full object-cover animate-in fade-in duration-1000"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent"></div>
        </div>

        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full transition-opacity duration-1000 ${isLoadingSettings ? 'opacity-0' : 'opacity-100'}`}>
          <div className="max-w-2xl">
            {(clinicSettings?.hero_title ?? 'Premium Hair Transplant') && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 font-medium text-sm mb-6 border border-teal-100">
                <Star size={14} className="fill-current" />
                <span>{clinicSettings?.hero_title ?? 'Premium Hair Transplant'}</span>
              </div>
            )}
            <h1 className="text-5xl md:text-7xl font-sans font-bold text-slate-900 tracking-tight leading-tight mb-6">
              {clinicSettings?.hero_subtitle != null ? (
                 <div dangerouslySetInnerHTML={{ __html: clinicSettings.hero_subtitle.replace('\n', '<br/>') }} />
              ) : (
                <>Experience restoration <br/>
                <span className="text-teal-600">reimagined.</span></>
              )}
            </h1>
            {(clinicSettings?.hero_description ?? 'State-of-the-art technology meets compassionate care. We are dedicated to providing you with a comfortable, stress-free experience and natural-looking results.') && (
              <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed max-w-lg whitespace-pre-wrap">
                {clinicSettings?.hero_description ?? 'State-of-the-art technology meets compassionate care. We are dedicated to providing you with a comfortable, stress-free experience and natural-looking results.'}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/book" 
                className="inline-flex items-center justify-center gap-2 bg-teal-600 text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-teal-700 transition-all shadow-lg shadow-teal-200"
              >
                Book Your Visit <ArrowRight size={20} />
              </Link>
              <button 
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })} 
                className="inline-flex items-center justify-center bg-white text-slate-700 px-8 py-4 rounded-full font-medium text-lg hover:bg-slate-50 transition-all border border-slate-200 shadow-sm"
              >
                Explore Services
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="bg-white py-16 border-b border-slate-100 relative -mt-16 z-20 mx-4 sm:mx-6 lg:mx-8 rounded-3xl shadow-xl shadow-slate-200/50 max-w-7xl xl:mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8">
          <div className="flex items-start gap-4">
            <div className="bg-teal-50 p-3 rounded-xl text-teal-600">
              <Shield size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Advanced Technology</h3>
              <p className="text-slate-600 leading-relaxed text-sm">We use the latest equipment for precise, painless treatments.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-teal-50 p-3 rounded-xl text-teal-600">
              <Clock size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">On-Time Appointments</h3>
              <p className="text-slate-600 leading-relaxed text-sm">We respect your time and ensure minimal to no waiting periods.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-teal-50 p-3 rounded-xl text-teal-600">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Expert Team</h3>
              <p className="text-slate-600 leading-relaxed text-sm">Highly trained professionals dedicated to your oral health and comfort.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Comprehensive Care</h2>
            <p className="text-slate-600 text-lg">
              From routine consultations to advanced cosmetic procedures, we offer a full suite of custom services tailored to your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const serviceImages = [
                'https://images.unsplash.com/photo-1598256989800-fea5f5ce73eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1574704381861-3a05b1c3c9e6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1574530491022-2614a9dd6035?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              ];
              const imageUrl = service.image_url || serviceImages[index % serviceImages.length];

              return (
              <div 
                key={service.id} 
                onClick={() => setSelectedService(service)}
                className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group flex flex-col cursor-pointer"
              >
                {/* Replace number with an image */}
                <div className="h-48 w-full rounded-2xl overflow-hidden mb-6 relative shrink-0">
                   <img 
                      src={imageUrl} 
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                   <h3 className="absolute bottom-4 left-4 right-4 text-xl font-bold text-white mb-0">{service.name}</h3>
                </div>
                
                <p className="text-slate-600 mb-6 flex-1 line-clamp-3">{service.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-slate-500 bg-slate-50 rounded-xl p-4 mb-6 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <Clock size={16} />
                    <span>{service.duration_minutes} min</span>
                  </div>
                  <div className="w-px h-4 bg-slate-200"></div>
                  <div className="font-medium text-slate-900">
                    ${service.price}
                  </div>
                </div>

                <Link 
                  to={`/book?service=${service.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex w-full items-center justify-center text-teal-600 font-medium py-3 rounded-xl border border-teal-100 hover:bg-teal-50 transition-colors shrink-0 mt-auto"
                >
                  Book Service
                </Link>
              </div>
            )})}
          </div>
          {services.length === 0 && (
            <div className="text-center text-slate-500 py-12">
              Services are currently being updated. Please check back later.
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl relative z-10 bg-slate-50">
                {!isLoadingSettings && (
                  <img 
                    src={clinicSettings?.about_image_url || "https://images.unsplash.com/photo-1598256989800-fea5f5ce73eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80"} 
                    alt="Doctor and patient" 
                    className="w-full h-full object-cover animate-in fade-in duration-1000"
                  />
                )}
              </div>
              <div className="absolute top-12 -left-8 w-64 h-64 bg-teal-100 rounded-full blur-3xl opacity-50 z-0"></div>
              <div className="absolute bottom-12 -right-8 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50 z-0"></div>
            </div>
            
            <div className={`transition-opacity duration-1000 ${isLoadingSettings ? 'opacity-0' : 'opacity-100'}`}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-medium text-sm mb-6">
                Our Practice
              </div>
              {(clinicSettings?.about_title ?? 'A modern approach to your hair health.') && (
                <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight leading-tight">
                  {clinicSettings?.about_title ?? 'A modern approach to your hair health.'}
                </h2>
              )}
              <div className="space-y-6 text-lg text-slate-600 whitespace-pre-wrap">
                {(clinicSettings?.about_description_1 ?? `At ${clinicName}, we believe that a visit to our clinic should be an experience you actually look forward to. We've thoughtfully designed every detail of our practice to promote calm, comfort, and clinical excellence.`) && (
                  <p>
                    {clinicSettings?.about_description_1 ?? `At ${clinicName}, we believe that a visit to our clinic should be an experience you actually look forward to. We've thoughtfully designed every detail of our practice to promote calm, comfort, and clinical excellence.`}
                  </p>
                )}
                {(clinicSettings?.about_description_2 ?? 'Our modern facility is equipped with state-of-the-art technology, ensuring that every diagnosis is precise and every treatment is as minimally invasive as possible. From the moment you walk through our doors, your comfort is our priority.') && (
                  <p>
                    {clinicSettings?.about_description_2 ?? 'Our modern facility is equipped with state-of-the-art technology, ensuring that every diagnosis is precise and every treatment is as minimally invasive as possible. From the moment you walk through our doors, your comfort is our priority.'}
                  </p>
                )}
              </div>
              
              <div className="mt-10 grid grid-cols-2 gap-6 pt-10 border-t border-slate-100">
                <div>
                  <h4 className="text-4xl font-bold text-teal-600 mb-2">{clinicSettings?.about_stats_1_value ?? '15+'}</h4>
                  <p className="text-slate-600 font-medium">{clinicSettings?.about_stats_1_label ?? 'Years of Excellence'}</p>
                </div>
                <div>
                  <h4 className="text-4xl font-bold text-teal-600 mb-2">{clinicSettings?.about_stats_2_value ?? '5k+'}</h4>
                  <p className="text-slate-600 font-medium">{clinicSettings?.about_stats_2_label ?? 'Happy Patients'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Details Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={() => setSelectedService(null)}>
          <div 
            className="bg-white rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedService(null)}
              className="absolute top-4 right-4 z-10 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 transition-colors"
            >
              <X size={24} />
            </button>
            <div className="h-64 w-full relative">
              <img 
                src={selectedService.image_url || "https://images.unsplash.com/photo-1598256989800-fea5f5ce73eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"} 
                alt={selectedService.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
              <h2 className="absolute bottom-6 left-8 right-8 text-3xl font-bold text-white">{selectedService.name}</h2>
            </div>
            <div className="p-8">
              <div className="flex items-center gap-6 mb-8 text-slate-700 bg-slate-50 p-4 rounded-2xl">
                <div className="flex items-center gap-2">
                  <Clock size={20} className="text-teal-600" />
                  <span className="font-medium text-lg">{selectedService.duration_minutes} Minutes</span>
                </div>
                <div className="w-px h-6 bg-slate-200"></div>
                <div className="font-bold text-xl text-teal-700">
                  ${selectedService.price}
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">About this Service</h3>
              <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap mb-8">
                {selectedService.description}
              </p>
              <div className="flex gap-4">
                <Link 
                  to={`/book?service=${selectedService.id}`}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-center py-4 rounded-xl font-bold text-lg transition-colors"
                >
                  Book Appointment
                </Link>
                <button 
                  onClick={() => setSelectedService(null)}
                  className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
