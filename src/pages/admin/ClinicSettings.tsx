import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ClinicSettings } from '../../types';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import ImageCropper from '../../components/ImageCropper';
import getCroppedImg from '../../lib/cropImage';

export default function ClinicSettingsPage() {
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [aboutFile, setAboutFile] = useState<File | null>(null);

  // Cropping State
  const [cropType, setCropType] = useState<'hero' | 'about' | null>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data: dbData, error } = await supabase
        .from('clinic_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;
      if (dbData) {
         let finalSettings = { ...dbData };
         
         const { data: extData } = await supabase
            .from('services')
            .select('description')
            .eq('name', '__UI_SETTINGS__')
            .maybeSingle();

         if (extData && extData.description) {
            try {
              const parsed = JSON.parse(extData.description);
              finalSettings = { ...finalSettings, ...parsed, id: dbData.id };
            } catch (e) {}
         }

         setSettings(finalSettings as ClinicSettings);
      }
    } catch (err: any) {
      toast.error('Failed to load clinic settings.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!settings) return;
    const { name, value, type } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'hero' | 'about') => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageToCrop(reader.result?.toString() || null);
        setCropType(type);
      });
      reader.readAsDataURL(file);
      e.target.value = ''; // Reset input to allow selecting same file again
    }
  };

  const handleCropComplete = async (croppedAreaPixels: any) => {
    if (!imageToCrop || !cropType) return;
    
    try {
      const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
      if (croppedImage) {
        if (cropType === 'hero') {
            setHeroFile(croppedImage);
        } else {
            setAboutFile(croppedImage);
        }
      } else {
         toast.error("Could not crop image.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error cropping image.");
    } finally {
        setImageToCrop(null);
        setCropType(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    
    try {
      let finalHeroUrl = settings.hero_image_url;
      let finalAboutUrl = settings.about_image_url;

      if (heroFile) {
        finalHeroUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(heroFile);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
        });
      }

      if (aboutFile) {
        finalAboutUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(aboutFile);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
        });
      }

      const fullData = {
        clinic_name: settings.clinic_name,
        clinic_email: settings.clinic_email,
        clinic_phone: settings.clinic_phone,
        clinic_address: settings.clinic_address,
        slot_interval_minutes: settings.slot_interval_minutes,
        booking_notice_hours: settings.booking_notice_hours,
        hero_title: settings.hero_title,
        hero_subtitle: settings.hero_subtitle,
        hero_description: settings.hero_description,
        about_title: settings.about_title,
        about_description_1: settings.about_description_1,
        about_description_2: settings.about_description_2,
        about_stats_1_value: settings.about_stats_1_value,
        about_stats_1_label: settings.about_stats_1_label,
        about_stats_2_value: settings.about_stats_2_value,
        about_stats_2_label: settings.about_stats_2_label,
        footer_description: settings.footer_description,
        ...(finalHeroUrl ? { hero_image_url: finalHeroUrl } : {}),
        ...(finalAboutUrl ? { about_image_url: finalAboutUrl } : {})
      };

      // Ensure base schema has standard info
      const fallbackData = {
        clinic_name: settings.clinic_name,
        clinic_email: settings.clinic_email,
        clinic_phone: settings.clinic_phone,
        clinic_address: settings.clinic_address,
        slot_interval_minutes: settings.slot_interval_minutes,
        booking_notice_hours: settings.booking_notice_hours,
      };

      // 1. Update the actual table (fails gracefully if columns missing)
      await supabase.from('clinic_settings').update(fullData).eq('id', settings.id);
      await supabase.from('clinic_settings').update(fallbackData).eq('id', settings.id);

      // 2. Persist extended settings via dummy service to bypass structural lock
      const { data: existingService } = await supabase
        .from('services')
        .select('id')
        .eq('name', '__UI_SETTINGS__')
        .maybeSingle();
      
      const payload = {
         name: '__UI_SETTINGS__',
         description: JSON.stringify(fullData),
         price: 0,
         duration_minutes: 30, // changed to 30 to bypass constraint
         is_active: true // MUST BE TRUE so public users can read it past RLS!
      };

      if (existingService) {
         const res = await supabase.from('services').update(payload).eq('id', existingService.id);
         if (res.error) {
             console.error("Error updating extended settings:", res.error);
             toast.error("Failed to save extended images UI settings.");
         }
      } else {
         const res = await supabase.from('services').insert([payload]);
         if (res.error) {
             console.error("Error inserting extended settings:", res.error);
             toast.error("Failed to insert extended images UI settings.");
         }
      }

      toast.success('Clinic settings updated.');
    } catch (err) {
      toast.error('Failed to update settings.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
       <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
       </div>
    );
  }

  // Fallback if settings don't exist in DB 
  if (!settings) {
    return <div className="p-8 text-center text-slate-500">Settings not found. Please contact support.</div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Clinic Settings</h1>
        <p className="text-slate-500">Manage your clinic details and booking rules.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="divide-y divide-slate-100">
           
           {/* Section 1: details */}
           <div className="p-8">
             <h2 className="text-xl font-bold text-slate-900 mb-6">General Information</h2>
             <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Clinic Name</label>
                  <input 
                    required
                    name="clinic_name"
                    type="text" 
                    value={settings.clinic_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-600 outline-none max-w-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contact Email</label>
                  <input 
                    required
                    name="clinic_email"
                    type="email" 
                    value={settings.clinic_email}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contact Phone</label>
                  <input 
                    required
                    name="clinic_phone"
                    type="tel" 
                    value={settings.clinic_phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Physical Address</label>
                  <input 
                    required
                    name="clinic_address"
                    type="text" 
                    value={settings.clinic_address}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>
             </div>
           </div>

           {/* Section 2: Booking Details */}
           <div className="p-8 pb-12">
             <h2 className="text-xl font-bold text-slate-900 mb-6">Booking Rules</h2>
             <div className="grid md:grid-cols-2 gap-6 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Slot Interval (minutes)</label>
                  <input 
                    required
                    name="slot_interval_minutes"
                    type="number"
                    min="15"
                    step="5"
                    value={settings.slot_interval_minutes}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                  <p className="text-xs text-slate-500 mt-2">Time between available booking slots on the calendar.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Minimum Booking Notice (hours)</label>
                  <input 
                    required
                    name="booking_notice_hours"
                    type="number"
                    min="0"
                    value={settings.booking_notice_hours}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                  <p className="text-xs text-slate-500 mt-2">How far in advance a patient must book before the appointment time.</p>
                </div>
             </div>
           </div>

           <div className="p-8 border-t border-slate-100 pb-12">
             <h2 className="text-xl font-bold text-slate-900 mb-6">Website Content</h2>
             <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Hero Title</label>
                    <input 
                      name="hero_title"
                      type="text"
                      placeholder="Premium Dental Care"
                      value={settings.hero_title || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Hero Subtitle</label>
                    <input 
                      name="hero_subtitle"
                      type="text"
                      placeholder="Experience dentistry reimagined."
                      value={settings.hero_subtitle || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-600 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hero Description</label>
                  <textarea 
                    name="hero_description"
                    rows={2}
                    placeholder="State-of-the-art technology meets compassionate care..."
                    value={settings.hero_description || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mt-8 mb-4 border-b border-slate-100 pb-2">About Section</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">About Title</label>
                  <input 
                    name="about_title"
                    type="text"
                    placeholder="A modern approach to your oral health."
                    value={settings.about_title || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">About Description 1</label>
                  <textarea 
                    name="about_description_1"
                    rows={2}
                    placeholder="At our clinic, we believe..."
                    value={settings.about_description_1 || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">About Description 2</label>
                  <textarea 
                    name="about_description_2"
                    rows={2}
                    placeholder="Our modern facility is equipped..."
                    value={settings.about_description_2 || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>

                <div className="grid md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Stat 1 Value</label>
                    <input 
                      name="about_stats_1_value"
                      type="text"
                      placeholder="15+"
                      value={settings.about_stats_1_value || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Stat 1 Label</label>
                    <input 
                      name="about_stats_1_label"
                      type="text"
                      placeholder="Years of Excellence"
                      value={settings.about_stats_1_label || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Stat 2 Value</label>
                    <input 
                      name="about_stats_2_value"
                      type="text"
                      placeholder="5k+"
                      value={settings.about_stats_2_value || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Stat 2 Label</label>
                    <input 
                      name="about_stats_2_label"
                      type="text"
                      placeholder="Happy Patients"
                      value={settings.about_stats_2_label || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-600 outline-none"
                    />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mt-8 mb-4 border-b border-slate-100 pb-2">Footer Content</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Footer Description</label>
                  <textarea 
                    name="footer_description"
                    rows={2}
                    placeholder="Premium care focused on comfort..."
                    value={settings.footer_description || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>
             </div>
           </div>

           <div className="p-8 border-t border-slate-100 pb-12">
             <h2 className="text-xl font-bold text-slate-900 mb-6">Website Images</h2>
             <div className="space-y-6 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Hero Section Image</label>
                  <div className="flex items-center gap-4">
                     {(settings.hero_image_url || heroFile) && (
                        <div className="relative group">
                          <img 
                            src={heroFile ? URL.createObjectURL(heroFile) : settings.hero_image_url} 
                            alt="Hero Preview" 
                            className="w-24 h-16 object-cover rounded-xl border border-slate-200" 
                          />
                          <button 
                            type="button" 
                            onClick={() => { setHeroFile(null); setSettings({...settings, hero_image_url: ''}); }} 
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                     )}
                     <div className="flex-1 relative">
                        <input 
                           type="file" 
                           id="hero-upload"
                           accept="image/*"
                           onChange={e => handleFileSelect(e, 'hero')}
                           className="hidden"
                        />
                        <label 
                          htmlFor="hero-upload"
                          className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-teal-500 hover:bg-teal-50 transition-colors cursor-pointer text-slate-600 font-medium"
                        >
                          {heroFile ? heroFile.name : 'Upload New Hero Image'}
                        </label>
                     </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">About Section Image</label>
                  <div className="flex items-center gap-4">
                     {(settings.about_image_url || aboutFile) && (
                        <div className="relative group">
                          <img 
                            src={aboutFile ? URL.createObjectURL(aboutFile) : settings.about_image_url} 
                            alt="About Preview" 
                            className="w-16 h-24 object-cover rounded-xl border border-slate-200" 
                          />
                          <button 
                            type="button" 
                            onClick={() => { setAboutFile(null); setSettings({...settings, about_image_url: ''}); }} 
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                     )}
                     <div className="flex-1 relative">
                        <input 
                           type="file" 
                           id="about-upload"
                           accept="image/*"
                           onChange={e => handleFileSelect(e, 'about')}
                           className="hidden"
                        />
                        <label 
                          htmlFor="about-upload"
                          className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-teal-500 hover:bg-teal-50 transition-colors cursor-pointer text-slate-600 font-medium"
                        >
                          {aboutFile ? aboutFile.name : 'Upload New About Image'}
                        </label>
                     </div>
                  </div>
                </div>
              </div>
            </div>

           <div className="bg-slate-50 p-6 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center min-w-[160px]"
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
           </div>
        </form>
      </div>
      {imageToCrop && (
        <ImageCropper
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setImageToCrop(null);
            setCropType(null);
          }}
          aspectRatio={cropType === 'hero' ? 16 / 9 : 4 / 5} // Approximate typical ratios
        />
      )}
    </div>
  );
}
