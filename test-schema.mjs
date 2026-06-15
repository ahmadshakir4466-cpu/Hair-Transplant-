import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function main() {
  const payload = {
         name: '__UI_SETTINGS__',
         description: 'TESTING',
         price: 0,
         duration_minutes: 30,
         is_active: false
  };

  const { data, error } = await supabase.from('services').insert([payload]);
  console.log("Error inserting:", error);
  const { data: testData, error: testError } = await supabase.from('services').select('*').limit(10);
  console.log("Services:", testData ? testData.map(d => ({id: d.id, name: d.name, active: d.is_active})) : null);
}
main();
