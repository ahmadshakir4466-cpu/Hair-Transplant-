const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://sdkbkbopyeixoipbugaw.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_jRZAWKm0U8W6L5xBkwCCrg_fK5DHYG_YOUR_SUPABASE_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function getAppointments() {
  const { data, error } = await supabase
    .from('appointments')
    .select('*');
    
  if (error) {
    console.error(error);
    return;
  }
  console.log('Appointments Data:', data);
  return data;
}

async function getServices() {
  const { data, error } = await supabase
    .from('services')
    .select('*');
    
  if (error) {
    console.error(error);
    return;
  }
  console.log('Services Data:', data);
  return data;
}

module.exports = { supabase, getAppointments, getServices };
