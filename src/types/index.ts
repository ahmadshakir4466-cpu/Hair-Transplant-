export type Service = {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  image_url?: string;
  created_at: string;
};

export type Appointment = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  service_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string | null;
  created_at: string;
  service?: Service; // joined
};

export type BusinessHours = {
  id: string;
  weekday: number; // 0 for Sunday, 6 for Saturday
  is_open: boolean;
  start_time: string; // HH:mm:ss
  end_time: string; // HH:mm:ss
};

export type BlockedDate = {
  id: string;
  blocked_date: string; // YYYY-MM-DD
  reason: string | null;
  created_at: string;
};

export type ClinicSettings = {
  id: string;
  clinic_name: string;
  clinic_email: string;
  clinic_phone: string;
  clinic_address: string;
  slot_interval_minutes: number;
  booking_notice_hours: number;
  hero_image_url?: string;
  about_image_url?: string;
  hero_title?: string;
  hero_subtitle?: string;
  hero_description?: string;
  about_title?: string;
  about_description_1?: string;
  about_description_2?: string;
  about_stats_1_value?: string;
  about_stats_1_label?: string;
  about_stats_2_value?: string;
  about_stats_2_label?: string;
  footer_description?: string;
  created_at: string;
};

export type AdminUser = {
  id: string;
  user_id: string;
  created_at: string;
};
