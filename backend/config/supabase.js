const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables:', { supabaseUrl: !!supabaseUrl, supabaseKey: !!supabaseKey });
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY are required');
}

const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

module.exports = supabase;
