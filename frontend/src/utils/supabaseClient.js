import { createClient } from "@supabase/supabase-js";

const URL = process.env.REACT_APP_SUPABASE_URL  || "";
const KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || "";

export const DEMO_MODE = !URL || URL.includes("YOUR_PROJECT");

if (DEMO_MODE) {
  console.info("ℹ️  Running in demo mode. Add Supabase credentials to .env.local for persistence.");
}

export const supabase = DEMO_MODE
  ? null
  : createClient(URL, KEY, { auth: { persistSession: true } });

/** Upload student photo to Supabase Storage */
export async function uploadStudentPhoto(file, indexNumber) {
  if (!supabase) return null;
  const ext  = file.name.split(".").pop();
  const path = `students/${indexNumber}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("student-photos")
    .upload(path, file, { upsert: true });
  if (error) return null;
  const { data } = supabase.storage.from("student-photos").getPublicUrl(path);
  return data.publicUrl;
}
