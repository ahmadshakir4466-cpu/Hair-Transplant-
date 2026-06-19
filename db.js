const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_KEY || 'YOUR_SUPABASE_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function getTable() {
  const { data, error } = await supabase
    .from('your_table')
    .select('*');
    
  if (error) {
    console.error(error);
    return;
  }
  console.log(data);
}

module.exports = { supabase, getTable };
