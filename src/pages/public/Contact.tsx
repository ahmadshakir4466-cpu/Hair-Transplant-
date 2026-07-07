import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import toast from 'react-hot-toast';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  AlertCircle,
  MessageSquare
} from 'lucide-react';

export default function Contact() {
  const { seoSettings } = useData();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = `Contact Us | ${seoSettings.meta_title_suffix}`;
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) {
      descMeta.setAttribute('content', 'Contact our clinic. Locate us on the map, view our clinical hours, call or WhatsApp our caretakers, or send an online message.');
    }
  }, [seoSettings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      toast.success('Your message has been sent successfully. Our clinic team will contact you shortly!');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setIsSubmitting(false);
    }, 1200);
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Clinic Address',
      value: 'Sohail Aesthetic Laser & Hair Transplant Clinic, Lahore, Pakistan',
      link: '#'
    },
    {
      icon: Phone,
      title: 'Phone & Support',
      value: '+92 3000568380',
      link: 'tel:+923000568380'
    },
    {
      icon: MessageSquare,
      title: 'WhatsApp Consultation',
      value: '+92 3000568380',
      link: 'https://wa.me/923000568380'
    },
    {
      icon: Mail,
      title: 'Email Address',
      value: 'sohail4112049@gmail.com',
      link: 'mailto:sohail4112049@gmail.com'
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-teal-600 text-sm font-semibold uppercase tracking-wider">GET IN TOUCH</span>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 tracking-tight">We are Here to Help You</h1>
          <p className="text-slate-500 mt-4">Have questions about a treatment or need to schedule an evaluation? Speak with our clinic caretakers.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left: Contact Info and Hours */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6">
              <h2 className="text-xl font-bold text-slate-900 pb-4 border-b border-slate-100">Clinic Directory</h2>
              
              <div className="space-y-6">
                {contactInfo.map((info, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="p-3 bg-teal-50 text-teal-600 rounded-xl h-fit">
                      <info.icon size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{info.title}</p>
                      {info.link !== '#' ? (
                        <a href={info.link} className="text-sm font-medium text-slate-800 hover:text-teal-600 transition-colors mt-1 block">
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-sm font-medium text-slate-800 mt-1">{info.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Clock size={20} className="text-teal-600" /> Clinical Hours
              </h3>
              <ul className="space-y-4 text-sm text-slate-600">
                <li className="flex justify-between pb-3 border-b border-slate-50">
                  <span className="font-semibold">Monday - Friday</span>
                  <span>09:00 AM - 08:00 PM</span>
                </li>
                <li className="flex justify-between pb-3 border-b border-slate-50">
                  <span className="font-semibold">Saturday</span>
                  <span>10:00 AM - 06:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-semibold">Sunday</span>
                  <span className="text-red-500 font-medium">Closed</span>
                </li>
              </ul>
            </div>

            <div className="bg-red-50 rounded-3xl p-6 border border-red-100 flex gap-4 items-start">
              <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={24} />
              <div>
                <h4 className="font-bold text-red-900 text-sm">Emergency Aesthetic Care</h4>
                <p className="text-xs text-red-700 mt-1 leading-relaxed">
                  If you are experiencing severe, unexpected side-effects post-procedure, call our 24/7 client care line directly: <strong>+92 3000568380</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Contact Form & Map */}
          <div className="lg:col-span-2 space-y-12">
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Send an Online Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Your Name</label>
                    <input 
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none transition-all text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                    <input 
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none transition-all text-sm"
                      placeholder="johndoe@example.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                    <input 
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none transition-all text-sm"
                      placeholder="0300 1234567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
                    <input 
                      required
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none transition-all text-sm"
                      placeholder="Question about Hair Transplant / PRP"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Your Message</label>
                  <textarea 
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none transition-all text-sm resize-none"
                    placeholder="Describe your concerns or detail the service you are interested in..."
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-400 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send size={16} /> Send Message
                    </>
                  )}
                </button>
              </form>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
}
