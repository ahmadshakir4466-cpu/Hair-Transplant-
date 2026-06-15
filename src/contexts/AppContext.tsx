import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ClinicSettings } from '../types';

type AppContextType = {
  clinicSettings: ClinicSettings | null;
  isLoadingSettings: boolean;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!isSupabaseConfigured) {
        setIsLoadingSettings(false);
        return;
      }
      try {
        const { data: dbData, error } = await supabase
          .from('clinic_settings')
          .select('*')
          .limit(1)
          .single();

        if (!error && dbData) {
           let finalSettings = { ...dbData };

           // Pull extended settings stored in services fallback
           const { data: extData } = await supabase
              .from('services')
              .select('description')
              .eq('name', '__UI_SETTINGS__')
              .maybeSingle();

           if (extData && extData.description) {
              try {
                const parsed = JSON.parse(extData.description);
                finalSettings = { ...finalSettings, ...parsed, id: dbData.id }; // overlay the JSON
              } catch (e) {}
           }
           
           setClinicSettings(finalSettings as ClinicSettings);
        }
      } catch (err) {
        console.error('Failed to load clinic settings:', err);
      } finally {
        setIsLoadingSettings(false);
      }
    };

    fetchSettings();
  }, []);

  return (
    <AppContext.Provider value={{ clinicSettings, isLoadingSettings }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
