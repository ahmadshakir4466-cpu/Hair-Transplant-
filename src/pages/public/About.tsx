import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { 
  Award, 
  ShieldCheck, 
  Users, 
  Sparkles, 
  Activity, 
  HeartHandshake, 
  Heart,
  CalendarDays,
  Target,
  Eye,
  CheckCircle,
  Stethoscope
} from 'lucide-react';

export default function About() {
  const { seoSettings } = useData();

  useEffect(() => {
    document.title = `About Our Practice | ${seoSettings.meta_title_suffix}`;
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) {
      descMeta.setAttribute('content', 'About our premium Aesthetic Laser & Hair Transplant Clinic. Read our mission, vision, meet our expert team, and see our safety standards.');
    }
  }, [seoSettings]);

  const whyChooseUs = [
    {
      icon: Award,
      title: 'Certified Excellence',
      desc: 'All surgical hair restorations and aesthetic treatments are performed by board-certified specialists with over 15 years of clinical expertise.'
    },
    {
      icon: ShieldCheck,
      title: 'FDA-Approved Tech',
      desc: 'We operate only gold-standard, FDA-approved laser and medical devices, ensuring maximum efficacy and absolute patient safety.'
    },
    {
      icon: HeartHandshake,
      title: 'Personalized Care',
      desc: 'No cookie-cutter treatments. We conduct detailed microscopic assessments to customize plans that respect your unique anatomy.'
    },
    {
      icon: Heart,
      title: 'Comfort & Aftercare',
      desc: 'From specialized numbing protocols to premium aftercare kits, we ensure your therapeutic journey is completely comfortable.'
    }
  ];

  const technologies = [
    { name: 'FUE Precision Micro-Punches', desc: 'Surgical extraction tools measuring 0.7mm to 0.9mm to guarantee scar-free donor healing.' },
    { name: 'Triple Wavelength Diode Laser', desc: 'The most advanced clinical laser hair removal targeting deep follicle pigments painlessly.' },
    { name: 'Vortex-Fusion HydraFacial System', desc: 'Patented hydro-resurfacing system for deep extraction and antioxidant saturation.' },
    { name: 'High-Velocity Centrifuge Systems', desc: 'Advanced blood fraction separation ensuring peak platelet growth factor concentration for PRP.' }
  ];

  const teamMembers = [
    {
      name: 'Dr. Sohail Ahmad',
      role: 'Chief Hair Transplant Surgeon & Aesthetic Specialist',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&h=400&q=80',
      bio: 'Over 15 years of clinical practice in follicular unit extraction (FUE) and non-surgical aesthetic facial remodeling.'
    },
    {
      name: 'Fatima Malik',
      role: 'Senior Clinical Aesthetician & Laser Therapist',
      image: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=400&h=400&q=80',
      bio: 'Expert in medical-grade laser resurfacing, chemical peeling, and advanced skin-barrier hydration protocols.'
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#319795_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/20 mb-6">
            <Sparkles size={12} />
            WHO WE ARE
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Redefining Precision in <br className="hidden md:block" />
            <span className="text-teal-400">Aesthetic Medicine & Restoration</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Welcome to Pakistan’s premier boutique aesthetic clinic. We specialize in advanced surgical FUE hair transplantation, clinical laser technologies, and medical-grade skin rejuvenation.
          </p>
        </div>
      </section>

      {/* 2. Clinic Introduction */}
      <section className="py-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&h=600&q=80" 
                alt="Clinic Interior" 
                className="rounded-3xl shadow-lg border border-slate-100 object-cover w-full h-[400px]"
              />
              <div className="absolute -bottom-6 -right-6 bg-teal-600 text-white p-6 rounded-2xl shadow-xl hidden sm:block border border-teal-500 max-w-xs">
                <p className="text-3xl font-bold">15+</p>
                <p className="text-sm text-teal-100 font-medium mt-1">Years of Combined Aesthetic Clinical Excellence</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Our Practice</h2>
              <p className="text-slate-600 leading-relaxed">
                Founded with a core philosophy of combining clinical safety with artistic symmetry, our clinic provides bespoke non-surgical facial rejuvenation and permanent hair restorations. We recognize that clinical procedures require meticulous technical execution and an artistic eye to produce results that fit your natural beauty.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Our sterile, state-of-the-art clinic features the latest technologies sourced globally. Whether you are seeking a full FUE hairline restoration, laser hair removal, or hydrating therapy, you are cared for by trained clinical staff.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                  <CheckCircle size={16} className="text-teal-600" /> 100% Sterile Environment
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                  <CheckCircle size={16} className="text-teal-600" /> FDA-Approved Technology
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Mission & Vision */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-6">
                  <Target size={24} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h3>
                <p className="text-slate-600 leading-relaxed">
                  To provide clinical aesthetic and hair restoration services of the highest standard. We empower individuals to feel confident in their appearance by delivering natural, symmetric results through medical excellence, sterilization compliance, and bespoke treatment courses.
                </p>
              </div>
            </div>
            
            <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-6">
                  <Eye size={24} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Vision</h3>
                <p className="text-slate-600 leading-relaxed">
                  To remain the most trusted aesthetic and medical restoration facility in the region. We set benchmarks for patient comfort, ethical diagnostics, clinical safety, and innovative medical aesthetic technologies.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Why Discerning Patients Choose Us</h2>
            <p className="text-slate-500 mt-4 leading-relaxed">
              We understand that aesthetic care is a deeply personal and clinical choice. Our commitment to you combines medical integrity with luxurious patient comfort.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((item, idx) => (
              <div key={idx} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 transition-all hover:bg-white hover:shadow-md">
                <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 mb-6">
                  <item.icon size={20} />
                </div>
                <h3 className="font-semibold text-lg text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Technology Used */}
      <section className="py-20 bg-slate-900 text-white relative">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-3 gap-12 items-center">
            <div className="lg:col-span-1 space-y-4">
              <span className="text-teal-400 text-sm font-semibold tracking-wider uppercase">ADVANCED MACHINERY</span>
              <h2 className="text-3xl font-bold tracking-tight">Our Technology Suite</h2>
              <p className="text-slate-400 leading-relaxed">
                We continuously upgrade our clinical technologies to ensure faster recovery, less discomfort, and unmatched treatment consistency.
              </p>
            </div>
            
            <div className="lg:col-span-2 grid sm:grid-cols-2 gap-8">
              {technologies.map((tech, idx) => (
                <div key={idx} className="bg-slate-800/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
                  <h3 className="font-semibold text-lg text-teal-300 mb-2">{tech.name}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{tech.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Experienced Team */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Meet Our Medical Team</h2>
            <p className="text-slate-500 mt-4">Certified practitioners dedicated to delivering exquisite results.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="bg-slate-50 rounded-3xl border border-slate-100 p-8 flex flex-col items-center text-center">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md mb-6"
                />
                <h3 className="text-xl font-bold text-slate-900">{member.name}</h3>
                <p className="text-sm font-medium text-teal-600 mt-1 mb-4">{member.role}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Patient Care, Safety Standards & Clinic Environment */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Heart size={20} className="text-teal-600" /> Patient Care
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                From initial microscopic evaluations to regular post-op follow-ups, we support you through your recovery. You are connected to our clinical caretakers via standard communication and WhatsApp.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <ShieldCheck size={20} className="text-teal-600" /> Safety Standards
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                We practice autoclave clinical sterilization, utilize FDA-approved medical-grade supplies, and adhere to global protocols. Your procedure is conducted under hospital-level hygienic regulations.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Stethoscope size={20} className="text-teal-600" /> Sterile Environment
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Our surgical theater and clinical bays are cleaned hourly and structured with advanced micro-filtration systems, guaranteeing a safe and comfortable experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Call To Action */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-teal-600 to-teal-800 rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden shadow-lg">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <div className="relative z-10 space-y-6">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Ready to Start Your Aesthetic Journey?</h2>
              <p className="text-teal-100 max-w-2xl mx-auto">
                Schedule your detailed, diagnostic hairline or skin evaluation with our medical team. Choose your desired service online and find a convenient slot instantly.
              </p>
              <div className="pt-4">
                <Link to="/book" className="inline-flex items-center gap-2 bg-white text-teal-700 hover:bg-teal-50 px-8 py-4 rounded-full font-bold transition-all shadow-md">
                  <CalendarDays size={18} /> Book Appointment Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
